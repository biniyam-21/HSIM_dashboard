"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Settings,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Cpu,
  MemoryStick,
  Thermometer,
  Droplets,
  Trash2,
  Signal,
  User,
  Server,
  History,
  Terminal,
  ClipboardList,
  FlaskConical,
  RotateCw,
  CirclePlay,
  CirclePause,
  LogIn,
  Send,
  ChevronRight,
  Gauge,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { Card } from "@/components/FormFields";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Analyzer Interface.
   Real-time monitoring center for connected laboratory analyzers: connection
   status, workload, instrument health, and automatic result synchronization.
   An operations dashboard, not a CRUD surface — deliberately distinct from
   every other page in this module.
   ========================================================================== */

/* ---------- types ---------- */

type ConnectionStatus = "Online" | "Offline" | "Busy" | "Idle" | "Maintenance" | "Calibration" | "QC Running" | "Error" | "Disconnected" | "Syncing";
type QcStatus = "Passed" | "Failed" | "Pending" | "Running";
type LogSeverity = "info" | "warning" | "error" | "success";
type Priority = "Routine" | "Urgent" | "STAT";
type SampleStage = "Waiting" | "Loaded" | "Analyzing" | "Quality Check" | "Completed" | "Imported";

type CommLogEntry = { time: string; severity: LogSeverity; description: string };
type AlertItem = { label: string; severity: "critical" | "warning" | "info" };

type Analyzer = {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  softwareVersion: string;
  department: string;
  ipAddress: string;
  port: string;
  location: string;
  operator: string;
  status: ConnectionStatus;
  runningSamples: number;
  queueLength: number;
  lastSync: string;
  temperature: string;
  reagentLevel: number;
  waterLevel: number;
  wasteLevel: number;
  qcStatus: QcStatus;
  maintenanceDue: boolean;
  maintenanceDate: string;
  calibrationStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  connectionQuality: number;
  communicationLog: CommLogEntry[];
  alerts: AlertItem[];
};

type ProcessingSample = {
  id: string;
  barcode: string;
  patientName: string;
  test: string;
  analyzerId: string;
  progressPct: number;
  eta: string;
  priority: Priority;
  stage: SampleStage;
  queueNumber: number;
};

type SystemLogEntry = { time: string; type: "import" | "assign" | "connect" | "qc" | "calibration" | "login" | "error"; message: string };

/* ---------- mock data ---------- */

