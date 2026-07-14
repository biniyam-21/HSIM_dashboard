"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  HeartPulse,
  Eye,
  ClipboardList,
  Route,
  Paperclip,
  FileCheck2,
  ChevronDown,
  Plus,
  X,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  MoreHorizontal,
  Printer,
  ArrowRight,
  FlaskConical,
  ScanLine,
  Pill as PillIcon,
  StickyNote,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Brain,
  type LucideIcon,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Label,
  Field,
  Select,
  MicTextarea,
  CheckboxRow,
  Card,
  HeaderFact,
  KeyValueRow,
  TimelineItem,
  QuickActionButton,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";

/* ============================================================================
   Clinical Notes (EMR) — FRD 10.1 (Clinical Notes & Documentation), 10.2 (ICD
   coding via System Review tags). Fourth screen in the OPD visit chain:
   OPD Registration -> Triage & Vitals -> Consultation -> Clinical Notes (EMR).
   
   Enhanced with Stage 0 EMR Waiting Queue Dashboard for patient selection.
   ========================================================================== */

type NotesPatient = {
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
  chiefComplaint: string;
  hpi: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  allergies: string[];
  medications: string[];
};

const MOCK_EMR_QUEUE: NotesPatient[] = [
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
    doctor: "Dr. Eyob Tesfaye",
    visitType: "New Visit",
    priorityLevel: "Urgent",
    chiefComplaint: "Headache and body weakness since 2 days.",
    hpi: "Patient reports dull aching headache, more on frontal area, associated with generalized body weakness and mild dizziness.",
    pastMedicalHistory: ["Hypertension", "Migraine"],
    pastSurgicalHistory: "No previous surgeries",
    familyHistory: "No significant family history",
    socialHistory: "Non-smoker, No alcohol use",
    allergies: ["Penicillin"],
    medications: ["Amlodipine 5mg OD", "Paracetamol 500mg PRN"]
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
    chiefComplaint: "Routine blood glucose check.",
    hpi: "Routine diabetic review and follow up.",
    pastMedicalHistory: ["Diabetes Type 2"],
    pastSurgicalHistory: "No previous surgeries",
    familyHistory: "Fathers side diabetic",
    socialHistory: "Occasional social drinking",
    allergies: [],
    medications: ["Metformin 500mg BD"]
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
    chiefComplaint: "Severe RLQ abdominal pain.",
    hpi: "Acute onset sharp pain in RLQ for past 12 hours.",
    pastMedicalHistory: [],
    pastSurgicalHistory: "None",
    familyHistory: "None",
    socialHistory: "Non-smoker",
    allergies: ["Sulfa drugs"],
    medications: []
  }
];

const TAG_TONE = {
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-700",
} as const;

