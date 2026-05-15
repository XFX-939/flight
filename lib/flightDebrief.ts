import type { Aircraft, Airport, FlightDebrief, FlightMetrics, FlightRecord, FlightScore, FlightRuntimeState, Mission } from "@/types/flight";
import { getAirportGameplayProfile } from "@/lib/airportGameplay";
import { formatDuration, safeRound } from "@/lib/math";

type GenerateFlightDebriefInput = {
  playerName: string;
  mission: Mission;
  aircraft: Aircraft;
  airport: Airport;
  score: FlightScore;
  state: FlightRuntimeState;
  metrics: FlightMetrics;
};

function clampList(items: string[], fallback: string, limit = 3): string[] {
  const compactItems = items.filter((item) => item.trim().length > 0);
  return compactItems.length > 0 ? compactItems.slice(0, limit) : [fallback];
}

function toneForScore(score: FlightScore): FlightDebrief["tone"] {
  if (score.crashed || score.rating === "F") {
    return "failed";
  }
  if (score.totalScore >= 82) {
    return "success";
  }
  if (score.totalScore >= 60) {
    return "steady";
  }
  return "training";
}

function titleForScore(playerName: string, score: FlightScore): string {
  if (score.crashed || score.rating === "F") {
    return `${playerName}，这次飞行很有训练价值`;
  }
  if (score.rating === "S") {
    return `${playerName}，这趟飞得很漂亮`;
  }
  if (score.rating === "A") {
    return `${playerName}，一次稳定可靠的飞行`;
  }
  if (score.rating === "B" || score.rating === "C") {
    return `${playerName}，你已经掌握了关键节奏`;
  }
  return `${playerName}，下一趟会更稳`;
}

function encouragementForScore(score: FlightScore): string {
  if (score.crashed) {
    return "飞行训练最重要的不是一次完美，而是知道哪里该提前留余量。你已经把问题暴露出来了，下一次就有明确方向。";
  }
  if (score.totalScore >= 92) {
    return "这是一趟值得写进日志的飞行：速度、姿态和任务节奏都很干净，像一名真正沉得住气的机长。";
  }
  if (score.totalScore >= 78) {
    return "整体完成得很稳，尤其是能在任务压力下保持可控姿态，这就是飞行手感开始建立起来的信号。";
  }
  if (score.totalScore >= 58) {
    return "你已经把飞机带回了可控范围，剩下要打磨的是提前量：提前控速、提前对准、提前留跑道。";
  }
  return "这趟不算失败，它更像一次真实的模拟训练：它告诉你下一次该先照顾速度和姿态，再追求任务完成。";
}

