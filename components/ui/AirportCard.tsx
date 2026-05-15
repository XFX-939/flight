"use client";

import { Check, MapPinned, Play } from "lucide-react";
import Link from "next/link";
import type { Airport } from "@/types/flight";
import { setSelectedAirportId } from "@/lib/flightStorage";

type AirportCardProps = {
  airport: Airport;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function AirportCard({ airport, selected = false, onSelect }: AirportCardProps) {
  const handleSelect = () => {
    setSelectedAirportId(airport.id);
    onSelect?.(airport.id);
  };

  return (
    <article className={`hud-panel rounded-lg p-5 ${selected ? "border-cyan-300/70" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{airport.location}</div>
          <h3 className="mt-2 text-xl font-black text-slate-50">{airport.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{airport.description}</p>
          {airport.cityProfile ? (
            <p className="mt-2 text-xs font-bold text-cyan-200">
              城市目标：{airport.cityProfile.downtownName}
            </p>
          ) : null}
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
          <MapPinned className="h-7 w-7 text-cyan-300" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">跑道长度</span>
          <strong className="text-slate-100">{airport.runwayLength} m</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">跑道航向</span>
          <strong className="text-slate-100">{airport.runwayHeading}°</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">风向风速</span>
          <strong className="text-slate-100">{airport.windDirection}° / {airport.windSpeed} kt</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">能见度</span>
          <strong className="text-slate-100">{airport.visibility} mi</strong>
        </div>
        {airport.cityProfile ? (
          <div className="rounded-lg bg-slate-950/40 p-3">
            <span className="block text-slate-500">市中心</span>
            <strong className="text-slate-100">{airport.cityProfile.cityName}</strong>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" className="button-secondary flex-1" onClick={handleSelect}>
          <Check className="h-4 w-4" />
          {selected ? "已选择" : "选择"}
        </button>
        <Link href="/play" className="button-primary flex-1" onClick={handleSelect}>
          <Play className="h-4 w-4" />
          进入跑道
        </Link>
      </div>

      <p className="mt-4 text-xs font-bold text-amber-300">难度：{airport.difficulty}</p>
    </article>
  );
}
