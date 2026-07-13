"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  ClipboardList,
  ClipboardCheck,
  FlaskConical,
  CircleCheckBig,
  RefreshCw,
  Printer,
  Download,
  Upload,
  Plus,
  Check,
  Filter,
  FilterX,
  ShieldAlert,
  AlertTriangle,
  FileText,
  History,
  TestTube,
  Thermometer,
  Wrench,
  Hash,
  DollarSign,
  GitBranch,
  Archive,
  Table2,
  FolderTree,
  Folder,
  FolderOpen,
  Copy,
  MoreVertical,
  Droplets,
  Microscope,
  Syringe,
  ScanLine,
  Beaker,
  Boxes,
  Send,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card } from "@/components/FormFields";
import PatientProfileTabs from "@/components/PatientProfileTabs";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Test Catalog.
   Enterprise Master Data Management workspace for laboratory investigations:
   the single source of truth every other LIS page (orders, result entry,
   billing, analyzer mapping) reads from. Configuration, not clinical workflow.
   ========================================================================== */

/* ---------- types ---------- */

type TestStatus = "Draft" | "Review" | "Published" | "Active" | "Deprecated" | "Archived";
type Priority = "Routine" | "Urgent" | "STAT";
type RefRangeRow = { group: string; range: string; unit: string; critical: string };
type RevisionEntry = { version: string; date: string; user: string; change: string };

type LabTest = {
  id: string;
  testCode: string;
  loincCode: string;
  name: string;
  shortName: string;
  displayName: string;
  category: string;
  department: string;
  specimenType: string;
  primaryAnalyzer: string;
  backupAnalyzer: string;
  turnaround: string;
  billingPrice: number;
  status: TestStatus;
  priority: Priority;
  isPanel: boolean;
  requiresFasting: boolean;
  clinicalDescription: string;
  instructions: string;
  preparation: string;
  containerType: string;
  tubeColor: string;
  minVolume: string;
  maxVolume: string;
  collectionInstructions: string;
  storageTemp: string;
  transportConditions: string;
  maxStability: string;
  rejectionCriteria: string;
  refRanges: RefRangeRow[];
  analyzerMethod: string;
  calibrationFrequency: string;
  qcRequired: boolean;
  automaticImport: boolean;
  serviceCode: string;
  billingCode: string;
  insuranceCoverage: string;
  taxPct: number;
  packageInclusion: string;
  discountEligible: boolean;
  reportTemplate: string;
  printOrder: number;
  interpretationNotes: string;
  clinicalComments: string;
  abnormalHighlighting: boolean;
  reportGroup: string;
  qcFrequency: string;
  calibrationRequired: boolean;
  westgardRules: string[];
  controlMaterial: string;
  verificationRequirements: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  version: string;
  approvalStatus: string;
  modifiedBy: string;
  revisionHistory: RevisionEntry[];
};

/* ---------- helpers ---------- */

function test(partial: Partial<LabTest> & { id: string; testCode: string; name: string }): LabTest {
  return {
    loincCode: "", shortName: partial.name, displayName: partial.name, category: "Clinical Chemistry", department: "Laboratory",
    specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "6 Hours", billingPrice: 250,
    status: "Active", priority: "Routine", isPanel: false, requiresFasting: false,
    clinicalDescription: "", instructions: "", preparation: "No special preparation required.",
    containerType: "Gold SST Vacutainer", tubeColor: "Gold", minVolume: "2 mL", maxVolume: "5 mL",
    collectionInstructions: "Standard venipuncture.", storageTemp: "2–8°C", transportConditions: "Within 2 hours at room temperature", maxStability: "48 hours refrigerated", rejectionCriteria: "Hemolyzed, clotted, or insufficient volume.",
    refRanges: [{ group: "Adult", range: "See method insert", unit: "", critical: "—" }],
    analyzerMethod: "Automated", calibrationFrequency: "Every 24 hours or per lot change", qcRequired: true, automaticImport: true,
    serviceCode: `SVC-${partial.testCode}`, billingCode: `BILL-${partial.testCode}`, insuranceCoverage: "Covered — Woreda CBHI, Private Insurance", taxPct: 0, packageInclusion: "Not part of a package", discountEligible: true,
    reportTemplate: "Standard Numeric Report", printOrder: 1, interpretationNotes: "", clinicalComments: "", abnormalHighlighting: true, reportGroup: partial.category ?? "Clinical Chemistry",
    qcFrequency: "Daily (2 levels)", calibrationRequired: true, westgardRules: ["1-2s", "1-3s", "2-2s"], controlMaterial: "Manufacturer-matched control", verificationRequirements: "Verify against reference method annually.",
    createdBy: "Dr. Hanna Bekele", createdDate: "01/10/2024", lastUpdated: "05/15/2026", version: "v2.3", approvalStatus: "Approved", modifiedBy: "Martha Alemu",
    revisionHistory: [
      { version: "v2.3", date: "05/15/2026", user: "Martha Alemu", change: "Updated reference range for pediatric group" },
      { version: "v2.2", date: "01/20/2026", user: "Dr. Hanna Bekele", change: "Added backup analyzer mapping" },
      { version: "v1.0", date: "01/10/2024", user: "Dr. Hanna Bekele", change: "Test created" },
    ],
    ...partial,
  };
}

/* ---------- mock data ---------- */

