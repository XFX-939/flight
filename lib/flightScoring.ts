import type { FlightMetrics, FlightRating, FlightScore, FlightRuntimeState, Mission } from "@/types/flight";
import { clamp } from "@/lib/math";

function ratingForScore(score: number, failed: boolean): FlightRating {
  if (failed) {
    return "F";
  }
  if (score >= 92) {
    return "S";
  }
  if (score >= 82) {
    return "A";
  }
  if (score >= 70) {
    return "B";
  }
  if (score >= 58) {
    return "C";
  }
  return "D";
}

function landingScore(metrics: FlightMetrics): number {
  const verticalPenalty = clamp((metrics.landingVerticalSpeed - 220) / 8, 0, 45);
  const centerlinePenalty = clamp(metrics.landingCenterlineOffset / 1.5, 0, 25);
  const touchdownPenalty = clamp(Math.abs(metrics.touchdownDistance - 700) / 45, 0, 20);
  return clamp(100 - verticalPenalty - centerlinePenalty - touchdownPenalty, 0, 100);
}

function takeoffScore(metrics: FlightMetrics, _targetHeading: number): number {
  const takeoffDistancePenalty = clamp((metrics.takeoffDistance - 950) / 25, 0, 22);
  const averageHeadingError =
    metrics.headingSamples > 0 ? metrics.headingDeviationTotal / metrics.headingSamples : 0;
  const headingPenalty = clamp(averageHeadingError * 1.2, 0, 24);
  const stallPenalty = metrics.stallWarnings * 9;
  const smoothnessPenalty = clamp(metrics.smoothnessPenalty / 30, 0, 24);
  return clamp(100 - takeoffDistancePenalty - headingPenalty - stallPenalty - smoothnessPenalty, 0, 100);
}

function freeFlightScore(metrics: FlightMetrics): number {
  const timeScore = clamp(metrics.elapsedTime / 180, 0, 1) * 25;
  const altitudeScore = clamp(metrics.maxAltitude / 5000, 0, 1) * 25;
  const smoothScore = clamp(35 - metrics.smoothnessPenalty / 40, 0, 35);
  const stallScore = clamp(15 - metrics.stallWarnings * 5, 0, 15);
  return clamp(timeScore + altitudeScore + smoothScore + stallScore, 0, 100);
}

export function scoreFlight(
  mission: Mission,
  state: FlightRuntimeState,
  metrics: FlightMetrics
): FlightScore {
  const failed = metrics.crashed || state.crashed || (!metrics.missionCompleted && mission.type !== "free-flight");
  const missionBonus = metrics.missionCompleted || mission.type === "free-flight" ? 8 : -16;
  let baseScore = 60;

  if (mission.type === "takeoff-training") {
    baseScore = takeoffScore(metrics, mission.targetHeading);
  }

  if (mission.type === "landing-training") {
    baseScore = landingScore(metrics);
  }

  if (mission.type === "free-flight") {
    baseScore = freeFlightScore(metrics);
  }

  if (mission.type === "route-challenge") {
    baseScore = (takeoffScore(metrics, mission.targetHeading) * 0.35) + (landingScore(metrics) * 0.45) + 20;
  }

  const stallPenalty = metrics.stallWarnings * 4;
  const hardLandingPenalty = metrics.hardLanding ? 12 : 0;
  const crashPenalty = failed ? 45 : 0;
  const totalScore = clamp(Math.round(baseScore + missionBonus - stallPenalty - hardLandingPenalty - crashPenalty), 0, 100);

  return {
    totalScore,
    rating: ratingForScore(totalScore, failed),
    flightTime: Math.round(metrics.elapsedTime),
    maxAltitude: Math.round(metrics.maxAltitude),
    maxSpeed: Math.round(metrics.maxSpeed),
    averageSpeed: Math.round(metrics.averageSpeed),
    landingVerticalSpeed: Math.round(metrics.landingVerticalSpeed),
    landingCenterlineOffset: Math.round(metrics.landingCenterlineOffset),
    touchdownDistance: Math.round(metrics.touchdownDistance),
    stallWarnings: metrics.stallWarnings,
    hardLanding: metrics.hardLanding,
    crashed: failed,
    missionCompleted: metrics.missionCompleted || mission.type === "free-flight"
  };
}
