"use client";

import { Check, ClipboardList, Play } from "lucide-react";
import Link from "next/link";
import type { Mission } from "@/types/flight";
import { setSelectedMissionId } from "@/lib/flightStorage";

type MissionCardProps = {
  mission: Mission;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function MissionCard({ mission, selected = false, onSelect }: MissionCardProps) {
  const handleSelect = () => {
    setSelectedMissionId(mission.id);
    onSelect?.(mission.id);
  };

  return (
    <article className={`hud-panel rounded-lg p-5 ${selected ? "border-cyan-300/70" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{mission.type}</div>
          <h3 className="mt-2 text-xl font-black text-slate-50">{mission.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{mission.description}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
          <ClipboardList className="h-7 w-7 text-cyan-300" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">目标高度</span>
          <strong className="text-slate-100">{mission.targetAltitude} ft</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">目标航向</span>
          <strong className="text-slate-100">{mission.targetHeading}°</strong>
        </div>
        <div className="rounded-lg bg-slate-950/40 p-3">
          <span className="block text-slate-500">目标速度</span>
          <strong className="text-slate-100">{mission.targetSpeed} kt</strong>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" className="button-secondary flex-1" onClick={handleSelect}>
          <Check className="h-4 w-4" />
          {selected ? "已选择" : "选择"}
        </button>
        <Link href="/play" className="button-primary flex-1" onClick={handleSelect}>
          <Play className="h-4 w-4" />
          开始
        </Link>
      </div>
    </article>
  );
}