function Tag({ label, tone, onRemove }: { label: string; tone: keyof typeof TAG_TONE; onRemove: () => void }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-1 whitespace-nowrap ${TAG_TONE[tone]}`}>
      {label}
      <button type="button" onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );
}

function MultiSelectTagBox({ tags, tone, onRemove }: { tags: string[]; tone: keyof typeof TAG_TONE; onRemove: (t: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px] flex-wrap">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Tag key={t} label={t} tone={tone} onRemove={() => onRemove(t)} />
        ))}
      </div>
      <ChevronDown size={15} strokeWidth={2} className="text-gray-400 shrink-0" />
    </div>
  );
}

function TagRow({
  tags,
  tone,
  onRemove,
  addLabel,
}: {
  tags: string[];
  tone: keyof typeof TAG_TONE;
  onRemove: (t: string) => void;
  addLabel: string;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex-1 flex flex-wrap items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px]">
        {tags.map((t) => (
          <Tag key={t} label={t} tone={tone} onRemove={() => onRemove(t)} />
        ))}
      </div>
      <button
        type="button"
        className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline whitespace-nowrap px-1"
      >
        <Plus size={14} strokeWidth={2.5} />
        {addLabel}
      </button>
    </div>
  );
}

const SYSTEMS_LEFT = ["Constitutional", "Head & Neck", "Eyes", "ENT", "Respiratory", "Cardiovascular", "Gastrointestinal"];
const SYSTEMS_RIGHT = ["Genitourinary", "Musculoskeletal", "Neurological", "Skin", "Endocrine", "Hematologic", "Psychiatric"];

const TABS = [
  { key: "subjective", label: "Subjective (History)", icon: HeartPulse },
  { key: "objective", label: "Objective (Exam)", icon: Eye },
  { key: "assessment", label: "Assessment", icon: ClipboardList },
  { key: "plan", label: "Plan", icon: Route },
  { key: "notes", label: "Notes & Attachments", icon: Paperclip },
  { key: "summary", label: "Summary", icon: FileCheck2 },
];

const TOOLBAR_ICONS: LucideIcon[] = [Undo2, Redo2, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Paperclip, MoreHorizontal];

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
   Stage 0 — Clinical Notes EMR Queue
   ========================================================================== */

function ClinicalNotesQueueStage({
  patients,
  onSelect,
  notesCount,
}: {
  patients: NotesPatient[];
  onSelect: (p: NotesPatient) => void;
  notesCount: number;
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
      drafts: 3,
      completed: notesCount,
    };
  }, [patients, notesCount]);

  const priorityStyles: Record<NotesPatient["priorityLevel"], string> = {
    Routine: "bg-slate-50 text-slate-700 border-slate-200",
    Priority: "bg-blue-50 text-blue-700 border-blue-200",
    Urgent: "bg-amber-50 text-amber-700 border-amber-200",
    Emergency: "bg-red-50 text-red-700 border-red-200 font-bold",
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">
        
        <p className="text-xs text-gray-400">
          Home <span className="mx-1 text-gray-300">&gt;</span> OPD Management{" "}
          <span className="mx-1 text-gray-300">&gt;</span>
          <span className="text-slate-800 font-semibold">Clinical Notes (EMR)</span>
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 font-display">Clinical Notes Waiting Queue</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Select a patient to document details in their electronic medical records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Notes", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Awaiting EMR entry" },
            { label: "Drafts Saved", value: stats.drafts, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Unfinished records" },
            { label: "High Acuity Cases", value: stats.emergency, color: stats.emergency > 0 ? "text-red-600 bg-red-50 border-red-100 font-bold" : "text-amber-600 bg-amber-50 border-amber-100", subtitle: "Urgent documentation needed" },
            { label: "Records Completed", value: stats.completed, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Signed off today" },
          ].map(({ label, value, color, subtitle }) => (
            <div key={label} className={`rounded-2xl p-4 ${color.split(" ")[1]} border ${color.split(" ")[2]} flex flex-col gap-1 shadow-sm`}>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
              <span className={`text-2xl font-bold font-display tabular-nums ${color.split(" ")[0]}`}>{value}</span>
              <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search size={16} strokeWidth={2.25} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-slate-800">Search EMR Patient Queue</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 font-medium">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""} waiting
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, MRN, phone..."
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Patient", "MRN", "Attending Doctor / Dept", "Check-in Time", "Priority", ""].map((h) => (
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
                            <p className="text-sm text-gray-500 font-medium">No patients found in your clinical notes queue.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paged.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-teal-50/40 transition-colors group"
                        >
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
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 tabular-nums whitespace-nowrap">
                              {p.mrn}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-855">{p.doctor}</span>
                              <span className="text-[11px] text-gray-455">{p.department}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-xs font-semibold text-slate-650 tabular-nums">
                            {p.checkInTime}
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`inline-flex items-center text-xs font-bold border rounded-full px-2.5 py-0.5 ${priorityStyles[p.priorityLevel] || ""}`}>
                              {p.priorityLevel}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-display">
                            <button
                              type="button"
                              onClick={() => onSelect(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#148375] hover:bg-[#116a5f] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              <StickyNote size={13} strokeWidth={2.5} className="shrink-0" />
                              Add EMR Note
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {paged.length > 0 && filtered.length > pageSize && (
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

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Brain size={16} strokeWidth={2.25} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-800 font-display">Notes & Documentation</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Documentation of clinical notes is critical for outpatient medical review and billing validation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Clinical Notes Intake Form (Dynamic)
   ========================================================================== */

function ClinicalNotesIntake({
  patient,
  onClear,
  onSubmit,
}: {
  patient: NotesPatient;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const [activeTab, setActiveTab] = useState("subjective");
  const [historySource, setHistorySource] = useState("Patient");
  const [chiefComplaint, setChiefComplaint] = useState(patient.chiefComplaint);
  const [hpi, setHpi] = useState(patient.hpi);
  const [pastMedicalHistory, setPastMedicalHistory] = useState(patient.pastMedicalHistory);
  const [pastSurgicalHistory, setPastSurgicalHistory] = useState(patient.pastSurgicalHistory);
  const [familyHistory, setFamilyHistory] = useState(patient.familyHistory);
  const [socialHistory, setSocialHistory] = useState(patient.socialHistory);
  const [systems, setSystems] = useState<string[]>(["Constitutional"]);
  const [allergies, setAllergies] = useState(patient.allergies);
  const [medications, setMedications] = useState(patient.medications);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const toggleSystem = (s: string) =>
    setSystems((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const wordCount = hpi.trim() ? hpi.trim().split(/\s+/).length : 0;
  const charCount = hpi.length;

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-4">
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Home</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Clinical Notes (EMR)</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 font-display">Clinical Notes (EMR)</h1>
              <p className="text-sm text-gray-400 mt-0.5">Create and manage electronic medical records.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Queue
            </button>
            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={patient.photo || PATIENT_PHOTO} alt={patient.name} className="w-12 h-12 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
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
                    active ? "text-emerald-600 border-emerald-500" : "text-gray-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.25} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <Card title="1. Subjective (History)" icon={HeartPulse}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="History Source">
                    <Select value={historySource} onChange={setHistorySource} options={["Patient", "Guardian", "Caregiver", "Referral Note"]} />
                  </Field>
                  <Field label="Chief Complaint">
                    <MicTextarea value={chiefComplaint} onChange={setChiefComplaint} rows={2} />
                  </Field>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>History of Present Illness</Label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
                      {TOOLBAR_ICONS.map((Icon, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <Icon size={14} strokeWidth={2.25} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={hpi}
                      onChange={(e) => setHpi(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none"
                    />
                    <div className="flex justify-end px-3 py-1.5 border-t border-gray-100">
                      <span className="text-xs text-gray-400 tabular-nums">
                        Words: {wordCount} &nbsp; Chars: {charCount}
                      </span>
                    </div>
                  </div>
                </div>

                <Field label="Past Medical History">
                  <MultiSelectTagBox tags={pastMedicalHistory} tone="green" onRemove={(t) => setPastMedicalHistory((p) => p.filter((x) => x !== t))} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Past Surgical History">
                    <Select
                      value={pastSurgicalHistory}
                      onChange={setPastSurgicalHistory}
                      options={["No previous surgeries", "Appendectomy", "C-Section", "Other (see notes)"]}
                    />
                  </Field>
                  <Field label="Family History">
                    <input value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className={inputBase} />
                  </Field>
                </div>

                <Field label="Social History">
                  <input value={socialHistory} onChange={(e) => setSocialHistory(e.target.value)} className={inputBase} />
                </Field>
              </Card>

              <div className="flex flex-col gap-4">
                <Card title="2. System Review" icon={Users} iconTone="text-blue-500">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex flex-col">
                      {SYSTEMS_LEFT.map((s) => (
                        <CheckboxRow key={s} label={s} checked={systems.includes(s)} onToggle={() => toggleSystem(s)} />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {SYSTEMS_RIGHT.map((s) => (
                        <CheckboxRow key={s} label={s} checked={systems.includes(s)} onToggle={() => toggleSystem(s)} />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="3. Allergies" icon={Users} iconTone="text-violet-500">
                  <TagRow tags={allergies} tone="red" onRemove={(t) => setAllergies((p) => p.filter((x) => x !== t))} addLabel="Add" />
                </Card>

                <Card title="4. Current Medications" icon={Users} iconTone="text-blue-500">
                  <TagRow tags={medications} tone="blue" onRemove={(t) => setMedications((p) => p.filter((x) => x !== t))} addLabel="Add Medication" />
                </Card>
              </div>
            </div>

            <Card title="5. Additional Notes" icon={Users}>
              <MicTextarea value={additionalNotes} onChange={setAdditionalNotes} rows={3} placeholder="Add any additional patient notes..." />
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Blood Group" value={patient.bloodGroup} />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600 font-semibold" />
                <KeyValueRow label="Last Visit" value="Apr 10, 2025" />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time={patient.checkInTime} title="Registration Completed" detail="by System Check-in" state="done" />
                <TimelineItem time={patient.checkInTime} title="Triage Completed" detail="by Nurse Intake" state="done" />
                <TimelineItem time="--:--" title="Consultation Started" detail="" state="active" />
                <TimelineItem time="--:--" title="Clinical Notes" detail="" state="active" badge="In Progress" />
                <TimelineItem time="--" title="Orders" detail="Pending" state="pending" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton icon={FlaskConical} label="Order Laboratory" tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }} />
                <QuickActionButton icon={ScanLine} label="Order Radiology" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
                <QuickActionButton icon={PillIcon} label="Prescription" tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }} />
                <QuickActionButton icon={StickyNote} label="Add Clinical Note" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
              </div>
            </Card>
          </div>
        </div>
      </div>

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
            <FooterPrimaryButton onClick={onSubmit}>
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
   Stage 2 — EMR Completion Success Screen
   ========================================================================== */

function ClinicalNotesSuccessScreen({
  patient,
  onBack,
}: {
  patient: NotesPatient;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">EMR Documented</h2>
          <p className="text-sm text-gray-500 px-4">
            Clinical history and medical records for <strong>{patient.name}</strong> have been signed off.
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
          <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2 mt-1">
            <span className="text-gray-400 font-medium">Document Status</span>
            <span className="text-emerald-700 font-bold">Signed Off</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-display"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Notes Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function ClinicalNotesForm() {
  const [selectedPatient, setSelectedPatient] = useState<NotesPatient | null>(null);
  const [queue, setQueue] = useState<NotesPatient[]>(MOCK_EMR_QUEUE);
  const [notesCount, setNotesCount] = useState(8);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPatient = (patient: NotesPatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleComplete = () => {
    if (selectedPatient) {
      setQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setNotesCount((prev) => prev + 1);
      setIsSuccess(true);
    }
  };

  if (isSuccess && selectedPatient) {
    return (
      <ClinicalNotesSuccessScreen
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
      <ClinicalNotesQueueStage
        patients={queue}
        onSelect={handleSelectPatient}
        notesCount={notesCount}
      />
    );
  }

  return (
    <ClinicalNotesIntake
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={handleComplete}
    />
  );
}
