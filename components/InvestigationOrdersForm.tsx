"use client";

import { useState } from "react";
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
   Investigation Orders (Lab & Radiology) — redesigned per the approved
   enterprise EMR mockup. FRD 23.1 (Test Order Management) + 24.1 (Imaging
   Order Management). Reached from Consultation's "Plan & Orders" tab.
   ========================================================================== */

/* ---------- investigation data ---------- */

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

const INITIAL_INVESTIGATIONS: Investigation[] = [
  { id: 1, name: "CBC", department: "Hematology", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "2 Hours", indication: "Assess for infection / anemia", status: "Ordered", selected: true },
  { id: 2, name: "Lipid Profile", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "fasting", turnaround: "6 Hours", indication: "Diabetes follow-up lipid screening", status: "Ordered", selected: true },
  { id: 3, name: "Liver Function Test", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "fasting", turnaround: "6 Hours", indication: "Baseline before statin therapy", status: "Pending", selected: false },
  { id: 4, name: "Kidney Function Test", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "Monitor renal function, hypertensive", status: "Ordered", selected: true },
  { id: 5, name: "Urinalysis", department: "Pathology", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "2 Hours", indication: "Screen for proteinuria", status: "Ordered", selected: true },
  { id: 6, name: "Blood Culture", department: "Microbiology", category: "Laboratory", priority: "STAT", prep: "consent", turnaround: "3 Days", indication: "Rule out bacteremia if febrile", status: "Pending", selected: false },
  { id: 7, name: "Chest X-Ray (PA)", department: "Radiology", category: "Radiology", priority: "Urgent", prep: "none", turnaround: "2 Hours", indication: "Evaluate pulmonary cause of weakness", status: "Ordered", selected: true },
  { id: 8, name: "CT Brain", department: "CT", category: "CT", priority: "STAT", prep: "consent", turnaround: "6 Hours", indication: "Rule out intracranial pathology", status: "Pending", selected: false },
  { id: 9, name: "MRI Spine", department: "MRI", category: "MRI", priority: "Routine", prep: "consent", turnaround: "24 Hours", indication: "Chronic lower back pain workup", status: "Pending", selected: false },
  { id: 10, name: "Ultrasound Abdomen", department: "Ultrasound", category: "Ultrasound", priority: "Routine", prep: "fasting", turnaround: "24 Hours", indication: "RUQ discomfort, rule out gallstones", status: "Pending", selected: false },
  { id: 11, name: "ECG", department: "Cardiology", category: "Cardiology", priority: "Urgent", prep: "none", turnaround: "2 Hours", indication: "Baseline cardiac assessment, HTN", status: "Ordered", selected: true },
  { id: 12, name: "2D Echo", department: "Cardiology", category: "Cardiology", priority: "Routine", prep: "none", turnaround: "24 Hours", indication: "Assess cardiac function, hypertensive", status: "Pending", selected: false },
  { id: 13, name: "COVID PCR", department: "Microbiology", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "24 Hours", indication: "Pre-procedure screening", status: "Pending", selected: false },
  { id: 14, name: "Blood Glucose (RBS)", department: "Biochemistry", category: "Laboratory", priority: "STAT", prep: "none", turnaround: "2 Hours", indication: "Diabetic monitoring", status: "Ordered", selected: true },
  { id: 15, name: "HbA1c", department: "Biochemistry", category: "Laboratory", priority: "Routine", prep: "none", turnaround: "6 Hours", indication: "3-month glycemic control assessment", status: "Ordered", selected: true },
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
  { name: "Fever Workup", meta: "CBC, Blood Culture, Malaria · 4 tests", icon: FlaskConical, applied: false },
  { name: "Trauma Panel", meta: "CBC, Group & Crossmatch, CT Head · 5 tests", icon: AlertTriangle, applied: false },
  { name: "Pregnancy Panel", meta: "Beta-hCG, Ultrasound, CBC · 4 tests", icon: Users, applied: false },
  { name: "Renal Panel", meta: "KFT, Electrolytes, Urinalysis · 3 tests", icon: Droplet, applied: false },
  { name: "Liver Panel", meta: "LFT, Hepatitis Screen · 3 tests", icon: FlaskConical, applied: false },
  { name: "Cardiac Panel", meta: "ECG, 2D Echo, Troponin · 4 tests", icon: HeartPulse, applied: false },
];

