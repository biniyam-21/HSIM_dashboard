"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageSquareText,
  Stethoscope,
  Activity,
  ClipboardList,
  Pill,
  FileCheck2,
  Plus,
  Search,
  X,
  Check,
  Printer,
  ArrowRight,
  FlaskConical,
  ScanLine,
  StickyNote,
  UploadCloud,
  Send,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Brain,
  History,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Label,
  Field,
  Select,
  MicTextarea,
  ToggleSwitch,
  Card,
  HeaderFact,
  KeyValueRow,
  TimelineItem,
  QuickActionButton,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";
import DatePicker from "@/components/DatePicker";

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ============================================================================
   Consultation — FRD 11.4 (Consultation Workflow). Third screen in the OPD
   visit chain: OPD Registration -> Triage & Vitals -> Consultation -> Orders.

   Enhanced with Stage 0: Doctor's Queue Dashboard showing active outpatients
   waiting for consultation with live triage vital indicators on the dashboard.
   ========================================================================== */

type ConsultationPatient = {
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
  medications?: string;
  chiefComplaint: string;
  vitals: {
    temperature: string;
    pulse: string;
    systolic: string;
    diastolic: string;
    respRate: string;
    spo2: string;
    weight: string;
    height: string;
  };
};

/* ---------- Mock Consultation Queue Database ---------- */

const MOCK_CONSULTATION_QUEUE: ConsultationPatient[] = [
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
    checkInTime: "09:30 AM",
    department: "General Medicine",
    doctor: "Dr. Dawit Bekele",
    visitType: "New Visit",
    priorityLevel: "Urgent",
    allergies: "Penicillin",
    chronicIllness: "Hypertension",
    medications: "Amlodipine 5mg OD",
    chiefComplaint: "Headache and body weakness since 2 days.",
    vitals: {
      temperature: "37.2",
      pulse: "88",
      systolic: "120",
      diastolic: "80",
      respRate: "18",
      spo2: "98",
      weight: "65.0",
      height: "165"
    }
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
    doctor: "Dr. Dawit Bekele",
    visitType: "New Visit",
    priorityLevel: "Routine",
    allergies: "No known allergies",
    chronicIllness: "Diabetes Type 2",
    medications: "Metformin 500mg BD",
    chiefComplaint: "Routine check-up for blood glucose monitoring.",
    vitals: {
      temperature: "36.8",
      pulse: "72",
      systolic: "115",
      diastolic: "75",
      respRate: "16",
      spo2: "99",
      weight: "74.0",
      height: "172"
    }
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
    medications: "None",
    chiefComplaint: "Severe abdominal pain in the right lower quadrant.",
    vitals: {
      temperature: "38.4",
      pulse: "102",
      systolic: "135",
      diastolic: "85",
      respRate: "22",
      spo2: "95",
      weight: "68.0",
      height: "168"
    }
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
    department: "General Medicine",
    doctor: "Dr. Dawit Bekele",
    visitType: "Follow-Up",
    priorityLevel: "Routine",
    allergies: "No known allergies",
    chronicIllness: "Asthma",
    medications: "Salbutamol Inhaler PRN",
    chiefComplaint: "Follow up check and inhaler prescription renewal.",
    vitals: {
      temperature: "36.6",
      pulse: "80",
      systolic: "110",
      diastolic: "70",
      respRate: "18",
      spo2: "97",
      weight: "58.0",
      height: "162"
    }
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
    doctor: "Dr. Dawit Bekele",
    visitType: "New Visit",
    priorityLevel: "Priority",
    allergies: "No known allergies",
    chronicIllness: "None",
    medications: "None",
    chiefComplaint: "Bilateral knee joint pain.",
    vitals: {
      temperature: "36.9",
      pulse: "76",
      systolic: "128",
      diastolic: "82",
      respRate: "16",
      spo2: "98",
      weight: "82.0",
      height: "178"
    }
  }
];

function Required() {
  return <span className="text-red-500">*</span>;
}

function RequiredField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 flex items-center gap-0.5">
        {label}
        <Required />
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`${inputBase} ${readOnly ? "bg-gray-50 text-gray-500" : ""}`}
    />
  );
}

function GreenCheckbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 select-none">
      <span
        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-emerald-600" : "border border-gray-300 bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className={`text-xs font-bold ${checked ? "text-emerald-600" : "text-gray-500"}`}>{children}</span>
    </button>
  );
}

