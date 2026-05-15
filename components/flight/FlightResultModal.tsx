"use client";

import Link from "next/link";
import { HeartHandshake, Sparkles, Target } from "lucide-react";
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
  const debrief = score.debrief ?? {
    tone: score.crashed ? "failed" : "steady",
    title: score.crashed ? "这次飞行很有复盘价值" : "飞行完成，记录已生成",
    subtitle: `${score.rating} 评级 · ${score.totalScore} 分`,
    summary: `${mission.name} · ${aircraft.name} · ${airport.name} · ${formatDuration(score.flightTime)}`,
    encouragement: score.crashed ? "先把飞行带回安全范围，下一次会更稳。" : "你已经完成了这趟训练，下一步就是把细节飞得更干净。",
    highlights: ["完成了一次可记录的模拟飞行。"],
    improvements: ["继续优化速度、航向和降落稳定性。"],
    nextFocus: "再飞一次，新版日志会保存更完整的教官反馈。"
  };
  const debriefToneClass =
    debrief.tone === "failed"
      ? "border-red-300/25 bg-red-500/10"
      : debrief.tone === "success"
        ? "border-emerald-300/25 bg-emerald-400/10"
        : "border-cyan-300/20 bg-cyan-300/10";

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="hud-panel max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-lg p-5">
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

        <section className={`mt-5 rounded-lg border p-4 ${debriefToneClass}`}>
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-slate-950/40 text-cyan-200">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Flight Log</div>
              <h3 className="mt-1 text-xl font-black text-slate-50">{debrief.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-300">{debrief.subtitle}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{debrief.summary}</p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">{debrief.encouragement}</p>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <section className="rounded-lg border border-emerald-300/15 bg-slate-950/35 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-200">
              <Sparkles className="h-4 w-4" />
              做得好的地方
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
              下一次重点
            </div>
            <div className="mt-3 grid gap-2">
              {debrief.improvements.map((item) => (
                <p key={item} className="rounded-md bg-slate-950/40 px-3 py-2 text-sm leading-6 text-slate-300">{item}</p>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-3 rounded-lg border border-cyan-300/15 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-cyan-50">
          {debrief.nextFocus}
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
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">侧风修正</span>
            <strong className="block text-slate-50">{score.crosswindWarnings}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">机场难度</span>
            <strong className="block text-slate-50">{score.airportDifficulty}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">天气扣分</span>
            <strong className="block text-slate-50">-{score.weatherPenalty}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/45 p-3">
            <span className="text-xs text-slate-500">跑道冲出</span>
            <strong className={score.runwayOverrun ? "block text-red-200" : "block text-slate-50"}>
              {score.runwayOverrun ? "是" : "否"}
            </strong>
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
