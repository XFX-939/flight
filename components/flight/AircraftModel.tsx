"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Group, Mesh } from "three";
import type { Aircraft, FlightRuntimeState } from "@/types/flight";
import { lerp } from "@/lib/math";

type AircraftModelProps = {
  aircraft: Aircraft;
  stateRef: MutableRefObject<FlightRuntimeState>;
};

function modelScale(aircraft: Aircraft): number {
  if (aircraft.id === "a320-like") {
    return 2.1;
  }
  if (aircraft.id === "business-jet") {
    return 1.45;
  }
  return 1;
}

export function AircraftModel({ aircraft, stateRef }: AircraftModelProps) {
  const groupRef = useRef<Group>(null);
  const propellerRef = useRef<Mesh>(null);
  const scale = modelScale(aircraft);
  const isPropeller = aircraft.id === "cessna-172";
  const colors = useMemo(() => ({ main: aircraft.color, accent: aircraft.accentColor }), [aircraft]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const state = stateRef.current;
    group.position.set(state.position.x, state.position.y, state.position.z);
    group.rotation.order = "YXZ";
    group.rotation.y = lerp(group.rotation.y, state.yaw, delta * 8);
    group.rotation.x = lerp(group.rotation.x, state.pitch, delta * 8);
    group.rotation.z = lerp(group.rotation.z, -state.roll, delta * 8);

    if (propellerRef.current) {
      propellerRef.current.rotation.z += delta * (20 + state.throttle * 90);
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh castShadow>
        <capsuleGeometry args={[0.48, 5.4, 8, 18]} />
        <meshStandardMaterial color={colors.main} roughness={0.48} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.06, 1.2]} castShadow>
        <boxGeometry args={[8.2, 0.12, 0.72]} />
        <meshStandardMaterial color={colors.main} roughness={0.46} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.08, 1.1]} castShadow>
        <boxGeometry args={[8.8, 0.06, 0.22]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0.24, -2.65]} castShadow>
        <boxGeometry args={[3.0, 0.08, 0.62]} />
        <meshStandardMaterial color={colors.main} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.76, -2.9]} rotation={[0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 1.6, 0.82]} />
        <meshStandardMaterial color={colors.accent} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.18, 3.05]} castShadow>
        <coneGeometry args={[0.48, 1.1, 24]} />
        <meshStandardMaterial color={colors.accent} roughness={0.36} metalness={0.2} />
      </mesh>
      {isPropeller ? (
        <mesh ref={propellerRef} position={[0, 0.18, 3.68]}>
          <boxGeometry args={[0.12, 2.7, 0.05]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>
      ) : (
        <>
          <mesh position={[-2.6, -0.12, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.85, 18]} />
            <meshStandardMaterial color="#111827" metalness={0.28} roughness={0.38} />
          </mesh>
          <mesh position={[2.6, -0.12, 0.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.85, 18]} />
            <meshStandardMaterial color="#111827" metalness={0.28} roughness={0.38} />
          </mesh>
        </>
      )}
      <mesh position={[-0.8, -0.56, 1.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.18, 12]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      <mesh position={[0.8, -0.56, 1.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.18, 12]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      <mesh position={[0, -0.54, -1.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 12]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      <pointLight position={[-4.35, 0.1, 1.2]} color="#ef4444" intensity={0.8} distance={14} />
      <pointLight position={[4.35, 0.1, 1.2]} color="#22c55e" intensity={0.8} distance={14} />
    </group>
  );
}
