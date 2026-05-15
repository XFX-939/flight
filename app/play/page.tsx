import { Suspense } from "react";
import { PlayClient } from "@/components/flight/PlayClient";

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="grid h-[100dvh] place-items-center bg-[#07111F] text-slate-300">Loading simulator...</div>}>
      <PlayClient />
    </Suspense>
  );
}
