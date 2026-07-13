"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Users,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
  Hourglass,
  FlaskConical,
  CircleCheckBig,
  RefreshCw,
  Printer,
  Download,
  Barcode,
  TestTube,
  History,
  UserCheck,
  UserPlus,
  UserCog,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Check,
  X,
  Filter,
  FilterX,
  ArrowUp,
  ArrowDown,
  Equal,
  Bell,
  Repeat,
  Send,
  Microscope,
  Info,
  Gauge,
  Wrench,
  MessageSquare,
  Pencil,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Result Validation.
   A review-and-approve workstation for senior laboratory staff: verify
   completed results, compare against history, check QC/analyzer status, and
   approve/reject/request-repeat before results release to physicians.
   Read-only review, NOT a data-entry surface (see Result Entry for that).
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";
type ValidationStatus = "Pending Review" | "Under Review" | "Approved" | "Rejected" | "Repeat Requested";
type Flag = "Normal" | "Borderline" | "High" | "Low" | "Critical High" | "Critical Low";

type HistoryPoint = { label: string; value: string };

type ResultParam = {
  id: string;
  testName: string;
  value: string;
  unit: string;
  refRange: string;
  analyzerValue: string | null;
  edited: boolean;
  editedBy?: string;
  flag: Flag;
  method: string;
  reagent: string;
  instrument: string;
  operator: string;
  timestamp: string;
  history: HistoryPoint[];
  isCritical: boolean;
  criticalThreshold?: string;
  notificationRequired?: boolean;
  physicianNotified?: boolean;
  notificationTime?: string;
};

type AuditEvent = { time: string; action: string; user: string };

type MicrobiologyReport = {
  organism: string;
  sensitivity: string[];
  resistance: string[];
  microscopicFindings: string;
  pathologistNotes: string;
};

type QcInfo = {
  qcPassed: boolean;
  calibrationStatus: string;
  analyzerStatus: string;
  controlRange: string;
  instrumentAlerts: string[];
  maintenanceDue: string;
  internalQc: string;
  externalQc: string;
  analyzerMessages: string[];
};

type ValidationCase = {
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
  status: ValidationStatus;
  labSection: string;
  analyzer: string;
  technologist: string;
  validator: string | null;
  collectionTime: string;
  processingTime: string;
  completionTime: string;
  collectedAtISO: string;
  turnaround: string;
  insurance: string;
  bloodGroup: string;
  diagnosis: string;
  ward: string;
  visit: string;
  params: ResultParam[];
  qc: QcInfo;
  microbiology?: MicrobiologyReport;
  auditTrail: AuditEvent[];
};

/* ---------- helpers ---------- */

function isCriticalFlag(flag: Flag) {
  return flag === "Critical High" || flag === "Critical Low";
}

function isAbnormalFlag(flag: Flag) {
  return flag === "High" || flag === "Low" || isCriticalFlag(flag);
}

/* ---------- mock data ---------- */

const DEFAULT_QC: QcInfo = {
  qcPassed: true,
  calibrationStatus: "Current — last calibrated 05/20/2026",
  analyzerStatus: "Operational",
  controlRange: "Level 1 & 2 within ±2 SD",
  instrumentAlerts: [],
  maintenanceDue: "None due",
  internalQc: "Passed — 05/21/2026 07:00 AM",
  externalQc: "Passed — EQAS April 2026",
  analyzerMessages: [],
};

