"use client";

import { ArrowUp, CloudFog, Gamepad2, Gauge, MapPinned, MousePointer2, Plane, PlaneTakeoff, Smartphone, UserRound, Wind } from "lucide-react";
import type { Aircraft, Airport, Mission } from "@/types/flight";
import { getAircraftFeelStats, getAircraftPerformanceProfile } from "@/lib/aircraftPerformance";
import { getAirportGameplayProfile, getMissionTargetHeading } from "@/lib/airportGameplay";
import { normalizePlayerName } from "@/lib/flightStorage";

type PreflightTutorialModalProps = {
  aircraft: Aircraft;
  airport: Airport;
  aircraftOptions: Aircraft[];
  mission: Mission;
  captainName: string;
  onCaptainNameChange: (value: string) => void;
  onAircraftChange: (aircraftId: string) => void;
  onStart: (captainName: string) => void;
};

export function PreflightTutorialModal({
  aircraft,
  airport,
  aircraftOptions,
  mission,
  captainName,
  onCaptainNameChange,
  onAircraftChange,
  onStart
}: PreflightTutorialModalProps) {
  const canStart = captainName.trim().length > 0;
  const captainLabel = canStart ? normalizePlayerName(captainName) : "请输入机长名";
  const airportProfile = getAirportGameplayProfile(airport, aircraft);
  const targetHeading = getMissionTargetHeading(mission, airport);
  const windSide =
    airportProfile.wind.crosswindFrom === "right" ? "右侧风" : airportProfile.wind.crosswindFrom === "left" ? "左侧风" : "风况平稳";

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <form
        className="hud-panel max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-lg p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (canStart) {
            onStart(captainName);
          }
        }}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Preflight Briefing</div>
            <h2 className="mt-2 text-3xl font-black text-slate-50">起飞前简明教程</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              当前任务：{mission.name} · 当前飞机：{aircraft.name} · 当前机场：{airport.name}
            </p>
          </div>
          <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
            建议抬轮 {airportProfile.requiredTakeoffSpeed} kt
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-cyan-300/15 bg-slate-950/45 p-4">
          <label htmlFor="captain-name" className="flex items-center gap-2 text-sm font-black text-slate-50">
            <UserRound className="h-4 w-4 text-cyan-300" />
            起飞前确认机长名
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <input
              id="captain-name"
              value={captainName}
              onChange={(event) => onCaptainNameChange(event.target.value)}
              className="min-h-12 rounded-lg border border-sky-300/20 bg-slate-950 px-3 text-slate-100 outline-none transition focus:border-cyan-300/70"
              maxLength={18}
              placeholder="例如：Felix"
              autoComplete="nickname"
              autoFocus
            />
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
              {captainLabel}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-cyan-300/15 bg-slate-950/45 p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-50">
                <MapPinned className="h-4 w-4 text-cyan-300" />
                机场和天气会影响本次飞行
              </div>
              <p className="mt-1 text-xs text-slate-400">{airportProfile.challengeLabel} · {airportProfile.challengeSummary}</p>
            </div>
            <div className="text-xs font-bold text-cyan-200">目标航向 {targetHeading.toString().padStart(3, "0")}°</div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <PlaneTakeoff className="h-3.5 w-3.5 text-cyan-300" />
                跑道余量
              </div>
              <strong className="mt-1 block text-sm text-slate-50">{Math.round(airportProfile.runwayMarginMeters)} m</strong>
            </div>
            <div className="rounded-lg bg-slate-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Wind className="h-3.5 w-3.5 text-cyan-300" />
                侧风
              </div>
              <strong className="mt-1 block text-sm text-slate-50">{Math.round(airportProfile.wind.crosswindKnots)} kt {windSide}</strong>
            </div>
            <div className="rounded-lg bg-slate-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <CloudFog className="h-3.5 w-3.5 text-cyan-300" />
                能见度
              </div>
              <strong className="mt-1 block text-sm text-slate-50">{airport.visibility} mi</strong>
            </div>
            <div className="rounded-lg bg-slate-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Gauge className="h-3.5 w-3.5 text-cyan-300" />
                性能
              </div>
              <strong className="mt-1 block text-sm text-slate-50">{Math.round(airportProfile.densityFactor * 100)}%</strong>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-cyan-300/15 bg-slate-950/45 p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-50">
                <Plane className="h-4 w-4 text-cyan-300" />
                选择本次飞行机型
              </div>
              <p className="mt-1 text-xs text-slate-400">不同飞机会改变起飞速度、油门响应、滚转速度和姿态惯性。</p>
            </div>
            <div className="text-xs font-bold text-cyan-200">{getAircraftPerformanceProfile(aircraft).feelSummary}</div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {aircraftOptions.map((option) => {
              const selected = option.id === aircraft.id;
              const feelStats = getAircraftFeelStats(option);
              const profile = getAircraftPerformanceProfile(option);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-cyan-300/75 bg-cyan-300/10"
                      : "border-sky-300/15 bg-slate-950/35 hover:border-cyan-300/45"
                  }`}
                  onClick={() => onAircraftChange(option.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">{option.type}</div>
                      <h3 className="mt-1 font-black text-slate-50">{option.name}</h3>
                    </div>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                      style={{ borderColor: option.accentColor, backgroundColor: `${option.accentColor}22` }}
                    >
                      <Plane className="h-5 w-5" style={{ color: option.accentColor }} />
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{profile.handlingHint}</p>
                  <div className="mt-3 grid gap-2">
                    {feelStats.map((stat) => (
                      <div key={stat.label}>
                        <div className="flex justify-between gap-2 text-[11px] font-bold text-slate-300">
                          <span>{stat.label}</span>
                          <span>{stat.text}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-cyan-300"
                            style={{ width: `${stat.value}%`, backgroundColor: option.accentColor }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-sky-300/15 bg-slate-950/40 p-4">
            <Gauge className="h-6 w-6 text-cyan-300" />
            <h3 className="mt-3 font-black text-slate-50">1. 先推油门</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              PC 按住 <strong className="text-slate-100">Shift</strong>，或按住底部 <strong className="text-slate-100">THR+</strong>。
              手机把右侧油门滑杆推到 80%-100%。
            </p>
          </div>
          <div className="rounded-lg border border-sky-300/15 bg-slate-950/40 p-4">
            <ArrowUp className="h-6 w-6 text-cyan-300" />
            <h3 className="mt-3 font-black text-slate-50">2. 速度到位再拉起</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              HUD 的 SPD 到 {airportProfile.requiredTakeoffSpeed} kt 左右后，按住 <strong className="text-slate-100">S / ↓</strong> 或底部 <strong className="text-slate-100">PULL</strong> 抬机头。
              不要一直猛拉，否则会失速。
            </p>
          </div>
          <div className="rounded-lg border border-sky-300/15 bg-slate-950/40 p-4">
            <PlaneTakeoff className="h-6 w-6 text-cyan-300" />
            <h3 className="mt-3 font-black text-slate-50">3. 小角度爬升</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              起飞后保持小角度爬升，航向尽量对准跑道。看到 STALL 时降低机头并继续加速。
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-sky-300/10 bg-slate-950/35 p-4">
            <div className="flex items-center gap-2 font-black text-slate-50">
              <MousePointer2 className="h-4 w-4 text-cyan-300" />
              PC 操作
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Shift/Ctrl 油门，W/S 俯仰，A/D 滚转，Q/E 偏航。也可以用底部 THR+ 和 PULL 完成起飞。
            </p>
          </div>
          <div className="rounded-lg border border-sky-300/10 bg-slate-950/35 p-4">
            <div className="flex items-center gap-2 font-black text-slate-50">
              <Smartphone className="h-4 w-4 text-cyan-300" />
              手机操作
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              左下虚拟摇杆控制俯仰/滚转，右侧滑杆控制油门，底部按钮控制襟翼、起落架、刹车和视角。
            </p>
          </div>
        </div>

        <button type="submit" className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-45" disabled={!canStart}>
          <Gamepad2 className="h-5 w-5" />
          {canStart ? `${captainLabel}，开始滑跑` : "输入机长名后开始滑跑"}
        </button>
      </form>
    </div>
  );
}
