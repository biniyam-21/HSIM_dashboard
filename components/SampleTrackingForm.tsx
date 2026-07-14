"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  MoreVertical,
  Users,
  ClipboardList,
  Hourglass,
  Droplet,
  Droplets,
  FlaskConical,
  CircleCheckBig,
  RefreshCw,
  Printer,
  Download,
  Barcode,
  TestTube,
  History,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Check,
  Filter,
  FilterX,
  AlarmClock,
  Truck,
  PackageCheck,
  Inbox,
  ListOrdered,
  Microscope,
  MapPin,
  Thermometer,
  Timer,
  Snowflake,
  ScanLine,
  Send,
  Route,
  ChevronRight,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Sample Tracking.
   Live specimen-traceability board: where every collected specimen currently
   is, who is handling it, and what stage of the chain of custody it's in,
   from collection through to laboratory processing.
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";

type TrackingStage =
  | "Collected"
  | "Awaiting Pickup"
  | "Courier Assigned"
  | "In Transit"
  | "Received"
  | "Quality Inspection"
  | "Analyzer Queue"
  | "Processing"
  | "Completed";

type SpecimenStatus = TrackingStage | "Rejected";

type SpecimenType = "Blood" | "Urine" | "Stool" | "Sputum" | "Swab" | "Serum" | "Plasma" | "CSF" | "Biopsy" | "Saliva" | "Other";

type TransportCondition = "Normal" | "Delayed" | "Damaged" | "Leaking";

type ChainEvent = {
  time: string;
  event: string;
  person: string;
  department: string;
  location: string;
  status: string;
};

type AlertFlags = {
  temperatureWarning: boolean;
  transportDelay: boolean;
  missingBarcode: boolean;
  specimenExpiring: boolean;
  duplicateSample: boolean;
  contaminatedSample: boolean;
};

type SpecimenTrack = {
  id: string;
  specimenId: string;
  barcode: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female";
  department: string;
  doctor: string;
  tests: string[];
  specimen: SpecimenType;
  priority: Priority;
  status: SpecimenStatus;
  currentLocation: string;
  technician: string;
  courier: string | null;
  collectedAt: string;
  collectedAtISO: string;
  estimatedArrival: string;
  transitDuration: string;
  transportTemp: string;
  transportCondition: TransportCondition;
  tubeColor: string;
  tubeType: string;
  volume: string;
  collectionSite: string;
  collectionRoom: string;
  insurance: string;
  bloodGroup: string;
  diagnosis: string;
  turnaroundTarget: string;
  minutesRemaining: number;
  delayed: boolean;
  delayReason?: string;
  qualityStatus: "Acceptable" | "Under Review" | "Compromised";
  chainOfCustody: ChainEvent[];
  alerts: AlertFlags;
  rejectionReason?: string;
};

/* ---------- mock data ---------- */

