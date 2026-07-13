"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  MoreVertical,
  Users,
  ClipboardList,
  Hourglass,
  FlaskConical,
  CircleCheckBig,
  RefreshCw,
  Printer,
  Download,
  Upload,
  Barcode,
  TestTube,
  History,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Check,
  Filter,
  FilterX,
  Pencil,
  Copy,
  Undo2,
  ArrowUp,
  ArrowDown,
  Equal,
  Bell,
  Repeat,
  ClipboardCheck,
  Send,
  Microscope,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Result Entry.
   Spreadsheet-style workspace where technologists review analyzer-imported
   values, enter manual results, and submit a specimen's results for
   Result Validation. Hybrid of a spreadsheet and a clinical review workspace.
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";
type OrderStatus = "Processing" | "Analyzer Imported" | "Manual Review" | "Draft Saved" | "Submitted" | "Awaiting Validation";
type ResultType = "numeric" | "text" | "posneg" | "select" | "remarks";
type Flag = "Normal" | "Borderline" | "High" | "Low" | "Critical High" | "Critical Low";
type RowStatus = "Analyzer Imported" | "Manual Entry Required" | "Manually Edited" | "Pending";

type HistoryPoint = { date: string; value: string };

type ResultRow = {
  id: string;
  testName: string;
  resultType: ResultType;
  value: string;
  analyzerValue: string | null;
  unit: string;
  refRange: string;
  ageSpecificRange?: string;
  genderSpecificRange?: string;
  criticalRange?: string;
  refLow?: number;
  refHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  flag: Flag;
  status: RowStatus;
  comment: string;
  edited: boolean;
  editedBy?: string;
  editedAt?: string;
  specimenType: string;
  method: string;
  options?: string[];
  history: HistoryPoint[];
  pendingConfirm?: boolean;
};

type LabResultOrder = {
  id: string;
  specimenId: string;
  barcode: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female";
  department: string;
  doctor: string;
  priority: Priority;
  status: OrderStatus;
  analyzer: string;
  technician: string;
  collectionTime: string;
  processingTime: string;
  collectedAtISO: string;
  insurance: string;
  bloodGroup: string;
  diagnosis: string;
  visit: string;
  testCategory: string;
  rows: ResultRow[];
};

/* ---------- helpers ---------- */

function row(partial: Partial<ResultRow> & { id: string; testName: string }): ResultRow {
  const merged: ResultRow = {
    resultType: "numeric",
    value: "",
    analyzerValue: null,
    unit: "",
    refRange: "",
    flag: "Normal",
    status: "Pending",
    comment: "",
    edited: false,
    specimenType: "Blood",
    method: "—",
    history: [],
    ...partial,
  };
  // Auto-flag numeric analyzer values against their reference range at load time,
  // rather than only after the technologist edits the cell.
  if (partial.flag === undefined && merged.resultType === "numeric" && merged.value) {
    merged.flag = computeNumericFlag(merged.value, merged);
  }
  if (partial.status === undefined) {
    merged.status = merged.analyzerValue && !merged.edited ? "Analyzer Imported" : !merged.value ? "Manual Entry Required" : "Manually Edited";
  }
  return merged;
}

/* ---------- mock data ---------- */