const LAB_TESTS: LabTest[] = [
  test({ id: "t1", testCode: "LAB-T-0001", loincCode: "58410-2", name: "Complete Blood Count (CBC)", shortName: "CBC", category: "Hematology", department: "Hematology", specimenType: "Blood", primaryAnalyzer: "Sysmex XN-550", backupAnalyzer: "Mindray BC-6800", turnaround: "2 Hours", billingPrice: 180, isPanel: true, priority: "Routine",
    clinicalDescription: "Complete blood count including WBC, RBC, hemoglobin, hematocrit, and platelet count.", instructions: "Routine venous draw.",
    containerType: "Purple EDTA Vacutainer", tubeColor: "Purple", minVolume: "2 mL", maxVolume: "3 mL", analyzerMethod: "Flow Cytometry / Impedance",
    refRanges: [
      { group: "Adult Male", range: "13.5 – 17.5 (Hgb)", unit: "g/dL", critical: "< 7.0 or > 20.0" },
      { group: "Adult Female", range: "12.0 – 15.5 (Hgb)", unit: "g/dL", critical: "< 7.0 or > 20.0" },
      { group: "Pediatric", range: "11.0 – 14.0 (Hgb)", unit: "g/dL", critical: "< 6.0 or > 20.0" },
      { group: "Neonate", range: "14.0 – 22.0 (Hgb)", unit: "g/dL", critical: "< 8.0 or > 24.0" },
    ] }),
  test({ id: "t2", testCode: "LAB-T-0011", loincCode: "30341-2", name: "Erythrocyte Sedimentation Rate (ESR)", shortName: "ESR", category: "Hematology", department: "Hematology", specimenType: "Blood", primaryAnalyzer: "Manual / Westergren", backupAnalyzer: "—", turnaround: "1 Hour", billingPrice: 90, priority: "Routine", analyzerMethod: "Westergren (manual)", automaticImport: false,
    refRanges: [{ group: "Adult Male", range: "0 – 15", unit: "mm/hr", critical: "—" }, { group: "Adult Female", range: "0 – 20", unit: "mm/hr", critical: "—" }] }),
  test({ id: "t3", testCode: "LAB-T-0002", loincCode: "24325-3", name: "Liver Function Test (LFT)", shortName: "LFT", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "Abbott Architect i1000", turnaround: "6 Hours", billingPrice: 320, isPanel: true, priority: "Routine",
    clinicalDescription: "Panel including ALT, AST, ALP, total/direct bilirubin, total protein, albumin.",
    refRanges: [{ group: "Adult", range: "7 – 56 (ALT)", unit: "U/L", critical: "> 1000" }] }),
  test({ id: "t4", testCode: "LAB-T-0003", loincCode: "24321-2", name: "Kidney Function Test (KFT)", shortName: "KFT", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "Abbott Architect i1000", turnaround: "6 Hours", billingPrice: 300, isPanel: true, priority: "Routine",
    clinicalDescription: "Panel including creatinine, urea/BUN, electrolytes.",
    refRanges: [{ group: "Adult", range: "0.6 – 1.3 (Creatinine)", unit: "mg/dL", critical: "> 4.0" }] }),
  test({ id: "t5", testCode: "LAB-T-0004", loincCode: "4548-4", name: "HbA1c", shortName: "HbA1c", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "6 Hours", billingPrice: 280, priority: "Routine", requiresFasting: false,
    refRanges: [{ group: "Adult", range: "4.0 – 5.6", unit: "%", critical: "—" }, { group: "Prediabetes", range: "5.7 – 6.4", unit: "%", critical: "—" }, { group: "Diabetes", range: "≥ 6.5", unit: "%", critical: "—" }] }),
  test({ id: "t6", testCode: "LAB-T-0005", loincCode: "2345-7", name: "Blood Glucose (Fasting)", shortName: "Glucose", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "2 Hours", billingPrice: 90, priority: "Routine", requiresFasting: true,
    refRanges: [{ group: "Adult (Fasting)", range: "70 – 110", unit: "mg/dL", critical: "< 40 or > 500" }] }),
  test({ id: "t7", testCode: "LAB-T-0009", loincCode: "13457-7", name: "Lipid Profile", shortName: "Lipid Panel", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "6 Hours", billingPrice: 350, isPanel: true, priority: "Routine", requiresFasting: true,
    refRanges: [{ group: "Adult", range: "< 130 (LDL)", unit: "mg/dL", critical: "—" }] }),
  test({ id: "t8", testCode: "LAB-T-0016", loincCode: "3016-3", name: "Thyroid Function Test (TSH, T3, T4)", shortName: "TFT", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas e411", backupAnalyzer: "—", turnaround: "24 Hours", billingPrice: 450, isPanel: true, priority: "Routine",
    refRanges: [{ group: "Adult", range: "0.4 – 4.0 (TSH)", unit: "mIU/L", critical: "< 0.01 or > 100" }] }),
  test({ id: "t9", testCode: "LAB-T-0018", loincCode: "1989-3", name: "Vitamin D (25-OH)", shortName: "Vit D", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas e411", backupAnalyzer: "—", turnaround: "24 Hours", billingPrice: 400, priority: "Routine",
    refRanges: [{ group: "Adult", range: "30 – 100", unit: "ng/mL", critical: "< 10" }] }),
  test({ id: "t10", testCode: "LAB-T-0019", loincCode: "2276-4", name: "Ferritin", shortName: "Ferritin", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas e411", backupAnalyzer: "—", turnaround: "6 Hours", billingPrice: 320, priority: "Routine",
    refRanges: [{ group: "Adult Male", range: "24 – 336", unit: "ng/mL", critical: "—" }, { group: "Adult Female", range: "11 – 307", unit: "ng/mL", critical: "—" }] }),
  test({ id: "t11", testCode: "LAB-T-0020", loincCode: "2857-1", name: "Prostate Specific Antigen (PSA)", shortName: "PSA", category: "Clinical Chemistry", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas e411", backupAnalyzer: "—", turnaround: "24 Hours", billingPrice: 380, priority: "Routine",
    refRanges: [{ group: "Adult Male", range: "0 – 4.0", unit: "ng/mL", critical: "> 10" }] }),
  test({ id: "t12", testCode: "LAB-T-0006", loincCode: "10839-9", name: "Troponin I", shortName: "Troponin", category: "Immunology", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas e411", backupAnalyzer: "—", turnaround: "1 Hour", billingPrice: 420, priority: "STAT",
    refRanges: [{ group: "Adult", range: "< 0.04", unit: "ng/mL", critical: "> 0.4" }] }),
  test({ id: "t13", testCode: "LAB-T-0007", loincCode: "48065-7", name: "D-Dimer", shortName: "D-Dimer", category: "Immunology", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "2 Hours", billingPrice: 400, priority: "Urgent",
    refRanges: [{ group: "Adult", range: "< 0.5", unit: "µg/mL FEU", critical: "—" }] }),
  test({ id: "t14", testCode: "LAB-T-0008", loincCode: "1988-5", name: "C-Reactive Protein (CRP)", shortName: "CRP", category: "Immunology", department: "Chemistry", specimenType: "Blood", primaryAnalyzer: "Cobas C311", backupAnalyzer: "—", turnaround: "2 Hours", billingPrice: 220, priority: "Routine",
    refRanges: [{ group: "Adult", range: "< 10", unit: "mg/L", critical: "—" }] }),
  test({ id: "t15", testCode: "LAB-T-0013", loincCode: "5195-3", name: "HIV ELISA", shortName: "HIV", category: "Serology", department: "Immunology", specimenType: "Serum", primaryAnalyzer: "Abbott Architect i1000", backupAnalyzer: "Cobas e411", turnaround: "24 Hours", billingPrice: 250, priority: "Routine",
    refRanges: [{ group: "All", range: "Non-reactive", unit: "", critical: "Reactive" }] }),
  test({ id: "t16", testCode: "LAB-T-0014", loincCode: "5195-3", name: "Hepatitis B Surface Antigen (HBsAg)", shortName: "HBsAg", category: "Serology", department: "Immunology", specimenType: "Serum", primaryAnalyzer: "Abbott Architect i1000", backupAnalyzer: "—", turnaround: "24 Hours", billingPrice: 260, priority: "Routine",
    refRanges: [{ group: "All", range: "Non-reactive (< 1.0 S/CO)", unit: "S/CO", critical: "Reactive" }] }),
  test({ id: "t17", testCode: "LAB-T-0012", loincCode: "600-7", name: "Blood Culture", shortName: "Blood C/S", category: "Microbiology", department: "Microbiology", specimenType: "Blood", primaryAnalyzer: "BD BACTEC", backupAnalyzer: "—", turnaround: "3 Days", billingPrice: 550, priority: "Urgent", analyzerMethod: "Automated Culture", requiresFasting: false,
    refRanges: [{ group: "All", range: "No growth", unit: "", critical: "Positive growth" }] }),
  test({ id: "t18", testCode: "LAB-T-0015", loincCode: "94500-6", name: "COVID-19 PCR", shortName: "COVID PCR", category: "Molecular Diagnostics", department: "Microbiology / Molecular", specimenType: "Nasopharyngeal Swab", primaryAnalyzer: "GeneXpert", backupAnalyzer: "Abbott Alinity m", turnaround: "45 Minutes", billingPrice: 500, priority: "Urgent", analyzerMethod: "RT-PCR",
    refRanges: [{ group: "All", range: "Negative", unit: "Ct", critical: "Positive" }] }),
  test({ id: "t19", testCode: "LAB-T-0017", loincCode: "60586-5", name: "Malaria Microscopy", shortName: "Malaria", category: "Parasitology", department: "Microbiology", specimenType: "Blood", primaryAnalyzer: "Manual / Microscopy", backupAnalyzer: "—", turnaround: "1 Hour", billingPrice: 150, priority: "STAT", analyzerMethod: "Thick & thin blood film microscopy", automaticImport: false,
    refRanges: [{ group: "All", range: "No parasites seen", unit: "", critical: "Parasites detected" }] }),
  test({ id: "t20", testCode: "LAB-T-0010", loincCode: "5811-5", name: "Urinalysis", shortName: "UA", category: "Urinalysis", department: "Pathology", specimenType: "Urine", primaryAnalyzer: "Manual / Dipstick", backupAnalyzer: "—", turnaround: "2 Hours", billingPrice: 100, priority: "Routine", analyzerMethod: "Dipstick + Microscopy", automaticImport: false, status: "Draft",
    refRanges: [{ group: "All", range: "Negative / Normal", unit: "", critical: "—" }] }),
];

