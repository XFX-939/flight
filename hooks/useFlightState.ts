"use client";

import { useCallback, useRef } from "react";
import type { Aircraft, Airport, FlightMetrics, FlightRuntimeState, Mission } from "@/types/flight";
import { METER_PER_FT, MPS_PER_KNOT, degToRad, normalizeHeading } from "@/lib/math";

function createMetrics(): FlightMetrics {
  return {
    startedAt: performance.now(),
    elapsedTime: 0,
    maxAltitude: 0,
    maxSpeed: 0,
    averageSpeed: 0,
    speedSamples: 0,
    speedTotal: 0,
    stallWarnings: 0,
    lastStalled: false,
    hardLanding: false,
    crashed: false,
    missionCompleted: false,
    landingVerticalSpeed: 0,
    landingCenterlineOffset: 0,
    touchdownDistance: 0,
    touchdownRecorded: false,
    takeoffDistance: 0,
    takeoffRecorded: false,
    runwayOverrun: false,
    crosswindWarnings: 0,
    maxCrosswind: 0,
    airportDifficulty: 0,
    smoothnessPenalty: 0,
    headingDeviationTotal: 0,
    headingSamples: 0
  };
}

function createInitialState(aircraft: Aircraft, airport: Airport, mission: Mission): FlightRuntimeState {
  const landingStart = mission.type === "landing-training";
  const freeCruise = mission.type === "route-challenge";
  const startAltitudeFt = landingStart ? 3000 : freeCruise ? 900 : airport.elevation;
  const startAirspeed = landingStart
    ? Math.max(mission.targetSpeed, aircraft.stallSpeed + 35)
    : freeCruise
      ? aircraft.takeoffSpeed * 0.82
      : 0;
  const startZ = landingStart ? -3600 : -airport.runwayLength / 2 + 160;
  const startY = landingStart || freeCruise ? startAltitudeFt * METER_PER_FT : 1.2;
  const yaw = 0;

  return {
    position: { x: 0, y: startY, z: startZ },
    velocity: { x: 0, y: 0, z: startAirspeed * MPS_PER_KNOT },
    pitch: landingStart ? degToRad(-3) : 0,
    roll: 0,
    yaw,
    heading: normalizeHeading(airport.runwayHeading),
    throttle: landingStart ? 0.42 : freeCruise ? 0.7 : 0,
    airspeed: startAirspeed,
    altitude: startAltitudeFt,
    verticalSpeed: landingStart ? -450 : 0,
    flaps: landingStart ? 2 : 0,
    gearDown: true,
    brake: false,
    onGround: !landingStart && !freeCruise,
    stalled: false,
    crashed: false,
    landingQuality: "未着陆",
    runwayOffset: 0,
    runwayDistance: Math.abs(startZ),
    distanceToTarget: mission.type === "route-challenge" ? 9500 : Math.abs(startZ),
    missionCompleted: false,
    missionStatus: landingStart ? "稳定进近，保持跑道中心线" : "等待加油门开始滑跑",
    warning: "",
    flightTime: 0
  };
}

export function useFlightState(aircraft: Aircraft, airport: Airport, mission: Mission) {
  const stateRef = useRef<FlightRuntimeState>(createInitialState(aircraft, airport, mission));
  const metricsRef = useRef<FlightMetrics>(createMetrics());

  const resetFlightState = useCallback(() => {
    stateRef.current = createInitialState(aircraft, airport, mission);
    metricsRef.current = createMetrics();
  }, [aircraft, airport, mission]);

  return { stateRef, metricsRef, resetFlightState };
}
