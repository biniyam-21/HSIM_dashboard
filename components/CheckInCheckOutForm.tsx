"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ScanLine,
  QrCode,
  ShieldCheck,
  BadgeCheck,
  CircleCheck,
  Circle,
  Printer,
  Tag,
  FileText,
  ClipboardPlus,
  PlayCircle,
  LogOut,
  Star,
  CalendarPlus,
  X,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { Card, inputClass, Avatar } from "@/components/FormFields";
import { StatusBadge } from "@/components/AppointmentBadges";
import { PATIENTS, appointmentId, encounterId, type PatientLite } from "@/lib/appointmentsQueueData";

type Stage = "search" | "arrived" | "in-visit" | "checked-out";

const APPOINTMENT_CONTEXT = {
  id: appointmentId(1038),
  department: "General Medicine",
  doctor: "Dr. Dawit Bekele",
  time: "9:00 AM",
  visitType: "Follow-Up",
};

function ArrivalsRow({ p, onSelect }: { p: PatientLite; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-2.5 -mx-2.5 rounded-md hover:bg-gray-50 text-left transition-colors"
    >
      <Avatar photo={p.photo} initials={p.initials} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-slate-900 truncate">{p.name}</span>
        <span className="text-xs text-gray-400 truncate">{p.mrn}</span>
      </div>
      <StatusBadge status="Scheduled" />
    </button>
  );
}

function TodaysArrivalsCard({ onSelect }: { onSelect: (p: PatientLite) => void }) {
  return (
    <Card title="Today's Arrivals">
      <div className="flex flex-col divide-y divide-gray-100">
        {PATIENTS.slice(0, 5).map((p) => (
          <ArrivalsRow key={p.id} p={p} onSelect={() => onSelect(p)} />
        ))}
      </div>
    </Card>
  );
}

