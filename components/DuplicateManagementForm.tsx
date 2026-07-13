"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Clock,
  Users,
  BadgeCheck,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreVertical,
  ChevronRight as CaretRight,
  Combine,
  FlagOff,
  TrendingUp,
  RotateCcw,
  Hourglass,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Filter,
  FilterX,
  X,
  type LucideIcon,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import PatientProfileTabs from "@/components/PatientProfileTabs";
import { FieldLabel, inputClass, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { useSessionFilters, type FilterChip } from "@/components/TableFilters";

/* ---------- types ---------- */

type Confidence = "High" | "Medium" | "Low";
type GroupStatus = "New" | "In Review" | "Resolved";
type RecordBadge = "primary" | "possible-match" | "possible-conflict";

type GroupRecord = {
  name: string;
  badge: RecordBadge;
  mrn: string;
  nationalId: string;
  dob: string;
  gender: string;
};

type DuplicateGroup = {
  id: string;
  primaryName: string;
  primaryMrn: string;
  confidencePct: number;
  confidence: Confidence;
  records: number;
  duplicateType: string;
  department: string;
  detectedDate: string;
  detectedDateISO: string;
  detectedTime: string;
  status: GroupStatus;
  records_detail: GroupRecord[];
};

/* ---------- mock data ---------- */

const DUPLICATE_GROUPS: DuplicateGroup[] = [
  {
    id: "DG-2026-00042",
    primaryName: "Selamawit Abebe Desta",
    primaryMrn: "MRN-2026-000123",
    confidencePct: 96,
    confidence: "High",
    records: 3,
    duplicateType: "Same National ID",
    department: "General Medicine",
    detectedDate: "05/21/2026",
    detectedDateISO: "2026-05-21",
    detectedTime: "10:24 AM",
    status: "New",
    records_detail: [
      { name: "Selamawit Abebe Desta", badge: "primary", mrn: "MRN-2026-000123", nationalId: "1001-2345-6789", dob: "05/12/1992", gender: "Female" },
      { name: "Selamawit A. Desta", badge: "possible-match", mrn: "MRN-2025-009876", nationalId: "1001-2345-6789", dob: "05/12/1992", gender: "Female" },
      { name: "Selamawit Abebe", badge: "possible-conflict", mrn: "MRN-2026-001234", nationalId: "1001-2345-6789", dob: "05/12/1992", gender: "Female" },
    ],
  },
  {
    id: "DG-2026-00041",
    primaryName: "Bekele Hailu Tesfaye",
    primaryMrn: "MRN-2026-000456",
    confidencePct: 92,
    confidence: "High",
    records: 2,
    duplicateType: "Similar Name + DOB",
    department: "Surgery",
    detectedDate: "05/21/2026",
    detectedDateISO: "2026-05-21",
    detectedTime: "09:11 AM",
    status: "New",
    records_detail: [
      { name: "Bekele Hailu Tesfaye", badge: "primary", mrn: "MRN-2026-000456", nationalId: "1002-3456-7890", dob: "03/22/1988", gender: "Male" },
      { name: "Bekele H. Tesfaye", badge: "possible-match", mrn: "MRN-2025-008812", nationalId: "1002-3456-7891", dob: "03/22/1988", gender: "Male" },
    ],
  },
  {
    id: "DG-2026-00040",
    primaryName: "Alemu Getahun",
    primaryMrn: "MRN-2026-000789",
    confidencePct: 88,
    confidence: "Medium",
    records: 2,
    duplicateType: "Phone + DOB Match",
    department: "Pediatrics",
    detectedDate: "05/20/2026",
    detectedDateISO: "2026-05-20",
    detectedTime: "04:45 PM",
    status: "In Review",
    records_detail: [
      { name: "Alemu Getahun", badge: "primary", mrn: "MRN-2026-000789", nationalId: "1003-7788-9900", dob: "11/09/1975", gender: "Male" },
      { name: "Alemu G. Bekele", badge: "possible-conflict", mrn: "MRN-2025-005541", nationalId: "1003-7788-9901", dob: "11/09/1975", gender: "Male" },
    ],
  },
  {
    id: "DG-2026-00039",
    primaryName: "Hana Yohannes",
    primaryMrn: "MRN-2026-000321",
    confidencePct: 85,
    confidence: "Medium",
    records: 2,
    duplicateType: "Similar Name",
    department: "General Medicine",
    detectedDate: "05/20/2026",
    detectedDateISO: "2026-05-20",
    detectedTime: "11:03 AM",
    status: "New",
    records_detail: [
      { name: "Hana Yohannes", badge: "primary", mrn: "MRN-2026-000321", nationalId: "1004-2233-4455", dob: "14/06/1995", gender: "Female" },
      { name: "Hanna Yohannes", badge: "possible-match", mrn: "MRN-2025-007733", nationalId: "1004-2233-4456", dob: "14/06/1995", gender: "Female" },
    ],
  },
  {
    id: "DG-2026-00038",
    primaryName: "Tesfaye Abera",
    primaryMrn: "MRN-2026-000654",
    confidencePct: 70,
    confidence: "Low",
    records: 2,
    duplicateType: "Address + DOB Match",
    department: "Pharmacy",
    detectedDate: "05/19/2026",
    detectedDateISO: "2026-05-19",
    detectedTime: "02:22 PM",
    status: "Resolved",
    records_detail: [
      { name: "Tesfaye Abera", badge: "primary", mrn: "MRN-2026-000654", nationalId: "1005-6611-2233", dob: "27/01/1983", gender: "Male" },
      { name: "Tesfaye Aberra", badge: "possible-match", mrn: "MRN-2025-004420", nationalId: "1005-6611-2234", dob: "27/01/1983", gender: "Male" },
    ],
  },
];

/* ---------- styles ---------- */

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  High: "bg-teal-700 text-white",
  Medium: "bg-teal-100 text-teal-800",
  Low: "bg-slate-100 text-slate-500",
};

