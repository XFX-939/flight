"use client";

import { Pause, RadioTower } from "lucide-react";
import type { Aircraft, Airport, FlightRuntimeState, Mission, ViewMode } from "@/types/flight";
import { safeRound } from "@/lib/math";
import { AttitudeIndicator } from "@/components/flight/AttitudeIndicator";
import { MissionPanel } from "@/components/flight/MissionPanel";

type FlightHUDProps = {
  state: FlightRuntimeState;
  aircraft: Aircraft;
  airport: Airport;
  mission: Mission;
  viewMode: ViewMode;
  onPause: () => void;
  onEndFlight: () => void;
};

const viewLabels: Record<ViewMode, string> = {
  thirdPerson: "追尾",
  cockpit: "驾驶舱",
  nose: "机头",
  free: "环视"
};

export function FlightHUD({ state, aircraft, airport, mission, viewMode, onPause, onEndFlight }: FlightHUDProps) {
  const metrics = [
    { label: "SPD", value: `${safeRound(state.airspeed)} kt` },
    { label: "ALT", value: `${safeRound(state.altitude)} ft` },
    { label: "HDG", value: `${safeRound(state.heading).toString().padStart(3, "0")}°` },
    { label: "V/S", value: `${safeRound(state.verticalSpeed)} fpm` },
    { label: "THR", value: `${safeRound(state.throttle * 100)}%` }
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="hud-panel pointer-events-auto flex max-w-[calc(100vw-5rem)] flex-wrap gap-2 rounded-lg p-2">
          {metrics.map((item) => (
            <div key={item.label} className="min-w-[74px] rounded-md bg-slate-950/45 px-3 py-2">
              <div className="text-[10px] font-black tracking-[0.16em] text-cyan-300">{item.label}</div>
              <div className="mt-1 text-sm font-black text-slate-50 sm:text-base">{item.value}</div>
            </div>
          ))}
        </div>
        <button type="button" className="pointer-events-auto grid h-12 w-12 place-items-center rounded-lg border border-sky-300/25 bg-slate-950/75 text-slate-100" onClick={onPause} aria-label="暂停">
          <Pause className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 hidden w-40 flex-col gap-3 md:flex">
        <AttitudeIndicator pitch={state.pitch} roll={state.roll} />
        <div className="hud-panel rounded-lg p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">襟翼</span>
            <strong>{state.flaps}/3</strong>
          </div>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-slate-400">起落架</span>
            <strong className={state.gearDown ? "text-emerald-300" : "text-amber-300"}>{state.gearDown ? "DOWN" : "UP"}</strong>
          </div>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-slate-400">视角</span>
            <strong>{viewLabels[viewMode]}</strong>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-24 hidden w-72 lg:block">
        <MissionPanel mission={mission} aircraft={aircraft} airport={airport} state={state} onEndFlight={onEndFlight} />
      </div>

      <div className="absolute bottom-20 left-1/2 flex w-[min(92vw,620px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 sm:bottom-6">
        {state.warning ? (
          <div className={`hud-panel rounded-lg px-4 py-2 text-sm font-black ${state.warning === "STALL" || state.warning === "CRASH" ? "text-red-300" : "text-amber-300"}`}>
            {state.warning}
          </div>
        ) : null}
        {!state.gearDown && state.altitude < 800 ? (
          <div className="hud-panel rounded-lg px-4 py-2 text-sm font-black text-amber-300">GEAR DOWN</div>
        ) : null}
        {state.flaps === 0 && state.altitude < 900 && !state.onGround ? (
          <div className="hud-panel rounded-lg px-4 py-2 text-sm font-black text-amber-300">FLAPS</div>
        ) : null}
        {Math.abs(state.runwayOffset) > 28 && state.altitude < 1200 ? (
          <div className="hud-panel rounded-lg px-4 py-2 text-sm font-black text-cyan-100">
            CENTERLINE {safeRound(state.runwayOffset)} m
          </div>
        ) : null}
        {state.landingQuality !== "未着陆" ? (
          <div className="hud-panel rounded-lg px-4 py-2 text-sm font-black text-emerald-300">
            {state.landingQuality}
          </div>
        ) : null}
      </div>

      <div className="hud-panel pointer-events-none absolute left-3 top-40 rounded-lg px-3 py-2 text-xs text-slate-300 md:hidden">
        <RadioTower className="mr-1 inline h-3 w-3 text-cyan-300" />
        {mission.name} · {airport.name}
      </div>
    </div>
  );
}
