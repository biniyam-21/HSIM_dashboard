"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  ClipboardList,
  ClipboardCheck,
  Hourglass,
  FlaskConical,
  CircleCheckBig,
  RefreshCw,
  Printer,
  Download,
  Upload,
  Check,
  Filter,
  FilterX,
  ShieldAlert,
  ShieldOff,
  AlertTriangle,
  FileText,
  History,
  TestTube,
  Thermometer,
  Wrench,
  Gauge,
  Target,
  Award,
  Percent,
  TrendingUp,
  TrendingDown,
  Minus,
  ChartLine,
  ChartColumn,
  Server,
  RotateCw,
  Send,
  Play,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Quality Control.
   Enterprise laboratory quality operations dashboard: IQC/EQA monitoring,
   Levey-Jennings control charts, Westgard rule evaluation, calibration
   tracking, corrective actions, and compliance — analytical, not transactional.
   ========================================================================== */

/* ---------- types ---------- */

type QcStatus = "Pass" | "Fail" | "Warning";
type WestgardRuleId = "1-2s" | "1-3s" | "2-2s" | "R-4s" | "4-1s" | "10x";
type CalibrationOutcome = "Scheduled" | "Running" | "Completed" | "Expired" | "Failed";
type CorrectiveStatus = "Open" | "In Progress" | "Resolved";
type CorrectivePriority = "Low" | "Medium" | "High" | "Critical";
type ComplianceStatus = "Compliant" | "Attention" | "Non-Compliant";

type QcPoint = { run: number; value: number; date: string; status: QcStatus; violatedRule?: WestgardRuleId };

type QcLevel = {
  level: string;
  controlMaterial: string;
  lotNumber: string;
  mean: number;
  sd: number;
  unit: string;
  points: QcPoint[];
};

type AnalyzerQC = {
  id: string;
  name: string;
  department: string;
  manufacturer: string;
  status: "Online" | "Offline" | "Maintenance";
  qcStatus: QcStatus;
  calibrationStatus: "Current" | "Due" | "Overdue" | "Failed";
  lastQc: string;
  nextQc: string;
  reagentLot: string;
  temperature: string;
  reliabilityScore: number;
  qcPassRate: number;
  testName: string;
  levels: QcLevel[];
};

type WestgardViolation = { rule: WestgardRuleId; analyzer: string; timestamp: string; severity: "warning" | "critical"; description: string; active: boolean };

type CalibrationEvent = { date: string; analyzer: string; operator: string; outcome: CalibrationOutcome };

type CorrectiveAction = { id: string; issue: string; assignedTo: string; priority: CorrectivePriority; dueDate: string; status: CorrectiveStatus; progress: number; analyzer: string };

type ReagentLot = { name: string; analyzer: string; lotNumber: string; expiryDate: string; remainingVolumePct: number; usageTrend: "up" | "down" | "stable"; lowStock: boolean };

type QcHistoryEntry = { analyzer: string; result: string; technician: string; date: string; outcome: QcStatus };

type ComplianceItem = { label: string; score: number; status: ComplianceStatus };

/* ---------- mock QC point generation ---------- */

function genPoints(mean: number, sd: number, pattern: ("normal" | "shift" | "trend" | "1-3s" | "1-2s")[]): QcPoint[] {
  const points: QcPoint[] = [];
  const dates = ["05/12", "05/13", "05/14", "05/15", "05/16", "05/17", "05/18", "05/19", "05/20", "05/21"];
  let run = 1;
  pattern.forEach((p, idx) => {
    let value = mean;
    let status: QcStatus = "Pass";
    let violatedRule: WestgardRuleId | undefined;
    if (p === "normal") value = mean + (Math.sin(idx * 1.7) * 0.6) * sd;
    if (p === "shift") value = mean + 1.4 * sd;
    if (p === "trend") value = mean + (idx % 5) * 0.3 * sd;
    if (p === "1-3s") { value = mean + 3.3 * sd; status = "Fail"; violatedRule = "1-3s"; }
    if (p === "1-2s") { value = mean + 2.2 * sd; status = "Warning"; violatedRule = "1-2s"; }
    points.push({ run, value: Math.round(value * 100) / 100, date: dates[idx % dates.length], status, violatedRule });
    run++;
  });
  return points;
}

/* ---------- mock data ---------- */

