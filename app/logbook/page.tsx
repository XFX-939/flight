"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, Sparkles, Target } from "lucide-react";
import type { FlightRecord } from "@/types/flight";
import { getRecordDebrief } from "@/lib/flightDebrief";
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
          <p className="mt-3 text-slate-400">记录任务、飞机、机场、评分、降落质量，并生成每次飞行的教官式反馈。</p>
        </div>
        <button type="button" className="button-secondary" onClick={handleClear}>清空日志</button>
      </div>

      {records.length === 0 ? (
        <div className="hud-panel mt-8 rounded-lg p-8 text-center text-slate-400">
          日志为空。进入 `/play` 完成一次飞行后会自动保存。
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {records.map((record) => {
            const debrief = getRecordDebrief(record);
            const toneClass =
              debrief.tone === "failed"
                ? "border-red-300/25 bg-red-500/10"
                : debrief.tone === "success"
                  ? "border-emerald-300/25 bg-emerald-400/10"
                  : "border-cyan-300/20 bg-cyan-300/10";

            return (
              <article key={record.id} className="hud-panel rounded-lg p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <h3 className="text-lg font-black text-slate-50">{record.missionName}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {record.playerName} · {record.aircraftName} · {record.airportName} · {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <span className="rounded-lg bg-slate-950/40 px-3 py-2">评分 {record.score}</span>
                    <span className="rounded-lg bg-slate-950/40 px-3 py-2">评级 {record.rating}</span>
                    <span className="rounded-lg bg-slate-950/40 px-3 py-2">{record.landingQuality}</span>
                    <span className="rounded-lg bg-slate-950/40 px-3 py-2">{formatDuration(record.flightTime)}</span>
                  </div>
                </div>

                <section className={`mt-5 rounded-lg border p-4 ${toneClass}`}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-slate-950/40 text-cyan-200">
                      <HeartHandshake className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-50">{debrief.title}</h4>
                      <p className="mt-1 text-sm font-bold text-cyan-100">{debrief.subtitle}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{debrief.summary}</p>
                      <p className="mt-2 text-sm leading-6 text-cyan-50">{debrief.encouragement}</p>
                    </div>
                  </div>
                </section>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <section className="rounded-lg border border-emerald-300/15 bg-slate-950/35 p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-emerald-200">
                      <Sparkles className="h-4 w-4" />
                      亮点
                    </div>
                    <div className="mt-3 grid gap-2">
                      {debrief.highlights.map((item) => (
                        <p key={item} className="rounded-md bg-slate-950/40 px-3 py-2 text-sm leading-6 text-slate-300">{item}</p>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-lg border border-amber-300/15 bg-slate-950/35 p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-amber-200">
                      <Target className="h-4 w-4" />
                      反馈
                    </div>
                    <div className="mt-3 grid gap-2">
                      {debrief.improvements.map((item) => (
                        <p key={item} className="rounded-md bg-slate-950/40 px-3 py-2 text-sm leading-6 text-slate-300">{item}</p>
                      ))}
                    </div>
                  </section>
                </div>

                <p className="mt-3 rounded-lg border border-cyan-300/15 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-cyan-50">
                  {debrief.nextFocus}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
