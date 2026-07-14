"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  Search,
  Plus,
  Check,
  Pencil,
  Copy,
  Trash2,
  Printer,
  Save,
  Send,
  History,
  Star,
  Mic,
  UploadCloud,
  FileText,
  FlaskConical,
  ScanLine,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Clock,
  Droplet,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Brain,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Field,
  Chip,
  Badge,
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
   Investigation Orders (Lab & Radiology) — EMR test order module.
   FRD 23.1 (Test Order Management) + 24.1 (Imaging Order Management).
   
   Enhanced with Stage 0: Diagnostics Order Waiting Queue dashboard.
   ========================================================================== */

type Priority = "Routine" | "Urgent" | "STAT";
type Prep = "none" | "fasting" | "consent";
type Status = "Ordered" | "Pending";

type Investigation = {
  id: number;
  name: string;
  department: string;
  category: "Laboratory" | "Radiology" | "CT" | "MRI" | "Ultrasound" | "Cardiology";
  priority: Priority;
  prep: Prep;
  turnaround: string;
  indication: string;
  status: Status;
  selected: boolean;
};

type OrderPatient = {
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
  weight: string;
  height: string;
  initialInvestigations: Investigation[];
};

const MOCK_ORDER_QUEUE: OrderPatient[] = [
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
    visitType: "Follow-Up",
    priorityLevel: "Urgent",
    diagnosis: "Hypertension, T2DM",
    allergies: "Penicillin",
    medications: "Amlodipine 5mg OD",
    weight: "68",
    height: "162",
    initialInvestigations: [
      { id: 1, name: "CBC", department: "Hematology", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "2 Hours", indication: "Assess for infection / anemia", status: "Ordered", selected: true },
      { id: 2, name: "Lipid Profile", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "fasting", turnaround: "6 Hours", indication: "Diabetes follow-up lipid screening", status: "Ordered", selected: true },
      { id: 3, name: "Liver Function Test", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "fasting", turnaround: "6 Hours", indication: "Baseline before statin therapy", status: "Pending", selected: false },
      { id: 4, name: "Kidney Function Test", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "Monitor renal function, hypertensive", status: "Ordered", selected: true },
      { id: 5, name: "Urinalysis", department: "Pathology", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "2 Hours", indication: "Screen for proteinuria", status: "Ordered", selected: true },
      { id: 6, name: "Blood Culture", department: "Microbiology", category: "Laboratory", priority: "STAT", prep: "consent", turnaround: "3 Days", indication: "Rule out bacteremia if febrile", status: "Pending", selected: false },
      { id: 7, name: "Chest X-Ray (PA)", department: "Radiology", category: "Radiology", priority: "Urgent", prep: "none", turnaround: "2 Hours", indication: "Evaluate pulmonary cause of weakness", status: "Ordered", selected: true },
      { id: 8, name: "CT Brain", department: "CT", category: "CT", priority: "STAT", prep: "consent", turnaround: "6 Hours", indication: "Rule out intracranial pathology", status: "Pending", selected: false },
      { id: 11, name: "ECG", department: "Cardiology", category: "Cardiology", priority: "Urgent", prep: "none", turnaround: "2 Hours", indication: "Baseline cardiac assessment, HTN", status: "Ordered", selected: true },
      { id: 14, name: "Blood Glucose (RBS)", department: "Biochemistry", category: "Laboratory", priority: "STAT", prep: "none", turnaround: "2 Hours", indication: "Diabetic monitoring", status: "Ordered", selected: true },
      { id: 15, name: "HbA1c", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "3-month glycemic control assessment", status: "Ordered", selected: true }
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
    diagnosis: "T2DM Checkup",
    allergies: "No known allergies",
    medications: "Metformin 500mg BD",
    weight: "74",
    height: "172",
    initialInvestigations: [
      { id: 1, name: "HbA1c", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "Diabetic checkup", status: "Ordered", selected: true }
    ]
  }
];

