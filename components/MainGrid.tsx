"use client";

import { useState } from "react";
import {
  Settings,
  Sparkles,
  GraduationCap,
  User,
  Calendar,
  ClipboardList,
  FlaskConical,
  ScanLine,
  Pill,
  ReceiptText,
  Briefcase,
  Check,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/* ---------- shared building blocks ---------- */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-[#F1F5F9] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <span className="text-[15px] font-semibold text-[#0F172A]">{title}</span>
      {link && (
        <span className="text-[13px] font-medium text-[#0F766E] cursor-pointer whitespace-nowrap">
          {link}
        </span>
      )}
    </div>
  );
}

/** widthClass / colorClass must be literal Tailwind class strings (e.g. "w-[78%]", "bg-[#0F766E]"). */
function ProgressBar({
  widthClass,
  colorClass = "bg-[#0F766E]",
}: {
  widthClass: string;
  colorClass?: string;
}) {
  return (
    <div className="flex-1 h-2 bg-[#EEF2F6] rounded overflow-hidden">
      <div className={`h-full rounded ${widthClass} ${colorClass}`} />
    </div>
  );
}

/* ---------- charts ---------- */

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(
      1
    )}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LINE_SERIES = [
  {
    key: "OPD",
    dashClass: "bg-[#1E3A8A]",
    lineClass: "stroke-[#1E3A8A]",
    data: [240, 280, 260, 320, 300, 220, 200],
  },
  {
    key: "IPD",
    dashClass: "bg-[#16A34A]",
    lineClass: "stroke-[#16A34A]",
    data: [150, 170, 160, 190, 180, 130, 120],
  },
  {
    key: "ER",
    dashClass: "bg-[#DC2626]",
    lineClass: "stroke-[#DC2626]",
    data: [45, 60, 50, 70, 55, 40, 48],
  },
];

function LineChart() {
  const W = 420;
  const H = 240;
  const padL = 30;
  const padR = 8;
  const padT = 12;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxY = 400;
  const xAt = (i: number) => padL + (plotW * i) / (DAYS.length - 1);
  const yAt = (v: number) => padT + plotH * (1 - v / maxY);
  const yTicks = [0, 100, 200, 300, 400];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="220"
      preserveAspectRatio="none"
      role="img"
    >
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} className="stroke-[#EEF2F6]" strokeWidth={1} />
          <text
            x={padL - 6}
            y={yAt(t)}
            textAnchor="end"
            dominantBaseline="central"
            className="font-sans fill-[#94A3B8] text-[10px]"
          >
            {t}
          </text>
        </g>
      ))}
      {DAYS.map((d, i) => (
        <text
          key={d}
          x={xAt(i)}
          y={H - 8}
          textAnchor="middle"
          className="font-sans fill-[#94A3B8] text-[10px]"
        >
          {d}
        </text>
      ))}
      {LINE_SERIES.map((s) => {
        const pts = s.data.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
        return (
          <g key={s.key}>
            <path
              d={smoothPath(pts)}
              fill="none"
              className={s.lineClass}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3.2}
                className={`fill-white ${s.lineClass}`}
                strokeWidth={2}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const BARS = [
  { label: "12 AM", v: 40 },
  { label: "03 AM", v: 25 },
  { label: "06 AM", v: 110 },
  { label: "09 AM", v: 300 },
  { label: "12 PM", v: 245 },
  { label: "03 PM", v: 250 },
  { label: "06 PM", v: 180 },
  { label: "09 PM", v: 130 },
];

function BarChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 420;
  const H = 240;
  const padL = 36;
  const padR = 8;
  const padT = 28;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxY = 400;
  const bw = 22;
  const step = plotW / BARS.length;
  const yAt = (v: number) => padT + plotH * (1 - v / maxY);
  const xAt = (i: number) => padL + step * i + (step - bw) / 2;
  const yTicks = [0, 100, 200, 300, 400];

  const activeBar = hovered !== null ? BARS[hovered] : null;
  const tipX = hovered !== null ? xAt(hovered) + bw / 2 : 0;
  // Clamp so the tooltip box never gets clipped off the top of the chart.
  const tipY = hovered !== null ? Math.max(yAt(activeBar!.v), padT + 54) : 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="220"
      preserveAspectRatio="none"
      role="img"
    >
      <defs>
        <filter id="tipShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>
      </defs>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} className="stroke-[#EEF2F6]" strokeWidth={1} />
          <text
            x={padL - 6}
            y={yAt(t)}
            textAnchor="end"
            dominantBaseline="central"
            className="font-sans fill-[#94A3B8] text-[10px]"
          >
            {t === 0 ? "0" : `${t}K`}
          </text>
        </g>
      ))}
      {BARS.map((b, i) => (
        <g key={b.label}>
          {/* Wide invisible hit-area so hovering anywhere in the bar's lane (not just the
              thin colored bar) triggers its tooltip. */}
          <rect
            x={padL + step * i}
            y={padT}
            width={step}
            height={plotH}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
          <rect
            x={xAt(i)}
            y={yAt(b.v)}
            width={bw}
            height={padT + plotH - yAt(b.v)}
            rx={4}
            className={`fill-[#0F766E] pointer-events-none transition-opacity ${
              hovered === i ? "opacity-100" : "opacity-90"
            }`}
          />
          <text
            x={xAt(i) + bw / 2}
            y={H - 8}
            textAnchor="middle"
            className="font-sans fill-[#94A3B8] text-[9.5px] pointer-events-none"
          >
            {b.label}
          </text>
        </g>
      ))}
      {activeBar && (
        <g
          transform={`translate(${tipX}, ${tipY - 10})`}
          filter="url(#tipShadow)"
          className="pointer-events-none"
        >
          <rect x={-52} y={-42} width={104} height={40} rx={7} className="fill-white" />
          <text
            x={0}
            y={-27}
            textAnchor="middle"
            className="font-sans fill-[#94A3B8] text-[10px]"
          >
            {activeBar.label}
          </text>
          <text
            x={0}
            y={-11}
            textAnchor="middle"
            className="font-heading font-bold fill-[#0F172A] text-xs"
          >
            Birr {(activeBar.v * 1000).toLocaleString()}
          </text>
        </g>
      )}
    </svg>
  );
}

