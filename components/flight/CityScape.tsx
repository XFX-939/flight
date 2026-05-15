"use client";

import { useEffect, useMemo, useRef } from "react";
import { Object3D } from "three";
import type { InstancedMesh } from "three";
import type { Airport, AirportCityProfile, QualitySetting } from "@/types/flight";

type CityScapeProps = {
  airport: Airport;
  quality: QualitySetting;
};

type BuildingSpec = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
};

function cityCount(profile: AirportCityProfile, quality: QualitySetting): number {
  const density = profile.density === "high" ? 1 : profile.density === "medium" ? 0.66 : 0.38;
  const qualityScale = quality === "high" ? 88 : quality === "medium" ? 58 : 30;
  return Math.max(16, Math.round(qualityScale * density));
}

function seededNoise(index: number, salt: number): number {
  const value = Math.sin(index * 91.73 + salt * 37.19) * 10000;
  return value - Math.floor(value);
}

function createBuildings(profile: AirportCityProfile, quality: QualitySetting): BuildingSpec[] {
  const count = cityCount(profile, quality);
  const columns = Math.ceil(Math.sqrt(count * 1.35));
  const spacing = profile.density === "high" ? 54 : profile.density === "medium" ? 70 : 92;
  const buildings: BuildingSpec[] = [];

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const centeredColumn = column - columns / 2;
    const centeredRow = row - Math.ceil(count / columns) / 2;
    const jitterX = (seededNoise(index, 3) - 0.5) * spacing * 0.45;
    const jitterZ = (seededNoise(index, 7) - 0.5) * spacing * 0.45;
    const distanceFromCore = Math.hypot(centeredColumn, centeredRow);
    const coreBoost = Math.max(0, 1.5 - distanceFromCore * 0.16);
    const height = 28 + seededNoise(index, 11) * 84 + coreBoost * 72;

    buildings.push({
      x: centeredColumn * spacing + jitterX,
      z: centeredRow * spacing + jitterZ,
      width: 22 + seededNoise(index, 17) * 20,
      depth: 22 + seededNoise(index, 19) * 24,
      height
    });
  }

  return buildings;
}

export function CityScape({ airport, quality }: CityScapeProps) {
  const buildingsRef = useRef<InstancedMesh>(null);
  const profile = airport.cityProfile;
  const buildings = useMemo(
    () => (profile ? createBuildings(profile, quality) : []),
    [profile, quality]
  );
  const roads = useMemo(
    () => {
      if (!profile) {
        return [];
      }
      const roadCount = profile.density === "high" ? 7 : 5;
      return Array.from({ length: roadCount }, (_, index) => (index - (roadCount - 1) / 2) * 92);
    },
    [profile]
  );

  useEffect(() => {
    const mesh = buildingsRef.current;
    if (!mesh || !profile) {
      return;
    }

    const dummy = new Object3D();
    buildings.forEach((building, index) => {
      dummy.position.set(
        profile.center.x + building.x,
        building.height / 2,
        profile.center.z + building.z
      );
      dummy.scale.set(building.width, building.height, building.depth);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [buildings, profile]);

  if (!profile) {
    return null;
  }

  const waterX = profile.water === "bay" || profile.water === "coast" ? profile.center.x * 0.55 : profile.center.x - 240;
  const waterWidth = profile.water === "river" ? 130 : 980;
  const waterDepth = profile.water === "river" ? 2100 : 1550;

  return (
    <group>
      {profile.water !== "none" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[waterX, -0.04, profile.center.z - 90]} renderOrder={1}>
          <planeGeometry args={[waterWidth, waterDepth]} />
          <meshStandardMaterial color="#0e7490" roughness={0.46} metalness={0.08} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      ) : null}

      <group position={[profile.center.x, 0.14, profile.center.z]} renderOrder={2}>
        {roads.map((offset) => (
          <mesh key={`road-x-${offset}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0, 0]}>
            <planeGeometry args={[8, 920]} />
            <meshBasicMaterial color="#111827" transparent opacity={0.72} />
          </mesh>
        ))}
        {roads.map((offset) => (
          <mesh key={`road-z-${offset}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.002, offset]}>
            <planeGeometry args={[8, 920]} />
            <meshBasicMaterial color="#111827" transparent opacity={0.68} />
          </mesh>
        ))}
      </group>

      <instancedMesh ref={buildingsRef} args={[undefined, undefined, buildings.length]} castShadow={quality === "high"} receiveShadow={quality === "high"}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#26364d" roughness={0.72} metalness={0.12} emissive="#0f172a" emissiveIntensity={0.08} />
      </instancedMesh>

      <mesh position={[profile.center.x, 128, profile.center.z]} castShadow={quality === "high"}>
        <cylinderGeometry args={[9, 13, 220, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.34} metalness={0.28} emissive={profile.landmarkColor} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[profile.center.x, 253, profile.center.z]} castShadow={quality === "high"}>
        <coneGeometry args={[26, 48, 18]} />
        <meshStandardMaterial color={profile.landmarkColor} roughness={0.28} metalness={0.2} emissive={profile.landmarkColor} emissiveIntensity={0.22} />
      </mesh>
      <pointLight position={[profile.center.x, 210, profile.center.z]} color={profile.landmarkColor} intensity={quality === "high" ? 0.9 : 0.35} distance={quality === "low" ? 240 : 420} />
    </group>
  );
}
