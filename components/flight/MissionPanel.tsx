"use client";

import { Flag, MapPin, Square, Wind } from "lucide-react";
import type { Aircraft, Airport, FlightRuntimeState, Mission } from "@/types/flight";
import { getAirportGameplayProfile, getMissionTargetHeading } from "@/lib/airportGameplay";
import { formatDuration, safeRound } from "@/lib/math";

type MissionPanelProps = {
  mission: Mission;
  aircraft: Aircraft;
  airport: Airport;
  state: FlightRuntimeState;
  onEndFlight: () => void;
};

export function MissionPanel({ mission, aircraft, airport, state, onEndFlight }: MissionPanelProps) {
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const targetHeading = getMissionTargetHeading(mission, airport);

  return (
    <aside className="hud-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Mission</div>
          <h2 className="mt-1 text-base font-black text-slate-50">{mission.name}</h2>
        </div>
        <Flag className="h-5 w-5 text-cyan-300" />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">{state.missionStatus}</p>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/45 px-3 py-2">
          <span className="text-slate-400">目标高度</span>
          <strong>{mission.targetAltitude} ft</strong>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/45 px-3 py-2">
          <span className="text-slate-400">目标航向</span>
          <strong>{targetHeading}°</strong>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/45 px-3 py-2">
          <span className="text-slate-400">目标速度</span>
          <strong>{mission.targetSpeed} kt</strong>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-950/45 px-3 py-2">
          <span className="text-slate-400">目标距离</span>
          <strong>{safeRound(state.distanceToTarget)} m</strong>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Square className="h-3 w-3 text-cyan-300" />
          {aircraft.name}
        </div>
        <div className="pl-5 text-slate-500">
          起飞 {aircraft.takeoffSpeed} kt · 失速 {aircraft.stallSpeed} kt · 操控 {aircraft.handling}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-cyan-300" />
          {airport.name}
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-3 w-3 text-amber-300" />
          侧风 {safeRound(airportProfile.wind.crosswindKnots)} kt · 能见度 {airport.visibility} mi
        </div>
        <div className="pl-5 text-slate-500">
          {airportProfile.challengeLabel} · 抬轮 {airportProfile.requiredTakeoffSpeed} kt · 跑道余量 {safeRound(airportProfile.runwayMarginMeters)} m
        </div>
        <div>飞行时间 {formatDuration(state.flightTime)}</div>
      </div>

      <button type="button" className="button-secondary mt-4 w-full" onClick={onEndFlight}>
        结束并评分
      </button>
    </aside>
  );
}
