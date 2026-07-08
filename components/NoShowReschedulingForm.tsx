"use client";

import { useMemo, useState } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  CalendarClock,
  RotateCcw,
  X,
  Check,
  TrendingDown,
  TrendingUp,
  History,
  Sparkles,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import IconUnderlineTabs from "@/components/IconUnderlineTabs";
import { Card, Avatar, inputClass } from "@/components/FormFields";
import { StatusBadge } from "@/components/AppointmentBadges";
import { DOCTORS, appointmentId } from "@/lib/appointmentsQueueData";

type Row = {
  id: string;
  patient: string;
  mrn: string;
  initials: string;
  apptId: string;
  apptTime: string;
  department: string;
  doctor: string;
  reason: string;
  type: "No-Show" | "Cancelled" | "Late Arrival";
  contacted: { sms: boolean; email: boolean; call: boolean };
};

const ROWS: Row[] = [
  { id: "1", patient: "Nahom Zewdu", mrn: "MRN-2026-000133", initials: "NZ", apptId: appointmentId(1020), apptTime: "9:10 AM", department: "ENT", doctor: "Dr. Selam Fikru", reason: "No reason provided", type: "No-Show", contacted: { sms: true, email: false, call: false } },
  { id: "2", patient: "Aster Mulugeta", mrn: "MRN-2026-000134", initials: "AM", apptId: appointmentId(1018), apptTime: "8:50 AM", department: "Cardiology", doctor: "Dr. Yared Mekonnen", reason: "Patient called: transport delay", type: "Cancelled", contacted: { sms: true, email: true, call: true } },
  { id: "3", patient: "Girma Negash", mrn: "MRN-2026-000110", initials: "GN", apptId: appointmentId(1015), apptTime: "10:00 AM", department: "General Medicine", doctor: "Dr. Dawit Bekele", reason: "Arrived 45 min late — past grace period", type: "Late Arrival", contacted: { sms: false, email: false, call: false } },
  { id: "4", patient: "Wubet Alemayehu", mrn: "MRN-2026-000109", initials: "WA", apptId: appointmentId(1012), apptTime: "9:30 AM", department: "Pediatrics", doctor: "Dr. Hana Alemayehu", reason: "Child fell ill with unrelated condition", type: "Cancelled", contacted: { sms: true, email: false, call: true } },
  { id: "5", patient: "Tesfaye Mamo", mrn: "MRN-2026-000108", initials: "TM", apptId: appointmentId(1009), apptTime: "11:15 AM", department: "Orthopedics", doctor: "Dr. Samuel Tadesse", reason: "No reason provided", type: "No-Show", contacted: { sms: false, email: false, call: false } },
];

const TABS = ["Today's No-Shows", "Cancelled", "Late Arrivals"];

const KPIS = [
  { label: "No-Show Rate", value: "6.4%", trend: "down", tone: "text-emerald-600" },
  { label: "Cancellation Rate", value: "9.1%", trend: "up", tone: "text-amber-600" },
  { label: "Rescheduled", value: "18", trend: "up", tone: "text-teal-700" },
  { label: "Recovered Appointments", value: "12", trend: "up", tone: "text-emerald-600" },
];

function KpiRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {KPIS.map((k) => (
        <div key={k.label} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{k.label}</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-2xl font-heading font-semibold ${k.tone}`}>{k.value}</span>
            {k.trend === "down" ? (
              <TrendingDown size={15} strokeWidth={2.2} className="text-emerald-600" />
            ) : (
              <TrendingUp size={15} strokeWidth={2.2} className="text-amber-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactIcons({ contacted }: { contacted: Row["contacted"] }) {
  return (
    <div className="flex items-center gap-1">
      <span title="SMS" className={`w-6 h-6 flex items-center justify-center rounded-md ${contacted.sms ? "text-teal-700 bg-teal-50" : "text-gray-300 bg-gray-50"}`}>
        <MessageSquare size={12} strokeWidth={2} />
      </span>
      <span title="Email" className={`w-6 h-6 flex items-center justify-center rounded-md ${contacted.email ? "text-teal-700 bg-teal-50" : "text-gray-300 bg-gray-50"}`}>
        <Mail size={12} strokeWidth={2} />
      </span>
      <span title="Call" className={`w-6 h-6 flex items-center justify-center rounded-md ${contacted.call ? "text-teal-700 bg-teal-50" : "text-gray-300 bg-gray-50"}`}>
        <Phone size={12} strokeWidth={2} />
      </span>
    </div>
  );
}

const SUGGESTED_SLOTS = ["Tomorrow, 9:00 AM", "Tomorrow, 2:30 PM", "Thu, 10:15 AM", "Fri, 11:00 AM"];

function RescheduleWizard({ row, onClose, onConfirm }: { row: Row; onClose: () => void; onConfirm: () => void }) {
  const [slot, setSlot] = useState<string | null>(null);
  const doctor = DOCTORS.find((d) => d.name === row.doctor);
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Reschedule &mdash; {row.patient}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50">
        <Avatar initials={row.initials} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800">{doctor?.name ?? row.doctor}</span>
          <span className="text-xs text-gray-500">{row.department} &middot; {doctor?.room ?? "—"}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Suggested Slots</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2 mb-4">
        {SUGGESTED_SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={`h-10 rounded-md text-sm font-medium transition-colors ${
              slot === s ? "bg-teal-700 text-white" : "border border-teal-200 text-teal-700 hover:bg-teal-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!slot}
          className={`h-9 px-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-white transition-colors ${
            slot ? "bg-teal-700 hover:bg-teal-800" : "bg-teal-700/40 cursor-not-allowed"
          }`}
        >
          <Check size={14} strokeWidth={2.5} />
          Confirm Reschedule
        </button>
      </div>
    </Card>
  );
}

function RowCard({ row, onReschedule }: { row: Row; onReschedule: () => void }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <Avatar initials={row.initials} />
      <div className="flex flex-col min-w-0 w-44 shrink-0">
        <span className="text-sm font-semibold text-slate-900 truncate">{row.patient}</span>
        <span className="text-xs text-gray-400 truncate">{row.mrn}</span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm text-slate-800 truncate">{row.doctor} &middot; {row.department}</span>
        <span className="text-xs text-gray-400 truncate">{row.apptTime} &middot; {row.reason}</span>
      </div>
      <ContactIcons contacted={row.contacted} />
      <StatusBadge status={row.type === "No-Show" ? "No Show" : row.type === "Cancelled" ? "Cancelled" : "Rescheduled"} />
      <button
        type="button"
        onClick={onReschedule}
        className="h-8 px-3 inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 rounded-md text-xs font-semibold text-white transition-colors shrink-0"
      >
        <CalendarClock size={13} strokeWidth={2.2} />
        Reschedule
      </button>
    </div>
  );
}

function ContactHistoryCard() {
  const events = [
    { time: "8:45 AM", text: "SMS sent to Nahom Zewdu — no response", icon: MessageSquare },
    { time: "Yesterday, 4:10 PM", text: "Called Aster Mulugeta — rescheduled by phone", icon: Phone },
    { time: "Yesterday, 11:00 AM", text: "Email reminder sent to Wubet Alemayehu", icon: Mail },
  ];
  return (
    <Card title="Patient Contact History">
      <div className="flex flex-col gap-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 text-teal-700 shrink-0">
              <e.icon size={13} strokeWidth={2} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">{e.time}</span>
              <span className="text-sm text-gray-700 leading-snug">{e.text}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RebookSuggestionsCard() {
  return (
    <Card title="Rebook Suggestions">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-50/60 border border-teal-100">
        <Sparkles size={16} strokeWidth={2} className="text-teal-700 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-800 leading-relaxed">
          3 patients with repeated no-shows this month should be flagged for a reminder-call policy instead of SMS only.
        </p>
      </div>
    </Card>
  );
}

export default function NoShowReschedulingForm() {
  const [tab, setTab] = useState("Today's No-Shows");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rows, setRows] = useState(ROWS);

  const filtered = useMemo(() => {
    const map: Record<string, Row["type"]> = { "Today's No-Shows": "No-Show", "Cancelled": "Cancelled", "Late Arrivals": "Late Arrival" };
    return rows.filter((r) => r.type === map[tab]);
  }, [rows, tab]);

  const activeRow = rows.find((r) => r.id === reschedulingId) ?? null;

  const confirmReschedule = () => {
    if (!activeRow) return;
    setRows((prev) => prev.filter((r) => r.id !== activeRow.id));
    setReschedulingId(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="No-Show & Rescheduling" breadcrumb="Appointments & Queue > No-Show & Rescheduling" />

      <KpiRow />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {activeRow && (
            <RescheduleWizard row={activeRow} onClose={() => setReschedulingId(null)} onConfirm={confirmReschedule} />
          )}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <IconUnderlineTabs
              tabs={[
                { icon: History, label: "Today's No-Shows" },
                { icon: X, label: "Cancelled" },
                { icon: CalendarClock, label: "Late Arrivals" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="mt-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No records in this view.</p>
              ) : (
                filtered.map((r) => (
                  <RowCard key={r.id} row={r} onReschedule={() => setReschedulingId(r.id)} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <RebookSuggestionsCard />
          <ContactHistoryCard />
        </div>
      </div>
    </div>
  );
}
