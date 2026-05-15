"use client";

import { useMemo } from "react";
import type { QualitySetting } from "@/types/flight";

type TerrainProps = {
  quality: QualitySetting;
};

export function Terrain({ quality }: TerrainProps) {
  const mountains = useMemo(
    () =>
      Array.from({ length: quality === "low" ? 12 : 24 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        return {
          x: side * (520 + (index % 6) * 120),
          z: -3200 + index * 360,
          height: 120 + (index % 5) * 45,
          radius: 130 + (index % 4) * 24
        };
      }),
    [quality]
  );

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 1800]}>
        <planeGeometry args={[9000, 13000]} />
        <meshStandardMaterial color="#17311f" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-840, 0.01, 2300]}>
        <planeGeometry args={[620, 8600]} />
        <meshStandardMaterial color="#0e7490" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[980, 0.012, 4400]}>
        <planeGeometry args={[1600, 3100]} />
        <meshStandardMaterial color="#0f766e" roughness={0.52} metalness={0.05} />
      </mesh>
      {mountains.map((mountain) => (
        <mesh key={`${mountain.x}-${mountain.z}`} position={[mountain.x, mountain.height / 2 - 8, mountain.z]} castShadow receiveShadow>
          <coneGeometry args={[mountain.radius, mountain.height, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: quality === "low" ? 8 : 18 }, (_, index) => (
        <group key={index} position={[360 + (index % 5) * 42, 0, 900 + Math.floor(index / 5) * 64]}>
          <mesh position={[0, 11, 0]} castShadow>
            <boxGeometry args={[22, 22 + (index % 3) * 12, 22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.62} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
