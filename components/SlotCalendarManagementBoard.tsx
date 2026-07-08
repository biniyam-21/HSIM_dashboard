"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
  Rows3,
  Plus,
  MoreVertical,
  Ban,
  Plane,
  Siren,
  Filter,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import IconUnderlineTabs from "@/components/IconUnderlineTabs";
import { Card, FieldLabel, inputClass } from "@/components/FormFields";
import { DEPARTMENTS, DOCTORS, deptChipClass } from "@/lib/appointmentsQueueData";

/* ---------- date helpers ---------- */

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function addMonths(d: Date, n: number) {
  const c = new Date(d);
  c.setMonth(c.getMonth() + n);
  return c;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function monthGrid(viewDate: Date) {
  const first = startOfMonth(viewDate);
  const gridStart = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ---------- mock appointment counts / blocks ---------- */

type DayAppt = { count: number; cancelled: number };
function mockDayData(d: Date): DayAppt {
  const seed = d.getDate() % 6;
  return { count: seed === 0 ? 0 : 4 + seed * 2, cancelled: seed % 3 };
}

const HOUR_ROWS = ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"];

type WeeklyBlock = { day: number; hourIdx: number; span: number; doctor: string; dept: string; patient: string; color: string };
const WEEKLY_BLOCKS: WeeklyBlock[] = [
  { day: 1, hourIdx: 0, span: 1, doctor: "Dr. Dawit Bekele", dept: "General Medicine", patient: "Abebe Bekele", color: "teal" },
  { day: 1, hourIdx: 2, span: 1, doctor: "Dr. Hana Alemayehu", dept: "Pediatrics", patient: "Helen Tesfaye", color: "sky" },
  { day: 2, hourIdx: 1, span: 2, doctor: "Dr. Samuel Tadesse", dept: "Orthopedics", patient: "Yonas Tadesse", color: "amber" },
  { day: 3, hourIdx: 3, span: 1, doctor: "Dr. Ruth Girma", dept: "OB/GYN", patient: "Meron Alemu", color: "pink" },
  { day: 4, hourIdx: 0, span: 1, doctor: "Dr. Yared Mekonnen", dept: "Cardiology", patient: "Tigist Worku", color: "rose" },
  { day: 4, hourIdx: 5, span: 1, doctor: "Dr. Selam Fikru", dept: "ENT", patient: "Nahom Zewdu", color: "violet" },
  { day: 5, hourIdx: 4, span: 1, doctor: "Dr. Getachew Wolde", dept: "Neurology", patient: "Getnet Aschale", color: "indigo" },
];

const LEAVES = [
  { doctor: "Dr. Hana Alemayehu", type: "Annual Leave", range: "Jul 14 – Jul 18" },
  { doctor: "Dr. Samuel Tadesse", type: "Conference", range: "Jul 22" },
];

const BLOCKED_PERIODS = [
  { doctor: "Dr. Dawit Bekele", reason: "Admin Time", range: "Today, 12:00 – 1:00 PM" },
  { doctor: "Dr. Ruth Girma", reason: "Emergency C-Section", range: "Today, 2:00 – 3:30 PM" },
];

/* ---------- stats ---------- */

const STATS = [
  { label: "Appointments Today", value: "58", tone: "text-slate-900" },
  { label: "Cancelled", value: "4", tone: "text-red-600" },
  { label: "Completed", value: "21", tone: "text-emerald-600" },
  { label: "Available Slots", value: "33", tone: "text-teal-700" },
  { label: "Utilization", value: "76%", tone: "text-amber-600" },
];

function StatsPanel() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {STATS.map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{s.label}</span>
          <span className={`text-2xl font-heading font-semibold ${s.tone}`}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- filter bar ---------- */

function FilterBar({
  department,
  onDepartment,
  doctor,
  onDoctor,
  facility,
  onFacility,
  apptType,
  onApptType,
  viewDate,
  onPrev,
  onNext,
  onToday,
}: {
  department: string;
  onDepartment: (v: string) => void;
  doctor: string;
  onDoctor: (v: string) => void;
  facility: string;
  onFacility: (v: string) => void;
  apptType: string;
  onApptType: (v: string) => void;
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onPrev} aria-label="Previous" className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={onToday} className="h-8 px-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Today
        </button>
        <button type="button" onClick={onNext} aria-label="Next" className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-slate-900 whitespace-nowrap ml-1">
          {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select value={department} onChange={(e) => onDepartment(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select value={doctor} onChange={(e) => onDoctor(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All Doctors</option>
          {DOCTORS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select value={facility} onChange={(e) => onFacility(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All Facilities</option>
          <option>Fiker Selam General Hospital</option>
          <option>Tikur Anbessa Specialized Hospital</option>
        </select>
        <select value={apptType} onChange={(e) => onApptType(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All Appointment Types</option>
          <option>In-Person</option>
          <option>Teleconsultation</option>
          <option>Home Visit</option>
        </select>
      </div>

      <button type="button" className="h-10 px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors shrink-0">
        <Plus size={15} strokeWidth={2.5} />
        New Block
      </button>
    </div>
  );
}

/* ---------- Monthly view ---------- */

function MonthlyView({ viewDate }: { viewDate: Date }) {
  const cells = useMemo(() => monthGrid(viewDate), [viewDate]);
  const today = new Date();
  return (
    <Card>
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-1.5">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date) => {
          const inMonth = date.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(date, today);
          const data = mockDayData(date);
          return (
            <div
              key={date.toISOString()}
              className={`min-h-[92px] rounded-md border p-2 flex flex-col gap-1.5 transition-colors ${
                inMonth ? "border-gray-100 hover:border-teal-200 hover:bg-teal-50/30" : "border-gray-50 bg-gray-50/40"
              }`}
            >
              <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? "bg-teal-700 text-white" : inMonth ? "text-slate-700" : "text-gray-300"
              }`}>
                {date.getDate()}
              </span>
              {inMonth && data.count > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 rounded px-1.5 py-0.5 w-fit whitespace-nowrap">
                    {data.count} appts
                  </span>
                  {data.cancelled > 0 && (
                    <span className="text-[11px] font-medium text-red-500 whitespace-nowrap">{data.cancelled} cancelled</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- Weekly view ---------- */

function WeeklyView({ viewDate }: { viewDate: Date }) {
  const weekStart = addDays(viewDate, -viewDate.getDay());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <Card>
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 border-b border-gray-100 pb-2 mb-2">
            <span />
            {days.map((d) => (
              <span key={d.toISOString()} className="text-center text-xs font-semibold text-slate-700">
                {d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-8">
            <div className="flex flex-col">
              {HOUR_ROWS.map((h) => (
                <div key={h} className="h-16 flex items-start justify-end pr-2 text-[11px] text-gray-400 -translate-y-1.5">{h}</div>
              ))}
            </div>
            {Array.from({ length: 7 }, (_, dayIdx) => (
              <div key={dayIdx} className="relative border-l border-gray-100">
                {HOUR_ROWS.map((_, hIdx) => (
                  <div key={hIdx} className="h-16 border-b border-gray-50" />
                ))}
                {WEEKLY_BLOCKS.filter((b) => b.day === dayIdx).map((b, i) => (
                  <div
                    key={i}
                    style={{ top: `${b.hourIdx * 64 + 2}px`, height: `${b.span * 64 - 4}px` }}
                    className={`absolute left-1 right-1 rounded-md px-2 py-1 text-[11px] leading-tight cursor-pointer ${deptChipClass(b.color)} border border-white/60`}
                  >
                    <span className="block font-semibold truncate">{b.patient}</span>
                    <span className="block truncate opacity-80">{b.doctor.replace("Dr. ", "Dr. ")}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Daily view ---------- */

function DailyView() {
  return (
    <Card>
      <div className="flex flex-col divide-y divide-gray-100">
        {DOCTORS.slice(0, 6).map((d) => (
          <div key={d.id} className="flex items-center gap-4 py-3">
            <div className="w-44 shrink-0">
              <span className="text-sm font-semibold text-slate-900 block truncate">{d.name}</span>
              <span className="text-xs text-gray-400 block truncate">{d.specialty}</span>
            </div>
            <div className="flex-1 grid grid-cols-9 gap-1">
              {HOUR_ROWS.map((h, i) => {
                const busy = (d.id.charCodeAt(2) + i) % 4 === 0;
                return (
                  <div
                    key={h}
                    className={`h-9 rounded-md flex items-center justify-center text-[10px] font-medium ${
                      busy ? `${deptChipClass(d.color)} cursor-pointer` : "bg-gray-50 text-gray-300"
                    }`}
                    title={h}
                  >
                    {busy ? h : ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Timeline (resource) view ---------- */

function TimelineView() {
  return (
    <Card title="Resource Timeline — Today">
      <div className="flex flex-col gap-4">
        {DOCTORS.map((d) => {
          const busyStart = (d.id.charCodeAt(2) * 7) % 60;
          const busyWidth = 15 + ((d.id.charCodeAt(2) * 3) % 25);
          return (
            <div key={d.id} className="flex items-center gap-4">
              <div className="w-40 shrink-0 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${deptChipClass(d.color).split(" ")[0]}`} />
                <span className="text-sm font-medium text-slate-800 truncate">{d.name}</span>
              </div>
              <div className="flex-1 relative h-8 bg-gray-50 rounded-md overflow-hidden">
                <div
                  className={`absolute top-0 h-full rounded-md ${deptChipClass(d.color)} flex items-center px-2 text-[11px] font-semibold whitespace-nowrap`}
                  style={{ left: `${busyStart}%`, width: `${busyWidth}%` }}
                >
                  {d.department}
                </div>
              </div>
              <span className="w-20 text-right text-xs text-gray-400 shrink-0">{d.room}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- right sidebar ---------- */

function DoctorAvailabilityCard() {
  return (
    <Card title="Doctor Availability">
      <div className="flex flex-col divide-y divide-gray-100">
        {DOCTORS.slice(0, 5).map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-2 py-2.5">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{d.name}</span>
              <span className="text-xs text-gray-400 truncate">{d.department}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              On Duty
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LeavesCard() {
  return (
    <Card title="Blocked Periods & Leaves">
      <div className="flex flex-col gap-3">
        {LEAVES.map((l) => (
          <div key={l.doctor + l.type} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 text-violet-600 shrink-0">
              <Plane size={14} strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{l.doctor}</span>
              <span className="text-xs text-gray-500">{l.type} &middot; {l.range}</span>
            </div>
          </div>
        ))}
        {BLOCKED_PERIODS.map((b) => (
          <div key={b.doctor + b.reason} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 shrink-0">
              <Ban size={14} strokeWidth={2} />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{b.doctor}</span>
              <span className="text-xs text-gray-500">{b.reason} &middot; {b.range}</span>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Siren size={14} strokeWidth={2} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-800">Emergency Block Reserve</span>
            <span className="text-xs text-gray-500">2 slots held daily per department</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function LegendCard() {
  return (
    <Card title="Color Coding">
      <div className="flex flex-col gap-2">
        {DEPARTMENTS.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full shrink-0 ${deptChipClass(d.color).split(" ")[0]}`} />
            <span className="text-sm text-gray-700">{d.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ContextMenuHintCard() {
  return (
    <Card title="Quick Actions">
      <p className="text-sm text-gray-600 leading-relaxed">
        Right-click any appointment block for quick actions: reschedule, cancel, mark no-show, or transfer provider. Drag a block to a new time to instantly reschedule &mdash; conflicts are flagged automatically.
      </p>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <MoreVertical size={13} strokeWidth={2} />
        Right-click enabled on all views
      </div>
    </Card>
  );
}

/* ---------- page ---------- */

const VIEWS = [
  { icon: CalendarDays, label: "Monthly" },
  { icon: CalendarRange, label: "Weekly" },
  { icon: CalendarIcon, label: "Daily" },
  { icon: Rows3, label: "Timeline" },
];

export default function SlotCalendarManagementBoard() {
  const [view, setView] = useState("Monthly");
  const [viewDate, setViewDate] = useState(new Date());
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [facility, setFacility] = useState("");
  const [apptType, setApptType] = useState("");

  const step = view === "Monthly" ? "month" : "day";
  const goPrev = () => setViewDate((d) => (step === "month" ? addMonths(d, -1) : addDays(d, -1)));
  const goNext = () => setViewDate((d) => (step === "month" ? addMonths(d, 1) : addDays(d, 1)));
  const goToday = () => setViewDate(new Date());

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="Slot & Calendar Management" breadcrumb="Appointments & Queue > Slot & Calendar Management" />

      <StatsPanel />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <IconUnderlineTabs tabs={VIEWS} active={view} onChange={setView} />

          <FilterBar
            department={department} onDepartment={setDepartment}
            doctor={doctor} onDoctor={setDoctor}
            facility={facility} onFacility={setFacility}
            apptType={apptType} onApptType={setApptType}
            viewDate={viewDate} onPrev={goPrev} onNext={goNext} onToday={goToday}
          />

          {view === "Monthly" && <MonthlyView viewDate={viewDate} />}
          {view === "Weekly" && <WeeklyView viewDate={viewDate} />}
          {view === "Daily" && <DailyView />}
          {view === "Timeline" && <TimelineView />}
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <DoctorAvailabilityCard />
          <LeavesCard />
          <LegendCard />
          <ContextMenuHintCard />
        </div>
      </div>
    </div>
  );
}
