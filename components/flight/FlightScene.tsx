"use client";

import { Canvas } from "@react-three/fiber";
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
import { useAircraftPhysics } from "@/hooks/useAircraftPhysics";
import { AircraftModel } from "@/components/flight/AircraftModel";
import { AirportScene } from "@/components/flight/AirportScene";
import { CameraSystem } from "@/components/flight/CameraSystem";
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

export function FlightScene({
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
  const resolvedQuality = quality === "auto" ? "medium" : quality;

  return (
    <Canvas
      className="h-full w-full bg-[#07111F]"
      camera={{ position: [0, 18, -54], fov: 62, near: 0.5, far: 12000 }}
      dpr={resolvedQuality === "low" ? 1 : [1, 1.6]}
      shadows={resolvedQuality !== "low" ? "percentage" : false}
    >
      <color attach="background" args={["#07111F"]} />
      <fog attach="fog" args={["#07111F", 900, 8200]} />
      <ambientLight intensity={0.52} />
      <directionalLight position={[260, 540, -360]} intensity={1.15} castShadow={resolvedQuality !== "low"} />
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
      <Runway airport={airport} />
      <AirportScene airport={airport} />
      <Clouds quality={resolvedQuality} />
      <AircraftModel aircraft={aircraft} stateRef={stateRef} />
      <FlightEffects stateRef={stateRef} />
      <CameraSystem stateRef={stateRef} viewMode={viewMode} />
    </Canvas>
  );
}