const SPECIMEN_TRACKS: SpecimenTrack[] = [
  {
    id: "LAB-2026-000451", specimenId: "SPC-2026-08811", barcode: "8891234500451",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: ["CBC", "HbA1c", "Blood Glucose", "Lipid Profile"],
    specimen: "Blood", priority: "Routine", status: "In Transit",
    currentLocation: "Courier Route — Building B Corridor", technician: "Selam Getachew", courier: "Getnet Alemu",
    collectedAt: "05/21/2026 · 09:12 AM", collectedAtISO: "2026-05-21",
    estimatedArrival: "09:35 AM", transitDuration: "12 min elapsed", transportTemp: "4.2°C", transportCondition: "Normal",
    tubeColor: "Purple EDTA", tubeType: "EDTA Vacutainer", volume: "3 mL", collectionSite: "Venous",
    collectionRoom: "Phlebotomy Room 2", insurance: "Woreda 07 CBHI", bloodGroup: "O+",
    diagnosis: "Hypertension, T2DM follow-up", turnaroundTarget: "6 Hours", minutesRemaining: 312, delayed: false,
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "09:12", event: "Collected", person: "Martha Alemu", department: "Phlebotomy", location: "Phlebotomy Room 2", status: "Collected" },
      { time: "09:18", event: "Label Printed", person: "Martha Alemu", department: "Phlebotomy", location: "Phlebotomy Room 2", status: "Collected" },
      { time: "09:20", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "Building B Corridor", status: "In Transit" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000418", specimenId: "SPC-2026-08380", barcode: "8891234500418",
    patientName: "Almaz Tesfaye", mrn: "MRN-2026-000901", age: 48, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: ["CBC", "Blood Culture", "Malaria RDT"],
    specimen: "Blood", priority: "STAT", status: "Received",
    currentLocation: "Laboratory Reception Desk", technician: "Dawit Mekonnen", courier: "Getnet Alemu",
    collectedAt: "05/21/2026 · 11:02 AM", collectedAtISO: "2026-05-21",
    estimatedArrival: "Arrived 11:19 AM", transitDuration: "8 min", transportTemp: "4.0°C", transportCondition: "Normal",
    tubeColor: "Purple EDTA", tubeType: "EDTA Vacutainer", volume: "3 mL", collectionSite: "Venous",
    collectionRoom: "ER Bay 1", insurance: "Woreda 07 CBHI", bloodGroup: "A+",
    diagnosis: "High-grade fever, rigors — rule out sepsis / malaria", turnaroundTarget: "1 Hour", minutesRemaining: 22, delayed: false,
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "11:02", event: "Collected", person: "Selam Getachew", department: "Emergency", location: "ER Bay 1", status: "Collected" },
      { time: "11:06", event: "Label Printed", person: "Selam Getachew", department: "Emergency", location: "ER Bay 1", status: "Collected" },
      { time: "11:08", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "ER Corridor", status: "In Transit" },
      { time: "11:19", event: "Received at Laboratory", person: "Dawit Mekonnen", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: true, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000448", specimenId: "SPC-2026-08790", barcode: "8891234500448",
    patientName: "Abebe Bekele", mrn: "MRN-2026-000789", age: 27, gender: "Male",
    department: "Pediatrics", doctor: "Dr. Dawit Bekele",
    tests: ["Urinalysis"],
    specimen: "Urine", priority: "Urgent", status: "Quality Inspection",
    currentLocation: "Quality Bench 1", technician: "Selam Getachew", courier: null,
    collectedAt: "05/21/2026 · 08:05 AM", collectedAtISO: "2026-05-21",
    estimatedArrival: "Arrived 08:32 AM", transitDuration: "8 min", transportTemp: "Ambient", transportCondition: "Normal",
    tubeColor: "Sterile Container", tubeType: "Sterile Urine Cup", volume: "10 mL", collectionSite: "Midstream Clean-Catch",
    collectionRoom: "Lab Counter 1", insurance: "Private Insurance — Nyala", bloodGroup: "B+",
    diagnosis: "Suspected UTI", turnaroundTarget: "2 Hours", minutesRemaining: 58, delayed: false,
    qualityStatus: "Under Review",
    chainOfCustody: [
      { time: "08:05", event: "Collected", person: "Abebe Bekele (self-collect)", department: "Pediatrics", location: "Lab Counter 1", status: "Collected" },
      { time: "08:24", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "Lab Counter 1", status: "In Transit" },
      { time: "08:32", event: "Received at Laboratory", person: "Selam Getachew", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
      { time: "08:40", event: "Quality Inspection Started", person: "Selam Getachew", department: "Quality Control", location: "Quality Bench 1", status: "Quality Inspection" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000442", specimenId: "SPC-2026-08655", barcode: "8891234500442",
    patientName: "Marta Alemu", mrn: "MRN-2026-000567", age: 29, gender: "Female",
    department: "Emergency", doctor: "Dr. Hana Alemayehu",
    tests: ["Troponin", "CBC", "Electrolytes"],
    specimen: "Blood", priority: "STAT", status: "Analyzer Queue",
    currentLocation: "Analyzer Bay 2", technician: "Dawit Mekonnen", courier: null,
    collectedAt: "05/21/2026 · 10:12 AM", collectedAtISO: "2026-05-21",
    estimatedArrival: "Arrived 10:29 AM", transitDuration: "9 min", transportTemp: "4.1°C", transportCondition: "Normal",
    tubeColor: "Gold SST", tubeType: "Serum Separator Tube", volume: "3 mL", collectionSite: "Venous",
    collectionRoom: "ER Bay 3", insurance: "Self-Pay", bloodGroup: "O-",
    diagnosis: "Acute chest pain, rule out ACS", turnaroundTarget: "1 Hour", minutesRemaining: 14, delayed: false,
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "10:12", event: "Collected", person: "Dawit Mekonnen", department: "Emergency", location: "ER Bay 3", status: "Collected" },
      { time: "10:20", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "ER Corridor", status: "In Transit" },
      { time: "10:29", event: "Received at Laboratory", person: "Dawit Mekonnen", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
      { time: "10:35", event: "Quality Inspection Passed", person: "Dawit Mekonnen", department: "Quality Control", location: "Quality Bench 1", status: "Quality Inspection" },
      { time: "10:40", event: "Queued on Analyzer", person: "Dawit Mekonnen", department: "Chemistry", location: "Analyzer Bay 2", status: "Analyzer Queue" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000447", specimenId: "SPC-2026-08774", barcode: "8891234500447",
    patientName: "Alemu Getahun", mrn: "MRN-2026-000234", age: 51, gender: "Male",
    department: "Cardiology", doctor: "Dr. Eyob Tesfaye",
    tests: ["Lipid Profile", "KFT", "BNP"],
    specimen: "Serum", priority: "Routine", status: "Processing",
    currentLocation: "Chemistry Analyzer 3", technician: "Dawit Mekonnen", courier: null,
    collectedAt: "05/20/2026 · 07:15 PM", collectedAtISO: "2026-05-20",
    estimatedArrival: "Arrived 07:48 PM", transitDuration: "11 min", transportTemp: "4.0°C", transportCondition: "Normal",
    tubeColor: "Gold SST", tubeType: "Serum Separator Tube", volume: "5 mL", collectionSite: "Venous",
    collectionRoom: "IPD Ward B", insurance: "Woreda 07 CBHI", bloodGroup: "AB+",
    diagnosis: "Congestive heart failure monitoring", turnaroundTarget: "6 Hours", minutesRemaining: 96, delayed: false,
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "19:15", event: "Collected", person: "Dawit Mekonnen", department: "IPD Ward B", location: "IPD Ward B", status: "Collected" },
      { time: "19:32", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "Ward B Corridor", status: "In Transit" },
      { time: "19:48", event: "Received at Laboratory", person: "Selam Getachew", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
      { time: "19:55", event: "Quality Inspection Passed", person: "Selam Getachew", department: "Quality Control", location: "Quality Bench 1", status: "Quality Inspection" },
      { time: "20:05", event: "Processing Started", person: "Dawit Mekonnen", department: "Chemistry", location: "Chemistry Analyzer 3", status: "Processing" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000415", specimenId: "SPC-2026-08340", barcode: "8891234500415",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male",
    department: "Orthopedics", doctor: "Dr. Dawit Bekele",
    tests: ["ESR", "CRP", "Uric Acid"],
    specimen: "Blood", priority: "Routine", status: "Awaiting Pickup",
    currentLocation: "Phlebotomy Room 2 — Sample Rack", technician: "—", courier: null,
    collectedAt: "05/21/2026 · 08:50 AM", collectedAtISO: "2026-05-21",
    estimatedArrival: "Pending pickup", transitDuration: "—", transportTemp: "Ambient", transportCondition: "Delayed",
    tubeColor: "Gold SST", tubeType: "Serum Separator Tube", volume: "2 mL", collectionSite: "Venous",
    collectionRoom: "Phlebotomy Room 2", insurance: "Self-Pay", bloodGroup: "O+",
    diagnosis: "Joint pain and swelling, right knee", turnaroundTarget: "6 Hours", minutesRemaining: -18, delayed: true,
    delayReason: "Courier round delayed — next pickup rescheduled to 09:30 AM.",
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "08:50", event: "Collected", person: "Martha Alemu", department: "Phlebotomy", location: "Phlebotomy Room 2", status: "Collected" },
      { time: "08:56", event: "Label Printed", person: "Martha Alemu", department: "Phlebotomy", location: "Phlebotomy Room 2", status: "Collected" },
    ],
    alerts: { temperatureWarning: false, transportDelay: true, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000439", specimenId: "SPC-2026-08611", barcode: "8891234500439",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: ["CBC", "Peripheral Smear"],
    specimen: "Blood", priority: "Routine", status: "Completed",
    currentLocation: "Laboratory Archive", technician: "Selam Getachew", courier: null,
    collectedAt: "05/19/2026 · 11:20 AM", collectedAtISO: "2026-05-19",
    estimatedArrival: "Arrived 11:45 AM", transitDuration: "9 min", transportTemp: "4.0°C", transportCondition: "Normal",
    tubeColor: "Purple EDTA", tubeType: "EDTA Vacutainer", volume: "3 mL", collectionSite: "Venous",
    collectionRoom: "Lab Counter 1", insurance: "Self-Pay", bloodGroup: "A-",
    diagnosis: "Fatigue, rule out anemia", turnaroundTarget: "2 Hours", minutesRemaining: 0, delayed: false,
    qualityStatus: "Acceptable",
    chainOfCustody: [
      { time: "11:20", event: "Collected", person: "Selam Getachew", department: "General Medicine", location: "Lab Counter 1", status: "Collected" },
      { time: "11:36", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "OPD Corridor", status: "In Transit" },
      { time: "11:45", event: "Received at Laboratory", person: "Dawit Mekonnen", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
      { time: "11:52", event: "Quality Inspection Passed", person: "Dawit Mekonnen", department: "Quality Control", location: "Quality Bench 1", status: "Quality Inspection" },
      { time: "12:05", event: "Processing Completed", person: "Selam Getachew", department: "Hematology", location: "Analyzer Bay 1", status: "Processing" },
      { time: "12:20", event: "Result Released", person: "Dr. Eyob Tesfaye", department: "Hematology", location: "Laboratory Archive", status: "Completed" },
    ],
    alerts: { temperatureWarning: false, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: false },
  },
  {
    id: "LAB-2026-000420", specimenId: "SPC-2026-08402", barcode: "8891234500420",
    patientName: "Yared Solomon", mrn: "MRN-2026-000342", age: 33, gender: "Male",
    department: "General Medicine", doctor: "Dr. Eyob Tesfaye",
    tests: ["Hepatitis B Screen", "Hepatitis C Screen"],
    specimen: "Serum", priority: "Routine", status: "Rejected",
    currentLocation: "Laboratory Reception Desk", technician: "Dawit Mekonnen", courier: "Getnet Alemu",
    collectedAt: "05/16/2026 · 09:00 AM", collectedAtISO: "2026-05-16",
    estimatedArrival: "Arrived 09:22 AM", transitDuration: "6 min", transportTemp: "5.8°C", transportCondition: "Damaged",
    tubeColor: "Gold SST", tubeType: "Serum Separator Tube", volume: "3 mL", collectionSite: "Venous",
    collectionRoom: "Referral Intake Desk", insurance: "Self-Pay", bloodGroup: "B+",
    diagnosis: "Pre-employment screening", turnaroundTarget: "24 Hours", minutesRemaining: 0, delayed: false,
    qualityStatus: "Compromised",
    chainOfCustody: [
      { time: "09:00", event: "Collected", person: "External Clinic Staff", department: "External Referral", location: "Referral Intake Desk", status: "Collected" },
      { time: "09:16", event: "Transferred to Courier", person: "Getnet Alemu", department: "Transport", location: "Referral Intake Desk", status: "In Transit" },
      { time: "09:22", event: "Received at Laboratory", person: "Dawit Mekonnen", department: "Laboratory Reception", location: "Laboratory Reception Desk", status: "Received" },
      { time: "09:30", event: "Specimen Rejected", person: "Dawit Mekonnen", department: "Quality Control", location: "Laboratory Reception Desk", status: "Rejected" },
    ],
    alerts: { temperatureWarning: true, transportDelay: false, missingBarcode: false, specimenExpiring: false, duplicateSample: false, contaminatedSample: true },
    rejectionReason: "Specimen hemolyzed on receipt — recollection required.",
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["General Medicine", "Emergency", "Cardiology", "Orthopedics", "Pediatrics"];
const TECHNICIANS = ["Selam Getachew", "Dawit Mekonnen"];
const COURIERS = ["Getnet Alemu"];
const LOCATIONS = ["Phlebotomy Room 2", "Lab Counter 1", "Laboratory Reception Desk", "Quality Bench 1", "Analyzer Bay 1", "Analyzer Bay 2", "Chemistry Analyzer 3", "Laboratory Archive"];
const SPECIMEN_TYPES: SpecimenType[] = ["Blood", "Urine", "Stool", "Sputum", "Swab", "Serum", "Plasma", "CSF", "Biopsy", "Saliva", "Other"];
const LAB_SECTIONS = ["Hematology", "Chemistry", "Microbiology", "Quality Control", "Transport"];
const QUICK_STATUS_CHIPS = ["All", "Collected", "Awaiting Pickup", "In Transit", "Received", "Quality Check", "Analyzer Queue", "Processing", "Completed", "Rejected", "Delayed"];

const TRACKING_STAGES: { stage: TrackingStage; icon: typeof ClipboardList }[] = [
  { stage: "Collected", icon: Droplet },
  { stage: "Awaiting Pickup", icon: Hourglass },
  { stage: "Courier Assigned", icon: UserCheck },
  { stage: "In Transit", icon: Truck },
  { stage: "Received", icon: PackageCheck },
  { stage: "Quality Inspection", icon: Microscope },
  { stage: "Analyzer Queue", icon: ListOrdered },
  { stage: "Processing", icon: FlaskConical },
  { stage: "Completed", icon: CircleCheckBig },
];

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

const STATUS_STYLES: Record<SpecimenStatus, string> = {
  Collected: "bg-slate-100 text-slate-600",
  "Awaiting Pickup": "bg-amber-50 text-amber-700",
  "Courier Assigned": "bg-blue-50 text-blue-700",
  "In Transit": "bg-blue-50 text-blue-700",
  Received: "bg-violet-50 text-violet-700",
  "Quality Inspection": "bg-amber-50 text-amber-700",
  "Analyzer Queue": "bg-teal-50 text-teal-700",
  Processing: "bg-teal-50 text-teal-700",
  Completed: "bg-teal-700 text-white",
  Rejected: "bg-red-50 text-red-600",
};

const CONDITION_STYLES: Record<TransportCondition, string> = {
  Normal: "bg-emerald-50 text-emerald-700",
  Delayed: "bg-amber-50 text-amber-700",
  Damaged: "bg-red-50 text-red-600",
  Leaking: "bg-red-50 text-red-600",
};

function isReadOnly(status: SpecimenStatus) {
  return status === "Completed" || status === "Rejected";
}

function matchesQuickStatus(o: SpecimenTrack, q: string): boolean {
  if (q === "All") return true;
  if (q === "Delayed") return o.delayed;
  if (q === "Quality Check") return o.status === "Quality Inspection";
  return o.status === q;
}

function formatCountdown(minutes: number): { label: string; tone: string } {
  if (minutes < 0) return { label: `Overdue ${Math.abs(minutes)}m`, tone: "bg-red-50 text-red-600" };
  if (minutes === 0) return { label: "Complete", tone: "bg-teal-50 text-teal-700" };
  if (minutes <= 30) return { label: `${minutes}m remaining`, tone: "bg-amber-50 text-amber-700" };
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { label: hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`, tone: "bg-emerald-50 text-emerald-700" };
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

function buildKpiCards(rows: SpecimenTrack[]): KpiCard[] {
  const inTransit = rows.filter((r) => r.status === "Courier Assigned" || r.status === "In Transit").length;
  const awaiting = rows.filter((r) => r.status === "Collected" || r.status === "Awaiting Pickup").length;
  const received = rows.filter((r) => r.status === "Received" || r.status === "Quality Inspection").length;
  const processing = rows.filter((r) => r.status === "Analyzer Queue" || r.status === "Processing").length;
  const delayed = rows.filter((r) => r.delayed).length;
  const rejected = rows.filter((r) => r.status === "Rejected").length;

  return [
    { icon: Truck, iconBg: "bg-[#627EC1]", label: "Specimens In Transit", value: String(inTransit), sublabel: "Courier en route", quickFilter: "In Transit" },
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Awaiting Laboratory", value: String(awaiting), sublabel: "Not yet dispatched", quickFilter: "Awaiting Pickup" },
    { icon: Inbox, iconBg: "bg-[#216E6A]", label: "Received", value: String(received), sublabel: "At laboratory reception", quickFilter: "Received" },
    { icon: FlaskConical, iconBg: "bg-[#5C8E64]", label: "Processing", value: String(processing), sublabel: "On analyzer / queued", quickFilter: "Processing" },
    { icon: AlarmClock, iconBg: "bg-[#DB5567]", label: "Delayed", value: String(delayed), sublabel: "Past expected time", quickFilter: "Delayed" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Rejected", value: String(rejected), sublabel: "Needs recollection", quickFilter: "Rejected" },
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

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Specimen ID" | "Barcode" | "Order Number" | "Visit Number" | "Technician" | "Courier";

type TrackingFilters = {
  searchBy: SearchField;
  query: string;
  location: string;
  department: string;
  priority: string;
  transportStatus: string;
  specimen: string;
  date: string;
  labSection: string;
  technician: string;
};

const EMPTY_FILTERS: TrackingFilters = {
  searchBy: "All Fields",
  query: "",
  location: "All",
  department: "All",
  priority: "All",
  transportStatus: "All",
  specimen: "All",
  date: "",
  labSection: "All",
  technician: "All Technicians",
};

const ADVANCED_DEFAULTS: Omit<TrackingFilters, "searchBy" | "query"> = {
  location: "All",
  department: "All",
  priority: "All",
  transportStatus: "All",
  specimen: "All",
  date: "",
  labSection: "All",
  technician: "All Technicians",
};

function matchesSearch(o: SpecimenTrack, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName,
    MRN: o.mrn,
    "Specimen ID": o.specimenId,
    Barcode: o.barcode,
    "Order Number": o.id,
    "Visit Number": o.id,
    Technician: o.technician,
    Courier: o.courier ?? "",
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(rows: SpecimenTrack[], f: TrackingFilters, quickStatus: string): SpecimenTrack[] {
  return rows.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.location !== "All" && o.currentLocation !== f.location) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.transportStatus !== "All" && o.transportCondition !== f.transportStatus) return false;
    if (f.specimen !== "All" && o.specimen !== f.specimen) return false;
    if (f.date && o.collectedAtISO !== f.date) return false;
    if (f.technician !== "All Technicians" && o.technician !== f.technician) return false;
    if (!matchesQuickStatus(o, quickStatus)) return false;
    return true;
  });
}

function countActiveFilters(f: TrackingFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "date") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.date) n++;
  return n;
}

/* ---------- filter bar ---------- */

function TrackingFilterBar({
  filters,
  clearKey,
  quickStatus,
  onChange,
  onQuickStatus,
  onClearAdvanced,
}: {
  filters: TrackingFilters;
  clearKey: number;
  quickStatus: string;
  onChange: (partial: Partial<TrackingFilters>) => void;
  onQuickStatus: (q: string) => void;
  onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select value={filters.searchBy} onChange={(e) => onChange({ searchBy: e.target.value as SearchField })} className={`${inputClass} pr-8 appearance-none bg-white`}>
            {(["All Fields", "Patient Name", "MRN", "Specimen ID", "Barcode", "Order Number", "Visit Number", "Technician", "Courier"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by patient, MRN, specimen ID, barcode…" : `Search by ${filters.searchBy}`}
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
          aria-controls="sample-tracking-filters-panel"
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
          <div id="sample-tracking-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Current Location" value={filters.location} onChange={(v) => onChange({ location: v })} options={["All", ...LOCATIONS]} />
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect label="Transport Status" value={filters.transportStatus} onChange={(v) => onChange({ transportStatus: v })} options={["All", "Normal", "Delayed", "Damaged", "Leaking"]} />
            <ControlledSelect label="Specimen Type" value={filters.specimen} onChange={(v) => onChange({ specimen: v })} options={["All", ...SPECIMEN_TYPES]} />
            <ControlledSelect label="Laboratory Section" value={filters.labSection} onChange={(v) => onChange({ labSection: v })} options={["All", ...LAB_SECTIONS]} />
            <ControlledSelect label="Technician" value={filters.technician} onChange={(v) => onChange({ technician: v })} options={["All Technicians", ...TECHNICIANS]} />
            <DateField label="Collection Date" clearKey={clearKey} active={!!filters.date} onChange={(v) => onChange({ date: v })} />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAdvanced}
                aria-label="Clear all filters"
                className="group flex items-center gap-2 pb-2.5 pl-2.5 pr-2.5 hover:pr-3.5 rounded-full text-gray-500 hover:text-gray-700 shrink-0 transition-all duration-200"
              >
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
            <button
              key={q}
              type="button"
              onClick={() => onQuickStatus(q)}
              className={`text-xs font-bold rounded-full px-3 py-1.5 mt-2 transition-colors ${active ? "bg-teal-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}
            >
              {q}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- mini horizontal progress stepper ---------- */

function MiniStageStepper({ status }: { status: SpecimenStatus }) {
  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <ShieldAlert size={14} strokeWidth={2.25} /> Specimen Rejected
      </div>
    );
  }
  const currentIdx = TRACKING_STAGES.findIndex((s) => s.stage === status);
  return (
    <div className="flex items-center">
      {TRACKING_STAGES.map((s, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
        const StageIcon = s.icon;
        return (
          <div key={s.stage} className="flex items-center">
            <span
              title={s.stage}
              className={`flex items-center justify-center rounded-full shrink-0 transition-colors ${
                state === "active" ? "w-7 h-7 bg-teal-600 text-white ring-4 ring-teal-600/15" : state === "done" ? "w-6 h-6 bg-emerald-500 text-white" : "w-6 h-6 bg-gray-100 text-gray-400"
              }`}
            >
              <StageIcon size={state === "active" ? 13 : 11} strokeWidth={2.25} />
            </span>
            {i < TRACKING_STAGES.length - 1 && (
              <span className={`h-0.5 w-3 sm:w-5 shrink-0 ${i < currentIdx ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- expanded card sections ---------- */

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

function ChainOfCustodyTimeline({ events }: { events: ChainEvent[] }) {
  return (
    <div className="flex flex-col">
      {events.map((e, i) => (
        <div key={`${e.time}-${e.event}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 bg-emerald-500 text-white">
              <Check size={13} strokeWidth={2.5} />
            </span>
            {i < events.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
          </div>
          <div className="flex flex-col pb-4 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400 tabular-nums">{e.time}</span>
              <span className="text-sm font-bold text-slate-800">{e.event}</span>
            </div>
            <span className="text-xs text-gray-500 mt-0.5">{e.person} · {e.department}</span>
            <span className="text-[11px] text-gray-400">{e.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransportStatusPanel({ order }: { order: SpecimenTrack }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">Current Location</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right">{order.currentLocation}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">Estimated Arrival</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right">{order.estimatedArrival}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">Transport Temperature</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right inline-flex items-center gap-1">
          <Thermometer size={12} strokeWidth={2.25} className="text-gray-400" /> {order.transportTemp}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">Courier</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right">{order.courier ?? "Not yet assigned"}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">Transit Duration</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right">{order.transitDuration}</span>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400">Specimen Condition</span>
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${CONDITION_STYLES[order.transportCondition]}`}>{order.transportCondition}</span>
      </div>
      {order.delayed && order.delayReason && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-1">
          <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
          <span>{order.delayReason}</span>
        </div>
      )}
    </div>
  );
}

function ExpandedTrackingDetail({ order }: { order: SpecimenTrack }) {
  return (
    <div className="border-t border-gray-100 px-5 pt-4 pb-5 flex flex-col gap-5">
      {order.status === "Rejected" && order.rejectionReason && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          <ShieldAlert size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
          <span>Rejection reason: {order.rejectionReason}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 md:divide-x md:divide-gray-100">
        <DetailSection icon={Users} iconTone="bg-blue-50 text-blue-600" title="Patient & Investigations">
          <DetailField label="Patient">{order.patientName} · {order.mrn} · {order.age}{order.gender[0]}</DetailField>
          <DetailField label="Diagnosis">{order.diagnosis}</DetailField>
          <DetailField label="Ordered Investigations">
            <div className="flex flex-wrap gap-1.5">
              {order.tests.map((t) => (
                <span key={t} className="text-xs font-semibold text-slate-700 bg-gray-100 rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>
          </DetailField>
        </DetailSection>

        <DetailSection icon={TestTube} iconTone="bg-violet-50 text-violet-600" title="Collection Details">
          <DetailField label="Barcode">
            <span className="font-mono tracking-wide">{order.barcode}</span>
          </DetailField>
          <DetailField label="Tube Type">
            <span className="inline-flex items-center gap-1.5">{order.tubeColor} · {order.tubeType}</span>
          </DetailField>
          <DetailField label="Volume / Site">{order.volume} · {order.collectionSite}</DetailField>
          <DetailField label="Quality Status">
            <span
              className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                order.qualityStatus === "Acceptable" ? "bg-emerald-50 text-emerald-700" : order.qualityStatus === "Under Review" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
              }`}
            >
              {order.qualityStatus}
            </span>
          </DetailField>
        </DetailSection>

        <DetailSection icon={Route} iconTone="bg-teal-50 text-teal-700" title="Transport Status">
          <TransportStatusPanel order={order} />
        </DetailSection>
      </div>

      <div>
        <SectionHeadingSmall icon={History} iconTone="bg-emerald-50 text-emerald-700" title="Chain of Custody" />
        <ChainOfCustodyTimeline events={order.chainOfCustody} />
      </div>
    </div>
  );
}

function SectionHeadingSmall({ icon: Icon, iconTone, title }: { icon: typeof FileText; iconTone: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${iconTone}`}>
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
    </div>
  );
}

/* ---------- tracking card ---------- */

function TrackingCard({
  order,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: {
  order: SpecimenTrack;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  const countdown = formatCountdown(order.minutesRemaining);
  const readOnly = isReadOnly(order.status);

  return (
    <div
      onClick={onSelect}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-colors ${PRIORITY_BORDER[order.priority]} ${selected ? "ring-1 ring-teal-700 bg-teal-50/20" : "hover:bg-gray-50"}`}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* top row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[order.priority]}`}>{order.priority}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{order.patientName}</span>
              <span className="text-xs text-gray-400 font-mono truncate">{order.barcode}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${countdown.tone}`}>{countdown.label}</span>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status]}`}>{order.status}</span>
          </div>
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-gray-500">
          <span>{order.mrn}</span>
          <span className="inline-flex items-center gap-1"><Droplets size={12} strokeWidth={2} className="text-gray-400" /> {order.specimen}</span>
          <span className="inline-flex items-center gap-1"><Timer size={12} strokeWidth={2} className="text-gray-400" /> {order.collectedAt}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={12} strokeWidth={2} className="text-gray-400" /> {order.currentLocation}</span>
          <span className="inline-flex items-center gap-1"><UserCheck size={12} strokeWidth={2} className="text-gray-400" /> {order.technician}</span>
          {order.delayed && (
            <span className="inline-flex items-center gap-1 font-semibold text-red-600">
              <AlarmClock size={12} strokeWidth={2.25} /> Delayed
            </span>
          )}
        </div>

        {/* progress stepper + actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="overflow-x-auto">
            <MiniStageStepper status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button type="button" disabled={readOnly} className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Scan barcode">
              <ScanLine size={14} strokeWidth={2} />
            </button>
            <button type="button" className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="More actions">
              <MoreVertical size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 pl-1"
            >
              {expanded ? "Hide details" : "Details"}
              <ChevronRight size={14} strokeWidth={2.25} className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {expanded && <ExpandedTrackingDetail order={order} />}
    </div>
  );
}

/* ---------- right panel ---------- */

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

function PatientSummaryCard({ order }: { order: SpecimenTrack }) {
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
        <InfoRow label="Insurance" value={order.insurance} valueClass="text-emerald-600" />
        <InfoRow label="Blood Group" value={order.bloodGroup} />
        <InfoRow label="Current Diagnosis" value={order.diagnosis} />
      </div>
    </Card>
  );
}

function SpecimenInformationCard({ order }: { order: SpecimenTrack }) {
  return (
    <Card>
      <SectionHeading icon={Barcode} iconTone="bg-violet-50 text-violet-600" title="Specimen Information" />
      <div className="divide-y divide-gray-100">
        <InfoRow label="Specimen ID" value={order.specimenId} />
        <InfoRow label="Barcode" value={order.barcode} valueClass="font-mono" />
        <InfoRow label="Tube" value={`${order.tubeColor} · ${order.tubeType}`} />
        <InfoRow label="Volume" value={order.volume} />
        <InfoRow label="Collection Site" value={order.collectionSite} />
        <InfoRow label="Collected By" value={order.technician} />
        <InfoRow label="Collection Room" value={order.collectionRoom} />
        <InfoRow label="Collection Date" value={order.collectedAt} />
      </div>
    </Card>
  );
}

function InvestigationSummaryCard({ order }: { order: SpecimenTrack }) {
  return (
    <Card>
      <SectionHeading icon={FlaskConical} iconTone="bg-teal-50 text-teal-700" title="Investigation Summary" action={<span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[order.priority]}`}>{order.priority}</span>} />
      <div className="flex flex-wrap gap-1.5 mb-3">
        {order.tests.map((t) => (
          <span key={t} className="text-xs font-semibold text-slate-700 bg-gray-100 rounded-full px-2.5 py-1">{t}</span>
        ))}
      </div>
      <InfoRow label="Estimated Completion" value={order.turnaroundTarget} />
    </Card>
  );
}

function LiveProgressCard({ order }: { order: SpecimenTrack }) {
  const terminal = order.status === "Rejected";
  const currentIdx = terminal ? -1 : TRACKING_STAGES.findIndex((s) => s.stage === order.status);
  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Live Progress" />
      {terminal && (
        <div className="flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 mb-3 bg-red-50 text-red-600">
          <ShieldAlert size={13} strokeWidth={2.25} /> Specimen Rejected
        </div>
      )}
      <div className="flex flex-col">
        {TRACKING_STAGES.map((s, i) => {
          const state = terminal ? "pending" : i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
          const StageIcon = s.icon;
          return (
            <div key={s.stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${
                    state === "active" ? "bg-teal-600 text-white ring-4 ring-teal-600/15" : state === "done" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <StageIcon size={13} strokeWidth={2.25} />
                </span>
                {i < TRACKING_STAGES.length - 1 && <span className="w-px flex-1 bg-gray-200 my-0.5" />}
              </div>
              <div className="flex flex-col pb-4 min-w-0 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-sm ${state === "active" ? "font-bold text-slate-800" : state === "done" ? "text-slate-600 font-medium" : "text-gray-400"}`}>{s.stage}</span>
                  {state === "active" && <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-1.5 py-0.5">Current</span>}
                </div>
              </div>
            </div>
          );
        })}
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

function AlertsCard({ order }: { order: SpecimenTrack }) {
  const activeCount = Object.values(order.alerts).filter(Boolean).length;
  return (
    <Card>
      <SectionHeading
        icon={AlertTriangle}
        iconTone={activeCount > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}
        title="Alerts"
        action={activeCount > 0 ? <span className="text-xs font-bold text-red-600">{activeCount} active</span> : <span className="text-xs font-semibold text-emerald-600">All clear</span>}
      />
      <div className="divide-y divide-gray-50">
        <AlertRow label="Temperature Warning" active={order.alerts.temperatureWarning} icon={Snowflake} />
        <AlertRow label="Transport Delay" active={order.alerts.transportDelay} icon={AlarmClock} />
        <AlertRow label="Missing Barcode" active={order.alerts.missingBarcode} icon={Barcode} />
        <AlertRow label="Specimen Expiring" active={order.alerts.specimenExpiring} icon={Hourglass} />
        <AlertRow label="Duplicate Sample" active={order.alerts.duplicateSample} icon={FileText} />
        <AlertRow label="Contaminated Sample" active={order.alerts.contaminatedSample} icon={ShieldAlert} />
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

function QuickActionsCard({ order }: { order: SpecimenTrack }) {
  const readOnly = isReadOnly(order.status);
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={ScanLine} label="Scan Barcode" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" disabled={readOnly} />
        <QuickActionTile icon={RefreshCw} label="Update Status" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" disabled={readOnly} />
        <QuickActionTile icon={Send} label="Transfer Sample" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" disabled={readOnly} />
        <QuickActionTile icon={UserCheck} label="Assign Courier" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" disabled={readOnly} />
        <QuickActionTile icon={Printer} label="Print Tracking Label" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={ShieldAlert} label="Report Issue" tone="border-red-100 bg-red-50 text-red-600 hover:bg-red-100" />
        <QuickActionTile icon={FileText} label="View Investigation" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={History} label="Patient Timeline" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
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
        <ScanLine size={15} strokeWidth={2.25} /> Scan Barcode
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export Tracking
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Tracking Slip
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function SampleTrackingForm() {
  // NOTE: Sample Tracking page contents temporarily removed for deployment.
  // The navigation header is preserved so the route still appears in navigation.
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Sample Tracking"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Sample Tracking"
          subtitle="Module content temporarily commented out for deployment."
        />

        <div className="bg-white border border-gray-100 rounded-lg p-6 text-sm text-gray-500">
          Sample Tracking UI is temporarily disabled for deployment. Original implementation retained in Git history.
        </div>
      </div>
    </div>
  );
}