const AI_SUGGESTIONS: { group: string; name: string; department: string; category: Investigation["category"] }[] = [
  { group: "Diabetes", name: "HbA1c", department: "Biochemistry", category: "Laboratory" },
  { group: "Diabetes", name: "Lipid Profile", department: "Biochemistry", category: "Laboratory" },
  { group: "Diabetes", name: "Urinalysis", department: "Pathology", category: "Laboratory" },
  { group: "Hypertension", name: "ECG", department: "Cardiology", category: "Cardiology" },
  { group: "Hypertension", name: "Renal Function", department: "Biochemistry", category: "Laboratory" },
  { group: "Hypertension", name: "Electrolytes", department: "Biochemistry", category: "Laboratory" },
  { group: "Respiratory Infection", name: "CBC", department: "Hematology", category: "Laboratory" },
  { group: "Respiratory Infection", name: "Chest X-Ray", department: "Radiology", category: "Radiology" },
  { group: "Respiratory Infection", name: "CRP", department: "Biochemistry", category: "Laboratory" },
];

const LAB_CATEGORY_MATCH = (c: Investigation["category"]) => c === "Laboratory";

function prepLabel(prep: Prep) {
  if (prep === "fasting") return { text: "Fasting (8h)", cls: "text-amber-600" };
  if (prep === "consent") return { text: "Consent required", cls: "text-blue-600" };
  return { text: "Non-fasting", cls: "text-gray-400" };
}

