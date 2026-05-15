import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="hud-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 text-slate-400">
        <span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-black text-slate-50">{value}</div>
      <p className="mt-1 text-sm leading-6 text-slate-400">{helper}</p>
    </div>
  );
}