const CATEGORY_FILTERS = ["All", "Laboratory", "Radiology", "Ultrasound", "CT", "MRI", "Pathology", "Microbiology", "Cardiology", "Procedures", "Endoscopy", "Other"];

const PRIORITY_CLASS: Record<Priority, string> = {
  Routine: "bg-gray-100 text-gray-600",
  Urgent: "bg-amber-50 text-amber-700",
  STAT: "bg-red-50 text-red-600",
};

const ORDER_TEMPLATES = [
  { name: "Diabetes Panel", meta: "HbA1c, Glucose, Lipid Profile, Urinalysis · 4 tests", icon: Droplet, applied: true },
  { name: "Hypertension Panel", meta: "ECG, KFT, Electrolytes · 3 tests", icon: HeartPulse, applied: true },
  { name: "Chest Pain Panel", meta: "ECG, Troponin, Chest X-Ray · 3 tests", icon: HeartPulse, applied: false },
];

const AI_SUGGESTIONS: { group: string; name: string; department: string; category: Investigation["category"] }[] = [
  { group: "Diabetes", name: "HbA1c", department: "Biochemistry", category: "Laboratory" },
  { group: "Diabetes", name: "Lipid Profile", department: "Biochemistry", category: "Laboratory" },
  { group: "Hypertension", name: "ECG", department: "Cardiology", category: "Cardiology" },
];

const LAB_CATEGORY_MATCH = (c: Investigation["category"]) => c === "Laboratory";

