"use client";

import { useMemo } from "react";
import type { QualitySetting } from "@/types/flight";

type CloudsProps = {
  quality: QualitySetting;
};

export function Clouds({ quality }: CloudsProps) {
  const clouds = useMemo(
    () =>
      Array.from({ length: quality === "low" ? 10 : quality === "medium" ? 18 : 28 }, (_, index) => ({
        x: -900 + (index % 7) * 300,
        y: 260 + (index % 5) * 90,
        z: -1800 + Math.floor(index / 7) * 900,
        scale: 0.8 + (index % 4) * 0.2
      })),
    [quality]
  );

  return (
    <group>
      {clouds.map((cloud, index) => (
        <group key={index} position={[cloud.x, cloud.y, cloud.z]} scale={cloud.scale}>
          <mesh>
            <sphereGeometry args={[42, 16, 12]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.28} roughness={0.9} />
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
