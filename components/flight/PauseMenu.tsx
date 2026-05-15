"use client";

import Link from "next/link";
import type { QualitySetting } from "@/types/flight";

type PauseMenuProps = {
  open: boolean;
  quality: QualitySetting;
  onResume: () => void;
  onRestart: () => void;
  onQuality: (quality: QualitySetting) => void;
};

const qualityOptions: QualitySetting[] = ["auto", "high", "medium", "low"];

export function PauseMenu({ open, quality, onResume, onRestart, onQuality }: PauseMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
      <div className="hud-panel w-full max-w-xl rounded-lg p-5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Paused</div>
        <h2 className="mt-2 text-2xl font-black text-slate-50">飞行暂停</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button type="button" className="button-primary" onClick={onResume}>继续飞行</button>
          <button type="button" className="button-secondary" onClick={onRestart}>重新开始</button>
          <Link href="/" className="button-secondary">返回首页</Link>
        </div>

        <div className="mt-6">
          <h3 className="font-black text-slate-50">画质设置</h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {qualityOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`min-h-12 rounded-lg border text-sm font-black ${
                  quality === item
                    ? "border-cyan-300/70 bg-cyan-300/12 text-cyan-100"
                    : "border-sky-300/15 bg-slate-950/45 text-slate-300"
                }`}
                onClick={() => onQuality(item)}
              >
                {item === "auto" ? "自动" : item === "high" ? "高" : item === "medium" ? "中" : "低"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-sky-300/10 bg-slate-950/35 p-4 text-sm leading-7 text-slate-300">
          PC：Shift/Ctrl 控制油门，W/S 俯仰，A/D 滚转，Q/E 偏航，F 襟翼，G 起落架，B 刹车，V 视角。
          手机：左侧摇杆控制姿态，右侧滑杆控制油门，底部按钮控制襟翼、起落架、刹车和视角。
        </div>
      </div>
    </div>
  );
}