const CATEGORY_ICONS: Record<string, typeof FlaskConical> = {
  Hematology: Droplets,
  "Clinical Chemistry": FlaskConical,
  Immunology: ShieldAlert,
  Serology: TestTube,
  Microbiology: Microscope,
  Parasitology: Microscope,
  Virology: ScanLine,
  Histopathology: Beaker,
  Cytology: Beaker,
  "Molecular Diagnostics": Boxes,
  "Blood Bank": Droplets,
  Urinalysis: Syringe,
};

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS);
const DEPARTMENTS = ["Hematology", "Chemistry", "Immunology", "Microbiology", "Microbiology / Molecular", "Pathology"];
const ANALYZERS = ["Sysmex XN-550", "Cobas C311", "Cobas e411", "Mindray BC-6800", "GeneXpert", "Abbott Architect i1000", "Abbott Alinity m", "BD BACTEC", "Manual / Westergren", "Manual / Microscopy", "Manual / Dipstick"];
const SPECIMEN_TYPES = ["Blood", "Serum", "Plasma", "Urine", "Nasopharyngeal Swab"];
const QUICK_STATUS_CHIPS = ["All", "Active", "Inactive", "Routine", "STAT", "Panel Tests", "Standalone Tests", "Requires Fasting"];
const TAB_NAMES = ["General", "Specimen", "Reference Range", "Analyzer", "Billing", "Reporting", "Quality", "Audit"];

