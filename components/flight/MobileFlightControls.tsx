"use client";

import type { MutableRefObject } from "react";
import { Camera, CircleParking, Gauge, Pause, PlaneLanding } from "lucide-react";
import type { FlightControlInput, FlightRuntimeState } from "@/types/flight";
import { useTouchFlightControls } from "@/hooks/useTouchFlightControls";
import { safeRound } from "@/lib/math";

type MobileFlightControlsProps = {
  controlsRef: MutableRefObject<FlightControlInput>;
  state: FlightRuntimeState;
  onFlaps: () => void;
  onGear: () => void;
  onView: () => void;
  onPause: () => void;
};

export function MobileFlightControls({ controlsRef, state, onFlaps, onGear, onView, onPause }: MobileFlightControlsProps) {
  const { stick, bindStick, setThrottle, setBrake } = useTouchFlightControls(controlsRef);
  const buttonClass =
    "grid min-h-12 min-w-0 place-items-center overflow-hidden rounded-lg border border-sky-300/20 bg-slate-950/65 px-1 text-[10px] font-black text-slate-100 backdrop-blur";

  return (
    <div className="pointer-events-none absolute inset-0 z-30 md:hidden">
      <div
        className="pointer-events-auto absolute bottom-24 left-4 h-32 w-32 touch-none rounded-full border border-cyan-300/25 bg-slate-950/45 backdrop-blur"
        {...bindStick}
      >
        <div className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 bg-cyan-300/30" />
        <div className="absolute left-1/2 top-1/2 h-24 w-px -translate-y-1/2 bg-cyan-300/30" />
        <div
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/50 bg-cyan-300/20 text-xs font-black text-cyan-100"
          style={{ transform: `translate(calc(-50% + ${stick.x * 36}px), calc(-50% + ${stick.y * 36}px))` }}
        >
          yoke
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-24 right-4 flex h-44 w-16 flex-col items-center justify-between rounded-lg border border-cyan-300/25 bg-slate-950/45 p-2 backdrop-blur">
        <Gauge className="h-5 w-5 text-cyan-300" />
        <input
          type="range"
          min={0}
          max={100}
          value={safeRound(state.throttle * 100)}
          onChange={(event) => setThrottle(Number(event.target.value) / 100)}
          className="h-24 w-10 rotate-[-90deg] accent-cyan-300"
          aria-label="油门"
        />
        <span className="text-xs font-black text-cyan-100">{safeRound(state.throttle * 100)}%</span>
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-1/2 grid w-[340px] max-w-[calc(100vw-24px)] -translate-x-1/2 grid-cols-5 gap-1.5">
        <button type="button" className={buttonClass} onClick={onFlaps}>
          <PlaneLanding className="h-4 w-4" />
          F{state.flaps}
        </button>
        <button type="button" className={buttonClass} onClick={onGear}>
          <CircleParking className="h-4 w-4" />
          {state.gearDown ? "GEAR" : "UP"}
        </button>
        <button
          type="button"
          className={buttonClass}
          onPointerDown={() => setBrake(true)}
          onPointerUp={() => setBrake(false)}
          onPointerCancel={() => setBrake(false)}
        >
          B
          BRK
        </button>
        <button type="button" className={buttonClass} onClick={onView}>
          <Camera className="h-4 w-4" />
          VIEW
        </button>
        <button type="button" className={buttonClass} onClick={onPause}>
          <Pause className="h-4 w-4" />
          PAUSE
        </button>
      </div>
    </div>
  );
}
