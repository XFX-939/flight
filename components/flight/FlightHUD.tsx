"use client";

import { AlertTriangle, CheckCircle2, Pause, RadioTower } from "lucide-react";
import type { Aircraft, Airport, FlightRuntimeState, Mission, ViewMode } from "@/types/flight";
import { getFlightAdvisories, type FlightAdvisorySeverity } from "@/lib/flightAdvisory";
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

const advisoryStyles: Record<FlightAdvisorySeverity, { shell: string; icon: string; text: string; label: string }> = {
  danger: {
    shell: "border-red-400/45 bg-red-950/45 shadow-red-950/30",
    icon: "bg-red-500/15 text-red-200 ring-red-300/30",
    text: "text-red-100",
    label: "text-red-200"
  },
  warning: {
    shell: "border-amber-300/45 bg-amber-950/35 shadow-amber-950/25",
    icon: "bg-amber-500/15 text-amber-200 ring-amber-200/30",
    text: "text-amber-50",
    label: "text-amber-200"
  },
  info: {
    shell: "border-cyan-300/35 bg-sky-950/45 shadow-cyan-950/20",
    icon: "bg-cyan-400/15 text-cyan-100 ring-cyan-200/25",
    text: "text-cyan-50",
    label: "text-cyan-200"
  },
  success: {
    shell: "border-emerald-300/35 bg-emerald-950/35 shadow-emerald-950/20",
    icon: "bg-emerald-400/15 text-emerald-100 ring-emerald-200/25",
    text: "text-emerald-50",
    label: "text-emerald-200"
  }
};

export function FlightHUD({ state, aircraft, airport, mission, viewMode, onPause, onEndFlight }: FlightHUDProps) {
  const metrics = [
    { label: "SPD", value: `${safeRound(state.airspeed)} kt` },
    { label: "ALT", value: `${safeRound(state.altitude)} ft` },
    { label: "HDG", value: `${safeRound(state.heading).toString().padStart(3, "0")}°` },
    { label: "V/S", value: `${safeRound(state.verticalSpeed)} fpm` },
    { label: "THR", value: `${safeRound(state.throttle * 100)}%` }
  ];
  const advisories = getFlightAdvisories(state, aircraft, mission);
  const primaryAdvisory = advisories[0];
  const primaryStyle = advisoryStyles[primaryAdvisory.severity];
  const AdvisoryIcon = primaryAdvisory.severity === "danger" || primaryAdvisory.severity === "warning" ? AlertTriangle : CheckCircle2;

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

      <div className="pointer-events-none absolute left-3 right-3 top-[7.75rem] md:left-1/2 md:right-auto md:top-24 md:w-[min(88vw,430px)] md:-translate-x-1/2">
        <div className={`hud-panel rounded-lg border p-3 shadow-2xl backdrop-blur-md ${primaryStyle.shell}`} aria-live="polite">
          <div className="flex items-start gap-3">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${primaryStyle.icon}`}>
              <AdvisoryIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className={`text-xs font-black uppercase tracking-[0.16em] ${primaryStyle.label}`}>HUD 建议</div>
                <div className="rounded-md bg-slate-950/45 px-2 py-1 text-[10px] font-black text-slate-100">{primaryAdvisory.value}</div>
              </div>
              <div className={`mt-1 text-sm font-black sm:text-base ${primaryStyle.text}`}>{primaryAdvisory.title}</div>
              <p className="mt-1 text-xs leading-5 text-slate-100/85 sm:text-sm">{primaryAdvisory.message}</p>
            </div>
          </div>

          {advisories.length > 1 ? (
            <div className="mt-3 hidden border-t border-white/10 pt-3 md:grid md:gap-2">
              {advisories.slice(1, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-950/35 px-3 py-2 text-xs">
                  <span className={advisoryStyles[item.severity].label}>{item.title}</span>
                  <span className="truncate text-right text-slate-200">{item.message}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
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

      <div className="hud-panel pointer-events-none absolute left-3 top-56 rounded-lg px-3 py-2 text-xs text-slate-300 md:hidden">
        <RadioTower className="mr-1 inline h-3 w-3 text-cyan-300" />
        {mission.name} · {airport.name}
      </div>
    </div>
  );
}
