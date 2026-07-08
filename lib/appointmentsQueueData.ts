/**
 * Shared mock data + types for the Appointments & Queue module.
 * Kept centralized (unlike Patient Management's per-page inline data) because
 * every page in this module — Scheduling, Calendar, Queue, Token Board,
 * Check-In, No-Show, Referral — must reference the same patients, doctors,
 * departments and hospitals for the demo to feel like one coherent system.
 */

export type Hospital = {
  id: string;
  name: string;
  city: string;
};

export const HOSPITALS: Hospital[] = [
  { id: "H1", name: "Fiker Selam General Hospital", city: "Addis Ababa" },
  { id: "H2", name: "Tikur Anbessa Specialized Hospital", city: "Addis Ababa" },
  { id: "H3", name: "St. Paul's Hospital Millennium Medical College", city: "Addis Ababa" },
  { id: "H4", name: "Hayat Hospital", city: "Addis Ababa" },
];

export type Department = {
  id: string;
  name: string;
  color: string; // tailwind text/bg pair key used for chips
};

export const DEPARTMENTS: Department[] = [
  { id: "D1", name: "General Medicine", color: "teal" },
  { id: "D2", name: "Pediatrics", color: "sky" },
  { id: "D3", name: "Emergency", color: "red" },
  { id: "D4", name: "Orthopedics", color: "amber" },
  { id: "D5", name: "OB/GYN", color: "pink" },
  { id: "D6", name: "ENT", color: "violet" },
  { id: "D7", name: "Cardiology", color: "rose" },
  { id: "D8", name: "Neurology", color: "indigo" },
];

export type Doctor = {
  id: string;
  name: string;
  initials: string;
  department: string;
  specialty: string;
  room: string;
  color: string;
};

export const DOCTORS: Doctor[] = [
  { id: "DR1", name: "Dr. Dawit Bekele", initials: "DB", department: "General Medicine", specialty: "Internal Medicine", room: "OPD-12", color: "teal" },
  { id: "DR2", name: "Dr. Hana Alemayehu", initials: "HA", department: "Pediatrics", specialty: "Pediatrics", room: "OPD-04", color: "sky" },
  { id: "DR3", name: "Dr. Samuel Tadesse", initials: "ST", department: "Orthopedics", specialty: "Orthopedic Surgery", room: "OPD-08", color: "amber" },
  { id: "DR4", name: "Dr. Ruth Girma", initials: "RG", department: "OB/GYN", specialty: "Obstetrics & Gynecology", room: "OPD-15", color: "pink" },
  { id: "DR5", name: "Dr. Yared Mekonnen", initials: "YM", department: "Cardiology", specialty: "Cardiology", room: "OPD-21", color: "rose" },
  { id: "DR6", name: "Dr. Selam Fikru", initials: "SF", department: "ENT", specialty: "Otolaryngology", room: "OPD-09", color: "violet" },
  { id: "DR7", name: "Dr. Getachew Wolde", initials: "GW", department: "Neurology", specialty: "Neurology", room: "OPD-18", color: "indigo" },
  { id: "DR8", name: "Dr. Bethlehem Assefa", initials: "BA", department: "Emergency", specialty: "Emergency Medicine", room: "ER-01", color: "red" },
];

export type Insurance = "CBHI" | "Ethiopian Insurance Corporation" | "Private Pay" | "Cash";
export const INSURANCE_OPTIONS: Insurance[] = [
  "CBHI",
  "Ethiopian Insurance Corporation",
  "Private Pay",
  "Cash",
];

export type PatientLite = {
  id: string;
  name: string;
  mrn: string;
  gender: "Male" | "Female";
  age: number;
  dob: string;
  phone: string;
  initials: string;
  photo?: string;
  insurance: Insurance;
  address: string;
  lastVisit: string;
  verified: boolean;
};

