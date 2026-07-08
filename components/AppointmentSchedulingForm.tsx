"use client";

import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  ChevronDown,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Info,
  Clock,
  CalendarClock,
  CalendarCheck2,
  Languages,
  Sparkles,
  X,
  CheckCircle2,
  Users,
  Phone,
  ScanLine,
  IdCard,
  History,
  SlidersHorizontal,
  Timer,
  UserCheck,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import ModulePageHeader from "@/components/ModulePageHeader";
import DatePicker from "@/components/DatePicker";
import Stepper from "@/components/Stepper";
import { Card, FieldLabel, TextField, SelectField, inputClass, Avatar } from "@/components/FormFields";
import { StatusBadge, PriorityBadge } from "@/components/AppointmentBadges";
import { FilterPopoverButton } from "@/components/TableFilters";
import {
  DEPARTMENTS,
  DOCTORS,
  PATIENTS,
  INSURANCE_OPTIONS,
  VISIT_TYPES,
  APPOINTMENT_TYPES,
  REFERRAL_SOURCES,
  LANGUAGES,
  appointmentId,
  deptChipClass,
  type PatientLite,
  type Priority,
} from "@/lib/appointmentsQueueData";

const STEPS = ["Find / Register Patient", "Visit Details", "Provider & Slot", "Review & Confirm"];

/* =========================================================================
   Right sidebar cards — persistent context across the whole wizard
   ========================================================================= */

