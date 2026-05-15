import type { Aircraft } from "@/types/flight";
import { clamp } from "@/lib/math";

export type AircraftPerformanceProfile = {
  pitchAuthority: number;
  rollAuthority: number;
  yawAuthority: number;
  pitchResponse: number;
  rollResponse: number;
  yawResponse: number;
  rollDamping: number;
  trimRate: number;
  thrustScale: number;
  dragScale: number;
  liftScale: number;
  rotationPitch: number;
  rotationRate: number;
  liftoffBoost: number;
  maxRoll: number;
  stallPitchThreshold: number;
  feelSummary: string;
  handlingHint: string;
};

export type AircraftFeelStat = {
  label: string;
  value: number;
  text: string;
};

const profiles: Record<string, AircraftPerformanceProfile> = {
  "cessna-172": {
    pitchAuthority: 0.74,
    rollAuthority: 1.02,
    yawAuthority: 0.42,
    pitchResponse: 4.4,
    rollResponse: 4.6,
    yawResponse: 2.5,
    rollDamping: 1.12,
    trimRate: 0.24,
    thrustScale: 0.98,
    dragScale: 1.06,
    liftScale: 1.08,
    rotationPitch: 0.26,
    rotationRate: 5.4,
    liftoffBoost: 4.1,
    maxRoll: 0.92,
    stallPitchThreshold: 0.14,
    feelSummary: "轻、稳、宽容",
    handlingHint: "低速容易起飞，拉杆和滚转响应线性，适合练习标准起落。"
  },
  "business-jet": {
    pitchAuthority: 0.66,
    rollAuthority: 1.55,
    yawAuthority: 0.5,
    pitchResponse: 4.9,
    rollResponse: 5.6,
    yawResponse: 2.9,
    rollDamping: 0.78,
    trimRate: 0.1,
    thrustScale: 1.42,
    dragScale: 0.82,
    liftScale: 0.98,
    rotationPitch: 0.2,
    rotationRate: 4.5,
    liftoffBoost: 5.5,
    maxRoll: 1.18,
    stallPitchThreshold: 0.1,
    feelSummary: "快、灵敏、惯性小",
    handlingHint: "加速和滚转都更快，进近速度高，过度拉升更容易触发失速警告。"
  },
  "a320-like": {
    pitchAuthority: 0.42,
    rollAuthority: 0.76,
    yawAuthority: 0.3,
    pitchResponse: 2.35,
    rollResponse: 2.65,
    yawResponse: 1.75,
    rollDamping: 1.22,
    trimRate: 0.3,
    thrustScale: 1.08,
    dragScale: 0.94,
    liftScale: 1.16,
    rotationPitch: 0.16,
    rotationRate: 2.7,
    liftoffBoost: 4.7,
    maxRoll: 0.74,
    stallPitchThreshold: 0.08,
    feelSummary: "重、稳、提前量大",
    handlingHint: "抬轮和转弯都更慢，起飞速度高，需要更长跑道和更早预判。"
  }
};

export function getAircraftPerformanceProfile(aircraft: Aircraft): AircraftPerformanceProfile {
  return profiles[aircraft.id] ?? profiles["cessna-172"];
}

function stat(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

export function getAircraftFeelStats(aircraft: Aircraft): AircraftFeelStat[] {
  const profile = getAircraftPerformanceProfile(aircraft);
  const stabilityBase = aircraft.stability === "高" ? 88 : aircraft.stability === "中等" ? 62 : 48;
  const controlValue = profile.rollAuthority * 42 + profile.pitchAuthority * 38 + profile.rollResponse * 4;
  const powerValue = aircraft.throttleResponse * 42 + profile.thrustScale * 35 + aircraft.climbRate / 85;
  const takeoffDemand = (aircraft.takeoffSpeed / 160) * 100;

  return [
    { label: "操控响应", value: stat(controlValue), text: aircraft.handling },
    { label: "稳定性", value: stat(stabilityBase), text: aircraft.stability },
    { label: "动力", value: stat(powerValue), text: `${aircraft.climbRate} ft/min` },
    { label: "起飞要求", value: stat(takeoffDemand), text: `${aircraft.takeoffSpeed} kt` }
  ];
}
