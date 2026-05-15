"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { FlightControlInput } from "@/types/flight";

type KeyboardOptions = {
  enabled: boolean;
  onFlaps: () => void;
  onGear: () => void;
  onView: () => void;
  onPause: () => void;
};

export function useKeyboardFlightControls(
  controlsRef: MutableRefObject<FlightControlInput>,
  options: KeyboardOptions
) {
  const pressedRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    function refreshInput() {
      const pressed = pressedRef.current;
      const enabled = optionsRef.current.enabled;

      controlsRef.current.pitch = enabled
        ? Number(pressed.has("KeyS") || pressed.has("ArrowDown")) -
          Number(pressed.has("KeyW") || pressed.has("ArrowUp"))
        : 0;
      controlsRef.current.roll = enabled
        ? Number(pressed.has("KeyD") || pressed.has("ArrowRight")) -
          Number(pressed.has("KeyA") || pressed.has("ArrowLeft"))
        : 0;
      controlsRef.current.yaw = enabled ? Number(pressed.has("KeyE")) - Number(pressed.has("KeyQ")) : 0;
      controlsRef.current.throttleDelta = enabled ? Number(pressed.has("ShiftLeft") || pressed.has("ShiftRight")) - Number(pressed.has("ControlLeft") || pressed.has("ControlRight")) : 0;
      controlsRef.current.brake = enabled && pressed.has("KeyB");
    }

    function handleKeyDown(event: KeyboardEvent) {
      const controlsDisabled = !optionsRef.current.enabled;
      const code = event.code;

      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "KeyB", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
        event.preventDefault();
      }

      if (event.repeat) {
        pressedRef.current.add(code);
        refreshInput();
        return;
      }

      if ((code === "Escape" || code === "KeyP") && !event.repeat) {
        event.preventDefault();
        optionsRef.current.onPause();
        return;
      }

      if (controlsDisabled) {
        return;
      }

      pressedRef.current.add(code);

      if (code === "KeyF") {
        event.preventDefault();
        optionsRef.current.onFlaps();
      }

      if (code === "KeyG") {
        event.preventDefault();
        optionsRef.current.onGear();
      }

      if (code === "KeyV") {
        event.preventDefault();
        optionsRef.current.onView();
      }

      refreshInput();
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedRef.current.delete(event.code);
      refreshInput();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      pressedRef.current.clear();
      refreshInput();
    };
  }, [controlsRef]);
}
