import type { Aircraft } from "@/types/flight";

export const aircraft: Aircraft[] = [
  {
    id: "cessna-172",
    name: "Cessna 172",
    type: "单发螺旋桨教练机",
    difficulty: "简单",
    description:
      "稳定、宽容、响应线性，适合第一次完成起飞、巡航和目视降落训练。",
    maxSpeed: 140,
    takeoffSpeed: 60,
    stallSpeed: 45,
    climbRate: 700,
    stability: "高",
    handling: "中等",
    throttleResponse: 0.82,
    flapEffectiveness: 0.84,
    brakePower: 0.72,
    color: "#F8FAFC",
    accentColor: "#38BDF8",
    suitableMissions: ["takeoff-training", "landing-training", "free-flight"]
  },
  {
    id: "business-jet",
    name: "Business Jet",
    type: "小型公务机",
    difficulty: "中等",
    description:
      "速度快、爬升强，油门响应更直接，适合航线挑战和高速进近练习。",
    maxSpeed: 430,
    takeoffSpeed: 120,
    stallSpeed: 95,
    climbRate: 2500,
    stability: "中等",
    handling: "较灵敏",
    throttleResponse: 1,
    flapEffectiveness: 0.72,
    brakePower: 0.82,
    color: "#CBD5E1",
    accentColor: "#22D3EE",
    suitableMissions: ["route-challenge", "free-flight"]
  },
  {
    id: "a320-like",
    name: "A320-like Airliner",
    type: "简化民航客机",
    difficulty: "较难",
    description:
      "更重、更稳，转弯和俯仰需要提前量，适合稳定航线和精密降落。",
    maxSpeed: 470,
    takeoffSpeed: 145,
    stallSpeed: 115,
    climbRate: 2200,
    stability: "高",
    handling: "较重",
    throttleResponse: 0.68,
    flapEffectiveness: 0.92,
    brakePower: 0.9,
    color: "#E2E8F0",
    accentColor: "#60A5FA",
    suitableMissions: ["route-challenge", "landing-training"]
  }
];

export const defaultAircraft = aircraft[0];

export function getAircraftById(id: string): Aircraft {
  return aircraft.find((item) => item.id === id) ?? defaultAircraft;
}