const DONUT = [
  { name: "General Medicine", pct: 35, swatchClass: "bg-[#1E3A8A]", ringClass: "stroke-[#1E3A8A]" },
  { name: "Pediatrics", pct: 20, swatchClass: "bg-[#60A5FA]", ringClass: "stroke-[#60A5FA]" },
  { name: "Surgery", pct: 15, swatchClass: "bg-[#F97316]", ringClass: "stroke-[#F97316]" },
  { name: "Gynecology", pct: 12, swatchClass: "bg-[#DC2626]", ringClass: "stroke-[#DC2626]" },
  { name: "Orthopedics", pct: 10, swatchClass: "bg-[#EC4899]", ringClass: "stroke-[#EC4899]" },
  { name: "Others", pct: 8, swatchClass: "bg-[#16A34A]", ringClass: "stroke-[#16A34A]" },
];

/** Thick donut: wide stroke relative to radius so it reads as a bold ring, not a thin hairline. */
function Donut() {
  const size = 170;
  const c = size / 2;
  const r = 60;
  const sw = 34;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g transform={`rotate(-90 ${c} ${c})`}>
        {DONUT.map((s) => {
          const len = (circ * s.pct) / 100;
          const el = (
            <circle
              key={s.name}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              className={s.ringClass}
              strokeWidth={sw}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-acc}
            />
          );
          acc += len;
          return el;
        })}
      </g>
    </svg>
  );
}

/* ---------- data ---------- */

const APPOINTMENTS = [
  ["Abebe Kebede", "General Medicine", "Dr. Hana M.", "09:00 AM", "Completed"],
  ["Selamawit Desta", "Pediatrics", "Dr. Mekdes T.", "09:30 AM", "Completed"],
  ["Yonas Alemu", "Orthopedics", "Dr. Kibrom A.", "10:00 AM", "In Progress"],
  ["Betelhem Amare", "Gynecology", "Dr. Eden G.", "10:30 AM", "Scheduled"],
  ["Tesfaye Habtu", "Surgery", "Dr. Daniel K.", "11:00 AM", "Scheduled"],
];

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-[#DCFCE7] text-[#166534]",
  "In Progress": "bg-[#DBEAFE] text-[#1E40AF]",
  Scheduled: "bg-[#FFEDD5] text-[#9A3412]",
};

const BEDS = [
  { label: "General Ward", pct: 78, frac: "54/70", barClass: "w-[78%]" },
  { label: "Private Room", pct: 65, frac: "26/40", barClass: "w-[65%]" },
  { label: "ICU", pct: 82, frac: "23/28", barClass: "w-[82%]" },
  { label: "NICU", pct: 60, frac: "9/15", barClass: "w-[60%]" },
  { label: "Maternity Ward", pct: 70, frac: "21/30", barClass: "w-[70%]" },
];

