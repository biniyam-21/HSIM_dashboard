"use client";

// Laboratory / LIS module component for managing lab test orders and specimen workflow.

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreVertical,
  Users,
  ClipboardList,
  Hourglass,
  Droplet,
  FlaskConical,
  CircleCheckBig,
  Siren,
  RefreshCw,
  Printer,
  Download,
  ListChecks,
  Barcode,
  TestTube,
  History,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Ban,
  FileText,
  Cpu,
  Gauge,
  Check,
  Paperclip,
  Filter,
  FilterX,
  X,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Test Orders worklist.
   Where laboratory personnel receive, prioritize, and process investigation
   orders placed by OPD/IPD/Emergency/ICU/Surgery/Specialist Clinics/External
   Referral (doctors create these under OPD Management > Investigation Orders;
   this page is where the lab actions them).
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";

type OrderStatus =
  | "Requested"
  | "Waiting Collection"
  | "Collected"
  | "Received"
  | "Processing"
  | "Quality Check"
  | "Validated"
  | "Completed"
  | "Cancelled"
  | "Rejected";

type SpecimenType = "Blood" | "Urine" | "Stool" | "Sputum" | "Swab" | "CSF" | "Biopsy" | "Serum" | "Plasma" | "Other";

type Origin = "OPD" | "IPD" | "Emergency" | "ICU" | "Surgery" | "Specialist Clinic" | "External Referral";

type LabOrder = {
  id: string;
  specimenId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female";
  department: string;
  origin: Origin;
  doctor: string;
  tests: string[];
  specimen: SpecimenType;
  priority: Priority;
  status: OrderStatus;
  technician: string | null;
  requestedAt: string;
  requestedAtISO: string;
  collectionTime: string | null;
  turnaroundTarget: string;
  location: string;
  insurance: string;
  diagnosis: string;
  clinicalNotes: string;
  specialInstructions: string;
  allergies: string[];
  previousLabHistory: string;
  attachments: string[];
  rejectionReason?: string;
  duplicateOf?: string;
};

/* ---------- mock data ---------- */