export const PATIENTS: PatientLite[] = [
  { id: "P1", name: "Abebe Bekele", mrn: "MRN-2026-000123", gender: "Male", age: 45, dob: "14/03/1981", phone: "0911234567", initials: "AB", insurance: "CBHI", address: "Kirkos, Addis Ababa", lastVisit: "02 May 2026", verified: true },
  { id: "P2", name: "Selamawit Desta", mrn: "MRN-2026-000124", gender: "Female", age: 33, dob: "05/12/1992", phone: "0911987654", initials: "SD", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&h=100&fit=crop&crop=faces", insurance: "Private Pay", address: "Bole, Addis Ababa", lastVisit: "21 May 2026", verified: true },
  { id: "P3", name: "Meron Alemu", mrn: "MRN-2026-000125", gender: "Female", age: 27, dob: "12/03/1997", phone: "0912345678", initials: "MA", insurance: "Ethiopian Insurance Corporation", address: "Yeka, Addis Ababa", lastVisit: "18 May 2026", verified: true },
  { id: "P4", name: "Yonas Tadesse", mrn: "MRN-2026-000126", gender: "Male", age: 58, dob: "09/02/1966", phone: "0913456789", initials: "YT", insurance: "CBHI", address: "Arada, Addis Ababa", lastVisit: "14 May 2026", verified: true },
  { id: "P5", name: "Helen Tesfaye", mrn: "MRN-2026-000127", gender: "Female", age: 6, dob: "10/11/2018", phone: "0914567890", initials: "HT", insurance: "Cash", address: "Lideta, Addis Ababa", lastVisit: "09 May 2026", verified: false },
  { id: "P6", name: "Getnet Aschale", mrn: "MRN-2026-000128", gender: "Male", age: 71, dob: "05/08/1953", phone: "0915678901", initials: "GA", insurance: "CBHI", address: "Bole, Addis Ababa", lastVisit: "12 May 2026", verified: true },
  { id: "P7", name: "Tigist Worku", mrn: "MRN-2026-000129", gender: "Female", age: 34, dob: "22/07/1991", phone: "0916789012", initials: "TW", insurance: "Private Pay", address: "Gullele, Addis Ababa", lastVisit: "20 May 2026", verified: true },
  { id: "P8", name: "Kalkidan Girma", mrn: "MRN-2026-000130", gender: "Female", age: 41, dob: "17/09/1984", phone: "0917890123", initials: "KG", insurance: "Ethiopian Insurance Corporation", address: "Kolfe, Addis Ababa", lastVisit: "11 May 2026", verified: false },
  { id: "P9", name: "Bereket Haile", mrn: "MRN-2026-000131", gender: "Male", age: 29, dob: "03/01/1997", phone: "0918901234", initials: "BH", insurance: "Cash", address: "Nifas Silk, Addis Ababa", lastVisit: "27 May 2026", verified: true },
  { id: "P10", name: "Frehiwot Solomon", mrn: "MRN-2026-000132", gender: "Female", age: 63, dob: "29/04/1962", phone: "0919012345", initials: "FS", insurance: "CBHI", address: "Akaky Kaliti, Addis Ababa", lastVisit: "06 May 2026", verified: true },
  { id: "P11", name: "Nahom Zewdu", mrn: "MRN-2026-000133", gender: "Male", age: 19, dob: "30/06/2006", phone: "0920123456", initials: "NZ", insurance: "Private Pay", address: "Bole, Addis Ababa", lastVisit: "24 May 2026", verified: false },
  { id: "P12", name: "Aster Mulugeta", mrn: "MRN-2026-000134", gender: "Female", age: 38, dob: "15/10/1987", phone: "0921234567", initials: "AM", insurance: "CBHI", address: "Kirkos, Addis Ababa", lastVisit: "26 May 2026", verified: true },
];

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked In"
  | "Waiting"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Rescheduled"
  | "No Show";

export const APPOINTMENT_STATUS_STYLES: Record<AppointmentStatus, string> = {
  Scheduled: "bg-sky-50 text-sky-700",
  Confirmed: "bg-teal-50 text-teal-700",
  "Checked In": "bg-emerald-50 text-emerald-700",
  Waiting: "bg-amber-100 text-amber-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-50 text-red-600",
  Rescheduled: "bg-violet-50 text-violet-700",
  "No Show": "bg-red-100 text-red-700",
};

export type QueueStatus =
  | "Waiting"
  | "Called"
  | "Serving"
  | "Transferred"
  | "Completed"
  | "Missed"
  | "Cancelled";

export const QUEUE_STATUS_STYLES: Record<QueueStatus, string> = {
  Waiting: "bg-amber-100 text-amber-700",
  Called: "bg-sky-50 text-sky-700",
  Serving: "bg-emerald-50 text-emerald-700",
  Transferred: "bg-violet-50 text-violet-700",
  Completed: "bg-gray-100 text-gray-600",
  Missed: "bg-red-50 text-red-600",
  Cancelled: "bg-red-100 text-red-700",
};

export type Priority = "Routine" | "Urgent" | "Emergency" | "VIP" | "High Risk";

export const PRIORITY_STYLES: Record<Priority, string> = {
  Routine: "bg-gray-100 text-gray-600",
  Urgent: "bg-amber-100 text-amber-700",
  Emergency: "bg-red-100 text-red-700",
  VIP: "bg-violet-100 text-violet-700",
  "High Risk": "bg-rose-100 text-rose-700",
};

export type VisitType = "New Visit" | "Follow-Up" | "Consultation" | "Procedure" | "Lab/Imaging";
export const VISIT_TYPES: VisitType[] = ["New Visit", "Follow-Up", "Consultation", "Procedure", "Lab/Imaging"];

export type AppointmentType = "In-Person" | "Teleconsultation" | "Home Visit";
export const APPOINTMENT_TYPES: AppointmentType[] = ["In-Person", "Teleconsultation", "Home Visit"];

export const REFERRAL_SOURCES = [
  "Self / Walk-In",
  "Health Center Referral",
  "Private Clinic Referral",
  "Emergency Department",
  "Another Facility",
  "Insurance Provider",
];

export const LANGUAGES = ["Amharic", "Oromo", "Tigrinya", "Somali", "English", "Arabic"];

/* ---------- ID / token formatters ---------- */

export function appointmentId(seq: number) {
  return `APT-2026-${String(seq).padStart(6, "0")}`;
}

export function encounterId(seq: number) {
  return `ENC-2026-${String(seq).padStart(6, "0")}`;
}

export function queueToken(deptPrefix: string, seq: number) {
  return `${deptPrefix}-${String(seq).padStart(3, "0")}`;
}

export function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------- department chip color classes (bg/text pairs, teal/sky/red/amber/pink/violet/rose/indigo) ---------- */

export const DEPT_CHIP_STYLES: Record<string, string> = {
  teal: "bg-teal-50 text-teal-700",
  sky: "bg-sky-50 text-sky-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  pink: "bg-pink-50 text-pink-700",
  violet: "bg-violet-50 text-violet-700",
  rose: "bg-rose-50 text-rose-700",
  indigo: "bg-indigo-50 text-indigo-700",
};

export function deptChipClass(colorKey: string) {
  return DEPT_CHIP_STYLES[colorKey] ?? "bg-gray-100 text-gray-600";
}