const SERVICES = [
  { label: "Laboratory", pct: 32, barClass: "w-[32%]" },
  { label: "Pharmacy", pct: 25, barClass: "w-[25%]" },
  { label: "Radiology", pct: 18, barClass: "w-[18%]" },
  { label: "Consultation", pct: 15, barClass: "w-[15%]" },
  { label: "Others", pct: 10, barClass: "w-[10%]" },
];

const ANNOUNCEMENTS: { icon: LucideIcon; title: string; desc: string; date: string }[] = [
  {
    icon: Settings,
    title: "System Maintenance",
    desc: "Scheduled maintenance this Sunday 2:00 AM–4:00 AM. Brief downtime expected.",
    date: "May 20, 2026",
  },
  {
    icon: Sparkles,
    title: "New Feature: AI Report Writer",
    desc: "Generate clinical summaries automatically from patient records.",
    date: "May 18, 2026",
  },
  {
    icon: GraduationCap,
    title: "Training Schedule",
    desc: "New staff onboarding sessions begin next week in Conference Room B.",
    date: "May 15, 2026",
  },
];

const SHORTCUTS: { icon: LucideIcon; label: string }[] = [
  { icon: User, label: "New Patient" },
  { icon: Calendar, label: "Appointment" },
  { icon: ClipboardList, label: "OPD Registration" },
  { icon: FlaskConical, label: "Lab Order" },
  { icon: ScanLine, label: "Radiology" },
  { icon: Pill, label: "Pharmacy" },
  { icon: ReceiptText, label: "Billing" },
  { icon: Briefcase, label: "Discharge" },
];

const SYS_STATUS = [
  { label: "Database", status: "Operational" },
  { label: "Backup", status: "Up to date" },
  { label: "API Server", status: "Operational" },
  { label: "Security", status: "Protected" },
];

const TD =
  "text-[13px] py-[11px] pr-2 pl-0 border-b border-[#F8FAFC] whitespace-nowrap";

/* ---------- main ---------- */

