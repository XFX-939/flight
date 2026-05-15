"use client";

import { Canvas } from "@react-three/fiber";
import { memo } from "react";
import type { MutableRefObject } from "react";
import type {
  Aircraft,
  Airport,
  FlightControlInput,
  FlightMetrics,
  FlightRuntimeState,
  Mission,
  QualitySetting,
  ViewMode
} from "@/types/flight";
import { getAirportGameplayProfile } from "@/lib/airportGameplay";
import { useAircraftPhysics } from "@/hooks/useAircraftPhysics";
import { AircraftModel } from "@/components/flight/AircraftModel";
import { AirportScene } from "@/components/flight/AirportScene";
import { CameraSystem } from "@/components/flight/CameraSystem";
import { CityScape } from "@/components/flight/CityScape";
import { Clouds } from "@/components/flight/Clouds";
import { FlightEffects } from "@/components/flight/FlightEffects";
import { Runway } from "@/components/flight/Runway";
import { Terrain } from "@/components/flight/Terrain";

type FlightSceneProps = {
  aircraft: Aircraft;
  airport: Airport;
  mission: Mission;
  quality: QualitySetting;
  viewMode: ViewMode;
  active: boolean;
  stateRef: MutableRefObject<FlightRuntimeState>;
  metricsRef: MutableRefObject<FlightMetrics>;
  controlsRef: MutableRefObject<FlightControlInput>;
};

function PhysicsLoop(props: Omit<FlightSceneProps, "quality" | "viewMode">) {
  useAircraftPhysics(props);
  return null;
}

function resolveQuality(quality: QualitySetting): Exclude<QualitySetting, "auto"> {
  if (quality !== "auto") {
    return quality;
  }
  if (typeof window !== "undefined" && window.innerWidth < 760) {
    return "low";
  }
  return "medium";
}

function FlightSceneComponent({
  aircraft,
  airport,
  mission,
  quality,
  viewMode,
  active,
  stateRef,
  metricsRef,
  controlsRef
}: FlightSceneProps) {
  const resolvedQuality = resolveQuality(quality);
  const shadowsEnabled = resolvedQuality === "high";
  const dpr: number | [number, number] = resolvedQuality === "high" ? [1, 1.35] : resolvedQuality === "medium" ? 1 : 0.9;
  const airportProfile = getAirportGameplayProfile(airport, aircraft);

  return (
    <Canvas
      className="h-full w-full bg-[#07111F]"
      camera={{ position: [0, 18, -54], fov: 62, near: 1, far: 18000 }}
      dpr={dpr}
      shadows={shadowsEnabled ? "percentage" : false}
      performance={{ min: 0.65 }}
    >
      <color attach="background" args={["#07111F"]} />
      <fog attach="fog" args={["#07111F", airportProfile.fogNear, airportProfile.fogFar]} />
      <ambientLight intensity={airport.visibility < 7 ? 0.44 : 0.52} />
      <directionalLight position={[260, 540, -360]} intensity={airport.visibility < 7 ? 0.92 : 1.15} castShadow={shadowsEnabled} />
      <hemisphereLight args={["#7dd3fc", "#0f172a", 0.72]} />
      <PhysicsLoop
        aircraft={aircraft}
        airport={airport}
        mission={mission}
        active={active}
        stateRef={stateRef}
        metricsRef={metricsRef}
        controlsRef={controlsRef}
      />
      <Terrain quality={resolvedQuality} />
      <CityScape airport={airport} quality={resolvedQuality} />
      <Runway airport={airport} quality={resolvedQuality} />
      <AirportScene airport={airport} />
      <Clouds airport={airport} quality={resolvedQuality} />
      <AircraftModel aircraft={aircraft} stateRef={stateRef} />
      <FlightEffects stateRef={stateRef} />
      <CameraSystem stateRef={stateRef} viewMode={viewMode} />
    </Canvas>
  );
}

export const FlightScene = memo(FlightSceneComponent);