function SystemPill({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
        active ? "bg-emerald-600 text-white border-emerald-600" : "border border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

const TABS = [
  { key: "chief", label: "Chief Complaint & HPI", icon: MessageSquareText },
  { key: "exam", label: "Examination", icon: Stethoscope },
  { key: "diagnosis", label: "Diagnosis", icon: Activity },
  { key: "plan", label: "Plan & Orders", icon: ClipboardList },
  { key: "prescription", label: "Prescription", icon: Pill },
  { key: "summary", label: "Summary", icon: FileCheck2 },
];

const SYSTEMS = [
  "Constitutional",
  "Head & Neck",
  "Respiratory",
  "Cardiovascular",
  "GI",
  "GU",
  "Musculoskeletal",
  "Neurological",
  "Skin",
  "Psychiatric",
];

/* ---------- Patient Avatar Helper ---------- */
function PatientAvatar({ photo, initials, size = "md" }: { photo?: string; initials?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-xs";
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

/* ============================================================================
   Stage 0 — Doctor's Waiting Queue Selection Dashboard
   ========================================================================== */

function ConsultationQueueStage({
  patients,
  onSelect,
  consultedCount,
}: {
  patients: ConsultationPatient[];
  onSelect: (p: ConsultationPatient) => void;
  consultedCount: number;
}) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.mrn.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query);
      const matchesPriority =
        priorityFilter === "All Priorities" || p.priorityLevel === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [patients, query, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const waiting = patients.length;
    const emergency = patients.filter((p) => p.priorityLevel === "Emergency" || p.priorityLevel === "Urgent").length;
    return {
      waiting,
      emergency,
      avgVisit: "14 Min",
      completed: consultedCount,
    };
  }, [patients, consultedCount]);

  const priorityStyles: Record<ConsultationPatient["priorityLevel"], string> = {
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
          <span className="text-slate-800 font-semibold">Consultation</span>
        </p>

        {/* Title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 font-display">Physician Consultation Desk</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Review triage summaries and open encounters for outpatients waiting in your active consultation queue.
            </p>
          </div>
        </div>

        {/* Queue Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Patients Waiting", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Active in your queue" },
            { label: "Average Session", value: stats.avgVisit, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Consultation time goal" },
            { label: "High Acuity Cases", value: stats.emergency, color: stats.emergency > 0 ? "text-red-600 bg-red-50 border-red-100 font-bold" : "text-amber-600 bg-amber-50 border-amber-100", subtitle: "Requires immediate consult" },
            { label: "Consulted Today", value: stats.completed, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Completed encounters today" },
          ].map(({ label, value, color, subtitle }) => (
            <div key={label} className={`rounded-2xl p-4 ${color.split(" ")[1]} border ${color.split(" ")[2]} flex flex-col gap-1 shadow-sm`}>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
              <span className={`text-2xl font-bold font-display tabular-nums ${color.split(" ")[0]}`}>{value}</span>
              <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col gap-4">
            
            {/* Search Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search size={16} strokeWidth={2.25} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-slate-800">Search Doctor's Waiting Queue</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 font-medium">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""} waiting
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, MRN, phone..."
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

                {/* Priority filter */}
                <div className="relative sm:w-48 shrink-0">
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
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Patient", "MRN", "Triage Vitals Summary", "Arrival Time", "Priority", ""].map((h) => (
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
                            <p className="text-sm text-gray-500 font-medium">No patients found in your consultation queue.</p>
                            <p className="text-xs text-gray-400">Verify queue filters or search keywords.</p>
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
                                <span className="font-semibold text-slate-800 whitespace-nowrap group-hover:text-teal-700 transition-colors font-display">
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
                          {/* Triage Vitals Preview */}
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                                BP {p.vitals.systolic}/{p.vitals.diastolic}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                SpO2 {p.vitals.spo2}%
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 font-mono">
                                Temp {p.vitals.temperature}°C
                              </span>
                            </div>
                          </td>
                          {/* Waiting time */}
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
                          <td className="py-3.5 text-right font-display">
                            <button
                              type="button"
                              onClick={() => onSelect(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#148375] hover:bg-[#116a5f] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              <Stethoscope size={13} strokeWidth={2.5} className="shrink-0" />
                              Start Consult
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

          {/* Right sidebar info */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Brain size={16} strokeWidth={2.25} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-800 font-display">Desk Guidelines</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { step: "1", text: "Select a patient from your queue list to open their clinical encounter chart." },
                  { step: "2", text: "Inspect pre-loaded vital signs recorded at triage." },
                  { step: "3", text: "Record examination findings and diagnosis codes (ICD-10)." },
                  { step: "4", text: "Issue prescriptions and laboratory orders to finalize the encounter." },
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
                <Users size={16} strokeWidth={2.25} className="text-gray-400" />
                <h2 className="text-sm font-bold text-slate-800">Queue Operations</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The smart queue orders patients automatically. Emergency cases are prioritized at the top of the waiting list and flagged in red.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Consultation Intake Chart Screen (Dynamic)
   ========================================================================== */

function ConsultationIntake({
  patient,
  onClear,
  onSubmit,
}: {
  patient: ConsultationPatient;
  onClear: () => void;
  onSubmit: (diagnosis: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("chief");
  const [hpi, setHpi] = useState(
    patient.chiefComplaint ? `Patient reports ${patient.chiefComplaint.toLowerCase()} associated with generalized body weakness.` : "No abnormal findings detected."
  );
  const [reviewOfSystems, setReviewOfSystems] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["Constitutional"]);
  const [generalAppearance, setGeneralAppearance] = useState("Alert");
  const [consciousness, setConsciousness] = useState("Alert & Oriented");
  const [hydration, setHydration] = useState("Normal");
  const [pallor, setPallor] = useState("None");
  const [systemicExam, setSystemicExam] = useState("No abnormal findings detected.");
  const [normalExam, setNormalExam] = useState(true);
  const [secondaryDx, setSecondaryDx] = useState("");
  const [clinicalImpression, setClinicalImpression] = useState(`Most likely tension headache with fatigue. Chief complaint: ${patient.chiefComplaint}`);
  const [managementPlan, setManagementPlan] = useState(
    "Advice rest, adequate hydration and paracetamol as needed. Review after 3 days if no improvement."
  );
  const [advice, setAdvice] = useState("Avoid stress and ensure adequate sleep. Return if symptoms worsen.");
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("2025-05-20");
  const [followUpType, setFollowUpType] = useState("OPD Visit");
  const [followUpWith, setFollowUpWith] = useState("Dr. Dawit Bekele");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("G44.1 - Vascular headache, not elsewhere classified");

  const toggleSystem = (s: string) =>
    setSelectedSystems((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-4">
        {/* Breadcrumb + title + right actions */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Home</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Consultation</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 font-display">Consultation Desk</h1>
              <p className="text-sm text-gray-400 mt-0.5">Examine patient, record clinical findings, and manage treatment plans.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Doctor Queue
            </button>
            <button
              type="button"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        {/* Patient profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={patient.photo || PATIENT_PHOTO}
              alt={patient.name}
              className="w-12 h-12 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">{patient.name}</h2>
              <span className="text-base leading-none text-rose-400" aria-label={patient.gender}>
                {patient.gender === "Female" ? "♀" : "♂"}
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2.5 py-0.5">OPD</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              <HeaderFact label="MRN" value={patient.mrn} />
              <HeaderFact label="Age / DOB" value={`${patient.age} Y / ${patient.dob}`} />
              <HeaderFact label="Phone" value={patient.phone} />
              <HeaderFact label="Visit Type" value={patient.visitType} />
              <HeaderFact label="Department" value={patient.department} />
              <HeaderFact label="Check-in Time" value={patient.checkInTime} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-6 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 pb-3 pt-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active ? "text-teal-700 border-teal-600" : "text-gray-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.25} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid: left content (~78%) + right sidebar (~22%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="1. Chief Complaint" icon={MessageSquareText}>
                <Field label="Chief Complaint">
                  <TextInput value={patient.chiefComplaint} readOnly />
                </Field>
                <Field label="History of Present Illness">
                  <MicTextarea value={hpi} onChange={setHpi} rows={4} />
                </Field>
                <div className="flex flex-col gap-2">
                  <Label>Review of Systems</Label>
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1">
                      <Select
                        value={reviewOfSystems}
                        onChange={setReviewOfSystems}
                        options={["Select or add review of systems", ...SYSTEMS]}
                      />
                    </div>
                    <button
                      type="button"
                      className="shrink-0 w-9 flex items-center justify-center border border-gray-300 rounded-lg text-slate-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={15} strokeWidth={2.25} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SYSTEMS.map((s) => (
                      <SystemPill key={s} label={s} active={selectedSystems.includes(s)} onToggle={() => toggleSystem(s)} />
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="2. Key Examination (Quick View)" icon={Activity} iconTone="text-blue-500">
                <div className="flex flex-col divide-y divide-gray-50">
                  <KeyValueRow label="Temperature" value={`${patient.vitals.temperature} °C`} />
                  <KeyValueRow label="Pulse" value={`${patient.vitals.pulse} bpm`} />
                  <KeyValueRow label="Blood Pressure" value={`${patient.vitals.systolic}/${patient.vitals.diastolic} mmHg`} />
                  <KeyValueRow label="Respiratory Rate" value={`${patient.vitals.respRate} /min`} />
                  <KeyValueRow label="SpO2" value={`${patient.vitals.spo2} %`} />
                  <KeyValueRow label="Weight" value={`${patient.vitals.weight} kg`} />
                </div>
                <button
                  type="button"
                  className="mt-auto flex items-center justify-center border border-gray-300 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors font-display"
                >
                  View Full Vitals
                </button>
              </Card>

              <Card title="3. Physical Examination" icon={Stethoscope} iconTone="text-blue-500">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="General Appearance">
                    <Select
                      value={generalAppearance}
                      onChange={setGeneralAppearance}
                      options={["Alert", "Lethargic", "Distressed", "Well-Appearing"]}
                    />
                  </Field>
                  <Field label="Consciousness">
                    <Select
                      value={consciousness}
                      onChange={setConsciousness}
                      options={["Alert & Oriented", "Drowsy", "Confused", "Unresponsive"]}
                    />
                  </Field>
                  <Field label="Hydration">
                    <Select value={hydration} onChange={setHydration} options={["Normal", "Mild Dehydration", "Moderate Dehydration"]} />
                  </Field>
                  <Field label="Pallor / Icterus / Cyanosis">
                    <Select value={pallor} onChange={setPallor} options={["None", "Pallor", "Icterus", "Cyanosis"]} />
                  </Field>
                </div>
                <Field label="Systemic Examination">
                  <textarea
                    value={systemicExam}
                    onChange={(e) => setSystemicExam(e.target.value)}
                    rows={3}
                    className={`${inputBase} resize-none`}
                  />
                </Field>
                <GreenCheckbox checked={normalExam} onChange={setNormalExam}>
                  Normal Examination
                </GreenCheckbox>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="4. Provisional Diagnosis" icon={ClipboardList}>
                <RequiredField label="Primary Diagnosis">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-emerald-500">
                    <Search size={14} strokeWidth={2.25} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-slate-800 flex-1 truncate font-medium">
                      {primaryDiagnosis}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrimaryDiagnosis("R51 - Headache")}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={14} strokeWidth={2.25} />
                    </button>
                  </div>
                </RequiredField>
                <Field label="Secondary Diagnosis (if any)">
                  <div className="flex items-stretch gap-2">
                    <input
                      value={secondaryDx}
                      onChange={(e) => setSecondaryDx(e.target.value)}
                      placeholder="Search diagnosis (ICD-10)"
                      className={`${inputBase} flex-1`}
                    />
                    <button
                      type="button"
                      className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-3 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      Add
                    </button>
                  </div>
                </Field>
                <Field label="Clinical Impression">
                  <MicTextarea value={clinicalImpression} onChange={setClinicalImpression} rows={3} />
                </Field>
              </Card>

              <Card title="5. Treatment Plan" icon={ClipboardList} iconTone="text-blue-500">
                <Field label="Management Plan">
                  <MicTextarea value={managementPlan} onChange={setManagementPlan} rows={4} />
                </Field>
                <Field label="Advice / Education">
                  <MicTextarea value={advice} onChange={setAdvice} rows={3} />
                </Field>
              </Card>

              <Card title="6. Follow Up" icon={ClipboardList} iconTone="text-blue-500">
                <div className="flex items-center justify-between">
                  <Label>Follow Up Required</Label>
                  <ToggleSwitch checked={followUpRequired} onChange={setFollowUpRequired} />
                </div>
                <Field label="Follow Up Date">
                  <DatePicker key={followUpDate} defaultValue={followUpDate ? new Date(followUpDate) : undefined} onChange={(d) => setFollowUpDate(toISO(d))} />
                </Field>
                <Field label="Follow Up Type">
                  <Select value={followUpType} onChange={setFollowUpType} options={["OPD Visit", "Teleconsultation", "Lab Recheck"]} />
                </Field>
                <Field label="Follow Up With">
                  <Select
                    value={followUpWith}
                    onChange={setFollowUpWith}
                    options={["Dr. Dawit Bekele", "Dr. Hanna Yohannes", "Dr. Selamawit Girma"]}
                  />
                </Field>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Allergies" value={patient.allergies || "No known allergies"} valueClass={patient.allergies && patient.allergies !== "No known allergies" ? "text-red-600 font-bold" : ""} />
                <KeyValueRow label="Chronic Illness" value={patient.chronicIllness || "None"} valueClass={patient.chronicIllness && patient.chronicIllness !== "None" ? "text-amber-600 font-bold" : ""} />
                <KeyValueRow label="Current Medications" value={patient.medications || "None"} />
                <KeyValueRow label="Blood Group" value={patient.bloodGroup} />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600 font-semibold" />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time={patient.checkInTime} title="Registration Completed" detail="by System Check-in" state="done" />
                <TimelineItem time={patient.checkInTime} title="Triage Completed" detail="by Nurse Intake" state="done" />
                <TimelineItem time="--:--" title="Consultation" detail="" state="active" badge="In Progress" />
                <TimelineItem time="--:--" title="Orders" detail="Pending" state="pending" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton
                  icon={FlaskConical}
                  label="Order Laboratory"
                  tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }}
                />
                <QuickActionButton
                  icon={ScanLine}
                  label="Order Radiology"
                  tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }}
                />
                <QuickActionButton
                  icon={StickyNote}
                  label="Add Clinical Note"
                  tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }}
                />
                <QuickActionButton
                  icon={UploadCloud}
                  label="Upload Document"
                  tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }}
                />
                <QuickActionButton
                  icon={Send}
                  label="Request Referral"
                  tone={{ bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={
          <>
            <FooterButton tone="neutral" onClick={onClear}>Cancel &amp; Return</FooterButton>
            <FooterButton tone="info">Save Draft</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="neutral">
              <Printer size={15} strokeWidth={2.25} />
              Print Preview
            </FooterButton>
            <FooterPrimaryButton onClick={() => onSubmit(primaryDiagnosis)}>
              Save &amp; Continue to Orders
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}

/* ============================================================================
   Stage 2 — Consultation Success Screen
   ========================================================================== */

function ConsultationSuccessScreen({
  patient,
  diagnosis,
  onBack,
}: {
  patient: ConsultationPatient;
  diagnosis: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">Consultation Completed</h2>
          <p className="text-sm text-gray-500 px-4">
            Encounter details and clinical assessment for <strong>{patient.name}</strong> have been recorded successfully.
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
          <div className="flex flex-col gap-1 text-xs border-t border-gray-200/60 pt-2 mt-1">
            <span className="text-gray-400 font-medium">Primary Diagnosis Code</span>
            <span className="text-slate-800 font-semibold leading-relaxed truncate">{diagnosis || "G44.1 - Vascular headache"}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2">
            <span className="text-gray-400 font-medium">Status</span>
            <span className="text-emerald-700 font-bold">Routed to Lab/Orders</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-display"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Doctor Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function ConsultationForm() {
  const [selectedPatient, setSelectedPatient] = useState<ConsultationPatient | null>(null);
  const [consultationQueue, setConsultationQueue] = useState<ConsultationPatient[]>(MOCK_CONSULTATION_QUEUE);
  const [consultedCount, setConsultedCount] = useState(12);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");

  const handleSelectPatient = (patient: ConsultationPatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleConsultationComplete = (diagnosis: string) => {
    if (selectedPatient) {
      setSelectedDiagnosis(diagnosis);
      // Remove from queue
      setConsultationQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setConsultedCount((prev) => prev + 1);
      setIsSuccess(true);
    }
  };

  if (isSuccess && selectedPatient) {
    return (
      <ConsultationSuccessScreen
        patient={selectedPatient}
        diagnosis={selectedDiagnosis}
        onBack={() => {
          setSelectedPatient(null);
          setIsSuccess(false);
        }}
      />
    );
  }

  if (!selectedPatient) {
    return (
      <ConsultationQueueStage
        patients={consultationQueue}
        onSelect={handleSelectPatient}
        consultedCount={consultedCount}
      />
    );
  }

  return (
    <ConsultationIntake
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={handleConsultationComplete}
    />
  );
}
