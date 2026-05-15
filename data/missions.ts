import { aircraft } from "@/data/aircraft";
import type { Mission, ScoringWeights } from "@/types/flight";

const baseWeights: ScoringWeights = {
  takeoffDistance: 12,
  climbSmoothness: 14,
  headingHold: 14,
  climbRate: 12,
  stallAvoidance: 18,
  touchdownVerticalSpeed: 18,
  touchdownZone: 14,
  centerline: 14,
  approachSpeed: 10,
  rollout: 10,
  flightTime: 10,
  maxAltitude: 10,
  smoothness: 12
};

export const missions: Mission[] = [
  {
    id: "takeoff-training",
    name: "Takeoff Training",
    type: "takeoff-training",
    description:
      "从跑道静止开始，加速到起飞速度，平稳拉升至 1500 ft，并保持跑道航向。",
    aircraftAllowed: aircraft.map((item) => item.id),
    airportId: "felix-international",
    targetAltitude: 1500,
    targetHeading: 0,
    targetSpeed: 90,
    scoringWeights: baseWeights
  },
  {
    id: "landing-training",
    name: "Landing Training",
    type: "landing-training",
    description:
      "从 3000 ft 进近开始，放襟翼和起落架，沿中心线在跑道前半段平稳接地。",
    aircraftAllowed: aircraft.map((item) => item.id),
    airportId: "felix-international",
    targetAltitude: 0,
    targetHeading: 0,
    targetSpeed: 80,
    scoringWeights: baseWeights
  },
  {
    id: "free-flight",
    name: "Free Flight",
    type: "free-flight",
    description:
      "从跑道起飞后自由飞向城市核心区，在海湾、河道、天际线和地标上空巡航。",
    aircraftAllowed: aircraft.map((item) => item.id),
    airportId: "felix-international",
    targetAltitude: 3200,
    targetHeading: 0,
    targetSpeed: 135,
    scoringWeights: baseWeights
  },
  {
    id: "route-challenge",
    name: "Route Challenge",
    type: "route-challenge",
    description:
      "从 Felix International 起飞，按目标航向前往 Bay City Airport，并完成稳定降落。",
    aircraftAllowed: aircraft.map((item) => item.id),
    airportId: "felix-international",
    targetAltitude: 4500,
    targetHeading: 24,
    targetSpeed: 180,
    scoringWeights: baseWeights
  }
];

export const defaultMission = missions[0];

export function getMissionById(id: string): Mission {
  return missions.find((item) => item.id === id) ?? defaultMission;
}
