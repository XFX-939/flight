import type { Aircraft, Airport, FlightMetrics, FlightRating, FlightScore, FlightRuntimeState, Mission } from "@/types/flight";
import { getAirportGameplayProfile } from "@/lib/airportGameplay";
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

function landingScore(metrics: FlightMetrics, airport: Airport, aircraft: Aircraft): number {
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const targetTouchdown = clamp(airport.runwayLength * 0.22, 360, 820);
  const touchdownTolerance = clamp(airport.runwayLength / 58, 22, 58);
  const centerlineFactor = 1 + airportProfile.windDifficulty * 0.45 + airportProfile.visibilityDifficulty * 0.28;
  const verticalPenalty = clamp((metrics.landingVerticalSpeed - 220) / 8, 0, 45);
  const centerlinePenalty = clamp((metrics.landingCenterlineOffset / 1.5) * centerlineFactor, 0, 28);
  const touchdownPenalty = clamp(Math.abs(metrics.touchdownDistance - targetTouchdown) / touchdownTolerance, 0, 24);
  const overrunPenalty = metrics.runwayOverrun ? 26 : 0;
  return clamp(100 - verticalPenalty - centerlinePenalty - touchdownPenalty - overrunPenalty, 0, 100);
}

function takeoffScore(metrics: FlightMetrics, airport: Airport, aircraft: Aircraft): number {
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const runwayUse = metrics.takeoffDistance / Math.max(airport.runwayLength, 1);
  const takeoffDistancePenalty = clamp((runwayUse - 0.42) * 78, 0, 28);
  const averageHeadingError =
    metrics.headingSamples > 0 ? metrics.headingDeviationTotal / metrics.headingSamples : 0;
  const headingPenalty = clamp(averageHeadingError * (1.08 + airportProfile.windDifficulty * 0.52), 0, 28);
  const weatherPenalty = clamp(metrics.crosswindWarnings * 3 + airportProfile.visibilityDifficulty * 5, 0, 12);
  const stallPenalty = metrics.stallWarnings * 9;
  const smoothnessPenalty = clamp(metrics.smoothnessPenalty / 30, 0, 24);
  return clamp(100 - takeoffDistancePenalty - headingPenalty - weatherPenalty - stallPenalty - smoothnessPenalty, 0, 100);
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
  aircraft: Aircraft,
  airport: Airport,
  state: FlightRuntimeState,
  metrics: FlightMetrics
): FlightScore {
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const failed = metrics.crashed || state.crashed || (!metrics.missionCompleted && mission.type !== "free-flight");
  const challengeBonus = !failed && (metrics.missionCompleted || mission.type === "free-flight")
    ? Math.round(airportProfile.totalDifficulty * 6)
    : 0;
  const missionBonus = (metrics.missionCompleted || mission.type === "free-flight" ? 8 : -16) + challengeBonus;
  let baseScore = 60;

  if (mission.type === "takeoff-training") {
    baseScore = takeoffScore(metrics, airport, aircraft);
  }

  if (mission.type === "landing-training") {
    baseScore = landingScore(metrics, airport, aircraft);
  }

  if (mission.type === "free-flight") {
    baseScore = freeFlightScore(metrics);
  }

  if (mission.type === "route-challenge") {
    baseScore = (takeoffScore(metrics, airport, aircraft) * 0.35) + (landingScore(metrics, airport, aircraft) * 0.45) + 20;
  }

  const stallPenalty = metrics.stallWarnings * 4;
  const hardLandingPenalty = metrics.hardLanding ? 12 : 0;
  const overrunPenalty = metrics.runwayOverrun ? 18 : 0;
  const weatherPenalty = clamp(
    metrics.crosswindWarnings * 2 + airportProfile.visibilityDifficulty * 4 + Math.max(0, metrics.headingDeviationTotal / Math.max(1, metrics.headingSamples) - 16) * 0.45,
    0,
    16
  );
  const crashPenalty = failed ? 45 : 0;
  const totalScore = clamp(Math.round(baseScore + missionBonus - stallPenalty - hardLandingPenalty - overrunPenalty - weatherPenalty - crashPenalty), 0, 100);

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
    crosswindWarnings: metrics.crosswindWarnings,
    runwayOverrun: metrics.runwayOverrun,
    airportDifficulty: Math.round(airportProfile.totalDifficulty * 100),
    weatherPenalty: Math.round(weatherPenalty),
    hardLanding: metrics.hardLanding,
    crashed: failed,
    missionCompleted: metrics.missionCompleted || mission.type === "free-flight"
  };
}