function prepLabel(prep: Prep) {
  if (prep === "fasting") return { text: "Fasting (8h)", cls: "text-amber-600" };
  if (prep === "consent") return { text: "Consent required", cls: "text-blue-600" };
  return { text: "Non-fasting", cls: "text-gray-400" };
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
   Stage 0 — Diagnostics Order Waiting Queue
   ========================================================================== */

function OrderQueueStage({
  patients,
  onSelect,
  ordersCount,
}: {
  patients: OrderPatient[];
  onSelect: (p: OrderPatient) => void;
  ordersCount: number;
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
      drafts: 4,
      completed: ordersCount,
    };
  }, [patients, ordersCount]);

  const priorityStyles: Record<OrderPatient["priorityLevel"], string> = {
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
          <span className="text-slate-800 font-semibold">Investigation Orders</span>
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 font-display">Diagnostics Order Desk</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Review diagnostic needs and dispatch laboratory/radiology requests.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Tests", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Active in queue" },
            { label: "STAT Cases", value: stats.emergency, color: stats.emergency > 0 ? "text-red-600 bg-red-50 border-red-100 font-bold" : "text-amber-600 bg-amber-50 border-amber-100", subtitle: "Require immediate orders" },
            { label: "Templates Saved", value: stats.drafts, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Custom template groups" },
            { label: "Orders Dispatched", value: stats.completed, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Completed orders today" },
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
                  <h2 className="text-sm font-bold text-slate-800">Search Waiting Queue</h2>
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
                      {["Patient", "MRN", "Diagnosis", "Attending Doctor / Dept", "Priority", ""].map((h) => (
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
                            <p className="text-sm text-gray-500 font-medium">No patients found in your orders queue.</p>
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
                          <td className="py-3.5 pr-4 font-semibold text-slate-705 max-w-[200px] truncate">
                            {p.diagnosis}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-855">{p.doctor}</span>
                              <span className="text-[11px] text-gray-455">{p.department}</span>
                            </div>
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
                              <FlaskConical size={13} strokeWidth={2.5} className="shrink-0" />
                              Place Orders
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Brain size={16} strokeWidth={2.25} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-800 font-display">Order Dispatch Guidelines</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Confirm diagnostic indications and safety requirements prior to sending lab and imaging orders.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Investigation Orders Form (Dynamic)
   ========================================================================== */

function OrderIntake({
  patient,
  onClear,
  onSubmit,
}: {
  patient: OrderPatient;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const [investigations, setInvestigations] = useState(patient.initialInvestigations);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [workingDiagnosis, setWorkingDiagnosis] = useState(patient.diagnosis);
  const [clinicalIndication, setClinicalIndication] = useState(
    "Routine follow-up bloodwork and cardiac / renal screening for a known hypertensive, diabetic patient presenting with headache and fatigue."
  );
  const [relevantHistory, setRelevantHistory] = useState("Diagnosed hypertension and Type 2 Diabetes. On Amlodipine 5mg OD.");
  const [specialPrecautions, setSpecialPrecautions] = useState("");
  const [notesToLab, setNotesToLab] = useState(
    "Patient anxious about needles — please reassure. Abdominal ultrasound requires 8-hour fasting prior to arrival."
  );
  const [pregnancy, setPregnancy] = useState(false);
  const [isolation, setIsolation] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>(["HbA1c", "Lipid Profile", "Urinalysis", "ECG", "CBC", "Chest X-Ray"]);

  const toggleSelected = (id: number) => setInvestigations((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  const setPriority = (id: number, priority: Priority) => setInvestigations((prev) => prev.map((r) => (r.id === id ? { ...r, priority } : r)));
  const setIndication = (id: number, indication: string) => setInvestigations((prev) => prev.map((r) => (r.id === id ? { ...r, indication } : r)));
  const removeRow = (id: number) => setInvestigations((prev) => prev.filter((r) => r.id !== id));
  const duplicateRow = (id: number) =>
    setInvestigations((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row) return prev;
      const idx = prev.indexOf(row);
      const copy = { ...row, id: Date.now() };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  const addInvestigation = () =>
    setInvestigations((prev) => [
      ...prev,
      { id: Date.now(), name: "New Investigation", department: "—", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "—", indication: "", status: "Pending", selected: true },
    ]);
  const clearAll = () => setInvestigations([]);

  const addSuggestion = (s: (typeof AI_SUGGESTIONS)[number]) => {
    if (addedSuggestions.includes(s.name)) return;
    setAddedSuggestions((prev) => [...prev, s.name]);
    setInvestigations((prev) => [
      ...prev,
      { id: Date.now(), name: s.name, department: s.department, category: s.category, priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "", status: "Pending", selected: true },
    ]);
  };

  const visibleRows = investigations.filter((r) => {
    const matchesCategory = activeCategory === "All" || (activeCategory === "Laboratory" ? LAB_CATEGORY_MATCH(r.category) : r.category === activeCategory);
    const matchesSearch = !search.trim() || r.name.toLowerCase().includes(search.trim().toLowerCase()) || r.department.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedRows = investigations.filter((r) => r.selected);
  const labCount = selectedRows.filter((r) => LAB_CATEGORY_MATCH(r.category)).length;
  const radCount = selectedRows.filter((r) => !LAB_CATEGORY_MATCH(r.category)).length;

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-4">
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Patient &amp; Clinical</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Investigation Orders</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 font-display">Investigation Orders</h1>
              <p className="text-sm text-gray-400 mt-0.5">Order laboratory, imaging and diagnostic investigations for this encounter.</p>
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={patient.photo || PATIENT_PHOTO} alt={patient.name} className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 font-display">{patient.name}</h2>
              <span className="text-base leading-none text-rose-400" aria-label={patient.gender}>
                {patient.gender === "Female" ? "♀" : "♂"}
              </span>
              <Chip tone="teal">OPD</Chip>
              <Chip tone="slate">{patient.visitType}</Chip>
              <Chip tone="emerald">CBHI Active</Chip>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-3 mt-3.5">
              <HeaderFact label="MRN" value={patient.mrn} />
              <HeaderFact label="Age / DOB" value={`${patient.age} Y · ${patient.dob}`} />
              <HeaderFact label="Phone" value={patient.phone} />
              <HeaderFact label="Visit Type" value={patient.visitType} />
              <HeaderFact label="Department" value={patient.department} />
              <HeaderFact label="Doctor" value={patient.doctor} />
              <HeaderFact label="Blood Group" value={patient.bloodGroup} />
              <HeaderFact label="Allergies" value={patient.allergies} valueClass="text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="Investigation Search" icon={Search}>
              <div className="flex items-center gap-2.5 border-2 border-gray-200 rounded-xl px-4 py-3 bg-[#FBFCFD]">
                <Search size={18} strokeWidth={2} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search investigation by name, category or code…"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-gray-400"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100 mt-1">
                {CATEGORY_FILTERS.map((cat) => {
                  const active = cat === activeCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-bold rounded-full px-3 py-1.5 mt-3 transition-colors ${
                        active ? "bg-emerald-600 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card
              title="Selected Investigations"
              icon={FlaskConical}
              iconTone="text-violet-500"
              action={<Badge tone="emerald">{selectedRows.length} selected</Badge>}
            >
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[1180px] text-sm">
                  <thead>
                    <tr className="text-left text-[10.5px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="px-1 py-2 w-8"></th>
                      <th className="px-2 py-2">Investigation</th>
                      <th className="px-2 py-2">Department</th>
                      <th className="px-2 py-2">Priority</th>
                      <th className="px-2 py-2">Preparation</th>
                      <th className="px-2 py-2">Turnaround</th>
                      <th className="px-2 py-2">Clinical Indication</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const prep = prepLabel(row.prep);
                      return (
                        <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-[#FBFCFD] transition-colors">
                          <td className="px-1 py-3">
                            <button
                              type="button"
                              onClick={() => toggleSelected(row.id)}
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                                row.selected ? "bg-emerald-600" : "border border-gray-300 bg-white"
                              }`}
                            >
                              {row.selected && <Check size={11} strokeWidth={3} className="text-white" />}
                            </button>
                          </td>
                          <td className="px-2 py-3 font-bold text-slate-800 whitespace-nowrap">{row.name}</td>
                          <td className="px-2 py-3 text-gray-500 whitespace-nowrap">{row.department}</td>
                          <td className="px-2 py-3">
                            <div className="relative inline-block">
                              <select
                                value={row.priority}
                                onChange={(e) => setPriority(row.id, e.target.value as Priority)}
                                className={`appearance-none text-[11.5px] font-bold rounded-md pl-2.5 pr-6 py-1 cursor-pointer ${PRIORITY_CLASS[row.priority]}`}
                              >
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                                <option value="STAT">STAT</option>
                              </select>
                              <ChevronDown size={11} strokeWidth={2.5} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${prep.cls}`}>
                              {row.prep === "fasting" && <Clock size={11} strokeWidth={2.25} />}
                              {row.prep === "consent" && <ShieldCheck size={11} strokeWidth={2.25} />}
                              {row.prep === "none" && "— "}
                              {prep.text}
                            </span>
                          </td>
                          <td className="px-2 py-3 font-semibold text-slate-700 whitespace-nowrap tabular-nums">{row.turnaround}</td>
                          <td className="px-2 py-3 min-w-[200px]">
                            <input
                              value={row.indication}
                              onChange={(e) => setIndication(row.id, e.target.value)}
                              className="w-full text-xs text-gray-500 bg-transparent border border-transparent focus:border-gray-200 rounded px-1.5 py-1 outline-none"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Badge tone={row.status === "Ordered" ? "emerald" : "amber"}>{row.status}</Badge>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center justify-end gap-0.5">
                              <button type="button" className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                                <Pencil size={13} strokeWidth={2} />
                              </button>
                              <button type="button" onClick={() => duplicateRow(row.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                                <Copy size={13} strokeWidth={2} />
                              </button>
                              <button type="button" onClick={() => removeRow(row.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-5">
                  <button type="button" onClick={addInvestigation} className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                    <Plus size={14} strokeWidth={2.5} />
                    Add Investigation
                  </button>
                  <button type="button" onClick={clearAll} className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600">
                    <Trash2 size={14} strokeWidth={2.25} />
                    Clear All
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Clinical Information" icon={HeartPulse} iconTone="text-rose-500">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary Diagnosis (ICD-10)">
                  <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2">
                    <Chip tone="blue">{patient.diagnosis}</Chip>
                    <Search size={14} strokeWidth={2.25} className="text-gray-400 shrink-0" />
                  </div>
                </Field>
                <Field label="Working Diagnosis">
                  <input value={workingDiagnosis} onChange={(e) => setWorkingDiagnosis(e.target.value)} className={inputBase} />
                </Field>
              </div>

              <Field label="Clinical Indication / Reason for Investigation">
                <textarea value={clinicalIndication} onChange={(e) => setClinicalIndication(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Relevant History">
                  <textarea value={relevantHistory} onChange={(e) => setRelevantHistory(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <Field label="Current Medications">
                  <div className="border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px] flex items-center">
                    <Chip tone="blue">{patient.medications}</Chip>
                  </div>
                </Field>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <KeyValueRow label="Blood Group" value={patient.bloodGroup} />
              <KeyValueRow label="Allergies" value={patient.allergies} valueClass="text-red-500 font-bold" />
              <KeyValueRow label="Weight" value={`${patient.weight} kg`} />
              <KeyValueRow label="Height" value={`${patient.height} cm`} />
              <KeyValueRow label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600 font-semibold" />
            </Card>

            <Card title="Patient Timeline" icon={History} iconTone="text-emerald-600">
              <div className="-mt-1">
                <TimelineItem title="Registration" detail={`${patient.checkInTime}`} state="done" />
                <TimelineItem title="Vitals" detail="Nurse Hana" state="done" />
                <TimelineItem title="Consultation" detail="Completed" state="done" />
                <TimelineItem title="Investigation Orders" detail="Active" state="active" badge="In Progress" />
              </div>
            </Card>

            <Card title="Suggested Investigations" icon={Sparkles} iconTone="text-violet-500" action={<Badge tone="slate">AI</Badge>}>
              <div className="flex flex-col">
                {Array.from(new Set(AI_SUGGESTIONS.map((s) => s.group))).map((group) => (
                  <div key={group}>
                    <div className="text-[11px] font-bold text-gray-500 mt-3 first:mt-0 mb-1">{group}</div>
                    {AI_SUGGESTIONS.filter((s) => s.group === group).map((s) => {
                      const added = addedSuggestions.includes(s.name);
                      return (
                        <div key={s.name} className="flex items-center justify-between py-1.5">
                          <span className="text-[12.5px] font-semibold text-slate-700">{s.name}</span>
                          {added ? (
                            <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600">
                              <Check size={11} strokeWidth={2.5} /> Added
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addSuggestion(s)}
                              className="w-6 h-6 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center hover:bg-emerald-50 transition-colors"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
              Preview Orders
            </FooterButton>
            <FooterPrimaryButton onClick={onSubmit}>
              Submit Investigation Orders
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}

/* ============================================================================
   Stage 2 — Investigation Orders Success Screen
   ========================================================================== */

function OrderSuccessScreen({
  patient,
  onBack,
}: {
  patient: OrderPatient;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">Orders Sent to LIS / RIS</h2>
          <p className="text-sm text-gray-500 px-4">
            Investigation order requests for <strong>{patient.name}</strong> have been successfully dispatched.
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
            <span className="text-gray-400 font-medium">Dispatched queues</span>
            <span className="text-emerald-700 font-bold">Lab LIS & Radiology RIS</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-display"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Orders Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function InvestigationOrdersForm() {
  const [selectedPatient, setSelectedPatient] = useState<OrderPatient | null>(null);
  const [queue, setQueue] = useState<OrderPatient[]>(MOCK_ORDER_QUEUE);
  const [ordersCount, setOrdersCount] = useState(24);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPatient = (patient: OrderPatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleComplete = () => {
    if (selectedPatient) {
      setQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setOrdersCount((prev) => prev + 1);
      setIsSuccess(true);
    }
  };

  if (isSuccess && selectedPatient) {
    return (
      <OrderSuccessScreen
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
      <OrderQueueStage
        patients={queue}
        onSelect={handleSelectPatient}
        ordersCount={ordersCount}
      />
    );
  }

  return (
    <OrderIntake
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={handleComplete}
    />
  );
}
