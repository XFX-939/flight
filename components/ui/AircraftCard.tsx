"use client";

import { Check, Gauge, Plane, Play } from "lucide-react";
import Link from "next/link";
import type { Aircraft } from "@/types/flight";
import { setSelectedAircraftId } from "@/lib/flightStorage";

type AircraftCardProps = {
  aircraft: Aircraft;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function AircraftCard({ aircraft, selected = false, onSelect }: AircraftCardProps) {
  const handleSelect = () => {
    setSelectedAircraftId(aircraft.id);
    onSelect?.(aircraft.id);
  };

  return (
    <article className={`hud-panel rounded-lg p-5 ${selected ? "border-cyan-300/70" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{aircraft.type}</div>
          <h3 className="mt-2 text-xl font-black text-slate-50">{aircraft.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{aircraft.description}</p>
        </div>
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border"
          style={{ borderColor: aircraft.accentColor, backgroundColor: `${aircraft.accentColor}22` }}
        >
          <Plane className="h-7 w-7" style={{ color: aircraft.accentColor }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">起飞速度</span>
          <strong className="text-slate-100">{aircraft.takeoffSpeed} kt</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">失速速度</span>
          <strong className="text-slate-100">{aircraft.stallSpeed} kt</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">最大速度</span>
          <strong className="text-slate-100">{aircraft.maxSpeed} kt</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">爬升率</span>
          <strong className="text-slate-100">{aircraft.climbRate} ft/min</strong>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full border border-sky-300/25 px-3 py-1 text-sky-200">难度 {aircraft.difficulty}</span>
        <span className="rounded-full border border-sky-300/25 px-3 py-1 text-sky-200">稳定性 {aircraft.stability}</span>
        <span className="rounded-full border border-sky-300/25 px-3 py-1 text-sky-200">操控 {aircraft.handling}</span>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          className="button-secondary flex-1"
          onClick={handleSelect}
        >
          <Check className="h-4 w-4" />
          {selected ? "已选择" : "选择"}
        </button>
        <Link
          href="/play"
          className="button-primary flex-1"
          onClick={handleSelect}
        >
          <Play className="h-4 w-4" />
          试飞
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Gauge className="h-4 w-4 text-cyan-300" />
        适合：{aircraft.suitableMissions.join(" / ")}
      </div>
    </article>
  );
}
