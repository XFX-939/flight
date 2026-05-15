"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type {
  Aircraft,
  Airport,
  FlightControlInput,
  FlightMetrics,
  FlightRuntimeState,
  Mission
} from "@/types/flight";
import { getAircraftPerformanceProfile } from "@/lib/aircraftPerformance";
import {
  FT_PER_METER,
  KNOTS_PER_MPS,
  METER_PER_FT,
  MPS_PER_KNOT,
  clamp,
  headingDelta,
  lerp,
  normalizeHeading,
  radToDeg
} from "@/lib/math";

type PhysicsOptions = {
  aircraft: Aircraft;
  airport: Airport;
  mission: Mission;
  stateRef: MutableRefObject<FlightRuntimeState>;
  metricsRef: MutableRefObject<FlightMetrics>;
  controlsRef: MutableRefObject<FlightControlInput>;
  active: boolean;
};

const RUNWAY_WIDTH = 62;
const GROUND_Y = 1.2;
const ROUTE_TARGET = { x: 2200, z: 9200 };

function handlingFactor(aircraft: Aircraft): number {
  if (aircraft.handling === "较灵敏") {
    return 1.16;
  }
  if (aircraft.handling === "较重") {
    return 0.72;
  }
  return 0.92;
}

function stabilityFactor(aircraft: Aircraft): number {
  if (aircraft.stability === "高") {
    return 1.18;
  }
  if (aircraft.stability === "中等") {
    return 0.92;
  }
  return 0.76;
}

function landingQuality(verticalSpeed: number): "轻柔着陆" | "正常着陆" | "硬着陆" | "坠毁" {
  if (verticalSpeed < 300) {
    return "轻柔着陆";
  }
  if (verticalSpeed < 600) {
    return "正常着陆";
  }
  if (verticalSpeed < 900) {
    return "硬着陆";
  }
  return "坠毁";
}

