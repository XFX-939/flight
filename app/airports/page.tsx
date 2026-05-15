"use client";

import { useEffect, useState } from "react";
import { airports } from "@/data/airports";
import { AirportCard } from "@/components/ui/AirportCard";
import { getSelectedAirportId } from "@/lib/flightStorage";

export default function AirportsPage() {
  const [selected, setSelected] = useState(airports[0].id);

  useEffect(() => {
    setSelected(getSelectedAirportId());
  }, []);

  return (
    <main className="page-shell py-12">
      <div className="max-w-3xl">
        <div className="section-kicker">Airports</div>
        <h1 className="section-title mt-2">机场与跑道</h1>
        <p className="mt-3 text-slate-400">
          选择机场会改变跑道长度、风况、地形复杂度和任务初始条件。
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {airports.map((item) => (
          <AirportCard key={item.id} airport={item} selected={item.id === selected} onSelect={setSelected} />
        ))}
      </div>
    </main>
  );
}