const ANALYZERS: Analyzer[] = [
  {
    id: "an-sysmex", name: "Sysmex XN-550", model: "XN-550", manufacturer: "Sysmex Corporation", serialNumber: "SYX-2024-08841",
    softwareVersion: "v4.12.2", department: "Hematology", ipAddress: "10.20.4.11", port: "9100", location: "Main Lab — Bench 1",
    operator: "Selam Getachew", status: "Online", runningSamples: 3, queueLength: 5, lastSync: "12s ago", temperature: "22.4°C",
    reagentLevel: 68, waterLevel: 82, wasteLevel: 34, qcStatus: "Passed", maintenanceDue: false, maintenanceDate: "06/15/2026",
    calibrationStatus: "Current", cpuUsage: 42, memoryUsage: 58, diskUsage: 31, connectionQuality: 96,
    communicationLog: [
      { time: "10:02 AM", severity: "success", description: "Result imported — WBC, RBC, Hemoglobin, Platelets" },
      { time: "09:45 AM", severity: "info", description: "Connection established" },
      { time: "07:00 AM", severity: "success", description: "Internal QC completed — Passed" },
    ],
    alerts: [],
  },
  {
    id: "an-cobasc311", name: "Cobas C311", model: "Cobas c311", manufacturer: "Roche Diagnostics", serialNumber: "RCH-2023-14420",
    softwareVersion: "v3.4.0", department: "Chemistry", ipAddress: "10.20.4.12", port: "9100", location: "Main Lab — Bench 2",
    operator: "Dawit Mekonnen", status: "Busy", runningSamples: 6, queueLength: 11, lastSync: "4s ago", temperature: "23.1°C",
    reagentLevel: 22, waterLevel: 71, wasteLevel: 58, qcStatus: "Passed", maintenanceDue: false, maintenanceDate: "06/02/2026",
    calibrationStatus: "Current", cpuUsage: 74, memoryUsage: 66, diskUsage: 44, connectionQuality: 91,
    communicationLog: [
      { time: "10:34 AM", severity: "success", description: "Result imported — Troponin, Potassium" },
      { time: "10:20 AM", severity: "info", description: "Sample assigned — SPC-2026-08655" },
      { time: "09:00 AM", severity: "warning", description: "Reagent lot change logged — QC re-verified" },
    ],
    alerts: [{ label: "Low Reagent", severity: "warning" }],
  },
  {
    id: "an-cobase411", name: "Cobas e411", model: "Cobas e411", manufacturer: "Roche Diagnostics", serialNumber: "RCH-2022-09931",
    softwareVersion: "v2.9.1", department: "Immunology", ipAddress: "10.20.4.13", port: "9100", location: "Main Lab — Bench 3",
    operator: "Dawit Mekonnen", status: "Idle", runningSamples: 0, queueLength: 2, lastSync: "31s ago", temperature: "21.9°C",
    reagentLevel: 87, waterLevel: 90, wasteLevel: 20, qcStatus: "Passed", maintenanceDue: false, maintenanceDate: "07/10/2026",
    calibrationStatus: "Current", cpuUsage: 18, memoryUsage: 39, diskUsage: 27, connectionQuality: 98,
    communicationLog: [
      { time: "10:44 AM", severity: "info", description: "Critical value acknowledged by operator" },
      { time: "10:41 AM", severity: "error", description: "Critical result flagged — Troponin 0.52 ng/mL" },
      { time: "09:30 AM", severity: "info", description: "Connection established" },
    ],
    alerts: [],
  },
  {
    id: "an-mindray", name: "Mindray BC-6800", model: "BC-6800", manufacturer: "Mindray", serialNumber: "MND-2021-77102",
    softwareVersion: "v5.1.6", department: "Hematology", ipAddress: "10.20.4.14", port: "9100", location: "Main Lab — Bench 4",
    operator: "—", status: "Maintenance", runningSamples: 0, queueLength: 0, lastSync: "2h 14m ago", temperature: "24.6°C",
    reagentLevel: 54, waterLevel: 65, wasteLevel: 72, qcStatus: "Pending", maintenanceDue: true, maintenanceDate: "05/21/2026 (Today)",
    calibrationStatus: "Recalibration in progress", cpuUsage: 8, memoryUsage: 22, diskUsage: 51, connectionQuality: 40,
    communicationLog: [
      { time: "08:15 AM", severity: "warning", description: "Scheduled maintenance started" },
      { time: "08:14 AM", severity: "info", description: "Analyzer paused for maintenance" },
      { time: "06:00 AM", severity: "warning", description: "Maintenance due today" },
    ],
    alerts: [
      { label: "Maintenance Due", severity: "warning" },
      { label: "Waste Level High", severity: "warning" },
    ],
  },
  {
    id: "an-genexpert", name: "GeneXpert", model: "GeneXpert IV", manufacturer: "Cepheid", serialNumber: "CPH-2024-55018",
    softwareVersion: "v6.7.0", department: "Microbiology / Molecular", ipAddress: "10.20.4.15", port: "9100", location: "Molecular Lab",
    operator: "Selam Getachew", status: "QC Running", runningSamples: 1, queueLength: 3, lastSync: "8s ago", temperature: "23.4°C",
    reagentLevel: 44, waterLevel: 76, wasteLevel: 29, qcStatus: "Running", maintenanceDue: false, maintenanceDate: "08/01/2026",
    calibrationStatus: "Current", cpuUsage: 55, memoryUsage: 48, diskUsage: 38, connectionQuality: 94,
    communicationLog: [
      { time: "10:15 AM", severity: "info", description: "QC cartridge run started" },
      { time: "09:55 AM", severity: "success", description: "Result imported — COVID PCR" },
      { time: "09:00 AM", severity: "info", description: "Connection established" },
    ],
    alerts: [],
  },
  {
    id: "an-abbott", name: "Abbott Architect i1000", model: "Architect i1000SR", manufacturer: "Abbott Diagnostics", serialNumber: "ABT-2020-33207",
    softwareVersion: "v3.0.4", department: "Immunology", ipAddress: "10.20.4.16", port: "9100", location: "Main Lab — Bench 5",
    operator: "—", status: "Disconnected", runningSamples: 0, queueLength: 4, lastSync: "18m ago", temperature: "—",
    reagentLevel: 61, waterLevel: 58, wasteLevel: 45, qcStatus: "Pending", maintenanceDue: false, maintenanceDate: "06/28/2026",
    calibrationStatus: "Unknown — awaiting reconnect", cpuUsage: 0, memoryUsage: 0, diskUsage: 33, connectionQuality: 0,
    communicationLog: [
      { time: "10:22 AM", severity: "error", description: "Connection lost — network timeout" },
      { time: "10:21 AM", severity: "warning", description: "Heartbeat delayed (3 missed pings)" },
      { time: "08:40 AM", severity: "info", description: "Connection established" },
    ],
    alerts: [
      { label: "Connection Lost", severity: "critical" },
      { label: "Network Timeout", severity: "critical" },
    ],
  },
];