export function useAircraftPhysics({
  aircraft,
  airport,
  mission,
  stateRef,
  metricsRef,
  controlsRef,
  active
}: PhysicsOptions) {
  const ratesRef = useRef({ pitch: 0, roll: 0, yaw: 0, lastPitch: 0, lastRoll: 0 });

  useFrame((_, frameDelta) => {
    if (!active) {
      return;
    }

    const dt = clamp(frameDelta, 0.001, 0.045);
    const state = stateRef.current;
    const metrics = metricsRef.current;
    const input = controlsRef.current;

    if (state.crashed || state.missionCompleted) {
      metrics.elapsedTime = Math.max(0, (performance.now() - metrics.startedAt) / 1000);
      state.flightTime = metrics.elapsedTime;
      return;
    }

    const maxSpeedMps = Math.max(aircraft.maxSpeed * MPS_PER_KNOT, 1);
    const stallSpeed = aircraft.stallSpeed;
    const takeoffSpeed = aircraft.takeoffSpeed;
    const speedMps = clamp(state.airspeed * MPS_PER_KNOT, 0, maxSpeedMps * 1.08);
    const handling = handlingFactor(aircraft);
    const stability = stabilityFactor(aircraft);
    const profile = getAircraftPerformanceProfile(aircraft);
    const flapLift = 1 + state.flaps * 0.1 * aircraft.flapEffectiveness;
    const flapDrag = state.flaps * 0.2;
    const gearDrag = state.gearDown ? 0.2 : 0;
    const brakeDrag = state.onGround && input.brake ? aircraft.brakePower * 13 : 0;
    const throttleTarget = input.useThrottleOverride
      ? input.throttleOverride
      : state.throttle + input.throttleDelta * dt * 0.46 * aircraft.throttleResponse;

    const throttleFollowRate = input.useThrottleOverride ? dt * (2.2 + aircraft.throttleResponse * 2.6) : 1;
    state.throttle = clamp(lerp(state.throttle, throttleTarget, throttleFollowRate), 0, 1);
    state.brake = input.brake;

    const targetPitchRate = input.pitch * profile.pitchAuthority * handling;
    const targetRollRate = input.roll * profile.rollAuthority * handling - state.roll * profile.rollDamping * stability;
    const targetYawRate = input.yaw * profile.yawAuthority * handling + Math.sin(state.roll) * clamp(state.airspeed / aircraft.maxSpeed, 0, 1) * 0.38;
    ratesRef.current.pitch = lerp(ratesRef.current.pitch, targetPitchRate, dt * profile.pitchResponse);
    ratesRef.current.roll = lerp(ratesRef.current.roll, targetRollRate, dt * profile.rollResponse);
    ratesRef.current.yaw = lerp(ratesRef.current.yaw, targetYawRate, dt * profile.yawResponse);

    if (state.onGround) {
      const canRotate = state.airspeed > takeoffSpeed * 0.64;
      const rotateTarget = input.pitch > 0 && canRotate ? input.pitch * profile.rotationPitch : input.pitch < 0 ? -0.04 : 0;
      state.pitch = clamp(lerp(state.pitch, rotateTarget, dt * profile.rotationRate), -0.04, 0.28);
      state.roll = lerp(state.roll, 0, dt * 6.5);
      state.yaw += input.yaw * dt * 0.18;
    } else {
      state.pitch = clamp(state.pitch + ratesRef.current.pitch * dt, -0.42, 0.5);
      state.roll = clamp(state.roll + ratesRef.current.roll * dt, -profile.maxRoll, profile.maxRoll);
      state.yaw += ratesRef.current.yaw * dt;
      state.pitch = lerp(state.pitch, 0.02, dt * profile.trimRate * stability);
    }

    state.heading = normalizeHeading(radToDeg(state.yaw));

    const thrustAccel = state.throttle * (7.2 + aircraft.throttleResponse * 5.2) * profile.thrustScale;
    const profileDrag = (speedMps / maxSpeedMps) * (speedMps / maxSpeedMps) * 7.8 * profile.dragScale;
    const pitchDrag = Math.max(0, state.pitch) * 4.5 + Math.abs(state.roll) * 0.7;
    const totalDrag = profileDrag + flapDrag * 2.4 + gearDrag * 2 + pitchDrag + brakeDrag;
    let nextSpeedMps = clamp(speedMps + (thrustAccel - totalDrag) * dt, 0, maxSpeedMps * 1.08);

    const stallThreshold = stallSpeed * (state.pitch > profile.stallPitchThreshold ? 1.1 : 0.94);
    state.stalled = !state.onGround && state.airspeed < stallThreshold && state.pitch > 0.04;
    if (state.stalled && !metrics.lastStalled) {
      metrics.stallWarnings += 1;
    }
    metrics.lastStalled = state.stalled;

    const liftRatio = (state.airspeed / Math.max(stallSpeed, 1)) ** 2;
    const rollLift = Math.cos(Math.abs(state.roll) * 0.74);
    let verticalMps = 0;

    if (state.onGround) {
      verticalMps = 0;
      if (state.airspeed >= takeoffSpeed * 0.96 && state.pitch > 0.055) {
        state.onGround = false;
        state.pitch = Math.max(state.pitch, 0.11);
        verticalMps = profile.liftoffBoost + Math.sin(state.pitch) * nextSpeedMps * 0.5;
        if (!metrics.takeoffRecorded) {
          metrics.takeoffDistance = Math.max(0, state.position.z + airport.runwayLength / 2);
          metrics.takeoffRecorded = true;
        }
      }
    } else {
      const pitchClimb = Math.sin(state.pitch) * nextSpeedMps * 0.72;
      const liftClimb = (liftRatio * flapLift * rollLift * profile.liftScale - 1.02) * 2.6;
      verticalMps = pitchClimb + liftClimb - (state.gearDown ? 0.6 : 0);
      if (state.stalled) {
        verticalMps -= 9.5;
        state.pitch = lerp(state.pitch, -0.16, dt * 1.7);
        nextSpeedMps = lerp(nextSpeedMps, Math.max(nextSpeedMps, stallSpeed * MPS_PER_KNOT * 1.08), dt * 0.42);
      }
      verticalMps = clamp(verticalMps, -32, 22 + aircraft.climbRate / 420);
    }

    const forwardMps = Math.max(0, nextSpeedMps * Math.cos(state.pitch));
    const crosswindHeading = ((airport.windDirection - state.heading + 540) % 360) - 180;
    const windCrossMps = Math.sin((crosswindHeading * Math.PI) / 180) * airport.windSpeed * 0.09;
    const dirX = Math.sin(state.yaw);
    const dirZ = Math.cos(state.yaw);

    state.velocity.x = dirX * forwardMps + windCrossMps;
    state.velocity.y = verticalMps;
    state.velocity.z = dirZ * forwardMps;
    state.position.x += state.velocity.x * dt;
    state.position.z += state.velocity.z * dt;
    state.position.y += state.velocity.y * dt;

    if (state.position.y <= GROUND_Y && !state.onGround) {
      const touchdownVs = Math.abs(state.verticalSpeed);
      const inRunwayLength = state.position.z > -airport.runwayLength / 2 && state.position.z < airport.runwayLength / 2;
      const inRunwayWidth = Math.abs(state.position.x) < RUNWAY_WIDTH / 2;
      const quality = landingQuality(touchdownVs);
      const gearFailure = !state.gearDown && nextSpeedMps > 18;
      const attitudeFailure = Math.abs(state.roll) > 0.55 || state.pitch < -0.22;
      const offRunwayFailure = !inRunwayLength || !inRunwayWidth;

      state.position.y = GROUND_Y;
      state.onGround = true;
      state.landingQuality = gearFailure || attitudeFailure || offRunwayFailure ? "坠毁" : quality;
      metrics.landingVerticalSpeed = Math.round(touchdownVs);
      metrics.landingCenterlineOffset = Math.round(Math.abs(state.position.x));
      metrics.touchdownDistance = Math.round(Math.max(0, state.position.z + airport.runwayLength / 2));
      metrics.touchdownRecorded = true;
      metrics.hardLanding = state.landingQuality === "硬着陆";

      if (state.landingQuality === "坠毁") {
        state.crashed = true;
        metrics.crashed = true;
        state.warning = "CRASH";
      }
    }

    if (state.onGround) {
      state.position.y = GROUND_Y;
      state.velocity.y = 0;
      if (input.pitch <= 0 || state.airspeed < takeoffSpeed * 0.64) {
        state.pitch = lerp(state.pitch, 0, dt * 4.5);
      }
      state.roll = lerp(state.roll, 0, dt * 7);
      if (state.brake) {
        nextSpeedMps = Math.max(0, nextSpeedMps - aircraft.brakePower * 18 * dt);
      }
    }

    state.airspeed = clamp(nextSpeedMps * KNOTS_PER_MPS, 0, aircraft.maxSpeed * 1.08);
    state.altitude = Math.max(0, state.position.y * FT_PER_METER);
    state.verticalSpeed = Math.round(state.velocity.y / METER_PER_FT * 60);
    state.runwayOffset = state.position.x;
    state.runwayDistance = Math.abs(state.position.z);
    state.flightTime = Math.max(0, (performance.now() - metrics.startedAt) / 1000);
    state.distanceToTarget =
      mission.type === "route-challenge"
        ? Math.hypot(ROUTE_TARGET.x - state.position.x, ROUTE_TARGET.z - state.position.z)
        : Math.hypot(state.position.x, state.position.z);

    const offRunway = state.onGround && Math.abs(state.position.x) > RUNWAY_WIDTH / 2 && state.airspeed > 28;
    const steepLow = !state.onGround && state.altitude < 160 && Math.abs(state.roll) > 0.95 && state.verticalSpeed < -650;
    if (offRunway || steepLow) {
      state.crashed = true;
      metrics.crashed = true;
      state.landingQuality = "坠毁";
      state.warning = "CRASH";
    }

    if (state.stalled) {
      state.warning = "STALL";
    } else if (Math.abs(state.runwayOffset) > 36 && state.altitude < 800) {
      state.warning = "跑道偏离";
    } else if (!state.gearDown && state.altitude < 700 && state.airspeed < aircraft.takeoffSpeed * 1.8) {
      state.warning = "GEAR";
    } else {
      state.warning = "";
    }

    if (mission.type === "takeoff-training") {
      const headingOk = headingDelta(state.heading, mission.targetHeading) <= 10;
      const speedOk = state.airspeed >= aircraft.takeoffSpeed * 1.12;
      state.missionStatus = state.altitude >= mission.targetAltitude
        ? headingOk
          ? "训练完成，爬升稳定"
          : "高度达标，修正航向"
        : state.onGround
          ? state.airspeed >= aircraft.takeoffSpeed * 0.9
            ? "速度已到，按住 S / ↓ 或 PULL 抬机头"
            : "加油门滑跑，达到起飞速度后轻拉杆"
          : "保持爬升，目标 1500 ft";
      if (state.altitude >= mission.targetAltitude && headingOk && speedOk && !state.stalled) {
        state.missionCompleted = true;
        metrics.missionCompleted = true;
      }
    }

    if (mission.type === "landing-training") {
      state.missionStatus = state.onGround
        ? state.airspeed < 35
          ? "降落训练完成"
          : "保持刹车，减速到安全速度"
        : "沿中心线下降，襟翼和起落架保持放下";
      if (state.onGround && metrics.touchdownRecorded && state.airspeed < 35 && !state.crashed) {
        state.missionCompleted = true;
        metrics.missionCompleted = true;
      }
    }

    if (mission.type === "free-flight") {
      state.missionStatus = state.stalled ? "失速恢复：降低机头并增加速度" : "自由飞行中，可随时结束";
    }

    if (mission.type === "route-challenge") {
      const cruiseOk = Math.abs(state.altitude - mission.targetAltitude) < 650;
      state.missionStatus = state.distanceToTarget > 1000
        ? cruiseOk
          ? "高度稳定，继续前往 Bay City"
          : "调整到指定巡航高度"
        : state.onGround
          ? state.airspeed < 45
            ? "航线挑战完成"
            : "抵达目标机场，继续减速"
          : "抵达目标区域，准备降落";
      if (state.distanceToTarget < 1200 && state.onGround && state.airspeed < 45 && !state.crashed) {
        state.missionCompleted = true;
        metrics.missionCompleted = true;
      }
    }

    metrics.elapsedTime = state.flightTime;
    metrics.maxAltitude = Math.max(metrics.maxAltitude, state.altitude);
    metrics.maxSpeed = Math.max(metrics.maxSpeed, state.airspeed);
    metrics.speedSamples += 1;
    metrics.speedTotal += state.airspeed;
    metrics.averageSpeed = metrics.speedTotal / Math.max(1, metrics.speedSamples);
    metrics.smoothnessPenalty += Math.abs(state.pitch - ratesRef.current.lastPitch) * 28 + Math.abs(state.roll - ratesRef.current.lastRoll) * 16;
    metrics.headingDeviationTotal += headingDelta(state.heading, mission.targetHeading);
    metrics.headingSamples += 1;
    ratesRef.current.lastPitch = state.pitch;
    ratesRef.current.lastRoll = state.roll;
  });
}
