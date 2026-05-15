"use client";

import { useEffect, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import type { FlightRecord } from "@/types/flight";
import { formatDuration } from "@/lib/math";
import { getFlightRecords } from "@/lib/flightStorage";

export function RecentFlightsPreview() {
  const [records, setRecords] = useState<FlightRecord[]>([]);

  useEffect(() => {
    setRecords(getFlightRecords().slice(0, 3));
  }, []);

  if (records.length === 0) {
    return (
      <div className="hud-panel rounded-lg p-5">
        <div className="flex items-center gap-3">
          <PlaneTakeoff className="h-5 w-5 text-cyan-300" />
          <h3 className="font-black text-slate-50">最近飞行记录</h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          还没有保存的飞行。完成一次起飞、降落或自由飞行后，这里会显示评分和降落质量。
        </p>
      </div>
    );
  }

  return (
    <div className="hud-panel rounded-lg p-5">
      <div className="flex items-center gap-3">
        <PlaneTakeoff className="h-5 w-5 text-cyan-300" />
        <h3 className="font-black text-slate-50">最近飞行记录</h3>
      </div>
      <div className="mt-4 grid gap-3">
        {records.map((record) => (
          <div key={record.id} className="rounded-lg border border-sky-300/10 bg-slate-950/35 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm text-slate-100">{record.missionName}</strong>
              <span className="rounded bg-cyan-300/10 px-2 py-1 text-xs font-black text-cyan-200">
                {record.score} / {record.rating}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {record.playerName} · {record.aircraftName} · {record.landingQuality} · {formatDuration(record.flightTime)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
