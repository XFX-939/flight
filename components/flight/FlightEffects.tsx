"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";
import type { FlightRuntimeState } from "@/types/flight";

type FlightEffectsProps = {
  stateRef: MutableRefObject<FlightRuntimeState>;
};

export function FlightEffects({ stateRef }: FlightEffectsProps) {
  const smokeRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const smoke = smokeRef.current;
    if (!smoke) {
      return;
    }
    const state = stateRef.current;
    const visible = state.onGround && state.landingQuality !== "未着陆" && state.airspeed > 12;
    smoke.visible = visible;
    smoke.position.set(state.position.x, 0.6, state.position.z - 8);
    smoke.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.08);
  });

  return (
    <group ref={smokeRef} visible={false}>
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[2.4, 12, 8]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.28} />
      </mesh>
      <mesh position={[2, 0.2, -1]}>
        <sphereGeometry args={[2.8, 12, 8]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 0.5, -3]}>
        <sphereGeometry args={[3.2, 12, 8]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
