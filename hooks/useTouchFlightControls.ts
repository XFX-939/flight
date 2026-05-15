"use client";

import { useCallback, useState } from "react";
import type { MutableRefObject, PointerEvent } from "react";
import type { FlightControlInput } from "@/types/flight";
import { clamp } from "@/lib/math";

export function useTouchFlightControls(controlsRef: MutableRefObject<FlightControlInput>) {
  const [stick, setStick] = useState({ x: 0, y: 0, active: false });

  const updateStick = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = clamp((event.clientX - centerX) / (rect.width / 2), -1, 1);
      const y = clamp((event.clientY - centerY) / (rect.height / 2), -1, 1);
      controlsRef.current.roll = -x;
      controlsRef.current.pitch = -y;
      setStick({ x, y, active: true });
    },
    [controlsRef]
  );

  const bindStick = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      updateStick(event);
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        updateStick(event);
      }
    },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.releasePointerCapture(event.pointerId);
      controlsRef.current.pitch = 0;
      controlsRef.current.roll = 0;
      setStick({ x: 0, y: 0, active: false });
    },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      controlsRef.current.pitch = 0;
      controlsRef.current.roll = 0;
      setStick({ x: 0, y: 0, active: false });
    }
  };

  const setThrottle = useCallback(
    (value: number) => {
      controlsRef.current.useThrottleOverride = true;
      controlsRef.current.throttleOverride = clamp(value, 0, 1);
    },
    [controlsRef]
  );

  const setBrake = useCallback(
    (active: boolean) => {
      controlsRef.current.brake = active;
    },
    [controlsRef]
  );

  return { stick, bindStick, setThrottle, setBrake };
}
