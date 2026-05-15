"use client";

import { useMemo } from "react";
import { CanvasTexture } from "three";
import type { Airport } from "@/types/flight";

type RunwayProps = {
  airport: Airport;
};

const RUNWAY_WIDTH = 62;

function createRunwayNumberTexture(heading: number): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f8fafc";
    context.font = "900 76px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const number = Math.max(1, Math.round(heading / 10)).toString().padStart(2, "0");
    context.fillText(number, canvas.width / 2, canvas.height / 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Runway({ airport }: RunwayProps) {
  const length = airport.runwayLength;
  const stripes = useMemo(
    () => Array.from({ length: Math.max(8, Math.floor(length / 180)) }, (_, index) => -length / 2 + 120 + index * 180),
    [length]
  );
  const lights = useMemo(
    () => Array.from({ length: Math.max(12, Math.floor(length / 150)) }, (_, index) => -length / 2 + index * 150),
    [length]
  );
  const numberTexture = useMemo(() => createRunwayNumberTexture(airport.runwayHeading), [airport.runwayHeading]);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[RUNWAY_WIDTH, length]} />
        <meshStandardMaterial color="#1f2937" roughness={0.82} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, -length / 2 + 34]}>
        <planeGeometry args={[RUNWAY_WIDTH - 8, 18]} />
        <meshStandardMaterial color="#e5e7eb" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, length / 2 - 34]}>
        <planeGeometry args={[RUNWAY_WIDTH - 8, 18]} />
        <meshStandardMaterial color="#e5e7eb" polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      {stripes.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.052, z]}>
          <planeGeometry args={[2.2, 42]} />
          <meshStandardMaterial
            color="#f8fafc"
            emissive="#dbeafe"
            emissiveIntensity={0.08}
            polygonOffset
            polygonOffsetFactor={-3}
            polygonOffsetUnits={-3}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-RUNWAY_WIDTH / 2 + 2.2, 0.055, 0]}>
        <planeGeometry args={[1.5, length]} />
        <meshStandardMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RUNWAY_WIDTH / 2 - 2.2, 0.055, 0]}>
        <planeGeometry args={[1.5, length]} />
        <meshStandardMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -length / 2 + 90]}>
        <planeGeometry args={[28, 15]} />
        <meshBasicMaterial map={numberTexture} transparent polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI]} position={[0, 0.06, length / 2 - 90]}>
        <planeGeometry args={[28, 15]} />
        <meshBasicMaterial map={numberTexture} transparent polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
      </mesh>
      {lights.map((z) => (
        <group key={z}>
          <mesh position={[-RUNWAY_WIDTH / 2 - 4, 0.3, z]}>
            <sphereGeometry args={[0.38, 10, 10]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[-RUNWAY_WIDTH / 2 - 4, 0.8, z]} color="#38bdf8" intensity={0.8} distance={22} />
          <mesh position={[RUNWAY_WIDTH / 2 + 4, 0.3, z]}>
            <sphereGeometry args={[0.38, 10, 10]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[RUNWAY_WIDTH / 2 + 4, 0.8, z]} color="#38bdf8" intensity={0.8} distance={22} />
        </group>
      ))}
    </group>
  );
}
