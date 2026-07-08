"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  ShieldCheck,
  Eye,
  Download,
  Stethoscope,
  Scissors,
  Syringe,
  Wind,
  Droplet,
  FlaskConical,
  Camera,
  FileText,
  Calendar as CalendarIcon,
  Upload,
  Printer,
  PenTool,
  LayoutDashboard,
  FileCheck,
  Award,
  Fingerprint,
  Scale,
  Share2,
  History,
  Clock,
  AlertCircle,
  UsersRound,
  ArrowRight,
  Info,
  ScanLine,
  Send,
  Folder,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react";
import IconUnderlineTabs, { type IconTab } from "@/components/IconUnderlineTabs";
import UnderDevelopment from "@/components/UnderDevelopment";
import PatientInfoBanner from "@/components/PatientInfoBanner";
import { FilterPopoverButton, FilterChips, useSessionFilters, type FilterChip } from "@/components/TableFilters";
import { slugify } from "@/lib/navigation";

const ICON_TABS: IconTab[] = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: FileCheck, label: "Consents" },
  { icon: FileText, label: "Documents" },
  { icon: Award, label: "Certificates" },
  { icon: Fingerprint, label: "Identity" },
  { icon: Scale, label: "Legal" },
  { icon: Share2, label: "Sharing" },
  { icon: History, label: "Audit Log" },
];

/* ---------- top breadcrumb + header ---------- */

