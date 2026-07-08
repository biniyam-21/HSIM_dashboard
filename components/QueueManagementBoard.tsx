"use client";

import { useMemo, useState } from "react";
import {
  PhoneCall,
  SkipForward,
  ArrowRightLeft,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Search,
  Siren,
  Crown,
  Heart,
  Baby,
  UserCog,
  TrendingUp,
  Clock3,
  Users,
  Activity,
  AlertOctagon,
  History,
  BarChart3,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import IconUnderlineTabs from "@/components/IconUnderlineTabs";
import { Card, FieldLabel, Avatar, inputClass } from "@/components/FormFields";
import { QueueBadge, PriorityBadge } from "@/components/AppointmentBadges";
import { FilterPopoverButton, FilterChips, useSessionFilters, type FilterChip } from "@/components/TableFilters";
import { DEPARTMENTS, DOCTORS, deptChipClass, queueToken, type QueueStatus, type Priority } from "@/lib/appointmentsQueueData";

/* ---------- mock queue ---------- */

type Ticket = {
  id: string;
  token: string;
  patient: string;
  mrn: string;
  initials: string;
  apptTime: string;
  department: string;
  doctor: string;
  arrived: string;
  elapsed: string;
  elapsedMin: number;
  estWait: string;
  priority: Priority;
  status: QueueStatus;
};

const INITIAL_TICKETS: Ticket[] = [
  { id: "1", token: queueToken("GM", 24), patient: "Abebe Bekele", mrn: "MRN-2026-000123", initials: "AB", apptTime: "9:00 AM", department: "General Medicine", doctor: "Dr. Dawit Bekele", arrived: "8:52 AM", elapsed: "38 min", elapsedMin: 38, estWait: "5 min", priority: "Routine", status: "Waiting" },
  { id: "2", token: queueToken("ER", 5), patient: "Bereket Haile", mrn: "MRN-2026-000131", initials: "BH", apptTime: "Walk-in", department: "Emergency", doctor: "Dr. Bethlehem Assefa", arrived: "9:27 AM", elapsed: "3 min", elapsedMin: 3, estWait: "Now", priority: "Emergency", status: "Called" },
  { id: "3", token: queueToken("CD", 11), patient: "Tigist Worku", mrn: "MRN-2026-000129", initials: "TW", apptTime: "9:15 AM", department: "Cardiology", doctor: "Dr. Yared Mekonnen", arrived: "9:10 AM", elapsed: "18 min", elapsedMin: 18, estWait: "2 min", priority: "Urgent", status: "Waiting" },
  { id: "4", token: queueToken("PD", 7), patient: "Helen Tesfaye", mrn: "MRN-2026-000127", initials: "HT", apptTime: "9:00 AM", department: "Pediatrics", doctor: "Dr. Hana Alemayehu", arrived: "8:55 AM", elapsed: "34 min", elapsedMin: 34, estWait: "8 min", priority: "Routine", status: "Waiting" },
  { id: "5", token: queueToken("GM", 23), patient: "Getnet Aschale", mrn: "MRN-2026-000128", initials: "GA", apptTime: "8:45 AM", department: "General Medicine", doctor: "Dr. Dawit Bekele", arrived: "8:40 AM", elapsed: "49 min", elapsedMin: 49, estWait: "0 min", priority: "High Risk", status: "Serving" },
  { id: "6", token: queueToken("OB", 3), patient: "Meron Alemu", mrn: "MRN-2026-000125", initials: "MA", apptTime: "9:30 AM", department: "OB/GYN", doctor: "Dr. Ruth Girma", arrived: "9:20 AM", elapsed: "9 min", elapsedMin: 9, estWait: "12 min", priority: "Urgent", status: "Waiting" },
  { id: "7", token: queueToken("OR", 6), patient: "Yonas Tadesse", mrn: "MRN-2026-000126", initials: "YT", apptTime: "9:00 AM", department: "Orthopedics", doctor: "Dr. Samuel Tadesse", arrived: "9:05 AM", elapsed: "24 min", elapsedMin: 24, estWait: "6 min", priority: "VIP", status: "Waiting" },
  { id: "8", token: queueToken("GM", 22), patient: "Frehiwot Solomon", mrn: "MRN-2026-000132", initials: "FS", apptTime: "8:30 AM", department: "General Medicine", doctor: "Dr. Dawit Bekele", arrived: "8:31 AM", elapsed: "58 min", elapsedMin: 58, estWait: "—", priority: "Routine", status: "Completed" },
  { id: "9", token: queueToken("EN", 2), patient: "Nahom Zewdu", mrn: "MRN-2026-000133", initials: "NZ", apptTime: "9:10 AM", department: "ENT", doctor: "Dr. Selam Fikru", arrived: "—", elapsed: "—", elapsedMin: 0, estWait: "—", priority: "Routine", status: "Missed" },
  { id: "10", token: queueToken("NR", 4), patient: "Kalkidan Girma", mrn: "MRN-2026-000130", initials: "KG", apptTime: "9:20 AM", department: "Neurology", doctor: "Dr. Getachew Wolde", arrived: "9:18 AM", elapsed: "12 min", elapsedMin: 12, estWait: "4 min", priority: "Routine", status: "Transferred" },
  { id: "11", token: queueToken("CD", 10), patient: "Aster Mulugeta", mrn: "MRN-2026-000134", initials: "AM", apptTime: "8:50 AM", department: "Cardiology", doctor: "Dr. Yared Mekonnen", arrived: "8:48 AM", elapsed: "41 min", elapsedMin: 41, estWait: "—", priority: "Urgent", status: "Cancelled" },
  { id: "12", token: queueToken("PD", 6), patient: "Selamawit Desta", mrn: "MRN-2026-000124", initials: "SD", apptTime: "9:05 AM", department: "Pediatrics", doctor: "Dr. Hana Alemayehu", arrived: "9:00 AM", elapsed: "29 min", elapsedMin: 29, estWait: "10 min", priority: "Routine", status: "Waiting" },
];

const TABS = ["All Queue", "Now Serving", "Waiting", "Completed", "Missed", "Transferred"];

const KPI = [
  { icon: Users, label: "In Queue", value: "7", tone: "text-slate-900", bg: "bg-slate-50" },
  { icon: Activity, label: "Now Serving", value: "1", tone: "text-emerald-700", bg: "bg-emerald-50" },
  { icon: Clock3, label: "Avg Wait Time", value: "22 min", tone: "text-amber-700", bg: "bg-amber-50" },
  { icon: CheckCircle2, label: "Completed Today", value: "34", tone: "text-teal-700", bg: "bg-teal-50" },
  { icon: AlertOctagon, label: "Missed / Cancelled", value: "3", tone: "text-red-600", bg: "bg-red-50" },
];

function KpiRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {KPI.map((k) => (
        <div key={k.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center gap-3">
          <span className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${k.bg} ${k.tone}`}>
            <k.icon size={18} strokeWidth={2} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate">{k.label}</span>
            <span className={`text-xl font-heading font-semibold ${k.tone}`}>{k.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SmartQueueBanner() {
  return (
    <div className="flex items-start gap-3 bg-indigo-50/70 border border-indigo-100 rounded-lg p-4">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white text-indigo-600 shrink-0 shadow-sm">
        <TrendingUp size={17} strokeWidth={2} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-indigo-900">Smart Queue is reordering automatically</p>
        <p className="text-xs text-indigo-700 mt-0.5">
          Detected: Dr. Dawit Bekele running 12 minutes behind schedule. 2 routine patients bumped after 1 emergency walk-in. Late arrival grace period: 10 minutes.
        </p>
      </div>
      <span className="text-xs font-semibold text-indigo-600 bg-white rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap">Auto-reorder: ON</span>
    </div>
  );
}

const ACTIONS: { key: string; icon: typeof PhoneCall; label: string; color: string; appliesTo: QueueStatus[] }[] = [
  { key: "call", icon: PhoneCall, label: "Call", color: "text-teal-700 hover:bg-teal-50", appliesTo: ["Waiting"] },
  { key: "skip", icon: SkipForward, label: "Skip", color: "text-amber-600 hover:bg-amber-50", appliesTo: ["Called", "Waiting"] },
  { key: "transfer", icon: ArrowRightLeft, label: "Transfer", color: "text-violet-600 hover:bg-violet-50", appliesTo: ["Waiting", "Called"] },
  { key: "complete", icon: CheckCircle2, label: "Complete", color: "text-emerald-600 hover:bg-emerald-50", appliesTo: ["Serving", "Called"] },
  { key: "hold", icon: PauseCircle, label: "Hold", color: "text-gray-500 hover:bg-gray-100", appliesTo: ["Waiting", "Called"] },
  { key: "cancel", icon: XCircle, label: "Cancel", color: "text-red-600 hover:bg-red-50", appliesTo: ["Waiting", "Called"] },
];

function QueueTable({
  tickets,
  onAction,
}: {
  tickets: Ticket[];
  onAction: (id: string, action: string) => void;
}) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-[1000px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {["Token", "Patient", "Appt Time", "Department / Doctor", "Elapsed", "Est. Wait", "Priority", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2.5 pr-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr><td colSpan={9} className="py-12 text-center text-sm text-gray-400">No patients in this queue view.</td></tr>
          ) : (
            tickets.map((t) => {
              const urgent = t.priority === "Emergency" || t.priority === "High Risk";
              return (
                <tr key={t.id} className={`border-b border-gray-100 last:border-0 transition-colors ${urgent ? "bg-red-50/40" : "hover:bg-gray-50/50"}`}>
                  <td className="py-3 pr-4 font-mono text-sm font-semibold text-slate-700 whitespace-nowrap">{t.token}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={t.initials} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{t.patient}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{t.mrn}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{t.apptTime}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 whitespace-nowrap">{t.doctor}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{t.department}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className={`font-medium ${t.elapsedMin > 40 ? "text-red-600" : t.elapsedMin > 20 ? "text-amber-600" : "text-gray-600"}`}>{t.elapsed}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{t.estWait}</td>
                  <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="py-3 pr-4"><QueueBadge status={t.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-0.5">
                      {ACTIONS.filter((a) => a.appliesTo.includes(t.status)).map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          aria-label={a.label}
                          title={a.label}
                          onClick={() => onAction(t.id, a.key)}
                          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${a.color}`}
                        >
                          <a.icon size={14} strokeWidth={2} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- right sidebar ---------- */

const PRIORITY_GROUPS = [
  { icon: Siren, label: "Emergency Patients", color: "text-red-600 bg-red-50", count: 1 },
  { icon: Crown, label: "VIP", color: "text-violet-600 bg-violet-50", count: 1 },
  { icon: UserCog, label: "Senior Citizens", color: "text-amber-600 bg-amber-50", count: 2 },
  { icon: Heart, label: "Pregnant Women", color: "text-pink-600 bg-pink-50", count: 1 },
  { icon: Baby, label: "Children", color: "text-sky-600 bg-sky-50", count: 2 },
];

function PriorityPatientsCard() {
  return (
    <Card title="Priority Patients">
      <div className="flex flex-col gap-2.5">
        {PRIORITY_GROUPS.map((g) => (
          <div key={g.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${g.color}`}>
                <g.icon size={15} strokeWidth={2} />
              </span>
              <span className="text-sm text-gray-700">{g.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{g.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const HEATMAP = [
  { dept: "General Medicine", load: 82 },
  { dept: "Emergency", load: 95 },
  { dept: "Pediatrics", load: 60 },
  { dept: "Cardiology", load: 45 },
  { dept: "OB/GYN", load: 38 },
  { dept: "Orthopedics", load: 52 },
];

function HeatMapCard() {
  return (
    <Card title="Queue Heat Map">
      <div className="flex flex-col gap-3">
        {HEATMAP.map((h) => (
          <div key={h.dept} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">{h.dept}</span>
              <span className="text-gray-400">{h.load}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${h.load > 80 ? "bg-red-500" : h.load > 55 ? "bg-amber-500" : "bg-teal-600"}`}
                style={{ width: `${h.load}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const TIMELINE_EVENTS = [
  { time: "9:27 AM", text: "Bereket Haile called — Emergency, Dr. Bethlehem Assefa", icon: PhoneCall, color: "text-teal-700" },
  { time: "9:18 AM", text: "Kalkidan Girma transferred to Neurology", icon: ArrowRightLeft, color: "text-violet-600" },
  { time: "9:12 AM", text: "Nahom Zewdu marked as missed (no-show, 15 min grace expired)", icon: XCircle, color: "text-red-600" },
  { time: "8:55 AM", text: "Getnet Aschale moved to Now Serving", icon: CheckCircle2, color: "text-emerald-600" },
];

function QueueTimelineCard() {
  return (
    <Card title="Queue Timeline">
      <div className="flex flex-col gap-4">
        {TIMELINE_EVENTS.map((e, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 shrink-0 ${e.color}`}>
                <e.icon size={13} strokeWidth={2} />
              </span>
              {i !== TIMELINE_EVENTS.length - 1 && <span className="w-px flex-1 bg-gray-100 mt-1" />}
            </div>
            <div className="flex flex-col pb-3">
              <span className="text-xs text-gray-400 whitespace-nowrap">{e.time}</span>
              <span className="text-sm text-gray-700 leading-snug">{e.text}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- page ---------- */

type QueueFilters = { department: string; priority: string };
const EMPTY_QUEUE_FILTERS: QueueFilters = { department: "", priority: "" };

export default function QueueManagementBoard() {
  const [tab, setTab] = useState("All Queue");
  const [filters, setFilters] = useSessionFilters<QueueFilters>("queue-management-filters", EMPTY_QUEUE_FILTERS);
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (tab === "Now Serving" && t.status !== "Serving") return false;
      if (tab === "Waiting" && !["Waiting", "Called"].includes(t.status)) return false;
      if (tab === "Completed" && t.status !== "Completed") return false;
      if (tab === "Missed" && t.status !== "Missed") return false;
      if (tab === "Transferred" && t.status !== "Transferred") return false;
      if (filters.department && t.department !== filters.department) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (query && !t.patient.toLowerCase().includes(query.toLowerCase()) && !t.mrn.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [tickets, tab, filters, query]);

  const activeCount = (filters.department ? 1 : 0) + (filters.priority ? 1 : 0);
  const chips: FilterChip[] = [
    ...(filters.department ? [{ key: "department", label: "Department", value: filters.department }] : []),
    ...(filters.priority ? [{ key: "priority", label: "Priority", value: filters.priority }] : []),
  ];
  const removeChip = (key: string) => setFilters((f) => ({ ...f, [key]: "" }));

  const handleAction = (id: string, action: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (action === "call") return { ...t, status: "Called" };
        if (action === "skip") return { ...t, status: "Waiting" };
        if (action === "transfer") return { ...t, status: "Transferred" };
        if (action === "complete") return { ...t, status: "Completed", estWait: "—" };
        if (action === "hold") return { ...t, status: "Waiting" };
        if (action === "cancel") return { ...t, status: "Cancelled" };
        return t;
      })
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="Queue Management" breadcrumb="Appointments & Queue > Queue Management" />

      <KpiRow />
      <SmartQueueBanner />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <IconUnderlineTabs
                tabs={TABS.map((t) => ({ icon: t === "All Queue" ? Users : t === "Now Serving" ? Activity : t === "Waiting" ? Clock3 : t === "Completed" ? CheckCircle2 : t === "Missed" ? AlertOctagon : ArrowRightLeft, label: t }))}
                active={tab}
                onChange={setTab}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patient name or MRN"
                  className={`${inputClass} pl-9`}
                />
                <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <FilterPopoverButton activeCount={activeCount}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <FieldLabel>Department</FieldLabel>
                    <div className="relative">
                      <select
                        value={filters.department}
                        onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                        className={`${inputClass} bg-white`}
                      >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel>Priority</FieldLabel>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="">All Priorities</option>
                      {["Routine", "Urgent", "Emergency", "VIP", "High Risk"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </FilterPopoverButton>
            </div>
            <FilterChips chips={chips} onRemove={removeChip} onClearAll={() => setFilters(EMPTY_QUEUE_FILTERS)} />
            <QueueTable tickets={filtered} onAction={handleAction} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <PriorityPatientsCard />
          <HeatMapCard />
          <QueueTimelineCard />
        </div>
      </div>
    </div>
  );
}
