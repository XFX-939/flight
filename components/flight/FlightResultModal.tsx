"use client";

import Link from "next/link";
import type { Aircraft, Airport, FlightScore, Mission } from "@/types/flight";
import { formatDuration } from "@/lib/math";

type FlightResultModalProps = {
  score: FlightScore;
  aircraft: Aircraft;
  airport: Airport;
  mission: Mission;
  onRestart: () => void;
};

export function FlightResultModal({ score, aircraft, airport, mission, onRestart }: FlightResultModalProps) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="hud-panel w-full max-w-2xl rounded-lg p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Flight Result</div>
            <h2 className="mt-2 text-3xl font-black text-slate-50">{score.rating} · {score.totalScore}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {mission.name} · {aircraft.name} · {airport.name}
            </p>
          </div>
          <div className={`rounded-lg px-4 py-3 text-sm font-black ${score.crashed ? "bg-red-500/15 text-red-200" : "bg-emerald-400/12 text-emerald-200"}`}>
            {score.missionCompleted ? "任务完成" : score.crashed ? "任务失败" : "已结束"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">飞行时间</span>
            <strong className="block text-slate-50">{formatDuration(score.flightTime)}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">最大高度</span>
            <strong className="block text-slate-50">{score.maxAltitude} ft</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">最大速度</span>
            <strong className="block text-slate-50">{score.maxSpeed} kt</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">平均速度</span>
            <strong className="block text-slate-50">{score.averageSpeed} kt</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">接地垂直速度</span>
            <strong className="block text-slate-50">{score.landingVerticalSpeed} fpm</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">中心线偏差</span>
            <strong className="block text-slate-50">{score.landingCenterlineOffset} m</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">接地点距离</span>
            <strong className="block text-slate-50">{score.touchdownDistance} m</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">失速警告</span>
            <strong className="block text-slate-50">{score.stallWarnings}</strong>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button type="button" className="button-primary" onClick={onRestart}>再飞一次</button>
          <Link href="/leaderboard" className="button-secondary">排行榜</Link>
          <Link href="/" className="button-secondary">返回首页</Link>
        </div>
      </div>
    </div>
  );
}
