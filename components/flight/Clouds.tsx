"use client";

import { useMemo } from "react";
import type { Airport, QualitySetting } from "@/types/flight";

type CloudsProps = {
  airport: Airport;
  quality: QualitySetting;
};

export function Clouds({ airport, quality }: CloudsProps) {
  const visibility = Math.max(1, Number.isFinite(airport.visibility) ? airport.visibility : 10);
  const lowVisibility = visibility < 7;
  const clouds = useMemo(
    () =>
      Array.from({ length: quality === "low" ? 6 : quality === "medium" ? 12 : 20 }, (_, index) => ({
        x: -900 + (index % 7) * 300,
        y: (lowVisibility ? 170 : 260) + (index % 5) * (lowVisibility ? 66 : 90),
        z: -1800 + Math.floor(index / 7) * 900,
        scale: (lowVisibility ? 1.05 : 0.8) + (index % 4) * 0.2
      })),
    [lowVisibility, quality]
  );
  const cloudOpacity = lowVisibility ? 0.34 : 0.28;

  return (
    <group>
      {clouds.map((cloud, index) => (
        <group key={index} position={[cloud.x, cloud.y, cloud.z]} scale={cloud.scale}>
          <mesh>
            <sphereGeometry args={[42, 16, 12]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={cloudOpacity} roughness={0.9} />
          </mesh>
          <mesh position={[36, 4, 4]}>
            <sphereGeometry args={[34, 16, 12]} />
            <meshStandardMaterial color="#dbeafe" transparent opacity={0.24} roughness={0.9} />
          </mesh>
          <mesh position={[-38, -2, -10]}>
            <sphereGeometry args={[28, 16, 12]} />
            <meshStandardMaterial color="#f8fafc" transparent opacity={0.22} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
