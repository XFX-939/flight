"use client";

import { useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
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
  color: string;
};

type RoadSpec = {
  key: string;
  x: number;
  z: number;
  width: number;
  length: number;
  rotation: number;
};

const CITY_WATER_Y = -0.24;
const CITY_SURFACE_Y = 0.26;
const CITY_DISTRICT_Y = -0.025;
const CITY_ROAD_Y = 0.035;

function cityCount(profile: AirportCityProfile, quality: QualitySetting): number {
  const density = profile.density === "high" ? 1 : profile.density === "medium" ? 0.72 : 0.44;
  const qualityScale = quality === "high" ? 260 : quality === "medium" ? 170 : 94;
  return Math.max(56, Math.round(qualityScale * density));
}

function seededNoise(index: number, salt: number): number {
  const value = Math.sin(index * 91.73 + salt * 37.19) * 10000;
  return value - Math.floor(value);
}

function createBuildings(profile: AirportCityProfile, quality: QualitySetting): BuildingSpec[] {
  const count = cityCount(profile, quality);
  const coreRadius = profile.density === "high" ? 640 : profile.density === "medium" ? 520 : 360;
  const midRadius = profile.density === "high" ? 1180 : profile.density === "medium" ? 950 : 680;
  const districts = [
    { x: 0, z: 0, radius: coreRadius, heightBoost: 1.15, compactness: 0.72 },
    { x: -midRadius * 0.58, z: midRadius * 0.34, radius: midRadius * 0.46, heightBoost: 0.64, compactness: 0.82 },
    { x: midRadius * 0.52, z: -midRadius * 0.28, radius: midRadius * 0.42, heightBoost: 0.72, compactness: 0.84 },
    { x: midRadius * 0.34, z: midRadius * 0.72, radius: midRadius * 0.38, heightBoost: 0.58, compactness: 0.88 },
    { x: -midRadius * 0.82, z: -midRadius * 0.54, radius: midRadius * 0.34, heightBoost: 0.46, compactness: 0.92 }
  ];
  const colors = ["#1e293b", "#26364d", "#334155", "#1f3a4d", "#243b53"];
  const buildings: BuildingSpec[] = [];

  for (let index = 0; index < count; index += 1) {
    const district = districts[Math.floor(seededNoise(index, 29) * districts.length)] ?? districts[0];
    const angle = seededNoise(index, 31) * Math.PI * 2;
    const radius = Math.sqrt(seededNoise(index, 37)) * district.radius;
    const gridSnap = profile.density === "high" ? 34 : profile.density === "medium" ? 48 : 66;
    const rawX = district.x + Math.cos(angle) * radius * district.compactness;
    const rawZ = district.z + Math.sin(angle) * radius;
    const x = Math.round(rawX / gridSnap) * gridSnap + (seededNoise(index, 41) - 0.5) * gridSnap * 0.36;
    const z = Math.round(rawZ / gridSnap) * gridSnap + (seededNoise(index, 43) - 0.5) * gridSnap * 0.36;
    const distanceFromCore = Math.hypot(x, z);
    const coreBoost = Math.max(0, 1 - distanceFromCore / (coreRadius * 1.42));
    const densityHeight = profile.density === "high" ? 1.18 : profile.density === "medium" ? 0.92 : 0.62;
    const height = 18 + seededNoise(index, 11) * 82 * densityHeight + coreBoost * 160 * district.heightBoost;

    buildings.push({
      x,
      z,
      width: 18 + seededNoise(index, 17) * (profile.density === "high" ? 34 : 26),
      depth: 18 + seededNoise(index, 19) * (profile.density === "high" ? 38 : 28),
      height,
      color: colors[Math.floor(seededNoise(index, 53) * colors.length)] ?? colors[0]
    });
  }

  const towerCount = quality === "low" ? 4 : profile.density === "high" ? 12 : 7;
  for (let index = 0; index < towerCount; index += 1) {
    const angle = (index / towerCount) * Math.PI * 2 + seededNoise(index, 61) * 0.3;
    const radius = 80 + seededNoise(index, 67) * (profile.density === "high" ? 320 : 220);
    buildings.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      width: 24 + seededNoise(index, 71) * 24,
      depth: 24 + seededNoise(index, 73) * 26,
      height: 150 + seededNoise(index, 79) * (profile.density === "high" ? 260 : 170),
      color: index % 3 === 0 ? "#0f172a" : "#164e63"
    });
  }

  return buildings;
}

function createRoads(profile: AirportCityProfile): RoadSpec[] {
  const roadCount = profile.density === "high" ? 13 : profile.density === "medium" ? 9 : 7;
  const spacing = profile.density === "high" ? 165 : profile.density === "medium" ? 190 : 220;
  const span = profile.density === "high" ? 2900 : profile.density === "medium" ? 2300 : 1700;
  const roads: RoadSpec[] = [];

  for (let index = 0; index < roadCount; index += 1) {
    const offset = (index - (roadCount - 1) / 2) * spacing;
    roads.push({ key: `north-south-${index}`, x: offset, z: 0, width: index % 4 === 0 ? 14 : 8, length: span, rotation: 0 });
    roads.push({ key: `east-west-${index}`, x: 0, z: offset, width: index % 4 === 0 ? 14 : 8, length: span, rotation: Math.PI / 2 });
  }

  const highwayLength = Math.max(1400, Math.hypot(profile.center.x, profile.center.z));
  const highwayAngle = Math.atan2(profile.center.x, profile.center.z);
  roads.push({
    key: "airport-city-highway-a",
    x: -profile.center.x / 2,
    z: -profile.center.z / 2,
    width: 18,
    length: highwayLength,
    rotation: highwayAngle
  });
  roads.push({
    key: "airport-city-highway-b",
    x: -profile.center.x / 2 + Math.cos(highwayAngle) * 24,
    z: -profile.center.z / 2 - Math.sin(highwayAngle) * 24,
    width: 8,
    length: highwayLength,
    rotation: highwayAngle
  });

  return roads;
}

