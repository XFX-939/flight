"use client";

import { useMemo } from "react";
import type { QualitySetting } from "@/types/flight";

type TerrainProps = {
  quality: QualitySetting;
};

export function Terrain({ quality }: TerrainProps) {
  const mountains = useMemo(
    () =>
      Array.from({ length: quality === "low" ? 18 : 36 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        return {
          x: side * (760 + (index % 7) * 190),
          z: -5200 + index * 470,
          height: 140 + (index % 6) * 54,
          radius: 170 + (index % 5) * 32
        };
      }),
    [quality]
  );
  const fields = useMemo(
    () =>
      Array.from({ length: quality === "low" ? 16 : 34 }, (_, index) => ({
        x: -2600 + (index % 7) * 760,
        z: 1700 + Math.floor(index / 7) * 860,
        color: index % 3 === 0 ? "#1f3d25" : index % 3 === 1 ? "#203827" : "#17311f"
      })),
    [quality]
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 4200]} renderOrder={0}>
        <planeGeometry args={[18000, 26000]} />
        <meshStandardMaterial color="#17311f" roughness={0.92} depthWrite={false} />
      </mesh>
      {fields.map((field) => (
        <mesh key={`${field.x}-${field.z}`} rotation={[-Math.PI / 2, 0, 0]} position={[field.x, -0.155, field.z]} renderOrder={1}>
          <planeGeometry args={[520, 620]} />
          <meshStandardMaterial color={field.color} roughness={0.94} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1180, -0.08, 4100]} renderOrder={1}>
        <planeGeometry args={[760, 15400]} />
        <meshStandardMaterial color="#0e7490" roughness={0.48} metalness={0.08} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1600, -0.07, 6200]} renderOrder={1}>
        <planeGeometry args={[2600, 5200]} />
        <meshStandardMaterial color="#0f766e" roughness={0.52} metalness={0.05} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      {mountains.map((mountain) => (
        <mesh key={`${mountain.x}-${mountain.z}`} position={[mountain.x, mountain.height / 2 - 8, mountain.z]} castShadow receiveShadow>
          <coneGeometry args={[mountain.radius, mountain.height, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: quality === "low" ? 10 : 24 }, (_, index) => (
        <group key={index} position={[420 + (index % 6) * 52, 0, 980 + Math.floor(index / 6) * 78]}>
          <mesh position={[0, 11, 0]} castShadow>
            <boxGeometry args={[22, 22 + (index % 3) * 12, 22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.62} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
