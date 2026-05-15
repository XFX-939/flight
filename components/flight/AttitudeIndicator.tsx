"use client";

import { radToDeg } from "@/lib/math";

type AttitudeIndicatorProps = {
  pitch: number;
  roll: number;
};

export function AttitudeIndicator({ pitch, roll }: AttitudeIndicatorProps) {
  const pitchDeg = radToDeg(pitch);
  const rollDeg = radToDeg(roll);

  return (
    <div className="relative h-32 w-32 overflow-hidden rounded-full border border-cyan-300/35 bg-slate-950/70 shadow-hud">
      <div
        className="absolute inset-[-45%] transition-transform duration-100"
        style={{
          transform: `rotate(${-rollDeg}deg) translateY(${pitchDeg * 0.65}px)`
        }}
      >
        <div className="h-1/2 bg-sky-500/35" />
        <div className="h-1/2 bg-amber-700/35" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 bg-cyan-200" />
      <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-cyan-100">
        R {Math.round(rollDeg)}° · P {Math.round(pitchDeg)}°
      </div>
    </div>
  );
}
