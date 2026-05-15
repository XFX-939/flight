import Link from "next/link";
import { ArrowRight, CircleDot, Compass, Gauge, Map, Plane, PlaneLanding, PlaneTakeoff, Radar, Trophy } from "lucide-react";
import { aircraft } from "@/data/aircraft";
import { missions } from "@/data/missions";
import { AircraftCard } from "@/components/ui/AircraftCard";
import { MissionCard } from "@/components/ui/MissionCard";
import { RecentFlightsPreview } from "@/components/ui/RecentFlightsPreview";
import { StatCard } from "@/components/ui/StatCard";

const pcControls = [
  "Shift 增加油门",
  "Ctrl 减小油门",
  "W/S 控制俯仰",
  "A/D 控制滚转",
  "Q/E 控制偏航",
  "F 襟翼",
  "G 起落架",
  "B 刹车",
  "V 切换视角",
  "Esc 暂停"
];

const mobileControls = [
  "左侧虚拟摇杆控制俯仰和滚转",
  "右侧油门滑杆控制推力",
  "底部按钮控制襟翼、起落架、刹车、视角"
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <div className="absolute inset-0 bg-radar-grid aviation-grid opacity-80" />
        <div className="absolute left-1/2 top-20 h-52 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[62rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_62%)]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[72vw] -translate-x-1/2 [clip-path:polygon(46%_0,54%_0,100%_100%,0_100%)] bg-slate-950/72">
          <div className="mx-auto mt-8 h-full w-[2px] bg-cyan-200/35 shadow-runway" />
          <div className="absolute left-[42%] top-12 h-2 w-2 rounded-full bg-sky-300 shadow-runway" />
          <div className="absolute right-[42%] top-12 h-2 w-2 rounded-full bg-sky-300 shadow-runway" />
          <div className="absolute left-[36%] top-32 h-2 w-2 rounded-full bg-sky-300 shadow-runway" />
          <div className="absolute right-[36%] top-32 h-2 w-2 rounded-full bg-sky-300 shadow-runway" />
        </div>

        <div className="page-shell relative grid min-h-[calc(100vh-72px)] items-center gap-10 py-12 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="max-w-3xl">
            <div className="section-kicker flex items-center gap-2">
              <Radar className="h-4 w-4" />
              Civil Web Flight Training
            </div>
            <h1 className="mt-5 text-5xl font-black leading-[1.05] text-slate-50 sm:text-6xl lg:text-7xl">
              云端飞行模拟器
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              从跑道起飞，穿越云层，完成一次稳定、精准、真实感的飞行。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/play?mission=takeoff-training" className="button-primary">
                <PlaneTakeoff className="h-5 w-5" />
                立即起飞
              </Link>
              <Link href="/play?mission=landing-training" className="button-secondary">
                <PlaneLanding className="h-5 w-5" />
                降落训练
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard label="Flight Model" value="Lift + Stall" helper="简化升力、阻力、姿态惯性" icon={<Gauge className="h-4 w-4 text-cyan-300" />} />
              <StatCard label="Mission" value="4 Modes" helper="起飞、降落、自由飞行、航线挑战" icon={<Compass className="h-4 w-4 text-cyan-300" />} />
              <StatCard label="Record" value="Local" helper="飞行日志和排行榜保存在本机" icon={<Trophy className="h-4 w-4 text-cyan-300" />} />
            </div>
          </div>

          <div className="hud-panel hud-corners rounded-lg p-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-cyan-300/20 bg-[#07111F]">
              <div className="absolute inset-0 bg-radar-grid bg-[length:38px_38px] opacity-50" />
              <div className="absolute left-1/2 top-1/2 h-px w-3/4 -translate-x-1/2 bg-cyan-300/70" />
              <div className="absolute left-1/2 top-[38%] h-px w-1/2 -translate-x-1/2 bg-cyan-300/35" />
              <div className="absolute left-1/2 top-[62%] h-px w-1/2 -translate-x-1/2 bg-cyan-300/35" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/50" />
              <div className="absolute left-1/2 top-[44%] h-2 w-36 -translate-x-1/2 rounded-full bg-slate-200 shadow-[0_0_18px_rgba(34,211,238,0.35)]" />
              <div className="absolute left-1/2 top-[42%] h-16 w-8 -translate-x-1/2 rounded-full bg-slate-100" />
              <div className="absolute left-1/2 top-[51%] h-10 w-24 -translate-x-1/2 rounded-full bg-cyan-300/80 blur-xl" />
              <div className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">HUD ARM</div>
              <div className="absolute bottom-5 right-5 text-right text-xs font-bold text-slate-300">
                SPD 086 KT<br />ALT 1500 FT<br />HDG 000
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="section-kicker">Quick Missions</div>
            <h2 className="section-title mt-2">快速任务入口</h2>
          </div>
          <Link href="/missions" className="button-secondary">
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </section>

      <section className="border-y border-sky-300/10 bg-slate-950/28 py-16">
        <div className="page-shell">
          <div className="section-kicker">Aircraft</div>
          <h2 className="section-title mt-2">飞机展示</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {aircraft.map((item) => (
              <AircraftCard key={item.id} aircraft={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <RecentFlightsPreview />
        <div className="hud-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <CircleDot className="h-5 w-5 text-cyan-300" />
            <h3 className="font-black text-slate-50">操作说明</h3>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-black text-slate-200">PC</h4>
              <div className="mt-3 grid gap-2">
                {pcControls.map((item) => (
                  <span key={item} className="rounded-lg border border-sky-300/10 bg-slate-950/35 px-3 py-2 text-sm text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-200">手机</h4>
              <div className="mt-3 grid gap-2">
                {mobileControls.map((item) => (
                  <span key={item} className="rounded-lg border border-sky-300/10 bg-slate-950/35 px-3 py-2 text-sm text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
              <Link href="/play" className="button-primary mt-5 w-full">
                <Plane className="h-4 w-4" />
                进入模拟器
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
