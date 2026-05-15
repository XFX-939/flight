import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import { AppNav } from "@/components/ui/AppNav";

export const metadata: Metadata = {
  title: "Felix Flight Simulator",
  description: "云端飞行模拟器，在线完成起飞、巡航与降落训练。"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
