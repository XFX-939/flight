"use client";

import { ArrowUp, Gamepad2, Gauge, MousePointer2, PlaneTakeoff, Smartphone } from "lucide-react";
import type { Aircraft, Mission } from "@/types/flight";

type PreflightTutorialModalProps = {
  aircraft: Aircraft;
  mission: Mission;
  onStart: () => void;
};

export function PreflightTutorialModal({ aircraft, mission, onStart }: PreflightTutorialModalProps) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="hud-panel w-full max-w-3xl rounded-lg p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Preflight Briefing</div>
            <h2 className="mt-2 text-3xl font-black text-slate-50">起飞前简明教程</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              当前任务：{mission.name} · 当前飞机：{aircraft.name}
            </p>
          </div>
          <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
            起飞速度 {aircraft.takeoffSpeed} kt
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
              HUD 的 SPD 到 {aircraft.takeoffSpeed} kt 左右后，按住 <strong className="text-slate-100">S / ↓</strong> 或底部 <strong className="text-slate-100">PULL</strong> 抬机头。
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

        <button type="button" className="button-primary mt-6 w-full" onClick={onStart}>
          <Gamepad2 className="h-5 w-5" />
          我知道了，开始滑跑
        </button>
      </div>
    </div>
  );
}
