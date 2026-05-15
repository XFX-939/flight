import type { Aircraft, Airport, Mission } from "@/types/flight";
import { clamp, normalizeHeading, safeRound } from "@/lib/math";

export type WindComponents = {
  relativeAngle: number;
  headwindKnots: number;
  tailwindKnots: number;
  crosswindKnots: number;
  signedCrosswindKnots: number;
  crosswindFrom: "left" | "right" | "calm";
};

export type AirportGameplayProfile = {
  wind: WindComponents;
  densityFactor: number;
  requiredTakeoffSpeed: number;
  takeoffRollScale: number;
  runwayUseRatio: number;
  runwayMarginMeters: number;
  runwayDifficulty: number;
  windDifficulty: number;
  visibilityDifficulty: number;
  elevationDifficulty: number;
  totalDifficulty: number;
  challengeLabel: string;
  challengeSummary: string;
  fogNear: number;
  fogFar: number;
};

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function signedAngle(from: number, to: number): number {
  return normalizeHeading(from - to + 540) - 180;
}

function difficultyLabel(value: number): string {
  if (value >= 0.62) {
    return "高难度";
  }
  if (value >= 0.28) {
    return "中等挑战";
  }
  return "标准训练";
}

export function getMissionTargetHeading(mission: Mission, airport: Airport): number {
  if (mission.type === "route-challenge") {
    return normalizeHeading(airport.runwayHeading + mission.targetHeading);
  }

  return normalizeHeading(airport.runwayHeading);
}

export function getWindComponents(airport: Airport, heading = airport.runwayHeading): WindComponents {
  const windSpeed = Math.max(0, finite(airport.windSpeed));
  const relativeAngle = signedAngle(finite(airport.windDirection), finite(heading));
  const angleRad = (relativeAngle * Math.PI) / 180;
  const headwindKnots = Math.cos(angleRad) * windSpeed;
  const signedCrosswindKnots = Math.sin(angleRad) * windSpeed;
  const crosswindKnots = Math.abs(signedCrosswindKnots);

  return {
    relativeAngle,
    headwindKnots,
    tailwindKnots: Math.max(0, -headwindKnots),
    crosswindKnots,
    signedCrosswindKnots,
    crosswindFrom: signedCrosswindKnots > 0.4 ? "right" : signedCrosswindKnots < -0.4 ? "left" : "calm"
  };
}

export function getRequiredRunwayMeters(aircraft: Aircraft): number {
  return Math.max(480, aircraft.takeoffSpeed * aircraft.takeoffSpeed * 0.08 + 420);
}

export function getAirportGameplayProfile(airport: Airport, aircraft: Aircraft): AirportGameplayProfile {
  const wind = getWindComponents(airport, airport.runwayHeading);
  const requiredRunwayMeters = getRequiredRunwayMeters(aircraft);
  const runwayUseRatio = requiredRunwayMeters / Math.max(airport.runwayLength, 1);
  const runwayMarginMeters = airport.runwayLength - requiredRunwayMeters;
  const runwayDifficulty = clamp((runwayUseRatio - 0.34) * 1.55, 0, 1);
  const windDifficulty = clamp((wind.crosswindKnots - 6) / 18 + wind.tailwindKnots / 10, 0, 1);
  const visibilityDifficulty = clamp((10 - finite(airport.visibility, 10)) / 6, 0, 1);
  const elevationDifficulty = clamp(finite(airport.elevation) / 5500, 0, 1);
  const densityFactor = clamp(1 - finite(airport.elevation) / 15000, 0.82, 1);
  const requiredTakeoffSpeed = Math.round(
    aircraft.takeoffSpeed + wind.tailwindKnots * 0.48 + wind.crosswindKnots * 0.12 + finite(airport.elevation) / 4200
  );
  const takeoffRollScale = clamp(
    1 + wind.tailwindKnots * 0.028 + wind.crosswindKnots * 0.009 + finite(airport.elevation) / 9000 - Math.max(0, wind.headwindKnots) * 0.007,
    0.9,
    1.42
  );
  const totalDifficulty = clamp(
    runwayDifficulty * 0.36 + windDifficulty * 0.32 + visibilityDifficulty * 0.2 + elevationDifficulty * 0.12,
    0,
    1
  );
  const fogFar = clamp(finite(airport.visibility, 10) * 920, 2400, 12500);
  const fogNear = clamp(fogFar * 0.16, 520, 1900);
  const windText =
    wind.crosswindKnots >= 1
      ? `${safeRound(wind.crosswindKnots)} kt ${wind.crosswindFrom === "right" ? "右侧风" : wind.crosswindFrom === "left" ? "左侧风" : "侧风"}`
      : "风况平稳";
  const runwayText = runwayMarginMeters < 250 ? "跑道余量很小" : runwayMarginMeters < 750 ? "跑道余量有限" : "跑道余量充足";

  return {
    wind,
    densityFactor,
    requiredTakeoffSpeed,
    takeoffRollScale,
    runwayUseRatio,
    runwayMarginMeters,
    runwayDifficulty,
    windDifficulty,
    visibilityDifficulty,
    elevationDifficulty,
    totalDifficulty,
    challengeLabel: difficultyLabel(totalDifficulty),
    challengeSummary: `${runwayText} · ${windText} · 能见度 ${airport.visibility} mi`,
    fogNear,
    fogFar
  };
}

export function getRunwayRemainingMeters(airport: Airport, zPosition: number): number {
  return clamp(airport.runwayLength / 2 - finite(zPosition), 0, airport.runwayLength);
}