export default function MainGrid() {
  return (
    <div className="pt-5 px-4 sm:px-6 lg:px-8 pb-8 font-sans">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[75fr_25fr] lg:gap-5 lg:items-stretch">
        {/* Columns 1 & 2 grouped in one section; subgrid row tracks match card heights on desktop */}
        <section className="flex flex-col gap-5 lg:grid lg:grid-cols-[40fr_35fr] lg:grid-rows-[auto_auto_auto] lg:gap-5">
          {/* Column 1 */}
          <div className="flex flex-col gap-5 min-w-0 lg:grid lg:grid-rows-subgrid lg:row-span-3 lg:gap-5">
            <Card>
              <div className="flex items-center justify-between mb-4 gap-3">
                <span className="text-[15px] font-semibold text-[#0F172A]">
                  Patient Flow Overview
                </span>
                <div className="flex items-center gap-3">
                  {LINE_SERIES.map((s) => (
                    <span
                      key={s.key}
                      className="inline-flex items-center gap-[5px] text-xs text-[#475569]"
                    >
                      <span className={`w-3 h-[3px] rounded-sm inline-block ${s.dashClass}`} />
                      {s.key}
                    </span>
                  ))}
                </div>
              </div>
              <LineChart />
            </Card>

            <Card>
              <CardHeader title="Recent Appointments" link="View All" />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[520px]">
                  <thead>
                    <tr>
                      {["Patient Name", "Department", "Doctor", "Time", "Status"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[11px] font-semibold text-[#94A3B8] pr-2 pb-2.5 pl-0 uppercase tracking-[0.3px] border-b border-[#F1F5F9] whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {APPOINTMENTS.map((r) => (
                      <tr key={r[0]}>
                        <td className={`${TD} font-semibold text-[#0F172A]`}>{r[0]}</td>
                        <td className={`${TD} font-normal text-[#475569]`}>{r[1]}</td>
                        <td className={`${TD} font-normal text-[#475569]`}>{r[2]}</td>
                        <td className={`${TD} font-normal text-[#475569]`}>{r[3]}</td>
                        <td className={`${TD} font-normal text-[#475569]`}>
                          <span
                            className={`inline-block text-[11.5px] font-semibold py-[3px] px-2.5 rounded-full whitespace-nowrap ${STATUS_STYLES[r[4]]}`}
                          >
                            {r[4]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Daily Revenue Overview" link="View Report" />
              <BarChart />
            </Card>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5 min-w-0 lg:grid lg:grid-rows-subgrid lg:row-span-3 lg:gap-5">
            <Card className="flex flex-col">
              <CardHeader title="OPD by Department (Today)" link="View All" />
              {/* Fixed-size donut (no aspect-ratio/h-full-in-grid-auto-track trick — that was
                  letterboxing the SVG inside an oversized reserved column, reading as left padding). */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-[190px] h-[190px] shrink-0">
                  <Donut />
                </div>
                <div className="flex flex-col justify-center gap-2.5 min-w-0 flex-1">
                  {DONUT.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 min-w-0">
                      <span className={`w-[11px] h-[11px] rounded-[3px] shrink-0 ${s.swatchClass}`} />
                      <span className="text-[13px] text-[#475569] flex-1 min-w-0 truncate">
                        {s.name}
                      </span>
                      <span className="text-[13px] font-bold text-[#0F172A] shrink-0">
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader title="Bed Occupancy Overview" link="View All" />
              <div className="flex flex-col gap-[14px] flex-1 justify-between">
                {BEDS.map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-[13px] text-[#475569] w-[108px] shrink-0">
                      {b.label}
                    </span>
                    <ProgressBar widthClass={b.barClass} />
                    <span className="text-[13px] font-semibold text-[#0F172A] w-[34px] text-right shrink-0">
                      {b.pct}%
                    </span>
                    <span className="text-xs text-[#94A3B8] w-[42px] text-right shrink-0">
                      {b.frac}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-3 mt-0.5 border-t border-[#F1F5F9]">
                  <span className="text-[13px] font-bold text-[#0F172A] flex-1">Total</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">133 / 183</span>
                  <span className="text-[13px] font-bold text-[#16A34A] w-[42px] text-right">
                    73%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader title="Top Services (This Month)" link="View Report" />
              <div className="flex flex-col gap-[14px] flex-1 justify-between">
                {SERVICES.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[13px] text-[#475569] w-[100px] shrink-0">
                      {s.label}
                    </span>
                    <ProgressBar widthClass={s.barClass} />
                    <span className="text-[13px] font-semibold text-[#0F172A] w-[34px] text-right shrink-0">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Column 3 */}
        <div className="flex flex-col gap-5 min-w-0">
          <Card className="flex-1 lg:!pb-[60px]">
            <CardHeader title="System Announcements" link="View All" />
            <div className="flex flex-col gap-4">
              {ANNOUNCEMENTS.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="flex gap-3">
                    <span className="w-[34px] h-[34px] rounded-full bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center shrink-0">
                      <Icon size={16} strokeWidth={2} color="#166534" />
                    </span>
                    <div className="flex flex-col gap-[3px] min-w-0">
                      <span className="text-[13px] font-bold text-[#0F172A]">
                        {a.title}
                      </span>
                      <span className="text-xs text-[#64748B] leading-[1.4] line-clamp-2">
                        {a.desc}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] mt-px">{a.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="flex-1 lg:!pb-10">
            <CardHeader title="Quick Shortcuts" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    type="button"
                    className="flex flex-col items-center justify-center gap-[7px] py-3.5 px-1.5 bg-white border border-[#EEF2F6] rounded-[10px] cursor-pointer"
                  >
                    <Icon size={22} strokeWidth={1.9} color="#0F766E" />
                    <span className="text-xs text-[#334155] text-center leading-[1.2]">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex flex-col lg:h-[294px] lg:shrink-0">
            <CardHeader title="System Status" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
                {SYS_STATUS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <Check size={15} strokeWidth={3} color="#166534" />
                    <span className="text-[13px] text-[#475569] flex-1">{s.label}</span>
                    <span className="text-xs font-semibold text-[#16A34A] whitespace-nowrap">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 w-[130px] mx-auto sm:mx-0 shrink-0">
                <span className="w-[62px] h-[62px] rounded-full bg-[#0F766E] flex items-center justify-center mb-0.5">
                  <ShieldCheck size={30} strokeWidth={2.2} color="#fff" />
                </span>
                <span className="text-[13px] font-bold text-[#0F172A]">
                  System is Secure
                </span>
                <span className="text-[11px] text-[#64748B] leading-[1.3]">
                  All systems are running smoothly
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between pt-6 pb-3 gap-3 sm:gap-4">
        <span className="text-xs text-[#64748B] text-center">
          © 2026 Orbit Technology Solutions PLC. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#64748B]">Privacy Policy</span>
          <span className="text-xs text-[#CBD5E1]">•</span>
          <span className="text-xs text-[#64748B]">Terms of Service</span>
          <span className="text-xs text-[#CBD5E1]">•</span>
          <span className="text-xs text-[#64748B]">Support</span>
        </div>
        <span className="text-xs text-[#64748B]">Version 2026.1.0</span>
      </footer>
    </div>
  );
}
