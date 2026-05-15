"use client";

import type { Airport } from "@/types/flight";

type AirportSceneProps = {
  airport: Airport;
};

export function AirportScene({ airport }: AirportSceneProps) {
  const apronZ = -airport.runwayLength / 2 + 420;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[112, 0.014, apronZ]}>
        <planeGeometry args={[140, 180]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[62, 0.016, apronZ]}>
        <planeGeometry args={[18, 460]} />
        <meshStandardMaterial color="#293548" roughness={0.8} />
      </mesh>
      <mesh position={[160, 14, apronZ - 20]} castShadow>
        <boxGeometry args={[74, 28, 44]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[160, 31, apronZ - 20]} castShadow>
        <boxGeometry args={[78, 7, 48]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[92, 11, apronZ + 76]} castShadow>
        <boxGeometry args={[58, 22, 34]} />
        <meshStandardMaterial color="#1e293b" roughness={0.56} />
      </mesh>
      <mesh position={[245, 18, apronZ + 58]} castShadow>
        <cylinderGeometry args={[8, 10, 36, 18]} />
        <meshStandardMaterial color="#475569" roughness={0.46} />
      </mesh>
      <mesh position={[245, 40, apronZ + 58]} castShadow>
        <boxGeometry args={[28, 16, 28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.24} />
      </mesh>
      <pointLight position={[245, 52, apronZ + 58]} color="#22d3ee" intensity={1.3} distance={180} />
      <mesh position={[110, 2, apronZ - 75]} castShadow>
        <boxGeometry args={[18, 4, 18]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[136, 2, apronZ - 75]} castShadow>
        <boxGeometry args={[18, 4, 18]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
}
