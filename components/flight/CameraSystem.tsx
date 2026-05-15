"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import { Vector3 } from "three";
import type { FlightRuntimeState, ViewMode } from "@/types/flight";

type CameraSystemProps = {
  stateRef: MutableRefObject<FlightRuntimeState>;
  viewMode: ViewMode;
};

export function CameraSystem({ stateRef, viewMode }: CameraSystemProps) {
  const targetRef = useRef(new Vector3());
  const desiredRef = useRef(new Vector3());
  const lookAtRef = useRef(new Vector3());

  useFrame(({ camera, clock }, delta) => {
    const state = stateRef.current;
    const yaw = state.yaw;
    const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const plane = targetRef.current.set(state.position.x, state.position.y, state.position.z);
    const desired = desiredRef.current;
    const lookAt = lookAtRef.current;

    if (viewMode === "thirdPerson") {
      desired.copy(plane).addScaledVector(forward, -46).add(new Vector3(0, 16, 0)).addScaledVector(right, state.roll * -7);
      lookAt.copy(plane).addScaledVector(forward, 36).add(new Vector3(0, 5, 0));
    }

    if (viewMode === "cockpit") {
      desired.copy(plane).addScaledVector(forward, 5.2).add(new Vector3(0, 2.3, 0));
      lookAt.copy(plane).addScaledVector(forward, 130).add(new Vector3(0, state.pitch * 70 + 2, 0));
    }

    if (viewMode === "nose") {
      desired.copy(plane).addScaledVector(forward, 8.2).add(new Vector3(0, 1.2, 0));
      lookAt.copy(plane).addScaledVector(forward, 150).add(new Vector3(0, state.pitch * 80, 0));
    }

    if (viewMode === "free") {
      const orbit = clock.elapsedTime * 0.12;
      const orbitOffset = new Vector3(Math.sin(orbit) * 64, 22, Math.cos(orbit) * 64);
      desired.copy(plane).add(orbitOffset);
      lookAt.copy(plane).add(new Vector3(0, 3, 0));
    }

    if (state.landingQuality === "硬着陆" || state.crashed) {
      desired.y += Math.sin(clock.elapsedTime * 44) * 0.45;
    }

    camera.position.lerp(desired, Math.min(1, delta * 4.2));
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
  });

  return null;
}