function Breadcrumb() {
  const crumbs = ["Home", "Patient Management", "Consent & Documentation"];
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {crumbs.map((c, i) => (
        <span key={c} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">&gt;</span>}
          <span className={i === crumbs.length - 1 ? "text-gray-500" : ""}>{c}</span>
        </span>
      ))}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consent &amp; Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage patient consents, documents, and legal authorizations
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 h-10 px-4 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Consent / Document
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 h-10 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          More Actions
          <ChevronDown size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   OVERVIEW TAB
   ========================================================================== */

type StatCard = {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  value: number;
  sub: string;
  subClass: string;
};

const OVERVIEW_STATS: StatCard[] = [
  {
    icon: ShieldCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    title: "Active Consents",
    value: 12,
    sub: "All valid and up to date",
    subClass: "text-emerald-600",
  },
  {
    icon: Clock,
    iconClass: "bg-amber-50 text-amber-500",
    title: "Pending Signature",
    value: 3,
    sub: "Awaiting patient signature",
    subClass: "text-amber-600",
  },
  {
    icon: AlertCircle,
    iconClass: "bg-red-50 text-red-500",
    title: "Expired Consents",
    value: 1,
    sub: "Require renewal",
    subClass: "text-red-600",
  },
  {
    icon: FileText,
    iconClass: "bg-blue-50 text-blue-500",
    title: "Total Documents",
    value: 48,
    sub: "Across all categories",
    subClass: "text-blue-600",
  },
  {
    icon: UsersRound,
    iconClass: "bg-purple-50 text-purple-500",
    title: "Shared Documents",
    value: 6,
    sub: "With other departments",
    subClass: "text-purple-600",
  },
];

function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {OVERVIEW_STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.title}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3"
          >
            <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconClass}`}>
              <Icon size={18} strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-gray-500">{s.title}</span>
              <span className="font-heading text-2xl font-bold text-slate-900">{s.value}</span>
              <span className={`text-xs font-medium ${s.subClass}`}>{s.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const OVERVIEW_STATUS_ROWS = [
  { label: "Active", value: 12, pct: "75%", dot: "bg-emerald-500", stroke: "stroke-emerald-500" },
  { label: "Pending Signature", value: 3, pct: "19%", dot: "bg-amber-500", stroke: "stroke-amber-500" },
  { label: "Expired", value: 1, pct: "6%", dot: "bg-red-500", stroke: "stroke-red-500" },
  { label: "Withdrawn", value: 0, pct: "0%", dot: "bg-purple-600", stroke: "" },
  { label: "Emergency Override", value: 0, pct: "0%", dot: "bg-gray-500", stroke: "" },
];

function OverviewStatusDonut() {
  const size = 168;
  const r = 62;
  const sw = 26;
  const c = 2 * Math.PI * r;
  const drawable = OVERVIEW_STATUS_ROWS.filter((s) => s.value > 0);
  const total = OVERVIEW_STATUS_ROWS.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {drawable.map((s) => {
            const len = (c * s.value) / total;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                className={s.stroke}
                strokeWidth={sw}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-acc}
              />
            );
            acc += len;
            return el;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold text-slate-900">{total}</span>
        <span className="text-xs text-gray-400">Total</span>
      </div>
    </div>
  );
}

function ConsentStatusOverviewCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col">
      <h2 className="text-base font-bold text-slate-900 mb-4">Consent Status Overview</h2>
      <div className="flex items-center gap-6 flex-1">
        <OverviewStatusDonut />
        <div className="flex flex-col gap-2.5">
          {OVERVIEW_STATUS_ROWS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <span className="text-gray-700 whitespace-nowrap">{s.label}</span>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {s.value} ({s.pct})
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-3 mt-3 border-t border-gray-100">
        <button
          type="button"
          className="text-sm font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
        >
          View all consents
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

const RECENT_ACTIVITY: { icon: LucideIcon; iconClass: string; title: string; desc: string; date: string; time: string }[] = [
  {
    icon: ShieldCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    title: "Surgical Consent Signed",
    desc: "Signed by Abebe Kebede",
    date: "May 22, 2026",
    time: "10:30 AM",
  },
  {
    icon: FileText,
    iconClass: "bg-blue-50 text-blue-600",
    title: "Document Uploaded",
    desc: "Discharge Summary.pdf",
    date: "May 22, 2026",
    time: "09:45 AM",
  },
  {
    icon: Clock,
    iconClass: "bg-amber-50 text-amber-500",
    title: "Pending Signature",
    desc: "Blood Transfusion Consent",
    date: "May 22, 2026",
    time: "09:20 AM",
  },
  {
    icon: Share2,
    iconClass: "bg-purple-50 text-purple-500",
    title: "Document Shared",
    desc: "Radiology Report shared with Orthopedics Dept.",
    date: "May 21, 2026",
    time: "02:15 PM",
  },
  {
    icon: Info,
    iconClass: "bg-purple-50 text-purple-500",
    title: "Consent Expired",
    desc: "Research Consent",
    date: "May 20, 2026",
    time: "04:10 PM",
  },
];

function RecentActivityCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
        <button type="button" className="text-sm font-semibold text-teal-700 hover:underline">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {RECENT_ACTIVITY.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title + a.time} className="flex items-start gap-3">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${a.iconClass}`}>
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-gray-500">{a.desc}</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs text-gray-500 whitespace-nowrap">{a.date}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const QUICK_ACTIONS_OVERVIEW: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: FileText, title: "Create Consent", subtitle: "New consent form" },
  { icon: Upload, title: "Upload Document", subtitle: "Add new document" },
  { icon: ScanLine, title: "Scan Document", subtitle: "From scanner" },
  { icon: PenTool, title: "Request Signature", subtitle: "Send to patient" },
  { icon: Award, title: "Generate Certificate", subtitle: "Create certificate" },
  { icon: Share2, title: "Share Document", subtitle: "With department" },
  { icon: Fingerprint, title: "Verify Identity", subtitle: "Add ID document" },
  { icon: History, title: "View Audit Trail", subtitle: "View history" },
  { icon: LayoutTemplate, title: "Document Template", subtitle: "Manage templates" },
];

function QuickActionsOverviewCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_ACTIONS_OVERVIEW.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              type="button"
              className="flex items-center gap-2.5 p-3 border border-gray-200 rounded-md text-left hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{a.title}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{a.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type RecentConsentRow = {
  type: string;
  encounter: string;
  signedBy: string[];
  signedOn: string;
  time: string;
  status: "Active" | "Pending" | "Expired";
};

