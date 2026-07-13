"use client";

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
  Droplets,
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
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Check,
  Paperclip,
  Filter,
  FilterX,
  X,
  AlarmClock,
  Syringe,
  Tag,
  Send,
  Minus,
  Plus,
  Phone,
  Thermometer,
  Timer,
  Beaker,
  MapPin,
  IdCard,
  BadgeCheck,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Sample Collection worklist.
   Used by technicians / phlebotomists to verify identity, collect specimens,
   print barcode labels, and hand samples off to laboratory processing once a
   doctor's Investigation Order has appeared in Test Orders.
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";

type CollectionStatus =
  | "Waiting Patient"
  | "Identity Verified"
  | "Collection Started"
  | "Collected"
  | "Label Printed"
  | "Sent to Laboratory"
  | "Received by Laboratory"
  | "Rejected";

type SpecimenType = "Blood" | "Urine" | "Stool" | "Sputum" | "Swab" | "Serum" | "Plasma" | "CSF" | "Biopsy" | "Saliva" | "Other";

type SampleCondition = "Normal" | "Hemolyzed" | "Insufficient" | "Contaminated";

type OrderedTest = {
  name: string;
  specimen: SpecimenType;
  tube: string;
  volume: string;
  fasting: boolean;
  priority: Priority;
  turnaround: string;
};

type SampleOrder = {
  id: string;
  specimenId: string;
  barcode: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  department: string;
  doctor: string;
  tests: OrderedTest[];
  priority: Priority;
  specimen: SpecimenType;
  collectionRoom: string;
  status: CollectionStatus;
  overdue: boolean;
  requestedAt: string;
  requestedAtISO: string;
  estimatedCollectionTime: string;
  technician: string | null;
  insurance: string;
  bloodGroup: string;
  diagnosis: string;
  clinicalNotes: string;
  allergies: string[];
  specialInstructions: string;
  specimenPrep: string;
  previousLabHistory: string;
  attachments: string[];
  emergencyContact: string;
  labelsPrinted: number;
  rejectionReason?: string;
  duplicateOf?: string;
};

/* ---------- mock data ---------- */