export function CityScape({ airport, quality }: CityScapeProps) {
  const buildingsRef = useRef<InstancedMesh>(null);
  const profile = airport.cityProfile;
  const buildings = useMemo(
    () => (profile ? createBuildings(profile, quality) : []),
    [profile, quality]
  );
  const roads = useMemo(() => (profile ? createRoads(profile) : []), [profile]);

  useEffect(() => {
    const mesh = buildingsRef.current;
    if (!mesh || !profile) {
      return;
    }

    const dummy = new Object3D();
    const color = new Color();
    buildings.forEach((building, index) => {
      dummy.position.set(
        profile.center.x + building.x,
        building.height / 2,
        profile.center.z + building.z
      );
      dummy.scale.set(building.width, building.height, building.depth);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, color.set(building.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [buildings, profile]);

  if (!profile) {
    return null;
  }

  const waterX = profile.water === "bay" || profile.water === "coast" ? profile.center.x * 0.52 : profile.center.x - 330;
  const waterWidth = profile.water === "river" ? 190 : 2600;
  const waterDepth = profile.water === "river" ? 5200 : 4300;
  const districtSpan = profile.density === "high" ? 3200 : profile.density === "medium" ? 2600 : 1900;

  return (
    <group>
      {profile.water !== "none" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[waterX, CITY_WATER_Y, profile.center.z - 140]} renderOrder={2}>
          <planeGeometry args={[waterWidth, waterDepth]} />
          <meshStandardMaterial color="#0e7490" roughness={0.46} metalness={0.08} />
        </mesh>
      ) : null}

      <group position={[profile.center.x, CITY_SURFACE_Y, profile.center.z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CITY_DISTRICT_Y, 0]} renderOrder={3}>
          <planeGeometry args={[districtSpan, districtSpan]} />
          <meshBasicMaterial color="#0b1220" transparent opacity={0.24} depthWrite={false} />
        </mesh>
        {roads.map((road) => (
          <mesh key={road.key} rotation={[-Math.PI / 2, 0, road.rotation]} position={[road.x, CITY_ROAD_Y, road.z]} renderOrder={4}>
            <planeGeometry args={[road.width, road.length]} />
            <meshBasicMaterial color={road.width > 12 ? "#172033" : "#111827"} transparent opacity={road.width > 12 ? 0.82 : 0.68} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <instancedMesh ref={buildingsRef} args={[undefined, undefined, buildings.length]} castShadow={quality === "high"} receiveShadow={quality === "high"}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.68} metalness={0.15} emissive="#0f172a" emissiveIntensity={0.1} vertexColors />
      </instancedMesh>

      <mesh position={[profile.center.x, 128, profile.center.z]} castShadow={quality === "high"}>
        <cylinderGeometry args={[9, 13, 220, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.34} metalness={0.28} emissive={profile.landmarkColor} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[profile.center.x, 253, profile.center.z]} castShadow={quality === "high"}>
        <coneGeometry args={[26, 48, 18]} />
        <meshStandardMaterial color={profile.landmarkColor} roughness={0.28} metalness={0.2} emissive={profile.landmarkColor} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[profile.center.x - 86, 122, profile.center.z + 64]} castShadow={quality === "high"}>
        <boxGeometry args={[46, 244, 46]} />
        <meshStandardMaterial color="#0f172a" roughness={0.26} metalness={0.34} emissive={profile.landmarkColor} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[profile.center.x + 92, 100, profile.center.z - 74]} castShadow={quality === "high"}>
        <boxGeometry args={[54, 200, 54]} />
        <meshStandardMaterial color="#172554" roughness={0.32} metalness={0.28} emissive="#38bdf8" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[profile.center.x + 184, 26, profile.center.z + 164]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[82, 5, 12, 48]} />
        <meshStandardMaterial color={profile.landmarkColor} emissive={profile.landmarkColor} emissiveIntensity={0.2} roughness={0.36} />
      </mesh>
      {profile.water !== "none" ? (
        <group position={[profile.center.x - 250, 6, profile.center.z - 420]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[34, 520]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.12} />
          </mesh>
          {Array.from({ length: 6 }, (_, index) => (
            <mesh key={`bridge-pylon-${index}`} position={[0, 18, -220 + index * 88]}>
              <boxGeometry args={[10, 36, 10]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.42} />
            </mesh>
          ))}
        </group>
      ) : null}
      <mesh position={[profile.center.x, 620, profile.center.z]}>
        <cylinderGeometry args={[4, 18, 920, 24, 1, true]} />
        <meshBasicMaterial color={profile.landmarkColor} transparent opacity={quality === "low" ? 0.1 : 0.18} depthWrite={false} />
      </mesh>
      <mesh position={[profile.center.x, 6, profile.center.z]} rotation={[Math.PI / 2, 0, 0]} renderOrder={5}>
        <torusGeometry args={[180, 3, 8, 72]} />
        <meshBasicMaterial color={profile.landmarkColor} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <pointLight position={[profile.center.x, 210, profile.center.z]} color={profile.landmarkColor} intensity={quality === "high" ? 0.9 : 0.35} distance={quality === "low" ? 240 : 420} />
    </group>
  );
}