export function generateFlightDebrief({
  playerName,
  mission,
  aircraft,
  airport,
  score,
  state,
  metrics
}: GenerateFlightDebriefInput): FlightDebrief {
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const tone = toneForScore(score);
  const duration = formatDuration(score.flightTime);
  const averageHeadingError = metrics.headingSamples > 0 ? metrics.headingDeviationTotal / metrics.headingSamples : 0;
  const maxAltitude = Math.max(0, score.maxAltitude);
  const maxSpeed = Math.max(0, score.maxSpeed);
  const player = playerName.trim().length > 0 ? playerName : "机长";
  const missionResult = score.missionCompleted ? "完成任务" : score.crashed ? "任务中止" : "结束训练";

  const highlights: string[] = [];
  if (score.missionCompleted && !score.crashed) {
    highlights.push(`你完成了 ${mission.name}，说明起飞、航向和任务节奏已经连起来了。`);
  }
  if (score.stallWarnings === 0) {
    highlights.push("全程没有触发失速警告，速度管理很克制。");
  }
  if (score.landingVerticalSpeed > 0 && score.landingVerticalSpeed < 600 && !score.hardLanding) {
    highlights.push(`接地垂直速度 ${score.landingVerticalSpeed} fpm，落地控制在可接受范围内。`);
  }
  if (score.crosswindWarnings > 0 && !score.crashed) {
    highlights.push(`在 ${safeRound(metrics.maxCrosswind)} kt 侧风下仍保持了飞行控制，这是很好的抗干扰练习。`);
  }
  if (averageHeadingError <= 12 && metrics.headingSamples > 6) {
    highlights.push(`平均航向偏差约 ${safeRound(averageHeadingError)}°，航向保持有明显稳定性。`);
  }
  if (mission.type === "free-flight" && score.flightTime >= 90) {
    highlights.push(`自由飞行持续 ${duration}，说明你已经能持续管理油门、姿态和高度。`);
  }

  const improvements: string[] = [];
  if (score.crashed) {
    improvements.push("下一次先把速度和高度留出来，不要在低高度做大坡度或大俯仰修正。");
  }
  if (score.stallWarnings > 0) {
    improvements.push(`出现 ${score.stallWarnings} 次失速警告，拉升前先让速度超过安全余量，再小角度抬机头。`);
  }
  if (score.hardLanding || state.landingQuality === "硬着陆") {
    improvements.push("落地前再早一点收下降率，最后 200 ft 以小动作拉平。");
  }
  if (score.landingCenterlineOffset > 24) {
    improvements.push(`中心线偏差 ${score.landingCenterlineOffset} m，进近阶段要更早对准跑道，别等到低空再大幅修正。`);
  }
  if (score.runwayOverrun) {
    improvements.push("这次跑道余量用完了，短跑道机场要更早刹车，进近速度也要提前压下来。");
  }
  if (score.weatherPenalty > 0 || airportProfile.wind.crosswindKnots > 10) {
    improvements.push("天气已经影响成绩，侧风机场要用小幅滚转和偏航保持中心线。");
  }
  if (averageHeadingError > 18 && metrics.headingSamples > 6) {
    improvements.push(`平均航向偏差约 ${safeRound(averageHeadingError)}°，巡航时尽量用小修正，不要连续大角度滚转。`);
  }

  const nextFocus = score.crashed
    ? "下一次建议选择 Cessna 172 和 Felix International，先练满油门滑跑、达到抬轮速度后小角度拉升。"
    : score.stallWarnings > 0
      ? "下一次重点练“速度优先”：低于安全速度时先压机头和加油门，再考虑爬升。"
      : score.landingCenterlineOffset > 24
        ? "下一次重点练进近对线：在 1000 ft 以上就把跑道中心线对好。"
        : airportProfile.wind.crosswindKnots > 10
          ? "下一次可以继续同机场，专门练侧风下的小幅修正。"
          : "下一次可以提高难度：换更短跑道、侧风更明显的机场，或者挑战更重的机型。";

  return {
    tone,
    title: titleForScore(player, score),
    subtitle: `${missionResult} · ${score.rating} 评级 · ${score.totalScore} 分`,
    summary: `${aircraft.name} 在 ${airport.name} 完成 ${duration} 飞行，最大高度 ${safeRound(maxAltitude)} ft，最大速度 ${safeRound(maxSpeed)} kt，机场难度 ${score.airportDifficulty}/100。`,
    encouragement: encouragementForScore(score),
    highlights: clampList(highlights, "你完成了一次完整的模拟飞行流程，已经积累了可复盘的数据。"),
    improvements: clampList(improvements, "这次整体比较平顺，下一步可以追求更小的航向偏差和更精准的速度控制。"),
    nextFocus
  };
}

export function getRecordDebrief(record: FlightRecord): FlightDebrief {
  if (record.debrief) {
    return record.debrief;
  }

  const failed = record.crashed || record.rating === "F";
  const tone: FlightDebrief["tone"] = failed ? "failed" : record.score >= 82 ? "success" : record.score >= 60 ? "steady" : "training";

  return {
    tone,
    title: failed ? `${record.playerName}，这次日志值得复盘` : `${record.playerName}，这是一段值得保留的飞行记录`,
    subtitle: `${record.rating} 评级 · ${record.score} 分`,
    summary: `${record.aircraftName} 在 ${record.airportName} 执行 ${record.missionName}，飞行时间 ${formatDuration(record.flightTime)}，降落质量：${record.landingQuality}。`,
    encouragement: failed
      ? "这条旧日志没有完整 debrief，但它依然保留了最重要的信息：你知道下一次该从哪里重新起飞。"
      : "这条旧日志没有完整 debrief，不过能留下评分和任务结果，已经是进步轨迹的一部分。",
    highlights: ["完成了飞行记录保存，说明这趟飞行已经进入你的训练历史。"],
    improvements: [failed ? "下一次先追求安全完成，再追求评分。" : "下一次可以继续优化速度、航向和降落稳定性。"],
    nextFocus: "继续飞一趟，新版日志会自动生成更完整的教官反馈。"
  };
}
