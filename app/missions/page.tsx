"use client";

import { useEffect, useState } from "react";
import { missions } from "@/data/missions";
import { MissionCard } from "@/components/ui/MissionCard";
import { getSelectedMissionId } from "@/lib/flightStorage";

export default function MissionsPage() {
  const [selected, setSelected] = useState(missions[0].id);

  useEffect(() => {
    setSelected(getSelectedMissionId());
  }, []);

  return (
    <main className="page-shell py-12">
      <div className="max-w-3xl">
        <div className="section-kicker">Mission Briefing</div>
        <h1 className="section-title mt-2">任务选择</h1>
        <p className="mt-3 text-slate-400">
          从起飞训练到航线挑战，每个任务都会根据速度、航向、着陆质量和飞行稳定性评分。
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {missions.map((item) => (
          <MissionCard key={item.id} mission={item} selected={item.id === selected} onSelect={setSelected} />
        ))}
      </div>
    </main>
  );
}
