"use client";

import type { MutableRefObject } from "react";
import { ArrowDown, ArrowUp, Camera, CircleParking, PlaneLanding } from "lucide-react";
import type { FlightControlInput, FlightRuntimeState } from "@/types/flight";

type DesktopFlightControlsProps = {
  controlsRef: MutableRefObject<FlightControlInput>;
  state: FlightRuntimeState;
  disabled: boolean;
  onFlaps: () => void;
  onGear: () => void;
  onView: () => void;
};

export function DesktopFlightControls({
  controlsRef,
  state,
  disabled,
  onFlaps,
  onGear,
  onView
}: DesktopFlightControlsProps) {
  const buttonClass =
    "grid min-h-12 min-w-[68px] place-items-center rounded-lg border border-sky-300/20 bg-slate-950/65 px-3 text-xs font-black text-slate-100 backdrop-blur transition hover:border-cyan-300/60 disabled:opacity-45";

  const setThrottleDelta = (value: number) => {
    if (!disabled) {
      controlsRef.current.useThrottleOverride = false;
      controlsRef.current.throttleDelta = value;
    }
  };

  const setBrake = (value: boolean) => {
    if (!disabled) {
      controlsRef.current.brake = value;
    }
  };

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 gap-2 md:flex">
      <button
        type="button"
        className={buttonClass}
        disabled={disabled}
        onPointerDown={() => setThrottleDelta(1)}
        onPointerUp={() => setThrottleDelta(0)}
        onPointerLeave={() => setThrottleDelta(0)}
        onPointerCancel={() => setThrottleDelta(0)}
      >
        <ArrowUp className="h-4 w-4 text-cyan-300" />
        THR+
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={disabled}
        onPointerDown={() => setThrottleDelta(-1)}
        onPointerUp={() => setThrottleDelta(0)}
        onPointerLeave={() => setThrottleDelta(0)}
        onPointerCancel={() => setThrottleDelta(0)}
      >
        <ArrowDown className="h-4 w-4 text-cyan-300" />
        THR-
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={disabled}
        onPointerDown={() => setBrake(true)}
        onPointerUp={() => setBrake(false)}
        onPointerLeave={() => setBrake(false)}
        onPointerCancel={() => setBrake(false)}
      >
        B
        BRK
      </button>
      <button type="button" className={buttonClass} disabled={disabled} onClick={onFlaps}>
        <PlaneLanding className="h-4 w-4 text-cyan-300" />
        F{state.flaps}
      </button>
      <button type="button" className={buttonClass} disabled={disabled} onClick={onGear}>
        <CircleParking className="h-4 w-4 text-cyan-300" />
        {state.gearDown ? "GEAR" : "UP"}
      </button>
      <button type="button" className={buttonClass} disabled={disabled} onClick={onView}>
        <Camera className="h-4 w-4 text-cyan-300" />
        VIEW
      </button>
    </div>
  );
}
