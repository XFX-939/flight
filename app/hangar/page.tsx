"use client";

import { useEffect, useState } from "react";
import { aircraft } from "@/data/aircraft";
import { AircraftCard } from "@/components/ui/AircraftCard";
import { getSelectedAircraftId } from "@/lib/flightStorage";

export default function HangarPage() {
  const [selected, setSelected] = useState(aircraft[0].id);

  useEffect(() => {
    setSelected(getSelectedAircraftId());
  }, []);

  return (
    <main className="page-shell py-12">
      <div className="max-w-3xl">
        <div className="section-kicker">Hangar</div>
        <h1 className="section-title mt-2">机库</h1>
        <p className="mt-3 text-slate-400">
          选择一架飞机进入飞行训练。不同飞机的油门响应、升力、刹车和姿态惯性会影响手感。
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {aircraft.map((item) => (
          <AircraftCard key={item.id} aircraft={item} selected={item.id === selected} onSelect={setSelected} />
        ))}
      </div>
    </main>
  );
}