const STATUS_STYLES: Record<GroupStatus, string> = {
  New: "bg-amber-50 text-amber-700",
  "In Review": "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

const RECORD_BADGE_STYLES: Record<RecordBadge, { label: string; className: string }> = {
  primary: { label: "Primary (Likely Match)", className: "bg-emerald-50 text-emerald-700" },
  "possible-match": { label: "Possible Duplicate", className: "bg-emerald-50 text-emerald-700" },
  "possible-conflict": { label: "Possible Duplicate", className: "bg-red-50 text-red-600" },
};

/* ---------- KPI row — dashboard-matching style ---------- */

type KpiCard = {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: string;
  sublabel: string;
};

const DUPLICATE_KPI_CARDS: KpiCard[] = [
  { icon: Clock,      iconBg: "bg-[#216E6A]", label: "Potential Duplicates",   value: "42",      sublabel: "Groups" },
  { icon: Users,      iconBg: "bg-[#DB5567]", label: "Records Involved",       value: "126",     sublabel: "Patient Records" },
  { icon: BadgeCheck, iconBg: "bg-[#5C8E64]", label: "High Confidence",        value: "18",      sublabel: "≥ 90% Match" },
  { icon: ShieldCheck,iconBg: "bg-[#627EC1]", label: "Resolved (This Month)",  value: "31",      sublabel: "Duplicates Merged" },
];

const MERGE_KPI_CARDS: KpiCard[] = [
  { icon: Combine,    iconBg: "bg-[#216E6A]", label: "Total Merges (All-Time)",  value: "214",     sublabel: "Duplicate Groups Resolved" },
  { icon: TrendingUp, iconBg: "bg-[#5C8E64]", label: "Merges This Month",        value: "31",      sublabel: "May 2026" },
  { icon: Users,      iconBg: "bg-[#627EC1]", label: "Records Consolidated",     value: "468",     sublabel: "Secondary Records Folded In" },
  { icon: Clock,      iconBg: "bg-[#F8A05F]", label: "Avg. Resolution Time",     value: "2.4 Days",sublabel: "Detection to Merge" },
];

function KpiRow({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 py-4 px-4 bg-white border border-[#F1F5F9] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] min-w-0 box-border"
          >
            <span className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 ${card.iconBg}`}>
              <Icon size={24} strokeWidth={2} color="#ffffff" />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#475569] mb-1 leading-snug">{card.label}</div>
              <div className="font-semibold text-[#0F172A] text-[22px] mb-1 leading-[1.1] whitespace-nowrap">
                {card.value}
              </div>
              <div className="text-[13px] font-medium text-[#94A3B8] whitespace-nowrap">{card.sublabel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- shared filter primitives ---------- */

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
    <div className="flex flex-col gap-1">
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
        <div className="flex-1 min-w-0">
          <DatePicker
            key={`from-${clearKey}`}
            placeholder="From"
            className={`w-full rounded-md ${activeFieldClass(!!active)}`}
            onChange={(d) => onFromChange(toISO(d))}
          />
        </div>
        <span className="text-gray-400 text-xs shrink-0 select-none">—</span>
        <div className="flex-1 min-w-0">
          <DatePicker
            key={`to-${clearKey}`}
            placeholder="To"
            className={`w-full rounded-md ${activeFieldClass(!!active)}`}
            onChange={(d) => onToChange(toISO(d))}
          />
        </div>
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
              p === currentPage
                ? "bg-teal-700 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
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

/* =========================================================================
   Duplicate Review tab
   ========================================================================= */

type DupFilters = {
  search: string;
  confidence: string;
  duplicateType: string;
  status: string;
  department: string;
  dateFrom: string;
  dateTo: string;
};

const EMPTY_DUP_FILTERS: DupFilters = {
  search: "",
  confidence: "All",
  duplicateType: "All",
  status: "All",
  department: "All",
  dateFrom: "",
  dateTo: "",
};

function applyDupFilters(groups: DuplicateGroup[], f: DupFilters): DuplicateGroup[] {
  return groups.filter((g) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !g.primaryName.toLowerCase().includes(q) &&
        !g.primaryMrn.toLowerCase().includes(q) &&
        !g.id.toLowerCase().includes(q)
      )
        return false;
    }
    if (f.confidence !== "All" && g.confidence !== f.confidence) return false;
    if (f.duplicateType !== "All" && g.duplicateType !== f.duplicateType) return false;
    if (f.status !== "All" && g.status !== f.status) return false;
    if (f.department !== "All" && g.department !== f.department) return false;
    if (f.dateFrom && g.detectedDateISO < f.dateFrom) return false;
    if (f.dateTo && g.detectedDateISO > f.dateTo) return false;
    return true;
  });
}

const DUP_ADVANCED_DEFAULTS: Pick<DupFilters, "confidence" | "duplicateType" | "status" | "department" | "dateFrom" | "dateTo"> = {
  confidence: "All",
  duplicateType: "All",
  status: "All",
  department: "All",
  dateFrom: "",
  dateTo: "",
};

function buildDupChips(f: DupFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.confidence !== "All") chips.push({ key: "confidence", label: "Confidence", value: f.confidence });
  if (f.duplicateType !== "All") chips.push({ key: "duplicateType", label: "Duplicate Type", value: f.duplicateType });
  if (f.status !== "All") chips.push({ key: "status", label: "Status", value: f.status });
  if (f.department !== "All") chips.push({ key: "department", label: "Department", value: f.department });
  if (f.dateFrom || f.dateTo) chips.push({ key: "detectedDate", label: "Detected Date", value: `${f.dateFrom || "…"} – ${f.dateTo || "…"}` });
  return chips;
}

function FilterBar({
  filters,
  clearKey,
  onChange,
  onClearAdvanced,
}: {
  filters: DupFilters;
  clearKey: number;
  onChange: (f: Partial<DupFilters>) => void;
  onRemoveChip: (key: string) => void;
  onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = buildDupChips(filters).length;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, MRN, Group ID…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className={`${inputClass} pl-9`}
          />
          <Search size={16} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="dup-review-filters-panel"
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
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            id="dup-review-filters-panel"
            aria-hidden={!filtersOpen}
            className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100"
          >
            <ControlledSelect
              label="Match Confidence"
              value={filters.confidence}
              onChange={(v) => onChange({ confidence: v })}
              options={["All", "High", "Medium", "Low"]}
            />
            <ControlledSelect
              label="Duplicate Type"
              value={filters.duplicateType}
              onChange={(v) => onChange({ duplicateType: v })}
              options={["All", "Same National ID", "Similar Name + DOB", "Phone + DOB Match", "Similar Name", "Address + DOB Match"]}
            />
            <ControlledSelect
              label="Status"
              value={filters.status}
              onChange={(v) => onChange({ status: v })}
              options={["All", "New", "In Review", "Resolved"]}
            />
            <ControlledSelect
              label="Department"
              value={filters.department}
              onChange={(v) => onChange({ department: v })}
              options={["All", "General Medicine", "Pediatrics", "Surgery", "Pharmacy"]}
            />
            <DateRangePicker
              label="Detected Date"
              clearKey={clearKey}
              active={!!(filters.dateFrom || filters.dateTo)}
              onFromChange={(v) => onChange({ dateFrom: v })}
              onToChange={(v) => onChange({ dateTo: v })}
            />
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
    </div>
  );
}

function DuplicateGroupsTable({
  groups,
  total,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  selectedId,
  onSelect,
}: {
  groups: DuplicateGroup[];
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">
        Duplicate Groups
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              {["#", "Group ID", "Primary Patient (Likely Match)", "Match Confidence", "Records", "Duplicate Type", "Detected Date", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide p-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-gray-400">
                  No duplicate groups match the current filters.
                </td>
              </tr>
            ) : (
              groups.map((g, idx) => {
                const isSelected = g.id === selectedId;
                return (
                  <tr
                    key={g.id}
                    onClick={() => onSelect(g.id)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-2.5 text-sm text-gray-400 font-medium tabular-nums w-8">
                      {startRow + idx}
                    </td>
                    <td className="p-2.5 text-slate-800 font-medium whitespace-nowrap">{g.id}</td>
                    <td className="p-2.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{g.primaryName}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">MRN: {g.primaryMrn}</span>
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-medium">{g.confidencePct}%</span>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${CONFIDENCE_STYLES[g.confidence]}`}>
                          {g.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-gray-600">{g.records}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{g.duplicateType}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{g.detectedDate}</span>
                        <span className="text-xs text-gray-400">{g.detectedTime}</span>
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[g.status]}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelect(g.id); }}
                          className="h-8 px-3.5 border border-gray-300 rounded-l-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r-0"
                        >
                          {g.status === "Resolved" ? "View" : "Review"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="More actions"
                          className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical size={15} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
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

/* ---------- right sidebar: group details ---------- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function GroupDetailsCard({ group }: { group: DuplicateGroup }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Duplicate Group Details</h2>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${CONFIDENCE_STYLES[group.confidence]}`}>
          {group.confidence} Confidence
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <DetailRow label="Group ID" value={group.id} />
        <DetailRow label="Detected On" value={`${group.detectedDate} ${group.detectedTime}`} />
        <DetailRow label="Match Confidence" value={`${group.confidencePct}%`} />
        <DetailRow label="Duplicate Type" value={group.duplicateType} />
        <DetailRow label="Total Records" value={String(group.records)} />
        <DetailRow label="Status" value={group.status} />
      </div>
    </div>
  );
}

function RecordCard({ record, index }: { record: GroupRecord; index: number }) {
  const badge = RECORD_BADGE_STYLES[record.badge];
  return (
    <button
      type="button"
      className="flex items-start gap-3 w-full text-left p-1 -mx-1 rounded-md hover:bg-gray-50 transition-colors"
    >
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className={`inline-block w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-sm font-bold text-slate-900">{record.name}</span>
        <span className="text-xs text-gray-500">MRN: {record.mrn}</span>
        <span className="text-xs text-gray-500">National ID: {record.nationalId}</span>
        <span className="text-xs text-gray-500">DOB: {record.dob} | {record.gender}</span>
      </div>
      <CaretRight size={16} strokeWidth={2} className="text-gray-300 shrink-0 mt-1" />
    </button>
  );
}

function RecordsInGroupCard({ group }: { group: DuplicateGroup }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Records in this Group</h2>
      <div className="flex flex-col divide-y divide-gray-100">
        {group.records_detail.map((r, i) => (
          <div key={r.mrn} className={i > 0 ? "pt-3 mt-3" : ""}>
            <RecordCard record={r} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarActions() {
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
        <Combine size={16} strokeWidth={2} />
        Review &amp; Merge Records
      </button>
      <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <FlagOff size={16} strokeWidth={2} />
        Mark as False Positive
      </button>
    </div>
  );
}

/* ---------- duplicate group drawer ---------- */

function DuplicateDrawer({
  group,
  onClose,
}: {
  group: DuplicateGroup;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Duplicate Group Details</h2>
            <span className="text-xs text-gray-400">{group.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${CONFIDENCE_STYLES[group.confidence]}`}>
              {group.confidence} Confidence
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Details grid */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-y-4 gap-x-3">
            <DetailRow label="Group ID"          value={group.id} />
            <DetailRow label="Detected On"       value={`${group.detectedDate} ${group.detectedTime}`} />
            <DetailRow label="Match Confidence"  value={`${group.confidencePct}%`} />
            <DetailRow label="Duplicate Type"    value={group.duplicateType} />
            <DetailRow label="Total Records"     value={String(group.records)} />
            <DetailRow label="Status"            value={group.status} />
          </div>

          {/* Records in this group */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Records in this Group</h3>
            <div className="flex flex-col divide-y divide-gray-100">
              {group.records_detail.map((r, i) => {
                const badge = RECORD_BADGE_STYLES[r.badge];
                return (
                  <div key={r.mrn} className={i > 0 ? "pt-3 mt-3" : ""}>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className={`inline-block w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{r.name}</span>
                        <span className="text-xs text-gray-500">MRN: {r.mrn}</span>
                        <span className="text-xs text-gray-500">National ID: {r.nationalId}</span>
                        <span className="text-xs text-gray-500">DOB: {r.dob} | {r.gender}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-200 flex flex-col gap-2.5">
          <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
            <Combine size={16} strokeWidth={2} />
            Review &amp; Merge Records
          </button>
          <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FlagOff size={16} strokeWidth={2} />
            Mark as False Positive
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- duplicate review view ---------- */

function DuplicateReviewView() {
  const [filters, setFilters] = useSessionFilters<DupFilters>("duplicate-groups-filters", EMPTY_DUP_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [clearKey, setClearKey] = useState(0);

  const filteredGroups = useMemo(() => applyDupFilters(DUPLICATE_GROUPS, filters), [filters]);
  const paginatedGroups = useMemo(
    () => filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredGroups, currentPage, pageSize]
  );

  const selectedGroup = selectedId ? DUPLICATE_GROUPS.find((g) => g.id === selectedId) ?? null : null;

  const handleChange = (partial: Partial<DupFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const handleRemoveChip = (key: string) => {
    if (key === "detectedDate") {
      setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
      setClearKey((k) => k + 1);
    } else {
      setFilters((prev) => ({ ...prev, [key]: (DUP_ADVANCED_DEFAULTS as Record<string, string>)[key] }));
    }
    setCurrentPage(1);
  };

  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...DUP_ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
    setCurrentPage(1);
  };

  return (
    <>
      <KpiRow cards={DUPLICATE_KPI_CARDS} />
      <FilterBar
        filters={filters}
        clearKey={clearKey}
        onChange={handleChange}
        onRemoveChip={handleRemoveChip}
        onClearAdvanced={handleClearAdvanced}
      />
      <DuplicateGroupsTable
        groups={paginatedGroups}
        total={filteredGroups.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />

      {selectedGroup && (
        <DuplicateDrawer
          group={selectedGroup}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

/* =========================================================================
   Merge History tab
   ========================================================================= */

type MergeStatus = "Completed" | "Reversed" | "Pending Approval";
type MergedRecord = { mrn: string; name: string };
type Approver = { name: string; role: string } | "auto" | "pending";

type MergeRecord = {
  id: string;
  primaryName: string;
  primaryMrn: string;
  mergedRecords: MergedRecord[];
  mergedBy: { name: string; role: string };
  approvedBy: Approver;
  mergeDate: string;
  mergeDateISO: string;
  mergeTime: string;
  status: MergeStatus;
  reversalReason?: string;
};

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const MERGE_HISTORY: MergeRecord[] = [
  {
    id: "MRG-2026-00031",
    primaryName: "Tesfaye Abera",
    primaryMrn: "MRN-2026-000654",
    mergedRecords: [{ mrn: "MRN-2025-004420", name: "Tesfaye Aberra" }],
    mergedBy: { name: "Selam Getachew", role: "Registration Officer" },
    approvedBy: { name: "Dr. Hanna Bekele", role: "Health Information Officer" },
    mergeDate: "05/19/2026", mergeDateISO: "2026-05-19", mergeTime: "03:10 PM",
    status: "Completed",
  },
  {
    id: "MRG-2026-00030",
    primaryName: "Almaz Tesfaye",
    primaryMrn: "MRN-2026-000901",
    mergedRecords: [{ mrn: "MRN-2025-003317", name: "Almaz T. Wolde" }],
    mergedBy: { name: "Dawit Mekonnen", role: "Registration Officer" },
    approvedBy: { name: "Dr. Hanna Bekele", role: "Health Information Officer" },
    mergeDate: "05/17/2026", mergeDateISO: "2026-05-17", mergeTime: "11:45 AM",
    status: "Completed",
  },
  {
    id: "MRG-2026-00029",
    primaryName: "Kebede Worku",
    primaryMrn: "MRN-2026-000512",
    mergedRecords: [
      { mrn: "MRN-2024-119923", name: "Kebede W. Tadesse" },
      { mrn: "MRN-2025-004471", name: "Kebede Worku T." },
    ],
    mergedBy: { name: "Selam Getachew", role: "Registration Officer" },
    approvedBy: { name: "Dr. Hanna Bekele", role: "Health Information Officer" },
    mergeDate: "05/15/2026", mergeDateISO: "2026-05-15", mergeTime: "09:20 AM",
    status: "Completed",
  },
  {
    id: "MRG-2026-00028",
    primaryName: "Genet Alemu",
    primaryMrn: "MRN-2026-000275",
    mergedRecords: [{ mrn: "MRN-2025-006688", name: "Genet Alemu W." }],
    mergedBy: { name: "Dawit Mekonnen", role: "Registration Officer" },
    approvedBy: "auto",
    mergeDate: "05/12/2026", mergeDateISO: "2026-05-12", mergeTime: "02:05 PM",
    status: "Completed",
  },
  {
    id: "MRG-2026-00027",
    primaryName: "Mulu Fikre",
    primaryMrn: "MRN-2026-000198",
    mergedRecords: [{ mrn: "MRN-2025-002210", name: "Mulu Fikre D." }],
    mergedBy: { name: "Selam Getachew", role: "Registration Officer" },
    approvedBy: { name: "Dr. Hanna Bekele", role: "Health Information Officer" },
    mergeDate: "05/09/2026", mergeDateISO: "2026-05-09", mergeTime: "04:40 PM",
    status: "Reversed",
    reversalReason: "Incorrect match — two different patients sharing a household phone number.",
  },
  {
    id: "MRG-2026-00026",
    primaryName: "Yared Solomon",
    primaryMrn: "MRN-2026-000342",
    mergedRecords: [{ mrn: "MRN-2025-005589", name: "Yared S. Alemayehu" }],
    mergedBy: { name: "Dawit Mekonnen", role: "Registration Officer" },
    approvedBy: "pending",
    mergeDate: "05/08/2026", mergeDateISO: "2026-05-08", mergeTime: "10:15 AM",
    status: "Pending Approval",
  },
];

const MERGE_STATUS_STYLES: Record<MergeStatus, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Reversed: "bg-red-50 text-red-600",
  "Pending Approval": "bg-blue-50 text-blue-700",
};

type MergeFilters = {
  search: string;
  status: string;
  mergedBy: string;
  approvedBy: string;
  dateFrom: string;
  dateTo: string;
};

const EMPTY_MERGE_FILTERS: MergeFilters = {
  search: "",
  status: "All",
  mergedBy: "All Staff",
  approvedBy: "All",
  dateFrom: "",
  dateTo: "",
};

function applyMergeFilters(records: MergeRecord[], f: MergeFilters): MergeRecord[] {
  return records.filter((m) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !m.primaryName.toLowerCase().includes(q) &&
        !m.primaryMrn.toLowerCase().includes(q) &&
        !m.id.toLowerCase().includes(q)
      )
        return false;
    }
    if (f.status !== "All" && m.status !== f.status) return false;
    if (f.mergedBy !== "All Staff" && m.mergedBy.name !== f.mergedBy) return false;
    if (f.approvedBy !== "All") {
      if (f.approvedBy === "Auto-Approved" && m.approvedBy !== "auto") return false;
      if (f.approvedBy === "Pending" && m.approvedBy !== "pending") return false;
      if (
        f.approvedBy !== "Auto-Approved" &&
        f.approvedBy !== "Pending" &&
        (m.approvedBy === "auto" || m.approvedBy === "pending" || m.approvedBy.name !== f.approvedBy)
      )
        return false;
    }
    if (f.dateFrom && m.mergeDateISO < f.dateFrom) return false;
    if (f.dateTo && m.mergeDateISO > f.dateTo) return false;
    return true;
  });
}

const MERGE_ADVANCED_DEFAULTS: Pick<MergeFilters, "status" | "mergedBy" | "approvedBy" | "dateFrom" | "dateTo"> = {
  status: "All",
  mergedBy: "All Staff",
  approvedBy: "All",
  dateFrom: "",
  dateTo: "",
};

function buildMergeChips(f: MergeFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.status !== "All") chips.push({ key: "status", label: "Status", value: f.status });
  if (f.mergedBy !== "All Staff") chips.push({ key: "mergedBy", label: "Merged By", value: f.mergedBy });
  if (f.approvedBy !== "All") chips.push({ key: "approvedBy", label: "Approved By", value: f.approvedBy });
  if (f.dateFrom || f.dateTo) chips.push({ key: "mergeDate", label: "Merge Date", value: `${f.dateFrom || "…"} – ${f.dateTo || "…"}` });
  return chips;
}

function MergeFilterBar({
  filters,
  clearKey,
  onChange,
  onClearAdvanced,
}: {
  filters: MergeFilters;
  clearKey: number;
  onChange: (f: Partial<MergeFilters>) => void;
  onRemoveChip: (key: string) => void;
  onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = buildMergeChips(filters).length;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, MRN, Merge ID…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className={`${inputClass} pl-9`}
          />
          <Search size={16} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="merge-history-filters-panel"
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
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            id="merge-history-filters-panel"
            aria-hidden={!filtersOpen}
            className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100"
          >
            <ControlledSelect
              label="Status"
              value={filters.status}
              onChange={(v) => onChange({ status: v })}
              options={["All", "Completed", "Reversed", "Pending Approval"]}
            />
            <ControlledSelect
              label="Merged By"
              value={filters.mergedBy}
              onChange={(v) => onChange({ mergedBy: v })}
              options={["All Staff", "Selam Getachew", "Dawit Mekonnen"]}
            />
            <ControlledSelect
              label="Approved By"
              value={filters.approvedBy}
              onChange={(v) => onChange({ approvedBy: v })}
              options={["All", "Dr. Hanna Bekele", "Auto-Approved", "Pending"]}
            />
            <DateRangePicker
              label="Merge Date"
              clearKey={clearKey}
              active={!!(filters.dateFrom || filters.dateTo)}
              onFromChange={(v) => onChange({ dateFrom: v })}
              onToChange={(v) => onChange({ dateTo: v })}
            />
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
    </div>
  );
}

function ApproverCell({ approver }: { approver: Approver }) {
  if (approver === "auto") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-teal-50 text-teal-700 whitespace-nowrap">
        <ShieldCheck size={12} strokeWidth={2.5} />
        Auto-Approved
      </span>
    );
  }
  if (approver === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
        <Hourglass size={12} strokeWidth={2.5} />
        Pending
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Avatar initials={initialsOf(approver.name)} />
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-slate-800 whitespace-nowrap">{approver.name}</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{approver.role}</span>
      </div>
    </div>
  );
}

function MergeHistoryTable({
  records,
  total,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  selectedId,
  onSelect,
}: {
  records: MergeRecord[];
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">
        Merge History
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              {["#", "Merge ID", "Primary Patient (Surviving Record)", "Merged By", "Merge Date", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide p-2.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                  No merge records match the current filters.
                </td>
              </tr>
            ) : (
              records.map((m, idx) => {
                const isSelected = m.id === selectedId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-2.5 text-sm text-gray-400 font-medium tabular-nums w-8">
                      {startRow + idx}
                    </td>
                    <td className="p-2.5 text-slate-800 font-medium whitespace-nowrap">{m.id}</td>
                    <td className="p-2.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{m.primaryName}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">MRN: {m.primaryMrn}</span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={initialsOf(m.mergedBy.name)} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-slate-800 whitespace-nowrap">{m.mergedBy.name}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{m.mergedBy.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{m.mergeDate}</span>
                        <span className="text-xs text-gray-400">{m.mergeTime}</span>
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${MERGE_STATUS_STYLES[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSelect(m.id); }}
                          className="h-8 px-3.5 border border-gray-300 rounded-l-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r-0"
                        >
                          {m.status === "Pending Approval" ? "Review" : "View Report"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="More actions"
                          className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical size={15} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
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

/* ---------- right sidebar: merge details ---------- */

function MergeDetailsCard({ merge }: { merge: MergeRecord }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Merge Record Details</h2>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${MERGE_STATUS_STYLES[merge.status]}`}>
          {merge.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <DetailRow label="Merge ID" value={merge.id} />
        <DetailRow label="Merge Date" value={`${merge.mergeDate} ${merge.mergeTime}`} />
        <DetailRow label="Merged By" value={merge.mergedBy.name} />
        <DetailRow
          label="Approved By"
          value={
            merge.approvedBy === "auto"
              ? "Auto-Approved"
              : merge.approvedBy === "pending"
                ? "Pending Review"
                : merge.approvedBy.name
          }
        />
      </div>
    </div>
  );
}

function MergeLineageCard({ merge }: { merge: MergeRecord }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Merge Lineage</h2>
      <div className="flex flex-col">
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2.5">
          <Avatar initials={initialsOf(merge.primaryName)} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{merge.primaryName}</span>
            <span className="text-xs text-emerald-700 whitespace-nowrap">Surviving record &middot; {merge.primaryMrn}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-6 py-1.5">
          <span className="w-px h-5 bg-gray-200" />
          <Combine size={14} strokeWidth={2} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-400 italic">folded into surviving record</span>
        </div>
        <div className="flex flex-col gap-2">
          {merge.mergedRecords.map((r) => (
            <div key={r.mrn} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
              <Avatar initials={initialsOf(r.name)} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{r.name}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{r.mrn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {merge.status === "Reversed" && merge.reversalReason && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-3">
          <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
          <span>{merge.reversalReason}</span>
        </div>
      )}
    </div>
  );
}

function MergeSidebarActions({ merge }: { merge: MergeRecord }) {
  if (merge.status === "Pending Approval") {
    return (
      <div className="flex flex-col gap-3">
        <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
          <ShieldCheck size={16} strokeWidth={2} />
          Approve Merge
        </button>
        <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <ShieldAlert size={16} strokeWidth={2} />
          Reject Merge
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
        <FileText size={16} strokeWidth={2} />
        View Full Audit Log
      </button>
      {merge.status === "Completed" && (
        <button type="button" className="w-full h-11 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <RotateCcw size={16} strokeWidth={2} />
          Reverse Merge
        </button>
      )}
    </div>
  );
}

/* ---------- merge drawer ---------- */

function MergeDrawer({
  merge,
  onClose,
}: {
  merge: MergeRecord;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900">Merge Record Details</h2>
            <span className="text-xs text-gray-400">{merge.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Status + confidence strip */}
          <div className="flex items-center gap-2">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${MERGE_STATUS_STYLES[merge.status]}`}>
              {merge.status}
            </span>
            {merge.status === "Reversed" && (
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                Reversed
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-y-4 gap-x-3">
            <DetailRow label="Merge ID"    value={merge.id} />
            <DetailRow label="Merge Date"  value={`${merge.mergeDate} ${merge.mergeTime}`} />
            <DetailRow label="Merged By"   value={`${merge.mergedBy.name} · ${merge.mergedBy.role}`} />
            <DetailRow
              label="Approved By"
              value={
                merge.approvedBy === "auto"
                  ? "Auto-Approved"
                  : merge.approvedBy === "pending"
                    ? "Pending Review"
                    : `${merge.approvedBy.name} · ${merge.approvedBy.role}`
              }
            />
          </div>

          {/* Merge Lineage */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Merge Lineage</h3>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2.5">
                <Avatar initials={initialsOf(merge.primaryName)} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-900 truncate">{merge.primaryName}</span>
                  <span className="text-xs text-emerald-700 whitespace-nowrap">Surviving record · {merge.primaryMrn}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6 py-1.5">
                <span className="w-px h-5 bg-gray-200" />
                <Combine size={14} strokeWidth={2} className="text-gray-400 shrink-0" />
                <span className="text-[11px] text-gray-400 italic">folded into surviving record</span>
              </div>
              <div className="flex flex-col gap-2">
                {merge.mergedRecords.map((r) => (
                  <div key={r.mrn} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
                    <Avatar initials={initialsOf(r.name)} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-slate-700 truncate">{r.name}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{r.mrn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {merge.status === "Reversed" && merge.reversalReason && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-3">
                <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                <span>{merge.reversalReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-200 flex flex-col gap-2.5">
          <MergeSidebarActions merge={merge} />
        </div>
      </div>
    </>
  );
}

/* ---------- merge history view ---------- */

function MergeHistoryView() {
  const [filters, setFilters] = useSessionFilters<MergeFilters>("merge-history-filters", EMPTY_MERGE_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [clearKey, setClearKey] = useState(0);

  const filteredRecords = useMemo(() => applyMergeFilters(MERGE_HISTORY, filters), [filters]);
  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRecords, currentPage, pageSize]
  );

  const selectedMerge = selectedId ? MERGE_HISTORY.find((m) => m.id === selectedId) ?? null : null;

  const handleChange = (partial: Partial<MergeFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  };

  const handleRemoveChip = (key: string) => {
    if (key === "mergeDate") {
      setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
      setClearKey((k) => k + 1);
    } else {
      setFilters((prev) => ({ ...prev, [key]: (MERGE_ADVANCED_DEFAULTS as Record<string, string>)[key] }));
    }
    setCurrentPage(1);
  };

  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...MERGE_ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
    setCurrentPage(1);
  };

  return (
    <>
      <KpiRow cards={MERGE_KPI_CARDS} />
      <MergeFilterBar
        filters={filters}
        clearKey={clearKey}
        onChange={handleChange}
        onRemoveChip={handleRemoveChip}
        onClearAdvanced={handleClearAdvanced}
      />
      <MergeHistoryTable
        records={paginatedRecords}
        total={filteredRecords.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        selectedId={selectedId ?? ""}
        onSelect={(id) => setSelectedId(id)}
      />

      {selectedMerge && (
        <MergeDrawer
          merge={selectedMerge}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

/* ---------- page ---------- */

export default function DuplicateManagementForm() {
  const [activeTab, setActiveTab] = useState("Duplicate Review");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto flex flex-col gap-6">
      <ModulePageHeader
        title="Duplicate Management"
        breadcrumb="Patient Management > Duplicate Management"
      />
      <PatientProfileTabs
        tabs={["Duplicate Review", "Merge History"]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === "Merge History" ? <MergeHistoryView /> : <DuplicateReviewView />}
    </div>
  );
}
