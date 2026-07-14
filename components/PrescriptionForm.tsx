"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Trash2,
  UploadCloud,
  FileText,
  History,
  Printer,
  ArrowRight,
  Info,
  Cross,
  Send,
  Star,
  Ban,
  Eye,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Brain,
  Clock,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Field,
  Label,
  Select,
  Chip,
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

/* ============================================================================
   Prescription — E-Prescribing. Fifth screen in the OPD visit
   chain: OPD Registration -> Triage & Vitals -> Consultation -> Prescription.
   
   Enhanced with Stage 0: Prescription Waiting Queue selection desk.
   ========================================================================== */

type Medicine = {
  id: number;
  name: string;
  tag: string;
  tagTone: "green" | "blue";
  strength: string;
  form: string;
  dose: string;
  route: string;
  duration: string;
  qty: string;
  frequency: string;
};

type RxPatient = {
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
  diagnosis: string;
  allergies: string;
  medications: string;
  initialMedicines: Medicine[];
};

const MOCK_RX_QUEUE: RxPatient[] = [
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
    diagnosis: "I10 - Essential (primary) hypertension",
    allergies: "Penicillin",
    medications: "Amlodipine 5mg OD",
    initialMedicines: [
      {
        id: 1,
        name: "Amlodipine",
        tag: "Anti-hypertensive",
        tagTone: "green",
        strength: "5 mg",
        form: "Tablet",
        dose: "1 tablet",
        route: "Oral",
        duration: "30 Days",
        qty: "30",
        frequency: "OD - Once daily",
      },
      {
        id: 2,
        name: "Paracetamol",
        tag: "Analgesic",
        tagTone: "blue",
        strength: "500 mg",
        form: "Tablet",
        dose: "1 tablet",
        route: "Oral",
        duration: "5 Days",
        qty: "10",
        frequency: "PRN - SOS",
      },
      {
        id: 3,
        name: "Omeprazole",
        tag: "Gastric Acid Reducer",
        tagTone: "green",
        strength: "20 mg",
        form: "Capsule",
        dose: "1 capsule",
        route: "Oral",
        duration: "30 Days",
        qty: "30",
        frequency: "OD - Once daily",
      }
    ]
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
    diagnosis: "E11.9 - Type 2 diabetes mellitus without complications",
    allergies: "No known allergies",
    medications: "Metformin 500mg BD",
    initialMedicines: [
      {
        id: 1,
        name: "Metformin",
        tag: "Antidiabetic agent",
        tagTone: "green",
        strength: "500 mg",
        form: "Tablet",
        dose: "1 tablet",
        route: "Oral",
        duration: "30 Days",
        qty: "60",
        frequency: "BD - Twice daily",
      }
    ]
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
    diagnosis: "K35.8 - Acute appendicitis, other and unspecified",
    allergies: "Sulfa drugs",
    medications: "None",
    initialMedicines: [
      {
        id: 1,
        name: "Ceftriaxone",
        tag: "Antibiotic",
        tagTone: "blue",
        strength: "1 g",
        form: "Injection",
        dose: "1 vial",
        route: "IV",
        duration: "1 Day",
        qty: "1",
        frequency: "STAT",
      }
    ]
  }
];

const TAG_CHIP_TONE: Record<Medicine["tagTone"], "emerald" | "blue"> = { green: "emerald", blue: "blue" };

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
   Stage 0 — Prescription Queue Selection desk
   ========================================================================== */