const RECENT_CONSENTS: RecentConsentRow[] = [
  {
    type: "Surgical Consent",
    encounter: "OPD-2026-001245",
    signedBy: ["Abebe Kebede (Patient)", "Dr. Hana M. (Doctor)"],
    signedOn: "May 22, 2026",
    time: "10:30 AM",
    status: "Active",
  },
  {
    type: "Blood Transfusion Consent",
    encounter: "IPD-2026-000881",
    signedBy: ["Abebe Kebede (Patient)"],
    signedOn: "May 22, 2026",
    time: "09:15 AM",
    status: "Pending",
  },
  {
    type: "Anesthesia Consent",
    encounter: "OPD-2026-001245",
    signedBy: ["Dr. Hana M. (Doctor)"],
    signedOn: "May 21, 2026",
    time: "03:40 PM",
    status: "Expired",
  },
  {
    type: "Telemedicine Consent",
    encounter: "OPD-2026-000990",
    signedBy: ["Abebe Kebede (Patient)"],
    signedOn: "May 18, 2026",
    time: "11:20 AM",
    status: "Active",
  },
];

const RECENT_STATUS_STYLES: Record<RecentConsentRow["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Expired: "bg-red-50 text-red-600",
};

function RecentConsentsCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Recent Consents</h2>
        <button type="button" className="text-sm font-semibold text-teal-700 hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Consent Type", "Encounter", "Signed By", "Signed On", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2.5 pr-4 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_CONSENTS.map((r) => (
              <tr key={r.type + r.encounter} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">{r.type}</td>
                <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{r.encounter}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    {r.signedBy.map((s) => (
                      <span key={s} className="text-gray-700 whitespace-nowrap">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    <span className="text-slate-800 whitespace-nowrap">{r.signedOn}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{r.time}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${RECENT_STATUS_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="View"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <Eye size={15} strokeWidth={1.8} />
                    </button>
                    {r.status === "Pending" ? (
                      <button
                        type="button"
                        aria-label="Send"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Send size={15} strokeWidth={1.8} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Download"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Download size={15} strokeWidth={1.8} />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="More"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                    >
                      <MoreVertical size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DOCUMENT_CATEGORIES_OVERVIEW: { label: string; count: number }[] = [
  { label: "Clinical Documents", count: 18 },
  { label: "Identity Documents", count: 6 },
  { label: "Medical Certificates", count: 7 },
  { label: "Legal & Medico-Legal", count: 4 },
  { label: "Insurance Documents", count: 5 },
  { label: "Referral & External", count: 12 },
  { label: "Others", count: 8 },
];

function DocumentCategoriesOverviewCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Document Categories</h2>
        <button type="button" className="text-sm font-semibold text-teal-700 hover:underline">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {DOCUMENT_CATEGORIES_OVERVIEW.map((c) => (
          <div key={c.label} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2.5 text-gray-700">
              <Folder size={16} strokeWidth={1.8} className="text-teal-700" />
              {c.label}
            </span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {c.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="flex flex-col gap-5">
      <StatCardsRow />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3">
          <ConsentStatusOverviewCard />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityCard />
        </div>
        <div className="lg:col-span-5">
          <QuickActionsOverviewCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentConsentsCard />
        </div>
        <DocumentCategoriesOverviewCard />
      </div>
    </div>
  );
}

/* ============================================================================
   CONSENTS TAB (previously the page's only view)
   ========================================================================== */

const CONSENT_TYPES: { icon: LucideIcon; label: string; count: number }[] = [
  { icon: Stethoscope, label: "Treatment Consent", count: 4 },
  { icon: Scissors, label: "Surgery Consent", count: 3 },
  { icon: Syringe, label: "Procedure Consent", count: 2 },
  { icon: Wind, label: "Anesthesia Consent", count: 1 },
  { icon: Droplet, label: "Blood Transfusion", count: 1 },
  { icon: FlaskConical, label: "Research Consent", count: 1 },
  { icon: Camera, label: "Photography Consent", count: 0 },
  { icon: FileText, label: "Other Consent", count: 0 },
];

function ConsentTypesCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Consent Types</h2>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-md bg-emerald-50">
          <span className="text-sm font-semibold text-emerald-700">All Consent Types</span>
          <span className="text-xs font-semibold text-emerald-700">12</span>
        </div>
        {CONSENT_TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Icon size={15} strokeWidth={1.8} className="text-teal-700 shrink-0" />
                {t.label}
              </span>
              <span className="text-xs font-medium text-gray-400">{t.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_SEGMENTS = [
  { label: "Active", value: 9, pct: "75%", dot: "bg-emerald-500", stroke: "stroke-emerald-500" },
  { label: "Expired", value: 2, pct: "16.7%", dot: "bg-amber-500", stroke: "stroke-amber-500" },
  { label: "Revoked", value: 1, pct: "8.3%", dot: "bg-red-500", stroke: "stroke-red-500" },
];

function ConsentStatusDonut() {
  const size = 96;
  const r = 34;
  const sw = 16;
  const c = 2 * Math.PI * r;
  const total = STATUS_SEGMENTS.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {STATUS_SEGMENTS.map((s) => {
          const len = (c * s.value) / total;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              className={s.stroke}
              strokeWidth={sw}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
            />
          );
          acc += len;
          return el;
        })}
      </g>
    </svg>
  );
}

function ConsentStatusCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Consent Status</h2>
      <div className="flex items-center gap-4">
        <ConsentStatusDonut />
        <div className="flex flex-col gap-2">
          {STATUS_SEGMENTS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <span className="text-gray-700">{s.label}</span>
              <span className="text-gray-400 text-xs">
                {s.value} ({s.pct})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type RecordStatus = "Active" | "Expired" | "Revoked";

const RECORD_STATUS_STYLES: Record<RecordStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Expired: "bg-amber-100 text-amber-700",
  Revoked: "bg-red-50 text-red-600",
};

type RecordRow = {
  icon: LucideIcon;
  iconClass: string;
  name: string;
  desc: string;
  status: RecordStatus;
  signedOn: string;
  validUntil: string;
};

const RECORDS: RecordRow[] = [
  {
    icon: FileText,
    iconClass: "bg-blue-50 text-blue-600",
    name: "General Treatment Consent",
    desc: "Consent for general medical treatment",
    status: "Active",
    signedOn: "May 22, 2026",
    validUntil: "May 22, 2027",
  },
  {
    icon: Scissors,
    iconClass: "bg-blue-50 text-blue-600",
    name: "Surgery Consent",
    desc: "Appendectomy Procedure",
    status: "Active",
    signedOn: "May 15, 2026",
    validUntil: "Jun 15, 2026",
  },
  {
    icon: Wind,
    iconClass: "bg-red-50 text-red-500",
    name: "Anesthesia Consent",
    desc: "General Anesthesia",
    status: "Active",
    signedOn: "May 15, 2026",
    validUntil: "Jun 15, 2026",
  },
  {
    icon: Droplet,
    iconClass: "bg-red-50 text-red-500",
    name: "Blood Transfusion Consent",
    desc: "Consent for blood transfusion if needed",
    status: "Active",
    signedOn: "May 15, 2026",
    validUntil: "Jun 15, 2026",
  },
  {
    icon: FlaskConical,
    iconClass: "bg-purple-50 text-purple-500",
    name: "Research Consent",
    desc: "Use of data for clinical research",
    status: "Expired",
    signedOn: "Jan 15, 2026",
    validUntil: "May 15, 2026",
  },
  {
    icon: Camera,
    iconClass: "bg-pink-50 text-pink-500",
    name: "Photography Consent",
    desc: "Medical photography for documentation",
    status: "Revoked",
    signedOn: "Jan 15, 2026",
    validUntil: "—",
  },
];

function ConsentsPagination() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-1 border-t border-gray-100">
      <span className="text-sm text-gray-500">Showing 1 to 6 of 12 records</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        {[1, 2].map((p) => (
          <button
            key={p}
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              p === 1
                ? "bg-teal-700 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <div className="relative ml-2">
          <select className="appearance-none border border-gray-300 rounded-md pl-3 pr-7 h-8 text-sm text-gray-700 bg-white">
            <option>10 / page</option>
            <option>25 / page</option>
            <option>50 / page</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

type ConsentFilters = { status: string };
const EMPTY_CONSENT_FILTERS: ConsentFilters = { status: "All" };

function ConsentRecordsCard() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useSessionFilters<ConsentFilters>("consent-records-filters", EMPTY_CONSENT_FILTERS);

  const filteredRecords = useMemo(() => {
    return RECORDS.filter((r) => {
      if (filters.status !== "All" && r.status !== filters.status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.desc.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, filters]);

  const chips: FilterChip[] = filters.status !== "All" ? [{ key: "status", label: "Status", value: filters.status }] : [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Consent Records{" "}
          <span className="text-gray-400 font-normal text-base">({filteredRecords.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search consent..."
              className="h-9 pl-9 pr-3 w-48 border border-gray-300 rounded-md text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
            />
          </div>
          <FilterPopoverButton activeCount={chips.length}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">Status</span>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ status: e.target.value })}
                    className="w-full appearance-none border border-gray-300 rounded-md pl-3 pr-8 h-9 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
                  >
                    {["All", "Active", "Expired", "Revoked"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} strokeWidth={2} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </FilterPopoverButton>
          <button
            type="button"
            aria-label="More options"
            className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <MoreVertical size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Consent security"
            className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ShieldCheck size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <FilterChips chips={chips} onRemove={() => setFilters(EMPTY_CONSENT_FILTERS)} onClearAll={() => setFilters(EMPTY_CONSENT_FILTERS)} />

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Consent Type", "Purpose / Description", "Status", "Signed On", "Valid Until", "Signed By", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2.5 pr-4 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  No consent records match the current filters.
                </td>
              </tr>
            )}
            {filteredRecords.map((r) => {
              const Icon = r.icon;
              return (
                <tr key={r.name} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.iconClass}`}>
                        <Icon size={15} strokeWidth={1.8} />
                      </span>
                      <span className="font-semibold text-slate-900 whitespace-nowrap">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{r.desc}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${RECORD_STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{r.signedOn}</td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{r.validUntil}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 whitespace-nowrap">Abebe Kebede</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">Patient</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="View"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Eye size={15} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        aria-label="More actions"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <MoreVertical size={15} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConsentsPagination />
    </div>
  );
}

const SUMMARY_STATS: { label: string; value: number; cls: string }[] = [
  { label: "Total Consents", value: 12, cls: "text-slate-900" },
  { label: "Active", value: 9, cls: "text-emerald-600" },
  { label: "Expired", value: 2, cls: "text-amber-600" },
  { label: "Revoked", value: 1, cls: "text-red-600" },
];

function ConsentSummaryCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Consent Summary</h2>
        <button type="button" className="text-sm font-medium text-teal-700 hover:underline">
          View Report
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SUMMARY_STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className={`font-heading text-xl font-bold ${s.cls}`}>{s.value}</span>
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const UPCOMING_EXPIRY = [
  { name: "Surgery Consent", date: "Jun 15, 2026" },
  { name: "Anesthesia Consent", date: "Jun 15, 2026" },
  { name: "Blood Transfusion Consent", date: "Jun 15, 2026" },
];

function UpcomingExpiryCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Upcoming Expiry</h2>
        <button type="button" className="text-sm font-medium text-teal-700 hover:underline">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {UPCOMING_EXPIRY.map((e) => (
          <div key={e.name} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <CalendarIcon size={16} strokeWidth={1.8} />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{e.name}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">Expires in 24 days</span>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">{e.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CONSENTS_QUICK_ACTIONS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: Upload, title: "Upload Document", subtitle: "Upload patient related document" },
  { icon: FileText, title: "Use Template", subtitle: "Create consent from template" },
  { icon: Printer, title: "Print Consent", subtitle: "Print selected consent" },
  { icon: PenTool, title: "Request E-Signature", subtitle: "Send consent for digital signature" },
];

function ConsentsQuickActionsCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
      <div className="flex flex-col gap-1">
        {CONSENTS_QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              type="button"
              className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-teal-700 bg-teal-50">
                <Icon size={16} strokeWidth={2} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-gray-500">{a.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConsentsTab() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-5">
        <ConsentTypesCard />
        <ConsentStatusCard />
      </div>
      <div className="col-span-12 lg:col-span-6 xl:col-span-7">
        <ConsentRecordsCard />
      </div>
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
        <ConsentSummaryCard />
        <UpcomingExpiryCard />
        <ConsentsQuickActionsCard />
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function ConsentDocumentsForm() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto flex flex-col gap-5">
      <Breadcrumb />
      <PageHeader />
      <PatientInfoBanner />
      <IconUnderlineTabs tabs={ICON_TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "Overview" && <OverviewTab />}
      {activeTab === "Consents" && <ConsentsTab />}
      {activeTab !== "Overview" && activeTab !== "Consents" && (
        <UnderDevelopment entry={null} fallbackSlug={[slugify(activeTab)]} />
      )}
    </div>
  );
}