const PROCESSING_SAMPLES: ProcessingSample[] = [
  { id: "LAB-2026-000451", barcode: "8891234500451", patientName: "Selamawit Abebe", test: "CBC Panel", analyzerId: "an-sysmex", progressPct: 62, eta: "4 min", priority: "Routine", stage: "Analyzing", queueNumber: 1 },
  { id: "LAB-2026-000452", barcode: "8891234500452", patientName: "Tesfaye Abera", test: "Reticulocyte Count", analyzerId: "an-sysmex", progressPct: 18, eta: "9 min", priority: "Routine", stage: "Loaded", queueNumber: 2 },
  { id: "LAB-2026-000442", barcode: "8891234500442", patientName: "Marta Alemu", test: "Troponin, Potassium", analyzerId: "an-cobasc311", progressPct: 88, eta: "1 min", priority: "STAT", stage: "Quality Check", queueNumber: 1 },
  { id: "LAB-2026-000453", barcode: "8891234500453", patientName: "Alemu Getahun", test: "Lipid Profile", analyzerId: "an-cobasc311", progressPct: 40, eta: "6 min", priority: "Routine", stage: "Analyzing", queueNumber: 2 },
  { id: "LAB-2026-000454", barcode: "8891234500454", patientName: "Hana Yohannes", test: "HbA1c", analyzerId: "an-cobasc311", progressPct: 5, eta: "12 min", priority: "Urgent", stage: "Waiting", queueNumber: 3 },
  { id: "LAB-2026-000420", barcode: "8891234500420", patientName: "Yared Solomon", test: "COVID PCR", analyzerId: "an-genexpert", progressPct: 74, eta: "3 min", priority: "Routine", stage: "Analyzing", queueNumber: 1 },
];

const SYSTEM_LOG: SystemLogEntry[] = [
  { time: "10:44:12", type: "assign", message: "Sample LAB-2026-000454 (Hana Yohannes) queued on Cobas C311" },
  { time: "10:41:03", type: "error", message: "Critical result flagged on Cobas e411 — Troponin 0.52 ng/mL" },
  { time: "10:34:51", type: "import", message: "Results imported from Cobas C311 — Troponin, Potassium" },
  { time: "10:22:40", type: "error", message: "Abbott Architect i1000 — connection lost (network timeout)" },
  { time: "10:15:08", type: "qc", message: "GeneXpert — QC cartridge run started" },
  { time: "10:02:17", type: "import", message: "Results imported from Sysmex XN-550 — WBC, RBC, Hemoglobin, Platelets" },
  { time: "09:55:44", type: "import", message: "Results imported from GeneXpert — COVID PCR" },
  { time: "09:45:02", type: "connect", message: "Sysmex XN-550 — connection established" },
  { time: "08:15:00", type: "calibration", message: "Mindray BC-6800 — scheduled maintenance started" },
  { time: "07:00:11", type: "qc", message: "Sysmex XN-550 — internal QC passed" },
  { time: "06:58:30", type: "login", message: "Operator login — Selam Getachew" },
];

/* ---------- style maps ---------- */