function CheckInStatsCard() {
  const stats = [
    { label: "Checked In Today", value: "41" },
    { label: "Pending Arrivals", value: "9" },
    { label: "Avg Check-In Time", value: "2m 10s" },
  ];
  return (
    <Card title="Reception Stats">
      <div className="flex flex-col gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{s.label}</span>
            <span className="text-sm font-bold text-slate-900">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SearchStage({
  query,
  onQuery,
  results,
  onSelect,
}: {
  query: string;
  onQuery: (v: string) => void;
  results: PatientLite[];
  onSelect: (p: PatientLite) => void;
}) {
  return (
    <Card title="Find Patient">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search by name, MRN, or phone number"
              className={`${inputClass} pl-9`}
            />
            <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-teal-700 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors whitespace-nowrap">
            <ScanLine size={15} strokeWidth={2} />
            Scan QR
          </button>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <QrCode size={15} strokeWidth={2} />
            Scan Barcode
          </button>
        </div>

        <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <Avatar photo={p.photo} initials={p.initials} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{p.name}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{p.mrn} &middot; {p.phone}</span>
              </div>
              <StatusBadge status="Scheduled" />
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ChecklistItem({
  label,
  done,
  onToggle,
}: {
  label: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2.5 w-full text-left">
      {done ? (
        <CircleCheck size={18} strokeWidth={2} className="text-emerald-600 shrink-0" />
      ) : (
        <Circle size={18} strokeWidth={1.8} className="text-gray-300 shrink-0" />
      )}
      <span className={`text-sm ${done ? "text-slate-700" : "text-gray-500"}`}>{label}</span>
      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${done ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
        {done ? "Complete" : "Pending"}
      </span>
    </button>
  );
}

function ArrivedStage({
  patient,
  checklist,
  onToggleChecklist,
  onCheckIn,
  onStartVisit,
  onCheckOut,
  stage,
}: {
  patient: PatientLite;
  checklist: Record<string, boolean>;
  onToggleChecklist: (key: string) => void;
  onCheckIn: () => void;
  onStartVisit: () => void;
  onCheckOut: () => void;
  stage: Stage;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar photo={patient.photo} initials={patient.initials} />
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">{patient.name}</span>
              <span className="text-sm text-gray-500">{patient.mrn} &middot; {patient.gender} / {patient.age}Y &middot; {patient.phone}</span>
            </div>
          </div>
          <StatusBadge status={stage === "search" ? "Scheduled" : stage === "arrived" ? "Checked In" : stage === "in-visit" ? "In Progress" : "Completed"} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Appointment</span>
            <span className="text-sm font-mono font-medium text-slate-800">{APPOINTMENT_CONTEXT.id}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Department / Doctor</span>
            <span className="text-sm font-medium text-slate-800">{APPOINTMENT_CONTEXT.doctor}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Time / Visit Type</span>
            <span className="text-sm font-medium text-slate-800">{APPOINTMENT_CONTEXT.time} &middot; {APPOINTMENT_CONTEXT.visitType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Insurance</span>
            <span className="text-sm font-medium text-slate-800">{patient.insurance}</span>
          </div>
        </div>
      </Card>

      <Card title="Identity & Insurance Verification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <ShieldCheck size={20} strokeWidth={2} className="text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-800">Fayda ID Verified</span>
              <span className="text-xs text-emerald-700">National ID matched biometric record</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50 border border-emerald-100">
            <BadgeCheck size={20} strokeWidth={2} className="text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-800">Insurance Eligible</span>
              <span className="text-xs text-emerald-700">{patient.insurance} &middot; Active coverage confirmed</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Pre-Visit Checklist">
        <div className="flex flex-col gap-3.5">
          <ChecklistItem label="Arrival confirmed at reception" done={checklist.arrival} onToggle={() => onToggleChecklist("arrival")} />
          <ChecklistItem label="Vitals recorded (BP, Temp, Weight)" done={checklist.vitals} onToggle={() => onToggleChecklist("vitals")} />
          <ChecklistItem label="Consent / intake forms signed" done={checklist.forms} onToggle={() => onToggleChecklist("forms")} />
          <ChecklistItem label="Co-payment collected" done={checklist.payment} onToggle={() => onToggleChecklist("payment")} />
        </div>
      </Card>

      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCheckIn}
            disabled={stage !== "search"}
            className="h-10 px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/30 disabled:cursor-not-allowed rounded-md text-sm font-semibold text-white transition-colors"
          >
            <CircleCheck size={15} strokeWidth={2.2} />
            Check In
          </button>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Printer size={15} strokeWidth={2} />
            Print Queue Ticket
          </button>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Tag size={15} strokeWidth={2} />
            Print Labels
          </button>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FileText size={15} strokeWidth={2} />
            Print Visit Slip
          </button>
          <button type="button" className="h-10 px-4 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ClipboardPlus size={15} strokeWidth={2} />
            Generate Encounter
          </button>
          <button
            type="button"
            onClick={onStartVisit}
            disabled={stage !== "arrived"}
            className="h-10 px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/30 disabled:cursor-not-allowed rounded-md text-sm font-semibold text-white transition-colors"
          >
            <PlayCircle size={15} strokeWidth={2.2} />
            Start Visit
          </button>
          <button
            type="button"
            onClick={onCheckOut}
            disabled={stage !== "in-visit"}
            className="h-10 px-4 inline-flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-sm font-semibold transition-colors"
          >
            <LogOut size={15} strokeWidth={2.2} />
            Check Out
          </button>
        </div>
      </Card>
    </div>
  );
}

function CheckedOutStage({ patient }: { patient: PatientLite }) {
  const [feedback, setFeedback] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <Card title="Visit Summary">
        <div className="flex flex-col divide-y divide-gray-100">
          {[
            { label: "Patient", value: `${patient.name} (${patient.mrn})` },
            { label: "Encounter", value: encounterId(2210) },
            { label: "Department / Doctor", value: `${APPOINTMENT_CONTEXT.department} — ${APPOINTMENT_CONTEXT.doctor}` },
            { label: "Duration", value: "28 minutes" },
            { label: "Outcome", value: "Consultation completed, prescription issued" },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">{r.label}</span>
              <span className="text-sm font-semibold text-slate-900">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Follow-Up Scheduling">
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-teal-50/60 border border-teal-100">
          <CalendarPlus size={20} strokeWidth={2} className="text-teal-700 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-900">Follow-up recommended in 2 weeks</p>
            <p className="text-xs text-teal-700 mt-0.5">General Medicine with Dr. Dawit Bekele</p>
          </div>
          <button type="button" className="h-9 px-4 inline-flex items-center bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors whitespace-nowrap">
            Schedule Now
          </button>
        </div>
      </Card>

      <Card title="Patient Feedback">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setFeedback(n)} aria-label={`Rate ${n} stars`}>
              <Star size={26} strokeWidth={1.5} className={n <= feedback ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-2">{feedback > 0 ? `${feedback} / 5` : "Not rated yet"}</span>
        </div>
      </Card>
    </div>
  );
}

export default function CheckInCheckOutForm() {
  const [stage, setStage] = useState<Stage>("search");
  const [query, setQuery] = useState("");
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [checklist, setChecklist] = useState({ arrival: true, vitals: false, forms: false, payment: false });

  const results = useMemo(() => {
    if (!query.trim()) return PATIENTS.slice(0, 6);
    const q = query.toLowerCase();
    return PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q));
  }, [query]);

  const selectPatient = (p: PatientLite) => {
    setPatient(p);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="Check-In / Check-Out" breadcrumb="Appointments & Queue > Check-In / Check-Out" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {!patient && <SearchStage query={query} onQuery={setQuery} results={results} onSelect={selectPatient} />}

          {patient && stage !== "checked-out" && (
            <ArrivedStage
              patient={patient}
              checklist={checklist}
              onToggleChecklist={(k) => setChecklist((c) => ({ ...c, [k]: !c[k as keyof typeof c] }))}
              onCheckIn={() => setStage("arrived")}
              onStartVisit={() => setStage("in-visit")}
              onCheckOut={() => setStage("checked-out")}
              stage={stage}
            />
          )}

          {patient && stage === "checked-out" && <CheckedOutStage patient={patient} />}

          {patient && (
            <button
              type="button"
              onClick={() => {
                setPatient(null);
                setStage("search");
                setChecklist({ arrival: true, vitals: false, forms: false, payment: false });
              }}
              className="self-start text-sm font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5"
            >
              <X size={14} strokeWidth={2} />
              Clear and search another patient
            </button>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <TodaysArrivalsCard onSelect={selectPatient} />
          <CheckInStatsCard />
        </div>
      </div>
    </div>
  );
}