const VALIDATION_CASES: ValidationCase[] = [
  {
    id: "LAB-2026-000451", specimenId: "SPC-2026-08811", barcode: "8891234500451",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Pending Review",
    labSection: "Hematology / Chemistry", analyzer: "Sysmex XN-1000", technologist: "Selam Getachew", validator: "Senior Technologist Martha Alemu",
    collectionTime: "05/21/2026 · 09:12 AM", processingTime: "05/21/2026 · 09:45 AM", completionTime: "05/21/2026 · 10:20 AM", collectedAtISO: "2026-05-21",
    turnaround: "1h 08m", insurance: "Woreda 07 CBHI", bloodGroup: "O+", diagnosis: "Hypertension, T2DM follow-up", ward: "OPD", visit: "OPD-2026-000567",
    params: [
      { id: "wbc", testName: "WBC", value: "11.8", unit: "×10⁹/L", refRange: "4.0 – 11.0", analyzerValue: "11.8", edited: false, flag: "High", method: "Flow Cytometry", reagent: "CELLPACK DCL", instrument: "Sysmex XN-1000 #2", operator: "Selam Getachew", timestamp: "10:02 AM", isCritical: false,
        history: [{ label: "Previous", value: "9.8" }, { label: "6 Months Ago", value: "8.9" }, { label: "1 Year Ago", value: "8.4" }] },
      { id: "hgb", testName: "Hemoglobin", value: "10.2", unit: "g/dL", refRange: "12.0 – 15.5", analyzerValue: "10.2", edited: false, flag: "Low", method: "SLS-Hemoglobin", reagent: "SULFOLYSER", instrument: "Sysmex XN-1000 #2", operator: "Selam Getachew", timestamp: "10:02 AM", isCritical: false,
        history: [{ label: "Previous", value: "11.4" }, { label: "6 Months Ago", value: "12.1" }, { label: "1 Year Ago", value: "12.6" }] },
      { id: "plt", testName: "Platelets", value: "410", unit: "×10⁹/L", refRange: "150 – 450", analyzerValue: "410", edited: false, flag: "Normal", method: "Impedance", reagent: "CELLPACK DCL", instrument: "Sysmex XN-1000 #2", operator: "Selam Getachew", timestamp: "10:02 AM", isCritical: false,
        history: [{ label: "Previous", value: "392" }, { label: "6 Months Ago", value: "375" }, { label: "1 Year Ago", value: "360" }] },
      { id: "glu", testName: "Blood Glucose", value: "188", unit: "mg/dL", refRange: "70 – 110 (fasting)", analyzerValue: "188", edited: false, flag: "High", method: "Hexokinase", reagent: "Glucose HK", instrument: "Roche Cobas c311", operator: "Selam Getachew", timestamp: "10:05 AM", isCritical: false,
        history: [{ label: "Previous", value: "176" }, { label: "6 Months Ago", value: "162" }, { label: "1 Year Ago", value: "154" }] },
      { id: "hba1c", testName: "HbA1c", value: "7.4", unit: "%", refRange: "4.0 – 5.6", analyzerValue: "7.4", edited: false, flag: "High", method: "HPLC", reagent: "Variant II Kit", instrument: "Bio-Rad D-10", operator: "Selam Getachew", timestamp: "10:08 AM", isCritical: false,
        history: [{ label: "Previous", value: "7.2" }, { label: "6 Months Ago", value: "7.6" }, { label: "1 Year Ago", value: "7.9" }] },
      { id: "alt", testName: "ALT", value: "34", unit: "U/L", refRange: "7 – 56", analyzerValue: null, edited: true, editedBy: "Selam Getachew", flag: "Normal", method: "IFCC Kinetic", reagent: "ALT Reagent", instrument: "Roche Cobas c311", operator: "Selam Getachew", timestamp: "10:11 AM", isCritical: false,
        history: [{ label: "Previous", value: "32" }, { label: "6 Months Ago", value: "29" }, { label: "1 Year Ago", value: "31" }] },
      { id: "ast", testName: "AST", value: "27", unit: "U/L", refRange: "10 – 40", analyzerValue: null, edited: true, editedBy: "Selam Getachew", flag: "Normal", method: "IFCC Kinetic", reagent: "AST Reagent", instrument: "Roche Cobas c311", operator: "Selam Getachew", timestamp: "10:12 AM", isCritical: false,
        history: [{ label: "Previous", value: "28" }, { label: "6 Months Ago", value: "26" }, { label: "1 Year Ago", value: "30" }] },
      { id: "covid", testName: "COVID PCR", value: "Negative", unit: "", refRange: "Negative", analyzerValue: "Negative", edited: false, flag: "Normal", method: "RT-PCR", reagent: "Allplex SARS-CoV-2", instrument: "Abbott Alinity m", operator: "Selam Getachew", timestamp: "10:15 AM", isCritical: false, history: [] },
    ],
    qc: DEFAULT_QC,
    auditTrail: [
      { time: "09:12 AM", action: "Specimen collected", user: "Martha Alemu (Phlebotomy)" },
      { time: "09:45 AM", action: "Received at laboratory", user: "Dawit Mekonnen" },
      { time: "10:02 AM", action: "Analyzer results imported", user: "Sysmex XN-1000" },
      { time: "10:11 AM", action: "Manual entry — ALT, AST", user: "Selam Getachew" },
      { time: "10:20 AM", action: "Submitted for validation", user: "Selam Getachew" },
    ],
  },
  {
    id: "LAB-2026-000442", specimenId: "SPC-2026-08655", barcode: "8891234500442",
    patientName: "Marta Alemu", mrn: "MRN-2026-000567", age: 29, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu", priority: "STAT", status: "Pending Review",
    labSection: "Cardiology / Chemistry", analyzer: "Roche Cobas e411", technologist: "Dawit Mekonnen", validator: null,
    collectionTime: "05/21/2026 · 10:12 AM", processingTime: "05/21/2026 · 10:34 AM", completionTime: "05/21/2026 · 10:50 AM", collectedAtISO: "2026-05-21",
    turnaround: "38 min", insurance: "Self-Pay", bloodGroup: "O-", diagnosis: "Acute chest pain, rule out ACS", ward: "Emergency", visit: "ER-2026-001102",
    params: [
      { id: "tropo", testName: "Troponin", value: "0.52", unit: "ng/mL", refRange: "< 0.04", analyzerValue: "0.52", edited: false, flag: "Critical High", method: "Chemiluminescence", reagent: "Elecsys Troponin T hs", instrument: "Roche Cobas e411", operator: "Dawit Mekonnen", timestamp: "10:40 AM", isCritical: true, criticalThreshold: "> 0.4 ng/mL", notificationRequired: true, physicianNotified: true, notificationTime: "10:44 AM",
        history: [{ label: "Previous", value: "—" }, { label: "6 Months Ago", value: "—" }, { label: "1 Year Ago", value: "—" }] },
      { id: "k", testName: "Potassium", value: "2.8", unit: "mmol/L", refRange: "3.5 – 5.1", analyzerValue: "2.8", edited: false, flag: "Critical Low", method: "ISE", reagent: "ISE Standard", instrument: "Roche Cobas c311", operator: "Dawit Mekonnen", timestamp: "10:41 AM", isCritical: true, criticalThreshold: "< 2.9 mmol/L", notificationRequired: true, physicianNotified: false,
        history: [{ label: "Previous", value: "3.9" }, { label: "6 Months Ago", value: "4.1" }, { label: "1 Year Ago", value: "—" }] },
      { id: "wbc2", testName: "WBC", value: "9.1", unit: "×10⁹/L", refRange: "4.0 – 11.0", analyzerValue: "9.1", edited: false, flag: "Normal", method: "Flow Cytometry", reagent: "CELLPACK DCL", instrument: "Sysmex XN-1000 #1", operator: "Dawit Mekonnen", timestamp: "10:36 AM", isCritical: false, history: [] },
    ],
    qc: { ...DEFAULT_QC, instrumentAlerts: ["Reagent lot change logged — QC re-verified before run"] },
    auditTrail: [
      { time: "10:12 AM", action: "Specimen collected", user: "Dawit Mekonnen (ER Bay 3)" },
      { time: "10:34 AM", action: "Received at laboratory", user: "Dawit Mekonnen" },
      { time: "10:40 AM", action: "Analyzer results imported", user: "Roche Cobas e411" },
      { time: "10:44 AM", action: "Critical value called to ER physician", user: "Dawit Mekonnen" },
      { time: "10:50 AM", action: "Submitted for validation", user: "Dawit Mekonnen" },
    ],
  },
  {
    id: "LAB-2026-000418", specimenId: "SPC-2026-08380", barcode: "8891234500418",
    patientName: "Almaz Tesfaye", mrn: "MRN-2026-000901", age: 48, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu", priority: "STAT", status: "Under Review",
    labSection: "Microbiology / Hematology", analyzer: "BD BACTEC", technologist: "Dawit Mekonnen", validator: "Senior Technologist Martha Alemu",
    collectionTime: "05/21/2026 · 11:02 AM", processingTime: "05/21/2026 · 11:20 AM", completionTime: "05/21/2026 · 11:52 AM", collectedAtISO: "2026-05-21",
    turnaround: "50 min", insurance: "Woreda 07 CBHI", bloodGroup: "A+", diagnosis: "High-grade fever, rigors — rule out sepsis", ward: "Emergency", visit: "ER-2026-001098",
    params: [
      { id: "bcx", testName: "Blood Culture", value: "Positive", unit: "", refRange: "Negative", analyzerValue: null, edited: true, editedBy: "Dawit Mekonnen", flag: "Critical High", method: "Automated Culture (BACTEC)", reagent: "BACTEC Plus Aerobic/F", instrument: "BD BACTEC FX", operator: "Dawit Mekonnen", timestamp: "11:48 AM", isCritical: true, criticalThreshold: "Any growth", notificationRequired: true, physicianNotified: true, notificationTime: "11:55 AM", history: [] },
      { id: "wbc3", testName: "WBC", value: "16.4", unit: "×10⁹/L", refRange: "4.0 – 11.0", analyzerValue: "16.4", edited: false, flag: "High", method: "Flow Cytometry", reagent: "CELLPACK DCL", instrument: "Sysmex XN-1000 #1", operator: "Dawit Mekonnen", timestamp: "11:25 AM", isCritical: false, history: [{ label: "Previous", value: "7.6" }, { label: "6 Months Ago", value: "—" }, { label: "1 Year Ago", value: "—" }] },
      { id: "malaria", testName: "Malaria RDT", value: "Negative", unit: "", refRange: "Negative", analyzerValue: "Negative", edited: false, flag: "Normal", method: "Rapid Diagnostic Test", reagent: "CareStart Malaria HRP2", instrument: "—", operator: "Dawit Mekonnen", timestamp: "11:22 AM", isCritical: false, history: [] },
    ],
    qc: DEFAULT_QC,
    microbiology: {
      organism: "Gram-negative bacilli — preliminary identification pending (likely Enterobacteriaceae)",
      sensitivity: ["Ceftriaxone", "Meropenem", "Ciprofloxacin"],
      resistance: ["Ampicillin"],
      microscopicFindings: "Gram-negative rods seen on direct Gram stain from positive culture bottle.",
      pathologistNotes: "Recommend empiric broad-spectrum coverage pending final identification and full sensitivity panel (48–72h).",
    },
    auditTrail: [
      { time: "11:02 AM", action: "Specimen collected", user: "Dawit Mekonnen (ER Bay 1)" },
      { time: "11:20 AM", action: "Received at laboratory", user: "Dawit Mekonnen" },
      { time: "11:48 AM", action: "Manual entry — Blood Culture (Positive)", user: "Dawit Mekonnen" },
      { time: "11:55 AM", action: "Critical value called to ER physician", user: "Dawit Mekonnen" },
      { time: "12:02 PM", action: "Validation started", user: "Senior Technologist Martha Alemu" },
    ],
  },
  {
    id: "LAB-2026-000420", specimenId: "SPC-2026-08402", barcode: "8891234500420",
    patientName: "Yared Solomon", mrn: "MRN-2026-000342", age: 33, gender: "Male",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Rejected",
    labSection: "Virology", analyzer: "Abbott Alinity m", technologist: "Selam Getachew", validator: "Senior Technologist Martha Alemu",
    collectionTime: "05/16/2026 · 09:00 AM", processingTime: "05/16/2026 · 09:40 AM", completionTime: "05/16/2026 · 10:10 AM", collectedAtISO: "2026-05-16",
    turnaround: "1h 10m", insurance: "Self-Pay", bloodGroup: "B+", diagnosis: "Pre-employment screening", ward: "OPD", visit: "OPD-2026-000342",
    params: [
      { id: "covid2", testName: "COVID PCR", value: "Positive", unit: "", refRange: "Negative", analyzerValue: "Positive", edited: false, flag: "Critical High", method: "RT-PCR", reagent: "Allplex SARS-CoV-2", instrument: "Abbott Alinity m", operator: "Selam Getachew", timestamp: "09:55 AM", isCritical: true, criticalThreshold: "Any positive", notificationRequired: true, physicianNotified: true, notificationTime: "10:05 AM", history: [] },
    ],
    qc: { ...DEFAULT_QC, qcPassed: false, analyzerMessages: ["Specimen hemolyzed on receipt — result rejected, recollection requested."] },
    auditTrail: [
      { time: "09:00 AM", action: "Specimen collected", user: "External Clinic Staff" },
      { time: "09:40 AM", action: "Received at laboratory", user: "Dawit Mekonnen" },
      { time: "09:55 AM", action: "Analyzer results imported", user: "Abbott Alinity m" },
      { time: "10:10 AM", action: "Submitted for validation", user: "Selam Getachew" },
      { time: "10:25 AM", action: "Rejected — specimen hemolyzed, recollection requested", user: "Senior Technologist Martha Alemu" },
    ],
  },
  {
    id: "LAB-2026-000439", specimenId: "SPC-2026-08611", barcode: "8891234500439",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye", priority: "Routine", status: "Approved",
    labSection: "Hematology", analyzer: "Sysmex XN-1000", technologist: "Selam Getachew", validator: "Senior Technologist Martha Alemu",
    collectionTime: "05/19/2026 · 11:20 AM", processingTime: "05/19/2026 · 11:58 AM", completionTime: "05/19/2026 · 12:20 PM", collectedAtISO: "2026-05-19",
    turnaround: "1h 00m", insurance: "Self-Pay", bloodGroup: "A-", diagnosis: "Fatigue, rule out anemia", ward: "OPD", visit: "OPD-2026-000298",
    params: [
      { id: "wbc4", testName: "WBC", value: "6.8", unit: "×10⁹/L", refRange: "4.0 – 11.0", analyzerValue: "6.8", edited: false, flag: "Normal", method: "Flow Cytometry", reagent: "CELLPACK DCL", instrument: "Sysmex XN-1000 #2", operator: "Selam Getachew", timestamp: "12:05 PM", isCritical: false, history: [] },
      { id: "hgb4", testName: "Hemoglobin", value: "13.6", unit: "g/dL", refRange: "12.0 – 15.5", analyzerValue: "13.6", edited: false, flag: "Normal", method: "SLS-Hemoglobin", reagent: "SULFOLYSER", instrument: "Sysmex XN-1000 #2", operator: "Selam Getachew", timestamp: "12:05 PM", isCritical: false, history: [] },
    ],
    qc: DEFAULT_QC,
    auditTrail: [
      { time: "11:20 AM", action: "Specimen collected", user: "Selam Getachew" },
      { time: "12:20 PM", action: "Submitted for validation", user: "Selam Getachew" },
      { time: "12:34 PM", action: "Approved & released to physician", user: "Senior Technologist Martha Alemu" },
    ],
  },
  {
    id: "LAB-2026-000415", specimenId: "SPC-2026-08340", barcode: "8891234500415",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male",
    department: "Orthopedics", doctor: "Dr. Dawit Bekele", priority: "Routine", status: "Repeat Requested",
    labSection: "Chemistry", analyzer: "Roche Cobas c311", technologist: "Dawit Mekonnen", validator: "Senior Technologist Martha Alemu",
    collectionTime: "05/21/2026 · 08:50 AM", processingTime: "05/21/2026 · 09:15 AM", completionTime: "05/21/2026 · 09:40 AM", collectedAtISO: "2026-05-21",
    turnaround: "50 min", insurance: "Self-Pay", bloodGroup: "O+", diagnosis: "Joint pain and swelling, right knee", ward: "OPD", visit: "OPD-2026-000601",
    params: [
      { id: "esr", testName: "ESR", value: "24", unit: "mm/hr", refRange: "0 – 20", analyzerValue: "24", edited: false, flag: "Borderline", method: "Westergren", reagent: "—", instrument: "Manual Rack", operator: "Dawit Mekonnen", timestamp: "09:30 AM", isCritical: false, history: [{ label: "Previous", value: "—" }, { label: "6 Months Ago", value: "—" }, { label: "1 Year Ago", value: "—" }] },
      { id: "crp", testName: "CRP", value: "8.2", unit: "mg/L", refRange: "< 10", analyzerValue: "8.2", edited: false, flag: "Normal", method: "Immunoturbidimetric", reagent: "CRP Latex", instrument: "Roche Cobas c311", operator: "Dawit Mekonnen", timestamp: "09:32 AM", isCritical: false, history: [] },
    ],
    qc: { ...DEFAULT_QC, instrumentAlerts: ["Delta check flagged for ESR — repeat requested before release."] },
    auditTrail: [
      { time: "08:50 AM", action: "Specimen collected", user: "Dawit Mekonnen" },
      { time: "09:40 AM", action: "Submitted for validation", user: "Dawit Mekonnen" },
      { time: "09:58 AM", action: "Repeat test requested — delta check inconsistency", user: "Senior Technologist Martha Alemu" },
    ],
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["General Medicine", "Emergency", "Cardiology", "Orthopedics"];
const VALIDATORS = ["Senior Technologist Martha Alemu"];
const ANALYZERS = ["Sysmex XN-1000", "Roche Cobas e411", "Roche Cobas c311", "Abbott Alinity m", "BD BACTEC"];
const LAB_SECTIONS = ["Hematology", "Chemistry", "Hematology / Chemistry", "Cardiology / Chemistry", "Microbiology / Hematology", "Virology"];
const QUICK_STATUS_CHIPS = ["All", "Pending Review", "Critical", "Abnormal", "Analyzer Warning", "QC Failed", "Needs Repeat", "Rejected", "Approved", "STAT", "Routine"];
const CURRENT_VALIDATOR = "Senior Technologist Martha Alemu";

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

const VALIDATION_STATUS_STYLES: Record<ValidationStatus, string> = {
  "Pending Review": "bg-slate-100 text-slate-600",
  "Under Review": "bg-blue-50 text-blue-700",
  Approved: "bg-teal-700 text-white",
  Rejected: "bg-red-50 text-red-600",
  "Repeat Requested": "bg-amber-50 text-amber-700",
};

const FLAG_STYLES: Record<Flag, string> = {
  Normal: "bg-emerald-50 text-emerald-700",
  Borderline: "bg-amber-50 text-amber-700",
  High: "bg-amber-50 text-amber-700",
  Low: "bg-blue-50 text-blue-700",
  "Critical High": "bg-red-600 text-white",
  "Critical Low": "bg-red-600 text-white",
};

function matchesQuickStatus(c: ValidationCase, q: string): boolean {
  if (q === "All") return true;
  if (q === "Pending Review") return c.status === "Pending Review" || c.status === "Under Review";
  if (q === "Critical") return c.params.some((p) => isCriticalFlag(p.flag));
  if (q === "Abnormal") return c.params.some((p) => isAbnormalFlag(p.flag));
  if (q === "Analyzer Warning") return c.qc.instrumentAlerts.length > 0 || c.qc.analyzerMessages.length > 0;
  if (q === "QC Failed") return !c.qc.qcPassed;
  if (q === "Needs Repeat") return c.status === "Repeat Requested";
  if (q === "Rejected") return c.status === "Rejected";
  if (q === "Approved") return c.status === "Approved";
  if (q === "STAT" || q === "Routine") return c.priority === q;
  return true;
}

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof ClipboardList; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(cases: ValidationCase[]): KpiCard[] {
  const awaiting = cases.filter((c) => c.status === "Pending Review" || c.status === "Under Review").length;
  const approvedToday = cases.filter((c) => c.status === "Approved").length;
  const rejectedToday = cases.filter((c) => c.status === "Rejected").length;
  const criticalPending = cases.filter((c) => (c.status === "Pending Review" || c.status === "Under Review") && c.params.some((p) => isCriticalFlag(p.flag))).length;
  const repeatRequested = cases.filter((c) => c.status === "Repeat Requested").length;

  return [
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Awaiting Validation", value: String(awaiting), sublabel: "In the review queue", quickFilter: "Pending Review" },
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "Approved Today", value: String(approvedToday), sublabel: "Released to physicians", quickFilter: "Approved" },
    { icon: ClipboardX, iconBg: "bg-[#5C8E64]", label: "Rejected Today", value: String(rejectedToday), sublabel: "Needs recollection", quickFilter: "Rejected" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Critical Results Pending", value: String(criticalPending), sublabel: "Requires confirmation", quickFilter: "Critical" },
    { icon: Repeat, iconBg: "bg-[#627EC1]", label: "Repeat Tests Requested", value: String(repeatRequested), sublabel: "Awaiting recollection", quickFilter: "Needs Repeat" },
    { icon: Gauge, iconBg: "bg-[#216E6A]", label: "Avg. Validation Time", value: "14 min", sublabel: "Per case, last 7 days", quickFilter: "All" },
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

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Order Number" | "Barcode" | "Specimen ID" | "Visit Number" | "Doctor" | "Validator";

type ResultFilters = {
  searchBy: SearchField;
  query: string;
  department: string;
  labSection: string;
  priority: string;
  status: string;
  analyzer: string;
  queue: string;
  date: string;
};

const EMPTY_FILTERS: ResultFilters = {
  searchBy: "All Fields", query: "", department: "All", labSection: "All", priority: "All", status: "All", analyzer: "All Analyzers", queue: "All Queues", date: "",
};

const ADVANCED_DEFAULTS: Omit<ResultFilters, "searchBy" | "query"> = {
  department: "All", labSection: "All", priority: "All", status: "All", analyzer: "All Analyzers", queue: "All Queues", date: "",
};

function matchesSearch(o: ValidationCase, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName, MRN: o.mrn, "Order Number": o.id, Barcode: o.barcode, "Specimen ID": o.specimenId, "Visit Number": o.visit, Doctor: o.doctor, Validator: o.validator ?? "",
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(cases: ValidationCase[], f: ResultFilters, quickStatus: string): ValidationCase[] {
  return cases.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.labSection !== "All" && o.labSection !== f.labSection) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.status !== "All" && o.status !== f.status) return false;
    if (f.analyzer !== "All Analyzers" && o.analyzer !== f.analyzer) return false;
    if (f.queue === "My Queue" && o.validator !== CURRENT_VALIDATOR) return false;
    if (f.queue === "Unassigned" && o.validator !== null) return false;
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

function ValidationFilterBar({
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
            {(["All Fields", "Patient Name", "MRN", "Order Number", "Barcode", "Specimen ID", "Visit Number", "Doctor", "Validator"] as SearchField[]).map((o) => (
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
          aria-controls="result-validation-filters-panel"
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
          <div id="result-validation-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Laboratory Section" value={filters.labSection} onChange={(v) => onChange({ labSection: v })} options={["All", ...LAB_SECTIONS]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect label="Status" value={filters.status} onChange={(v) => onChange({ status: v })} options={["All", "Pending Review", "Under Review", "Approved", "Rejected", "Repeat Requested"]} />
            <ControlledSelect label="Analyzer" value={filters.analyzer} onChange={(v) => onChange({ analyzer: v })} options={["All Analyzers", ...ANALYZERS]} />
            <ControlledSelect label="Validation Queue" value={filters.queue} onChange={(v) => onChange({ queue: v })} options={["All Queues", "My Queue", "Unassigned"]} />
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

/* ---------- validation queue (left panel) ---------- */

function ValidatorStatusIcon({ status }: { status: ValidationStatus }) {
  if (status === "Approved") return <CircleCheckBig size={14} strokeWidth={2.25} className="text-teal-700" />;
  if (status === "Rejected") return <ClipboardX size={14} strokeWidth={2.25} className="text-red-600" />;
  if (status === "Repeat Requested") return <Repeat size={14} strokeWidth={2.25} className="text-amber-600" />;
  if (status === "Under Review") return <ClipboardList size={14} strokeWidth={2.25} className="text-blue-600" />;
  return <Hourglass size={14} strokeWidth={2.25} className="text-gray-400" />;
}

function QueueCard({ order, selected, onSelect }: { order: ValidationCase; selected: boolean; onSelect: () => void }) {
  const criticalCount = order.params.filter((p) => isCriticalFlag(p.flag)).length;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-2 text-left w-full rounded-lg border p-3 transition-colors ${PRIORITY_BORDER[order.priority]} ${
        selected ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[order.priority]}`}>{order.priority}</span>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-600">
              <ShieldAlert size={11} strokeWidth={2.5} /> {criticalCount}
            </span>
          )}
          <ValidatorStatusIcon status={order.status} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-slate-900 truncate">{order.patientName}</span>
        <span className="text-[11px] text-gray-400 truncate">{order.mrn} · {order.id}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
        <span>{order.params.length} tests</span>
        <span>{order.department}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400">
        <span>{order.analyzer}</span>
        <span>{order.completionTime.split(" · ")[1] ?? order.completionTime}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${VALIDATION_STATUS_STYLES[order.status]}`}>{order.status}</span>
        <span className="text-[10.5px] text-gray-400 truncate">{order.validator ?? "Unassigned"}</span>
      </div>
    </button>
  );
}

/* ---------- section heading (shared) ---------- */

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

function InfoRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold text-slate-800 text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/* ---------- center panel: clinical review workspace ---------- */

function ResultsReviewTable({ order, expandedParamId, onToggleExpand }: { order: ValidationCase; expandedParamId: string | null; onToggleExpand: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">Completed Results</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="p-2.5 w-7"></th>
              {["Test Name", "Result", "Unit", "Reference Range", "Analyzer Result", "Flag", "Status"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.params.map((p) => {
              const expanded = expandedParamId === p.id;
              return (
                <Fragment key={p.id}>
                  <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-2.5" onClick={() => onToggleExpand(p.id)}>
                      <button type="button" aria-expanded={expanded} aria-label="Toggle analyzer details" className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                        <Info size={14} strokeWidth={2.25} />
                      </button>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {p.testName}
                        {p.isCritical && <ShieldAlert size={13} strokeWidth={2.25} className="text-red-600 shrink-0" aria-label="Critical" />}
                        {isAbnormalFlag(p.flag) && !p.isCritical && <AlertTriangle size={12} strokeWidth={2.25} className="text-amber-500 shrink-0" aria-label="Abnormal" />}
                        {p.edited && (
                          <span title={`Manually entered by ${p.editedBy ?? "—"}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 rounded-full px-1.5 py-0.5">
                            <Pencil size={9} strokeWidth={2.5} /> Edited
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">{p.value}</td>
                    <td className="p-2.5 text-gray-500 whitespace-nowrap">{p.unit || "—"}</td>
                    <td className="p-2.5 text-gray-500 whitespace-nowrap">{p.refRange || "—"}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      {p.analyzerValue ? <span className="text-blue-600 font-semibold font-mono">{p.analyzerValue}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${FLAG_STYLES[p.flag]}`}>{p.flag}</span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Completed</span>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-[#FBFCFD] border-b border-gray-100">
                      <td colSpan={8} className="px-6 py-3">
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-gray-500">
                          <span><b className="text-slate-700 font-semibold">Method:</b> {p.method}</span>
                          <span><b className="text-slate-700 font-semibold">Reagent:</b> {p.reagent}</span>
                          <span><b className="text-slate-700 font-semibold">Instrument:</b> {p.instrument}</span>
                          <span><b className="text-slate-700 font-semibold">Operator:</b> {p.operator}</span>
                          <span><b className="text-slate-700 font-semibold">Timestamp:</b> {p.timestamp}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrendArrow({ current, previous }: { current: string; previous: string }) {
  const c = parseFloat(current);
  const p = parseFloat(previous);
  if (Number.isNaN(c) || Number.isNaN(p)) return <span className="text-gray-300">—</span>;
  if (c > p) return <ArrowUp size={13} strokeWidth={2.5} className="text-amber-600" />;
  if (c < p) return <ArrowDown size={13} strokeWidth={2.5} className="text-blue-600" />;
  return <Equal size={13} strokeWidth={2.5} className="text-gray-400" />;
}

function Sparkline({ points }: { points: string[] }) {
  const nums = points.map((p) => parseFloat(p)).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return <span className="text-gray-300 text-xs">—</span>;
  const max = Math.max(...nums);
  return (
    <div className="flex items-end gap-0.5 h-6 w-16">
      {points.map((p, i) => {
        const v = parseFloat(p);
        const h = !Number.isNaN(v) && max > 0 ? Math.max(15, (v / max) * 100) : 15;
        return <div key={i} className={`flex-1 rounded-t ${i === points.length - 1 ? "bg-teal-600" : "bg-gray-200"}`} style={{ height: `${h}%` }} />;
      })}
    </div>
  );
}

function HistoricalComparisonCard({ order }: { order: ValidationCase }) {
  const rowsWithHistory = order.params.filter((p) => p.history.length > 0);
  if (rowsWithHistory.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Historical Comparison" />
        <p className="text-xs text-gray-400">No prior results on file for this specimen&apos;s tests.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Historical Comparison" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Test", "Current", "Previous", "6 Months Ago", "1 Year Ago", "Trend", "Δ %", "Sparkline"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsWithHistory.map((p) => {
              const prev = p.history.find((h) => h.label === "Previous")?.value ?? "—";
              const sixMo = p.history.find((h) => h.label === "6 Months Ago")?.value ?? "—";
              const oneYr = p.history.find((h) => h.label === "1 Year Ago")?.value ?? "—";
              const cur = parseFloat(p.value);
              const prevNum = parseFloat(prev);
              const pct = !Number.isNaN(cur) && !Number.isNaN(prevNum) && prevNum !== 0 ? (((cur - prevNum) / prevNum) * 100).toFixed(1) : null;
              const significant = pct !== null && Math.abs(parseFloat(pct)) >= 15;
              return (
                <tr key={p.id} className={`border-b border-gray-50 last:border-0 ${significant ? "bg-amber-50/40" : ""}`}>
                  <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">{p.testName}</td>
                  <td className="p-2 font-semibold text-teal-700 whitespace-nowrap">{p.value} {p.unit}</td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{prev}</td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{sixMo}</td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{oneYr}</td>
                  <td className="p-2"><TrendArrow current={p.value} previous={prev} /></td>
                  <td className={`p-2 whitespace-nowrap font-semibold ${significant ? "text-amber-700" : "text-gray-500"}`}>{pct !== null ? `${parseFloat(pct) > 0 ? "+" : ""}${pct}%` : "—"}</td>
                  <td className="p-2"><Sparkline points={[oneYr, sixMo, prev, p.value]} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QcAnalyzerReviewCard({ qc }: { qc: QcInfo }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading
        icon={Wrench}
        iconTone={qc.qcPassed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}
        title="QC & Analyzer Review"
        action={<span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${qc.qcPassed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{qc.qcPassed ? "QC Passed" : "QC Failed"}</span>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-100">
        <div className="divide-y divide-gray-100">
          <InfoRow label="Calibration Status" value={qc.calibrationStatus} />
          <InfoRow label="Analyzer Status" value={qc.analyzerStatus} valueClass={qc.analyzerStatus === "Operational" ? "text-emerald-600" : "text-red-600"} />
          <InfoRow label="Control Range" value={qc.controlRange} />
          <InfoRow label="Maintenance Due" value={qc.maintenanceDue} />
        </div>
        <div className="divide-y divide-gray-100">
          <InfoRow label="Internal QC" value={qc.internalQc} />
          <InfoRow label="External QC" value={qc.externalQc} />
        </div>
      </div>
      {(qc.instrumentAlerts.length > 0 || qc.analyzerMessages.length > 0) && (
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
          {qc.instrumentAlerts.map((a) => (
            <div key={a} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
              <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
              <span>{a}</span>
            </div>
          ))}
          {qc.analyzerMessages.map((a) => (
            <div key={a} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              <ShieldAlert size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CriticalValueReviewCard({ order }: { order: ValidationCase }) {
  const criticalParams = order.params.filter((p) => p.isCritical);
  if (criticalParams.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} strokeWidth={2.25} className="text-red-600" />
        <h3 className="text-sm font-bold text-red-700">Critical Value Review</h3>
      </div>
      <div className="flex flex-col gap-2.5">
        {criticalParams.map((p) => (
          <div key={p.id} className="bg-white border border-red-100 rounded-md p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{p.testName} — {p.value} {p.unit}</span>
              <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${FLAG_STYLES[p.flag]}`}>{p.flag}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
              <span><b className="font-semibold text-slate-700">Threshold:</b> {p.criticalThreshold}</span>
              <span className="inline-flex items-center gap-1">
                <Bell size={12} strokeWidth={2.25} className={p.physicianNotified ? "text-emerald-600" : "text-red-600"} />
                {p.physicianNotified ? `Physician notified · ${p.notificationTime}` : "Physician notification required"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MicrobiologyCard({ report }: { report: MicrobiologyReport }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={Microscope} iconTone="bg-violet-50 text-violet-700" title="Microbiology / Pathology Support" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Organism</span>
          <span className="text-[13px] text-slate-700">{report.organism}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Sensitivity</span>
            <div className="flex flex-wrap gap-1.5">
              {report.sensitivity.map((s) => (
                <span key={s} className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Resistance</span>
            <div className="flex flex-wrap gap-1.5">
              {report.resistance.map((s) => (
                <span key={s} className="text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Microscopic Findings</span>
          <span className="text-[13px] text-slate-700">{report.microscopicFindings}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Pathologist Notes</span>
          <span className="text-[13px] text-slate-700">{report.pathologistNotes}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- right panel: decision support ---------- */

function PatientSummaryCard({ order }: { order: ValidationCase }) {
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
        <InfoRow label="Diagnosis" value={order.diagnosis} />
        <InfoRow label="Insurance" value={order.insurance} valueClass="text-emerald-600" />
        <InfoRow label="Ward" value={order.ward} />
      </div>
    </Card>
  );
}

function OrderSummaryCard({ order }: { order: ValidationCase }) {
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-violet-50 text-violet-600" title="Order Summary" />
      <div className="divide-y divide-gray-100">
        <InfoRow label="Ordering Doctor" value={order.doctor} />
        <InfoRow label="Department" value={order.department} />
        <InfoRow label="Specimen" value={order.specimenId} />
        <InfoRow label="Collection Time" value={order.collectionTime} />
        <InfoRow label="Analyzer" value={order.analyzer} />
        <InfoRow label="Technologist" value={order.technologist} />
        <InfoRow label="Processing Time" value={order.processingTime} />
        <InfoRow label="Turnaround Time" value={order.turnaround} />
      </div>
    </Card>
  );
}

const CHECKLIST_ITEMS = [
  "QC Passed",
  "Reference Range Reviewed",
  "Historical Comparison Reviewed",
  "Analyzer Warning Reviewed",
  "Critical Value Checked",
  "Patient Identity Verified",
  "Comments Added",
] as const;

function ValidationChecklistCard({ checklist, onToggle }: { checklist: Record<string, boolean>; onToggle: (item: string) => void }) {
  const completedCount = CHECKLIST_ITEMS.filter((i) => checklist[i]).length;
  return (
    <Card>
      <SectionHeading
        icon={ClipboardCheck}
        iconTone={completedCount === CHECKLIST_ITEMS.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}
        title="Validation Checklist"
        action={<span className="text-xs font-semibold text-gray-400">{completedCount} / {CHECKLIST_ITEMS.length}</span>}
      />
      <div className="flex flex-col gap-1">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!checklist[item];
          return (
            <button key={item} type="button" onClick={() => onToggle(item)} className="flex items-center gap-2.5 py-1.5 text-left select-none">
              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
                {checked && <Check size={11} strokeWidth={3} className="text-white" />}
              </span>
              <span className={`text-sm ${checked ? "text-slate-700" : "text-slate-600"}`}>{item}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function deltaCheckResult(order: ValidationCase): string {
  const significant = order.params.find((p) => {
    const prev = p.history.find((h) => h.label === "Previous")?.value;
    const cur = parseFloat(p.value);
    const prevNum = prev ? parseFloat(prev) : NaN;
    if (Number.isNaN(cur) || Number.isNaN(prevNum) || prevNum === 0) return false;
    return Math.abs(((cur - prevNum) / prevNum) * 100) >= 15;
  });
  return significant ? `Significant shift detected in ${significant.testName} vs. previous result.` : "No clinically significant delta detected.";
}

function ClinicalDecisionSupportCard({ order }: { order: ValidationCase }) {
  const abnormalParams = order.params.filter((p) => isAbnormalFlag(p.flag));
  const repeatRecommended = order.qc.instrumentAlerts.some((a) => a.toLowerCase().includes("delta") || a.toLowerCase().includes("repeat"));
  return (
    <Card>
      <SectionHeading icon={FlaskConical} iconTone="bg-teal-50 text-teal-700" title="Clinical Decision Support" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Suggested Interpretation</span>
          <span className="text-[13px] text-slate-700">
            {abnormalParams.length === 0 ? "All parameters within expected reference ranges." : `${abnormalParams.length} parameter${abnormalParams.length > 1 ? "s" : ""} outside reference range — correlate with ${order.diagnosis.toLowerCase()}.`}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Delta Check Result</span>
          <span className="text-[13px] text-slate-700">{deltaCheckResult(order)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Repeat Recommendation</span>
          <span className="text-[13px] text-slate-700">{repeatRecommended ? "Repeat testing recommended before release." : "No repeat testing recommended."}</span>
        </div>
        {abnormalParams.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Clinical Alerts</span>
            <div className="flex flex-wrap gap-1.5">
              {abnormalParams.map((p) => (
                <span key={p.id} className={`text-xs font-semibold rounded-full px-2 py-0.5 ${FLAG_STYLES[p.flag]}`}>{p.testName} {p.flag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function AuditTrailCard({ events }: { events: AuditEvent[] }) {
  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-gray-100 text-gray-600" title="Audit Trail" />
      <div className="flex flex-col">
        {events.map((e, i) => (
          <div key={`${e.time}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full shrink-0 bg-gray-300" />
              {i < events.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
            </div>
            <div className="flex flex-col pb-3 min-w-0">
              <span className="text-[11px] font-bold text-gray-400 tabular-nums">{e.time}</span>
              <span className="text-[13px] font-semibold text-slate-800">{e.action}</span>
              <span className="text-[11px] text-gray-500">{e.user}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionTile({ icon: Icon, label, tone, disabled, onClick }: { icon: typeof Printer; label: string; tone: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1.5 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}>
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function QuickActionsCard({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <Card>
      <SectionHeading icon={ClipboardCheck} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={CircleCheckBig} label="Approve Results" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" onClick={onApprove} />
        <QuickActionTile icon={ClipboardX} label="Reject Results" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" onClick={onReject} />
        <QuickActionTile icon={Repeat} label="Request Repeat Test" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" onClick={onReject} />
        <QuickActionTile icon={TestTube} label="Request Recollection" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={onReject} />
        <QuickActionTile icon={MessageSquare} label="Add Validation Comment" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={FileText} label="View Investigation Order" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={History} label="View Patient Timeline" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
        <QuickActionTile icon={Printer} label="Print Report Preview" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
      </div>
    </Card>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <UserPlus size={15} strokeWidth={2.25} /> Assign Validator
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Review Sheet
      </button>
    </div>
  );
}

/* ---------- dialogs ---------- */

function DialogShell({ children, onClose, labelledBy }: { children: React.ReactNode; onClose: () => void; labelledBy: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[80vh]">
        {children}
      </div>
    </div>
  );
}

function ApprovalDialog({ order, onClose, onConfirm }: { order: ValidationCase; onClose: () => void; onConfirm: (comment: string) => void }) {
  const [signed, setSigned] = useState(false);
  const [comment, setComment] = useState("");
  const criticalCount = order.params.filter((p) => isCriticalFlag(p.flag)).length;

  return (
    <DialogShell onClose={onClose} labelledBy="approve-dialog-title">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <h2 id="approve-dialog-title" className="text-base font-bold text-slate-900">Approve &amp; Release Results</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
          <InfoRow label="Patient" value={order.patientName} />
          <InfoRow label="MRN" value={order.mrn} />
          <InfoRow label="Tests" value={`${order.params.length} results`} />
          <InfoRow label="Critical Results" value={String(criticalCount)} valueClass={criticalCount > 0 ? "text-red-600" : "text-emerald-600"} />
        </div>
        {criticalCount > 0 && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            <ShieldAlert size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
            <span>This case includes {criticalCount} critical result{criticalCount > 1 ? "s" : ""}. Confirm the physician has been notified before approving.</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>Validator Name</FieldLabel>
          <div className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}>{CURRENT_VALIDATOR}</div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Approval Comment (optional)</FieldLabel>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Add any notes for the release record…" className={`${inputClass} resize-none`} />
        </div>
        <button type="button" onClick={() => setSigned((v) => !v)} className="flex items-center gap-2.5 text-left select-none">
          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${signed ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
            {signed && <Check size={11} strokeWidth={3} className="text-white" />}
          </span>
          <span className="text-sm text-slate-700">I apply my digital signature as {CURRENT_VALIDATOR} and confirm this result is ready for release.</span>
        </button>
      </div>
      <div className="shrink-0 px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-slate-700 hover:bg-gray-50 transition-colors">Cancel</button>
        <button
          type="button"
          disabled={!signed}
          onClick={() => onConfirm(comment)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white transition-colors"
        >
          <CircleCheckBig size={15} strokeWidth={2.25} /> Approve
        </button>
      </div>
    </DialogShell>
  );
}

const REJECTION_REASONS = ["Repeat Test Required", "Recollection Required", "Analyzer Issue", "QC Failure", "Other"];

function RejectionDialog({ order, onClose, onConfirm }: { order: ValidationCase; onClose: () => void; onConfirm: (reason: string, comment: string) => void }) {
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [comment, setComment] = useState("");
  const canSubmit = comment.trim().length > 0;

  return (
    <DialogShell onClose={onClose} labelledBy="reject-dialog-title">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <h2 id="reject-dialog-title" className="text-base font-bold text-slate-900">Reject Results</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-1">
          <InfoRow label="Patient" value={order.patientName} />
          <InfoRow label="Order" value={order.id} />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel required>Reason</FieldLabel>
          <div className="relative">
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} pr-8 appearance-none bg-white`}>
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel required>Comment</FieldLabel>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Explain why these results are being rejected…" className={`${inputClass} resize-none`} />
          {!canSubmit && <span className="text-[11px] text-gray-400">A comment is required before this rejection can be submitted.</span>}
        </div>
      </div>
      <div className="shrink-0 px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-slate-700 hover:bg-gray-50 transition-colors">Cancel</button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onConfirm(reason, comment)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white transition-colors"
        >
          <ClipboardX size={15} strokeWidth={2.25} /> Submit Rejection
        </button>
      </div>
    </DialogShell>
  );
}

/* ---------- page ---------- */

export default function ResultValidationForm() {
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_FILTERS);
  const [quickStatus, setQuickStatus] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(VALIDATION_CASES[0].id);
  const [casesState, setCasesState] = useState<ValidationCase[]>(VALIDATION_CASES);
  const [expandedParamId, setExpandedParamId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  const kpiCards = useMemo(() => buildKpiCards(casesState), [casesState]);

  const filteredCases = useMemo(() => {
    const rows = applyFilters(casesState, filters, quickStatus);
    const priorityRank: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 };
    return [...rows].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [casesState, filters, quickStatus]);

  const selectedCase = casesState.find((c) => c.id === selectedCaseId) ?? casesState[0];

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setExpandedParamId(null);
    setChecklist({});
  };

  const handleChange = (partial: Partial<ResultFilters>) => setFilters((prev) => ({ ...prev, ...partial }));
  const handleQuickStatus = (q: string) => setQuickStatus(q);
  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
  };

  const toggleChecklistItem = (item: string) => setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));

  const updateCaseStatus = (id: string, status: ValidationStatus, auditAction: string) => {
    setCasesState((prev) =>
      prev.map((c) =>
        c.id !== id
          ? c
          : { ...c, status, validator: CURRENT_VALIDATOR, auditTrail: [...c.auditTrail, { time: "Just now", action: auditAction, user: CURRENT_VALIDATOR }] }
      )
    );
  };

  const handleApprove = () => setDialog("approve");
  const handleReject = () => setDialog("reject");

  const confirmApprove = () => {
    updateCaseStatus(selectedCaseId, "Approved", "Approved & released to physician");
    setDialog(null);
  };

  const confirmReject = (reason: string, comment: string) => {
    const nextStatus: ValidationStatus = reason === "Repeat Test Required" ? "Repeat Requested" : "Rejected";
    updateCaseStatus(selectedCaseId, nextStatus, `${nextStatus === "Repeat Requested" ? "Repeat test requested" : "Rejected"} — ${reason}: ${comment}`);
    setDialog(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Laboratory Result Validation"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Result Validation"
          subtitle="Review completed laboratory findings, compare historical trends, verify quality control, and approve results before release."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickStatus} />

        <ValidationFilterBar
          filters={filters}
          clearKey={clearKey}
          quickStatus={quickStatus}
          onChange={handleChange}
          onQuickStatus={handleQuickStatus}
          onClearAdvanced={handleClearAdvanced}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[25fr_50fr_25fr] gap-4 items-start">
          {/* LEFT — Validation Queue */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800">Validation Queue</h2>
              <span className="text-xs text-gray-400">{filteredCases.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {filteredCases.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-10 text-center text-sm text-gray-400">No cases match the current filters.</div>
              ) : (
                filteredCases.map((c) => <QueueCard key={c.id} order={c} selected={c.id === selectedCaseId} onSelect={() => handleSelectCase(c.id)} />)
              )}
            </div>
          </div>

          {/* CENTER — Clinical Review Workspace */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center gap-4 flex-wrap">
              <Avatar initials={initialsOf(selectedCase.patientName)} />
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-900">{selectedCase.patientName}</span>
                <span className="text-xs text-gray-400">{selectedCase.mrn} · {selectedCase.age} · {selectedCase.gender} · {selectedCase.diagnosis}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[selectedCase.priority]}`}>{selectedCase.priority}</span>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${VALIDATION_STATUS_STYLES[selectedCase.status]}`}>{selectedCase.status}</span>
              </div>
            </div>

            <ResultsReviewTable order={selectedCase} expandedParamId={expandedParamId} onToggleExpand={(id) => setExpandedParamId((prev) => (prev === id ? null : id))} />

            <CriticalValueReviewCard order={selectedCase} />

            <HistoricalComparisonCard order={selectedCase} />

            <QcAnalyzerReviewCard qc={selectedCase.qc} />

            {selectedCase.microbiology && <MicrobiologyCard report={selectedCase.microbiology} />}
          </div>

          {/* RIGHT — Decision Support Panel */}
          <div className="flex flex-col gap-4 min-w-0">
            <PatientSummaryCard order={selectedCase} />
            <OrderSummaryCard order={selectedCase} />
            <ValidationChecklistCard checklist={checklist} onToggle={toggleChecklistItem} />
            <ClinicalDecisionSupportCard order={selectedCase} />
            <AuditTrailCard events={selectedCase.auditTrail} />
            <QuickActionsCard onApprove={handleApprove} onReject={handleReject} />
          </div>
        </div>
      </div>

      <StickyFooter
        left={
          <>
            <FooterButton tone="danger">Cancel</FooterButton>
            <FooterButton tone="info">Save Review</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="danger" onClick={handleReject}>
              <ClipboardX size={15} strokeWidth={2.25} /> Reject
            </FooterButton>
            <FooterButton tone="neutral" onClick={handleReject}>
              <Repeat size={15} strokeWidth={2.25} /> Request Repeat
            </FooterButton>
            <button type="button" onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <Send size={15} strokeWidth={2.25} />
              Approve &amp; Release to Physician
            </button>
          </>
        }
      />

      {dialog === "approve" && <ApprovalDialog order={selectedCase} onClose={() => setDialog(null)} onConfirm={confirmApprove} />}
      {dialog === "reject" && <RejectionDialog order={selectedCase} onClose={() => setDialog(null)} onConfirm={confirmReject} />}
    </div>
  );
}