const SAMPLE_ORDERS: SampleOrder[] = [
  {
    id: "LAB-2026-000451", specimenId: "SPC-2026-08811", barcode: "8891234500451",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female", phone: "0911 234 567",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: [
      { name: "CBC", specimen: "Blood", tube: "Purple EDTA", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "2 Hours" },
      { name: "HbA1c", specimen: "Blood", tube: "Purple EDTA", volume: "2 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
      { name: "Blood Glucose", specimen: "Blood", tube: "Grey Fluoride", volume: "2 mL", fasting: true, priority: "Routine", turnaround: "2 Hours" },
      { name: "Lipid Profile", specimen: "Blood", tube: "Gold SST", volume: "5 mL", fasting: true, priority: "Routine", turnaround: "6 Hours" },
    ],
    priority: "Routine", specimen: "Blood", collectionRoom: "Phlebotomy Room 2",
    status: "Waiting Patient", overdue: false,
    requestedAt: "05/21/2026 · 09:40 AM", requestedAtISO: "2026-05-21", estimatedCollectionTime: "10:15 AM",
    technician: null, insurance: "Woreda 07 CBHI", bloodGroup: "O+",
    diagnosis: "Hypertension, T2DM follow-up", clinicalNotes: "Routine diabetic/hypertensive follow-up bloodwork.",
    allergies: ["Penicillin"], specialInstructions: "Patient anxious about needles — please reassure. 8-hour fast confirmed.",
    specimenPrep: "8-hour fast required for Glucose & Lipid Profile.",
    previousLabHistory: "HbA1c 7.2% (Feb 2026) · Lipid panel borderline high LDL (Feb 2026)",
    attachments: ["Lipid_Panel_Feb2026.pdf"], emergencyContact: "Abebe T. · 0911 987 654",
    labelsPrinted: 0,
  },
  {
    id: "LAB-2026-000418", specimenId: "SPC-2026-08380", barcode: "8891234500418",
    patientName: "Almaz Tesfaye", mrn: "MRN-2026-000901", age: 48, gender: "Female", phone: "0922 456 789",
    department: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: [
      { name: "CBC", specimen: "Blood", tube: "Purple EDTA", volume: "3 mL", fasting: false, priority: "STAT", turnaround: "1 Hour" },
      { name: "Blood Culture", specimen: "Blood", tube: "Yellow SPS", volume: "10 mL", fasting: false, priority: "STAT", turnaround: "3 Days" },
      { name: "Malaria RDT", specimen: "Blood", tube: "Purple EDTA", volume: "1 mL", fasting: false, priority: "STAT", turnaround: "30 Min" },
    ],
    priority: "STAT", specimen: "Blood", collectionRoom: "ER Bay 1",
    status: "Waiting Patient", overdue: true,
    requestedAt: "05/21/2026 · 11:02 AM", requestedAtISO: "2026-05-21", estimatedCollectionTime: "11:10 AM",
    technician: null, insurance: "Woreda 07 CBHI", bloodGroup: "A+",
    diagnosis: "High-grade fever, rigors — rule out sepsis / malaria", clinicalNotes: "Temp 39.8°C, rigors, tachycardic.",
    allergies: ["NKDA"], specialInstructions: "Draw blood cultures before any antibiotics — STAT priority.",
    specimenPrep: "2 blood culture sets from separate sites, aseptic technique.",
    previousLabHistory: "No previous admission on file.", attachments: [], emergencyContact: "Yohannes A. · 0922 111 222",
    labelsPrinted: 0, duplicateOf: "LAB-2026-000410",
  },
  {
    id: "LAB-2026-000448", specimenId: "SPC-2026-08790", barcode: "8891234500448",
    patientName: "Abebe Bekele", mrn: "MRN-2026-000789", age: 27, gender: "Male", phone: "0933 654 321",
    department: "Pediatrics", doctor: "Dr. Dawit Bekele",
    tests: [
      { name: "Urinalysis", specimen: "Urine", tube: "Sterile Container", volume: "10 mL", fasting: false, priority: "Urgent", turnaround: "2 Hours" },
    ],
    priority: "Urgent", specimen: "Urine", collectionRoom: "Lab Counter 1",
    status: "Identity Verified", overdue: false,
    requestedAt: "05/21/2026 · 08:05 AM", requestedAtISO: "2026-05-21", estimatedCollectionTime: "08:45 AM",
    technician: "Selam Getachew", insurance: "Private Insurance — Nyala", bloodGroup: "B+",
    diagnosis: "Suspected UTI", clinicalNotes: "Dysuria x3 days, low-grade fever.",
    allergies: [], specialInstructions: "Midstream clean-catch sample.", specimenPrep: "No fasting required.",
    previousLabHistory: "No previous UTI episodes on record.", attachments: [], emergencyContact: "Bekele M. · 0933 111 333",
    labelsPrinted: 0,
  },
  {
    id: "LAB-2026-000442", specimenId: "SPC-2026-08655", barcode: "8891234500442",
    patientName: "Marta Alemu", mrn: "MRN-2026-000567", age: 29, gender: "Female", phone: "0944 112 233",
    department: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: [
      { name: "Troponin", specimen: "Blood", tube: "Gold SST", volume: "3 mL", fasting: false, priority: "STAT", turnaround: "1 Hour" },
      { name: "CBC", specimen: "Blood", tube: "Purple EDTA", volume: "3 mL", fasting: false, priority: "STAT", turnaround: "1 Hour" },
      { name: "Electrolytes", specimen: "Blood", tube: "Gold SST", volume: "3 mL", fasting: false, priority: "STAT", turnaround: "1 Hour" },
    ],
    priority: "STAT", specimen: "Blood", collectionRoom: "ER Bay 3",
    status: "Collection Started", overdue: false,
    requestedAt: "05/21/2026 · 10:12 AM", requestedAtISO: "2026-05-21", estimatedCollectionTime: "10:20 AM",
    technician: "Dawit Mekonnen", insurance: "Self-Pay", bloodGroup: "O-",
    diagnosis: "Acute chest pain, rule out ACS", clinicalNotes: "Central crushing chest pain radiating to left arm, onset 45 min ago.",
    allergies: ["NKDA"], specialInstructions: "STAT — page cardiology on result.", specimenPrep: "No fasting required.",
    previousLabHistory: "No prior cardiac workup on file.", attachments: [], emergencyContact: "Alemu K. · 0944 555 666",
    labelsPrinted: 0,
  },
  {
    id: "LAB-2026-000447", specimenId: "SPC-2026-08774", barcode: "8891234500447",
    patientName: "Alemu Getahun", mrn: "MRN-2026-000234", age: 51, gender: "Male", phone: "0911 555 777",
    department: "Cardiology", doctor: "Dr. Eyob Tesfaye",
    tests: [
      { name: "Lipid Profile", specimen: "Blood", tube: "Gold SST", volume: "5 mL", fasting: true, priority: "Routine", turnaround: "6 Hours" },
      { name: "KFT", specimen: "Blood", tube: "Gold SST", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
      { name: "BNP", specimen: "Plasma", tube: "Green Heparin", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
    ],
    priority: "Routine", specimen: "Blood", collectionRoom: "IPD Ward B",
    status: "Collected", overdue: false,
    requestedAt: "05/20/2026 · 07:15 PM", requestedAtISO: "2026-05-20", estimatedCollectionTime: "07:50 PM",
    technician: "Dawit Mekonnen", insurance: "Woreda 07 CBHI", bloodGroup: "AB+",
    diagnosis: "Congestive heart failure monitoring", clinicalNotes: "Post-admission cardiac panel, daily electrolytes.",
    allergies: ["Sulfa drugs"], specialInstructions: "Fluid-restricted patient — confirm draw volume.",
    specimenPrep: "12-hour fast for Lipid Profile.", previousLabHistory: "BNP elevated on admission (May 18).",
    attachments: ["Admission_ECG.pdf"], emergencyContact: "Getahun W. · 0911 222 444", labelsPrinted: 1,
  },
  {
    id: "LAB-2026-000444", specimenId: "SPC-2026-08702", barcode: "8891234500444",
    patientName: "Hana Yohannes", mrn: "MRN-2026-000321", age: 45, gender: "Female", phone: "0922 987 654",
    department: "General Medicine", doctor: "Dr. Hana Alemayehu",
    tests: [
      { name: "HbA1c", specimen: "Blood", tube: "Purple EDTA", volume: "2 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
      { name: "Lipid Profile", specimen: "Blood", tube: "Gold SST", volume: "5 mL", fasting: true, priority: "Routine", turnaround: "6 Hours" },
      { name: "Urinalysis", specimen: "Urine", tube: "Sterile Container", volume: "10 mL", fasting: false, priority: "Routine", turnaround: "2 Hours" },
    ],
    priority: "Routine", specimen: "Blood", collectionRoom: "Lab Counter 1",
    status: "Label Printed", overdue: false,
    requestedAt: "05/20/2026 · 10:30 AM", requestedAtISO: "2026-05-20", estimatedCollectionTime: "10:55 AM",
    technician: "Selam Getachew", insurance: "Woreda 07 CBHI", bloodGroup: "B-",
    diagnosis: "Type 2 Diabetes annual review", clinicalNotes: "Annual metabolic screening panel.",
    allergies: [], specialInstructions: "", specimenPrep: "12-hour fast for Lipid Profile.",
    previousLabHistory: "HbA1c 6.8% (Nov 2025).", attachments: [], emergencyContact: "Yohannes B. · 0922 333 555",
    labelsPrinted: 2,
  },
  {
    id: "LAB-2026-000441", specimenId: "SPC-2026-08650", barcode: "8891234500441",
    patientName: "Tesfaye Abera", mrn: "MRN-2026-000654", age: 62, gender: "Male", phone: "0933 222 111",
    department: "Orthopedics", doctor: "Dr. Dawit Bekele",
    tests: [
      { name: "CBC", specimen: "Blood", tube: "Purple EDTA", volume: "3 mL", fasting: false, priority: "Urgent", turnaround: "3 Hours" },
      { name: "Coagulation Profile", specimen: "Plasma", tube: "Blue Citrate", volume: "3 mL", fasting: false, priority: "Urgent", turnaround: "3 Hours" },
      { name: "Group & Crossmatch", specimen: "Blood", tube: "Pink EDTA", volume: "5 mL", fasting: false, priority: "Urgent", turnaround: "3 Hours" },
    ],
    priority: "Urgent", specimen: "Blood", collectionRoom: "OT Pre-Op Holding",
    status: "Sent to Laboratory", overdue: false,
    requestedAt: "05/20/2026 · 06:00 AM", requestedAtISO: "2026-05-20", estimatedCollectionTime: "06:20 AM",
    technician: "Dawit Mekonnen", insurance: "Private Insurance — Nyala", bloodGroup: "O+",
    diagnosis: "Pre-operative workup, total hip replacement", clinicalNotes: "Cleared for surgery pending final CBC & crossmatch.",
    allergies: ["NKDA"], specialInstructions: "2 units packed red cells on standby.", specimenPrep: "No fasting required.",
    previousLabHistory: "Hb 12.1 g/dL (pre-admission).", attachments: ["Consent_Form.pdf", "Anesthesia_Clearance.pdf"],
    emergencyContact: "Abera S. · 0933 444 888", labelsPrinted: 3,
  },
  {
    id: "LAB-2026-000439", specimenId: "SPC-2026-08611", barcode: "8891234500439",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female", phone: "0911 777 888",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: [
      { name: "CBC", specimen: "Blood", tube: "Purple EDTA", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "2 Hours" },
      { name: "Peripheral Smear", specimen: "Blood", tube: "Purple EDTA", volume: "1 mL", fasting: false, priority: "Routine", turnaround: "2 Hours" },
    ],
    priority: "Routine", specimen: "Blood", collectionRoom: "Lab Counter 1",
    status: "Received by Laboratory", overdue: false,
    requestedAt: "05/19/2026 · 11:20 AM", requestedAtISO: "2026-05-19", estimatedCollectionTime: "11:45 AM",
    technician: "Selam Getachew", insurance: "Self-Pay", bloodGroup: "A-",
    diagnosis: "Fatigue, rule out anemia", clinicalNotes: "Progressive fatigue x2 weeks, pallor noted on exam.",
    allergies: [], specialInstructions: "", specimenPrep: "No fasting required.",
    previousLabHistory: "No prior CBC on file.", attachments: [], emergencyContact: "Alemu T. · 0911 888 222",
    labelsPrinted: 1,
  },
  {
    id: "LAB-2026-000420", specimenId: "SPC-2026-08402", barcode: "8891234500420",
    patientName: "Yared Solomon", mrn: "MRN-2026-000342", age: 33, gender: "Male", phone: "0922 111 999",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: [
      { name: "Hepatitis B Screen", specimen: "Serum", tube: "Gold SST", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "24 Hours" },
      { name: "Hepatitis C Screen", specimen: "Serum", tube: "Gold SST", volume: "3 mL", fasting: false, priority: "Routine", turnaround: "24 Hours" },
    ],
    priority: "Routine", specimen: "Serum", collectionRoom: "Referral Intake Desk",
    status: "Rejected", overdue: false,
    requestedAt: "05/16/2026 · 09:00 AM", requestedAtISO: "2026-05-16", estimatedCollectionTime: "09:20 AM",
    technician: null, insurance: "Self-Pay", bloodGroup: "B+",
    diagnosis: "Pre-employment screening", clinicalNotes: "Referred from external clinic without accompanying consent form.",
    allergies: [], specialInstructions: "", specimenPrep: "No fasting required.",
    previousLabHistory: "No previous hepatitis screening.", attachments: [], emergencyContact: "Solomon G. · 0922 444 111",
    labelsPrinted: 0, rejectionReason: "Specimen hemolyzed on receipt — recollection required.",
  },
  {
    id: "LAB-2026-000415", specimenId: "SPC-2026-08340", barcode: "8891234500415",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male", phone: "0933 555 222",
    department: "Orthopedics", doctor: "Dr. Dawit Bekele",
    tests: [
      { name: "ESR", specimen: "Blood", tube: "Black Citrate", volume: "2 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
      { name: "CRP", specimen: "Blood", tube: "Gold SST", volume: "2 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
      { name: "Uric Acid", specimen: "Blood", tube: "Gold SST", volume: "2 mL", fasting: false, priority: "Routine", turnaround: "6 Hours" },
    ],
    priority: "Routine", specimen: "Blood", collectionRoom: "Phlebotomy Room 2",
    status: "Waiting Patient", overdue: true,
    requestedAt: "05/21/2026 · 08:50 AM", requestedAtISO: "2026-05-21", estimatedCollectionTime: "09:10 AM",
    technician: null, insurance: "Self-Pay", bloodGroup: "O+",
    diagnosis: "Joint pain and swelling, right knee", clinicalNotes: "Suspected inflammatory arthropathy vs gout.",
    allergies: [], specialInstructions: "", specimenPrep: "No fasting required.",
    previousLabHistory: "No prior inflammatory markers on file.", attachments: [], emergencyContact: "Tesfaye H. · 0933 666 999",
    labelsPrinted: 0,
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["General Medicine", "Emergency", "Cardiology", "Orthopedics", "Pediatrics"];
const TECHNICIANS = ["Selam Getachew", "Dawit Mekonnen"];
const SPECIMEN_TYPES: SpecimenType[] = ["Blood", "Urine", "Stool", "Sputum", "Swab", "Serum", "Plasma", "CSF", "Biopsy", "Saliva", "Other"];
const COLLECTION_ROOMS = ["Phlebotomy Room 2", "Lab Counter 1", "ER Bay 1", "ER Bay 3", "IPD Ward B", "OT Pre-Op Holding", "Referral Intake Desk"];
const COLLECTION_STATUSES: CollectionStatus[] = ["Waiting Patient", "Identity Verified", "Collection Started", "Collected", "Label Printed", "Sent to Laboratory", "Received by Laboratory", "Rejected"];
const QUICK_FILTERS = ["All", "Pending", "Waiting Patient", "Ready", "Collected", "STAT", "Urgent", "Routine", "Overdue", "Rejected"];

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

const STATUS_STYLES: Record<CollectionStatus, string> = {
  "Waiting Patient": "bg-slate-100 text-slate-600",
  "Identity Verified": "bg-blue-50 text-blue-700",
  "Collection Started": "bg-amber-50 text-amber-700",
  Collected: "bg-violet-50 text-violet-700",
  "Label Printed": "bg-emerald-50 text-emerald-700",
  "Sent to Laboratory": "bg-teal-50 text-teal-700",
  "Received by Laboratory": "bg-teal-700 text-white",
  Rejected: "bg-red-50 text-red-600",
};

function isReadOnly(status: CollectionStatus) {
  return status === "Received by Laboratory" || status === "Rejected";
}

function isCollected(status: CollectionStatus) {
  return status !== "Waiting Patient" && status !== "Identity Verified" && status !== "Collection Started";
}

function matchesQuickFilter(o: SampleOrder, q: string): boolean {
  if (q === "All") return true;
  if (q === "Routine" || q === "Urgent" || q === "STAT") return o.priority === q;
  if (q === "Pending") return !isCollected(o.status);
  if (q === "Waiting Patient") return o.status === "Waiting Patient";
  if (q === "Ready") return o.status === "Identity Verified";
  if (q === "Collected") return isCollected(o.status) && o.status !== "Rejected";
  if (q === "Overdue") return o.overdue;
  if (q === "Rejected") return o.status === "Rejected";
  return true;
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

function buildKpiCards(orders: SampleOrder[]): KpiCard[] {
  const pending = orders.filter((o) => !isCollected(o.status)).length;
  const collectedToday = orders.filter((o) => isCollected(o.status) && o.status !== "Rejected").length;
  const overdue = orders.filter((o) => o.overdue).length;
  const stat = orders.filter((o) => o.priority === "STAT").length;
  const completed = orders.filter((o) => o.status === "Received by Laboratory").length;
  const rejected = orders.filter((o) => o.status === "Rejected").length;

  return [
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Pending Collection", value: String(pending), sublabel: "Awaiting phlebotomy", quickFilter: "Pending" },
    { icon: Droplet, iconBg: "bg-[#627EC1]", label: "Collected Today", value: String(collectedToday), sublabel: "+2 vs. yesterday", quickFilter: "Collected" },
    { icon: AlarmClock, iconBg: "bg-[#DB5567]", label: "Overdue Collections", value: String(overdue), sublabel: "Past estimated time", quickFilter: "Overdue" },
    { icon: Siren, iconBg: "bg-[#DB5567]", label: "STAT Collections", value: String(stat), sublabel: "Requires immediate action", quickFilter: "STAT" },
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "Completed Collections", value: String(completed), sublabel: "Received by laboratory", quickFilter: "All" },
    { icon: ShieldAlert, iconBg: "bg-[#5C8E64]", label: "Rejected Specimens", value: String(rejected), sublabel: "Needs recollection", quickFilter: "Rejected" },
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

function DateField({
  label,
  clearKey,
  active,
  onChange,
}: {
  label: string;
  clearKey: number;
  active?: boolean;
  onChange: (iso: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <DatePicker key={`date-${clearKey}`} placeholder="Any date" className={`w-36 rounded-md ${activeFieldClass(!!active)}`} onChange={(d) => onChange(toISO(d))} />
    </div>
  );
}

/* ---------- filters state ---------- */

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Barcode" | "Order Number" | "National ID" | "Phone Number" | "Visit Number";

type SampleFilters = {
  searchBy: SearchField;
  query: string;
  department: string;
  doctor: string;
  priority: string;
  status: string;
  specimen: string;
  room: string;
  technician: string;
  date: string;
};

const EMPTY_FILTERS: SampleFilters = {
  searchBy: "All Fields",
  query: "",
  department: "All",
  doctor: "All Physicians",
  priority: "All",
  status: "All",
  specimen: "All",
  room: "All",
  technician: "All Technicians",
  date: "",
};

const ADVANCED_DEFAULTS: Omit<SampleFilters, "searchBy" | "query"> = {
  department: "All",
  doctor: "All Physicians",
  priority: "All",
  status: "All",
  specimen: "All",
  room: "All",
  technician: "All Technicians",
  date: "",
};

function matchesSearch(o: SampleOrder, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName,
    MRN: o.mrn,
    Barcode: o.barcode,
    "Order Number": o.id,
    "National ID": o.mrn,
    "Phone Number": o.phone,
    "Visit Number": o.id,
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(orders: SampleOrder[], f: SampleFilters, quickFilter: string): SampleOrder[] {
  return orders.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.doctor !== "All Physicians" && o.doctor !== f.doctor) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.status !== "All" && o.status !== f.status) return false;
    if (f.specimen !== "All" && o.specimen !== f.specimen) return false;
    if (f.room !== "All" && o.collectionRoom !== f.room) return false;
    if (f.technician !== "All Technicians" && o.technician !== f.technician) return false;
    if (f.date && o.requestedAtISO !== f.date) return false;
    if (!matchesQuickFilter(o, quickFilter)) return false;
    return true;
  });
}

function countActiveFilters(f: SampleFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "date") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.date) n++;
  return n;
}

/* ---------- filter bar ---------- */

function SampleFilterBar({
  filters,
  clearKey,
  quickFilter,
  onChange,
  onQuickFilter,
  onClearAdvanced,
}: {
  filters: SampleFilters;
  clearKey: number;
  quickFilter: string;
  onChange: (partial: Partial<SampleFilters>) => void;
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
            {(["All Fields", "Patient Name", "MRN", "Barcode", "Order Number", "National ID", "Phone Number", "Visit Number"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by patient, MRN, barcode, order #…" : `Search by ${filters.searchBy}`}
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
          aria-controls="sample-collection-filters-panel"
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

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div id="sample-collection-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Ordering Physician" value={filters.doctor} onChange={(v) => onChange({ doctor: v })} options={["All Physicians", ...DOCTORS]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect label="Collection Status" value={filters.status} onChange={(v) => onChange({ status: v })} options={["All", ...COLLECTION_STATUSES]} />
            <ControlledSelect label="Specimen Type" value={filters.specimen} onChange={(v) => onChange({ specimen: v })} options={["All", ...SPECIMEN_TYPES]} />
            <ControlledSelect label="Collection Room" value={filters.room} onChange={(v) => onChange({ room: v })} options={["All", ...COLLECTION_ROOMS]} />
            <ControlledSelect label="Technician" value={filters.technician} onChange={(v) => onChange({ technician: v })} options={["All Technicians", ...TECHNICIANS]} />
            <DateField label="Date" clearKey={clearKey} active={!!filters.date} onChange={(v) => onChange({ date: v })} />
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
        <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button key={p} type="button" onClick={() => onPageChange(p)} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${p === currentPage ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {p}
          </button>
        ))}
        <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page">
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Last page">
          <ChevronsRight size={16} strokeWidth={2} />
        </button>
        <div className="relative ml-2">
          <select value={pageSize} onChange={(e) => { onPageSizeChange(parseInt(e.target.value)); onPageChange(1); }} className="appearance-none border border-gray-300 rounded-md pl-3 pr-7 h-8 text-sm text-gray-700 bg-white">
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

function DetailSection({ icon: Icon, iconTone, title, children }: { icon: typeof FileText; iconTone: string; title: string; children: React.ReactNode }) {
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

function ExpandedRowDetail({ order }: { order: SampleOrder }) {
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
                  <span>Possible duplicate specimen collection — order <b className="font-semibold">{order.duplicateOf}</b> for the same patient was already collected. Verify before proceeding.</span>
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
            <DetailSection icon={FlaskConical} iconTone="bg-teal-50 text-teal-700" title="Requested Investigations">
              <div className="flex flex-col gap-2">
                {order.tests.map((t) => (
                  <div key={t.name} className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-800">{t.name}</span>
                    <span className="text-[10.5px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">{t.tube}</span>
                  </div>
                ))}
              </div>
              <DetailField label="Diagnosis">{order.diagnosis}</DetailField>
              <DetailField label="Clinical Notes">{order.clinicalNotes}</DetailField>
            </DetailSection>

            <DetailSection icon={ShieldAlert} iconTone="bg-red-50 text-red-600" title="Safety & Preparation">
              <DetailField label="Patient Allergies">
                {order.allergies.length === 0 ? "None recorded" : (
                  <div className="flex flex-wrap gap-1.5">
                    {order.allergies.map((a) => (
                      <span key={a} className="text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">{a}</span>
                    ))}
                  </div>
                )}
              </DetailField>
              <DetailField label="Special Collection Instructions">{order.specialInstructions || "None"}</DetailField>
              <DetailField label="Specimen Preparation">{order.specimenPrep}</DetailField>
            </DetailSection>

            <DetailSection icon={Paperclip} iconTone="bg-violet-50 text-violet-600" title="History & Documentation">
              <DetailField label="Previous Laboratory History">{order.previousLabHistory}</DetailField>
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
            </DetailSection>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ---------- collection worklist table ---------- */

function CollectionWorklistTable({
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
  orders: SampleOrder[];
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
      <h2 className="text-lg font-semibold text-slate-900 p-4 border-b border-gray-200">Collection Worklist</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="p-2 w-7">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${allOnPageSelected ? "bg-teal-700" : "border border-gray-300 bg-white"}`}
                  aria-label="Select all rows on this page"
                >
                  {allOnPageSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                </button>
              </th>
              <th className="p-2 w-7"></th>
              {["Patient", "Dept.", "Tests", "Specimen", "Room", "Status", "Requested", "Est. Collection", "Technician", "Priority", "Actions"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide p-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-10 text-center text-sm text-gray-400">No collection orders match the current filters.</td>
              </tr>
            ) : (
              orders.map((o) => {
                const isSelected = o.id === selectedId;
                const isChecked = selectedIds.includes(o.id);
                const isExpanded = expandedId === o.id;
                const readOnly = isReadOnly(o.status);
                return (
                  <Fragment key={o.id}>
                    <tr
                      onClick={() => onSelect(o.id)}
                      className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${PRIORITY_BORDER[o.priority]} ${isSelected ? "bg-teal-50/40" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => onToggleSelect(o.id)} className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${isChecked ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
                          {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
                        </button>
                      </td>
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => onToggleExpand(o.id)} aria-expanded={isExpanded} aria-label="Toggle row details" className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                          <ChevronRight size={15} strokeWidth={2.25} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                      </td>
                      <td className="p-2 min-w-[130px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 whitespace-nowrap">{o.patientName}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{o.mrn} · {o.age}{o.gender[0]}</span>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600 min-w-[100px]">{o.department}</td>
                      <td className="p-2 min-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {o.tests.slice(0, 2).map((t) => (
                            <span key={t.name} className="text-[11px] font-semibold text-slate-700 bg-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">{t.name}</span>
                          ))}
                          {o.tests.length > 2 && (
                            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5 whitespace-nowrap">+{o.tests.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.specimen}</td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.collectionRoom}</td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                          {o.overdue && <AlarmClock size={13} strokeWidth={2.25} className="text-red-500 shrink-0" aria-label="Overdue" />}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.requestedAt}</td>
                      <td className="p-2 whitespace-nowrap text-gray-600">{o.estimatedCollectionTime}</td>
                      <td className="p-2 whitespace-nowrap">
                        {o.technician ? <span className="text-slate-700">{o.technician}</span> : <span className="text-gray-400 italic">Not Assigned</span>}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${PRIORITY_STYLES[o.priority]}`}>{o.priority}</span>
                      </td>
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <button type="button" disabled={readOnly} className="h-8 px-2.5 border border-gray-300 rounded-l-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r-0 disabled:opacity-40 disabled:cursor-not-allowed">
                            {isCollected(o.status) ? "Print Label" : "Quick Collect"}
                          </button>
                          <button type="button" aria-label="More actions" className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-50 transition-colors">
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
        <Pagination from={startRow} to={endRow} total={total} pageSize={pageSize} currentPage={currentPage} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      </div>
    </div>
  );
}

/* ---------- right panel: patient & collection details ---------- */

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
        <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function PatientSummaryBody({ order }: { order: SampleOrder }) {
  return (
    <div>
      <SectionHeading icon={Users} iconTone="bg-blue-50 text-blue-600" title="Patient Summary" />
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={initialsOf(order.patientName)} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">{order.patientName}</span>
          <span className="text-xs text-gray-400 truncate">{order.mrn}</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 divide-y divide-gray-100">
        <InfoRow label="Age / Gender" value={`${order.age} · ${order.gender}`} />
        <InfoRow label="Phone" value={order.phone} />
        <InfoRow label="Insurance" value={order.insurance} valueClass="text-emerald-600" />
        <InfoRow label="Blood Group" value={order.bloodGroup} />
        <InfoRow label="Known Allergies" value={order.allergies.join(", ") || "None"} valueClass={order.allergies.length ? "text-red-500" : ""} />
        <InfoRow label="Current Diagnosis" value={order.diagnosis} />
        <InfoRow label="Current Visit" value={`${order.department} · ${order.id}`} />
        <InfoRow label="Emergency Contact" value={order.emergencyContact} />
      </div>
    </div>
  );
}

const TUBE_COLOR_DOT: Record<string, string> = {
  "Purple EDTA": "bg-violet-500",
  "Gold SST": "bg-amber-400",
  "Grey Fluoride": "bg-gray-400",
  "Blue Citrate": "bg-blue-500",
  "Green Heparin": "bg-emerald-500",
  "Pink EDTA": "bg-pink-400",
  "Yellow SPS": "bg-yellow-400",
  "Black Citrate": "bg-slate-800",
  "Sterile Container": "bg-cyan-400",
};

function OrderedInvestigationsBody({ order }: { order: SampleOrder }) {
  return (
    <div>
      <SectionHeading icon={ListChecks} iconTone="bg-teal-50 text-teal-700" title="Ordered Investigations" action={<span className="text-xs font-semibold text-gray-400">{order.tests.length} tests</span>} />
      <div className="flex flex-col divide-y divide-gray-100 bg-gray-50 rounded-lg px-4">
        {order.tests.map((t) => (
          <div key={t.name} className="py-2.5 first:pt-2.5 last:pb-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-800">{t.name}</span>
              <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-gray-500">
              <span className="inline-flex items-center gap-1"><Droplets size={11} strokeWidth={2} className="text-gray-400" /> {t.specimen}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TUBE_COLOR_DOT[t.tube] ?? "bg-gray-300"}`} /> {t.tube}
              </span>
              <span>{t.volume}</span>
              <span className="inline-flex items-center gap-1"><Timer size={11} strokeWidth={2} className="text-gray-400" /> {t.turnaround}</span>
              {t.fasting && <span className="font-semibold text-amber-600">Fasting required</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuideRow({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white text-gray-500 shrink-0">
        <Icon size={13} strokeWidth={2.25} />
      </span>
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function SpecimenCollectionGuideBody({ order }: { order: SampleOrder }) {
  const primary = order.tests[0];
  return (
    <div>
      <SectionHeading icon={Syringe} iconTone="bg-amber-50 text-amber-700" title="Specimen Collection Guide" />
      <div className="flex flex-col bg-gray-50 rounded-lg px-4">
        <GuideRow icon={Droplets} label="Specimen" value={order.specimen} />
        <GuideRow icon={TestTube} label="Tube" value={primary?.tube ?? "—"} />
        <GuideRow icon={Beaker} label="Volume" value={primary?.volume ?? "—"} />
        <GuideRow icon={Timer} label="Fasting" value={order.tests.some((t) => t.fasting) ? "Required" : "Not required"} />
        <GuideRow icon={MapPin} label="Collection Site" value={order.specimen === "Blood" ? "Venous" : order.specimen === "Urine" ? "Midstream Clean-Catch" : "Per protocol"} />
        <GuideRow icon={Thermometer} label="Transport" value="Within 30 Minutes" />
      </div>
    </div>
  );
}

function CollectionFormBody({ order, onIdentityChange, onTechnicianChange }: { order: SampleOrder; onIdentityChange: (v: boolean) => void; onTechnicianChange: (t: string) => void }) {
  const [verifiedNationalId, setVerifiedNationalId] = useState(false);
  const [verifiedMrn, setVerifiedMrn] = useState(false);
  const [verifiedVerbally, setVerifiedVerbally] = useState(false);
  const [specimenType, setSpecimenType] = useState<string>(order.specimen);
  const [collectionSite, setCollectionSite] = useState("Venous");
  const [tubeType, setTubeType] = useState(order.tests[0]?.tube ?? "Purple EDTA");
  const [collectionTime, setCollectionTime] = useState("");
  const [technician, setTechnician] = useState(order.technician ?? "");
  const [collectionRoom, setCollectionRoom] = useState(order.collectionRoom);
  const [condition, setCondition] = useState<SampleCondition>("Normal");
  const [notes, setNotes] = useState("");

  const verified = verifiedNationalId || verifiedMrn || verifiedVerbally;

  const setVerification = (which: "id" | "mrn" | "verbal", value: boolean) => {
    if (which === "id") setVerifiedNationalId(value);
    if (which === "mrn") setVerifiedMrn(value);
    if (which === "verbal") setVerifiedVerbally(value);
    const nowVerified = which === "id" ? value || verifiedMrn || verifiedVerbally : which === "mrn" ? value || verifiedNationalId || verifiedVerbally : value || verifiedNationalId || verifiedMrn;
    onIdentityChange(nowVerified);
  };

  const handleTechnicianChange = (t: string) => {
    setTechnician(t);
    onTechnicianChange(t);
  };

  return (
    <div>
      <SectionHeading icon={IdCard} iconTone="bg-blue-50 text-blue-600" title="Collection Form" />

      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Patient Verification</FieldLabel>
          <div className="flex flex-col gap-1.5 mt-1.5">
            {([
              ["id", "Verified with National ID", verifiedNationalId],
              ["mrn", "Verified with MRN", verifiedMrn],
              ["verbal", "Verified verbally", verifiedVerbally],
            ] as const).map(([key, label, checked]) => (
              <button key={key} type="button" onClick={() => setVerification(key, !checked)} className="flex items-center gap-2.5 py-1 text-left select-none">
                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
                  {checked && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>
                <span className="text-sm text-slate-700">{label}</span>
              </button>
            ))}
          </div>
          {!verified && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 mt-2">
              <AlertTriangle size={12} strokeWidth={2.25} /> Identity must be verified before collection.
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ControlledSelect label="Specimen Type" value={specimenType} onChange={setSpecimenType} options={SPECIMEN_TYPES} />
          <ControlledSelect label="Collection Site" value={collectionSite} onChange={setCollectionSite} options={["Venous", "Capillary", "Midstream Clean-Catch", "Per Protocol"]} />
          <ControlledSelect label="Tube Type" value={tubeType} onChange={setTubeType} options={Array.from(new Set(order.tests.map((t) => t.tube)))} />
          <ControlledSelect label="Collection Room" value={collectionRoom} onChange={setCollectionRoom} options={COLLECTION_ROOMS} />
          <div className="flex flex-col gap-1">
            <FieldLabel>Collection Time</FieldLabel>
            <input type="time" value={collectionTime} onChange={(e) => setCollectionTime(e.target.value)} className={`${inputClass} ${activeFieldClass(!!collectionTime)}`} />
          </div>
          <ControlledSelect label="Technician" value={technician || "Unassigned"} onChange={handleTechnicianChange} options={["Unassigned", ...TECHNICIANS]} />
        </div>

        <div>
          <FieldLabel>Sample Condition</FieldLabel>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {(["Normal", "Hemolyzed", "Insufficient", "Contaminated"] as SampleCondition[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 transition-colors ${
                  condition === c
                    ? c === "Normal" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                    : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Special Notes</FieldLabel>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything the next stage should know…" className={`${inputClass} resize-none`} />
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ label, state }: { label: string; state: "pass" | "attention" | "fail" }) {
  const cfg = {
    pass: { icon: Check, tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    attention: { icon: AlertTriangle, tone: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
    fail: { icon: X, tone: "bg-red-50 text-red-600", dot: "bg-red-500" },
  }[state];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-[13px] text-slate-700">{label}</span>
      </div>
      <span className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${cfg.tone}`}>
        <Icon size={11} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function SpecimenValidationBody({ order, identityVerified }: { order: SampleOrder; identityVerified: boolean }) {
  const fastingRequired = order.tests.some((t) => t.fasting);
  return (
    <div>
      <SectionHeading icon={BadgeCheck} iconTone="bg-emerald-50 text-emerald-700" title="Specimen Validation" />
      <div className="flex flex-col divide-y divide-gray-100 bg-gray-50 rounded-lg px-4">
        <ValidationItem label="Fasting Required" state={fastingRequired ? "attention" : "pass"} />
        <ValidationItem label="Patient Confirmed" state="pass" />
        <ValidationItem label="Correct Tube Selected" state="pass" />
        <ValidationItem label="Correct Volume" state="pass" />
        <ValidationItem label="Consent Available" state={order.attachments.some((a) => a.toLowerCase().includes("consent")) ? "pass" : "attention"} />
        <ValidationItem label="Patient Identity Verified" state={identityVerified ? "pass" : "fail"} />
        <ValidationItem label="Collection Time Recorded" state="attention" />
      </div>
    </div>
  );
}

function BarcodeLabelsBody({ order, identityVerified }: { order: SampleOrder; identityVerified: boolean }) {
  const [labelCount, setLabelCount] = useState(Math.max(1, order.labelsPrinted || 1));
  const printed = order.labelsPrinted > 0;
  return (
    <div>
      <SectionHeading icon={Tag} iconTone="bg-violet-50 text-violet-700" title="Barcode & Labels" />
      <div className="flex flex-col items-center gap-2 border border-dashed border-gray-300 rounded-lg py-4 mb-3 bg-[#FBFCFD]">
        <Barcode size={64} strokeWidth={1} className="text-slate-800" />
        <span className="text-xs font-mono tracking-wider text-slate-600">{order.barcode}</span>
        <span className="text-[11px] text-gray-400">{order.specimenId}</span>
      </div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs text-gray-400">Number of Labels</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setLabelCount((n) => Math.max(1, n - 1))} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
            <Minus size={13} strokeWidth={2.25} />
          </button>
          <span className="text-sm font-bold text-slate-800 w-5 text-center tabular-nums">{labelCount}</span>
          <button type="button" onClick={() => setLabelCount((n) => n + 1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
            <Plus size={13} strokeWidth={2.25} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs text-gray-400">Label Status</span>
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${printed ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
          {printed ? `Printed (${order.labelsPrinted})` : "Not Printed"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!identityVerified}
          className="h-9 inline-flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md text-xs font-semibold text-white transition-colors"
        >
          <Printer size={13} strokeWidth={2.25} /> Print Label
        </button>
        <button
          type="button"
          disabled={!printed}
          className="h-9 inline-flex items-center justify-center gap-1.5 border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} strokeWidth={2.25} /> Reprint
        </button>
      </div>
      {!identityVerified && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 mt-2">
          <AlertTriangle size={12} strokeWidth={2.25} /> Labels cannot be printed until identity is verified.
        </div>
      )}
    </div>
  );
}

type TimelineStageState = "done" | "active" | "pending";

const COLLECTION_TIMELINE_STAGES: { label: string; icon: typeof ClipboardList; state: TimelineStageState }[] = [
  { label: "Order Received", icon: ClipboardList, state: "done" },
  { label: "Patient Called", icon: Phone, state: "done" },
  { label: "Identity Verified", icon: ShieldCheck, state: "pending" },
  { label: "Specimen Collected", icon: Droplet, state: "pending" },
  { label: "Label Printed", icon: Tag, state: "pending" },
  { label: "Transferred to Processing", icon: Send, state: "pending" },
];

function CollectionTimelineBody({ order, identityVerified }: { order: SampleOrder; identityVerified: boolean }) {
  const collected = isCollected(order.status);
  const labelPrinted = order.status === "Label Printed" || order.status === "Sent to Laboratory" || order.status === "Received by Laboratory";
  const transferred = order.status === "Sent to Laboratory" || order.status === "Received by Laboratory";

  const stages = COLLECTION_TIMELINE_STAGES.map((s) => {
    if (s.label === "Identity Verified") return { ...s, state: identityVerified ? "done" : "pending" as TimelineStageState };
    if (s.label === "Specimen Collected") return { ...s, state: collected ? "done" : identityVerified ? "active" : "pending" as TimelineStageState };
    if (s.label === "Label Printed") return { ...s, state: labelPrinted ? "done" : collected ? "active" : "pending" as TimelineStageState };
    if (s.label === "Transferred to Processing") return { ...s, state: transferred ? "done" : labelPrinted ? "active" : "pending" as TimelineStageState };
    return s;
  });

  return (
    <div>
      <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Collection Timeline" />
      <div className="flex flex-col">
        {stages.map((s, i) => {
          const StageIcon = s.icon;
          return (
            <div key={s.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${
                    s.state === "active" ? "bg-teal-600 text-white ring-4 ring-teal-600/15" : s.state === "done" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <StageIcon size={13} strokeWidth={2.25} />
                </span>
                {i < stages.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
              </div>
              <div className="flex flex-col pb-4 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm ${s.state === "active" ? "font-bold text-slate-800" : s.state === "done" ? "text-slate-600 font-medium" : "text-gray-400"}`}>{s.label}</span>
                  {s.state === "active" && (
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-1.5 py-0.5">Current</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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

const DRAWER_PRIORITY_ACCENT: Record<Priority, string> = {
  Routine: "bg-teal-600",
  Urgent: "bg-amber-400",
  STAT: "bg-red-600",
};

function SampleCollectionDrawer({ order, onClose }: { order: SampleOrder; onClose: () => void }) {
  const readOnly = isReadOnly(order.status);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [, setTechnician] = useState("");

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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sample Collection</span>
              <h2 className="text-base font-bold text-slate-900 truncate">{order.id}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close drawer" className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors shrink-0">
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
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[order.priority]}`}>{order.priority}</span>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status]}`}>{order.status}</span>
            {order.overdue && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-red-50 text-red-600">
                <AlarmClock size={12} strokeWidth={2.25} /> Overdue
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          <PatientSummaryBody order={order} />
          <OrderedInvestigationsBody order={order} />
          <SpecimenCollectionGuideBody order={order} />
          <CollectionFormBody order={order} onIdentityChange={setIdentityVerified} onTechnicianChange={setTechnician} />
          <SpecimenValidationBody order={order} identityVerified={identityVerified} />
          <BarcodeLabelsBody order={order} identityVerified={identityVerified} />
          <CollectionTimelineBody order={order} identityVerified={identityVerified} />
        </div>

        {/* Footer: Quick Actions */}
        <div className="shrink-0 px-5 pt-3 pb-4 border-t border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 block">Quick Actions</span>
          <div className="grid grid-cols-3 gap-2">
            <QuickActionTile icon={IdCard} label="Verify Patient" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" disabled={identityVerified || readOnly} />
            <QuickActionTile icon={Printer} label="Print Label" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" disabled={!identityVerified || readOnly} />
            <QuickActionTile icon={Syringe} label="Collect Sample" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" disabled={!identityVerified || readOnly} />
            <QuickActionTile icon={ShieldAlert} label="Reject Sample" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" disabled={readOnly} />
            <QuickActionTile icon={AlarmClock} label="Reschedule" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" disabled={readOnly} />
            <QuickActionTile icon={FileText} label="View Order" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
            <QuickActionTile icon={History} label="Patient Timeline" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
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
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Labels
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <ListChecks size={15} strokeWidth={2.25} /> Bulk Collection
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export
      </button>
    </div>
  );
}

/* ---------- collection capacity strip (module-wide, not order-specific) ---------- */

function CollectionCapacityStrip() {
  const stats: { icon: typeof IdCard; label: string; value: string; valueClass?: string }[] = [
    { icon: IdCard, label: "Technicians On Duty", value: "4 / 6" },
    { icon: Hourglass, label: "Pending Specimens", value: "18", valueClass: "text-amber-600" },
    { icon: MapPin, label: "Rooms Available", value: "5 / 7" },
    { icon: Tag, label: "Labels Printed Today", value: "27" },
    { icon: Timer, label: "Avg. Collection Time", value: "9 min" },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 shrink-0">
        <Syringe size={16} strokeWidth={2.25} className="text-teal-700" />
        Collection Capacity
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

/* ---------- page ---------- */

export default function SampleCollectionForm() {
  const [filters, setFilters] = useState<SampleFilters>(EMPTY_FILTERS);
  const [quickFilter, setQuickFilter] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const kpiCards = useMemo(() => buildKpiCards(SAMPLE_ORDERS), []);

  const filteredOrders = useMemo(() => {
    const rows = applyFilters(SAMPLE_ORDERS, filters, quickFilter);
    const priorityRank: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 };
    return [...rows].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [filters, quickFilter]);

  const paginatedOrders = useMemo(() => filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredOrders, currentPage, pageSize]);

  const selectedOrder = selectedId ? SAMPLE_ORDERS.find((o) => o.id === selectedId) ?? null : null;

  const handleChange = (partial: Partial<SampleFilters>) => {
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

  const toggleSelect = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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
          title="Sample Collection"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Sample Collection"
          subtitle="Collect laboratory specimens, verify patient identity, print labels, and send samples for processing."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickFilter} />

        <CollectionCapacityStrip />

        <SampleFilterBar
          filters={filters}
          clearKey={clearKey}
          quickFilter={quickFilter}
          onChange={handleChange}
          onQuickFilter={handleQuickFilter}
          onClearAdvanced={handleClearAdvanced}
        />

        <CollectionWorklistTable
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

        {selectedOrder && <SampleCollectionDrawer order={selectedOrder} onClose={() => setSelectedId(null)} />}
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
              <Printer size={15} strokeWidth={2.25} />
              Print Labels {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </FooterButton>
            <FooterButton tone="neutral">
              <Syringe size={15} strokeWidth={2.25} />
              Collect Sample
            </FooterButton>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <CircleCheckBig size={15} strokeWidth={2.25} />
              Complete Collection
            </button>
          </>
        }
      />
    </div>
  );
}
