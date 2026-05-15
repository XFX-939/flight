"use client";

import { useEffect, useState } from "react";
import type { QualitySetting } from "@/types/flight";
import { getPlayerName, getQualitySetting, setPlayerName, setQualitySetting } from "@/lib/flightStorage";

const qualityOptions: { value: QualitySetting; label: string; description: string }[] = [
  { value: "auto", label: "自动", description: "根据屏幕尺寸自动调整云层、阴影和粒子。" },
  { value: "high", label: "高", description: "保留更多云层、灯光和阴影，适合桌面端。" },
  { value: "medium", label: "中", description: "平衡画质和流畅度。" },
  { value: "low", label: "低", description: "减少云层、粒子和高强度灯光，适合移动端。" }
];

export default function SettingsPage() {
  const [quality, setQuality] = useState<QualitySetting>("auto");
  const [name, setName] = useState("");

  useEffect(() => {
    setQuality(getQualitySetting());
    setName(getPlayerName());
  }, []);

  const handleQuality = (value: QualitySetting) => {
    setQuality(value);
    setQualitySetting(value);
  };

  const handleName = (value: string) => {
    setName(value);
    if (value.trim().length > 0) {
      setPlayerName(value);
    }
  };

  return (
    <main className="page-shell py-12">
      <div className="max-w-3xl">
        <div className="section-kicker">Settings</div>
        <h1 className="section-title mt-2">设置</h1>
        <p className="mt-3 text-slate-400">调整画质、飞行员名称和本地记录偏好。后续可接入 Supabase 同步账号数据。</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="hud-panel rounded-lg p-5">
          <h2 className="font-black text-slate-50">飞行员</h2>
          <label className="mt-4 block text-sm text-slate-400" htmlFor="pilot-name">机长名称</label>
          <input
            id="pilot-name"
            value={name}
            onChange={(event) => handleName(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-sky-300/20 bg-slate-950 px-3 text-slate-100"
            placeholder="例如：Felix"
            maxLength={24}
          />
          <p className="mt-2 text-xs text-slate-500">飞行记录会显示为“XX机长”。</p>
        </section>

        <section className="hud-panel rounded-lg p-5">
          <h2 className="font-black text-slate-50">画质设置</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {qualityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`min-h-24 rounded-lg border p-4 text-left transition ${
                  quality === option.value
                    ? "border-cyan-300/70 bg-cyan-300/10"
                    : "border-sky-300/15 bg-slate-950/35"
                }`}
                onClick={() => handleQuality(option.value)}
              >
                <span className="block font-black text-slate-50">{option.label}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-400">{option.description}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