/* ---------- style maps ---------- */

const STATUS_STYLES: Record<TestStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Review: "bg-amber-50 text-amber-700",
  Published: "bg-blue-50 text-blue-700",
  Active: "bg-emerald-50 text-emerald-700",
  Deprecated: "bg-amber-50 text-amber-700",
  Archived: "bg-gray-100 text-gray-400",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  Routine: "bg-teal-50 text-teal-700",
  Urgent: "bg-amber-50 text-amber-700",
  STAT: "bg-red-600 text-white",
};

function isInactive(status: TestStatus) {
  return status === "Archived" || status === "Deprecated" || status === "Draft";
}

function matchesQuickStatus(t: LabTest, q: string): boolean {
  if (q === "All") return true;
  if (q === "Active") return t.status === "Active" || t.status === "Published";
  if (q === "Inactive") return isInactive(t.status);
  if (q === "Routine" || q === "STAT") return t.priority === q;
  if (q === "Panel Tests") return t.isPanel;
  if (q === "Standalone Tests") return !t.isPanel;
  if (q === "Requires Fasting") return t.requiresFasting;
  return true;
}

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof ClipboardList; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(tests: LabTest[]): KpiCard[] {
  const active = tests.filter((t) => t.status === "Active" || t.status === "Published").length;
  const inactive = tests.filter((t) => isInactive(t.status)).length;
  const categories = new Set(tests.map((t) => t.category)).size;
  const analyzerMappings = new Set(tests.map((t) => t.primaryAnalyzer)).size;
  const pendingReview = tests.filter((t) => t.status === "Review" || t.status === "Draft").length;

  return [
    { icon: Table2, iconBg: "bg-[#216E6A]", label: "Total Tests", value: String(tests.length), sublabel: "In master catalog", quickFilter: "All" },
    { icon: CircleCheckBig, iconBg: "bg-[#5C8E64]", label: "Active Tests", value: String(active), sublabel: "Orderable now", quickFilter: "Active" },
    { icon: Archive, iconBg: "bg-[#94A3B8]", label: "Inactive Tests", value: String(inactive), sublabel: "Draft / deprecated / archived", quickFilter: "Inactive" },
    { icon: FolderTree, iconBg: "bg-[#627EC1]", label: "Test Categories", value: String(categories), sublabel: "Across the catalog", quickFilter: "All" },
    { icon: Boxes, iconBg: "bg-[#216E6A]", label: "Analyzer Mappings", value: String(analyzerMappings), sublabel: "Distinct primary analyzers", quickFilter: "All" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Pending Review", value: String(pendingReview), sublabel: "Awaiting publication", quickFilter: "Inactive" },
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

/* ---------- filters state ---------- */

type SearchField = "All Fields" | "Test Name" | "LOINC Code" | "Internal Code" | "Analyzer" | "Category" | "Department" | "Specimen Type" | "Billing Code";

type CatalogFilters = {
  searchBy: SearchField;
  query: string;
  category: string;
  status: string;
  analyzer: string;
  department: string;
  specimen: string;
  billing: string;
};

const EMPTY_FILTERS: CatalogFilters = {
  searchBy: "All Fields", query: "", category: "All", status: "All", analyzer: "All Analyzers", department: "All", specimen: "All", billing: "All",
};

const ADVANCED_DEFAULTS: Omit<CatalogFilters, "searchBy" | "query"> = {
  category: "All", status: "All", analyzer: "All Analyzers", department: "All", specimen: "All", billing: "All",
};

function matchesSearch(t: LabTest, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Test Name": t.name, "LOINC Code": t.loincCode, "Internal Code": t.testCode, Analyzer: t.primaryAnalyzer, Category: t.category, Department: t.department, "Specimen Type": t.specimenType, "Billing Code": t.billingCode,
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(tests: LabTest[], f: CatalogFilters, quickStatus: string, activeCategory: string | null): LabTest[] {
  return tests.filter((t) => {
    if (!matchesSearch(t, f.searchBy, f.query)) return false;
    if (activeCategory && t.category !== activeCategory) return false;
    if (f.category !== "All" && t.category !== f.category) return false;
    if (f.status !== "All" && t.status !== f.status) return false;
    if (f.analyzer !== "All Analyzers" && t.primaryAnalyzer !== f.analyzer) return false;
    if (f.department !== "All" && t.department !== f.department) return false;
    if (f.specimen !== "All" && t.specimenType !== f.specimen) return false;
    if (!matchesQuickStatus(t, quickStatus)) return false;
    return true;
  });
}

function countActiveFilters(f: CatalogFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  return n;
}

/* ---------- filter bar ---------- */

function CatalogFilterBar({
  filters, quickStatus, onChange, onQuickStatus, onClearAdvanced,
}: {
  filters: CatalogFilters; quickStatus: string;
  onChange: (partial: Partial<CatalogFilters>) => void; onQuickStatus: (q: string) => void; onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select value={filters.searchBy} onChange={(e) => onChange({ searchBy: e.target.value as SearchField })} className={`${inputClass} pr-8 appearance-none bg-white`}>
            {(["All Fields", "Test Name", "LOINC Code", "Internal Code", "Analyzer", "Category", "Department", "Specimen Type", "Billing Code"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by test name, LOINC, internal code…" : `Search by ${filters.searchBy}`}
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
          aria-controls="catalog-filters-panel"
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
          <div id="catalog-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Category" value={filters.category} onChange={(v) => onChange({ category: v })} options={["All", ...ALL_CATEGORIES]} />
            <ControlledSelect label="Status" value={filters.status} onChange={(v) => onChange({ status: v })} options={["All", "Draft", "Review", "Published", "Active", "Deprecated", "Archived"]} />
            <ControlledSelect label="Analyzer" value={filters.analyzer} onChange={(v) => onChange({ analyzer: v })} options={["All Analyzers", ...ANALYZERS]} />
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Specimen" value={filters.specimen} onChange={(v) => onChange({ specimen: v })} options={["All", ...SPECIMEN_TYPES]} />
            <ControlledSelect label="Billing" value={filters.billing} onChange={(v) => onChange({ billing: v })} options={["All", "Standard Price", "Package Only"]} />
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

/* ---------- left panel: category explorer ---------- */

const SUBCATEGORIES: Record<string, string[]> = {
  "Clinical Chemistry": ["Liver Panel", "Renal Panel", "Lipid Panel", "Endocrine"],
};

function CategoryExplorer({
  tests, activeCategory, onSelectCategory,
}: {
  tests: LabTest[]; activeCategory: string | null; onSelectCategory: (c: string | null) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_CATEGORIES.forEach((c) => { counts[c] = tests.filter((t) => t.category === c).length; });
    return counts;
  }, [tests]);

  const visibleCategories = ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 flex flex-col gap-3">
      <SectionHeading icon={FolderTree} iconTone="bg-teal-50 text-teal-700" title="Category Explorer" />
      <div className="relative">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories…" className={`${inputClass} pl-8 text-sm`} />
        <Search size={14} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={`flex items-center gap-2 text-sm font-semibold rounded-md px-2.5 py-2 transition-colors ${activeCategory === null ? "bg-teal-50 text-teal-800" : "text-slate-700 hover:bg-gray-50"}`}
      >
        <Table2 size={14} strokeWidth={2.25} /> All Tests
        <span className="ml-auto text-xs font-semibold text-gray-400">{tests.length}</span>
      </button>
      <div className="flex flex-col gap-0.5 max-h-[560px] overflow-y-auto">
        {visibleCategories.map((c) => {
          const Icon = CATEGORY_ICONS[c] ?? FlaskConical;
          const subcats = SUBCATEGORIES[c];
          const isExpanded = !!expanded[c];
          const isActive = activeCategory === c;
          return (
            <div key={c}>
              <button
                type="button"
                onClick={() => onSelectCategory(c)}
                className={`w-full flex items-center gap-2 text-sm rounded-md px-2.5 py-2 transition-colors ${isActive ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-700 hover:bg-gray-50"}`}
              >
                {subcats && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [c]: !p[c] })); }}
                    className="text-gray-400 hover:text-slate-600 shrink-0"
                  >
                    <ChevronRight size={13} strokeWidth={2.25} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                  </span>
                )}
                {!subcats && <span className="w-[13px] shrink-0" />}
                {isActive ? <FolderOpen size={14} strokeWidth={2.25} className="shrink-0" /> : <Icon size={14} strokeWidth={2.25} className="shrink-0 text-gray-400" />}
                <span className="truncate">{c}</span>
                <span className="ml-auto text-xs font-medium text-gray-400 shrink-0">{categoryCounts[c] ?? 0}</span>
              </button>
              {subcats && isExpanded && (
                <div className="ml-8 flex flex-col gap-0.5 mt-0.5">
                  {subcats.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-gray-500 px-2.5 py-1.5">
                      <Folder size={12} strokeWidth={2} className="text-gray-300 shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- center panel: catalog table ---------- */

function CatalogTable({
  tests, selectedId, onSelect, selectedIds, onToggleSelect, onToggleSelectAll,
}: {
  tests: LabTest[]; selectedId: string | null; onSelect: (id: string) => void;
  selectedIds: string[]; onToggleSelect: (id: string) => void; onToggleSelectAll: () => void;
}) {
  const allSelected = tests.length > 0 && tests.every((t) => selectedIds.includes(t.id));
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">Laboratory Test Catalog</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="p-2.5 w-7">
                <button type="button" onClick={onToggleSelectAll} className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${allSelected ? "bg-teal-700" : "border border-gray-300 bg-white"}`} aria-label="Select all rows">
                  {allSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                </button>
              </th>
              {["Test Code", "LOINC Code", "Test Name", "Category", "Department", "Specimen", "Analyzer", "TAT", "Price (ETB)", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-10 text-center text-sm text-gray-400">No tests match the current filters.</td>
              </tr>
            ) : (
              tests.map((t) => {
                const isSelected = t.id === selectedId;
                const isChecked = selectedIds.includes(t.id);
                return (
                  <tr key={t.id} onClick={() => onSelect(t.id)} className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"}`}>
                    <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => onToggleSelect(t.id)} className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${isChecked ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
                        {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
                      </button>
                    </td>
                    <td className="p-2.5 font-mono text-slate-800 whitespace-nowrap">{t.testCode}</td>
                    <td className="p-2.5 font-mono text-gray-500 whitespace-nowrap">{t.loincCode || "—"}</td>
                    <td className="p-2.5 min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{t.name}</span>
                        {t.isPanel && <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-violet-700 bg-violet-50 rounded-full px-1.5 py-0.5">Panel</span>}
                        {t.requiresFasting && <Thermometer size={11} strokeWidth={2.25} className="text-amber-500 shrink-0" aria-label="Requires fasting" />}
                      </div>
                    </td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{t.category}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{t.department}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{t.specimenType}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{t.primaryAnalyzer}</td>
                    <td className="p-2.5 text-gray-600 whitespace-nowrap">{t.turnaround}</td>
                    <td className="p-2.5 text-slate-700 font-semibold whitespace-nowrap">{t.billingPrice.toLocaleString()}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        <button type="button" onClick={() => onSelect(t.id)} className="h-8 px-2.5 border border-gray-300 rounded-l-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r-0">
                          Configure
                        </button>
                        <button type="button" aria-label="More actions" className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50 transition-colors">
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
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {tests.length} test{tests.length !== 1 ? "s" : ""}</span>
        <span>{selectedIds.length} selected</span>
      </div>
    </div>
  );
}

/* ---------- right panel: tabbed configuration workspace ---------- */

function GeneralTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1"><FieldLabel required>Test Name</FieldLabel><input value={t.name} onChange={(e) => onChange("name", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel required>Internal Code</FieldLabel><input value={t.testCode} onChange={(e) => onChange("testCode", e.target.value)} disabled={disabled} className={`${inputClass} font-mono disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>LOINC Code</FieldLabel><input value={t.loincCode} onChange={(e) => onChange("loincCode", e.target.value)} disabled={disabled} className={`${inputClass} font-mono disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Short Name</FieldLabel><input value={t.shortName} onChange={(e) => onChange("shortName", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Display Name</FieldLabel><input value={t.displayName} onChange={(e) => onChange("displayName", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Category</FieldLabel>
          <div className="relative">
            <select value={t.category} onChange={(e) => onChange("category", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Department</FieldLabel>
          <div className="relative">
            <select value={t.department} onChange={(e) => onChange("department", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Priority</FieldLabel>
          <div className="relative">
            <select value={t.priority} onChange={(e) => onChange("priority", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {["Routine", "Urgent", "STAT"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1"><FieldLabel>Clinical Description</FieldLabel><textarea value={t.clinicalDescription} onChange={(e) => onChange("clinicalDescription", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Instructions</FieldLabel><textarea value={t.instructions} onChange={(e) => onChange("instructions", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Preparation</FieldLabel><textarea value={t.preparation} onChange={(e) => onChange("preparation", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Status</span>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[t.status]}`}>{t.status}</span>
      </div>
    </div>
  );
}

function SpecimenTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <FieldLabel>Specimen Type</FieldLabel>
          <div className="relative">
            <select value={t.specimenType} onChange={(e) => onChange("specimenType", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {SPECIMEN_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1"><FieldLabel>Container Type</FieldLabel><input value={t.containerType} onChange={(e) => onChange("containerType", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Tube Color</FieldLabel><input value={t.tubeColor} onChange={(e) => onChange("tubeColor", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Storage Temperature</FieldLabel><input value={t.storageTemp} onChange={(e) => onChange("storageTemp", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Minimum Volume</FieldLabel><input value={t.minVolume} onChange={(e) => onChange("minVolume", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Maximum Volume</FieldLabel><input value={t.maxVolume} onChange={(e) => onChange("maxVolume", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Maximum Stability</FieldLabel><input value={t.maxStability} onChange={(e) => onChange("maxStability", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Transport Conditions</FieldLabel><input value={t.transportConditions} onChange={(e) => onChange("transportConditions", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      </div>
      <div className="flex flex-col gap-1"><FieldLabel>Collection Instructions</FieldLabel><textarea value={t.collectionInstructions} onChange={(e) => onChange("collectionInstructions", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Rejection Criteria</FieldLabel><textarea value={t.rejectionCriteria} onChange={(e) => onChange("rejectionCriteria", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
    </div>
  );
}

function ReferenceRangeTab({ t }: { t: LabTest }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400">Reference ranges support multiple age and gender-specific groups. Configure normal and critical values for each.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Group", "Normal Range", "Unit", "Critical Value"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.refRanges.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">{r.group}</td>
                <td className="p-2 text-slate-700 whitespace-nowrap">{r.range}</td>
                <td className="p-2 text-gray-500 whitespace-nowrap">{r.unit || "—"}</td>
                <td className="p-2 whitespace-nowrap">
                  {r.critical && r.critical !== "—" ? <span className="text-red-600 font-semibold">{r.critical}</span> : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="self-start flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors">
        <Plus size={13} strokeWidth={2.5} /> Add Reference Range Group
      </button>
    </div>
  );
}

function AnalyzerTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <FieldLabel>Primary Analyzer</FieldLabel>
          <div className="relative">
            <select value={t.primaryAnalyzer} onChange={(e) => onChange("primaryAnalyzer", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {ANALYZERS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Backup Analyzer</FieldLabel>
          <div className="relative">
            <select value={t.backupAnalyzer} onChange={(e) => onChange("backupAnalyzer", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
              {["—", ...ANALYZERS].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1"><FieldLabel>Analyzer Method</FieldLabel><input value={t.analyzerMethod} onChange={(e) => onChange("analyzerMethod", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Calibration Frequency</FieldLabel><input value={t.calibrationFrequency} onChange={(e) => onChange("calibrationFrequency", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      </div>
      <div className="flex items-center gap-6 pt-1">
        <label className={`flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.qcRequired ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>{t.qcRequired && <Check size={11} strokeWidth={3} className="text-white" />}</span>
          <span className="text-sm text-slate-700">QC Required</span>
        </label>
        <label className={`flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
          <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.automaticImport ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>{t.automaticImport && <Check size={11} strokeWidth={3} className="text-white" />}</span>
          <span className="text-sm text-slate-700">Automatic Import</span>
        </label>
      </div>
    </div>
  );
}

function BillingTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1"><FieldLabel>Service Code</FieldLabel><input value={t.serviceCode} onChange={(e) => onChange("serviceCode", e.target.value)} disabled={disabled} className={`${inputClass} font-mono disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Billing Code</FieldLabel><input value={t.billingCode} onChange={(e) => onChange("billingCode", e.target.value)} disabled={disabled} className={`${inputClass} font-mono disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel required>Price (ETB)</FieldLabel><input type="number" value={t.billingPrice} onChange={(e) => onChange("billingPrice", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Tax (%)</FieldLabel><input type="number" value={t.taxPct} onChange={(e) => onChange("taxPct", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1 col-span-2"><FieldLabel>Insurance Coverage</FieldLabel><input value={t.insuranceCoverage} onChange={(e) => onChange("insuranceCoverage", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1 col-span-2"><FieldLabel>Package Inclusion</FieldLabel><input value={t.packageInclusion} onChange={(e) => onChange("packageInclusion", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      <label className={`flex items-center gap-2.5 col-span-2 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.discountEligible ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>{t.discountEligible && <Check size={11} strokeWidth={3} className="text-white" />}</span>
        <span className="text-sm text-slate-700">Discount Eligible</span>
      </label>
    </div>
  );
}

function ReportingTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1"><FieldLabel>Report Template</FieldLabel><input value={t.reportTemplate} onChange={(e) => onChange("reportTemplate", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Report Group</FieldLabel><input value={t.reportGroup} onChange={(e) => onChange("reportGroup", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Print Order</FieldLabel><input type="number" value={t.printOrder} onChange={(e) => onChange("printOrder", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      </div>
      <div className="flex flex-col gap-1"><FieldLabel>Interpretation Notes</FieldLabel><textarea value={t.interpretationNotes} onChange={(e) => onChange("interpretationNotes", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <div className="flex flex-col gap-1"><FieldLabel>Clinical Comments</FieldLabel><textarea value={t.clinicalComments} onChange={(e) => onChange("clinicalComments", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <label className={`flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.abnormalHighlighting ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>{t.abnormalHighlighting && <Check size={11} strokeWidth={3} className="text-white" />}</span>
        <span className="text-sm text-slate-700">Abnormal Highlighting</span>
      </label>
    </div>
  );
}

function QualityTab({ t, onChange, disabled }: { t: LabTest; onChange: (f: keyof LabTest, v: string) => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1"><FieldLabel>QC Frequency</FieldLabel><input value={t.qcFrequency} onChange={(e) => onChange("qcFrequency", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
        <div className="flex flex-col gap-1"><FieldLabel>Control Material</FieldLabel><input value={t.controlMaterial} onChange={(e) => onChange("controlMaterial", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50`} /></div>
      </div>
      <div className="flex flex-col gap-1">
        <FieldLabel>Westgard Rules</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {t.westgardRules.length === 0 ? <span className="text-xs text-gray-400">None configured</span> : t.westgardRules.map((r) => (
            <span key={r} className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 rounded-full px-2.5 py-1">{r}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1"><FieldLabel>Verification Requirements</FieldLabel><textarea value={t.verificationRequirements} onChange={(e) => onChange("verificationRequirements", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50`} /></div>
      <label className={`flex items-center gap-2.5 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
        <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.calibrationRequired ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>{t.calibrationRequired && <Check size={11} strokeWidth={3} className="text-white" />}</span>
        <span className="text-sm text-slate-700">Calibration Required</span>
      </label>
    </div>
  );
}

function AuditTab({ t }: { t: LabTest }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-x-4 divide-y divide-gray-100">
        <InfoRow label="Created By" value={t.createdBy} />
        <InfoRow label="Created Date" value={t.createdDate} />
        <InfoRow label="Last Updated" value={t.lastUpdated} />
        <InfoRow label="Version" value={t.version} />
        <InfoRow label="Approval Status" value={t.approvalStatus} valueClass="text-emerald-600" />
        <InfoRow label="Modified By" value={t.modifiedBy} />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2 block">Revision History</span>
        <div className="flex flex-col">
          {t.revisionHistory.map((r, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full shrink-0 bg-gray-300" />
                {i < t.revisionHistory.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
              </div>
              <div className="flex flex-col pb-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 font-mono">{r.version}</span>
                  <span className="text-[11px] text-gray-400">{r.date}</span>
                </div>
                <span className="text-xs text-gray-600">{r.change}</span>
                <span className="text-[11px] text-gray-400">{r.user}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestConfigurationPanel({
  t, onFieldChange, disabled,
}: {
  t: LabTest; onFieldChange: (f: keyof LabTest, v: string) => void; disabled: boolean;
}) {
  const [activeTab, setActiveTab] = useState("General");
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">{t.name}</span>
          <span className="text-xs text-gray-400 font-mono truncate">{t.testCode} · {t.loincCode || "No LOINC"}</span>
        </div>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${STATUS_STYLES[t.status]}`}>{t.status}</span>
      </div>
      <PatientProfileTabs tabs={TAB_NAMES} active={activeTab} onChange={setActiveTab} />
      <div className="pt-4">
        {activeTab === "General" && <GeneralTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Specimen" && <SpecimenTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Reference Range" && <ReferenceRangeTab t={t} />}
        {activeTab === "Analyzer" && <AnalyzerTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Billing" && <BillingTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Reporting" && <ReportingTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Quality" && <QualityTab t={t} onChange={onFieldChange} disabled={disabled} />}
        {activeTab === "Audit" && <AuditTab t={t} />}
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

function TestQuickActionsCard() {
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={Plus} label="Create Test" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" />
        <QuickActionTile icon={Copy} label="Duplicate Test" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
        <QuickActionTile icon={ShieldAlert} label="Deactivate" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" />
        <QuickActionTile icon={Archive} label="Archive" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={Boxes} label="Assign Analyzer" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" />
        <QuickActionTile icon={DollarSign} label="Configure Billing" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
        <QuickActionTile icon={History} label="View Audit" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={FileText} label="Preview Report" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
      </div>
    </Card>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-colors">
        <Plus size={15} strokeWidth={2.25} /> New Laboratory Test
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Upload size={15} strokeWidth={2.25} /> Import Catalog
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export Catalog
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function TestCatalogForm() {
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [quickStatus, setQuickStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(LAB_TESTS[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [testsState, setTestsState] = useState<LabTest[]>(LAB_TESTS);

  const kpiCards = useMemo(() => buildKpiCards(testsState), [testsState]);

  const filteredTests = useMemo(() => applyFilters(testsState, filters, quickStatus, activeCategory), [testsState, filters, quickStatus, activeCategory]);

  const selectedTest = testsState.find((t) => t.id === selectedTestId) ?? null;
  const readOnly = selectedTest ? selectedTest.status === "Archived" : false;

  const handleChange = (partial: Partial<CatalogFilters>) => setFilters((prev) => ({ ...prev, ...partial }));
  const handleQuickStatus = (q: string) => setQuickStatus(q);
  const handleClearAdvanced = () => setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));

  const toggleSelect = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const allSelected = filteredTests.length > 0 && filteredTests.every((t) => prev.includes(t.id));
      if (allSelected) return prev.filter((id) => !filteredTests.some((t) => t.id === id));
      const merged = new Set(prev);
      filteredTests.forEach((t) => merged.add(t.id));
      return Array.from(merged);
    });

  const handleFieldChange = (field: keyof LabTest, value: string) => {
    if (!selectedTestId) return;
    setTestsState((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTestId) return t;
        if (field === "billingPrice" || field === "taxPct" || field === "printOrder") {
          return { ...t, [field]: Number(value) || 0 };
        }
        return { ...t, [field]: value };
      })
    );
  };

  const canPublish = !!selectedTest && (selectedTest.status === "Draft" || selectedTest.status === "Review");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1900px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Laboratory Test Catalog"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Test Catalog"
          subtitle="Manage laboratory investigations, reference ranges, analyzers, specimen requirements, billing configuration, and reporting templates."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickStatus} />

        <CatalogFilterBar
          filters={filters}
          quickStatus={quickStatus}
          onChange={handleChange}
          onQuickStatus={handleQuickStatus}
          onClearAdvanced={handleClearAdvanced}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[25fr_50fr_25fr] gap-4 items-start">
          {/* LEFT — Category Navigation */}
          <div className="min-w-0">
            <CategoryExplorer tests={testsState} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
          </div>

          {/* CENTER — Test Catalog Table */}
          <div className="min-w-0">
            <CatalogTable
              tests={filteredTests}
              selectedId={selectedTestId}
              onSelect={setSelectedTestId}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
            />
          </div>

          {/* RIGHT — Selected Test Details */}
          <div className="flex flex-col gap-4 min-w-0">
            {selectedTest ? (
              <>
                <TestConfigurationPanel t={selectedTest} onFieldChange={handleFieldChange} disabled={readOnly} />
                <TestQuickActionsCard />
              </>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center text-sm text-gray-400">
                Select a test from the catalog to configure it here.
              </div>
            )}
          </div>
        </div>
      </div>

      <StickyFooter
        left={<FooterButton tone="danger">Cancel</FooterButton>}
        right={
          <>
            <FooterButton tone="neutral">
              <FileText size={15} strokeWidth={2.25} /> Save Draft
            </FooterButton>
            <button type="button" disabled={!canPublish} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white transition-colors">
              <Send size={15} strokeWidth={2.25} />
              Publish Test
            </button>
          </>
        }
      />
    </div>
  );
}
