"use client";

import { useEffect, useMemo, useState } from "react";
import { aircraft } from "@/data/aircraft";
import { missions } from "@/data/missions";
import type { FlightRecord } from "@/types/flight";
import { formatDuration } from "@/lib/math";
import { getLeaderboardRecords } from "@/lib/flightStorage";

export default function LeaderboardPage() {
  const [missionId, setMissionId] = useState("all");
  const [aircraftId, setAircraftId] = useState("all");
  const [records, setRecords] = useState<FlightRecord[]>([]);

  useEffect(() => {
    setRecords(getLeaderboardRecords(missionId, aircraftId));
  }, [missionId, aircraftId]);

  const empty = useMemo(() => records.length === 0, [records]);

  return (
    <main className="page-shell py-12">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="section-kicker">Leaderboard</div>
          <h1 className="section-title mt-2">排行榜</h1>
          <p className="mt-3 text-slate-400">按任务、飞机和评分排序展示本机保存的 Top 10 飞行成绩。</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={missionId} onChange={(event) => setMissionId(event.target.value)} className="min-h-12 rounded-lg border border-sky-300/20 bg-slate-950 px-3 text-sm text-slate-100">
            <option value="all">全部任务</option>
            {missions.map((mission) => (
              <option key={mission.id} value={mission.id}>{mission.name}</option>
            ))}
          </select>
          <select value={aircraftId} onChange={(event) => setAircraftId(event.target.value)} className="min-h-12 rounded-lg border border-sky-300/20 bg-slate-950 px-3 text-sm text-slate-100">
            <option value="all">全部飞机</option>
            {aircraft.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {empty ? (
        <div className="hud-panel mt-8 rounded-lg p-8 text-center text-slate-400">
          还没有成绩。完成一次任务后，排行榜会自动更新。
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {records.map((record, index) => (
            <article key={record.id} className="hud-panel rounded-lg p-4">
              <div className="grid gap-3 md:grid-cols-[72px_1fr_120px_120px_120px] md:items-center">
                <div className="text-3xl font-black text-cyan-200">#{index + 1}</div>
                <div>
                  <h3 className="font-black text-slate-50">{record.missionName}</h3>
                  <p className="text-sm text-slate-400">{record.aircraftName} · {record.airportName}</p>
                </div>
                <div className="text-sm text-slate-300">评分 <strong className="text-slate-50">{record.score}</strong></div>
                <div className="text-sm text-slate-300">评级 <strong className="text-cyan-200">{record.rating}</strong></div>
                <div className="text-sm text-slate-300">时间 <strong className="text-slate-50">{formatDuration(record.flightTime)}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