const LAB_ORDERS: LabOrder[] = [
  {
    id: "LAB-2026-000451", specimenId: "SPC-2026-08811",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female",
    department: "General Medicine", origin: "OPD", doctor: "Dr. Eyob Tesfaye",
    tests: ["CBC", "Lipid Profile", "Blood Glucose", "HbA1c"],
    specimen: "Blood", priority: "Routine", status: "Waiting Collection", technician: null,
    requestedAt: "05/21/2026 · 09:40 AM", requestedAtISO: "2026-05-21", collectionTime: null,
    turnaroundTarget: "≤ 6 Hours", location: "OPD Phlebotomy Room 2", insurance: "Woreda 07 CBHI",
    diagnosis: "Hypertension, T2DM follow-up", clinicalNotes: "Routine diabetic/hypertensive follow-up bloodwork.",
    specialInstructions: "Patient anxious about needles — please reassure.",
    allergies: ["Penicillin"], previousLabHistory: "HbA1c 7.2% (Feb 2026) · Lipid panel borderline high LDL (Feb 2026)",
    attachments: ["Lipid_Panel_Feb2026.pdf"],
  },
  {
    id: "LAB-2026-000452", specimenId: "SPC-2026-08812",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male",
    department: "Emergency", origin: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: ["Troponin", "CBC", "Electrolytes"],
    specimen: "Blood", priority: "STAT", status: "Requested", technician: null,
    requestedAt: "05/21/2026 · 10:12 AM", requestedAtISO: "2026-05-21", collectionTime: null,
    turnaroundTarget: "≤ 1 Hour", location: "ER Bay 3", insurance: "Self-Pay",
    diagnosis: "Acute chest pain, rule out ACS", clinicalNotes: "Central crushing chest pain radiating to left arm, onset 45 min ago.",
    specialInstructions: "STAT — page cardiology on result.", allergies: ["NKDA"],
    previousLabHistory: "No prior cardiac workup on file.", attachments: [],
  },
  {
    id: "LAB-2026-000448", specimenId: "SPC-2026-08790",
    patientName: "Marta Alemu", mrn: "MRN-2026-000789", age: 27, gender: "Female",
    department: "Pediatrics", origin: "OPD", doctor: "Dr. Dawit Bekele",
    tests: ["Urinalysis", "Beta-hCG"],
    specimen: "Urine", priority: "Urgent", status: "Collected", technician: "Selam Getachew",
    requestedAt: "05/21/2026 · 08:05 AM", requestedAtISO: "2026-05-21", collectionTime: "08:40 AM",
    turnaroundTarget: "≤ 2 Hours", location: "OPD Lab Counter 1", insurance: "Private Insurance — Nyala",
    diagnosis: "Suspected UTI, rule out pregnancy", clinicalNotes: "Dysuria x3 days, low-grade fever.",
    specialInstructions: "", allergies: [], previousLabHistory: "No previous UTI episodes on record.",
    attachments: [],
  },
  {
    id: "LAB-2026-000447", specimenId: "SPC-2026-08774",
    patientName: "Alemu Getahun", mrn: "MRN-2026-000234", age: 51, gender: "Male",
    department: "Cardiology", origin: "IPD", doctor: "Dr. Eyob Tesfaye",
    tests: ["Lipid Profile", "KFT", "Electrolytes", "BNP"],
    specimen: "Serum", priority: "Routine", status: "Received", technician: "Dawit Mekonnen",
    requestedAt: "05/20/2026 · 07:15 PM", requestedAtISO: "2026-05-20", collectionTime: "07:50 PM",
    turnaroundTarget: "≤ 6 Hours", location: "IPD Ward B, Bed 12", insurance: "Woreda 07 CBHI",
    diagnosis: "Congestive heart failure monitoring", clinicalNotes: "Post-admission cardiac panel, daily electrolytes.",
    specialInstructions: "Fluid-restricted patient — confirm draw volume.", allergies: ["Sulfa drugs"],
    previousLabHistory: "BNP elevated on admission (May 18).", attachments: ["Admission_ECG.pdf"],
  },
  {
    id: "LAB-2026-000444", specimenId: "SPC-2026-08702",
    patientName: "Hana Yohannes", mrn: "MRN-2026-000321", age: 45, gender: "Female",
    department: "General Medicine", origin: "OPD", doctor: "Dr. Hana Alemayehu",
    tests: ["HbA1c", "Lipid Profile", "Urinalysis"],
    specimen: "Blood", priority: "Routine", status: "Processing", technician: "Selam Getachew",
    requestedAt: "05/20/2026 · 10:30 AM", requestedAtISO: "2026-05-20", collectionTime: "10:55 AM",
    turnaroundTarget: "≤ 6 Hours", location: "OPD Lab Counter 1", insurance: "Woreda 07 CBHI",
    diagnosis: "Type 2 Diabetes annual review", clinicalNotes: "Annual metabolic screening panel.",
    specialInstructions: "", allergies: [], previousLabHistory: "HbA1c 6.8% (Nov 2025).", attachments: [],
  },
  {
    id: "LAB-2026-000441", specimenId: "SPC-2026-08650",
    patientName: "Tesfaye Abera", mrn: "MRN-2026-000654", age: 62, gender: "Male",
    department: "Orthopedics", origin: "Surgery", doctor: "Dr. Dawit Bekele",
    tests: ["CBC", "Coagulation Profile", "Group & Crossmatch"],
    specimen: "Blood", priority: "Urgent", status: "Quality Check", technician: "Dawit Mekonnen",
    requestedAt: "05/20/2026 · 06:00 AM", requestedAtISO: "2026-05-20", collectionTime: "06:20 AM",
    turnaroundTarget: "≤ 3 Hours", location: "OT Pre-Op Holding", insurance: "Private Insurance — Nyala",
    diagnosis: "Pre-operative workup, total hip replacement", clinicalNotes: "Cleared for surgery pending final CBC & crossmatch.",
    specialInstructions: "2 units packed red cells on standby.", allergies: ["NKDA"],
    previousLabHistory: "Hb 12.1 g/dL (pre-admission).", attachments: ["Consent_Form.pdf", "Anesthesia_Clearance.pdf"],
  },
  {
    id: "LAB-2026-000439", specimenId: "SPC-2026-08611",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female",
    department: "General Medicine", origin: "OPD", doctor: "Dr. Eyob Tesfaye",
    tests: ["CBC", "Peripheral Smear"],
    specimen: "Blood", priority: "Routine", status: "Validated", technician: "Selam Getachew",
    requestedAt: "05/19/2026 · 11:20 AM", requestedAtISO: "2026-05-19", collectionTime: "11:45 AM",
    turnaroundTarget: "≤ 2 Hours", location: "OPD Lab Counter 1", insurance: "Self-Pay",
    diagnosis: "Fatigue, rule out anemia", clinicalNotes: "Progressive fatigue x2 weeks, pallor noted on exam.",
    specialInstructions: "", allergies: [], previousLabHistory: "No prior CBC on file.", attachments: [],
  },
  {
    id: "LAB-2026-000432", specimenId: "SPC-2026-08540",
    patientName: "Kebede Worku", mrn: "MRN-2026-000512", age: 55, gender: "Male",
    department: "Cardiology", origin: "ICU", doctor: "Dr. Hana Alemayehu",
    tests: ["ABG", "Lactate", "Electrolytes"],
    specimen: "Plasma", priority: "STAT", status: "Completed", technician: "Dawit Mekonnen",
    requestedAt: "05/18/2026 · 02:05 AM", requestedAtISO: "2026-05-18", collectionTime: "02:10 AM",
    turnaroundTarget: "≤ 1 Hour", location: "ICU Bed 4", insurance: "Woreda 07 CBHI",
    diagnosis: "Septic shock, ventilated", clinicalNotes: "4-hourly ABG per ICU protocol.",
    specialInstructions: "Critical values called to ICU registrar on release.", allergies: ["NKDA"],
    previousLabHistory: "Lactate trending down since admission.", attachments: [],
  },
  {
    id: "LAB-2026-000427", specimenId: "SPC-2026-08488",
    patientName: "Mulu Fikre", mrn: "MRN-2026-000198", age: 41, gender: "Female",
    department: "General Medicine", origin: "Specialist Clinic", doctor: "Dr. Dawit Bekele",
    tests: ["Thyroid Panel (TSH, T3, T4)"],
    specimen: "Serum", priority: "Routine", status: "Cancelled", technician: null,
    requestedAt: "05/17/2026 · 03:30 PM", requestedAtISO: "2026-05-17", collectionTime: null,
    turnaroundTarget: "≤ 24 Hours", location: "Endocrine Clinic", insurance: "Private Insurance — Nyala",
    diagnosis: "Suspected hypothyroidism", clinicalNotes: "Patient rescheduled to next visit — order cancelled by ordering clinic.",
    specialInstructions: "", allergies: [], previousLabHistory: "No prior thyroid panel.", attachments: [],
  },
  {
    id: "LAB-2026-000420", specimenId: "SPC-2026-08402",
    patientName: "Yared Solomon", mrn: "MRN-2026-000342", age: 33, gender: "Male",
    department: "General Medicine", origin: "External Referral", doctor: "Dr. Eyob Tesfaye",
    tests: ["Hepatitis B Screen", "Hepatitis C Screen"],
    specimen: "Serum", priority: "Routine", status: "Rejected", technician: null,
    requestedAt: "05/16/2026 · 09:00 AM", requestedAtISO: "2026-05-16", collectionTime: "09:20 AM",
    turnaroundTarget: "≤ 24 Hours", location: "Referral Intake Desk", insurance: "Self-Pay",
    diagnosis: "Pre-employment screening", clinicalNotes: "Referred from external clinic without accompanying consent form.",
    specialInstructions: "", allergies: [], previousLabHistory: "No previous hepatitis screening.", attachments: [],
    rejectionReason: "Specimen hemolyzed on receipt — recollection required.",
  },
  {
    id: "LAB-2026-000418", specimenId: "SPC-2026-08380",
    patientName: "Almaz Tesfaye", mrn: "MRN-2026-000901", age: 48, gender: "Female",
    department: "Emergency", origin: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: ["CBC", "Blood Culture", "Malaria RDT"],
    specimen: "Blood", priority: "STAT", status: "Waiting Collection", technician: null,
    requestedAt: "05/21/2026 · 11:02 AM", requestedAtISO: "2026-05-21", collectionTime: null,
    turnaroundTarget: "≤ 1 Hour", location: "ER Bay 1", insurance: "Woreda 07 CBHI",
    diagnosis: "High-grade fever, rigors — rule out sepsis / malaria", clinicalNotes: "Temp 39.8°C, rigors, tachycardic.",
    specialInstructions: "Draw blood cultures before any antibiotics.", allergies: ["NKDA"],
    previousLabHistory: "No previous admission on file.", attachments: [],
    duplicateOf: "LAB-2026-000410",
  },
  {
    id: "LAB-2026-000415", specimenId: "SPC-2026-08340",
    patientName: "Dawit Mekonnen Jr.", mrn: "MRN-2026-000733", age: 19, gender: "Male",
    department: "Orthopedics", origin: "OPD", doctor: "Dr. Dawit Bekele",
    tests: ["ESR", "CRP", "Uric Acid"],
    specimen: "Blood", priority: "Routine", status: "Requested", technician: null,
    requestedAt: "05/21/2026 · 08:50 AM", requestedAtISO: "2026-05-21", collectionTime: null,
    turnaroundTarget: "≤ 6 Hours", location: "OPD Phlebotomy Room 2", insurance: "Self-Pay",
    diagnosis: "Joint pain and swelling, right knee", clinicalNotes: "Suspected inflammatory arthropathy vs gout.",
    specialInstructions: "", allergies: [], previousLabHistory: "No prior inflammatory markers on file.", attachments: [],
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["Emergency", "General Medicine", "Cardiology", "Pediatrics", "Orthopedics"];
const TECHNICIANS = ["Selam Getachew", "Dawit Mekonnen"];
const SPECIMEN_TYPES: SpecimenType[] = ["Blood", "Urine", "Stool", "Sputum", "Swab", "CSF", "Biopsy", "Serum", "Plasma", "Other"];
const INSURANCE_OPTIONS = ["Woreda 07 CBHI", "Private Insurance — Nyala", "Self-Pay"];
const LOCATIONS = ["OPD Phlebotomy Room 2", "OPD Lab Counter 1", "ER Bay 1", "ER Bay 3", "IPD Ward B, Bed 12", "ICU Bed 4", "OT Pre-Op Holding", "Endocrine Clinic", "Referral Intake Desk"];

/* ---------- style maps ---------- */

const PRIORITY_STYLES: Record<Priority, string> = {
  Routine: "bg-teal-50 text-teal-700",
  Urgent: "bg-amber-50 text-amber-700",
  STAT: "bg-red-600 text-white",
};

const PRIORITY_BORDER: Record<Priority, string> = {
  Routine: "border-l-4 border-l-transparent",
  Urgent: "border-l-4 border-l-amber-400",
  STAT: "border-l-4 border-l-red-600",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  Requested: "bg-slate-100 text-slate-600",
  "Waiting Collection": "bg-amber-50 text-amber-700",
  Collected: "bg-blue-50 text-blue-700",
  Received: "bg-violet-50 text-violet-700",
  Processing: "bg-blue-50 text-blue-700",
  "Quality Check": "bg-amber-50 text-amber-700",
  Validated: "bg-emerald-50 text-emerald-700",
  Completed: "bg-teal-700 text-white",
  Cancelled: "bg-gray-100 text-gray-400",
  Rejected: "bg-red-50 text-red-600",
};

const COLLECTION_LABEL: Record<OrderStatus, string> = {
  Requested: "Pending",
  "Waiting Collection": "Awaiting Collection",
  Collected: "Collected",
  Received: "Collected",
  Processing: "Collected",
  "Quality Check": "Collected",
  Validated: "Collected",
  Completed: "Collected",
  Cancelled: "—",
  Rejected: "Recollection Needed",
};

const QUICK_FILTERS = ["All", "Routine", "Urgent", "STAT", "Pending", "Collected", "Processing", "Validated", "Completed", "Cancelled", "Rejected"];

function isReadOnly(status: OrderStatus) {
  return status === "Completed" || status === "Cancelled";
}

function matchesQuickFilter(o: LabOrder, q: string): boolean {
  if (q === "All") return true;
  if (q === "Routine" || q === "Urgent" || q === "STAT") return o.priority === q;
  if (q === "Pending") return o.status === "Requested" || o.status === "Waiting Collection";
  if (q === "Collected") return o.status === "Collected" || o.status === "Received";
  if (q === "Processing") return o.status === "Processing" || o.status === "Quality Check";
  return o.status === q;
}

/* ---------- KPI cards ---------- */

type KpiCard = {
  icon: typeof ClipboardList;
  iconBg: string;
  label: string;
  value: string;
  sublabel: string;
  quickFilter: string;
};

function buildKpiCards(orders: LabOrder[]): KpiCard[] {
  const today = orders.length;
  const pending = orders.filter((o) => o.status === "Requested" || o.status === "Waiting Collection").length;
  const collected = orders.filter((o) => o.status === "Collected" || o.status === "Received").length;
  const processing = orders.filter((o) => o.status === "Processing" || o.status === "Quality Check").length;
  const completed = orders.filter((o) => o.status === "Completed").length;
  const stat = orders.filter((o) => o.priority === "STAT").length;

  return [
    { icon: ClipboardList, iconBg: "bg-[#216E6A]", label: "Today's Orders", value: String(today), sublabel: "+3 vs. yesterday", quickFilter: "All" },
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Pending", value: String(pending), sublabel: "Awaiting collection", quickFilter: "Pending" },
    { icon: Droplet, iconBg: "bg-[#627EC1]", label: "Collected", value: String(collected), sublabel: "In transit to lab", quickFilter: "Collected" },
    { icon: FlaskConical, iconBg: "bg-[#5C8E64]", label: "Processing", value: String(processing), sublabel: "On analyzer / QC", quickFilter: "Processing" },
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "Completed", value: String(completed), sublabel: "Results released", quickFilter: "Completed" },
    { icon: Siren, iconBg: "bg-[#DB5567]", label: "Urgent (STAT)", value: String(stat), sublabel: "Requires immediate action", quickFilter: "STAT" },
  ];
}

function KpiRow({ cards, onSelect }: { cards: KpiCard[]; onSelect: (quickFilter: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelect(card.quickFilter)}
            className="flex items-center gap-3 py-4 px-4 bg-white border border-[#F1F5F9] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] min-w-0 box-border text-left hover:shadow-md transition-shadow"
          >
            <span className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ${card.iconBg}`}>
              <Icon size={22} strokeWidth={2} color="#ffffff" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#475569] mb-1 leading-snug whitespace-nowrap">{card.label}</div>
              <div className="font-semibold text-[#0F172A] text-xl mb-0.5 leading-[1.1] whitespace-nowrap">{card.value}</div>
              <div className="text-[11.5px] font-medium text-[#94A3B8] whitespace-nowrap">{card.sublabel}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- filter primitives ---------- */

/** Highlighted outline applied directly to a filter field once it holds a non-default value. */
function activeFieldClass(active: boolean): string {
  return active ? "!border-teal-700 ring-1 ring-teal-700 bg-teal-50/50" : "";
}

function ControlledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const active = value !== options[0];
  return (
    <div className="flex flex-col gap-1 w-40">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-8 appearance-none bg-white ${activeFieldClass(active)}`}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DateRangePicker({
  label,
  clearKey,
  active,
  onFromChange,
  onToChange,
}: {
  label: string;
  clearKey: number;
  active?: boolean;
  onFromChange: (iso: string) => void;
  onToChange: (iso: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-1.5">
        <DatePicker key={`from-${clearKey}`} placeholder="From" className={`w-32 rounded-md ${activeFieldClass(!!active)}`} onChange={(d) => onFromChange(toISO(d))} />
        <span className="text-gray-400 text-xs shrink-0 select-none">—</span>
        <DatePicker key={`to-${clearKey}`} placeholder="To" className={`w-32 rounded-md ${activeFieldClass(!!active)}`} onChange={(d) => onToChange(toISO(d))} />
      </div>
    </div>
  );
}

/* ---------- filters state ---------- */

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Order Number" | "Barcode" | "National ID" | "Doctor" | "Phone" | "Department" | "Specimen ID";

type LabFilters = {
  searchBy: SearchField;
  query: string;
  department: string;
  doctor: string;
  priority: string;
  status: string;
  specimen: string;
  insurance: string;
  location: string;
  technician: string;
  dateFrom: string;
  dateTo: string;
};

const EMPTY_LAB_FILTERS: LabFilters = {
  searchBy: "All Fields",
  query: "",
  department: "All",
  doctor: "All Doctors",
  priority: "All",
  status: "All",
  specimen: "All",
  insurance: "All",
  location: "All",
  technician: "All Technicians",
  dateFrom: "",
  dateTo: "",
};

const ADVANCED_DEFAULTS: Omit<LabFilters, "searchBy" | "query"> = {
  department: "All",
  doctor: "All Doctors",
  priority: "All",
  status: "All",
  specimen: "All",
  insurance: "All",
  location: "All",
  technician: "All Technicians",
  dateFrom: "",
  dateTo: "",
};

function matchesSearch(o: LabOrder, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName,
    MRN: o.mrn,
    "Order Number": o.id,
    Barcode: o.specimenId,
    "National ID": o.mrn,
    Doctor: o.doctor,
    Phone: "0911 234 567",
    Department: o.department,
    "Specimen ID": o.specimenId,
  };
  if (searchBy === "All Fields") {
    return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  }
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyLabFilters(orders: LabOrder[], f: LabFilters, quickFilter: string): LabOrder[] {
  return orders.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.doctor !== "All Doctors" && o.doctor !== f.doctor) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.status !== "All" && o.status !== f.status) return false;
    if (f.specimen !== "All" && o.specimen !== f.specimen) return false;
    if (f.insurance !== "All" && o.insurance !== f.insurance) return false;
    if (f.location !== "All" && o.location !== f.location) return false;
    if (f.technician !== "All Technicians" && o.technician !== f.technician) return false;
    if (f.dateFrom && o.requestedAtISO < f.dateFrom) return false;
    if (f.dateTo && o.requestedAtISO > f.dateTo) return false;
    if (!matchesQuickFilter(o, quickFilter)) return false;
    return true;
  });
}