const STATUS_STYLES: Record<ConnectionStatus, string> = {
  Online: "bg-emerald-50 text-emerald-700",
  Busy: "bg-blue-50 text-blue-700",
  Idle: "bg-slate-100 text-slate-600",
  Maintenance: "bg-amber-50 text-amber-700",
  Calibration: "bg-violet-50 text-violet-700",
  "QC Running": "bg-teal-50 text-teal-700",
  Error: "bg-red-600 text-white",
  Disconnected: "bg-red-50 text-red-600",
  Offline: "bg-gray-100 text-gray-400",
  Syncing: "bg-blue-50 text-blue-700",
};

const STATUS_DOT: Record<ConnectionStatus, string> = {
  Online: "bg-emerald-500",
  Busy: "bg-blue-500",
  Idle: "bg-gray-400",
  Maintenance: "bg-amber-500",
  Calibration: "bg-violet-500",
  "QC Running": "bg-teal-500",
  Error: "bg-red-600",
  Disconnected: "bg-red-500",
  Offline: "bg-gray-300",
  Syncing: "bg-blue-500",
};

const LIVE_STATUSES: ConnectionStatus[] = ["Online", "Busy", "QC Running", "Syncing"];

const PRIORITY_STYLES: Record<Priority, string> = {
  Routine: "bg-teal-50 text-teal-700",
  Urgent: "bg-amber-50 text-amber-700",
  STAT: "bg-red-600 text-white",
};

const SEVERITY_STYLES: Record<LogSeverity, string> = {
  success: "bg-emerald-50 text-emerald-700",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-600",
};

const ALERT_SEVERITY_STYLES: Record<AlertItem["severity"], string> = {
  critical: "bg-red-50 text-red-600 border-red-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
};

const SAMPLE_STAGES: SampleStage[] = ["Waiting", "Loaded", "Analyzing", "Quality Check", "Completed", "Imported"];

