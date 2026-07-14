"use client";

import { useState, useMemo } from "react";
import {
  Users,
  ShieldAlert,
  Wind,
  Activity,
  HeartPulse,
  Brain,
  Eye,
  ListChecks,
  Printer,
  UserPlus,
  ClipboardList,
  IdCard,
  History,
  ChevronDown,
  ArrowRight,
  Check,
  RotateCcw,
  Eraser,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  ArrowLeft,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Select,
  Badge,
  type BadgeTone,
  Card,
  HeaderFact,
  TimelineItem,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";

/* ============================================================================
   Triage & Vitals — FRD 11.3 (Triage & Vitals Capture).
   Single-screen nursing intake that follows OPD Registration: priority/acuity,
   ABCDE quick indicators, risk screening, and full vitals, with patient
   safety context (allergies/chronic conditions) surfaced persistently.

   Enhanced with Stage 0: Triage Queue & Patient Selection dashboard so nurses
   can search and select patients check-in today to perform triage on.
   ========================================================================== */

/* ---------- Types & Types definitions ---------- */

type TriagePatient = {
  id: string;
  name: string;
  nationalId: string;
  bloodGroup: string;
  photo?: string;
  initials?: string;
  mrn: string;
  gender: "Female" | "Male";
  age: number;
  dob: string;
  dobISO: string;
  phone: string;
  checkInTime: string;
  department: string;
  doctor: string;
  visitType: "New Visit" | "Follow-Up" | "Referral";
  priorityLevel: "Routine" | "Priority" | "Urgent" | "Emergency";
  allergies?: string;
  chronicIllness?: string;
};

/* ---------- Mock Database of Patients Checked-in Today ---------- */

const MOCK_TRIAGE_QUEUE: TriagePatient[] = [
  {
    id: "1",
    name: "Selamawit Abebe",
    nationalId: "1001-2345-6789",
    bloodGroup: "O+",
    photo: PATIENT_PHOTO,
    mrn: "FSH-2025-00012345",
    gender: "Female",
    age: 33,
    dob: "12/04/1992",
    dobISO: "1992-04-12",
    phone: "0911 234 567",
    checkInTime: "09:20 AM",
    department: "General Medicine",
    doctor: "Dr. Dawit Bekele",
    visitType: "New Visit",
    priorityLevel: "Urgent",
    allergies: "Penicillin",
    chronicIllness: "Hypertension",
  },
  {
    id: "2",
    name: "Abebe Kebede",
    nationalId: "1001-9876-5432",
    bloodGroup: "A+",
    initials: "AK",
    mrn: "MRN-2026-000122",
    gender: "Male",
    age: 45,
    dob: "12/03/1980",
    dobISO: "1980-03-12",
    phone: "0911 876 543",
    checkInTime: "09:12 AM",
    department: "General Medicine",
    doctor: "Dr. Hanna Yohannes",
    visitType: "New Visit",
    priorityLevel: "Routine",
    allergies: "No known allergies",
    chronicIllness: "Diabetes Type 2",
  },
  {
    id: "3",
    name: "Yonas Alemu",
    nationalId: "1001-1122-3344",
    bloodGroup: "B+",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&fit=crop&crop=faces",
    mrn: "MRN-2026-000121",
    gender: "Male",
    age: 60,
    dob: "17/08/1965",
    dobISO: "1965-08-17",
    phone: "0911 567 890",
    checkInTime: "08:55 AM",
    department: "Surgery",
    doctor: "Dr. Selamawit Girma",
    visitType: "Referral",
    priorityLevel: "Emergency",
    allergies: "Sulfa drugs",
    chronicIllness: "None",
  },
  {
    id: "4",
    name: "Sara Ahmed",
    nationalId: "1001-5566-7788",
    bloodGroup: "AB-",
    initials: "SA",
    mrn: "MRN-2026-000120",
    gender: "Female",
    age: 28,
    dob: "22/11/1997",
    dobISO: "1997-11-22",
    phone: "0911 223 344",
    checkInTime: "09:28 AM",
    department: "Pediatrics",
    doctor: "Dr. Dawit Bekele",
    visitType: "Follow-Up",
    priorityLevel: "Routine",
    allergies: "No known allergies",
    chronicIllness: "Asthma",
  },
  {
    id: "5",
    name: "Dawit Haile",
    nationalId: "1001-2233-4455",
    bloodGroup: "A-",
    initials: "DH",
    mrn: "MRN-2026-000118",
    gender: "Male",
    age: 52,
    dob: "30/06/1973",
    dobISO: "1973-06-30",
    phone: "0912 345 678",
    checkInTime: "09:05 AM",
    department: "General Medicine",
    doctor: "Dr. Hanna Yohannes",
    visitType: "New Visit",
    priorityLevel: "Priority",
    allergies: "No known allergies",
    chronicIllness: "None",
  },
  {
    id: "6",
    name: "Tigist Bekele",
    nationalId: "1001-3344-5566",
    bloodGroup: "B-",
    initials: "TB",
    mrn: "MRN-2026-000117",
    gender: "Female",
    age: 24,
    dob: "14/04/2001",
    dobISO: "2001-04-14",
    phone: "0913 456 789",
    checkInTime: "08:42 AM",
    department: "Pediatrics",
    doctor: "Dr. Selamawit Girma",
    visitType: "New Visit",
    priorityLevel: "Priority",
    allergies: "No known allergies",
    chronicIllness: "None",
  }
];

/* ---------- local-only primitives ---------- */
const labelClass = "text-xs font-bold text-gray-600 flex items-center gap-0.5";

function Required() {
  return <span className="text-red-500">*</span>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className={labelClass}>
      {children}
      {required && <Required />}
    </label>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  suffix,
  readOnly,
  numeric,
}: {
  value: string;
  onChange?: (v: string) => void;
  suffix?: string;
  readOnly?: boolean;
  numeric?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`${inputBase} ${suffix ? "pr-9" : ""} ${readOnly ? "bg-gray-50 text-gray-500" : ""} ${numeric ? "tabular-nums" : ""}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function NumericSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer tabular-nums`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

function IndicatorRow({
  icon: Icon,
  label,
  value,
  tone,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: BadgeTone;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Icon size={14} strokeWidth={2.25} className="text-blue-500" />
        </span>
        <span className="text-sm text-slate-700 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge tone={tone}>{value}</Badge>
        {action}
      </div>
    </div>
  );
}

/* ---------- patient avatar ---------- */

function PatientAvatar({ photo, initials, size = "md" }: { photo?: string; initials?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-xs";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={`${sz} rounded-full object-cover shrink-0`} />;
  }
  return (
    <span className={`${sz} rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0`}>
      {initials ?? "?"}
    </span>
  );
}

/* ---------- priority (acuity) selector ---------- */

const PRIORITIES = [
  { code: "P1", label: "Resuscitation", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-300" },
  { code: "P2", label: "Emergency", bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-300" },
  { code: "P3", label: "Urgent", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-400" },
  { code: "P4", label: "Less Urgent", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-300" },
  { code: "P5", label: "Non-Urgent", bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-300" },
];

function PriorityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2.5">
      {PRIORITIES.map((p) => {
        const selected = p.code === value;
        return (
          <button
            key={p.code}
            type="button"
            onClick={() => onChange(p.code)}
            className={`relative flex-1 min-w-[86px] rounded-lg border border-transparent px-2 py-3 flex flex-col items-center gap-0.5 transition-all ${p.bg} ${
              selected ? `${p.ring} ring-2` : ""
            }`}
          >
            {selected && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <span className={`text-sm font-bold ${p.text}`}>{p.code}</span>
            <span className={`text-[11px] font-medium ${p.text}`}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   Stage 0 — Triage Queue & Patient Selection Screen
   ========================================================================== */

function TriageQueueStage({
  patients,
  onSelect,
  triagedCount,
}: {
  patients: TriagePatient[];
  onSelect: (p: TriagePatient) => void;
  triagedCount: number;
}) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.mrn.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query);
      const matchesDept =
        deptFilter === "All Departments" || p.department === deptFilter;
      const matchesPriority =
        priorityFilter === "All Priorities" || p.priorityLevel === priorityFilter;
      return matchesSearch && matchesDept && matchesPriority;
    });
  }, [patients, query, deptFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const waiting = patients.length;
    const emergency = patients.filter((p) => p.priorityLevel === "Emergency" || p.priorityLevel === "Urgent").length;
    return {
      waiting,
      emergency,
      avgWait: "18 Min",
      completed: triagedCount,
    };
  }, [patients, triagedCount]);

  const priorityStyles: Record<TriagePatient["priorityLevel"], string> = {
    Routine: "bg-slate-50 text-slate-700 border-slate-200",
    Priority: "bg-blue-50 text-blue-700 border-blue-200",
    Urgent: "bg-amber-50 text-amber-700 border-amber-200",
    Emergency: "bg-red-50 text-red-700 border-red-200 font-bold",
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">
        
        {/* Breadcrumb */}
        <p className="text-xs text-gray-400">
          Home <span className="mx-1 text-gray-300">&gt;</span> OPD Management{" "}
          <span className="mx-1 text-gray-300">&gt;</span>
          <span className="text-slate-800 font-semibold">Triage &amp; Vitals</span>
        </p>

        {/* Title */}
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 font-display">Triage &amp; Vitals Intake</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Search and select a registered patient from the active triage queue to perform nursing intake.
          </p>
        </div>

        {/* Queue Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Waiting Triage", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Active patients today" },
            { label: "Avg Wait Time", value: stats.avgWait, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Goal: under 20 mins" },
            { label: "Urgent/Emergency Cases", value: stats.emergency, color: stats.emergency > 0 ? "text-red-600 bg-red-50 border-red-100 font-bold" : "text-amber-600 bg-amber-50 border-amber-100", subtitle: "Requires immediate intake" },
            { label: "Triaged Today", value: stats.completed, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Vitals sent to doctors" },
          ].map(({ label, value, color, subtitle }) => (
            <div key={label} className={`rounded-2xl p-4 ${color.split(" ")[1]} border ${color.split(" ")[2]} flex flex-col gap-1 shadow-sm`}>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
              <span className={`text-2xl font-bold font-display tabular-nums ${color.split(" ")[0]}`}>{value}</span>
              <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
            </div>
          ))}
        </div>

        {/* Search and Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          {/* Main search and queue list */}
          <div className="flex flex-col gap-4">
            
            {/* Search Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search size={16} strokeWidth={2.25} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-slate-800">Find Patient in Triage Queue</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 font-medium">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, MRN, or phone number..."
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(""); setCurrentPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                {/* Department filter */}
                <div className="relative md:w-52 shrink-0">
                  <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                    className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer`}
                  >
                    {["All Departments", "General Medicine", "Pediatrics", "Surgery"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Priority filter */}
                <div className="relative md:w-44 shrink-0">
                  <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                    className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer`}
                  >
                    {["All Priorities", "Routine", "Priority", "Urgent", "Emergency"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Queue Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Patient", "MRN", "Department & Doctor", "Check-in Time", "Priority", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search size={22} strokeWidth={1.8} className="text-gray-400" />
                            </span>
                            <p className="text-sm text-gray-500 font-medium">No patients match your search criteria.</p>
                            <p className="text-xs text-gray-400">Verify filters or change the query.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paged.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-teal-50/40 transition-colors group"
                        >
                          {/* Patient profile */}
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <PatientAvatar photo={p.photo} initials={p.initials} size="sm" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-800 whitespace-nowrap group-hover:text-teal-700 transition-colors">
                                  {p.name}
                                </span>
                                <span className="text-[11px] text-gray-400 whitespace-nowrap">{p.gender} · {p.age} Y · {p.dob}</span>
                              </div>
                            </div>
                          </td>
                          {/* MRN */}
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 tabular-nums whitespace-nowrap">
                              {p.mrn}
                            </span>
                          </td>
                          {/* Department & Doctor */}
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-800">{p.department}</span>
                              <span className="text-[11px] text-gray-400">{p.doctor}</span>
                            </div>
                          </td>
                          {/* Check-In time */}
                          <td className="py-3.5 pr-4 text-xs font-semibold text-slate-600 tabular-nums">
                            {p.checkInTime}
                          </td>
                          {/* Priority */}
                          <td className="py-3.5 pr-4">
                            <span className={`inline-flex items-center text-xs font-bold border rounded-full px-2.5 py-0.5 ${priorityStyles[p.priorityLevel] || ""}`}>
                              {p.priorityLevel}
                            </span>
                          </td>
                          {/* Action */}
                          <td className="py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => onSelect(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#148375] hover:bg-[#116a5f] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              <Activity size={13} strokeWidth={2.5} />
                              Start Triage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filtered.length > pageSize && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={15} strokeWidth={2} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          p === currentPage
                            ? "bg-teal-700 text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={15} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Brain size={16} strokeWidth={2.25} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-800 font-display">Triage Guidelines</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { step: "1", text: "Locate patient check-in records in the active queue list." },
                  { step: "2", text: "Perform patient vital signs intake: BP, SpO2, Pulse, Temp." },
                  { step: "3", text: "Categorize clinical priority levels (P1 Urgent - P5 Non-urgent)." },
                  { step: "4", text: "Submit triage data to forward records to the designated physician." },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold shrink-0 mt-0.5">
                      {step}
                    </span>
                    <span className="text-xs text-gray-600 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <History size={16} strokeWidth={2.25} className="text-gray-400" />
                <h2 className="text-sm font-bold text-slate-800">Operational Notices</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nurses must prioritize P1 Emergency and P2 High Risk patients. High-acuity queues auto-escalate past 20 minutes wait-time limits.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Triage Intake Wizard Screen (Dynamic)
   ========================================================================== */

const DEFAULT_VITALS = {
  temperature: "37.2",
  pulse: "88",
  respRate: "18",
  systolic: "120",
  diastolic: "80",
  spo2: "98",
  weight: "65.0",
  height: "165",
  glucose: "98",
};

function bmiCategory(bmi: number): { label: string; tone: BadgeTone } {
  if (bmi < 18.5) return { label: "Underweight", tone: "amber" };
  if (bmi < 25) return { label: "Normal", tone: "emerald" };
  if (bmi < 30) return { label: "Overweight", tone: "amber" };
  return { label: "Obese", tone: "red" };
}

function TriageIntakeForm({
  patient,
  onClear,
  onSubmit,
}: {
  patient: TriagePatient;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const [priority, setPriority] = useState(patient.priorityLevel === "Emergency" ? "P2" : patient.priorityLevel === "Urgent" ? "P3" : "P4");
  const [chiefComplaint, setChiefComplaint] = useState(patient.visitType === "Follow-Up" ? "Routine follow-up visit." : "Patient reports headache and general body weakness.");
  const [presentingProblem, setPresentingProblem] = useState(patient.visitType === "New Visit" ? "New Problem" : "Existing Problem");
  const [onset, setOnset] = useState("Today");
  const [pain, setPain] = useState(patient.priorityLevel === "Emergency" ? 8 : 4);
  const [arrivalMode, setArrivalMode] = useState("Walk-in");
  const [accompaniedBy, setAccompaniedBy] = useState("Self");
  const [consciousLevel, setConsciousLevel] = useState(patient.priorityLevel === "Emergency" ? "Verbal" : "Alert");
  const [triageNotes, setTriageNotes] = useState(
    patient.priorityLevel === "Emergency" ? "Patient requires immediate clinical check-in." : "Patient reports general body weakness, no nausea or vomiting."
  );
  const [vitals, setVitals] = useState(DEFAULT_VITALS);

  const setVital = (key: keyof typeof DEFAULT_VITALS, value: string) =>
    setVitals((prev) => ({ ...prev, [key]: value }));

  const bmiValue = (() => {
    const h = parseFloat(vitals.height) / 100;
    const w = parseFloat(vitals.weight);
    if (!h || !w) return null;
    return w / (h * h);
  })();
  const bmi = bmiCategory(bmiValue ?? 22);

  const systolicOptions = Array.from({ length: 61 }, (_, i) => String(80 + i * 2));
  const diastolicOptions = Array.from({ length: 46 }, (_, i) => String(40 + i * 2));

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1600px] w-full mx-auto flex flex-col gap-4">
        {/* Patient profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={onClear}
              className="mr-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors text-slate-500 mt-1"
              title="Return to Triage Queue"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={patient.photo || PATIENT_PHOTO}
                alt={patient.name}
                className="w-14 h-14 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-display">{patient.name}</h1>
                <span className="text-base leading-none text-rose-400" aria-label={patient.gender}>
                  {patient.gender === "Female" ? "♀" : "♂"}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
                  OPD
                </span>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <HeaderFact label="MRN" value={patient.mrn} />
                <HeaderFact label="Age / DOB" value={`${patient.age} Y / ${patient.dob}`} />
                <HeaderFact label="Phone" value={patient.phone} />
                <HeaderFact label="Visit Type" value={patient.visitType} />
                <HeaderFact label="Assigned Doctor" value={patient.doctor} />
                <HeaderFact label="Check-in Time" value={patient.checkInTime} />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            <Users size={15} strokeWidth={2.25} />
            View Patient 360°
          </button>
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.2fr_0.9fr] gap-4 items-start">
          {/* Column 1: Triage Assessment + Vital Signs */}
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="1. Triage Assessment" icon={ClipboardList}>
              <div className="flex flex-col gap-4">
                <Field label="Triage Level / Priority" required>
                  <PriorityPicker value={priority} onChange={setPriority} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Chief Complaint" required>
                    <TextInput value={chiefComplaint} onChange={setChiefComplaint} />
                  </Field>
                  <Field label="Presenting Problem">
                    <Select
                      value={presentingProblem}
                      onChange={setPresentingProblem}
                      options={["New Problem", "Existing Problem", "Follow-Up"]}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <Field label="Onset">
                    <Select value={onset} onChange={setOnset} options={["Today", "1 Day Ago", "2 Days Ago", "1 Week Ago", "Chronic"]} />
                  </Field>
                  <Field label="Pain Scale (0-10)">
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[11px] text-gray-400 shrink-0">0</span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={pain}
                        onChange={(e) => setPain(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-full accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-[11px] text-gray-400 shrink-0">10</span>
                      <span className="shrink-0 w-9 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-bold text-slate-700 tabular-nums">
                        {pain}
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mode of Arrival">
                    <Select
                      value={arrivalMode}
                      onChange={setArrivalMode}
                      options={["Walk-in", "Wheelchair", "Ambulance", "Referred"]}
                    />
                  </Field>
                  <Field label="Accompanied By">
                    <TextInput value={accompaniedBy} onChange={setAccompaniedBy} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <Field label="Conscious Level">
                    <Select
                      value={consciousLevel}
                      onChange={setConsciousLevel}
                      options={["Alert", "Verbal", "Pain", "Unresponsive"]}
                    />
                  </Field>
                  <Field label="Triage Notes">
                    <textarea
                      value={triageNotes}
                      onChange={(e) => setTriageNotes(e.target.value)}
                      rows={2}
                      className={`${inputBase} resize-none`}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            <Card title="2. Vital Signs" icon={HeartPulse} iconTone="text-blue-500">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Temperature (°C)" required>
                    <TextInput value={vitals.temperature} onChange={(v) => setVital("temperature", v)} numeric />
                  </Field>
                  <Field label="Pulse (bpm)" required>
                    <TextInput value={vitals.pulse} onChange={(v) => setVital("pulse", v)} numeric />
                  </Field>
                  <Field label="Respiratory Rate (breaths/min)">
                    <TextInput value={vitals.respRate} onChange={(v) => setVital("respRate", v)} numeric />
                  </Field>

                  <Field label="Blood Pressure (mmHg)" required>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        <NumericSelect value={vitals.systolic} onChange={(v) => setVital("systolic", v)} options={systolicOptions} />
                      </div>
                      <span className="text-gray-400 text-sm shrink-0">/</span>
                      <div className="flex-1">
                        <NumericSelect value={vitals.diastolic} onChange={(v) => setVital("diastolic", v)} options={diastolicOptions} />
                      </div>
                    </div>
                  </Field>
                  <Field label="SpO2 (%)">
                    <TextInput value={vitals.spo2} onChange={(v) => setVital("spo2", v)} numeric />
                  </Field>
                  <Field label="Weight (kg)">
                    <TextInput value={vitals.weight} onChange={(v) => setVital("weight", v)} numeric />
                  </Field>

                  <Field label="Height (cm)">
                    <TextInput value={vitals.height} onChange={(v) => setVital("height", v)} numeric />
                  </Field>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label>BMI (kg/m²)</Label>
                      {bmiValue && <Badge tone={bmi.tone}>{bmi.label}</Badge>}
                    </div>
                    <TextInput value={bmiValue ? bmiValue.toFixed(1) : "—"} readOnly numeric />
                  </div>
                  <Field label="Blood Glucose (mg/dl)">
                    <TextInput value={vitals.glucose} onChange={(v) => setVital("glucose", v)} numeric />
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setChiefComplaint("");
                      setTriageNotes("");
                    }}
                    className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eraser size={14} strokeWidth={2.25} />
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setVitals(DEFAULT_VITALS)}
                    className="flex items-center gap-1.5 border border-indigo-200 text-indigo-600 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                  >
                    <RotateCcw size={14} strokeWidth={2.25} />
                    Reset Vitals
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Quick Clinical Indicators + Risk Screening + Actions */}
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="3. Quick Clinical Indicators" icon={Users} iconTone="text-blue-500">
              <div className="flex flex-col divide-y divide-gray-50">
                <IndicatorRow icon={Wind} label="Airway" value="Clear" tone="emerald" />
                <IndicatorRow icon={Activity} label="Breathing" value="Normal" tone="emerald" />
                <IndicatorRow icon={HeartPulse} label="Circulation" value="Stable" tone="emerald" />
                <IndicatorRow icon={Brain} label="Disability (Neuro)" value="Alert" tone={patient.priorityLevel === "Emergency" ? "red" : "emerald"} />
                <IndicatorRow icon={Eye} label="Exposure" value="No Issues" tone="blue" />
              </div>
            </Card>

            <Card title="4. Risk Screening" icon={ShieldAlert} iconTone="text-blue-500">
              <div className="flex flex-col divide-y divide-gray-50">
                <IndicatorRow
                  icon={ClipboardList}
                  label="Allergies"
                  value={patient.allergies && patient.allergies !== "No known allergies" ? "Yes" : "No"}
                  tone={patient.allergies && patient.allergies !== "No known allergies" ? "red" : "slate"}
                  action={patient.allergies && patient.allergies !== "No known allergies" && <button className="text-xs font-semibold text-teal-700 hover:underline">View</button>}
                />
                <IndicatorRow
                  icon={ClipboardList}
                  label="Chronic Illness"
                  value={patient.chronicIllness && patient.chronicIllness !== "None" ? "Yes" : "No"}
                  tone={patient.chronicIllness && patient.chronicIllness !== "None" ? "amber" : "slate"}
                  action={patient.chronicIllness && patient.chronicIllness !== "None" && <button className="text-xs font-semibold text-teal-700 hover:underline">View</button>}
                />
                <IndicatorRow icon={ClipboardList} label="Current Medications" value="No" tone="slate" />
                <IndicatorRow icon={ClipboardList} label="Pregnancy" value={patient.gender === "Female" && patient.age < 50 ? "Possible" : "N/A"} tone="slate" />
                <IndicatorRow icon={ClipboardList} label="Fall Risk" value={patient.age > 55 ? "Moderate" : "Low"} tone={patient.age > 55 ? "amber" : "emerald"} />
                <IndicatorRow icon={ClipboardList} label="Infectious Disease Risk" value="Low" tone="emerald" />
              </div>
            </Card>

            <Card title="5. Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="col-span-2 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  <Printer size={15} strokeWidth={2.25} />
                  Print Triage Slip
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <ArrowRight size={15} strokeWidth={2.25} />
                  Send to Doctor
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <UserPlus size={15} strokeWidth={2.25} />
                  Add to Queue
                </button>
              </div>
            </Card>
          </div>

          {/* Column 3: Alerts + Patient Summary + Triage History */}
          <div className="flex flex-col gap-4">
            <Card title="Safety Alerts" icon={ShieldAlert} iconTone="text-red-500" action={
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                {patient.allergies && patient.chronicIllness && patient.allergies !== "No known allergies" && patient.chronicIllness !== "None" ? 2 : 1}
              </span>
            }>
              <div className="flex flex-col gap-2.5">
                {patient.allergies && patient.allergies !== "No known allergies" && (
                  <div className="bg-red-50 rounded-lg p-3 flex flex-col gap-0.5 animate-pulse">
                    <span className="text-xs font-semibold text-red-700">Allergy Alert</span>
                    <span className="text-sm font-bold text-red-700">{patient.allergies}</span>
                  </div>
                )}
                {patient.chronicIllness && patient.chronicIllness !== "None" && (
                  <div className="bg-amber-50 rounded-lg p-3 flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-amber-700">Hypertension / Chronic</span>
                    <span className="text-sm font-bold text-amber-700">{patient.chronicIllness}</span>
                  </div>
                )}
                {(!patient.allergies || patient.allergies === "No known allergies") && (!patient.chronicIllness || patient.chronicIllness === "None") && (
                  <p className="text-xs text-gray-400 py-3 text-center">No allergy or chronic conditions flagged.</p>
                )}
              </div>
            </Card>

            <Card title="Patient Summary" icon={IdCard} iconTone="text-slate-500">
              <div className="flex flex-col gap-2.5">
                {[
                  ["Blood Group", patient.bloodGroup || "—", ""],
                  ["Insurance", "Woreda 03 CBHI (Valid)", "text-emerald-600 font-semibold"],
                  ["Last Visit", "Apr 10, 2025", ""],
                  ["Last BP", "130/85 mmHg", ""],
                  ["Last Weight", "64.0 kg", ""],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-sm text-slate-800 tabular-nums ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Triage History (Today)" icon={History} iconTone="text-slate-500">
              <div className="flex flex-col -mt-1">
                <TimelineItem time={patient.checkInTime} title="Registration Completed" detail="by System Check-in" state="done" />
                <TimelineItem time="—" title="Triage In-Progress" detail="Currently recording vitals" state="active" />
                <TimelineItem time="—" title="Consultation" detail="Pending" state="pending" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={<FooterButton tone="neutral" onClick={onClear}>Cancel &amp; Return</FooterButton>}
        right={
          <FooterPrimaryButton onClick={onSubmit}>
            Submit Vitals &amp; Send to Queue
            <ArrowRight size={15} strokeWidth={2.25} />
          </FooterPrimaryButton>
        }
      />
    </div>
  );
}

/* ============================================================================
   Stage 2 — Triage Complete Success Screen
   ========================================================================== */

function TriageSuccessScreen({
  patient,
  onBack,
}: {
  patient: TriagePatient;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">Triage Completed</h2>
          <p className="text-sm text-gray-500 px-4">
            Vital signs and priority assessments for <strong>{patient.name}</strong> have been saved successfully and sent to doctor queue.
          </p>
        </div>
        
        <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-2.5 text-left border border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Patient Name</span>
            <span className="text-slate-800 font-bold">{patient.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">MRN Code</span>
            <span className="font-mono text-slate-800 font-bold">{patient.mrn}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Destination Queue</span>
            <span className="text-emerald-700 font-semibold">{patient.department} Queue</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Assigned Physician</span>
            <span className="text-slate-800 font-semibold">{patient.doctor}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Triage Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function TriageVitalsForm() {
  const [selectedPatient, setSelectedPatient] = useState<TriagePatient | null>(null);
  const [triageQueue, setTriageQueue] = useState<TriagePatient[]>(MOCK_TRIAGE_QUEUE);
  const [triagedCount, setTriagedCount] = useState(8);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPatient = (patient: TriagePatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleTriageComplete = (patient: TriagePatient) => {
    // Remove patient from waiting queue list
    setTriageQueue((prev) => prev.filter((p) => p.id !== patient.id));
    setTriagedCount((prev) => prev + 1);
    setIsSuccess(true);
  };

  if (isSuccess && selectedPatient) {
    return (
      <TriageSuccessScreen
        patient={selectedPatient}
        onBack={() => {
          setSelectedPatient(null);
          setIsSuccess(false);
        }}
      />
    );
  }

  if (!selectedPatient) {
    return (
      <TriageQueueStage
        patients={triageQueue}
        onSelect={handleSelectPatient}
        triagedCount={triagedCount}
      />
    );
  }

  return (
    <TriageIntakeForm
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={() => handleTriageComplete(selectedPatient)}
    />
  );
}
