"use client";

import { useEffect, useState } from "react";
import type { FlightRecord } from "@/types/flight";
import { formatDuration } from "@/lib/math";
import { clearFlightRecords, getFlightRecords } from "@/lib/flightStorage";

export default function LogbookPage() {
  const [records, setRecords] = useState<FlightRecord[]>([]);

  useEffect(() => {
    setRecords(getFlightRecords());
  }, []);

  const handleClear = () => {
    clearFlightRecords();
    setRecords([]);
  };

  return (
    <main className="page-shell py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-3xl">
          <div className="section-kicker">Logbook</div>
          <h1 className="section-title mt-2">飞行日志</h1>
          <p className="mt-3 text-slate-400">记录任务、飞机、机场、评分、降落质量和完成时间。</p>
        </div>
        <button type="button" className="button-secondary" onClick={handleClear}>清空日志</button>
      </div>

      {records.length === 0 ? (
        <div className="hud-panel mt-8 rounded-lg p-8 text-center text-slate-400">
          日志为空。进入 `/play` 完成一次飞行后会自动保存。
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {records.map((record) => (
            <article key={record.id} className="hud-panel rounded-lg p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-50">{record.missionName}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {record.aircraftName} · {record.airportName} · {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <span className="rounded-lg bg-slate-950/40 px-3 py-2">评分 {record.score}</span>
                  <span className="rounded-lg bg-slate-950/40 px-3 py-2">评级 {record.rating}</span>
                  <span className="rounded-lg bg-slate-950/40 px-3 py-2">{record.landingQuality}</span>
                  <span className="rounded-lg bg-slate-950/40 px-3 py-2">{formatDuration(record.flightTime)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