function gaugeTone(value: number, invert = false): string {
  const v = invert ? 100 - value : value;
  if (v >= 85) return "#dc2626";
  if (v >= 65) return "#d97706";
  return "#0f766e";
}

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof Server; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(analyzers: Analyzer[]): KpiCard[] {
  const online = analyzers.filter((a) => a.status === "Online" || a.status === "Busy" || a.status === "QC Running" || a.status === "Idle").length;
  const offline = analyzers.filter((a) => a.status === "Offline" || a.status === "Disconnected").length;
  const processing = analyzers.reduce((sum, a) => sum + a.runningSamples, 0);
  const errors = analyzers.filter((a) => a.status === "Error" || a.status === "Disconnected").length;
  const maintenanceDue = analyzers.filter((a) => a.maintenanceDue).length;

  return [
    { icon: Wifi, iconBg: "bg-[#216E6A]", label: "Online Analyzers", value: String(online), sublabel: `of ${analyzers.length} total`, quickFilter: "Online" },
    { icon: WifiOff, iconBg: "bg-[#DB5567]", label: "Offline Analyzers", value: String(offline), sublabel: "Not receiving samples", quickFilter: "Offline" },
    { icon: FlaskConical, iconBg: "bg-[#627EC1]", label: "Samples Processing", value: String(processing), sublabel: "Running now", quickFilter: "All" },
    { icon: Download, iconBg: "bg-[#5C8E64]", label: "Results Imported Today", value: "142", sublabel: "+18 in last hour", quickFilter: "All" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Communication Errors", value: String(errors), sublabel: "Needs attention", quickFilter: "Error" },
    { icon: Wrench, iconBg: "bg-[#F8A05F]", label: "Maintenance Due", value: String(maintenanceDue), sublabel: "Scheduled service", quickFilter: "Maintenance" },
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

function MiniBar({ icon: Icon, label, value, tone }: { icon: typeof Cpu; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} strokeWidth={2.25} className="text-gray-400 shrink-0" />
      <span className="text-[10.5px] text-gray-400 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: tone }} />
      </div>
      <span className="text-[10.5px] font-semibold text-slate-600 w-8 text-right tabular-nums">{value}%</span>
    </div>
  );
}

function CircularGauge({ value, label, tone, size = 72 }: { value: number; label: string; tone: string; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} stroke={tone} strokeWidth={stroke} fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-800 tabular-nums">{value}%</span>
        </div>
      </div>
      <span className="text-[10.5px] text-gray-400 text-center">{label}</span>
    </div>
  );
}

/* ---------- analyzer grid (left panel) ---------- */

function AnalyzerCard({ analyzer, selected, onSelect }: { analyzer: Analyzer; selected: boolean; onSelect: () => void }) {
  const isLive = LIVE_STATUSES.includes(analyzer.status);
  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3 cursor-pointer transition-colors ${
        selected ? "border-teal-700 ring-1 ring-teal-700 bg-teal-50/20" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 text-teal-700 shrink-0">
            <Server size={20} strokeWidth={2} />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${STATUS_DOT[analyzer.status]} ${isLive ? "animate-pulse" : ""}`} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">{analyzer.name}</span>
            <span className="text-xs text-gray-400 truncate">{analyzer.department}</span>
          </div>
        </div>
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${STATUS_STYLES[analyzer.status]}`}>{analyzer.status}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-gray-500">
        <span className="font-mono">{analyzer.ipAddress}</span>
        <span className="inline-flex items-center gap-1"><User size={11} strokeWidth={2} className="text-gray-400" /> {analyzer.operator}</span>
        <span>Last sync: {analyzer.lastSync}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
        <div className="flex items-center justify-between"><span className="text-gray-400">Running</span><span className="font-semibold text-slate-700">{analyzer.runningSamples}</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-400">Queue</span><span className="font-semibold text-slate-700">{analyzer.queueLength}</span></div>
        <div className="flex items-center justify-between"><span className="text-gray-400">Temp</span><span className="font-semibold text-slate-700">{analyzer.temperature}</span></div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">QC</span>
          <span className={`font-semibold ${analyzer.qcStatus === "Passed" ? "text-emerald-600" : analyzer.qcStatus === "Failed" ? "text-red-600" : "text-amber-600"}`}>{analyzer.qcStatus}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
        <MiniBar icon={Cpu} label="CPU" value={analyzer.cpuUsage} tone={gaugeTone(analyzer.cpuUsage)} />
        <MiniBar icon={MemoryStick} label="Memory" value={analyzer.memoryUsage} tone={gaugeTone(analyzer.memoryUsage)} />
        <MiniBar icon={Droplets} label="Reagent" value={analyzer.reagentLevel} tone={gaugeTone(analyzer.reagentLevel, true)} />
        <MiniBar icon={Signal} label="Comm" value={analyzer.connectionQuality} tone={gaugeTone(analyzer.connectionQuality, true)} />
      </div>

      {analyzer.maintenanceDue && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
          <Wrench size={12} strokeWidth={2.25} /> Maintenance due — {analyzer.maintenanceDate}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <ClipboardList size={13} strokeWidth={2.25} /> View Queue
        </button>
        <button type="button" onClick={onSelect} className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-teal-700 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors">
          Open Analyzer <ChevronRight size={13} strokeWidth={2.25} />
        </button>
        <button type="button" disabled={analyzer.status !== "Disconnected" && analyzer.status !== "Error"} className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <RotateCw size={13} strokeWidth={2.25} /> Restart Connection
        </button>
        <button type="button" className="h-8 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Terminal size={13} strokeWidth={2.25} /> View Logs
        </button>
      </div>
    </div>
  );
}

/* ---------- processing queue (center panel) ---------- */

function StageMiniTimeline({ stage }: { stage: SampleStage }) {
  const currentIdx = SAMPLE_STAGES.indexOf(stage);
  return (
    <div className="flex items-center">
      {SAMPLE_STAGES.map((s, i) => (
        <div key={s} className="flex items-center">
          <span title={s} className={`w-2 h-2 rounded-full shrink-0 ${i < currentIdx ? "bg-emerald-400" : i === currentIdx ? "bg-teal-600 ring-2 ring-teal-600/20" : "bg-gray-200"}`} />
          {i < SAMPLE_STAGES.length - 1 && <span className={`h-px w-2.5 ${i < currentIdx ? "bg-emerald-300" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function ProcessingSampleCard({ sample, analyzer, highlighted }: { sample: ProcessingSample; analyzer?: Analyzer; highlighted: boolean }) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-3 flex flex-col gap-2 transition-colors ${highlighted ? "border-teal-700 ring-1 ring-teal-700/40" : "border-gray-200"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[sample.priority]}`}>{sample.priority}</span>
        <span className="text-[10.5px] text-gray-400">#{sample.queueNumber}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[12.5px] font-bold text-slate-900 truncate">{sample.patientName}</span>
        <span className="text-[10.5px] text-gray-400 font-mono truncate">{sample.barcode}</span>
      </div>
      <span className="text-[11px] text-gray-500 truncate">{sample.test} · {analyzer?.name ?? sample.analyzerId}</span>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${sample.progressPct}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-semibold text-slate-700">{sample.stage}</span>
        <span className="text-[10.5px] text-gray-400">ETA {sample.eta}</span>
      </div>
      <StageMiniTimeline stage={sample.stage} />
    </div>
  );
}

/* ---------- right panel: analyzer details ---------- */

function SelectedAnalyzerCard({ analyzer }: { analyzer: Analyzer }) {
  return (
    <Card>
      <SectionHeading icon={Server} iconTone="bg-blue-50 text-blue-600" title="Selected Analyzer" />
      <div className="divide-y divide-gray-100">
        <InfoRow label="Analyzer Name" value={analyzer.name} />
        <InfoRow label="Model" value={analyzer.model} />
        <InfoRow label="Manufacturer" value={analyzer.manufacturer} />
        <InfoRow label="Serial Number" value={analyzer.serialNumber} />
        <InfoRow label="Software Version" value={analyzer.softwareVersion} />
        <InfoRow label="IP Address" value={`${analyzer.ipAddress}:${analyzer.port}`} valueClass="font-mono" />
        <InfoRow label="Location" value={analyzer.location} />
        <InfoRow label="Operator" value={analyzer.operator} />
      </div>
    </Card>
  );
}

function HealthMonitoringCard({ analyzer }: { analyzer: Analyzer }) {
  return (
    <Card>
      <SectionHeading icon={Gauge} iconTone="bg-teal-50 text-teal-700" title="Health Monitoring" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        <CircularGauge value={analyzer.cpuUsage} label="CPU" tone={gaugeTone(analyzer.cpuUsage)} />
        <CircularGauge value={analyzer.memoryUsage} label="Memory" tone={gaugeTone(analyzer.memoryUsage)} />
        <CircularGauge value={analyzer.diskUsage} label="Disk" tone={gaugeTone(analyzer.diskUsage)} />
      </div>
      <div className="flex flex-col gap-2.5">
        <MiniBar icon={Thermometer} label="Reagent" value={analyzer.reagentLevel} tone={gaugeTone(analyzer.reagentLevel, true)} />
        <MiniBar icon={Droplets} label="Water" value={analyzer.waterLevel} tone={gaugeTone(analyzer.waterLevel, true)} />
        <MiniBar icon={Trash2} label="Waste" value={analyzer.wasteLevel} tone={gaugeTone(analyzer.wasteLevel)} />
        <MiniBar icon={Signal} label="Comm" value={analyzer.connectionQuality} tone={gaugeTone(analyzer.connectionQuality, true)} />
      </div>
      <div className="divide-y divide-gray-100 mt-3 pt-1 border-t border-gray-100">
        <InfoRow label="Calibration Status" value={analyzer.calibrationStatus} />
        <InfoRow label="QC Status" value={analyzer.qcStatus} valueClass={analyzer.qcStatus === "Passed" ? "text-emerald-600" : analyzer.qcStatus === "Failed" ? "text-red-600" : "text-amber-600"} />
      </div>
    </Card>
  );
}

function CommunicationLogCard({ log }: { log: CommLogEntry[] }) {
  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-gray-100 text-gray-600" title="Communication Log" />
      <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
        {log.map((entry, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`inline-block text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${SEVERITY_STYLES[entry.severity]}`}>{entry.severity}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] text-slate-700 leading-snug">{entry.description}</span>
              <span className="text-[10.5px] text-gray-400">{entry.time}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnalyzerAlertsCard({ alerts }: { alerts: AlertItem[] }) {
  return (
    <Card>
      <SectionHeading
        icon={ShieldAlert}
        iconTone={alerts.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}
        title="Alerts"
        action={alerts.length > 0 ? <span className="text-xs font-bold text-red-600">{alerts.length} active</span> : <span className="text-xs font-semibold text-emerald-600">All clear</span>}
      />
      {alerts.length === 0 ? (
        <p className="text-xs text-gray-400">No active alerts for this analyzer.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((a) => (
            <div key={a.label} className={`flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 border ${ALERT_SEVERITY_STYLES[a.severity]}`}>
              <AlertTriangle size={13} strokeWidth={2.25} className="shrink-0" />
              {a.label}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function QuickActionTile({ icon: Icon, label, tone, disabled }: { icon: typeof RefreshCw; label: string; tone: string; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1.5 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}>
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function AnalyzerQuickActionsCard({ analyzer }: { analyzer: Analyzer }) {
  const isBusy = analyzer.status === "Busy" || analyzer.status === "QC Running";
  const isOffline = analyzer.status === "Disconnected" || analyzer.status === "Offline" || analyzer.status === "Error";
  const isMaintenance = analyzer.status === "Maintenance";
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={RotateCw} label="Reconnect Analyzer" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" disabled={!isOffline} />
        <QuickActionTile icon={FlaskConical} label="Run QC" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" disabled={isBusy || isOffline} />
        <QuickActionTile icon={Settings} label="Start Calibration" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" disabled={isBusy || isOffline} />
        <QuickActionTile icon={CirclePause} label="Pause Analyzer" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" disabled={isOffline || isMaintenance} />
        <QuickActionTile icon={CirclePlay} label="Resume Analyzer" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" disabled={!isMaintenance} />
        <QuickActionTile icon={RefreshCw} label="Restart Interface" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={ClipboardList} label="View Sample Queue" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={Wrench} label="Open Maintenance" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" />
      </div>
    </Card>
  );
}

/* ---------- bottom panel: live system logs ---------- */

const LOG_TYPE_ICON: Record<SystemLogEntry["type"], typeof Download> = {
  import: Download,
  assign: ClipboardList,
  connect: Wifi,
  qc: FlaskConical,
  calibration: Settings,
  login: LogIn,
  error: ShieldAlert,
};

const LOG_TYPE_TONE: Record<SystemLogEntry["type"], string> = {
  import: "text-emerald-600",
  assign: "text-blue-600",
  connect: "text-teal-600",
  qc: "text-violet-600",
  calibration: "text-amber-600",
  login: "text-gray-500",
  error: "text-red-600",
};

function LiveSystemLogsPanel({ logs, collapsed, onToggleCollapsed }: { logs: SystemLogEntry[]; collapsed: boolean; onToggleCollapsed: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <button type="button" onClick={onToggleCollapsed} className="w-full flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 bg-slate-800 text-white">
            <Terminal size={14} strokeWidth={2.25} />
          </span>
          <h2 className="text-sm font-bold text-slate-800">Live System Logs</h2>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </span>
        </div>
        <ChevronRight size={16} strokeWidth={2.25} className={`text-gray-400 transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`} />
      </button>
      {!collapsed && (
        <div className="bg-[#0B1120] rounded-b-lg px-4 py-3 max-h-64 overflow-y-auto font-mono text-[12px]">
          {logs.map((entry, i) => {
            const Icon = LOG_TYPE_ICON[entry.type];
            return (
              <div key={i} className="flex items-start gap-2.5 py-1">
                <span className="text-gray-500 shrink-0">{entry.time}</span>
                <Icon size={13} strokeWidth={2.25} className={`shrink-0 mt-0.5 ${LOG_TYPE_TONE[entry.type]}`} />
                <span className="text-gray-200 leading-snug">{entry.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
        <RotateCw size={15} strokeWidth={2.25} /> Reconnect Devices
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Settings size={15} strokeWidth={2.25} /> Analyzer Settings
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export Logs
      </button>
    </div>
  );
}

/* ---------- page ---------- */

function matchesQuickFilter(a: Analyzer, q: string): boolean {
  if (q === "All") return true;
  if (q === "Online") return a.status === "Online" || a.status === "Busy" || a.status === "QC Running" || a.status === "Idle";
  if (q === "Offline") return a.status === "Offline" || a.status === "Disconnected";
  if (q === "Error") return a.status === "Error" || a.status === "Disconnected";
  if (q === "Maintenance") return a.maintenanceDue;
  return true;
}

export default function AnalyzerInterfaceForm() {
  const [quickFilter, setQuickFilter] = useState("All");
  const [selectedAnalyzerId, setSelectedAnalyzerId] = useState(ANALYZERS[0].id);
  const [logsCollapsed, setLogsCollapsed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  const kpiCards = useMemo(() => buildKpiCards(ANALYZERS), []);

  const filteredAnalyzers = useMemo(() => ANALYZERS.filter((a) => matchesQuickFilter(a, quickFilter)), [quickFilter]);

  const selectedAnalyzer = ANALYZERS.find((a) => a.id === selectedAnalyzerId) ?? ANALYZERS[0];
  const samplesForSelected = PROCESSING_SAMPLES.filter((s) => s.analyzerId === selectedAnalyzerId);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1900px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Analyzer Interface"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Analyzer Interface"
          subtitle="Monitor analyzer health, live processing, communication status, and automatic laboratory result synchronization."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={setQuickFilter} />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE MONITORING
            </span>
            <span className="text-xs text-gray-400">Auto-refreshing · updated {tick === 0 ? "just now" : `${tick * 4}s ago cycle`}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Online", "Offline", "Error", "Maintenance"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuickFilter(q)}
                className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${quickFilter === q ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[60fr_20fr_20fr] gap-4 items-start">
          {/* LEFT — Analyzer Grid */}
          <div className="flex flex-col gap-3 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 px-1">Analyzer Grid</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredAnalyzers.map((a) => (
                <AnalyzerCard key={a.id} analyzer={a} selected={a.id === selectedAnalyzerId} onSelect={() => setSelectedAnalyzerId(a.id)} />
              ))}
            </div>
          </div>

          {/* CENTER — Processing Queue */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800">Processing Queue</h2>
              <span className="text-xs text-gray-400">{PROCESSING_SAMPLES.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {PROCESSING_SAMPLES.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-10 text-center text-sm text-gray-400">No samples currently processing.</div>
              ) : (
                PROCESSING_SAMPLES.map((s) => (
                  <ProcessingSampleCard key={s.id} sample={s} analyzer={ANALYZERS.find((a) => a.id === s.analyzerId)} highlighted={s.analyzerId === selectedAnalyzerId} />
                ))
              )}
            </div>
          </div>

          {/* RIGHT — Analyzer Details */}
          <div className="flex flex-col gap-4 min-w-0">
            <SelectedAnalyzerCard analyzer={selectedAnalyzer} />
            <HealthMonitoringCard analyzer={selectedAnalyzer} />
            <CommunicationLogCard log={selectedAnalyzer.communicationLog} />
            <AnalyzerAlertsCard alerts={selectedAnalyzer.alerts} />
            <AnalyzerQuickActionsCard analyzer={selectedAnalyzer} />
          </div>
        </div>

        <LiveSystemLogsPanel logs={SYSTEM_LOG} collapsed={logsCollapsed} onToggleCollapsed={() => setLogsCollapsed((v) => !v)} />

        {samplesForSelected.length > 0 && (
          <p className="text-xs text-gray-400 px-1">
            {samplesForSelected.length} sample{samplesForSelected.length > 1 ? "s" : ""} currently on {selectedAnalyzer.name}.
          </p>
        )}
      </div>

      <StickyFooter
        left={<FooterButton tone="danger">Cancel</FooterButton>}
        right={
          <>
            <FooterButton tone="neutral">
              <RefreshCw size={15} strokeWidth={2.25} /> Refresh
            </FooterButton>
            <FooterButton tone="info">
              <RotateCw size={15} strokeWidth={2.25} /> Reconnect
            </FooterButton>
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
              <Send size={15} strokeWidth={2.25} />
              Open Configuration
            </button>
          </>
        }
      />
    </div>
  );
}
