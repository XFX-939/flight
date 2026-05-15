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
  const forwardRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());

  useFrame(({ camera, clock }, delta) => {
    const state = stateRef.current;
    const yaw = state.yaw;
    const forward = forwardRef.current.set(Math.sin(yaw), 0, Math.cos(yaw));
    const right = rightRef.current.set(Math.cos(yaw), 0, -Math.sin(yaw));
    const plane = targetRef.current.set(state.position.x, state.position.y, state.position.z);
    const desired = desiredRef.current;
    const lookAt = lookAtRef.current;

    if (viewMode === "thirdPerson") {
      desired.copy(plane).addScaledVector(forward, -46).addScaledVector(right, state.roll * -7);
      desired.y += 16;
      lookAt.copy(plane).addScaledVector(forward, 36);
      lookAt.y += 5;
    }

    if (viewMode === "cockpit") {
      desired.copy(plane).addScaledVector(forward, 5.2);
      desired.y += 2.3;
      lookAt.copy(plane).addScaledVector(forward, 130);
      lookAt.y += state.pitch * 70 + 2;
    }

    if (viewMode === "nose") {
      desired.copy(plane).addScaledVector(forward, 8.2);
      desired.y += 1.2;
      lookAt.copy(plane).addScaledVector(forward, 150);
      lookAt.y += state.pitch * 80;
    }

    if (viewMode === "free") {
      const orbit = clock.elapsedTime * 0.12;
      desired.set(plane.x + Math.sin(orbit) * 64, plane.y + 22, plane.z + Math.cos(orbit) * 64);
      lookAt.copy(plane);
      lookAt.y += 3;
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