export default function InvestigationOrdersForm() {
  const [investigations, setInvestigations] = useState(INITIAL_INVESTIGATIONS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [workingDiagnosis, setWorkingDiagnosis] = useState("Hypertension with tension-type headache; rule out early diabetic nephropathy");
  const [clinicalIndication, setClinicalIndication] = useState(
    "Routine follow-up bloodwork and cardiac / renal screening for a known hypertensive, diabetic patient presenting with headache and fatigue."
  );
  const [relevantHistory, setRelevantHistory] = useState("Diagnosed hypertension (2019) and Type 2 Diabetes (2021). On Amlodipine 5mg OD.");
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
        {/* Breadcrumb + title + right actions */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Patient &amp; Clinical</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <Link href="/modules/opd-management/consultation" className="hover:text-teal-700 hover:underline">
                Consultation
              </Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Investigation Orders</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Investigation Orders</h1>
              <p className="text-sm text-gray-400 mt-0.5">Order laboratory, imaging and diagnostic investigations for this encounter.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5">Unsaved changes</span>
              <span>· Last saved 3 min ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/modules/opd-management/consultation"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Consultation
            </Link>
            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        {/* Patient header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PATIENT_PHOTO} alt="Selamawit Abebe" className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">Selamawit Abebe</h2>
              <span className="text-base leading-none text-rose-400" aria-label="Female">
                &#9792;
              </span>
              <Chip tone="teal">OPD</Chip>
              <Chip tone="slate">Follow-up</Chip>
              <Chip tone="emerald">Insurance Active</Chip>
              <Chip tone="blue">Diabetic</Chip>
              <Chip tone="amber">Hypertension</Chip>
              <Chip tone="amber">
                <AlertTriangle size={11} strokeWidth={2.5} /> Fall Risk: Moderate
              </Chip>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-3 mt-3.5">
              <HeaderFact label="MRN" value="FSH-2025-00012345" />
              <HeaderFact label="Age / DOB" value="33 Y · Apr 12, 1992" />
              <HeaderFact label="Visit No." value="OPD-2025-000567" />
              <HeaderFact label="Visit Type" value="Follow-up Visit" />
              <HeaderFact label="Department" value="General Medicine" />
              <HeaderFact label="Doctor" value="Dr. Eyob Tesfaye" />
              <HeaderFact label="Visit Time" value="May 17, 2025 · 09:30 AM" />
              <HeaderFact label="Blood Group" value="O+" />
              <HeaderFact label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600" />
              <HeaderFact label="Allergies" value="Penicillin" valueClass="text-red-500" />
              <HeaderFact label="Phone" value="0911 234 567" />
              <HeaderFact label="Current Diagnosis" value="Hypertension, T2DM" />
            </div>
          </div>
        </div>

        {/* Main grid: left content + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            {/* Investigation Search */}
            <Card title="Investigation Search" icon={Search}>
              <div className="flex items-center gap-2.5 border-2 border-gray-200 rounded-xl px-4 py-3 bg-[#FBFCFD]">
                <Search size={18} strokeWidth={2} className="text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search investigation by name, category or code…"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-gray-400"
                />
                <kbd className="text-[10.5px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">/</kbd>
              </div>

              <div className="flex flex-wrap gap-2">
                {["CBC", "Chest X-Ray", "HbA1c", "ECG", "Lipid Profile"].map((name) => (
                  <span key={name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <Plus size={12} strokeWidth={2.5} className="text-emerald-600" />
                    {name}
                  </span>
                ))}
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

            {/* Selected Investigations table */}
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
                    {visibleRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-2 py-10 text-center text-sm text-gray-400">
                          No investigations match this filter.
                        </td>
                      </tr>
                    )}
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
                  <button type="button" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">
                    <Star size={14} strokeWidth={2.25} />
                    Import Favorite Order Sets
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  <b className="text-slate-800">{investigations.length}</b> total · <b className="text-slate-800">{selectedRows.length}</b> selected · est. <b className="text-slate-800">ETB 3,850</b>
                </span>
              </div>
            </Card>

            {/* Clinical Information */}
            <Card title="Clinical Information" icon={HeartPulse} iconTone="text-rose-500">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary Diagnosis (ICD-10)">
                  <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2">
                    <Chip tone="blue">I10 – Essential (primary) hypertension</Chip>
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
                    <Chip tone="blue">Amlodipine 5mg OD</Chip>
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Known Allergies">
                  <div className="border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px] flex items-center">
                    <Chip tone="red">Penicillin</Chip>
                  </div>
                </Field>
                <Field label="Special Precautions">
                  <input
                    value={specialPrecautions}
                    onChange={(e) => setSpecialPrecautions(e.target.value)}
                    placeholder="e.g., contrast allergy, bleeding risk, mobility limitation…"
                    className={inputBase}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-7">
                <button type="button" onClick={() => setPregnancy((v) => !v)} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex items-center justify-center ${pregnancy ? "bg-emerald-600" : "border border-gray-300 bg-white"}`}>
                    {pregnancy && <Check size={11} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">Pregnancy</span>
                </button>
                <button type="button" onClick={() => setIsolation((v) => !v)} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex items-center justify-center ${isolation ? "bg-emerald-600" : "border border-gray-300 bg-white"}`}>
                    {isolation && <Check size={11} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">Isolation Precautions</span>
                </button>
              </div>

              <Field label="Notes to Laboratory / Radiology">
                <div className="relative">
                  <textarea value={notesToLab} onChange={(e) => setNotesToLab(e.target.value)} rows={2} className={`${inputBase} resize-none pb-7`} />
                  <button type="button" className="absolute right-2.5 bottom-2 text-gray-400 hover:text-teal-600 transition-colors">
                    <Mic size={15} strokeWidth={2} />
                  </button>
                </div>
              </Field>
            </Card>

            {/* Order Set Templates */}
            <Card title="Order Set Templates" icon={ClipboardList} subtitle="Select a template to auto-fill related investigations above.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ORDER_TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.name} className="relative border border-gray-200 rounded-xl p-3.5 bg-[#FBFCFD] flex flex-col gap-2">
                      {t.applied && (
                        <span className="absolute top-2.5 right-2.5">
                          <Badge tone="emerald">Applied</Badge>
                        </span>
                      )}
                      <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Icon size={16} strokeWidth={2.25} />
                      </span>
                      <span className="text-[13px] font-bold text-slate-800">{t.name}</span>
                      <span className="text-[11px] text-gray-400">{t.meta}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Attachments */}
            <Card title="Attachments" icon={UploadCloud}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-7 px-4 flex flex-col items-center gap-2 text-center bg-[#FBFCFD]">
                <UploadCloud size={24} strokeWidth={1.75} className="text-gray-300" />
                <p className="text-sm font-medium text-slate-700">
                  Drag &amp; drop files here, or <span className="text-teal-700">browse</span>
                </p>
                <p className="text-[11px] text-gray-400">Supports JPG, PNG, PDF, DICOM · Max 10MB per file</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Previous Reports", file: "Lipid_Panel_Apr2025.pdf" },
                  { label: "External Reports", file: null },
                  { label: "Referral Letter", file: null },
                  { label: "Clinical Images", file: null },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                      <FileText size={15} strokeWidth={2} className="text-gray-400" />
                      {row.label}
                    </div>
                    {row.file ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                        <FileText size={11} strokeWidth={2} />
                        {row.file}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">None attached</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <KeyValueRow label="Blood Group" value="O+" />
              <KeyValueRow label="Allergies" value="Penicillin" valueClass="text-red-500" />
              <KeyValueRow label="Weight" value="68 kg" />
              <KeyValueRow label="Height" value="162 cm" />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-400">BMI</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums flex items-center gap-1.5">
                  25.9 <Badge tone="amber">Overweight</Badge>
                </span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <KeyValueRow label="Current Meds" value="Amlodipine 5mg OD" />
              <KeyValueRow label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600" />
              <KeyValueRow label="Visit Type" value="Follow-up" />
              <KeyValueRow label="Emergency Contact" value="Abebe T. · 0911987654" />
            </Card>

            <Card title="Patient Timeline" icon={History} iconTone="text-emerald-600">
              <div className="-mt-1">
                <TimelineItem title="Registration" detail="09:28 AM · Meron G." state="done" />
                <TimelineItem title="Vitals" detail="09:30 AM · Nurse Hana" state="done" />
                <TimelineItem title="Consultation" detail="09:31 AM · Dr. Eyob Tesfaye" state="done" />
                <TimelineItem title="Clinical Notes" detail="Completed" state="done" />
                <TimelineItem title="Investigation Orders" detail="09:40 AM" state="active" badge="In Progress" />
                <TimelineItem title="Prescription" detail="Pending" state="pending" />
                <TimelineItem title="Billing" detail="Pending" state="pending" />
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

            <Card title="Order Summary" icon={FileText}>
              <KeyValueRow label="Total Investigations" value={`${selectedRows.length} selected`} />
              <KeyValueRow label="Laboratory" value={String(labCount)} />
              <KeyValueRow label="Radiology / Cardiology" value={String(radCount)} />
              <div className="h-px bg-gray-100 my-1" />
              <KeyValueRow label="Estimated Total Cost" value="ETB 3,850" />
              <KeyValueRow label="Insurance Coverage (CBHI)" value="80%" valueClass="text-emerald-600" />
              <KeyValueRow label="Patient Payable" value="ETB 770" />
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-400">Est. Completion</span>
                <span className="text-[11.5px] font-bold text-slate-800">STAT ≤2h · Routine ≤24h</span>
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <QuickActionButton icon={Printer} label="Print Request" tone={{ bg: "bg-gray-100", text: "text-gray-600", hover: "hover:bg-gray-200" }} />
              <QuickActionButton icon={Save} label="Save Draft" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
              <QuickActionButton icon={Send} label="Send to Laboratory" tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }} />
              <QuickActionButton icon={Send} label="Send to Radiology" tone={{ bg: "bg-cyan-50", text: "text-cyan-700", hover: "hover:bg-cyan-100" }} />
              <QuickActionButton icon={History} label="View Investigation History" tone={{ bg: "bg-gray-100", text: "text-gray-600", hover: "hover:bg-gray-200" }} />
              <QuickActionButton icon={Star} label="Favorite This Order Set" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
              <QuickActionButton icon={Ban} label="Cancel Order" tone={{ bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" }} />
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={
          <>
            <FooterButton tone="danger">Cancel</FooterButton>
            <FooterButton tone="info">Save Draft</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="neutral">
              <Printer size={15} strokeWidth={2.25} />
              Preview Orders
            </FooterButton>
            <FooterPrimaryButton>
              Submit Investigation Orders
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}
