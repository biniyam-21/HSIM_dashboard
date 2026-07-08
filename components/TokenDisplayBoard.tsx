"use client";

import { useEffect, useState } from "react";
import { Volume2, QrCode, Siren, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { DEPARTMENTS, deptChipClass } from "@/lib/appointmentsQueueData";

type BoardToken = {
  token: string;
  department: string;
  room: string;
  doctor: string;
  colorKey: string;
};

const CURRENT: BoardToken = { token: "GM-024", department: "General Medicine", room: "OPD-12", doctor: "Dr. Dawit Bekele", colorKey: "teal" };

const NEXT_TOKENS: BoardToken[] = [
  { token: "CD-011", department: "Cardiology", room: "OPD-21", doctor: "Dr. Yared Mekonnen", colorKey: "rose" },
  { token: "PD-007", department: "Pediatrics", room: "OPD-04", doctor: "Dr. Hana Alemayehu", colorKey: "sky" },
  { token: "OB-003", department: "OB/GYN", room: "OPD-15", doctor: "Dr. Ruth Girma", colorKey: "pink" },
  { token: "OR-006", department: "Orthopedics", room: "OPD-08", doctor: "Dr. Samuel Tadesse", colorKey: "amber" },
  { token: "NR-004", department: "Neurology", room: "OPD-18", doctor: "Dr. Getachew Wolde", colorKey: "indigo" },
  { token: "EN-002", department: "ENT", room: "OPD-09", doctor: "Dr. Selam Fikru", colorKey: "violet" },
];

const ANNOUNCEMENTS = [
  "Token GM-024, please proceed to OPD-12.",
  "Reminder: Please have your MRN or National ID ready when called.",
  "Pharmacy pickup counter is now Window 3.",
  "Emergency cases are given immediate priority regardless of token order.",
];

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function BigTokenPanel({ token }: { token: BoardToken }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-10 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
      <span className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Now Serving
      </span>
      <span className="text-[8rem] leading-none font-heading font-bold tracking-tight text-white drop-shadow-lg tabular-nums">
        {token.token}
      </span>
      <div className="flex items-center gap-3 text-2xl font-semibold text-teal-300">
        <Volume2 size={26} strokeWidth={2} className="animate-pulse" />
        {token.department}
      </div>
      <div className="flex items-center gap-8 text-white/70 text-lg">
        <span>Room <span className="font-semibold text-white">{token.room}</span></span>
        <span className="w-px h-6 bg-white/20" />
        <span>{token.doctor}</span>
      </div>
    </div>
  );
}

function NextTokensPanel({ tokens }: { tokens: BoardToken[] }) {
  return (
    <div className="w-full lg:w-[360px] flex flex-col gap-3 rounded-3xl bg-white/5 border border-white/10 p-5">
      <span className="text-xs font-semibold uppercase tracking-widest text-white/40 px-1">Next Up</span>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {tokens.map((t) => (
          <div key={t.token} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`font-mono text-lg font-bold px-2.5 py-1 rounded-lg shrink-0 ${deptChipClass(t.colorKey)}`}>{t.token}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">{t.department}</span>
                <span className="text-xs text-white/40 truncate">{t.doctor} &middot; {t.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QrPanel() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4">
      <span className="flex items-center justify-center w-16 h-16 rounded-xl bg-white text-[#032b2b] shrink-0">
        <QrCode size={38} strokeWidth={1.2} />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">Scan to follow your queue</span>
        <span className="text-xs text-white/50">Get live token updates on your phone</span>
      </div>
    </div>
  );
}

function EmergencyBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-red-600/90 px-5 py-3 animate-pulse">
      <Siren size={20} strokeWidth={2} className="text-white shrink-0" />
      <span className="text-sm font-bold text-white uppercase tracking-wide">Emergency Alert</span>
      <span className="text-sm text-white/90">Emergency Department is currently over capacity — non-critical patients may experience delays.</span>
    </div>
  );
}

function AnnouncementTicker({ items }: { items: string[] }) {
  const text = items.join("     •     ");
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white/5 border border-white/10 py-3">
      <div className="whitespace-nowrap text-sm text-white/70 animate-[marquee_28s_linear_infinite] px-4">
        {text}
        <span className="mx-8" />
        {text}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function TokenDisplayBoard() {
  const now = useClock();
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      className={`bg-[#06141a] text-white flex flex-col gap-6 p-6 lg:p-8 ${
        fullscreen ? "fixed inset-0 z-50" : "min-h-[calc(100vh-68px)]"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0 text-teal-400 font-heading font-bold">
            F
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-white">Fiker Selam General Hospital</span>
            <span className="text-sm text-white/40">Outpatient Token Display &middot; Addis Ababa, Ethiopia</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-heading font-semibold tabular-nums text-white">
            {now ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </span>
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            aria-label="Toggle fullscreen"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            {fullscreen ? <Minimize2 size={17} strokeWidth={2} /> : <Maximize2 size={17} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <EmergencyBanner />

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <BigTokenPanel token={CURRENT} />
        <NextTokensPanel tokens={NEXT_TOKENS} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1"><AnnouncementTicker items={ANNOUNCEMENTS} /></div>
        <QrPanel />
      </div>

      {!fullscreen && (
        <Link href="/dashboard" className="self-center text-xs text-white/30 hover:text-white/60 transition-colors">
          Exit display mode
        </Link>
      )}
    </div>
  );
}