function PatientSummaryCard({ patient }: { patient: PatientLite | null }) {
  if (!patient) {
    return (
      <Card title="Patient Summary">
        <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center">
          <Users size={20} strokeWidth={1.6} className="text-gray-300" />
          <span className="text-xs text-gray-400">Select or register a patient to see a summary here.</span>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-slate-900">Patient Summary</h2>
        {patient.verified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
            <BadgeCheck size={11} strokeWidth={2.5} />
            Verified
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Avatar photo={patient.photo} initials={patient.initials} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 leading-tight truncate">{patient.name}</span>
          <span className="text-xs text-gray-400 leading-tight">{patient.mrn}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Phone</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 leading-none">{patient.phone}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Insurance</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 leading-none">{patient.insurance}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Address</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 leading-none truncate">{patient.address}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-none">Last Visit</span>
          <span className="text-xs font-semibold text-slate-800 mt-1 leading-none">{patient.lastVisit}</span>
        </div>
      </div>
    </Card>
  );
}

const TODAY_SCHEDULE = [
  { doctor: "Dr. Dawit Bekele", dept: "General Medicine", booked: 9, capacity: 14, next: "10:30 AM" },
  { doctor: "Dr. Hana Alemayehu", dept: "Pediatrics", booked: 12, capacity: 12, next: "Fully Booked" },
  { doctor: "Dr. Samuel Tadesse", dept: "Orthopedics", booked: 6, capacity: 10, next: "11:00 AM" },
  { doctor: "Dr. Ruth Girma", dept: "OB/GYN", booked: 8, capacity: 12, next: "1:15 PM" },
];

function TodayScheduleCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Today&apos;s Provider Schedule</h2>
        <Link href="/modules/appointments-queue/slot-calendar-management" className="text-[11px] font-semibold text-teal-700 hover:underline whitespace-nowrap">
          View full calendar &rarr;
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {TODAY_SCHEDULE.map((s) => {
          const pct = Math.round((s.booked / s.capacity) * 100);
          const full = s.booked >= s.capacity;
          const initials = s.doctor.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");
          return (
            <div key={s.doctor} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <Avatar initials={initials} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-slate-900 leading-tight truncate">{s.doctor}</span>
                  <span className="text-xs text-gray-400 leading-tight truncate">{s.dept}</span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-xs font-semibold whitespace-nowrap ${full ? "text-red-600" : "text-teal-700"}`}>
                    {s.next}
                  </span>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{s.booked} / {s.capacity}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${full ? "bg-red-400" : "bg-teal-600"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const QUICK_STATS = [
  { icon: CalendarCheck2, label: "Total", title: "Today's Appointments", value: "58", tone: "text-teal-700 bg-teal-50" },
  { icon: SlidersHorizontal, label: "Open", title: "Available Slots", value: "16", tone: "text-sky-700 bg-sky-50" },
  { icon: Timer, label: "min", title: "Avg. Wait Time", value: "24", tone: "text-amber-700 bg-amber-50" },
  { icon: UserCheck, label: "Patients", title: "Checked In", value: "22", tone: "text-emerald-700 bg-emerald-50" },
];

function QuickStatsCard() {
  return (
    <Card>
      <div className="grid grid-cols-4 gap-2">
        {QUICK_STATS.map((s) => (
          <div key={s.title} title={s.title} className="flex flex-col items-center gap-1.5 py-2 rounded-lg border border-gray-100">
            <span className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${s.tone}`}>
              <s.icon size={13} strokeWidth={2.2} />
            </span>
            <span className="text-lg font-heading font-bold text-slate-900 leading-none">{s.value}</span>
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide leading-none">{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const NEXT_SLOTS = [
  { time: "10:00 AM", doctor: "Dr. Dawit Bekele" },
  { time: "10:30 AM", doctor: "Dr. Samuel Tadesse" },
  { time: "11:15 AM", doctor: "Dr. Yared Mekonnen" },
  { time: "1:15 PM", doctor: "Dr. Ruth Girma" },
];

function NextSlotsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Next Available Slots</h2>
        <Link href="/modules/appointments-queue/slot-calendar-management" className="text-[11px] font-semibold text-teal-700 hover:underline whitespace-nowrap">
          View all slots &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {NEXT_SLOTS.map((s) => (
          <div key={s.time + s.doctor} className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-teal-50/60 border border-teal-100">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-800">
              <Clock size={11} strokeWidth={2.2} />
              {s.time}
            </span>
            <span className="text-[10px] text-teal-700/70 truncate max-w-full px-1">{s.doctor}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const WAITING_NOW = [
  { name: "Getnet Aschale", dept: "General Medicine", waiting: 24 },
  { name: "Tigist Worku", dept: "Cardiology", waiting: 11 },
  { name: "Bereket Haile", dept: "Emergency", waiting: 3 },
];

function WaitingQueueLiveCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          Waiting Queue
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
        </h2>
        <Link href="/modules/appointments-queue/queue-management" className="text-[11px] font-semibold text-teal-700 hover:underline whitespace-nowrap">
          View full queue &rarr;
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {WAITING_NOW.map((w) => (
          <div key={w.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar initials={w.name.split(" ").map((n) => n[0]).join("")} />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-sm font-medium text-slate-800 truncate">{w.name}</span>
                <span className="text-xs text-gray-400 truncate">{w.dept}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-500 whitespace-nowrap shrink-0">{w.waiting} min</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const RECENT_BOOKINGS = [
  { id: appointmentId(1042), patient: "Aster Mulugeta", dept: "Cardiology", time: "Today, 2:30 PM" },
  { id: appointmentId(1041), patient: "Nahom Zewdu", dept: "ENT", time: "Today, 3:00 PM" },
  { id: appointmentId(1040), patient: "Frehiwot Solomon", dept: "General Medicine", time: "Tomorrow, 9:15 AM" },
];

function RecentBookingsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Recently Booked</h2>
        <button type="button" className="text-[11px] font-semibold text-teal-700 hover:underline whitespace-nowrap">
          View all &rarr;
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {RECENT_BOOKINGS.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-sm font-medium text-slate-800 truncate">{b.patient}</span>
              <span className="text-xs text-gray-400 truncate">{b.dept} &middot; {b.time}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap shrink-0">{b.id}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =========================================================================
   STEP 1 — Find / Register Patient
   ========================================================================= */

const QUICK_ACTIONS = [
  { icon: Phone, title: "Search by Phone", subtitle: "Find patient by phone number" },
  { icon: IdCard, title: "Search by National ID", subtitle: "Search using national ID" },
  { icon: ScanLine, title: "Scan ID Card", subtitle: "Use camera to scan ID" },
  { icon: History, title: "Recent Patients", subtitle: "View recently searched" },
];

function FindRegisterStep({
  query,
  onQuery,
  results,
  selected,
  onSelect,
  showRegister,
  onToggleRegister,
}: {
  query: string;
  onQuery: (v: string) => void;
  results: PatientLite[];
  selected: PatientLite | null;
  onSelect: (p: PatientLite) => void;
  showRegister: boolean;
  onToggleRegister: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-3.5">
          <h2 className="text-lg font-semibold text-slate-900 leading-tight">Find Existing Patient</h2>
          <p className="text-xs text-gray-500 mt-0.5">Search by name, MRN, phone number or national ID</p>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search patient by name, MRN, phone number or national ID…"
              className={`${inputClass} pl-9`}
            />
            <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <FilterPopoverButton activeCount={0}>
            <div className="flex flex-col gap-4">
              <SelectField label="Gender" options={["Male", "Female"]} placeholder="Any gender" />
              <SelectField label="Insurance" options={INSURANCE_OPTIONS as unknown as string[]} placeholder="Any insurance" />
              <div className="flex items-center gap-2.5">
                <input type="checkbox" id="verified-only" className="w-4 h-4 rounded border-gray-300 text-teal-700 focus:ring-teal-700" />
                <label htmlFor="verified-only" className="text-sm text-gray-700">Verified patients only</label>
              </div>
            </div>
          </FilterPopoverButton>
        </div>

        <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden max-h-[360px] overflow-y-auto mt-3">
          {results.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">No patients match &quot;{query}&quot;.</div>
          )}
          {results.map((p) => {
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className={`flex items-center gap-3 py-5 px-3 text-left transition-colors ${
                  isSelected ? "bg-teal-50/70" : "hover:bg-gray-50"
                }`}
              >
                <Avatar photo={p.photo} initials={p.initials} />
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{p.name}</span>
                    {p.verified && (
                      <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
                        Verified
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {p.mrn} &middot; {p.gender} &middot; {p.age}Y &middot; {p.dob}
                  </span>
                </div>
                <div className="hidden sm:flex flex-1 items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 whitespace-nowrap">
                    <Phone size={14} strokeWidth={2.2} />
                    {p.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-700 text-white shrink-0">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800">Can&apos;t find the patient?</span>
            <span className="text-xs text-gray-500">Quickly register a new patient and continue with appointment scheduling.</span>
          </div>
          <button
            type="button"
            onClick={onToggleRegister}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus size={14} strokeWidth={2.2} />
            Register New Patient
          </button>
        </div>
      </Card>

      {showRegister && (
        <Card title="Quick Register New Patient">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextField label="Full Name" required placeholder="e.g. Meskerem Alemu" />
            <SelectField label="Gender" required options={["Male", "Female"]} placeholder="Select gender" />
            <TextField label="Age" required placeholder="e.g. 34" />
            <TextField label="Phone Number" required placeholder="09XXXXXXXX" />
            <SelectField label="Insurance" options={INSURANCE_OPTIONS as unknown as string[]} placeholder="Select insurance" />
            <TextField label="National ID / Fayda ID" placeholder="Optional" />
          </div>
          <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
            <Info size={13} strokeWidth={2} />
            A full record can be completed later from Patient Registration — this creates a minimal record so scheduling isn&apos;t blocked.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.title}
            type="button"
            className="flex flex-col items-start gap-1.5 bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-50 text-teal-700">
              <a.icon size={15} strokeWidth={2} />
            </span>
            <span className="text-sm font-medium text-slate-900 leading-tight">{a.title}</span>
            <span className="text-xs text-gray-400 leading-tight">{a.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 2 — Visit Details
   ========================================================================= */

type VisitDetails = {
  department: string;
  specialty: string;
  visitType: string;
  appointmentType: string;
  referralSource: string;
  priority: Priority;
  insurance: string;
  language: string;
  interpreterNeeded: boolean;
  duration: string;
  symptoms: string;
  notes: string;
};

function VisitDetailsStep({
  details,
  onChange,
}: {
  details: VisitDetails;
  onChange: (field: keyof VisitDetails, value: string | boolean) => void;
}) {
  const specialties = useMemo(
    () => Array.from(new Set(DOCTORS.filter((d) => d.department === details.department).map((d) => d.specialty))),
    [details.department]
  );

  return (
    <div className="flex flex-col gap-4">
      <Card title="Visit Classification">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Department"
            required
            defaultValue={details.department}
            options={DEPARTMENTS.map((d) => d.name)}
            placeholder="Select department"
            onChange={(v) => onChange("department", v)}
          />
          <SelectField
            label="Specialty"
            defaultValue={details.specialty}
            options={specialties.length ? specialties : ["General"]}
            placeholder="Select specialty"
            onChange={(v) => onChange("specialty", v)}
          />
          <SelectField
            label="Visit Type"
            required
            defaultValue={details.visitType}
            options={VISIT_TYPES as unknown as string[]}
            placeholder="Select visit type"
            onChange={(v) => onChange("visitType", v)}
          />
          <SelectField
            label="Appointment Type"
            required
            defaultValue={details.appointmentType}
            options={APPOINTMENT_TYPES as unknown as string[]}
            placeholder="Select appointment type"
            onChange={(v) => onChange("appointmentType", v)}
          />
          <SelectField
            label="Referral Source"
            defaultValue={details.referralSource}
            options={REFERRAL_SOURCES}
            placeholder="Select referral source"
            onChange={(v) => onChange("referralSource", v)}
          />
          <SelectField
            label="Priority"
            required
            defaultValue={details.priority}
            options={["Routine", "Urgent", "Emergency", "VIP", "High Risk"]}
            placeholder="Select priority"
            onChange={(v) => onChange("priority", v)}
          />
        </div>
      </Card>

      <Card title="Insurance & Language">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Insurance"
            defaultValue={details.insurance}
            options={INSURANCE_OPTIONS as unknown as string[]}
            placeholder="Select insurance"
            onChange={(v) => onChange("insurance", v)}
          />
          <SelectField
            label="Preferred Language"
            defaultValue={details.language}
            options={LANGUAGES}
            placeholder="Select language"
            onChange={(v) => onChange("language", v)}
          />
          <SelectField
            label="Estimated Duration"
            defaultValue={details.duration}
            options={["15 minutes", "30 minutes", "45 minutes", "60 minutes"]}
            placeholder="Select duration"
            onChange={(v) => onChange("duration", v)}
          />
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onChange("interpreterNeeded", !details.interpreterNeeded)}
            className="flex items-center gap-2.5"
          >
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                details.interpreterNeeded ? "bg-teal-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  details.interpreterNeeded ? "translate-x-[18px]" : "translate-x-1"
                }`}
              />
            </span>
            <span className="text-sm text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
              <Languages size={14} strokeWidth={2} className="text-gray-400" />
              Interpreter needed
            </span>
          </button>
        </div>
      </Card>

      <Card title="Clinical Context">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <FieldLabel>Symptoms</FieldLabel>
            <textarea
              rows={3}
              defaultValue={details.symptoms}
              onChange={(e) => onChange("symptoms", e.target.value)}
              placeholder="e.g. Persistent cough, mild fever for 3 days"
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              rows={3}
              defaultValue={details.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Additional notes for the receiving provider"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   STEP 3 — Provider & Slot
   ========================================================================= */

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM",
];
const BOOKED_SLOTS = new Set(["9:30 AM", "10:30 AM", "1:30 PM", "3:00 PM"]);
const BLOCKED_SLOTS = new Set(["11:30 AM"]);

function ProviderSlotStep({
  department,
  providerId,
  onProvider,
  date,
  onDate,
  slot,
  onSlot,
  duplicateWarning,
  onDismissDuplicate,
}: {
  department: string;
  providerId: string;
  onProvider: (id: string) => void;
  date: Date;
  onDate: (d: Date) => void;
  slot: string | null;
  onSlot: (s: string) => void;
  duplicateWarning: boolean;
  onDismissDuplicate: () => void;
}) {
  const providers = useMemo(
    () => (department ? DOCTORS.filter((d) => d.department === department) : DOCTORS),
    [department]
  );

  return (
    <div className="flex flex-col gap-4">
      {duplicateWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
          <AlertTriangle size={18} strokeWidth={2} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Possible duplicate appointment</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This patient already has an appointment on this date &mdash; General Medicine with Dr. Dawit Bekele at 10:30 AM. Confirm this is a genuinely separate visit before continuing.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismissDuplicate}
            aria-label="Dismiss duplicate warning"
            className="text-amber-500 hover:text-amber-700 shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      <Card title="Select Provider">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((d) => {
            const active = d.id === providerId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onProvider(d.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  active ? "border-teal-700 bg-teal-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Avatar initials={d.initials} />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-sm font-semibold text-slate-900 whitespace-nowrap truncate">{d.name}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap truncate">{d.specialty}</span>
                  <span className={`inline-flex mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit whitespace-nowrap ${deptChipClass(d.color)}`}>
                    {d.room}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Provider Availability Timeline">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="sm:w-56">
              <FieldLabel>Appointment Date</FieldLabel>
              <div className="mt-1">
                <DatePicker defaultValue={date} onChange={onDate} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 pb-2.5">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-300" /> Blocked</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
            {TIME_SLOTS.map((t) => {
              const booked = BOOKED_SLOTS.has(t);
              const blocked = BLOCKED_SLOTS.has(t);
              const disabled = booked || blocked;
              const active = slot === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSlot(t)}
                  className={`h-9 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-teal-700 text-white"
                      : disabled
                        ? booked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                          : "bg-red-50 text-red-400 cursor-not-allowed"
                        : "border border-teal-200 text-teal-700 hover:bg-teal-50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-3 flex items-start gap-2.5">
            <Sparkles size={15} strokeWidth={2} className="text-teal-700 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 leading-relaxed">
              <span className="font-semibold">Smart suggestion:</span> Based on average consult time, 10:00 AM and 2:00 PM have the lowest risk of provider delay for this department today.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   STEP 4 — Review & Confirm
   ========================================================================= */

function ReviewStep({
  patient,
  details,
  providerId,
  date,
  slot,
  onEdit,
}: {
  patient: PatientLite | null;
  details: VisitDetails;
  providerId: string;
  date: Date;
  slot: string | null;
  onEdit: (step: number) => void;
}) {
  const doctor = DOCTORS.find((d) => d.id === providerId);
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Patient", value: patient ? `${patient.name} (${patient.mrn})` : "—", step: 1 },
    { label: "Department", value: details.department || "—", step: 2 },
    { label: "Visit Type", value: details.visitType || "—", step: 2 },
    { label: "Appointment Type", value: details.appointmentType || "—", step: 2 },
    { label: "Priority", value: details.priority || "Routine", step: 2 },
    { label: "Insurance", value: details.insurance || "—", step: 2 },
    { label: "Preferred Language", value: `${details.language || "—"}${details.interpreterNeeded ? " (Interpreter needed)" : ""}`, step: 2 },
    { label: "Estimated Duration", value: details.duration || "30 minutes", step: 2 },
    { label: "Provider", value: doctor ? `${doctor.name} — ${doctor.room}` : "—", step: 3 },
    { label: "Date & Time", value: slot ? `${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${slot}` : "—", step: 3 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card title="Appointment Summary">
        <div className="flex flex-col divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-gray-500 whitespace-nowrap">{r.label}</span>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold text-slate-900 text-right truncate">{r.value}</span>
                <button
                  type="button"
                  onClick={() => onEdit(r.step)}
                  className="text-xs font-medium text-teal-700 hover:underline shrink-0"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(details.symptoms || details.notes) && (
        <Card title="Clinical Context">
          {details.symptoms && (
            <p className="text-sm text-gray-700 mb-2"><span className="font-semibold text-slate-900">Symptoms: </span>{details.symptoms}</p>
          )}
          {details.notes && (
            <p className="text-sm text-gray-700"><span className="font-semibold text-slate-900">Notes: </span>{details.notes}</p>
          )}
        </Card>
      )}
    </div>
  );
}

function ConfirmationSuccess({ apptId, onNew }: { apptId: string; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={30} strokeWidth={1.8} />
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Appointment Confirmed</h2>
        <p className="text-sm text-gray-500 mt-1">
          Appointment <span className="font-mono font-semibold text-slate-700">{apptId}</span> has been scheduled successfully.
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={onNew}
          className="h-10 px-5 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors"
        >
          <CalendarClock size={16} strokeWidth={2.2} />
          Schedule Another Appointment
        </button>
        <Link
          href="/modules/appointments-queue/check-in-check-out"
          className="h-10 px-5 inline-flex items-center border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go to Check-In
        </Link>
      </div>
    </div>
  );
}

/* =========================================================================
   Page
   ========================================================================= */

const EMPTY_DETAILS: VisitDetails = {
  department: "",
  specialty: "",
  visitType: "",
  appointmentType: "",
  referralSource: "",
  priority: "Routine",
  insurance: "",
  language: "",
  interpreterNeeded: false,
  duration: "30 minutes",
  symptoms: "",
  notes: "",
};

export default function AppointmentSchedulingForm() {
  const [step, setStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(1);

  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientLite | null>(PATIENTS[5]);
  const [showRegister, setShowRegister] = useState(false);

  const [details, setDetails] = useState<VisitDetails>(EMPTY_DETAILS);

  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(true);

  const [confirmed, setConfirmed] = useState(false);
  const [apptId] = useState(() => appointmentId(1043));

  const results = useMemo(() => {
    if (!query.trim()) return PATIENTS.slice(0, 6);
    const q = query.toLowerCase();
    return PATIENTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q)
    );
  }, [query]);

  const handleDetailChange = (field: keyof VisitDetails, value: string | boolean) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPatient = (p: PatientLite) => {
    setSelectedPatient(p);
    setDetails((prev) => ({ ...prev, insurance: prev.insurance || p.insurance }));
  };

  const goToStep = (n: number) => {
    if (n <= maxVisited) setStep(n);
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const goNext = () => {
    if (step < STEPS.length) {
      const next = step + 1;
      setStep(next);
      setMaxVisited((m) => Math.max(m, next));
    } else {
      setConfirmed(true);
    }
  };

  const canAdvance =
    (step === 1 && Boolean(selectedPatient) ) ||
    (step === 2 && Boolean(details.department && details.visitType && details.appointmentType)) ||
    (step === 3 && Boolean(providerId && slot)) ||
    step === 4;

  const startOver = () => {
    setStep(1);
    setMaxVisited(1);
    setQuery("");
    setSelectedPatient(null);
    setShowRegister(false);
    setDetails(EMPTY_DETAILS);
    setProviderId("");
    setSlot(null);
    setConfirmed(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="Appointment Scheduling" breadcrumb="Appointments & Queue > Appointment Scheduling" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <Stepper steps={STEPS} activeStep={step} onStepClick={goToStep} maxStep={maxVisited} />
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {confirmed ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <ConfirmationSuccess apptId={apptId} onNew={startOver} />
            </div>
          ) : (
            <>
              {step === 1 && (
                <FindRegisterStep
                  query={query}
                  onQuery={setQuery}
                  results={results}
                  selected={selectedPatient}
                  onSelect={handleSelectPatient}
                  showRegister={showRegister}
                  onToggleRegister={() => setShowRegister((v) => !v)}
                />
              )}
              {step === 2 && <VisitDetailsStep details={details} onChange={handleDetailChange} />}
              {step === 3 && (
                <ProviderSlotStep
                  department={details.department}
                  providerId={providerId}
                  onProvider={setProviderId}
                  date={date}
                  onDate={setDate}
                  slot={slot}
                  onSlot={setSlot}
                  duplicateWarning={duplicateWarning && Boolean(selectedPatient)}
                  onDismissDuplicate={() => setDuplicateWarning(false)}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  patient={selectedPatient}
                  details={details}
                  providerId={providerId}
                  date={date}
                  slot={slot}
                  onEdit={goToStep}
                />
              )}

              <div className="pt-3 border-t border-gray-200 flex flex-wrap gap-3 justify-between items-center">
                <Link
                  href="/dashboard"
                  className="h-10 px-5 inline-flex items-center border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <div className="flex items-center gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="h-10 px-5 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft size={16} strokeWidth={2.5} />
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className={`h-10 px-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-white transition-colors ${
                      canAdvance ? "bg-teal-700 hover:bg-teal-800" : "bg-teal-700/40 cursor-not-allowed"
                    }`}
                  >
                    {step === STEPS.length ? "Confirm Appointment" : "Next Step"}
                    {step === STEPS.length ? <Check size={16} strokeWidth={2.5} /> : <ArrowRight size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <PatientSummaryCard patient={selectedPatient} />
          <TodayScheduleCard />
          <QuickStatsCard />
          <NextSlotsCard />
          <WaitingQueueLiveCard />
          <RecentBookingsCard />
        </div>
      </div>
    </div>
  );
}
