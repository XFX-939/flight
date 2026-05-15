"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Gauge, Map, Menu, Plane, Settings, Trophy, Warehouse, X } from "lucide-react";

const links = [
  { href: "/play", label: "开始飞行", icon: Gauge },
  { href: "/hangar", label: "机库", icon: Warehouse },
  { href: "/airports", label: "机场", icon: Map },
  { href: "/missions", label: "任务", icon: Plane },
  { href: "/leaderboard", label: "排行榜", icon: Trophy },
  { href: "/logbook", label: "飞行日志", icon: BookOpen }
];

export function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/play") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sky-400/10 bg-[#07111F]/88 backdrop-blur-xl">
      <div className="page-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex min-h-12 items-center gap-3 font-black tracking-[0.02em]">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-hud">
            <Plane className="h-5 w-5 text-cyan-300" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm text-slate-400">Felix</span>
            <span className="block text-base text-slate-50">Flight Simulator</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`nav-link ${active ? "nav-link-active" : ""}`}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <Link href="/settings" className={`nav-link ${pathname === "/settings" ? "nav-link-active" : ""}`}>
            <Settings className="h-4 w-4" />
            设置
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-12 w-12 place-items-center rounded-lg border border-sky-300/20 bg-slate-900/80 text-slate-100 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="切换导航"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-sky-400/10 bg-[#07111F]/96 px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={`nav-link ${pathname === "/settings" ? "nav-link-active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              设置
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