function countActiveFilters(f: LabFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "dateFrom" || k === "dateTo") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.dateFrom || f.dateTo) n++;
  return n;
}

/* ---------- filter bar ---------- */

function LabFilterBar({
  filters,
  clearKey,
  quickFilter,
  onChange,
  onQuickFilter,
  onClearAdvanced,
}: {
  filters: LabFilters;
  clearKey: number;
  quickFilter: string;
  onChange: (partial: Partial<LabFilters>) => void;
  onQuickFilter: (q: string) => void;
  onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select
            value={filters.searchBy}
            onChange={(e) => onChange({ searchBy: e.target.value as SearchField })}
            className={`${inputClass} pr-8 appearance-none bg-white`}
          >
            {(["All Fields", "Patient Name", "MRN", "Order Number", "Barcode", "National ID", "Doctor", "Phone", "Department", "Specimen ID"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by patient, MRN, order #, barcode, doctor…" : `Search by ${filters.searchBy}`}
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            className={`${inputClass} pl-9`}
          />
          <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="lab-orders-filters-panel"
          className={`flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg border text-sm font-medium shrink-0 transition-colors ${
            filtersOpen || activeCount > 0
              ? "border-teal-700 bg-teal-50 text-teal-800"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter size={16} strokeWidth={2} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-teal-700 text-white text-[10px] font-semibold leading-none">
              {activeCount}
            </span>
          )}
          <ChevronDown size={15} strokeWidth={2} className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            id="lab-orders-filters-panel"
            aria-hidden={!filtersOpen}
            className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100"
          >
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Ordering Doctor" value={filters.doctor} onChange={(v) => onChange({ doctor: v })} options={["All Doctors", ...DOCTORS]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect
              label="Status"
              value={filters.status}
              onChange={(v) => onChange({ status: v })}
              options={["All", "Requested", "Waiting Collection", "Collected", "Received", "Processing", "Quality Check", "Validated", "Completed", "Cancelled", "Rejected"]}
            />
            <ControlledSelect label="Specimen Type" value={filters.specimen} onChange={(v) => onChange({ specimen: v })} options={["All", ...SPECIMEN_TYPES]} />
            <DateRangePicker
              label="Date"
              clearKey={clearKey}
              active={!!(filters.dateFrom || filters.dateTo)}
              onFromChange={(v) => onChange({ dateFrom: v })}
              onToChange={(v) => onChange({ dateTo: v })}
            />
            <ControlledSelect label="Insurance" value={filters.insurance} onChange={(v) => onChange({ insurance: v })} options={["All", ...INSURANCE_OPTIONS]} />
            <ControlledSelect label="Location" value={filters.location} onChange={(v) => onChange({ location: v })} options={["All", ...LOCATIONS]} />
            <ControlledSelect label="Technician" value={filters.technician} onChange={(v) => onChange({ technician: v })} options={["All Technicians", ...TECHNICIANS]} />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAdvanced}
                aria-label="Clear all filters"
                className="group flex items-center gap-2 pb-2.5 pl-2.5 pr-2.5 hover:pr-3.5 rounded-full text-gray-500 hover:text-gray-700 shrink-0 transition-all duration-200"
              >
                <FilterX size={17} strokeWidth={2.1} className="shrink-0 text-red-600" />
                <span className="max-w-0 group-hover:max-w-[110px] overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200">
                  Clear filters
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick filter chips — always visible for one-click access */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {QUICK_FILTERS.map((q) => {
          const active = q === quickFilter;
          return (
            <button
              key={q}
              type="button"
              onClick={() => onQuickFilter(q)}
              className={`text-xs font-bold rounded-full px-3 py-1.5 mt-2 transition-colors ${
                active ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {q}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- pagination ---------- */

function Pagination({
  from,
  to,
  total,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: {
  from: number;
  to: number;
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-1 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        {total === 0 ? "No results" : `Showing ${from} to ${to} of ${total} entries`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              p === currentPage ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          <ChevronsRight size={16} strokeWidth={2} />
        </button>
        <div className="relative ml-2">
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(parseInt(e.target.value)); onPageChange(1); }}
            className="appearance-none border border-gray-300 rounded-md pl-3 pr-7 h-8 text-sm text-gray-700 bg-white"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={2} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

/* ---------- expandable row detail ---------- */

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
      <div className="text-[13px] text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function DetailSection({
  icon: Icon,
  iconTone,
  title,
  children,
}: {
  icon: typeof FileText;
  iconTone: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${iconTone}`}>
          <Icon size={14} strokeWidth={2.25} />
        </span>
        <h4 className="text-[13px] font-bold text-slate-800">{title}</h4>
      </div>
      <div className="flex flex-col gap-3.5 pl-9">{children}</div>
    </div>
  );
}

function ExpandedRowDetail({ order }: { order: LabOrder }) {
  const hasWarning = order.duplicateOf || (order.status === "Rejected" && order.rejectionReason);
  return (
    <tr className="bg-[#FBFCFD] border-b border-gray-100">
      <td colSpan={13} className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
          {hasWarning && (
            <div className="flex flex-col gap-2">
              {order.duplicateOf && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                  <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                  <span>Possible duplicate of order <b className="font-semibold">{order.duplicateOf}</b> for the same patient — verify before processing.</span>
                </div>
              )}
              {order.status === "Rejected" && order.rejectionReason && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  <ShieldAlert size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                  <span>Rejection reason: {order.rejectionReason}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 md:divide-x md:divide-gray-100">
            <DetailSection icon={FileText} iconTone="bg-blue-50 text-blue-600" title="Clinical Context">
              <DetailField label="Diagnosis">{order.diagnosis}</DetailField>
              <DetailField label="Clinical Notes">{order.clinicalNotes}</DetailField>
              <DetailField label="Special Instructions">{order.specialInstructions || "None"}</DetailField>
            </DetailSection>

            <DetailSection icon={ShieldAlert} iconTone="bg-red-50 text-red-600" title="Safety & History">
              <DetailField label="Patient Allergies">
                {order.allergies.length === 0 ? (
                  "None recorded"
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {order.allergies.map((a) => (
                      <span key={a} className="text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">{a}</span>
                    ))}
                  </div>
                )}
              </DetailField>
              <DetailField label="Previous Laboratory History">{order.previousLabHistory}</DetailField>
              <DetailField label="Insurance">{order.insurance}</DetailField>
            </DetailSection>

            <DetailSection icon={Paperclip} iconTone="bg-violet-50 text-violet-600" title="Documentation">
              <DetailField label="Attachments">
                {order.attachments.length === 0 ? (
                  <span className="text-gray-400">None attached</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {order.attachments.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <Paperclip size={12} strokeWidth={2} className="text-gray-400 shrink-0" /> {a}
                      </span>
                    ))}
                  </div>
                )}
              </DetailField>
              <DetailField label="Order Timeline">
                Requested {order.requestedAt}
                {order.collectionTime ? ` · Collected ${order.collectionTime}` : ""}
                <span className="block text-gray-400 mt-0.5">Open the drawer for full stage-by-stage progress.</span>
              </DetailField>
            </DetailSection>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ---------- worklist table ---------- */

function LabWorklistTable({
  orders,
  total,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  selectedId,
  onSelect,
  expandedId,
  onToggleExpand,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: {
  orders: LabOrder[];
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}) {
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);
  const allOnPageSelected = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">Laboratory Worklist</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="p-2 w-7">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                    allOnPageSelected ? "bg-teal-700" : "border border-gray-300 bg-white"
                  }`}
                  aria-label="Select all rows on this page"
                >
                  {allOnPageSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                </button>
              </th>
              <th className="p-2 w-7"></th>
              {["Order", "Patient", "Dept. / Doctor", "Tests", "Specimen", "Collection", "Priority", "Status", "Technician", "TAT", "Actions"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-10 text-center text-sm text-gray-400">
                  No laboratory orders match the current filters.
                </td>
              </tr>
            ) : (
              orders.map((o, idx) => {
                const isSelected = o.id === selectedId;
                const isChecked = selectedIds.includes(o.id);
                const isExpanded = expandedId === o.id;
                const readOnly = isReadOnly(o.status);
                return (
                  <Fragment key={o.id}>
                    <tr
                      onClick={() => onSelect(o.id)}
                      className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${PRIORITY_BORDER[o.priority]} ${
                        isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleSelect(o.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? "bg-teal-700" : "border border-gray-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
                        </button>
                      </td>
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleExpand(o.id)}
                          aria-expanded={isExpanded}
                          aria-label="Toggle row details"
                          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors"
                        >
                          <ChevronRight size={15} strokeWidth={2.25} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-medium">{o.id}</span>
                          <span className="text-xs text-gray-400">{o.requestedAt}</span>
                        </div>
                      </td>
                      <td className="p-2 min-w-[120px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 whitespace-nowrap">{o.patientName}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {o.mrn} · {o.age}{o.gender[0]}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 min-w-[120px]">
                        <div className="flex flex-col">
                          <span className="text-slate-800 whitespace-nowrap">{o.department}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{o.doctor} · {o.origin}</span>
                        </div>
                      </td>
                      <td className="p-2 min-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {o.tests.slice(0, 2).map((t) => (
                            <span key={t} className="text-[11px] font-semibold text-slate-700 bg-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">{t}</span>
                          ))}
                          {o.tests.length > 2 && (
                            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5 whitespace-nowrap">+{o.tests.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.specimen}</td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-700">{COLLECTION_LABEL[o.status]}</span>
                          <span className="text-xs text-gray-400">{o.collectionTime ?? "—"}</span>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${PRIORITY_STYLES[o.priority]}`}>{o.priority}</span>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {o.technician ? (
                          <span className="text-slate-700">{o.technician}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.turnaroundTarget}</td>
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={readOnly}
                            className="h-8 px-2.5 border border-gray-300 rounded-l-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r-0 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {o.status === "Requested" || o.status === "Waiting Collection" ? "Collect" : readOnly ? "View" : "Process"}
                          </button>
                          <button
                            type="button"
                            aria-label="More actions"
                            className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <MoreVertical size={15} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && <ExpandedRowDetail order={o} />}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-4">
        <Pagination
          from={startRow}
          to={endRow}
          total={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}

/* ---------- laboratory capacity strip (module-wide, not order-specific) ---------- */

function LaboratoryCapacityStrip() {
  const stats: { icon: typeof UserCheck; label: string; value: string; valueClass?: string }[] = [
    { icon: UserCheck, label: "Technicians Available", value: "4 / 6" },
    { icon: Hourglass, label: "Pending Samples", value: "18", valueClass: "text-amber-600" },
    { icon: Cpu, label: "Machines Online", value: "5 / 6" },
    { icon: ShieldCheck, label: "Analyzer Status", value: "Operational", valueClass: "text-emerald-600" },
    { icon: Gauge, label: "Average Turnaround", value: "2h 40m" },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 shrink-0">
        <FlaskConical size={16} strokeWidth={2.25} className="text-teal-700" />
        Laboratory Capacity
      </div>
      <div className="hidden sm:block w-px h-8 bg-gray-100 shrink-0" />
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-500 shrink-0">
              <Icon size={15} strokeWidth={2} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{s.label}</span>
              <span className={`text-sm font-bold text-slate-800 whitespace-nowrap ${s.valueClass ?? ""}`}>{s.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- order detail drawer (slides in from the right, per-row) ---------- */

function InfoRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold text-slate-800 text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function DrawerSectionHeading({ icon: Icon, iconTone, title }: { icon: typeof FileText; iconTone: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${iconTone}`}>
        <Icon size={13} strokeWidth={2.25} />
      </span>
      <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

type WorkflowStageDef = { stage: OrderStatus; icon: typeof ClipboardList };

const WORKFLOW_STAGE_DEFS: WorkflowStageDef[] = [
  { stage: "Requested", icon: ClipboardList },
  { stage: "Waiting Collection", icon: Hourglass },
  { stage: "Collected", icon: Droplet },
  { stage: "Received", icon: TestTube },
  { stage: "Processing", icon: FlaskConical },
  { stage: "Quality Check", icon: ShieldCheck },
  { stage: "Validated", icon: CircleCheckBig },
  { stage: "Completed", icon: CircleCheckBig },
];

function stageTimestamp(order: LabOrder, stage: OrderStatus): string | null {
  if (stage === "Requested") return order.requestedAt;
  if (stage === "Collected") return order.collectionTime;
  return null;
}

function WorkflowTimelineBody({ order }: { order: LabOrder }) {
  const terminal = order.status === "Cancelled" || order.status === "Rejected";
  const currentIdx = terminal ? -1 : WORKFLOW_STAGE_DEFS.findIndex((s) => s.stage === order.status);
  return (
    <>
      {terminal && (
        <div className={`flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 mb-3 ${order.status === "Cancelled" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`}>
          {order.status === "Cancelled" ? <Ban size={13} strokeWidth={2.25} /> : <ShieldAlert size={13} strokeWidth={2.25} />}
          Order {order.status}
        </div>
      )}
      <div className="flex flex-col">
        {WORKFLOW_STAGE_DEFS.map(({ stage, icon: StageIcon }, i) => {
          const state = terminal ? "pending" : i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
          const timestamp = stageTimestamp(order, stage);
          return (
            <div key={stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${
                    state === "active"
                      ? "bg-teal-600 text-white ring-4 ring-teal-600/15"
                      : state === "done"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <StageIcon size={13} strokeWidth={2.25} />
                </span>
                {i < WORKFLOW_STAGE_DEFS.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
              </div>
              <div className="flex flex-col pb-4 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm ${state === "active" ? "font-bold text-slate-800" : state === "done" ? "text-slate-600 font-medium" : "text-gray-400"}`}>
                    {stage}
                  </span>
                  {state === "active" && (
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-1.5 py-0.5">
                      Current
                    </span>
                  )}
                </div>
                {timestamp && <span className="text-[11px] text-gray-400 mt-0.5">{timestamp}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function QuickActionTile({ icon: Icon, label, tone, disabled }: { icon: typeof Printer; label: string; tone: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1.5 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

const DRAWER_PRIORITY_ACCENT: Record<Priority, string> = {
  Routine: "bg-teal-600",
  Urgent: "bg-amber-400",
  STAT: "bg-red-600",
};

function LabOrderDrawer({ order, onClose }: { order: LabOrder; onClose: () => void }) {
  const readOnly = isReadOnly(order.status);
  const alreadyCollected = order.status !== "Requested" && order.status !== "Waiting Collection";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose} aria-hidden />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
        {/* Priority accent strip */}
        <div className={`h-1 shrink-0 ${DRAWER_PRIORITY_ACCENT[order.priority]}`} />

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-200 shrink-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Laboratory Order</span>
              <h2 className="text-base font-bold text-slate-900 truncate">{order.id}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar initials={initialsOf(order.patientName)} />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{order.patientName}</span>
              <span className="text-xs text-gray-400 truncate">{order.mrn} · {order.age} · {order.gender}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[order.priority]}`}>
              {order.priority}
            </span>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {/* Patient Summary */}
          <div>
            <DrawerSectionHeading icon={Users} iconTone="bg-blue-50 text-blue-600" title="Patient Summary" />
            <div className="divide-y divide-gray-100">
              <InfoRow label="Blood Group" value="O+" />
              <InfoRow label="Insurance" value={order.insurance} valueClass="text-emerald-600" />
              <InfoRow label="Allergies" value={order.allergies.join(", ") || "None"} valueClass={order.allergies.length ? "text-red-500" : ""} />
              <InfoRow label="Diagnosis" value={order.diagnosis} />
              <InfoRow label="Current Visit" value={`${order.department} · ${order.origin}`} />
            </div>
          </div>

          {/* Order Details */}
          <div>
            <DrawerSectionHeading icon={FlaskConical} iconTone="bg-violet-50 text-violet-600" title="Order Details" />
            <div className="divide-y divide-gray-100">
              <InfoRow label="Ordering Doctor" value={order.doctor} />
              <InfoRow label="Department" value={order.department} />
              <InfoRow label="Requested Time" value={order.requestedAt} />
              <InfoRow label="Specimen Required" value={order.specimen} />
              <InfoRow label="Expected Turnaround" value={order.turnaroundTarget} />
              <InfoRow label="Collection Location" value={order.location} />
            </div>
          </div>

          {/* Workflow Timeline */}
          <div>
            <DrawerSectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Workflow Timeline" />
            <div className="mt-2">
              <WorkflowTimelineBody order={order} />
            </div>
          </div>
        </div>

        {/* Footer: Quick Actions */}
        <div className="shrink-0 px-5 pt-3 pb-4 border-t border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">Quick Actions</span>
          <div className="grid grid-cols-3 gap-2">
            <QuickActionTile icon={UserCheck} label="Assign Technician" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" disabled={readOnly} />
            <QuickActionTile icon={Barcode} label="Print Barcode" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" disabled={alreadyCollected || readOnly} />
            <QuickActionTile icon={TestTube} label="Collect Specimen" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" disabled={alreadyCollected || readOnly} />
            <QuickActionTile icon={ShieldAlert} label="Reject Order" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" disabled={readOnly} />
            <QuickActionTile icon={Ban} label="Cancel Order" tone="border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100" disabled={readOnly} />
            <QuickActionTile icon={FileText} label="View Investigation" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" />
            <QuickActionTile icon={Users} label="View Patient 360°" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} />
        Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} />
        Print Worklist
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} />
        Export
      </button>
      <button type="button" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-colors">
        <ListChecks size={15} strokeWidth={2.25} />
        Bulk Actions
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function LabTestOrdersForm() {
  const [filters, setFilters] = useState<LabFilters>(EMPTY_LAB_FILTERS);
  const [quickFilter, setQuickFilter] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const kpiCards = useMemo(() => buildKpiCards(LAB_ORDERS), []);

  const filteredOrders = useMemo(() => {
    const rows = applyLabFilters(LAB_ORDERS, filters, quickFilter);
    // STAT orders always appear at the top, per lab triage business rule.
    const priorityRank: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 };
    return [...rows].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [filters, quickFilter]);

  const paginatedOrders = useMemo(
    () => filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredOrders, currentPage, pageSize]
  );

  const selectedOrder = selectedId ? LAB_ORDERS.find((o) => o.id === selectedId) ?? null : null;

  const handleChange = (partial: Partial<LabFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const handleQuickFilter = (q: string) => {
    setQuickFilter(q);
    setCurrentPage(1);
  };

  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
    setCurrentPage(1);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const allSelected = paginatedOrders.length > 0 && paginatedOrders.every((o) => prev.includes(o.id));
      if (allSelected) return prev.filter((id) => !paginatedOrders.some((o) => o.id === id));
      const merged = new Set(prev);
      paginatedOrders.forEach((o) => merged.add(o.id));
      return Array.from(merged);
    });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1700px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Laboratory Test Orders"
          breadcrumb="Laboratory (LIS) > Test Orders"
          subtitle="Manage incoming laboratory requests, prioritize specimens, assign technicians, and monitor order progress."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickFilter} />

        <LaboratoryCapacityStrip />

        <LabFilterBar
          filters={filters}
          clearKey={clearKey}
          quickFilter={quickFilter}
          onChange={handleChange}
          onQuickFilter={handleQuickFilter}
          onClearAdvanced={handleClearAdvanced}
        />

        <LabWorklistTable
          orders={paginatedOrders}
          total={filteredOrders.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          expandedId={expandedId}
          onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? null : id))}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        {selectedOrder && <LabOrderDrawer order={selectedOrder} onClose={() => setSelectedId(null)} />}
      </div>

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
              <UserCheck size={15} strokeWidth={2.25} />
              Assign Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </FooterButton>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <TestTube size={15} strokeWidth={2.25} />
              Start Collection
            </button>
          </>
        }
      />
    </div>
  );
}