function PrescriptionQueueStage({
  patients,
  onSelect,
  rxCount,
}: {
  patients: RxPatient[];
  onSelect: (p: RxPatient) => void;
  rxCount: number;
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
    const allergyRisk = patients.filter((p) => p.allergies && p.allergies !== "No known allergies").length;
    return {
      waiting,
      allergyRisk,
      drafts: 2,
      completed: rxCount,
    };
  }, [patients, rxCount]);

  const priorityStyles: Record<RxPatient["priorityLevel"], string> = {
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
          <span className="text-slate-800 font-semibold">Prescription</span>
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 font-display">Prescription Writing Desk</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Review diagnoses and write e-prescriptions for waiting patients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Prescriptions Pending", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Active in queue" },
            { label: "Med Allergy Risks", value: stats.allergyRisk, color: stats.allergyRisk > 0 ? "text-red-600 bg-red-50 border-red-100 font-bold" : "text-amber-600 bg-amber-50 border-amber-100", subtitle: "Flagged drug safety flags" },
            { label: "Saved Drafts", value: stats.drafts, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Unsent prescriptions" },
            { label: "Sent to Pharmacy", value: stats.completed, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Completed RX today" },
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
                  <h2 className="text-sm font-bold text-slate-800 font-display">Search Prescription Queue</h2>
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
                      {["Patient", "MRN", "Primary Diagnosis", "Allergies", "Priority", ""].map((h) => (
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
                            <p className="text-sm text-gray-500 font-medium">No patients found in your prescription queue.</p>
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
                          <td className="py-3.5 pr-4 max-w-[200px] truncate font-medium text-slate-700">
                            {p.diagnosis}
                          </td>
                          <td className="py-3.5 pr-4">
                            {p.allergies && p.allergies !== "No known allergies" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5">
                                <ShieldAlert size={11} strokeWidth={2.5} />
                                {p.allergies}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
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
                              <ClipboardList size={13} strokeWidth={2.5} className="shrink-0" />
                              Write RX
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
                <h2 className="text-sm font-bold text-slate-800 font-display">Prescription Safety</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Confirm drug-allergy interactions before completing prescriptions. High-acuity patients should be prioritized for immediate pharmacy dispatch.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Prescription Intake Screen
   ========================================================================== */

function PrescriptionIntake({
  patient,
  onClear,
  onSubmit,
}: {
  patient: RxPatient;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const [medicines, setMedicines] = useState(patient.initialMedicines);
  const [search, setSearch] = useState("");
  const [notesToPharmacist, setNotesToPharmacist] = useState("Advise patient to take after food.");
  const [adviceToPatient, setAdviceToPatient] = useState("Avoid salty food and regular exercise. Return if symptoms worsen.");
  const [followUpDate, setFollowUpDate] = useState("2025-05-24");
  const [followUpType, setFollowUpType] = useState("OPD Visit");
  const [maySubstitute, setMaySubstitute] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const removeMedicine = (id: number) => setMedicines((prev) => prev.filter((m) => m.id !== id));
  const clearAll = () => setMedicines([]);
  const addMedicine = () =>
    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "New Medicine",
        tag: "Unspecified",
        tagTone: "blue",
        strength: "—",
        form: "—",
        dose: "—",
        route: "Oral",
        duration: "—",
        qty: "—",
        frequency: "—",
      },
    ]);

  const followUpDateLabel = new Date(followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
              <span className="text-slate-800 font-semibold">Prescription</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 font-display">Prescription Desk</h1>
              <p className="text-sm text-gray-400 mt-0.5">Create, manage and print patient prescription.</p>
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
              <Chip tone="teal">OPD</Chip>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="1. Prescription Items" icon={ClipboardList}>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search medicine (generic or brand name)..."
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-3.5 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Add from Favorites
                </button>
              </div>

              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="text-left text-[10.5px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="px-1 py-2">#</th>
                      <th className="px-2 py-2">Medicine</th>
                      <th className="px-2 py-2">Strength</th>
                      <th className="px-2 py-2">Form</th>
                      <th className="px-2 py-2">Dose &amp; Instruction</th>
                      <th className="px-2 py-2">Route</th>
                      <th className="px-2 py-2">Duration</th>
                      <th className="px-2 py-2">Qty</th>
                      <th className="px-2 py-2">Frequency</th>
                      <th className="px-2 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, idx) => (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-[#FBFCFD] transition-colors">
                        <td className="px-1 py-3 text-slate-500 tabular-nums">{idx + 1}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 whitespace-nowrap">{m.name}</span>
                            <Chip tone={TAG_CHIP_TONE[m.tagTone]}>{m.tag}</Chip>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.strength}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.form}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.dose}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.route}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.duration}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.qty}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.frequency}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                              <Pencil size={14} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMedicine(m.id)}
                              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-2 py-8 text-center text-sm text-gray-400">
                          No medicines added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-4 pt-3">
                  <button type="button" onClick={addMedicine} className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                    <Plus size={14} strokeWidth={2.5} />
                    Add Medicine
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <span className="text-sm font-semibold text-slate-700 pt-3">Total Items: <span className="tabular-nums">{medicines.length}</span></span>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <Card title="2. Prescription Details" icon={Users}>
                <Field label="Diagnosis (ICD-10)">
                  <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2">
                    <Chip tone="blue" removable>
                      {patient.diagnosis}
                    </Chip>
                    <Search size={14} strokeWidth={2.25} className="text-gray-400 shrink-0" />
                  </div>
                </Field>
                <Field label="Notes to Pharmacist">
                  <textarea value={notesToPharmacist} onChange={(e) => setNotesToPharmacist(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <Field label="Advice to Patient">
                  <textarea value={adviceToPatient} onChange={(e) => setAdviceToPatient(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Follow Up">
                    <DatePicker key={followUpDate} defaultValue={followUpDate ? new Date(followUpDate) : undefined} onChange={(d) => setFollowUpDate(toISO(d))} />
                  </Field>
                  <Field label="Follow Up Type">
                    <Select value={followUpType} onChange={setFollowUpType} options={["OPD Visit", "Teleconsultation", "Lab Recheck"]} />
                  </Field>
                </div>
                <button type="button" onClick={() => setMaySubstitute((v) => !v)} className="flex items-center gap-2 select-none">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      maySubstitute ? "bg-emerald-600" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {maySubstitute && <Check size={11} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="text-xs font-bold text-gray-600">May Substitute</span>
                  <Info size={13} strokeWidth={2.25} className="text-gray-400" />
                </button>
              </Card>

              <Card title="3. Attachments (Optional)" icon={Users}>
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                  <UploadCloud size={26} strokeWidth={1.75} className="text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Drag &amp; drop files here or
                  </p>
                  <button type="button" className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                    Choose Files
                  </button>
                  <p className="text-[11px] text-gray-400">Supports: JPG, PNG, PDF (Max. 5MB)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Previous Prescriptions</Label>
                  <button type="button" className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                    <History size={15} strokeWidth={2.25} />
                    View History
                  </button>
                </div>
              </Card>

              <Card
                title="4. Prescription Preview"
                icon={FileText}
                action={
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={13} strokeWidth={2.25} />
                    Preview
                  </button>
                }
              >
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Cross size={16} strokeWidth={2.25} className="text-teal-700" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold text-slate-900">Fekre selam General Hospital</span>
                      <span className="text-[11px] text-gray-400">Addis Ababa, Ethiopia</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-900">{patient.name}</span>
                      <span className="text-[11px] text-gray-500 tabular-nums font-mono">MRN: {patient.mrn}</span>
                    </div>
                  </div>

                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-100">
                        <th className="py-1 font-semibold">Rx</th>
                        <th className="py-1 font-semibold">Medicine</th>
                        <th className="py-1 font-semibold">Strength</th>
                        <th className="py-1 font-semibold">Instruction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m, i) => (
                        <tr key={m.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-1.5 text-slate-500 tabular-nums">{i + 1}</td>
                          <td className="py-1.5 text-slate-800 font-medium">{m.name}</td>
                          <td className="py-1.5 text-slate-700 tabular-nums">{m.strength}</td>
                          <td className="py-1.5 text-slate-700">{m.dose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <p className="text-slate-700">
                      <span className="font-semibold">Advice:</span> {adviceToPatient}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">Follow Up:</span> <span className="tabular-nums">{followUpDateLabel}</span> ({followUpType})
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Blood Group" value={patient.bloodGroup} />
                <KeyValueRow label="Allergies" value={patient.allergies} valueClass={patient.allergies !== "No known allergies" ? "text-red-600 font-bold" : ""} />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600 font-semibold" />
                <KeyValueRow label="Current Medications" value={patient.medications} />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time={patient.checkInTime} title="Registration Completed" detail="by System Check-in" state="done" />
                <TimelineItem time={patient.checkInTime} title="Triage Completed" detail="by Nurse Intake" state="done" />
                <TimelineItem time="--:--" title="Consultation" detail="Completed" state="done" />
                <TimelineItem time="--:--" title="Prescription" detail="" state="active" badge="In Progress" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton icon={Printer} onClick={() => setIsPreviewOpen(true)} label="Print Prescription" tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }} />
                <QuickActionButton icon={Send} label="Send to Pharmacy" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
                <QuickActionButton icon={FileText} label="Save as Draft" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
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
            <FooterButton tone="neutral" onClick={() => setIsPreviewOpen(true)}>
              <Printer size={15} strokeWidth={2.25} />
              Print Preview
            </FooterButton>
            <FooterPrimaryButton onClick={onSubmit}>
              Save &amp; Send to Pharmacy
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />

      {/* ── Prescription Print Preview Modal ────────────────────────────── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200 font-sans text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gray-50">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 font-display">Prescription Print Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Printer size={13} strokeWidth={2.5} />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-slate-800 transition-colors"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Modal Body: Styled Prescription Pad Sheet */}
            <div className="p-8 overflow-y-auto max-h-[70vh] bg-slate-50 flex justify-center">
              <div className="bg-white w-[21cm] max-w-full p-8 shadow-md border-t-[8px] border-[#148375] rounded-b-lg flex flex-col gap-6 text-[13px] relative leading-relaxed">
                {/* Hospital Header letterhead */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                    <Cross size={20} strokeWidth={2.5} className="text-[#148375]" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <h4 className="text-base font-bold text-[#148375] tracking-tight">FEKRE SELAM GENERAL HOSPITAL</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Addis Ababa, Ethiopia · Tel: +251 11 123 4567 · info@fekreselam.org</p>
                  </div>
                </div>

                {/* Patient & Doctor details section */}
                <div className="grid grid-cols-2 gap-4 bg-gray-55/40 border border-gray-100 rounded-xl p-4 text-[11.5px] leading-relaxed">
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Details</h5>
                    <p className="font-bold text-slate-800 text-xs">{patient.name}</p>
                    <p className="text-gray-500 mt-0.5">{patient.gender} · {patient.age} Y · DOB: {patient.dob}</p>
                    <p className="text-gray-500">Phone: {patient.phone}</p>
                  </div>
                  <div className="border-l border-gray-200/80 pl-4">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prescribing Doctor</h5>
                    <p className="font-bold text-slate-800 text-xs">{patient.doctor}</p>
                    <p className="text-gray-500 mt-0.5">Dept: {patient.department}</p>
                    <p className="text-gray-500">Lic No: FM-9042-ET</p>
                  </div>
                </div>

                {/* Rx Symbol section */}
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-serif text-[#148375] italic leading-none select-none font-semibold">Rx</div>
                  
                  {/* Prescribed Drugs Table */}
                  <table className="w-full text-left border-collapse mt-1">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-2 pr-2 w-8">#</th>
                        <th className="py-2 px-2">Medicine / Strength</th>
                        <th className="py-2 px-2">Form</th>
                        <th className="py-2 px-2">Route</th>
                        <th className="py-2 px-2">Frequency</th>
                        <th className="py-2 px-2 text-right">Duration / Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m, idx) => (
                        <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="py-2.5 pr-2 font-medium text-gray-400 tabular-nums">{idx + 1}</td>
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-slate-800">{m.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{m.dose}</div>
                          </td>
                          <td className="py-2.5 px-2 text-slate-600">{m.form}</td>
                          <td className="py-2.5 px-2 text-slate-600">{m.route}</td>
                          <td className="py-2.5 px-2 text-slate-600">{m.frequency}</td>
                          <td className="py-2.5 px-2 text-right text-slate-700">
                            <div>{m.duration}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">Qty: {m.qty}</div>
                          </td>
                        </tr>
                      ))}
                      {medicines.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 italic">No drugs prescribed.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Advice & Followup details */}
                <div className="border-t border-slate-200 pt-4 flex flex-col gap-2.5 text-[12px] relative min-h-[80px]">
                  {/* Hospital Stamp */}
                  <div className="absolute right-4 top-2 flex flex-col items-center gap-0.5 select-none pointer-events-none opacity-85 rotate-12">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-teal-650/40 flex items-center justify-center text-[8px] font-bold text-teal-600/50 uppercase">
                      Hospital Stamp
                    </div>
                    <span className="text-[9px] text-teal-600/50 font-bold tracking-wider -mt-0.5">Verified</span>
                  </div>

                  {adviceToPatient && (
                    <p className="text-slate-700 max-w-[80%]">
                      <span className="font-bold text-slate-800">Advice to Patient: </span>
                      {adviceToPatient}
                    </p>
                  )}
                  {notesToPharmacist && (
                    <p className="text-slate-700 max-w-[80%]">
                      <span className="font-bold text-[#148375]">Note to Pharmacist: </span>
                      {notesToPharmacist}
                    </p>
                  )}
                  <p className="text-slate-700 max-w-[80%]">
                    <span className="font-bold text-slate-800">Follow-up: </span>
                    <span className="font-semibold">{followUpDateLabel}</span> via {followUpType}
                  </p>
                </div>

                {/* Stamp & Signature area */}
                <div className="mt-6 flex justify-end items-end border-t border-slate-100 pt-4">
                  <div className="flex flex-col items-center gap-1.5">
                    {/* Simulated Signature */}
                    <div className="h-8 w-24 border-b border-slate-350 flex items-center justify-center font-serif italic text-emerald-700 text-sm select-none">
                      {patient.doctor}
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500 font-display">Authorized Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-gray-100 transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   Stage 2 — Prescription Success Screen
   ========================================================================== */

function PrescriptionSuccessScreen({
  patient,
  onBack,
}: {
  patient: RxPatient;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">Prescription Dispatched</h2>
          <p className="text-sm text-gray-500 px-4">
            E-prescription details for <strong>{patient.name}</strong> have been transmitted directly to the central pharmacy.
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
            <span className="text-gray-400 font-medium">Status</span>
            <span className="text-emerald-700 font-bold">Sent to Pharmacy Queue</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-display"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Rx Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function PrescriptionForm() {
  const [selectedPatient, setSelectedPatient] = useState<RxPatient | null>(null);
  const [queue, setQueue] = useState<RxPatient[]>(MOCK_RX_QUEUE);
  const [rxCount, setRxCount] = useState(15);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPatient = (patient: RxPatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleComplete = () => {
    if (selectedPatient) {
      setQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setRxCount((prev) => prev + 1);
      setIsSuccess(true);
    }
  };

  if (isSuccess && selectedPatient) {
    return (
      <PrescriptionSuccessScreen
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
      <PrescriptionQueueStage
        patients={queue}
        onSelect={handleSelectPatient}
        rxCount={rxCount}
      />
    );
  }

  return (
    <PrescriptionIntake
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={handleComplete}
    />
  );
}