const ORDERS_QUEUE: LabResultOrder[] = [
  {
    id: "LAB-2026-000451", specimenId: "SPC-2026-08811", barcode: "8891234500451",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Manual Review",
    analyzer: "Sysmex XN-1000", technician: "Selam Getachew",
    collectionTime: "05/21/2026 · 09:12 AM", processingTime: "05/21/2026 · 09:45 AM", collectedAtISO: "2026-05-21",
    insurance: "Woreda 07 CBHI", bloodGroup: "O+", diagnosis: "Hypertension, T2DM follow-up", visit: "OPD-2026-000567",
    testCategory: "Hematology / Chemistry",
    rows: [
      row({ id: "wbc", testName: "WBC", resultType: "numeric", value: "11.8", analyzerValue: "11.8", unit: "×10⁹/L", refRange: "4.0 – 11.0", refLow: 4.0, refHigh: 11.0, method: "Flow Cytometry", history: [{ date: "Feb 2026", value: "9.8" }, { date: "Nov 2025", value: "8.4" }] }),
      row({ id: "rbc", testName: "RBC", resultType: "numeric", value: "4.6", analyzerValue: "4.6", unit: "×10¹²/L", refRange: "4.2 – 5.4", refLow: 4.2, refHigh: 5.4, method: "Flow Cytometry", history: [{ date: "Feb 2026", value: "4.5" }] }),
      row({ id: "hgb", testName: "Hemoglobin", resultType: "numeric", value: "10.2", analyzerValue: "10.2", unit: "g/dL", refRange: "12.0 – 15.5", refLow: 12.0, refHigh: 15.5, genderSpecificRange: "Female: 12.0 – 15.5 g/dL", criticalLow: 7.0, criticalRange: "< 7.0 g/dL", method: "SLS-Hemoglobin", history: [{ date: "Feb 2026", value: "11.4" }, { date: "Nov 2025", value: "12.1" }] }),
      row({ id: "plt", testName: "Platelets", resultType: "numeric", value: "410", analyzerValue: "410", unit: "×10⁹/L", refRange: "150 – 450", refLow: 150, refHigh: 450, method: "Impedance", history: [{ date: "Feb 2026", value: "392" }] }),
      row({ id: "glu", testName: "Blood Glucose", resultType: "numeric", value: "188", analyzerValue: "188", unit: "mg/dL", refRange: "70 – 110 (fasting)", refLow: 70, refHigh: 110, method: "Hexokinase", history: [{ date: "Feb 2026", value: "176" }, { date: "Nov 2025", value: "162" }] }),
      row({ id: "hba1c", testName: "HbA1c", resultType: "numeric", value: "7.4", analyzerValue: "7.4", unit: "%", refRange: "4.0 – 5.6", refLow: 4.0, refHigh: 5.6, method: "HPLC", history: [{ date: "Feb 2026", value: "7.2" }, { date: "Aug 2025", value: "7.6" }] }),
      row({ id: "creat", testName: "Creatinine", resultType: "numeric", value: "0.9", analyzerValue: "0.9", unit: "mg/dL", refRange: "0.6 – 1.3", refLow: 0.6, refHigh: 1.3, method: "Jaffe", history: [{ date: "Feb 2026", value: "0.8" }] }),
      row({ id: "alt", testName: "ALT", resultType: "numeric", value: "", analyzerValue: null, unit: "U/L", refRange: "7 – 56", refLow: 7, refHigh: 56, status: "Manual Entry Required", method: "IFCC Kinetic", history: [{ date: "Feb 2026", value: "32" }] }),
      row({ id: "ast", testName: "AST", resultType: "numeric", value: "", analyzerValue: null, unit: "U/L", refRange: "10 – 40", refLow: 10, refHigh: 40, status: "Manual Entry Required", method: "IFCC Kinetic", history: [{ date: "Feb 2026", value: "28" }] }),
      row({ id: "ua", testName: "Urinalysis", resultType: "select", value: "Trace Protein", options: ["Normal", "Trace Protein", "Trace Blood", "Abnormal"], flag: "Borderline", status: "Manually Edited", edited: true, editedBy: "Selam Getachew", editedAt: "09:58 AM", refRange: "Normal", specimenType: "Urine", method: "Dipstick / Microscopy" }),
      row({ id: "covid", testName: "COVID PCR", resultType: "posneg", value: "Negative", analyzerValue: "Negative", unit: "", refRange: "Negative", flag: "Normal", specimenType: "Nasopharyngeal Swab", method: "RT-PCR" }),
      row({ id: "tropo", testName: "Troponin", resultType: "numeric", value: "0.02", analyzerValue: "0.02", unit: "ng/mL", refRange: "< 0.04", refLow: 0, refHigh: 0.04, criticalHigh: 0.4, criticalRange: "> 0.4 ng/mL", method: "Chemiluminescence" }),
    ],
  },
  {
    id: "LAB-2026-000442", specimenId: "SPC-2026-08655", barcode: "8891234500442",
    patientName: "Marta Alemu", mrn: "MRN-2026-000567", age: 29, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu", priority: "STAT", status: "Analyzer Imported",
    analyzer: "Roche Cobas e411", technician: "Dawit Mekonnen",
    collectionTime: "05/21/2026 · 10:12 AM", processingTime: "05/21/2026 · 10:34 AM", collectedAtISO: "2026-05-21",
    insurance: "Self-Pay", bloodGroup: "O-", diagnosis: "Acute chest pain, rule out ACS", visit: "ER-2026-001102",
    testCategory: "Cardiology / Chemistry",
    rows: [
      row({ id: "tropo2", testName: "Troponin", resultType: "numeric", value: "0.52", analyzerValue: "0.52", unit: "ng/mL", refRange: "< 0.04", refLow: 0, refHigh: 0.04, criticalHigh: 0.4, criticalRange: "> 0.4 ng/mL", flag: "Critical High", status: "Analyzer Imported", method: "Chemiluminescence", pendingConfirm: true }),
      row({ id: "k", testName: "Potassium", resultType: "numeric", value: "2.8", analyzerValue: "2.8", unit: "mmol/L", refRange: "3.5 – 5.1", refLow: 3.5, refHigh: 5.1, criticalLow: 2.9, criticalRange: "< 2.9 mmol/L", flag: "Critical Low", status: "Analyzer Imported", method: "ISE", pendingConfirm: true }),
      row({ id: "wbc2", testName: "WBC", resultType: "numeric", value: "9.1", analyzerValue: "9.1", unit: "×10⁹/L", refRange: "4.0 – 11.0", refLow: 4.0, refHigh: 11.0, method: "Flow Cytometry" }),
      row({ id: "hgb2", testName: "Hemoglobin", resultType: "numeric", value: "13.1", analyzerValue: "13.1", unit: "g/dL", refRange: "12.0 – 15.5", refLow: 12.0, refHigh: 15.5, method: "SLS-Hemoglobin" }),
    ],
  },
  {
    id: "LAB-2026-000418", specimenId: "SPC-2026-08380", barcode: "8891234500418",
    patientName: "Almaz Tesfaye", mrn: "MRN-2026-000901", age: 48, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu", priority: "STAT", status: "Manual Review",
    analyzer: "BD BACTEC", technician: "Dawit Mekonnen",
    collectionTime: "05/21/2026 · 11:02 AM", processingTime: "05/21/2026 · 11:20 AM", collectedAtISO: "2026-05-21",
    insurance: "Woreda 07 CBHI", bloodGroup: "A+", diagnosis: "High-grade fever, rigors — rule out sepsis", visit: "ER-2026-001098",
    testCategory: "Microbiology / Hematology",
    rows: [
      row({ id: "bcx", testName: "Blood Culture", resultType: "posneg", value: "Positive", analyzerValue: null, unit: "", refRange: "Negative", flag: "Critical High", status: "Manually Edited", edited: true, editedBy: "Dawit Mekonnen", editedAt: "11:48 AM", specimenType: "Blood", method: "Automated Culture (BACTEC)" }),
      row({ id: "bcx-remarks", testName: "Culture Remarks", resultType: "remarks", value: "Gram-negative bacilli seen on Gram stain. Culture and sensitivity pending, preliminary organism identification in progress.", specimenType: "Blood", method: "Gram Stain / Culture", status: "Manually Edited", edited: true, editedBy: "Dawit Mekonnen", editedAt: "11:50 AM" }),
      row({ id: "wbc3", testName: "WBC", resultType: "numeric", value: "16.4", analyzerValue: "16.4", unit: "×10⁹/L", refRange: "4.0 – 11.0", refLow: 4.0, refHigh: 11.0, method: "Flow Cytometry" }),
      row({ id: "malaria", testName: "Malaria RDT", resultType: "posneg", value: "Negative", analyzerValue: "Negative", unit: "", refRange: "Negative", flag: "Normal", specimenType: "Blood", method: "Rapid Diagnostic Test" }),
    ],
  },
  {
    id: "LAB-2026-000420", specimenId: "SPC-2026-08402", barcode: "8891234500420",
    patientName: "Yared Solomon", mrn: "MRN-2026-000342", age: 33, gender: "Male",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Analyzer Imported",
    analyzer: "Abbott Alinity m", technician: "Selam Getachew",
    collectionTime: "05/16/2026 · 09:00 AM", processingTime: "05/16/2026 · 09:40 AM", collectedAtISO: "2026-05-16",
    insurance: "Self-Pay", bloodGroup: "B+", diagnosis: "Pre-employment screening", visit: "OPD-2026-000342",
    testCategory: "Virology",
    rows: [
      row({ id: "covid2", testName: "COVID PCR", resultType: "posneg", value: "Positive", analyzerValue: "Positive", unit: "", refRange: "Negative", flag: "Critical High", status: "Analyzer Imported", specimenType: "Nasopharyngeal Swab", method: "RT-PCR", pendingConfirm: true }),
      row({ id: "hepb", testName: "Hepatitis B Screen", resultType: "posneg", value: "Negative", analyzerValue: "Negative", unit: "", refRange: "Negative", flag: "Normal", specimenType: "Serum", method: "ELISA" }),
      row({ id: "hepc", testName: "Hepatitis C Screen", resultType: "posneg", value: "Negative", analyzerValue: "Negative", unit: "", refRange: "Negative", flag: "Normal", specimenType: "Serum", method: "ELISA" }),
    ],
  },
  {
    id: "LAB-2026-000447", specimenId: "SPC-2026-08774", barcode: "8891234500447",
    patientName: "Alemu Getahun", mrn: "MRN-2026-000234", age: 51, gender: "Male",
    department: "Cardiology", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Draft Saved",
    analyzer: "Roche Cobas c311", technician: "Dawit Mekonnen",
    collectionTime: "05/20/2026 · 07:15 PM", processingTime: "05/20/2026 · 07:55 PM", collectedAtISO: "2026-05-20",
    insurance: "Woreda 07 CBHI", bloodGroup: "AB+", diagnosis: "Congestive heart failure monitoring", visit: "IPD-2026-000441",
    testCategory: "Chemistry",
    rows: [
      row({ id: "ldl", testName: "LDL Cholesterol", resultType: "numeric", value: "168", analyzerValue: "168", unit: "mg/dL", refRange: "< 130", refLow: 0, refHigh: 130, method: "Direct Enzymatic" }),
      row({ id: "kft", testName: "Creatinine", resultType: "numeric", value: "1.1", analyzerValue: "1.1", unit: "mg/dL", refRange: "0.7 – 1.3", refLow: 0.7, refHigh: 1.3, method: "Jaffe" }),
      row({ id: "bnp", testName: "BNP", resultType: "numeric", value: "410", analyzerValue: "410", unit: "pg/mL", refRange: "< 450", refLow: 0, refHigh: 450, method: "Immunoassay" }),
    ],
  },
  {
    id: "LAB-2026-000439", specimenId: "SPC-2026-08611", barcode: "8891234500439",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Submitted",
    analyzer: "Sysmex XN-1000", technician: "Selam Getachew",
    collectionTime: "05/19/2026 · 11:20 AM", processingTime: "05/19/2026 · 11:58 AM", collectedAtISO: "2026-05-19",
    insurance: "Self-Pay", bloodGroup: "A-", diagnosis: "Fatigue, rule out anemia", visit: "OPD-2026-000298",
    testCategory: "Hematology",
    rows: [
      row({ id: "wbc4", testName: "WBC", resultType: "numeric", value: "6.8", analyzerValue: "6.8", unit: "×10⁹/L", refRange: "4.0 – 11.0", refLow: 4.0, refHigh: 11.0, method: "Flow Cytometry" }),
      row({ id: "hgb4", testName: "Hemoglobin", resultType: "numeric", value: "13.6", analyzerValue: "13.6", unit: "g/dL", refRange: "12.0 – 15.5", refLow: 12.0, refHigh: 15.5, method: "SLS-Hemoglobin" }),
    ],
  },
  {
    id: "LAB-2026-000415", specimenId: "SPC-2026-08340", barcode: "8891234500415",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male",
    department: "Orthopedics", doctor: "Dr. Dawit Bekele", priority: "Routine", status: "Awaiting Validation",
    analyzer: "Roche Cobas c311", technician: "Dawit Mekonnen",
    collectionTime: "05/21/2026 · 08:50 AM", processingTime: "05/21/2026 · 09:15 AM", collectedAtISO: "2026-05-21",
    insurance: "Self-Pay", bloodGroup: "O+", diagnosis: "Joint pain and swelling, right knee", visit: "OPD-2026-000601",
    testCategory: "Chemistry",
    rows: [
      row({ id: "esr", testName: "ESR", resultType: "numeric", value: "24", analyzerValue: "24", unit: "mm/hr", refRange: "0 – 20", refLow: 0, refHigh: 20, flag: "Borderline", method: "Westergren" }),
      row({ id: "crp", testName: "CRP", resultType: "numeric", value: "8.2", analyzerValue: "8.2", unit: "mg/L", refRange: "< 10", refLow: 0, refHigh: 10, method: "Immunoturbidimetric" }),
      row({ id: "uric", testName: "Uric Acid", resultType: "numeric", value: "6.1", analyzerValue: "6.1", unit: "mg/dL", refRange: "3.4 – 7.0", refLow: 3.4, refHigh: 7.0, method: "Uricase" }),
    ],
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["General Medicine", "Emergency", "Cardiology", "Orthopedics"];
const TECHNICIANS = ["Selam Getachew", "Dawit Mekonnen"];
const ANALYZERS = ["Sysmex XN-1000", "Roche Cobas e411", "Roche Cobas c311", "Abbott Alinity m", "BD BACTEC"];
const TEST_CATEGORIES = ["Hematology / Chemistry", "Cardiology / Chemistry", "Microbiology / Hematology", "Virology", "Chemistry", "Hematology"];
const QUICK_STATUS_CHIPS = ["All", "Pending", "Imported", "Manual Entry", "Critical", "Abnormal", "Normal", "STAT", "Routine"];

/* ---------- flag computation ---------- */

function computeNumericFlag(value: string, r: ResultRow): Flag {
  const v = parseFloat(value);
  if (Number.isNaN(v) || r.refLow === undefined || r.refHigh === undefined) return r.flag;
  if (r.criticalLow !== undefined && v <= r.criticalLow) return "Critical Low";
  if (r.criticalHigh !== undefined && v >= r.criticalHigh) return "Critical High";
  if (v < r.refLow) return "Low";
  if (v > r.refHigh) return "High";
  const span = r.refHigh - r.refLow;
  if (span > 0 && (v - r.refLow < span * 0.05 || r.refHigh - v < span * 0.05)) return "Borderline";
  return "Normal";
}

function isCritical(flag: Flag) {
  return flag === "Critical High" || flag === "Critical Low";
}

function isAbnormal(flag: Flag) {
  return flag === "High" || flag === "Low" || isCritical(flag);
}

/* ---------- style maps ---------- */

const PRIORITY_STYLES: Record<Priority, string> = {
  Routine: "bg-teal-50 text-teal-700",
  Urgent: "bg-amber-50 text-amber-700",
  STAT: "bg-red-600 text-white",
};

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  Processing: "bg-slate-100 text-slate-600",
  "Analyzer Imported": "bg-blue-50 text-blue-700",
  "Manual Review": "bg-amber-50 text-amber-700",
  "Draft Saved": "bg-violet-50 text-violet-700",
  Submitted: "bg-teal-50 text-teal-700",
  "Awaiting Validation": "bg-teal-700 text-white",
};

const FLAG_STYLES: Record<Flag, string> = {
  Normal: "bg-emerald-50 text-emerald-700",
  Borderline: "bg-amber-50 text-amber-700",
  High: "bg-amber-50 text-amber-700",
  Low: "bg-blue-50 text-blue-700",
  "Critical High": "bg-red-600 text-white",
  "Critical Low": "bg-red-600 text-white",
};

const ROW_STATUS_STYLES: Record<RowStatus, string> = {
  "Analyzer Imported": "bg-blue-50 text-blue-700",
  "Manual Entry Required": "bg-amber-50 text-amber-700",
  "Manually Edited": "bg-violet-50 text-violet-700",
  Pending: "bg-gray-100 text-gray-500",
};

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof ClipboardList; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(orders: LabResultOrder[]): KpiCard[] {
  const pending = orders.filter((o) => o.status !== "Submitted" && o.status !== "Awaiting Validation").length;
  const imported = orders.filter((o) => o.status === "Analyzer Imported").length;
  const manual = orders.filter((o) => o.status === "Manual Review").length;
  const critical = orders.filter((o) => o.rows.some((r) => isCritical(r.flag))).length;
  const completed = orders.filter((o) => o.status === "Submitted" || o.status === "Awaiting Validation").length;
  const awaitingValidation = orders.filter((o) => o.status === "Awaiting Validation").length;

  return [
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Pending Results", value: String(pending), sublabel: "Not yet submitted", quickFilter: "Pending" },
    { icon: Upload, iconBg: "bg-[#627EC1]", label: "Analyzer Imported", value: String(imported), sublabel: "Awaiting review", quickFilter: "Imported" },
    { icon: Pencil, iconBg: "bg-[#5C8E64]", label: "Manual Entry Required", value: String(manual), sublabel: "Missing values", quickFilter: "Manual Entry" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Critical Results", value: String(critical), sublabel: "Needs confirmation", quickFilter: "Critical" },
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "Completed Today", value: String(completed), sublabel: "Submitted / validated", quickFilter: "All" },
    { icon: ClipboardCheck, iconBg: "bg-[#216E6A]", label: "Awaiting Validation", value: String(awaitingValidation), sublabel: "With pathologist", quickFilter: "All" },
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

function activeFieldClass(active: boolean): string {
  return active ? "!border-teal-700 ring-1 ring-teal-700 bg-teal-50/50" : "";
}

function ControlledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const active = value !== options[0];
  return (
    <div className="flex flex-col gap-1 w-40">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} pr-8 appearance-none bg-white ${activeFieldClass(active)}`}>
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

function DateField({ label, clearKey, active, onChange }: { label: string; clearKey: number; active?: boolean; onChange: (iso: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <DatePicker key={`date-${clearKey}`} placeholder="Any date" className={`w-36 rounded-md ${activeFieldClass(!!active)}`} onChange={(d) => onChange(toISO(d))} />
    </div>
  );
}

/* ---------- filters state ---------- */

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Order Number" | "Barcode" | "Specimen ID" | "Visit Number";

type ResultFilters = {
  searchBy: SearchField;
  query: string;
  department: string;
  technician: string;
  analyzer: string;
  status: string;
  priority: string;
  testCategory: string;
  date: string;
};

const EMPTY_FILTERS: ResultFilters = {
  searchBy: "All Fields", query: "", department: "All", technician: "All Technicians", analyzer: "All Analyzers", status: "All", priority: "All", testCategory: "All", date: "",
};

const ADVANCED_DEFAULTS: Omit<ResultFilters, "searchBy" | "query"> = {
  department: "All", technician: "All Technicians", analyzer: "All Analyzers", status: "All", priority: "All", testCategory: "All", date: "",
};

function matchesSearch(o: LabResultOrder, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName, MRN: o.mrn, "Order Number": o.id, Barcode: o.barcode, "Specimen ID": o.specimenId, "Visit Number": o.visit,
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function matchesQuickStatus(o: LabResultOrder, q: string): boolean {
  if (q === "All") return true;
  if (q === "Pending") return o.status !== "Submitted" && o.status !== "Awaiting Validation";
  if (q === "Imported") return o.status === "Analyzer Imported";
  if (q === "Manual Entry") return o.status === "Manual Review" || o.rows.some((r) => r.status === "Manual Entry Required");
  if (q === "Critical") return o.rows.some((r) => isCritical(r.flag));
  if (q === "Abnormal") return o.rows.some((r) => isAbnormal(r.flag));
  if (q === "Normal") return o.rows.every((r) => r.flag === "Normal");
  if (q === "STAT") return o.priority === "STAT";
  if (q === "Routine") return o.priority === "Routine";
  return true;
}

function applyFilters(orders: LabResultOrder[], f: ResultFilters, quickStatus: string): LabResultOrder[] {
  return orders.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.technician !== "All Technicians" && o.technician !== f.technician) return false;
    if (f.analyzer !== "All Analyzers" && o.analyzer !== f.analyzer) return false;
    if (f.status !== "All" && o.status !== f.status) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.testCategory !== "All" && o.testCategory !== f.testCategory) return false;
    if (f.date && o.collectedAtISO !== f.date) return false;
    if (!matchesQuickStatus(o, quickStatus)) return false;
    return true;
  });
}

function countActiveFilters(f: ResultFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "date") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.date) n++;
  return n;
}

/* ---------- filter bar ---------- */

function ResultFilterBar({
  filters, clearKey, quickStatus, onChange, onQuickStatus, onClearAdvanced,
}: {
  filters: ResultFilters; clearKey: number; quickStatus: string;
  onChange: (partial: Partial<ResultFilters>) => void; onQuickStatus: (q: string) => void; onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select value={filters.searchBy} onChange={(e) => onChange({ searchBy: e.target.value as SearchField })} className={`${inputClass} pr-8 appearance-none bg-white`}>
            {(["All Fields", "Patient Name", "MRN", "Order Number", "Barcode", "Specimen ID", "Visit Number"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by patient, MRN, order #, barcode…" : `Search by ${filters.searchBy}`}
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
          aria-controls="result-entry-filters-panel"
          className={`flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg border text-sm font-medium shrink-0 transition-colors ${
            filtersOpen || activeCount > 0 ? "border-teal-700 bg-teal-50 text-teal-800" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter size={16} strokeWidth={2} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-teal-700 text-white text-[10px] font-semibold leading-none">{activeCount}</span>
          )}
          <ChevronDown size={15} strokeWidth={2} className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div id="result-entry-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Technician" value={filters.technician} onChange={(v) => onChange({ technician: v })} options={["All Technicians", ...TECHNICIANS]} />
            <ControlledSelect label="Analyzer" value={filters.analyzer} onChange={(v) => onChange({ analyzer: v })} options={["All Analyzers", ...ANALYZERS]} />
            <ControlledSelect label="Status" value={filters.status} onChange={(v) => onChange({ status: v })} options={["All", "Processing", "Analyzer Imported", "Manual Review", "Draft Saved", "Submitted", "Awaiting Validation"]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect label="Test Category" value={filters.testCategory} onChange={(v) => onChange({ testCategory: v })} options={["All", ...TEST_CATEGORIES]} />
            <DateField label="Date" clearKey={clearKey} active={!!filters.date} onChange={(v) => onChange({ date: v })} />
            {activeCount > 0 && (
              <button type="button" onClick={onClearAdvanced} aria-label="Clear all filters" className="group flex items-center gap-2 pb-2.5 pl-2.5 pr-2.5 hover:pr-3.5 rounded-full text-gray-500 hover:text-gray-700 shrink-0 transition-all duration-200">
                <FilterX size={17} strokeWidth={2.1} className="shrink-0 text-red-600" />
                <span className="max-w-0 group-hover:max-w-[110px] overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200">Clear filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {QUICK_STATUS_CHIPS.map((q) => {
          const active = q === quickStatus;
          return (
            <button key={q} type="button" onClick={() => onQuickStatus(q)} className={`text-xs font-bold rounded-full px-3 py-1.5 mt-2 transition-colors ${active ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
              {q}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- result entry queue strip ---------- */

function QueueChip({ order, selected, onSelect }: { order: LabResultOrder; selected: boolean; onSelect: () => void }) {
  const criticalCount = order.rows.filter((r) => isCritical(r.flag)).length;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-1.5 text-left shrink-0 w-[220px] rounded-lg border p-3 transition-colors ${
        selected ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[order.priority]}`}>{order.priority}</span>
        {criticalCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-600">
            <ShieldAlert size={11} strokeWidth={2.5} /> {criticalCount}
          </span>
        )}
      </div>
      <span className="text-[13px] font-bold text-slate-900 truncate">{order.patientName}</span>
      <span className="text-[11px] text-gray-400 font-mono truncate">{order.barcode}</span>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span className="text-[11px] text-gray-500">{order.rows.length} tests</span>
        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${ORDER_STATUS_STYLES[order.status]}`}>{order.status}</span>
      </div>
    </button>
  );
}

/* ---------- abnormal result panel ---------- */

const FLAG_INTERPRETATION: Record<string, { interpretation: string; action: string }> = {
  Hemoglobin: { interpretation: "Mild anemia consistent with chronic disease or iron deficiency.", action: "Consider iron studies; correlate with clinical picture." },
  Troponin: { interpretation: "Elevated troponin suggests possible myocardial injury.", action: "Notify ordering physician immediately; recommend repeat troponin in 3 hours." },
  Potassium: { interpretation: "Critically low potassium — risk of cardiac arrhythmia.", action: "Notify physician immediately; recommend urgent repeat and clinical correlation." },
  "Blood Culture": { interpretation: "Positive blood culture — possible bacteremia.", action: "Notify physician immediately; escalate to infection control per protocol." },
  "COVID PCR": { interpretation: "Positive result — active SARS-CoV-2 infection.", action: "Notify physician and initiate isolation protocol." },
  "Blood Glucose": { interpretation: "Elevated glucose consistent with known diabetes.", action: "Correlate with HbA1c and current medication regimen." },
  HbA1c: { interpretation: "Elevated HbA1c indicates suboptimal glycemic control.", action: "Flag for diabetes management review." },
  ESR: { interpretation: "Mildly elevated inflammatory marker.", action: "Correlate with CRP and clinical findings." },
  "LDL Cholesterol": { interpretation: "Elevated LDL — increased cardiovascular risk.", action: "Flag for lipid management review." },
};

function AbnormalResultPanel({ order }: { order: LabResultOrder }) {
  const abnormalRows = order.rows.filter((r) => isAbnormal(r.flag));
  if (abnormalRows.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} strokeWidth={2.25} className="text-red-600" />
        <h3 className="text-sm font-bold text-red-700">Abnormal Results Detected — {abnormalRows.length} finding{abnormalRows.length > 1 ? "s" : ""}</h3>
      </div>
      <div className="flex flex-col gap-2.5">
        {abnormalRows.map((r) => {
          const info = FLAG_INTERPRETATION[r.testName];
          const critical = isCritical(r.flag);
          return (
            <div key={r.id} className="bg-white border border-red-100 rounded-md p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">
                  {r.testName} {r.resultType === "posneg" ? r.value : `${r.value} ${r.unit}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${FLAG_STYLES[r.flag]}`}>{r.flag}</span>
                  {critical && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-600">
                      <Bell size={11} strokeWidth={2.5} /> Notify Physician
                    </span>
                  )}
                </div>
              </div>
              {info && (
                <>
                  <span className="text-xs text-slate-600">{info.interpretation}</span>
                  <span className="text-xs font-semibold text-red-700">Suggested action: {info.action}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- result entry spreadsheet ---------- */

function EditedTooltip({ r }: { r: ResultRow }) {
  if (!r.edited) return null;
  const title = `Original: ${r.analyzerValue ?? "—"} · Edited: ${r.value} · By: ${r.editedBy ?? "—"} · At: ${r.editedAt ?? "—"}`;
  return (
    <span title={title} className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 rounded-full px-1.5 py-0.5 cursor-help shrink-0">
      <Pencil size={9} strokeWidth={2.5} /> Edited
    </span>
  );
}

function ResultCell({
  r,
  onChange,
  onConfirmCritical,
  inputRef,
  onArrowNav,
}: {
  r: ResultRow;
  onChange: (value: string) => void;
  onConfirmCritical: () => void;
  inputRef: (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => void;
  onArrowNav: (dir: "up" | "down") => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); onArrowNav("down"); }
    if (e.key === "ArrowUp") { e.preventDefault(); onArrowNav("up"); }
  };

  if (r.resultType === "posneg") {
    return (
      <div className="flex items-center gap-1.5">
        {["Positive", "Negative"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
              r.value === opt ? (opt === "Positive" ? "bg-red-600 text-white" : "bg-emerald-600 text-white") : "border border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (r.resultType === "select") {
    return (
      <div className="relative w-full">
        <select
          ref={(el) => inputRef(el)}
          value={r.value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${inputClass} pr-7 appearance-none bg-white text-sm`}
        >
          {(r.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={13} strokeWidth={2} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  if (r.resultType === "remarks") {
    return (
      <textarea
        ref={(el) => inputRef(el)}
        value={r.value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Clinical / microbiology remarks…"
        className={`${inputClass} resize-none text-sm min-w-[220px]`}
      />
    );
  }

  // numeric / text
  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={(el) => inputRef(el)}
        type="text"
        inputMode={r.resultType === "numeric" ? "decimal" : "text"}
        value={r.value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={r.status === "Manual Entry Required" ? "Enter value…" : ""}
        className={`${inputClass} w-24 text-sm ${r.status === "Manual Entry Required" && !r.value ? "border-amber-300 bg-amber-50/40" : ""}`}
      />
      {r.pendingConfirm && isCritical(r.flag) && (
        <button
          type="button"
          onClick={onConfirmCritical}
          className="inline-flex items-center gap-1 text-[10.5px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-full px-2 py-1 whitespace-nowrap transition-colors"
        >
          <ShieldAlert size={11} strokeWidth={2.5} /> Confirm Critical
        </button>
      )}
    </div>
  );
}

function ResultSpreadsheet({
  order,
  rows,
  selectedTestId,
  onSelectTest,
  onChangeValue,
  onConfirmCritical,
  onCopyPrevious,
  onCommentChange,
  registerInputRef,
  onArrowNav,
  savingState,
  onUndo,
  canUndo,
}: {
  order: LabResultOrder;
  rows: ResultRow[];
  selectedTestId: string | null;
  onSelectTest: (id: string) => void;
  onChangeValue: (id: string, value: string) => void;
  onConfirmCritical: (id: string) => void;
  onCopyPrevious: (id: string) => void;
  onCommentChange: (id: string, comment: string) => void;
  registerInputRef: (id: string, el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => void;
  onArrowNav: (rowId: string, dir: "up" | "down") => void;
  savingState: "idle" | "saving" | "saved";
  onUndo: () => void;
  canUndo: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 whitespace-nowrap">Result Entry Workspace</h2>
          <span className="text-xs text-gray-400 font-mono truncate">{order.barcode}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            {savingState === "saving" && (
              <>
                <RefreshCw size={12} strokeWidth={2.25} className="animate-spin" /> Saving…
              </>
            )}
            {savingState === "saved" && (
              <>
                <Check size={12} strokeWidth={2.5} className="text-emerald-600" /> All changes saved
              </>
            )}
          </span>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={13} strokeWidth={2.25} /> Undo last edit
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              {["Test Name", "Result", "Unit", "Reference Range", "Flag", "Analyzer Value", "Status", "Comments"].map((h, i) => (
                <th
                  key={h}
                  className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2.5 whitespace-nowrap ${i === 0 ? "sticky left-0 z-20 bg-slate-50" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const flagStyle = FLAG_STYLES[r.flag];
              const isSelected = r.id === selectedTestId;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectTest(r.id)}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className={`p-2.5 font-semibold text-slate-800 whitespace-nowrap sticky left-0 z-[5] ${isSelected ? "bg-teal-50/40" : "bg-white"}`}>
                    {r.testName}
                    <EditedTooltip r={r} />
                  </td>
                  <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                    <ResultCell
                      r={r}
                      onChange={(v) => onChangeValue(r.id, v)}
                      onConfirmCritical={() => onConfirmCritical(r.id)}
                      inputRef={(el) => registerInputRef(r.id, el)}
                      onArrowNav={(dir) => onArrowNav(r.id, dir)}
                    />
                  </td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">{r.unit || "—"}</td>
                  <td className="p-2.5 text-gray-500 whitespace-nowrap">{r.refRange || "—"}</td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${flagStyle}`}>{r.flag}</span>
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    {r.analyzerValue ? (
                      <span className="text-blue-600 font-semibold font-mono">{r.analyzerValue}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ROW_STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="p-2.5 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={r.comment}
                        onChange={(e) => onCommentChange(r.id, e.target.value)}
                        placeholder="Add comment…"
                        className="w-full border-b border-transparent focus:border-gray-300 bg-transparent text-xs text-gray-600 outline-none py-1"
                      />
                      {r.history.length > 0 && r.resultType !== "remarks" && (
                        <button
                          type="button"
                          onClick={() => onCopyPrevious(r.id)}
                          title={`Copy previous result (${r.history[0].value})`}
                          className="text-gray-400 hover:text-teal-700 transition-colors shrink-0"
                        >
                          <Copy size={13} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- right sidebar ---------- */

function InfoRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold text-slate-800 text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionHeading({ icon: Icon, iconTone, title, action }: { icon: typeof FileText; iconTone: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${iconTone}`}>
          <Icon size={14} strokeWidth={2.25} />
        </span>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function PatientSummaryCard({ order }: { order: LabResultOrder }) {
  return (
    <Card>
      <SectionHeading icon={Users} iconTone="bg-blue-50 text-blue-600" title="Patient Summary" />
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={initialsOf(order.patientName)} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">{order.patientName}</span>
          <span className="text-xs text-gray-400 truncate">{order.mrn}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        <InfoRow label="Age / Gender" value={`${order.age} · ${order.gender}`} />
        <InfoRow label="Blood Group" value={order.bloodGroup} />
        <InfoRow label="Insurance" value={order.insurance} valueClass="text-emerald-600" />
        <InfoRow label="Current Diagnosis" value={order.diagnosis} />
        <InfoRow label="Current Visit" value={order.visit} />
      </div>
    </Card>
  );
}

function OrderSummaryCard({ order }: { order: LabResultOrder }) {
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-violet-50 text-violet-600" title="Order Summary" />
      <div className="divide-y divide-gray-100">
        <InfoRow label="Order Number" value={order.id} />
        <InfoRow label="Requested Tests" value={`${order.rows.length} tests`} />
        <InfoRow label="Ordering Doctor" value={order.doctor} />
        <InfoRow label="Department" value={order.department} />
        <InfoRow label="Collection Time" value={order.collectionTime} />
        <InfoRow label="Processing Time" value={order.processingTime} />
        <InfoRow label="Analyzer" value={order.analyzer} />
        <InfoRow label="Technician" value={order.technician} />
      </div>
    </Card>
  );
}

function ReferenceInformationCard({ testRow }: { testRow: ResultRow | null }) {
  if (!testRow) {
    return (
      <Card>
        <SectionHeading icon={TestTube} iconTone="bg-amber-50 text-amber-700" title="Reference Information" />
        <p className="text-xs text-gray-400">Select a test row to view its reference details.</p>
      </Card>
    );
  }
  return (
    <Card>
      <SectionHeading icon={TestTube} iconTone="bg-amber-50 text-amber-700" title="Reference Information" />
      <div className="divide-y divide-gray-100">
        <InfoRow label="Selected Test" value={testRow.testName} />
        <InfoRow label="Normal Range" value={testRow.refRange || "—"} />
        <InfoRow label="Age Specific" value={testRow.ageSpecificRange || "—"} />
        <InfoRow label="Gender Specific" value={testRow.genderSpecificRange || "—"} />
        <InfoRow label="Critical Range" value={testRow.criticalRange || "—"} valueClass={testRow.criticalRange ? "text-red-600" : ""} />
        <InfoRow label="Specimen Type" value={testRow.specimenType} />
        <InfoRow label="Method" value={testRow.method} />
      </div>
    </Card>
  );
}

function TrendArrow({ current, previous }: { current: string; previous: string }) {
  const c = parseFloat(current);
  const p = parseFloat(previous);
  if (Number.isNaN(c) || Number.isNaN(p)) return null;
  if (c > p) return <ArrowUp size={12} strokeWidth={2.5} className="text-amber-600" />;
  if (c < p) return <ArrowDown size={12} strokeWidth={2.5} className="text-blue-600" />;
  return <Equal size={12} strokeWidth={2.5} className="text-gray-400" />;
}

function HistoricalResultsCard({ testRow }: { testRow: ResultRow | null }) {
  if (!testRow || testRow.history.length === 0) {
    return (
      <Card>
        <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Historical Results" />
        <p className="text-xs text-gray-400">No previous results on file for this test.</p>
      </Card>
    );
  }
  const points = [{ date: "Current", value: testRow.value || "—" }, ...testRow.history];
  const numericPoints = points.map((p) => parseFloat(p.value)).filter((v) => !Number.isNaN(v));
  const maxVal = numericPoints.length > 0 ? Math.max(...numericPoints) : 1;
  const latestHistorical = testRow.history[0];
  const pctChange =
    latestHistorical && !Number.isNaN(parseFloat(testRow.value)) && !Number.isNaN(parseFloat(latestHistorical.value)) && parseFloat(latestHistorical.value) !== 0
      ? (((parseFloat(testRow.value) - parseFloat(latestHistorical.value)) / parseFloat(latestHistorical.value)) * 100).toFixed(1)
      : null;

  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Historical Results" />
      {pctChange && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-3">
          vs. last result: <span className={parseFloat(pctChange) > 0 ? "text-amber-600" : parseFloat(pctChange) < 0 ? "text-blue-600" : "text-gray-500"}>{parseFloat(pctChange) > 0 ? "+" : ""}{pctChange}%</span>
        </div>
      )}
      <div className="flex items-end gap-1.5 h-14 mb-3">
        {points.slice().reverse().map((p, i) => {
          const v = parseFloat(p.value);
          const heightPct = !Number.isNaN(v) && maxVal > 0 ? Math.max(8, (v / maxVal) * 100) : 8;
          return (
            <div key={`${p.date}-${i}`} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t ${p.date === "Current" ? "bg-teal-600" : "bg-gray-200"}`} style={{ height: `${heightPct}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex flex-col divide-y divide-gray-100">
        {points.map((p, i) => (
          <div key={`${p.date}-row-${i}`} className="flex items-center justify-between py-1.5">
            <span className="text-xs text-gray-400">{p.date}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${p.date === "Current" ? "text-teal-700" : "text-slate-700"}`}>{p.value} {testRow.unit}</span>
              {i < points.length - 1 && <TrendArrow current={p.value} previous={points[i + 1].value} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertRow({ label, active, icon: Icon }: { label: string; active: boolean; icon: typeof AlertTriangle }) {
  return (
    <div className={`flex items-center justify-between gap-2 py-1.5 ${active ? "" : "opacity-40"}`}>
      <div className="flex items-center gap-2">
        <Icon size={14} strokeWidth={2.25} className={active ? "text-red-500" : "text-gray-400"} />
        <span className="text-[13px] text-slate-700">{label}</span>
      </div>
      {active ? (
        <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 rounded-full px-2 py-0.5">Active</span>
      ) : (
        <span className="text-[10px] font-semibold text-gray-400">Clear</span>
      )}
    </div>
  );
}

function CriticalAlertsCard({ order }: { order: LabResultOrder }) {
  const hasCritical = order.rows.some((r) => isCritical(r.flag));
  const hasManualPending = order.rows.some((r) => r.status === "Manual Entry Required");
  const activeCount = [hasCritical, false, false, hasManualPending, false].filter(Boolean).length;
  return (
    <Card>
      <SectionHeading
        icon={ShieldAlert}
        iconTone={activeCount > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}
        title="Critical Alerts"
        action={activeCount > 0 ? <span className="text-xs font-bold text-red-600">{activeCount} active</span> : <span className="text-xs font-semibold text-emerald-600">All clear</span>}
      />
      <div className="divide-y divide-gray-50">
        <AlertRow label="Critical Value" active={hasCritical} icon={ShieldAlert} />
        <AlertRow label="Delta Check Failure" active={false} icon={AlertTriangle} />
        <AlertRow label="Analyzer Warning" active={false} icon={FlaskConical} />
        <AlertRow label="QC Failure" active={false} icon={Microscope} />
        <AlertRow label="Repeat Test Required" active={hasManualPending} icon={Repeat} />
        <AlertRow label="Specimen Issue" active={false} icon={TestTube} />
      </div>
    </Card>
  );
}

function QuickActionTile({ icon: Icon, label, tone, disabled }: { icon: typeof Printer; label: string; tone: string; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1.5 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}>
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <SectionHeading icon={ClipboardCheck} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={FileText} label="Save Draft" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
        <QuickActionTile icon={Send} label="Submit for Validation" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" />
        <QuickActionTile icon={Repeat} label="Repeat Test" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" />
        <QuickActionTile icon={TestTube} label="Request Recollection" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" />
        <QuickActionTile icon={History} label="Patient Timeline" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
        <QuickActionTile icon={Printer} label="Print Worksheet" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={ClipboardList} label="View Investigation Order" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" />
      </div>
    </Card>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Upload size={15} strokeWidth={2.25} /> Import Analyzer Results
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Worksheet
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function ResultEntryForm() {
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_FILTERS);
  const [quickStatus, setQuickStatus] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(ORDERS_QUEUE[0].id);
  const [ordersState, setOrdersState] = useState<LabResultOrder[]>(ORDERS_QUEUE);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(ORDERS_QUEUE[0].rows[0]?.id ?? null);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [lastEdit, setLastEdit] = useState<{ orderId: string; rowId: string; previousValue: string; previousFlag: Flag; previousStatus: RowStatus } | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kpiCards = useMemo(() => buildKpiCards(ordersState), [ordersState]);

  const filteredOrders = useMemo(() => {
    const rows = applyFilters(ordersState, filters, quickStatus);
    const priorityRank: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 };
    return [...rows].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [ordersState, filters, quickStatus]);

  const selectedOrder = ordersState.find((o) => o.id === selectedOrderId) ?? ordersState[0];
  const selectedTestRow = selectedOrder.rows.find((r) => r.id === selectedTestId) ?? null;

  const triggerAutosave = () => {
    setSavingState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavingState("saved"), 900);
  };

  const updateRow = (rowId: string, updater: (r: ResultRow) => ResultRow) => {
    setOrdersState((prev) =>
      prev.map((o) => (o.id !== selectedOrderId ? o : { ...o, rows: o.rows.map((r) => (r.id === rowId ? updater(r) : r)) }))
    );
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    const order = ordersState.find((o) => o.id === id);
    setSelectedTestId(order?.rows[0]?.id ?? null);
  };

  const handleChangeValue = (rowId: string, value: string) => {
    const current = selectedOrder.rows.find((r) => r.id === rowId);
    if (current) setLastEdit({ orderId: selectedOrderId, rowId, previousValue: current.value, previousFlag: current.flag, previousStatus: current.status });

    updateRow(rowId, (r) => {
      const nextFlag = r.resultType === "numeric" ? computeNumericFlag(value, r) : r.flag;
      const wasAnalyzerOnly = !!r.analyzerValue && !r.edited;
      return {
        ...r,
        value,
        flag: nextFlag,
        edited: r.analyzerValue ? true : r.edited || value.trim().length > 0,
        editedBy: r.analyzerValue || value.trim().length > 0 ? "Selam Getachew" : r.editedBy,
        editedAt: r.analyzerValue || value.trim().length > 0 ? "Just now" : r.editedAt,
        status: wasAnalyzerOnly ? "Manually Edited" : value.trim().length > 0 ? "Manually Edited" : "Pending",
        pendingConfirm: isCritical(nextFlag) && !r.pendingConfirm ? true : r.pendingConfirm && isCritical(nextFlag),
      };
    });
    triggerAutosave();
  };

  const handleConfirmCritical = (rowId: string) => {
    updateRow(rowId, (r) => ({ ...r, pendingConfirm: false }));
  };

  const handleCopyPrevious = (rowId: string) => {
    const r = selectedOrder.rows.find((row) => row.id === rowId);
    if (!r || r.history.length === 0) return;
    handleChangeValue(rowId, r.history[0].value);
  };

  const handleCommentChange = (rowId: string, comment: string) => {
    updateRow(rowId, (r) => ({ ...r, comment }));
    triggerAutosave();
  };

  const handleUndo = () => {
    if (!lastEdit) return;
    setOrdersState((prev) =>
      prev.map((o) =>
        o.id !== lastEdit.orderId
          ? o
          : { ...o, rows: o.rows.map((r) => (r.id === lastEdit.rowId ? { ...r, value: lastEdit.previousValue, flag: lastEdit.previousFlag, status: lastEdit.previousStatus } : r)) }
      )
    );
    setLastEdit(null);
  };

  const registerInputRef = (id: string, el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
    inputRefs.current[id] = el;
  };

  const handleArrowNav = (rowId: string, dir: "up" | "down") => {
    const idx = selectedOrder.rows.findIndex((r) => r.id === rowId);
    const nextIdx = dir === "down" ? idx + 1 : idx - 1;
    const nextRow = selectedOrder.rows[nextIdx];
    if (nextRow) inputRefs.current[nextRow.id]?.focus();
  };

  const handleChange = (partial: Partial<ResultFilters>) => setFilters((prev) => ({ ...prev, ...partial }));
  const handleQuickStatus = (q: string) => setQuickStatus(q);
  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Laboratory Result Entry"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Result Entry"
          subtitle="Review analyzer output, enter laboratory findings, detect abnormal values, and submit results for validation."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickStatus} />

        <ResultFilterBar
          filters={filters}
          clearKey={clearKey}
          quickStatus={quickStatus}
          onChange={handleChange}
          onQuickStatus={handleQuickStatus}
          onClearAdvanced={handleClearAdvanced}
        />

        {/* Result Entry Queue */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800">Result Entry Queue</h2>
            <span className="text-xs text-gray-400">{filteredOrders.length} orders</span>
          </div>
          <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
            {filteredOrders.map((o) => (
              <QueueChip key={o.id} order={o} selected={o.id === selectedOrderId} onSelect={() => handleSelectOrder(o.id)} />
            ))}
          </div>
        </div>

        <AbnormalResultPanel order={selectedOrder} />

        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4 items-start">
          <ResultSpreadsheet
            order={selectedOrder}
            rows={selectedOrder.rows}
            selectedTestId={selectedTestId}
            onSelectTest={setSelectedTestId}
            onChangeValue={handleChangeValue}
            onConfirmCritical={handleConfirmCritical}
            onCopyPrevious={handleCopyPrevious}
            onCommentChange={handleCommentChange}
            registerInputRef={registerInputRef}
            onArrowNav={handleArrowNav}
            savingState={savingState}
            onUndo={handleUndo}
            canUndo={!!lastEdit}
          />

          <div className="flex flex-col gap-4 min-w-0">
            <PatientSummaryCard order={selectedOrder} />
            <OrderSummaryCard order={selectedOrder} />
            <ReferenceInformationCard testRow={selectedTestRow} />
            <HistoricalResultsCard testRow={selectedTestRow} />
            <CriticalAlertsCard order={selectedOrder} />
            <QuickActionsCard />
          </div>
        </div>
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
              <FileText size={15} strokeWidth={2.25} /> Preview Report
            </FooterButton>
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <Send size={15} strokeWidth={2.25} />
              Submit Results for Validation
            </button>
          </>
        }
      />
    </div>
  );
}
