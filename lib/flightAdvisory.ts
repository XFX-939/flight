import type { Aircraft, Airport, FlightRuntimeState, Mission } from "@/types/flight";
import { getAirportGameplayProfile, getMissionTargetHeading, getRunwayRemainingMeters, getWindComponents } from "@/lib/airportGameplay";
import { normalizeHeading, safeRound } from "@/lib/math";

export type FlightAdvisorySeverity = "danger" | "warning" | "info" | "success";

export type FlightAdvisory = {
  id: string;
  severity: FlightAdvisorySeverity;
  title: string;
  message: string;
  value: string;
  priority: number;
};

type AdvisoryDraft = Omit<FlightAdvisory, "priority"> & {
  priority?: number;
};

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function positive(value: number, fallback: number): number {
  const nextValue = finite(value, fallback);
  return nextValue > 0 ? nextValue : fallback;
}

function signedHeadingError(targetHeading: number, currentHeading: number): number {
  return normalizeHeading(targetHeading - currentHeading + 540) - 180;
}

function addAdvisory(advisories: FlightAdvisory[], draft: AdvisoryDraft): void {
  advisories.push({
    ...draft,
    priority: draft.priority ?? 50,
    value: draft.value || "监控中"
  });
}

export function getFlightAdvisories(
  state: FlightRuntimeState,
  aircraft: Aircraft,
  mission: Mission,
  airport: Airport
): FlightAdvisory[] {
  const advisories: FlightAdvisory[] = [];
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const airspeed = Math.max(0, finite(state.airspeed));
  const altitude = Math.max(0, finite(state.altitude));
  const verticalSpeed = finite(state.verticalSpeed);
  const throttlePercent = safeRound(finite(state.throttle) * 100);
  const targetSpeed = positive(mission.targetSpeed, aircraft.takeoffSpeed);
  const targetAltitude = Math.max(0, finite(mission.targetAltitude));
  const targetHeading = getMissionTargetHeading(mission, airport);
  const headingError = signedHeadingError(targetHeading, finite(state.heading));
  const headingErrorAbs = Math.abs(headingError);
  const runwayOffset = finite(state.runwayOffset);
  const runwayOffsetAbs = Math.abs(runwayOffset);
  const runwayRemaining = getRunwayRemainingMeters(airport, state.position.z);
  const wind = getWindComponents(airport, state.heading);
  const isLandingMission = mission.type === "landing-training";
  const isTakeoffMission = mission.type === "takeoff-training";
  const isRouteMission = mission.type === "route-challenge";
  const isFreeFlight = mission.type === "free-flight";
  const airborne = !state.onGround && altitude > 8;
  const cityCenter = airport.cityProfile?.center;
  const cityDistance = cityCenter
    ? Math.hypot(cityCenter.x - state.position.x, cityCenter.z - state.position.z)
    : 0;
  const cityHeading = cityCenter
    ? normalizeHeading(airport.runwayHeading + (Math.atan2(cityCenter.x - state.position.x, cityCenter.z - state.position.z) * 180) / Math.PI)
    : targetHeading;
  const cityHeadingError = signedHeadingError(cityHeading, finite(state.heading));

  if (state.crashed || state.warning === "CRASH") {
    addAdvisory(advisories, {
      id: "crash",
      severity: "danger",
      title: "飞行结束",
      message: "飞机已坠毁，重新开始训练会更稳。",
      value: "CRASH",
      priority: 0
    });
    return advisories;
  }

  if (state.stalled || state.warning === "STALL") {
    addAdvisory(advisories, {
      id: "stall",
      severity: "danger",
      title: "失速警告",
      message: "轻压机头，油门推到 100%，等速度恢复再拉升。",
      value: `${safeRound(airspeed)} kt`,
      priority: 1
    });
  }

  if (airborne && verticalSpeed < -1000 && altitude < 1800) {
    addAdvisory(advisories, {
      id: "sink-rate-danger",
      severity: "danger",
      title: "下降率过大",
      message: "轻拉杆并增加油门，先把下降率压到 -600 ft/min 内。",
      value: `${safeRound(verticalSpeed)} fpm`,
      priority: 2
    });
  } else if (airborne && isLandingMission && verticalSpeed < -720) {
    addAdvisory(advisories, {
      id: "sink-rate",
      severity: "warning",
      title: "进近偏陡",
      message: "稍微拉平，保持小下降率，避免硬着陆。",
      value: `${safeRound(verticalSpeed)} fpm`,
      priority: 12
    });
  }

  if (state.onGround && !state.missionCompleted) {
    if (runwayRemaining < airport.runwayLength * 0.18 && airspeed < airportProfile.requiredTakeoffSpeed * 0.95 && airspeed > 24) {
      addAdvisory(advisories, {
        id: "runway-remaining",
        severity: "danger",
        title: "跑道剩余不足",
        message: "当前机场跑道余量不够，速度不足请刹车中止。",
        value: `${safeRound(runwayRemaining)} m`,
        priority: 6
      });
    }

    if ((isTakeoffMission || isRouteMission || mission.type === "free-flight") && airspeed < airportProfile.requiredTakeoffSpeed * 0.92) {
      addAdvisory(advisories, {
        id: "takeoff-roll",
        severity: "info",
        title: "继续滑跑加速",
        message: `油门保持 100%，本机场建议到 ${airportProfile.requiredTakeoffSpeed} kt 后再轻拉杆。`,
        value: `${safeRound(airspeed)}/${airportProfile.requiredTakeoffSpeed} kt`,
        priority: 30
      });
    } else if ((isTakeoffMission || isRouteMission || mission.type === "free-flight") && airspeed < airportProfile.requiredTakeoffSpeed * 1.2) {
      addAdvisory(advisories, {
        id: "rotate",
        severity: "success",
        title: "达到抬轮速度",
        message: "轻拉杆抬机头，保持跑道航向，不要大角度爬升。",
        value: `${safeRound(airspeed)} kt`,
        priority: 22
      });
    }
  }

  if (wind.crosswindKnots > 11 && (airborne || airspeed > 35) && altitude < 1600) {
    addAdvisory(advisories, {
      id: "crosswind",
      severity: wind.crosswindKnots > 16 ? "warning" : "info",
      title: wind.crosswindFrom === "right" ? "右侧风修正" : "左侧风修正",
      message: wind.crosswindFrom === "right"
        ? "风从右侧来，保持跑道中心线，必要时向右压一点机翼。"
        : "风从左侧来，保持跑道中心线，必要时向左压一点机翼。",
      value: `${safeRound(wind.crosswindKnots)} kt`,
      priority: wind.crosswindKnots > 16 ? 11 : 24
    });
  }

  if (airportProfile.wind.tailwindKnots > 4 && state.onGround && !state.missionCompleted) {
    addAdvisory(advisories, {
      id: "tailwind",
      severity: "warning",
      title: "顺风增加滑跑",
      message: "本场顺风会拉长起飞距离，保持满油门并盯住跑道剩余。",
      value: `${safeRound(airportProfile.wind.tailwindKnots)} kt`,
      priority: 20
    });
  }

  if (airport.visibility < 7 && airborne && altitude < 1400) {
    addAdvisory(advisories, {
      id: "low-visibility",
      severity: "info",
      title: "能见度偏低",
      message: "更早对准跑道灯，避免到低高度再大幅修正。",
      value: `${airport.visibility} mi`,
      priority: 31
    });
  }

  if (airborne) {
    const stallBufferSpeed = aircraft.stallSpeed * 1.18;
    const lowSpeedLimit = Math.max(stallBufferSpeed, isLandingMission ? targetSpeed * 0.86 : targetSpeed * 0.74);
    const highSpeedLimit = isLandingMission
      ? Math.max(lowSpeedLimit + 12, targetSpeed * 1.18)
      : Math.max(lowSpeedLimit + 18, Math.min(aircraft.maxSpeed * 0.92, targetSpeed * 1.34));

    if (airspeed < stallBufferSpeed) {
      addAdvisory(advisories, {
        id: "speed-near-stall",
        severity: "danger",
        title: "速度过低",
        message: "立即加油门，轻压机头，先恢复到安全速度。",
        value: `${safeRound(airspeed)} kt`,
        priority: 4
      });
    } else if (airspeed < lowSpeedLimit) {
      addAdvisory(advisories, {
        id: "speed-low",
        severity: "warning",
        title: "速度偏低",
        message: `加一点油门，机头不要继续抬高，目标约 ${targetSpeed} kt。`,
        value: `${safeRound(airspeed)} kt`,
        priority: 16
      });
    }

    if (airspeed > aircraft.maxSpeed * 0.96) {
      addAdvisory(advisories, {
        id: "speed-overspeed",
        severity: "danger",
        title: "接近最大速度",
        message: "立刻收油门并轻拉平，避免高速失控。",
        value: `${safeRound(airspeed)}/${aircraft.maxSpeed} kt`,
        priority: 5
      });
    } else if (airspeed > highSpeedLimit) {
      addAdvisory(advisories, {
        id: "speed-high",
        severity: "warning",
        title: "速度过高",
        message: isLandingMission
          ? "收油门，放襟翼，保持稳定下滑。"
          : isFreeFlight
            ? "略收油门，减小俯冲角，回到舒适巡航速度。"
            : "略收油门，减小俯冲角，回到任务目标速度。",
        value: `${safeRound(airspeed)} kt`,
        priority: 17
      });
    }
  }

  if (isFreeFlight && airborne && cityCenter) {
    const correction = cityHeadingError > 0 ? "向右" : "向左";
    addAdvisory(advisories, {
      id: "city-free-flight",
      severity: cityDistance < 850 ? "success" : "info",
      title: cityDistance < 850 ? `${airport.cityProfile?.downtownName ?? "市中心"} 上空` : "飞向城市上空",
      message: cityDistance < 850
        ? "已经到达城市核心区，可以小坡度盘旋、观景，或继续沿海岸/河道远航。"
        : `${correction}小幅转向 ${safeRound(cityHeading).toString().padStart(3, "0")}°，前方是 ${airport.cityProfile?.downtownName ?? "市中心"}。`,
      value: `${Math.max(0.1, cityDistance / 1000).toFixed(1)} km`,
      priority: cityDistance < 850 ? 23 : 28
    });
  }

  if (!isFreeFlight && (!state.onGround || airspeed > 35) && headingErrorAbs > (isLandingMission ? 5 : 10)) {
    const correction = headingError > 0 ? "向右" : "向左";
    const driftSide = headingError > 0 ? "偏左" : "偏右";
    addAdvisory(advisories, {
      id: "heading",
      severity: headingErrorAbs > 24 ? "warning" : "info",
      title: `航向${driftSide}`,
      message: `${correction}小幅修正，目标航向 ${safeRound(targetHeading).toString().padStart(3, "0")}°。`,
      value: `${safeRound(headingErrorAbs)}°`,
      priority: headingErrorAbs > 24 ? 18 : 34
    });
  }

  if (airborne && targetAltitude > 0) {
    const lowMargin = targetAltitude >= 3500 ? 450 : 220;
    const highMargin = targetAltitude >= 3500 ? 650 : 320;

    if (altitude < targetAltitude - lowMargin) {
      addAdvisory(advisories, {
        id: "altitude-low",
        severity: altitude < targetAltitude * 0.58 ? "warning" : "info",
        title: "高度偏低",
        message: `保持爬升，垂直速度争取稳定在正值，目标 ${targetAltitude} ft。`,
        value: `${safeRound(altitude)} ft`,
        priority: altitude < targetAltitude * 0.58 ? 19 : 36
      });
    } else if (altitude > targetAltitude + highMargin) {
      addAdvisory(advisories, {
        id: "altitude-high",
        severity: "info",
        title: "高度偏高",
        message: "轻压机头或略收油门，慢慢回到目标高度。",
        value: `${safeRound(altitude)} ft`,
        priority: 37
      });
    }
  }

  if (airborne && targetAltitude > 0 && altitude < targetAltitude - 250 && verticalSpeed < 150) {
    addAdvisory(advisories, {
      id: "climb-rate",
      severity: "info",
      title: "爬升不足",
      message: "保持速度后再轻拉杆，避免用过大俯仰硬爬升。",
      value: `${safeRound(verticalSpeed)} fpm`,
      priority: 35
    });
  }

  if (airborne && isLandingMission && altitude < 900 && !state.gearDown) {
    addAdvisory(advisories, {
      id: "gear",
      severity: "warning",
      title: "放下起落架",
      message: "进近高度已低，按 G 放下起落架准备落地。",
      value: "GEAR",
      priority: 13
    });
  }

  if (airborne && isLandingMission && altitude < 1000 && state.flaps === 0) {
    addAdvisory(advisories, {
      id: "flaps",
      severity: "warning",
      title: "需要襟翼",
      message: "按 F 放襟翼，降低进近速度并增加低速升力。",
      value: "FLAPS",
      priority: 14
    });
  }

  if ((!isFreeFlight || state.onGround) && (!state.onGround || airspeed > 30) && altitude < (isLandingMission ? 1800 : 1200) && runwayOffsetAbs > (isLandingMission ? 12 : 28)) {
    const side = runwayOffset > 0 ? "偏右" : "偏左";
    const correction = runwayOffset > 0 ? "向左" : "向右";
    addAdvisory(advisories, {
      id: "centerline",
      severity: runwayOffsetAbs > 55 ? "warning" : "info",
      title: `中心线${side}`,
      message: `${correction}小幅修正，重新对准跑道中心线。`,
      value: `${safeRound(runwayOffsetAbs)} m`,
      priority: runwayOffsetAbs > 55 ? 15 : 33
    });
  }

  if (advisories.length === 0) {
    addAdvisory(advisories, {
      id: "stable",
      severity: "success",
      title: state.onGround ? "准备起飞" : "飞行稳定",
      message: state.onGround
        ? `当前油门 ${throttlePercent}%，保持跑道方向并平稳加速。`
        : isFreeFlight
          ? "姿态和速度稳定，可以继续飞向城市、沿水面巡航或自由盘旋。"
          : "姿态、速度和航向都在可控范围内，保持小幅修正。",
      value: state.onGround ? `${throttlePercent}%` : "STABLE",
      priority: 99
    });
  }

  return advisories.sort((a, b) => a.priority - b.priority).slice(0, 4);
}