const ANALYZERS: AnalyzerQC[] = [
  {
    id: "an-sysmex", name: "Sysmex XN-550", department: "Hematology", manufacturer: "Sysmex Corporation",
    status: "Online", qcStatus: "Pass", calibrationStatus: "Current", lastQc: "05/21/2026 · 07:00 AM", nextQc: "05/22/2026 · 07:00 AM",
    reagentLot: "CELLPACK-2026-041", temperature: "22.4°C", reliabilityScore: 98, qcPassRate: 97, testName: "WBC",
    levels: [
      { level: "Level 1 (Normal)", controlMaterial: "Sysmex XN Check LN", lotNumber: "LN-2026-0088", mean: 7.5, sd: 0.3, unit: "×10⁹/L", points: genPoints(7.5, 0.3, ["normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal"]) },
      { level: "Level 2 (Abnormal)", controlMaterial: "Sysmex XN Check LH", lotNumber: "LH-2026-0091", mean: 14.2, sd: 0.5, unit: "×10⁹/L", points: genPoints(14.2, 0.5, ["normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
  {
    id: "an-cobasc311", name: "Cobas C311", department: "Chemistry", manufacturer: "Roche Diagnostics",
    status: "Online", qcStatus: "Warning", calibrationStatus: "Current", lastQc: "05/21/2026 · 08:00 AM", nextQc: "05/22/2026 · 08:00 AM",
    reagentLot: "GLUC-2026-118", temperature: "23.1°C", reliabilityScore: 91, qcPassRate: 88, testName: "Blood Glucose",
    levels: [
      { level: "Level 1 (Normal)", controlMaterial: "PreciControl ClinChem 1", lotNumber: "PCC1-2026-0234", mean: 95, sd: 3, unit: "mg/dL", points: genPoints(95, 3, ["normal", "normal", "normal", "normal", "1-2s", "normal", "normal", "normal", "normal", "normal"]) },
      { level: "Level 2 (Elevated)", controlMaterial: "PreciControl ClinChem 2", lotNumber: "PCC2-2026-0198", mean: 210, sd: 6, unit: "mg/dL", points: genPoints(210, 6, ["normal", "normal", "trend", "trend", "trend", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
  {
    id: "an-cobase411", name: "Cobas e411", department: "Immunology", manufacturer: "Roche Diagnostics",
    status: "Online", qcStatus: "Pass", calibrationStatus: "Due", lastQc: "05/21/2026 · 09:00 AM", nextQc: "05/22/2026 · 09:00 AM",
    reagentLot: "TROP-2026-076", temperature: "21.9°C", reliabilityScore: 95, qcPassRate: 96, testName: "Troponin",
    levels: [
      { level: "Level 1 (Low)", controlMaterial: "PreciControl Cardiac 1", lotNumber: "PCCA1-2026-0055", mean: 0.02, sd: 0.004, unit: "ng/mL", points: genPoints(0.02, 0.004, ["normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
  {
    id: "an-mindray", name: "Mindray BC-6800", department: "Hematology", manufacturer: "Mindray",
    status: "Maintenance", qcStatus: "Fail", calibrationStatus: "Overdue", lastQc: "05/19/2026 · 06:00 AM", nextQc: "05/21/2026 (Overdue)",
    reagentLot: "CELLPACK-2026-039", temperature: "24.6°C", reliabilityScore: 62, qcPassRate: 74, testName: "Platelets",
    levels: [
      { level: "Level 1 (Normal)", controlMaterial: "Mindray M-51 Control", lotNumber: "M51-2026-0071", mean: 250, sd: 12, unit: "×10⁹/L", points: genPoints(250, 12, ["normal", "normal", "normal", "1-2s", "1-3s", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
  {
    id: "an-genexpert", name: "GeneXpert", department: "Microbiology / Molecular", manufacturer: "Cepheid",
    status: "Online", qcStatus: "Pass", calibrationStatus: "Current", lastQc: "05/21/2026 · 06:30 AM", nextQc: "05/22/2026 · 06:30 AM",
    reagentLot: "XPERT-COV-2026-014", temperature: "23.4°C", reliabilityScore: 99, qcPassRate: 99, testName: "COVID PCR Ct Value",
    levels: [
      { level: "Positive Control", controlMaterial: "Xpert SARS-CoV-2 Control", lotNumber: "XCC-2026-0033", mean: 24.5, sd: 0.6, unit: "Ct", points: genPoints(24.5, 0.6, ["normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
  {
    id: "an-abbott", name: "Abbott Architect i1000", department: "Immunology", manufacturer: "Abbott Diagnostics",
    status: "Offline", qcStatus: "Fail", calibrationStatus: "Failed", lastQc: "05/21/2026 · 08:20 AM", nextQc: "Pending reconnect",
    reagentLot: "HBSAG-2026-029", temperature: "—", reliabilityScore: 54, qcPassRate: 68, testName: "HBsAg",
    levels: [
      { level: "Level 1 (Negative)", controlMaterial: "Architect HBsAg Control", lotNumber: "AHC-2026-0019", mean: 0.05, sd: 0.01, unit: "S/CO", points: genPoints(0.05, 0.01, ["normal", "normal", "1-3s", "1-3s", "normal", "normal", "normal", "normal", "normal", "normal"]) },
    ],
  },
];

const WESTGARD_RULES: { id: WestgardRuleId; description: string }[] = [
  { id: "1-2s", description: "One control observation exceeds ±2SD (warning rule)." },
  { id: "1-3s", description: "One control observation exceeds ±3SD (rejection rule)." },
  { id: "2-2s", description: "Two consecutive control observations exceed the same ±2SD limit." },
  { id: "R-4s", description: "Range between two consecutive controls exceeds 4SD." },
  { id: "4-1s", description: "Four consecutive control observations exceed the same ±1SD limit." },
  { id: "10x", description: "Ten consecutive control observations fall on the same side of the mean." },
];

const WESTGARD_VIOLATIONS: WestgardViolation[] = [
  { rule: "1-3s", analyzer: "Abbott Architect i1000", timestamp: "05/21/2026 · 08:20 AM", severity: "critical", description: "HBsAg Level 1 control exceeded +3SD — QC rejected, analyzer taken offline.", active: true },
  { rule: "1-3s", analyzer: "Mindray BC-6800", timestamp: "05/19/2026 · 06:10 AM", severity: "critical", description: "Platelets Level 1 control exceeded +3SD — analyzer sent for maintenance.", active: true },
  { rule: "1-2s", analyzer: "Mindray BC-6800", timestamp: "05/18/2026 · 06:05 AM", severity: "warning", description: "Platelets Level 1 control exceeded +2SD — flagged for review.", active: true },
  { rule: "1-2s", analyzer: "Cobas C311", timestamp: "05/16/2026 · 08:05 AM", severity: "warning", description: "Blood Glucose Level 1 control exceeded +2SD — within acceptable single-point tolerance.", active: false },
  { rule: "4-1s", analyzer: "Cobas C311", timestamp: "05/18/2026 · 08:00 AM", severity: "warning", description: "Blood Glucose Level 2 control trending — 3 of 4 points above +1SD, monitor closely.", active: true },
  { rule: "2-2s", analyzer: "Sysmex XN-550", timestamp: "04/28/2026 · 07:00 AM", severity: "warning", description: "Resolved — WBC Level 1 control, reagent lot changed and re-verified.", active: false },
];

const CALIBRATION_TIMELINE: CalibrationEvent[] = [
  { date: "05/22/2026 · 07:00 AM", analyzer: "Cobas e411", operator: "Dawit Mekonnen", outcome: "Scheduled" },
  { date: "05/21/2026 · 08:15 AM", analyzer: "Mindray BC-6800", operator: "Dawit Mekonnen", outcome: "Running" },
  { date: "05/21/2026 · 06:30 AM", analyzer: "GeneXpert", operator: "Selam Getachew", outcome: "Completed" },
  { date: "05/21/2026 · 07:00 AM", analyzer: "Sysmex XN-550", operator: "Selam Getachew", outcome: "Completed" },
  { date: "05/20/2026 · 07:00 AM", analyzer: "Mindray BC-6800", operator: "Dawit Mekonnen", outcome: "Expired" },
  { date: "05/19/2026 · 09:00 AM", analyzer: "Abbott Architect i1000", operator: "Dawit Mekonnen", outcome: "Failed" },
];

const CORRECTIVE_ACTIONS: CorrectiveAction[] = [
  { id: "CA-2026-0031", issue: "Abbott Architect i1000 — repeated 1-3s violations, HBsAg control", assignedTo: "Biomedical Engineer — Yonas Tadesse", priority: "Critical", dueDate: "05/22/2026", status: "Open", progress: 20, analyzer: "Abbott Architect i1000" },
  { id: "CA-2026-0030", issue: "Mindray BC-6800 — Platelets control failure, scheduled recalibration", assignedTo: "Dawit Mekonnen", priority: "High", dueDate: "05/21/2026 (Today)", status: "In Progress", progress: 55, analyzer: "Mindray BC-6800" },
  { id: "CA-2026-0028", issue: "Cobas C311 — Blood Glucose Level 2 trending above +1SD", assignedTo: "Selam Getachew", priority: "Medium", dueDate: "05/23/2026", status: "Open", progress: 10, analyzer: "Cobas C311" },
  { id: "CA-2026-0025", issue: "Sysmex XN-550 — WBC Level 1 2-2s violation, reagent lot verified", assignedTo: "Selam Getachew", priority: "Low", dueDate: "04/29/2026", status: "Resolved", progress: 100, analyzer: "Sysmex XN-550" },
];

const REAGENT_LOTS: ReagentLot[] = [
  { name: "CELLPACK DCL", analyzer: "Sysmex XN-550", lotNumber: "CELLPACK-2026-041", expiryDate: "09/30/2026", remainingVolumePct: 62, usageTrend: "down", lowStock: false },
  { name: "Glucose HK Reagent", analyzer: "Cobas C311", lotNumber: "GLUC-2026-118", expiryDate: "07/15/2026", remainingVolumePct: 18, usageTrend: "down", lowStock: true },
  { name: "Elecsys Troponin T hs", analyzer: "Cobas e411", lotNumber: "TROP-2026-076", expiryDate: "08/01/2026", remainingVolumePct: 74, usageTrend: "stable", lowStock: false },
  { name: "Xpert SARS-CoV-2 Cartridge", analyzer: "GeneXpert", lotNumber: "XPERT-COV-2026-014", expiryDate: "06/20/2026", remainingVolumePct: 41, usageTrend: "down", lowStock: false },
  { name: "Architect HBsAg Reagent", analyzer: "Abbott Architect i1000", lotNumber: "HBSAG-2026-029", expiryDate: "05/25/2026", remainingVolumePct: 9, usageTrend: "down", lowStock: true },
];

const QC_HISTORY: QcHistoryEntry[] = [
  { analyzer: "Sysmex XN-550", result: "WBC 7.4 ×10⁹/L", technician: "Selam Getachew", date: "05/21 07:00 AM", outcome: "Pass" },
  { analyzer: "Cobas C311", result: "Blood Glucose 96 mg/dL", technician: "Dawit Mekonnen", date: "05/21 08:00 AM", outcome: "Warning" },
  { analyzer: "Cobas e411", result: "Troponin 0.019 ng/mL", technician: "Dawit Mekonnen", date: "05/21 09:00 AM", outcome: "Pass" },
  { analyzer: "Mindray BC-6800", result: "Platelets 268 ×10⁹/L", technician: "Dawit Mekonnen", date: "05/19 06:00 AM", outcome: "Fail" },
  { analyzer: "GeneXpert", result: "COVID PCR Ct 24.3", technician: "Selam Getachew", date: "05/21 06:30 AM", outcome: "Pass" },
  { analyzer: "Abbott Architect i1000", result: "HBsAg 0.16 S/CO", technician: "Dawit Mekonnen", date: "05/21 08:20 AM", outcome: "Fail" },
];

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { label: "CAP Compliance", score: 94, status: "Compliant" },
  { label: "ISO 15189", score: 91, status: "Compliant" },
  { label: "CLIA", score: 88, status: "Attention" },
  { label: "Hospital Policy", score: 97, status: "Compliant" },
  { label: "Audit Readiness", score: 82, status: "Attention" },
];

const DEPARTMENTS = ["Hematology", "Chemistry", "Immunology", "Microbiology / Molecular"];
const MANUFACTURERS = ["Sysmex Corporation", "Roche Diagnostics", "Mindray", "Cepheid", "Abbott Diagnostics"];
const QUICK_STATUS_CHIPS = ["All", "Passed", "Failed", "Warning", "Critical", "Calibration Due", "Maintenance", "Corrective Action"];

/* ---------- style maps ---------- */

const QC_STATUS_STYLES: Record<QcStatus, string> = {
  Pass: "bg-emerald-50 text-emerald-700",
  Fail: "bg-red-600 text-white",
  Warning: "bg-amber-50 text-amber-700",
};

const CALIBRATION_STYLES: Record<AnalyzerQC["calibrationStatus"], string> = {
  Current: "bg-emerald-50 text-emerald-700",
  Due: "bg-amber-50 text-amber-700",
  Overdue: "bg-red-50 text-red-600",
  Failed: "bg-red-600 text-white",
};

const CALIBRATION_EVENT_STYLES: Record<CalibrationOutcome, { tone: string; dot: string }> = {
  Scheduled: { tone: "bg-slate-100 text-slate-600", dot: "bg-gray-300" },
  Running: { tone: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  Completed: { tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Expired: { tone: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Failed: { tone: "bg-red-50 text-red-600", dot: "bg-red-600" },
};

const PRIORITY_STYLES: Record<CorrectivePriority, string> = {
  Low: "bg-teal-50 text-teal-700",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-amber-50 text-amber-700",
  Critical: "bg-red-600 text-white",
};

const CORRECTIVE_STATUS_STYLES: Record<CorrectiveStatus, string> = {
  Open: "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

const COMPLIANCE_STATUS_STYLES: Record<ComplianceStatus, string> = {
  Compliant: "bg-emerald-50 text-emerald-700",
  Attention: "bg-amber-50 text-amber-700",
  "Non-Compliant": "bg-red-50 text-red-600",
};

function matchesQuickStatus(a: AnalyzerQC, q: string): boolean {
  if (q === "All") return true;
  if (q === "Passed") return a.qcStatus === "Pass";
  if (q === "Failed") return a.qcStatus === "Fail";
  if (q === "Warning") return a.qcStatus === "Warning";
  if (q === "Critical") return a.qcStatus === "Fail" && a.calibrationStatus === "Failed";
  if (q === "Calibration Due") return a.calibrationStatus === "Due" || a.calibrationStatus === "Overdue";
  if (q === "Maintenance") return a.status === "Maintenance";
  if (q === "Corrective Action") return CORRECTIVE_ACTIONS.some((c) => c.analyzer === a.name && c.status !== "Resolved");
  return true;
}

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof ClipboardList; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(analyzers: AnalyzerQC[]): KpiCard[] {
  const passed = analyzers.filter((a) => a.qcStatus === "Pass").length;
  const failed = analyzers.filter((a) => a.qcStatus === "Fail").length;
  const violations = WESTGARD_VIOLATIONS.filter((v) => v.active).length;
  const calibrationDue = analyzers.filter((a) => a.calibrationStatus === "Due" || a.calibrationStatus === "Overdue").length;
  const avgReliability = Math.round(analyzers.reduce((sum, a) => sum + a.reliabilityScore, 0) / analyzers.length);
  const openActions = CORRECTIVE_ACTIONS.filter((c) => c.status !== "Resolved").length;

  return [
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "QC Passed Today", value: String(passed), sublabel: `of ${analyzers.length} analyzers`, quickFilter: "Passed" },
    { icon: ShieldOff, iconBg: "bg-[#DB5567]", label: "QC Failed Today", value: String(failed), sublabel: "Blocks result release", quickFilter: "Failed" },
    { icon: AlertTriangle, iconBg: "bg-[#F8A05F]", label: "Westgard Violations", value: String(violations), sublabel: "Active rule breaches", quickFilter: "Critical" },
    { icon: Hourglass, iconBg: "bg-[#627EC1]", label: "Calibration Due", value: String(calibrationDue), sublabel: "Needs scheduling", quickFilter: "Calibration Due" },
    { icon: Gauge, iconBg: "bg-[#5C8E64]", label: "Analyzer Reliability", value: `${avgReliability}%`, sublabel: "Fleet average", quickFilter: "All" },
    { icon: ClipboardCheck, iconBg: "bg-[#DB5567]", label: "Corrective Actions Open", value: String(openActions), sublabel: "Requires follow-up", quickFilter: "Corrective Action" },
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

type SearchField = "All Fields" | "Analyzer" | "QC Batch" | "Lot Number" | "Technician" | "Reagent" | "Control Material";

type QcFilters = {
  searchBy: SearchField;
  query: string;
  analyzer: string;
  department: string;
  qcLevel: string;
  qcStatus: string;
  instrument: string;
  manufacturer: string;
  date: string;
};

const EMPTY_FILTERS: QcFilters = {
  searchBy: "All Fields", query: "", analyzer: "All Analyzers", department: "All", qcLevel: "All Levels", qcStatus: "All", instrument: "All Analyzers", manufacturer: "All Manufacturers", date: "",
};

const ADVANCED_DEFAULTS: Omit<QcFilters, "searchBy" | "query"> = {
  analyzer: "All Analyzers", department: "All", qcLevel: "All Levels", qcStatus: "All", instrument: "All Analyzers", manufacturer: "All Manufacturers", date: "",
};

function matchesSearch(a: AnalyzerQC, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    Analyzer: a.name, "QC Batch": a.levels[0]?.lotNumber ?? "", "Lot Number": a.reagentLot, Technician: "", Reagent: a.reagentLot, "Control Material": a.levels.map((l) => l.controlMaterial).join(" "),
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(analyzers: AnalyzerQC[], f: QcFilters, quickStatus: string): AnalyzerQC[] {
  return analyzers.filter((a) => {
    if (!matchesSearch(a, f.searchBy, f.query)) return false;
    if (f.analyzer !== "All Analyzers" && a.name !== f.analyzer) return false;
    if (f.department !== "All" && a.department !== f.department) return false;
    if (f.qcStatus !== "All" && a.qcStatus !== f.qcStatus) return false;
    if (f.manufacturer !== "All Manufacturers" && a.manufacturer !== f.manufacturer) return false;
    if (!matchesQuickStatus(a, quickStatus)) return false;
    return true;
  });
}

function countActiveFilters(f: QcFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "date") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.date) n++;
  return n;
}

/* ---------- filter bar ---------- */

function QcFilterBar({
  filters, clearKey, quickStatus, onChange, onQuickStatus, onClearAdvanced,
}: {
  filters: QcFilters; clearKey: number; quickStatus: string;
  onChange: (partial: Partial<QcFilters>) => void; onQuickStatus: (q: string) => void; onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select value={filters.searchBy} onChange={(e) => onChange({ searchBy: e.target.value as SearchField })} className={`${inputClass} pr-8 appearance-none bg-white`}>
            {(["All Fields", "Analyzer", "QC Batch", "Lot Number", "Technician", "Reagent", "Control Material"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by analyzer, lot number, control material…" : `Search by ${filters.searchBy}`}
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
          aria-controls="qc-filters-panel"
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
          <div id="qc-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Analyzer" value={filters.analyzer} onChange={(v) => onChange({ analyzer: v })} options={["All Analyzers", ...ANALYZERS.map((a) => a.name)]} />
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="QC Level" value={filters.qcLevel} onChange={(v) => onChange({ qcLevel: v })} options={["All Levels", "Level 1", "Level 2"]} />
            <ControlledSelect label="QC Status" value={filters.qcStatus} onChange={(v) => onChange({ qcStatus: v })} options={["All", "Pass", "Fail", "Warning"]} />
            <ControlledSelect label="Instrument" value={filters.instrument} onChange={(v) => onChange({ instrument: v })} options={["All Analyzers", ...ANALYZERS.map((a) => a.name)]} />
            <ControlledSelect label="Manufacturer" value={filters.manufacturer} onChange={(v) => onChange({ manufacturer: v })} options={["All Manufacturers", ...MANUFACTURERS]} />
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

/* ---------- shared bits ---------- */

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

function MiniBar({ icon: Icon, label, value, tone }: { icon: typeof Gauge; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} strokeWidth={2.25} className="text-gray-400 shrink-0" />
      <span className="text-[10.5px] text-gray-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
      <span className="text-[10.5px] font-semibold text-slate-600 w-8 text-right tabular-nums">{value}%</span>
    </div>
  );
}

function gaugeTone(value: number): string {
  if (value >= 90) return "#0f766e";
  if (value >= 75) return "#d97706";
  return "#dc2626";
}

/* ---------- left panel: analyzer quality cards ---------- */

function AnalyzerQualityCard({ analyzer, selected, onSelect }: { analyzer: AnalyzerQC; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-lg shadow-sm p-3.5 flex flex-col gap-2.5 cursor-pointer transition-colors ${
        selected ? "border-teal-700 ring-1 ring-teal-700 bg-teal-50/20" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-700 shrink-0">
            <Server size={15} strokeWidth={2} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-slate-900 truncate">{analyzer.name}</span>
            <span className="text-[10.5px] text-gray-400 truncate">{analyzer.department}</span>
          </div>
        </div>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${QC_STATUS_STYLES[analyzer.qcStatus]}`}>{analyzer.qcStatus}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div className="flex items-center justify-between"><span className="text-gray-400">Calibration</span><span className={`font-semibold px-1.5 py-0.5 rounded-full text-[10px] ${CALIBRATION_STYLES[analyzer.calibrationStatus]}`}>{analyzer.calibrationStatus}</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-400">Temp</span><span className="font-semibold text-slate-700">{analyzer.temperature}</span></div>
        <div className="flex items-center justify-between col-span-2"><span className="text-gray-400">Last QC</span><span className="font-semibold text-slate-700">{analyzer.lastQc}</span></div>
        <div className="flex items-center justify-between col-span-2"><span className="text-gray-400">Next QC</span><span className="font-semibold text-slate-700">{analyzer.nextQc}</span></div>
        <div className="flex items-center justify-between col-span-2"><span className="text-gray-400">Reagent Lot</span><span className="font-semibold text-slate-700 font-mono">{analyzer.reagentLot}</span></div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1.5 border-t border-gray-100">
        <MiniBar icon={Gauge} label="Reliability" value={analyzer.reliabilityScore} tone={gaugeTone(analyzer.reliabilityScore)} />
        <MiniBar icon={Percent} label="Pass Rate" value={analyzer.qcPassRate} tone={gaugeTone(analyzer.qcPassRate)} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-teal-700 text-[11px] font-semibold text-teal-700 hover:bg-teal-50 transition-colors">
          <Play size={12} strokeWidth={2.25} /> Run QC
        </button>
        <button type="button" onClick={onSelect} className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <ChartLine size={12} strokeWidth={2.25} /> View Trends
        </button>
        <button type="button" className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Wrench size={12} strokeWidth={2.25} /> Calibration
        </button>
        <button type="button" className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <History size={12} strokeWidth={2.25} /> History
        </button>
      </div>
    </div>
  );
}

/* ---------- center panel: Levey-Jennings chart ---------- */

function LeveyJenningsChart({ level }: { level: QcLevel }) {
  const width = 720;
  const height = 240;
  const padding = 46;
  const yMin = level.mean - 4 * level.sd;
  const yMax = level.mean + 4 * level.sd;
  const points = level.points;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const yScale = (v: number) => height - padding - ((v - yMin) / (yMax - yMin)) * (height - padding * 2);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${padding + i * xStep} ${yScale(p.value)}`).join(" ");
  const sdLines = [-3, -2, -1, 0, 1, 2, 3].map((sd) => ({ sd, y: yScale(level.mean + sd * level.sd) }));
  const pointColor = (s: QcStatus) => (s === "Fail" ? "#dc2626" : s === "Warning" ? "#d97706" : "#059669");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {sdLines.map((l) => (
        <g key={l.sd}>
          <line
            x1={padding} x2={width - padding} y1={l.y} y2={l.y}
            stroke={l.sd === 0 ? "#0f766e" : Math.abs(l.sd) === 3 ? "#dc2626" : Math.abs(l.sd) === 2 ? "#d97706" : "#e2e8f0"}
            strokeDasharray={l.sd === 0 ? undefined : "4 3"}
            strokeWidth={l.sd === 0 ? 1.5 : 1}
          />
          <text x={2} y={l.y - 3} fontSize={9} fill="#94a3b8">{l.sd === 0 ? "Mean" : `${l.sd > 0 ? "+" : ""}${l.sd}SD`}</text>
        </g>
      ))}
      <path d={linePath} fill="none" stroke="#0f766e" strokeWidth={1.5} opacity={0.5} />
      {points.map((p, i) => (
        <g key={p.run}>
          <circle cx={padding + i * xStep} cy={yScale(p.value)} r={p.status === "Pass" ? 4 : 5.5} fill={pointColor(p.status)} stroke="white" strokeWidth={1}>
            <title>{`Run ${p.run} · ${p.date} · ${p.value} ${level.unit}${p.violatedRule ? ` · Westgard ${p.violatedRule}` : ""}`}</title>
          </circle>
          <text x={padding + i * xStep} y={height - padding + 14} fontSize={8} textAnchor="middle" fill="#94a3b8">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

function LeveyJenningsCard({ analyzer }: { analyzer: AnalyzerQC }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const level = analyzer.levels[Math.min(levelIdx, analyzer.levels.length - 1)];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading
        icon={ChartLine}
        iconTone="bg-teal-50 text-teal-700"
        title="Levey–Jennings Chart"
        action={
          <div className="flex items-center gap-1.5">
            {analyzer.levels.map((l, i) => (
              <button
                key={l.level}
                type="button"
                onClick={() => setLevelIdx(i)}
                className={`text-[11px] font-semibold rounded-full px-2.5 py-1 transition-colors ${i === levelIdx ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}
              >
                {l.level}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-gray-500 mb-3">
        <span><b className="font-semibold text-slate-700">Control:</b> {level.controlMaterial}</span>
        <span><b className="font-semibold text-slate-700">Lot:</b> {level.lotNumber}</span>
        <span><b className="font-semibold text-slate-700">Mean:</b> {level.mean} {level.unit}</span>
        <span><b className="font-semibold text-slate-700">SD:</b> {level.sd}</span>
      </div>
      <LeveyJenningsChart level={level} />
    </div>
  );
}

/* ---------- center panel: Westgard rule monitor ---------- */

function WestgardRuleCard({ ruleId, description }: { ruleId: WestgardRuleId; description: string }) {
  const violation = WESTGARD_VIOLATIONS.find((v) => v.rule === ruleId && v.active);
  const active = !!violation;
  return (
    <div className={`rounded-lg border p-3 flex flex-col gap-1.5 ${active ? (violation.severity === "critical" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50") : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold font-mono text-slate-900">{ruleId}</span>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${active ? (violation.severity === "critical" ? "bg-red-600 text-white" : "bg-amber-50 text-amber-700") : "bg-emerald-50 text-emerald-700"}`}>
          {active ? "Violation" : "Clear"}
        </span>
      </div>
      <span className="text-[11px] text-gray-500 leading-snug">{description}</span>
      {violation && (
        <div className="flex flex-col gap-0.5 pt-1.5 border-t border-gray-100 mt-0.5">
          <span className="text-[10.5px] text-gray-600">{violation.analyzer}</span>
          <span className="text-[10.5px] text-gray-400">{violation.timestamp}</span>
        </div>
      )}
    </div>
  );
}

function WestgardRuleMonitorCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={Target} iconTone="bg-violet-50 text-violet-700" title="Westgard Rule Monitor" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {WESTGARD_RULES.map((r) => (
          <WestgardRuleCard key={r.id} ruleId={r.id} description={r.description} />
        ))}
      </div>
    </div>
  );
}

/* ---------- center panel: QC performance trends ---------- */

function DailyPassRateBars() {
  const days = [
    { day: "Mon", rate: 96 }, { day: "Tue", rate: 94 }, { day: "Wed", rate: 91 }, { day: "Thu", rate: 88 },
    { day: "Fri", rate: 93 }, { day: "Sat", rate: 97 }, { day: "Sun", rate: 95 },
  ];
  return (
    <div className="flex items-end gap-3 h-32">
      {days.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10.5px] font-semibold text-slate-600">{d.rate}%</span>
          <div className="w-full flex items-end h-20 bg-gray-100 rounded-t-md overflow-hidden">
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${d.rate}%`, backgroundColor: gaugeTone(d.rate) }} />
          </div>
          <span className="text-[10.5px] text-gray-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyzerComparisonBars({ analyzers }: { analyzers: AnalyzerQC[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {analyzers.map((a) => (
        <div key={a.id} className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 w-36 shrink-0 truncate">{a.name}</span>
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${a.qcPassRate}%`, backgroundColor: gaugeTone(a.qcPassRate) }} />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 w-9 text-right tabular-nums">{a.qcPassRate}%</span>
        </div>
      ))}
    </div>
  );
}

function QcPerformanceTrendsCard({ analyzers }: { analyzers: AnalyzerQC[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={ChartColumn} iconTone="bg-blue-50 text-blue-700" title="QC Performance Trends" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 block">Daily Pass Rate — Last 7 Days</span>
          <DailyPassRateBars />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 block">Analyzer Comparison — Pass Rate</span>
          <AnalyzerComparisonBars analyzers={analyzers} />
        </div>
      </div>
    </div>
  );
}

/* ---------- center panel: calibration timeline ---------- */

function CalibrationTimelineCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={History} iconTone="bg-amber-50 text-amber-700" title="Calibration Timeline" />
      <div className="flex flex-col">
        {CALIBRATION_TIMELINE.map((e, i) => {
          const style = CALIBRATION_EVENT_STYLES[e.outcome];
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
                {i < CALIBRATION_TIMELINE.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
              </div>
              <div className="flex flex-col pb-3.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-800">{e.analyzer}</span>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.tone}`}>{e.outcome}</span>
                </div>
                <span className="text-xs text-gray-500">{e.operator}</span>
                <span className="text-[11px] text-gray-400">{e.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- right panel ---------- */

function QualityAlertsCard() {
  const alerts = WESTGARD_VIOLATIONS.filter((v) => v.active);
  return (
    <Card>
      <SectionHeading
        icon={ShieldAlert}
        iconTone={alerts.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}
        title="Quality Alerts"
        action={alerts.length > 0 ? <span className="text-xs font-bold text-red-600">{alerts.length} active</span> : <span className="text-xs font-semibold text-emerald-600">All clear</span>}
      />
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-2 text-xs rounded-md px-3 py-2 border ${a.severity === "critical" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
            <AlertTriangle size={13} strokeWidth={2.25} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-semibold">{a.analyzer} — Westgard {a.rule}</span>
              <span>{a.description}</span>
            </div>
          </div>
        ))}
        {REAGENT_LOTS.filter((r) => r.lowStock).map((r) => (
          <div key={r.name} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
            <FlaskConical size={13} strokeWidth={2.25} className="shrink-0 mt-0.5" />
            <span>Low reagent stock — {r.name} ({r.analyzer}), {r.remainingVolumePct}% remaining.</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CorrectiveActionCard({ action, onComplete }: { action: CorrectiveAction; onComplete: () => void }) {
  return (
    <div className={`rounded-md border p-3 flex flex-col gap-2 ${action.status === "Resolved" ? "border-gray-200 bg-gray-50/50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[action.priority]}`}>{action.priority}</span>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${CORRECTIVE_STATUS_STYLES[action.status]}`}>{action.status}</span>
      </div>
      <span className="text-[12.5px] font-semibold text-slate-800 leading-snug">{action.issue}</span>
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>{action.assignedTo}</span>
        <span>Due {action.dueDate}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${action.progress}%` }} />
      </div>
      <div className="flex items-center gap-2 pt-0.5">
        <button type="button" className="text-[11px] font-semibold text-gray-500 hover:text-slate-700 transition-colors">View</button>
        <button type="button" onClick={onComplete} disabled={action.status === "Resolved"} className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Complete</button>
        <button type="button" className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors">Escalate</button>
      </div>
    </div>
  );
}

function CorrectiveActionsCard({ actions, onComplete }: { actions: CorrectiveAction[]; onComplete: (id: string) => void }) {
  const openCount = actions.filter((a) => a.status !== "Resolved").length;
  return (
    <Card>
      <SectionHeading icon={ClipboardCheck} iconTone="bg-blue-50 text-blue-600" title="Corrective Actions" action={<span className="text-xs font-semibold text-gray-400">{openCount} open</span>} />
      <div className="flex flex-col gap-2.5">
        {actions.map((a) => (
          <CorrectiveActionCard key={a.id} action={a} onComplete={() => onComplete(a.id)} />
        ))}
      </div>
    </Card>
  );
}

function ReagentMonitoringCard() {
  return (
    <Card>
      <SectionHeading icon={TestTube} iconTone="bg-violet-50 text-violet-700" title="Reagent Monitoring" />
      <div className="flex flex-col divide-y divide-gray-100">
        {REAGENT_LOTS.map((r) => {
          const TrendIcon = r.usageTrend === "up" ? TrendingUp : r.usageTrend === "down" ? TrendingDown : Minus;
          return (
            <div key={r.name} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-bold text-slate-800 truncate">{r.name}</span>
                {r.lowStock && <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-red-600 bg-red-50 rounded-full px-1.5 py-0.5 shrink-0">Low Stock</span>}
              </div>
              <span className="text-[11px] text-gray-400">{r.analyzer} · Lot {r.lotNumber} · Exp {r.expiryDate}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.remainingVolumePct}%`, backgroundColor: r.lowStock ? "#dc2626" : "#0f766e" }} />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-600 w-8 text-right tabular-nums">{r.remainingVolumePct}%</span>
                <TrendIcon size={12} strokeWidth={2.25} className={r.usageTrend === "up" ? "text-amber-500" : r.usageTrend === "down" ? "text-blue-500" : "text-gray-400"} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function QcHistoryCard() {
  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-gray-100 text-gray-600" title="QC History" />
      <div className="flex flex-col divide-y divide-gray-100">
        {QC_HISTORY.map((h, i) => (
          <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-semibold text-slate-800 truncate">{h.result}</span>
              <span className="text-[10.5px] text-gray-400 truncate">{h.analyzer} · {h.technician} · {h.date}</span>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${QC_STATUS_STYLES[h.outcome]}`}>{h.outcome}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ComplianceOverviewCard() {
  const avgScore = Math.round(COMPLIANCE_ITEMS.reduce((sum, c) => sum + c.score, 0) / COMPLIANCE_ITEMS.length);
  return (
    <Card>
      <SectionHeading icon={Award} iconTone="bg-teal-50 text-teal-700" title="Compliance Overview" action={<span className="text-xs font-bold text-teal-700">{avgScore}% avg</span>} />
      <div className="flex flex-col divide-y divide-gray-100">
        {COMPLIANCE_ITEMS.map((c) => (
          <div key={c.label} className="py-2 first:pt-0 last:pb-0 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] font-semibold text-slate-800">{c.label}</span>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${COMPLIANCE_STATUS_STYLES[c.status]}`}>{c.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.score}%`, backgroundColor: gaugeTone(c.score) }} />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-600 w-8 text-right tabular-nums">{c.score}%</span>
            </div>
          </div>
        ))}
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

function QcQuickActionsCard() {
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={Play} label="Run Internal QC" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" />
        <QuickActionTile icon={Wrench} label="Start Calibration" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" />
        <QuickActionTile icon={ClipboardCheck} label="Record Corrective Action" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" />
        <QuickActionTile icon={CircleCheckBig} label="Approve QC" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
        <QuickActionTile icon={Server} label="View Analyzer" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={Wrench} label="Open Maintenance" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" />
        <QuickActionTile icon={FileText} label="Generate QC Report" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
      </div>
    </Card>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-colors">
        <Play size={15} strokeWidth={2.25} /> Run QC
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Upload size={15} strokeWidth={2.25} /> Import QC Data
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export QC Report
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Dashboard
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function QualityControlForm() {
  const [filters, setFilters] = useState<QcFilters>(EMPTY_FILTERS);
  const [quickStatus, setQuickStatus] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [selectedAnalyzerId, setSelectedAnalyzerId] = useState(ANALYZERS[0].id);
  const [actions, setActions] = useState<CorrectiveAction[]>(CORRECTIVE_ACTIONS);

  const kpiCards = useMemo(() => buildKpiCards(ANALYZERS), []);

  const filteredAnalyzers = useMemo(() => applyFilters(ANALYZERS, filters, quickStatus), [filters, quickStatus]);

  const selectedAnalyzer = ANALYZERS.find((a) => a.id === selectedAnalyzerId) ?? ANALYZERS[0];

  const handleChange = (partial: Partial<QcFilters>) => setFilters((prev) => ({ ...prev, ...partial }));
  const handleQuickStatus = (q: string) => setQuickStatus(q);
  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
  };

  const completeAction = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Resolved", progress: 100 } : a)));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1900px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Laboratory Quality Control"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Quality Control"
          subtitle="Monitor analyzer quality, evaluate QC performance, detect rule violations, manage corrective actions, and ensure laboratory compliance."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickStatus} />

        <QcFilterBar
          filters={filters}
          clearKey={clearKey}
          quickStatus={quickStatus}
          onChange={handleChange}
          onQuickStatus={handleQuickStatus}
          onClearAdvanced={handleClearAdvanced}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[25fr_50fr_25fr] gap-4 items-start">
          {/* LEFT — Analyzer Quality Overview */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800">Analyzer Quality Overview</h2>
              <span className="text-xs text-gray-400">{filteredAnalyzers.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {filteredAnalyzers.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-10 text-center text-sm text-gray-400">No analyzers match the current filters.</div>
              ) : (
                filteredAnalyzers.map((a) => <AnalyzerQualityCard key={a.id} analyzer={a} selected={a.id === selectedAnalyzerId} onSelect={() => setSelectedAnalyzerId(a.id)} />)
              )}
            </div>
          </div>

          {/* CENTER — Quality Analytics Dashboard */}
          <div className="flex flex-col gap-4 min-w-0">
            <LeveyJenningsCard analyzer={selectedAnalyzer} />
            <WestgardRuleMonitorCard />
            <QcPerformanceTrendsCard analyzers={ANALYZERS} />
            <CalibrationTimelineCard />
          </div>

          {/* RIGHT — Alerts & Corrective Actions */}
          <div className="flex flex-col gap-4 min-w-0">
            <QualityAlertsCard />
            <CorrectiveActionsCard actions={actions} onComplete={completeAction} />
            <ReagentMonitoringCard />
            <QcHistoryCard />
            <ComplianceOverviewCard />
            <QcQuickActionsCard />
          </div>
        </div>
      </div>

      <StickyFooter
        left={
          <>
            <FooterButton tone="danger">Cancel</FooterButton>
            <FooterButton tone="info">Save</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="neutral">
              <FileText size={15} strokeWidth={2.25} /> Generate Report
            </FooterButton>
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <Check size={15} strokeWidth={2.25} />
              Approve QC
            </button>
          </>
        }
      />
    </div>
  );
}
