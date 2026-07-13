"use client";

import { useState, useMemo } from "react";
import {
  Lock,
  User,
  Users,
  ShieldCheck,
  UserCircle2,
  Hash,
  Building2,
  Stethoscope,
  CalendarClock,
  ClipboardList,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Ticket,
  Activity,
  FileText,
  Paperclip,
  PenLine,
  AlertTriangle,
  Pencil,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FilterX,
  UserPlus,
  X,
  Phone,
  Droplets,
  CalendarDays,
  Link2,
  type LucideIcon,
} from "lucide-react";
import {
  inputBase,
  Select,
  Card,
  Badge,
  type BadgeTone,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";
import DatePicker from "@/components/DatePicker";

/* ============================================================================
   OPD Registration — patient-selection stage + 4-step wizard.

   STAGE 0  Patient Selection  : search & pick a registered patient (simulates
                                 URL ?patientId= being resolved server-side).
   Step 1   Patient Information: linked patient profile (read-only) + visit
                                 logistics, insurance, additional info.
   Step 2   Visit Details      : queue/priority/arrival mode, consent & docs.
   Step 3   Clinical Info      : triage vitals + acuity + presenting symptoms.
   Step 4   Confirmation       : read-only review + token reveal + sign-off.
   ========================================================================== */

/* ---------- shared patient data (mirrors PatientSearchForm's ALL_PATIENTS) ---------- */

type PatientRow = {
  id: string;
  name: string;
  nationalId: string;
  bloodGroup: string;
  photo?: string;
  initials?: string;
  mrn: string;
  gender: "Female" | "Male";
  age: number;
  dob: string;         // display "DD/MM/YYYY"
  dobISO: string;
  phone: string;
  lastVisit: string;
  lastVisitISO: string;
  department: string;
  visitContext: string;
  status: "Active" | "Inactive" | "Merged";
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  chronicIllness?: string;
  email?: string;
};

const ALL_PATIENTS: PatientRow[] = [
  {
    id: "1", name: "Selamawit Desta", nationalId: "1001-2345-6789", bloodGroup: "O+",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&h=100&fit=crop&crop=faces",
    mrn: "MRN-2026-000123", gender: "Female", age: 33, dob: "05/12/1992", dobISO: "1992-12-05",
    phone: "0911 234 567", lastVisit: "May 21, 2026", lastVisitISO: "2026-05-21",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Bole Subcity, Woreda 03, House No. 125, Addis Ababa",
    emergencyContact: "Abebe Tesfaye (Husband) — 0911 987 654",
    allergies: "No known allergies", chronicIllness: "Hypertension",
    email: "selamawit@gmail.com",
  },
  {
    id: "2", name: "Abebe Kebede", nationalId: "1001-9876-5432", bloodGroup: "A+",
    initials: "AK", mrn: "MRN-2026-000122", gender: "Male", age: 45, dob: "12/03/1980", dobISO: "1980-03-12",
    phone: "0911 876 543", lastVisit: "May 20, 2026", lastVisitISO: "2026-05-20",
    department: "Hematology", visitContext: "Lab - Hematology", status: "Active",
    address: "Kirkos Subcity, Woreda 08, Addis Ababa",
    emergencyContact: "Tigist Kebede (Wife) — 0912 000 111",
    allergies: "Penicillin", chronicIllness: "Diabetes Type 2",
  },
  {
    id: "3", name: "Yonas Alemu", nationalId: "1001-1122-3344", bloodGroup: "B+",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&fit=crop&crop=faces",
    mrn: "MRN-2026-000121", gender: "Male", age: 60, dob: "17/08/1965", dobISO: "1965-08-17",
    phone: "0911 567 890", lastVisit: "May 18, 2026", lastVisitISO: "2026-05-18",
    department: "Surgery", visitContext: "IPD - Private Room", status: "Active",
    address: "Yeka Subcity, Woreda 11, Addis Ababa",
    emergencyContact: "Hanna Alemu (Daughter) — 0913 456 789",
    allergies: "Sulfa drugs", chronicIllness: "None",
  },
  {
    id: "4", name: "Sara Ahmed", nationalId: "1001-5566-7788", bloodGroup: "AB-",
    initials: "SA", mrn: "MRN-2026-000120", gender: "Female", age: 28, dob: "22/11/1997", dobISO: "1997-11-22",
    phone: "0911 223 344", lastVisit: "May 17, 2026", lastVisitISO: "2026-05-17",
    department: "Pediatrics", visitContext: "OPD - Pediatrics", status: "Inactive",
    address: "Nifas Silk-Lafto Subcity, Addis Ababa",
    emergencyContact: "Mohamed Ahmed (Brother) — 0914 112 233",
    allergies: "No known allergies", chronicIllness: "Asthma",
  },
  {
    id: "6", name: "Dawit Haile", nationalId: "1001-2233-4455", bloodGroup: "A-",
    initials: "DH", mrn: "MRN-2026-000118", gender: "Male", age: 52, dob: "30/06/1973", dobISO: "1973-06-30",
    phone: "0912 345 678", lastVisit: "May 14, 2026", lastVisitISO: "2026-05-14",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Gullele Subcity, Woreda 02, Addis Ababa",
    emergencyContact: "Almaz Haile (Sister) — 0916 778 899",
    allergies: "No known allergies", chronicIllness: "None",
  },
  {
    id: "7", name: "Tigist Bekele", nationalId: "1001-3344-5566", bloodGroup: "B-",
    initials: "TB", mrn: "MRN-2026-000117", gender: "Female", age: 24, dob: "14/04/2001", dobISO: "2001-04-14",
    phone: "0913 456 789", lastVisit: "May 12, 2026", lastVisitISO: "2026-05-12",
    department: "Pediatrics", visitContext: "OPD - Pediatrics", status: "Active",
    address: "Akaky Kaliti Subcity, Addis Ababa",
    emergencyContact: "Bekele Tesfaye (Father) — 0911 001 002",
    allergies: "No known allergies", chronicIllness: "None",
  },
  {
    id: "8", name: "Henok Tesfaye", nationalId: "1001-4455-6677", bloodGroup: "O+",
    initials: "HT", mrn: "MRN-2026-000116", gender: "Male", age: 37, dob: "03/09/1988", dobISO: "1988-09-03",
    phone: "0914 567 890", lastVisit: "May 10, 2026", lastVisitISO: "2026-05-10",
    department: "Surgery", visitContext: "Surgery", status: "Active",
    address: "Bole Subcity, Woreda 07, Addis Ababa",
    emergencyContact: "Marta Tesfaye (Wife) — 0922 334 445",
    allergies: "NSAIDs", chronicIllness: "None",
  },
  {
    id: "9", name: "Meseret Girma", nationalId: "1001-5566-8877", bloodGroup: "AB+",
    initials: "MG", mrn: "MRN-2026-000115", gender: "Female", age: 46, dob: "25/01/1980", dobISO: "1980-01-25",
    phone: "0915 678 901", lastVisit: "May 8, 2026", lastVisitISO: "2026-05-08",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Lideta Subcity, Woreda 05, Addis Ababa",
    emergencyContact: "Daniel Girma (Son) — 0923 445 556",
    allergies: "No known allergies", chronicIllness: "Hypertension",
  },
  {
    id: "13", name: "Azeb Tesfay", nationalId: "1001-9900-2233", bloodGroup: "O+",
    initials: "AT", mrn: "MRN-2026-000111", gender: "Female", age: 32, dob: "08/05/1993", dobISO: "1993-05-08",
    phone: "0919 012 345", lastVisit: "Apr 30, 2026", lastVisitISO: "2026-04-30",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Kolfe Keraniyo Subcity, Addis Ababa",
    emergencyContact: "Tesfay Gebre (Father) — 0918 889 900",
    allergies: "No known allergies", chronicIllness: "None",
  },
  {
    id: "14", name: "Girma Negash", nationalId: "1001-0011-3344", bloodGroup: "A-",
    initials: "GN", mrn: "MRN-2026-000110", gender: "Male", age: 68, dob: "02/12/1957", dobISO: "1957-12-02",
    phone: "0920 123 456", lastVisit: "Apr 28, 2026", lastVisitISO: "2026-04-28",
    department: "Surgery", visitContext: "Surgery", status: "Active",
    address: "Arada Subcity, Woreda 10, Addis Ababa",
    emergencyContact: "Selamawit Negash (Daughter) — 0921 223 334",
    allergies: "No known allergies", chronicIllness: "Cardiac disease",
  },
  {
    id: "15", name: "Wubet Alemayehu", nationalId: "1001-1122-4455", bloodGroup: "B-",
    initials: "WA", mrn: "MRN-2026-000109", gender: "Female", age: 27, dob: "16/09/1998", dobISO: "1998-09-16",
    phone: "0921 234 567", lastVisit: "Apr 25, 2026", lastVisitISO: "2026-04-25",
    department: "Pediatrics", visitContext: "OPD - Pediatrics", status: "Active",
    address: "Addis Ketema Subcity, Addis Ababa",
    emergencyContact: "Biruk Alemayehu (Husband) — 0930 556 667",
    allergies: "No known allergies", chronicIllness: "None",
  },
  {
    id: "17", name: "Almaz Birru", nationalId: "1001-3344-6677", bloodGroup: "O+",
    initials: "AB", mrn: "MRN-2026-000107", gender: "Female", age: 36, dob: "07/11/1989", dobISO: "1989-11-07",
    phone: "0923 456 789", lastVisit: "Apr 20, 2026", lastVisitISO: "2026-04-20",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Bole Subcity, Woreda 01, Addis Ababa",
    emergencyContact: "Birru Tadesse (Father) — 0911 667 778",
    allergies: "No known allergies", chronicIllness: "Thyroid disorder",
  },
  {
    id: "18", name: "Eyob Hailu", nationalId: "1001-4455-7788", bloodGroup: "A+",
    initials: "EH", mrn: "MRN-2026-000106", gender: "Male", age: 23, dob: "13/06/2002", dobISO: "2002-06-13",
    phone: "0924 567 890", lastVisit: "Apr 18, 2026", lastVisitISO: "2026-04-18",
    department: "General Medicine", visitContext: "OPD - General Medicine", status: "Active",
    address: "Kirkos Subcity, Woreda 07, Addis Ababa",
    emergencyContact: "Hailu Tesfaye (Father) — 0912 778 889",
    allergies: "No known allergies", chronicIllness: "None",
  },
];

/* ---------- patient search helpers ---------- */

function matchWildcard(text: string, pattern: string): boolean {
  if (!pattern) return true;
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(escaped, "i").test(text);
}

function filterPatients(patients: PatientRow[], query: string, filterBy: string): PatientRow[] {
  return patients.filter((p) => {
    if (p.status !== "Active") return false;
    if (!query) return true;
    if (filterBy === "MRN") return matchWildcard(p.mrn, query);
    if (filterBy === "Phone") return matchWildcard(p.phone, query);
    if (filterBy === "National ID") return matchWildcard(p.nationalId, query);
    // All / Name
    return (
      matchWildcard(p.name, query) ||
      matchWildcard(p.mrn, query) ||
      matchWildcard(p.phone, query) ||
      matchWildcard(p.nationalId, query)
    );
  });
}

/* ---------- status badge styles ---------- */

const STATUS_STYLES: Record<PatientRow["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
  Merged: "bg-amber-100 text-amber-700",
};

/* ---------- patient avatar ---------- */

function PatientAvatar({ photo, initials, size = "md" }: { photo?: string; initials?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-xs";
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={`${sz} rounded-full object-cover shrink-0`} />;
  }
  return (
    <span className={`${sz} rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0`}>
      {initials ?? "?"}
    </span>
  );
}

/* ============================================================================
   STAGE 0 — Patient Selection Screen
   ========================================================================== */

function PatientSelectionStage({ onSelect }: { onSelect: (p: PatientRow) => void }) {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All Fields");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const filtered = useMemo(
    () => filterPatients(ALL_PATIENTS, query, filterBy),
    [query, filterBy]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    setCurrentPage(1);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">

        {/* Breadcrumb */}
        <p className="text-xs text-gray-400">
          Home <span className="mx-1 text-gray-300">&gt;</span> OPD Management{" "}
          <span className="mx-1 text-gray-300">&gt;</span>
          <span className="text-slate-800 font-semibold">OPD Registration</span>
        </p>

        {/* Title */}
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">OPD Registration</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Search and select a registered patient to begin the OPD visit registration.
          </p>
        </div>

        {/* Progress indicator — stage 0 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center gap-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-semibold shrink-0">
            <User size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold text-emerald-700">Step 0 — Select Registered Patient</span>
          <div className="flex-1 h-0 border-t-2 border-dashed border-gray-200" />
          {(["Patient Information", "Visit Details", "Clinical Info", "Confirmation"] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-3 last:flex-none">
              <span className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-xs font-semibold text-gray-400 bg-white shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-400 whitespace-nowrap hidden lg:block">{label}</span>
              {i < 3 && <div className="w-6 h-0 border-t border-gray-200 hidden lg:block" />}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* Left — search + table */}
          <div className="flex flex-col gap-4">

            {/* Search toolbar card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search size={16} strokeWidth={2.25} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-slate-800">Find Registered Patient</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 font-medium">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Field selector */}
                <div className="relative sm:w-44 shrink-0">
                  <select
                    value={filterBy}
                    onChange={(e) => { setFilterBy(e.target.value); setCurrentPage(1); }}
                    className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer`}
                  >
                    {["All Fields", "Name", "MRN", "Phone", "National ID"].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Search input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder={
                      filterBy === "All Fields"
                        ? "Search by name, MRN, phone, or National ID…"
                        : `Search by ${filterBy}…`
                    }
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  {query && (
                    <button
                      type="button"
                      onClick={() => handleQueryChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Info note */}
              <p className="flex items-center gap-2 text-xs text-gray-400">
                <Filter size={12} strokeWidth={2} />
                Only <span className="font-semibold text-emerald-700">Active</span> patients are shown. Use wildcard (*) for partial matching.
              </p>
            </div>

            {/* Results table card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Patient", "MRN", "Gender / Age", "Phone", "Blood Group", "Last Visit", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search size={22} strokeWidth={1.8} className="text-gray-400" />
                            </span>
                            <p className="text-sm text-gray-500 font-medium">No patients match your search.</p>
                            <p className="text-xs text-gray-400">Try a different name, MRN, or phone number.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paged.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-teal-50/40 transition-colors group"
                        >
                          {/* Patient */}
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <PatientAvatar photo={p.photo} initials={p.initials} size="sm" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-800 whitespace-nowrap group-hover:text-teal-700 transition-colors">
                                  {p.name}
                                </span>
                                <span className="text-[11px] text-gray-400 whitespace-nowrap">{p.nationalId}</span>
                              </div>
                            </div>
                          </td>
                          {/* MRN */}
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 tabular-nums whitespace-nowrap">
                              {p.mrn}
                            </span>
                          </td>
                          {/* Gender / Age */}
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-800 whitespace-nowrap">{p.gender}</span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">{p.age} Y · {p.dob}</span>
                            </div>
                          </td>
                          {/* Phone */}
                          <td className="py-3.5 pr-4 text-sm text-gray-600 whitespace-nowrap">{p.phone}</td>
                          {/* Blood Group */}
                          <td className="py-3.5 pr-4">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 rounded-full px-2.5 py-0.5">
                              <Droplets size={11} strokeWidth={2.5} />
                              {p.bloodGroup}
                            </span>
                          </td>
                          {/* Last Visit */}
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-800 whitespace-nowrap">{p.lastVisit}</span>
                              <span className="text-[11px] text-gray-400 whitespace-nowrap">{p.visitContext}</span>
                            </div>
                          </td>
                          {/* Action */}
                          <td className="py-3.5">
                            <button
                              type="button"
                              onClick={() => onSelect(p)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              <Link2 size={13} strokeWidth={2.5} />
                              Start OPD Visit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filtered.length > pageSize && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={15} strokeWidth={2} />
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">...</span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            p === currentPage
                              ? "bg-teal-700 text-white"
                              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={15} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} strokeWidth={2.25} className="text-blue-500" />
                <h2 className="text-sm font-bold text-slate-800">How it works</h2>
              </div>
              <ol className="flex flex-col gap-3">
                {[
                  { step: "1", text: "Search for the patient using their name, MRN, phone, or National ID." },
                  { step: "2", text: "Click \"Start OPD Visit\" on the patient row to link their record." },
                  { step: "3", text: "The 4-step wizard will open with their demographics pre-loaded from their master record." },
                  { step: "4", text: "Complete visit logistics, clinical info, and confirm to issue a queue token." },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold shrink-0 mt-0.5">
                      {step}
                    </span>
                    <span className="text-xs text-gray-600 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* New patient shortcut */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <UserPlus size={16} strokeWidth={2.25} className="text-gray-400" />
                <h2 className="text-sm font-bold text-slate-800">Patient Not Found?</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                If the patient doesn&apos;t have a master record yet, register them first through Patient Management before proceeding with OPD registration.
              </p>
              <a
                href="/modules/patient-management/patient-registration"
                className="flex items-center justify-center gap-2 w-full border border-teal-700 text-teal-700 hover:bg-teal-50 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                <UserPlus size={15} strokeWidth={2} />
                Register New Patient
              </a>
            </div>

            {/* Stats summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Activity size={16} strokeWidth={2.25} className="text-gray-400" />
                <h2 className="text-sm font-bold text-slate-800">Today&apos;s OPD Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Registered", value: "14", color: "text-emerald-600 bg-emerald-50" },
                  { label: "In Queue", value: "6", color: "text-blue-600 bg-blue-50" },
                  { label: "Seen", value: "8", color: "text-teal-600 bg-teal-50" },
                  { label: "Avg. Wait", value: "22 min", color: "text-amber-600 bg-amber-50" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl p-3 ${color.split(" ")[1]} flex flex-col gap-0.5`}>
                    <span className={`text-xl font-bold tabular-nums ${color.split(" ")[0]}`}>{value}</span>
                    <span className="text-[11px] text-gray-500 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   WIZARD (Steps 1–4) — unchanged form data shape
   ========================================================================== */

const TOKEN = "GM-032";

type FormData = {
  visitType: string;
  department: string;
  doctor: string;
  visitDate: string;
  visitTime: string;
  chiefComplaint: string;
  referral: string;
  insuranceType: string;
  cbhiScheme: string;
  membershipNo: string;
  validity: string;
  occupation: string;
  maritalStatus: string;
  bloodGroup: string;
  allergies: string;
  chronicIllness: string;
  remarks: string;
  arrivalMode: string;
  priorityLevel: string;
  accompanyingPerson: string;
  relationship: string;
  consentTreatment: boolean;
  consentDataSharing: boolean;
  bp: string;
  pulse: string;
  respRate: string;
  temperature: string;
  spo2: string;
  height: string;
  weight: string;
  triageAcuity: string;
  symptoms: string[];
  nurseNotes: string;
  confirmAccurate: boolean;
};

const FORM_INITIAL: FormData = {
  visitType: "New Visit",
  department: "General Medicine",
  doctor: "Dr. Dawit Bekele",
  visitDate: "2025-05-17",
  visitTime: "09:30",
  chiefComplaint: "",
  referral: "Self",
  insuranceType: "Self-Pay",
  cbhiScheme: "",
  membershipNo: "",
  validity: "",
  occupation: "",
  maritalStatus: "",
  bloodGroup: "",
  allergies: "",
  chronicIllness: "",
  remarks: "",
  arrivalMode: "Walk-in",
  priorityLevel: "Routine",
  accompanyingPerson: "",
  relationship: "",
  consentTreatment: false,
  consentDataSharing: false,
  bp: "",
  pulse: "",
  respRate: "",
  temperature: "",
  spo2: "",
  height: "",
  weight: "",
  triageAcuity: "Standard",
  symptoms: [],
  nurseNotes: "",
  confirmAccurate: false,
};

const SYMPTOM_OPTIONS = [
  "Headache", "Fever", "Body Weakness", "Nausea",
  "Cough", "Dizziness", "Abdominal Pain", "Shortness of Breath",
];

const STEPS = ["Patient Information", "Visit Details", "Clinical Info", "Confirmation"];

const TIPS: Record<number, string> = {
  1: "Patient demographics are pre-filled from their master record (MRN-linked). Only visit-specific fields need to be completed here.",
  2: "Treatment consent must be captured before the visit can proceed — this is a hard requirement, not a formality.",
  3: "Vitals outside the normal range are flagged automatically and surfaced to the attending doctor at consultation.",
  4: "Review every section carefully. Completing registration adds the patient to the live queue immediately.",
};

/* ---------- small pure helpers ---------- */

function computeAge(dobISO: string): string {
  const dob = new Date(dobISO);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (now.getDate() < dob.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  return `${years} Y ${months} M`;
}

function computeBMI(heightCm: string, weightKg: string): string {
  const h = parseFloat(heightCm) / 100;
  const w = parseFloat(weightKg);
  if (!h || !w) return "—";
  return (w / (h * h)).toFixed(1);
}

type Flag = { label: string; tone: BadgeTone } | null;

function tempFlag(t: string): Flag {
  const v = parseFloat(t);
  if (!v) return null;
  if (v >= 38.5) return { label: "High", tone: "red" };
  if (v >= 37.5) return { label: "Elevated", tone: "amber" };
  return null;
}

function bpFlag(bp: string): Flag {
  const m = bp.match(/(\d+)\D+(\d+)/);
  if (!m) return null;
  const sys = Number(m[1]);
  const dia = Number(m[2]);
  if (sys >= 160 || dia >= 100) return { label: "High", tone: "red" };
  if (sys >= 140 || dia >= 90) return { label: "Elevated", tone: "amber" };
  return null;
}

function spo2Flag(s: string): Flag {
  const v = parseFloat(s);
  if (!v) return null;
  if (v < 92) return { label: "Low", tone: "red" };
  if (v < 95) return { label: "Borderline", tone: "amber" };
  return null;
}

/* ---------- local styling primitives ---------- */

const labelClass = "text-xs font-bold text-gray-600 flex items-center gap-0.5";

function Required() { return <span className="text-red-500">*</span>; }

function Label({ children, required, badge }: {
  children: React.ReactNode; required?: boolean; badge?: Flag;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className={labelClass}>{children}{required && <Required />}</label>
      {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
    </div>
  );
}

function TextInput({ label, required, value, onChange, placeholder, readOnly, icon: Icon, suffix, badge, type = "text" }: {
  label: string; required?: boolean; value?: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; icon?: LucideIcon; suffix?: string; badge?: Flag; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} badge={badge}>{label}</Label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${inputBase} ${Icon || suffix ? "pr-10" : ""} ${
            readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed tabular-nums" : ""
          } ${type === "date" || type === "time" ? "tabular-nums" : ""}`}
        />
        {Icon && <Icon size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DateField({ label, required, value, onChange }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      <DatePicker key={value} defaultValue={value ? new Date(value) : undefined} onChange={(d) => onChange(toISO(d))} />
    </div>
  );
}

function SelectInput({ label, required, value, onChange, options, placeholder }: {
  label: string; required?: boolean; value?: string; onChange?: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      <Select value={value ?? ""} onChange={(v) => onChange?.(v)} options={options} placeholder={placeholder} />
    </div>
  );
}

function Checkbox({ id, checked, onChange, children }: {
  id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
      />
      <span className="text-xs text-gray-600 leading-relaxed">{children}</span>
    </label>
  );
}

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string; activeClass: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              active ? `${opt.activeClass} border-transparent` : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SymptomTag({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button" onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300 text-gray-500 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline">
      <Pencil size={12} strokeWidth={2.25} /> Edit
    </button>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-sm font-bold text-slate-800 truncate tabular-nums">{value || "—"}</span>
    </div>
  );
}

/* ---------- Stepper ---------- */

function RegistrationStepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const clickable = stepNum <= currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none min-w-fit">
            <button
              type="button" disabled={!clickable} onClick={() => onStepClick(stepNum)}
              className={`flex items-center gap-2.5 shrink-0 ${clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                isActive || isDone ? "bg-emerald-600 text-white" : "bg-white border border-gray-300 text-gray-500"
              }`}>
                {isDone ? <Check size={14} strokeWidth={2.5} /> : stepNum}
              </span>
              <span className={`text-sm whitespace-nowrap ${isActive ? "text-emerald-700 font-semibold" : isDone ? "text-slate-700 font-medium" : "text-gray-500"}`}>
                {step}
              </span>
            </button>
            {stepNum !== STEPS.length && (
              <div className={`flex-1 h-0 border-t-2 mx-4 min-w-8 transition-colors ${stepNum < currentStep ? "border-emerald-600" : "border-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Linked Patient Banner (replaces manual Patient Info card on step 1) ---------- */

function LinkedPatientBanner({ patient, onClear }: { patient: PatientRow; onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link2 size={16} strokeWidth={2.25} className="text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800">Linked Patient</h2>
          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 ml-1">
            MRN Resolved
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-red-200"
        >
          <X size={12} strokeWidth={2.5} />
          Change Patient
        </button>
      </div>

      {/* Patient profile row */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <PatientAvatar photo={patient.photo} initials={patient.initials} size="lg" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-lg font-bold text-slate-900 truncate">{patient.name}</span>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded px-2 py-0.5 tabular-nums">{patient.mrn}</span>
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${STATUS_STYLES[patient.status]}`}>{patient.status}</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5">
              <Droplets size={11} strokeWidth={2.5} />{patient.bloodGroup}
            </span>
          </div>
        </div>
      </div>

      {/* Key facts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Gender / Age</span>
          <span className="text-sm font-bold text-slate-800">{patient.gender} · {computeAge(patient.dobISO)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Date of Birth</span>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{patient.dob}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">National ID</span>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{patient.nationalId}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Phone</span>
          <span className="text-sm font-bold text-slate-800 tabular-nums">{patient.phone}</span>
        </div>
        {patient.address && (
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Address</span>
            <span className="text-sm font-bold text-slate-800">{patient.address}</span>
          </div>
        )}
        {patient.emergencyContact && (
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Emergency Contact</span>
            <span className="text-sm font-bold text-slate-800">{patient.emergencyContact}</span>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock size={12} strokeWidth={2} />
        Patient demographics are read-only here. Edits can be made in{" "}
        <a href="/modules/patient-management/demographics-contacts" className="text-teal-700 font-semibold hover:underline">
          Demographics &amp; Contacts
        </a>.
      </div>
    </div>
  );
}

/* ---------- right-column summary ---------- */

function SummaryRow({ icon: Icon, tint, iconColor, label, value }: {
  icon: LucideIcon; tint: string; iconColor: string; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={15} strokeWidth={2.25} className={iconColor} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-bold text-slate-800 truncate tabular-nums">{value}</span>
      </div>
    </div>
  );
}

/* ============================================================================
   Main OPD Registration Wizard (Steps 1–4)
   ========================================================================== */

function OPDWizard({ patient, onClearPatient }: { patient: PatientRow; onClearPatient: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    ...FORM_INITIAL,
    allergies: patient.allergies ?? "",
    chronicIllness: patient.chronicIllness ?? "",
    bloodGroup: patient.bloodGroup,
  });
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSymptom = (s: string) =>
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter((x) => x !== s) : [...prev.symptoms, s],
    }));

  const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(4, step)));

  const nextDisabled = currentStep === 2 && !form.consentTreatment;
  const isLastStep = currentStep === 4;

  const dateLabel = new Date(form.visitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  /* URL simulation: in a real Next.js app this would use useSearchParams()
     and the route would be /modules/opd-management/opd-registration?patientId=1
     Here we display the simulated param as a badge for transparency. */
  const simulatedUrl = `?patientId=${patient.id}`;

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1600px] w-full mx-auto flex flex-col gap-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">
            Home <span className="mx-1 text-gray-300">&gt;</span> OPD Management{" "}
            <span className="mx-1 text-gray-300">&gt;</span>
            <span className="text-slate-800 font-semibold">OPD Registration</span>
          </p>
          {/* Simulated URL param chip */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              <Hash size={11} strokeWidth={2.5} />
              {simulatedUrl}
            </span>
            <button
              type="button"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              Previous Registrations
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">OPD Registration</h1>
            <p className="text-sm text-gray-400 mt-0.5">Register outpatient visit for the linked patient</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
          <RegistrationStepper currentStep={currentStep} onStepClick={goToStep} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

          {/* Left column */}
          <div className="flex flex-col gap-4 min-w-0">

            {/* ═══════ STEP 1 ═══════ */}
            {currentStep === 1 && (
              <>
                {/* Linked patient panel (replaces old manual Patient Information form) */}
                <LinkedPatientBanner patient={patient} onClear={onClearPatient} />

                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
                  {/* Visit Information */}
                  <Card title="Visit Information" icon={Users}>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectInput label="Visit Type" required value={form.visitType} onChange={(v) => set("visitType", v)} options={["New Visit", "Follow-Up", "Referral"]} />
                      <SelectInput label="Department" required value={form.department} onChange={(v) => set("department", v)} options={["General Medicine", "Pediatrics", "OB/GYN", "Surgery"]} />
                      <div className="col-span-2">
                        <SelectInput label="Doctor" required value={form.doctor} onChange={(v) => set("doctor", v)} options={["Dr. Dawit Bekele", "Dr. Hanna Yohannes", "Dr. Selamawit Girma"]} />
                      </div>
                      <DateField label="Visit Date" required value={form.visitDate} onChange={(v) => set("visitDate", v)} />
                      <TextInput label="Visit Time" required value={form.visitTime} onChange={(v) => set("visitTime", v)} type="time" />
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <Label required>Visit Reason / Chief Complaint</Label>
                        <div className="relative">
                          <textarea
                            value={form.chiefComplaint}
                            onChange={(e) => set("chiefComplaint", e.target.value.slice(0, 1000))}
                            maxLength={1000} rows={3}
                            placeholder="Describe the patient's chief complaint…"
                            className={`${inputBase} resize-none pb-5`}
                          />
                          <span className="absolute right-2.5 bottom-1.5 text-[11px] text-gray-400">{form.chiefComplaint.length} / 1000</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Referral & Insurance */}
                  <Card title="Referral & Insurance" icon={ShieldCheck} className="border-l-4 border-l-teal-600">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label>Referral</Label>
                        <div className="flex items-stretch gap-2">
                          <div className="flex-1">
                            <SelectInput label="" value={form.referral} onChange={(v) => set("referral", v)} placeholder="Select referrer" options={["Self", "Referring Clinic"]} />
                          </div>
                          <button type="button" className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-teal-700 border border-teal-700/30 rounded-lg px-3 hover:bg-teal-50 transition-colors whitespace-nowrap">
                            + New
                          </button>
                        </div>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className={form.insuranceType === "Self-Pay" ? "col-span-2" : ""}>
                          <SelectInput
                            label="Insurance Type"
                            value={form.insuranceType}
                            onChange={(v) => {
                              set("insuranceType", v);
                              if (v === "Self-Pay") {
                                set("cbhiScheme", "");
                                set("membershipNo", "");
                                set("validity", "");
                              }
                            }}
                            options={["Self-Pay", "Private Insurance", "CBHI"]}
                          />
                        </div>
                        {form.insuranceType !== "Self-Pay" && (
                          <>
                            <SelectInput
                              label={form.insuranceType === "Private Insurance" ? "Insurance Provider" : "CBHI Scheme"}
                              value={form.cbhiScheme}
                              onChange={(v) => set("cbhiScheme", v)}
                              options={form.insuranceType === "Private Insurance" ? ["Nyala Insurance", "Awash Insurance", "Jubilee Insurance"] : ["Woreda 03 CBHI", "Woreda 07 CBHI"]}
                            />
                            <TextInput label="Membership No." value={form.membershipNo} onChange={(v) => set("membershipNo", v)} />
                            <DateField label="Validity" value={form.validity} onChange={(v) => set("validity", v)} />
                          </>
                        )}
                      </div>
                      {form.insuranceType === "Self-Pay" ? (
                        <div className="flex items-start gap-2.5 bg-slate-50 text-slate-600 p-3 rounded-lg border border-slate-100">
                          <User size={16} strokeWidth={2.25} className="shrink-0 mt-0.5 text-slate-400" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-slate-700">Self-Pay Registration</span>
                            <span className="text-[11.5px] opacity-95">No insurance scheme applied. The patient is responsible for all consultation, diagnostic, and treatment costs.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 bg-emerald-50 text-emerald-700 p-3 rounded-lg">
                          <ShieldCheck size={16} strokeWidth={2.25} className="shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold">Insurance is valid</span>
                            <span className="text-xs font-medium opacity-90">Coverage: Outpatient | Copay: 0%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Additional Information */}
                <Card
                  title="Additional Information"
                  icon={Users}
                  action={
                    <Checkbox id="show-additional-info" checked={showAdditionalInfo} onChange={setShowAdditionalInfo}>
                      Add details
                    </Checkbox>
                  }
                >
                  {showAdditionalInfo ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <TextInput label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
                        <SelectInput label="Marital Status" value={form.maritalStatus} onChange={(v) => set("maritalStatus", v)} options={["Married", "Single", "Divorced", "Widowed"]} />
                        <SelectInput label="Blood Group" value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Allergies" value={form.allergies} onChange={(v) => set("allergies", v)} />
                        <TextInput label="Chronic Illness" value={form.chronicIllness} onChange={(v) => set("chronicIllness", v)} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Remarks</Label>
                        <textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} className={`${inputBase} resize-y`} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Optional — occupation, marital status, blood group, allergies, chronic illness, and remarks. The values from the patient&apos;s master record are already pre-filled. Check &quot;Add details&quot; above to review or override.
                    </p>
                  )}
                </Card>
              </>
            )}

            {/* ═══════ STEP 2 ═══════ */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Queue & Priority" icon={Ticket}>
                  <div className="flex flex-col gap-4">
                    <SelectInput label="Arrival Mode" value={form.arrivalMode} onChange={(v) => set("arrivalMode", v)} options={["Walk-in", "Wheelchair", "Ambulance", "Referred by another facility"]} />
                    <div className="flex flex-col gap-1.5">
                      <Label>Priority Level</Label>
                      <SegmentedControl
                        value={form.priorityLevel}
                        onChange={(v) => set("priorityLevel", v)}
                        options={[
                          { value: "Routine", label: "Routine", activeClass: "bg-slate-700 text-white" },
                          { value: "Priority", label: "Priority (Elderly / Pregnant)", activeClass: "bg-amber-500 text-white" },
                          { value: "Urgent", label: "Urgent", activeClass: "bg-red-500 text-white" },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput label="Accompanying Person" value={form.accompanyingPerson} onChange={(v) => set("accompanyingPerson", v)} />
                      <TextInput label="Relationship" value={form.relationship} onChange={(v) => set("relationship", v)} />
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-emerald-700">Estimated Token</span>
                        <span className="text-2xl font-bold text-emerald-700 tracking-wide tabular-nums">{TOKEN}</span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-emerald-700/70">Est. Wait</span>
                        <span className="text-sm font-semibold text-emerald-700">~15 mins</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Consent & Documents" icon={ShieldCheck}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Checkbox id="consent-treatment" checked={form.consentTreatment} onChange={(v) => set("consentTreatment", v)}>
                        <span className="font-medium text-slate-700">Treatment consent<Required />:</span>{" "}
                        The patient / guardian has been informed of the treatment plan and consents to care at Fiker Selam General Hospital.
                      </Checkbox>
                      {!form.consentTreatment && (
                        <span className="flex items-center gap-1 text-[11px] text-red-500 ml-6">
                          <AlertTriangle size={11} strokeWidth={2.5} /> Required before this visit can proceed.
                        </span>
                      )}
                    </div>
                    <Checkbox id="consent-sharing" checked={form.consentDataSharing} onChange={(v) => set("consentDataSharing", v)}>
                      Patient consents to sharing relevant records with referring / receiving facilities where clinically necessary.
                    </Checkbox>
                    <div className="flex flex-col gap-2">
                      <Label>Attached Documents</Label>
                      {[["National_ID_Copy.pdf", "214 KB"], ["Referral_Letter.pdf", "88 KB"]].map(([name, size]) => (
                        <div key={name} className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2">
                          <FileText size={15} strokeWidth={2} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-slate-700 flex-1 truncate">{name}</span>
                          <span className="text-[11px] text-gray-400">{size}</span>
                        </div>
                      ))}
                      <button type="button" className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg py-2.5 text-xs font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
                        <Paperclip size={13} strokeWidth={2.25} /> Upload Document
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Digital Signature</Label>
                      <div className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg py-4 text-xs font-medium text-gray-400">
                        <PenLine size={15} strokeWidth={2} /> Tap to sign consent
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ═══════ STEP 3 ═══════ */}
            {currentStep === 3 && (
              <>
                <Card title="Vital Signs" icon={Activity}>
                  <div className="flex flex-col gap-4">
                    <div className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium ${
                      !form.allergies || form.allergies === "No known allergies" ? "bg-gray-50 text-gray-600" : "bg-red-50 text-red-700"
                    }`}>
                      <AlertTriangle size={15} strokeWidth={2.25} className="shrink-0" />
                      {!form.allergies || form.allergies === "No known allergies"
                        ? "No known allergies on file."
                        : `Allergy on file: ${form.allergies}`}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <TextInput label="Blood Pressure" value={form.bp} onChange={(v) => set("bp", v)} suffix="mmHg" badge={bpFlag(form.bp)} />
                      <TextInput label="Pulse Rate" value={form.pulse} onChange={(v) => set("pulse", v)} suffix="bpm" />
                      <TextInput label="Resp. Rate" value={form.respRate} onChange={(v) => set("respRate", v)} suffix="/min" />
                      <TextInput label="Temperature" value={form.temperature} onChange={(v) => set("temperature", v)} suffix="°C" badge={tempFlag(form.temperature)} />
                      <TextInput label="SpO2" value={form.spo2} onChange={(v) => set("spo2", v)} suffix="%" badge={spo2Flag(form.spo2)} />
                      <TextInput label="Height" value={form.height} onChange={(v) => set("height", v)} suffix="cm" />
                      <TextInput label="Weight" value={form.weight} onChange={(v) => set("weight", v)} suffix="kg" />
                      <TextInput label="BMI" value={computeBMI(form.height, form.weight)} readOnly suffix="kg/m²" />
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card title="Triage Acuity" icon={Stethoscope}>
                    <div className="flex flex-col gap-4">
                      <Label>Assessed Priority Level</Label>
                      <SegmentedControl
                        value={form.triageAcuity}
                        onChange={(v) => set("triageAcuity", v)}
                        options={[
                          { value: "Non-Urgent", label: "Non-Urgent", activeClass: "bg-emerald-500 text-white" },
                          { value: "Standard", label: "Standard", activeClass: "bg-blue-500 text-white" },
                          { value: "Urgent", label: "Urgent", activeClass: "bg-amber-500 text-white" },
                          { value: "Emergency", label: "Emergency", activeClass: "bg-red-600 text-white" },
                        ]}
                      />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Determines routing and wait-time priority in the OPD queue. Emergency-acuity patients are redirected to the Emergency Department instead.
                      </p>
                    </div>
                  </Card>

                  <Card title="Presenting Symptoms & Notes" icon={ClipboardList}>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Presenting Symptoms</Label>
                        <div className="flex flex-wrap gap-2">
                          {SYMPTOM_OPTIONS.map((s) => (
                            <SymptomTag key={s} label={s} active={form.symptoms.includes(s)} onToggle={() => toggleSymptom(s)} />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Nurse Notes</Label>
                        <textarea value={form.nurseNotes} onChange={(e) => set("nurseNotes", e.target.value)} rows={3} className={`${inputBase} resize-none`} />
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* ═══════ STEP 4 ═══════ */}
            {currentStep === 4 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card title="Patient & Contact" icon={User} action={<EditLink onClick={() => goToStep(1)} />}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                      <PatientAvatar photo={patient.photo} initials={patient.initials} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">{patient.name}</span>
                        <span className="text-xs text-gray-400 tabular-nums">{patient.mrn}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <ReviewItem label="Gender" value={patient.gender} />
                      <ReviewItem label="Age / DOB" value={`${computeAge(patient.dobISO)} (${patient.dob})`} />
                      <ReviewItem label="Phone" value={patient.phone} />
                      <ReviewItem label="National ID" value={patient.nationalId} />
                      <div className="col-span-2"><ReviewItem label="Address" value={patient.address ?? "—"} /></div>
                      <div className="col-span-2"><ReviewItem label="Emergency Contact" value={patient.emergencyContact ?? "—"} /></div>
                    </div>
                  </Card>

                  <Card title="Visit, Insurance & Notes" icon={Users} action={<EditLink onClick={() => goToStep(1)} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <ReviewItem label="Visit Type" value={form.visitType} />
                      <ReviewItem label="Department" value={form.department} />
                      <ReviewItem label="Doctor" value={form.doctor} />
                      <ReviewItem label="Date & Time" value={`${dateLabel} · ${form.visitTime}`} />
                      <div className="col-span-2"><ReviewItem label="Chief Complaint" value={form.chiefComplaint || "—"} /></div>
                      <ReviewItem label="Insurance" value={form.insuranceType === "Self-Pay" ? "Self-Pay" : `${form.insuranceType} — ${form.cbhiScheme}`} />
                      {form.insuranceType !== "Self-Pay" && (
                        <ReviewItem label="Coverage Validity" value={form.validity} />
                      )}
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card title="Visit Logistics & Consent" icon={Ticket} action={<EditLink onClick={() => goToStep(2)} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <ReviewItem label="Arrival Mode" value={form.arrivalMode} />
                      <ReviewItem label="Priority Level" value={form.priorityLevel} />
                      <ReviewItem label="Accompanying Person" value={`${form.accompanyingPerson || "—"}${form.relationship ? ` (${form.relationship})` : ""}`} />
                      <ReviewItem label="Treatment Consent" value={form.consentTreatment ? "✓ Captured" : "Not captured"} />
                    </div>
                  </Card>

                  <Card title="Clinical & Vitals" icon={Activity} action={<EditLink onClick={() => goToStep(3)} />}>
                    <div className="grid grid-cols-2 gap-4">
                      <ReviewItem label="Blood Pressure" value={form.bp ? `${form.bp} mmHg` : "—"} />
                      <ReviewItem label="Temperature" value={form.temperature ? `${form.temperature} °C` : "—"} />
                      <ReviewItem label="SpO2" value={form.spo2 ? `${form.spo2} %` : "—"} />
                      <ReviewItem label="Triage Acuity" value={form.triageAcuity} />
                      <div className="col-span-2"><ReviewItem label="Symptoms" value={form.symptoms.length ? form.symptoms.join(", ") : "—"} /></div>
                    </div>
                  </Card>
                </div>

                {/* Token & confirm */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                        <Ticket size={18} strokeWidth={2.25} className="text-emerald-700" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-emerald-700">Queue token to be issued</span>
                        <span className="text-2xl font-bold text-emerald-700 tracking-wide tabular-nums">{TOKEN}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs text-emerald-700/70">{form.department}</span>
                      <span className="text-sm font-semibold text-emerald-700">Est. Wait ~15 mins</span>
                    </div>
                  </div>
                  <Checkbox id="confirm-accurate" checked={form.confirmAccurate} onChange={(v) => set("confirmAccurate", v)}>
                    I confirm the information across all sections above is accurate and complete, and I authorize submission of this OPD registration for {patient.name} ({patient.mrn}).
                  </Checkbox>
                </div>
              </>
            )}
          </div>

          {/* Right column — persistent summary */}
          <div className="flex flex-col gap-4">
            <Card title="Registration Summary" icon={UserCircle2}>
              <div className="flex flex-col gap-4">
                {/* Linked patient mini-card */}
                <div className="flex items-center gap-2.5 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <PatientAvatar photo={patient.photo} initials={patient.initials} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 truncate">{patient.name}</span>
                    <span className="text-[11px] text-teal-700 font-semibold tabular-nums">{patient.mrn}</span>
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <SummaryRow icon={Hash} tint="bg-blue-50" iconColor="text-blue-600" label="Patient ID" value={`#${patient.id}`} />
                <SummaryRow icon={Phone} tint="bg-violet-50" iconColor="text-violet-600" label="Phone" value={patient.phone} />
                <SummaryRow icon={Building2} tint="bg-rose-50" iconColor="text-rose-600" label="Department" value={form.department} />
                <SummaryRow icon={Stethoscope} tint="bg-emerald-50" iconColor="text-emerald-600" label="Doctor" value={form.doctor} />
                <SummaryRow icon={CalendarClock} tint="bg-purple-50" iconColor="text-purple-600" label="Date & Time" value={`${dateLabel} · ${form.visitTime}`} />
                <SummaryRow icon={ClipboardList} tint="bg-violet-50" iconColor="text-violet-600" label="Visit Type" value={form.visitType} />
                <SummaryRow
                  icon={ShieldCheck}
                  tint={form.insuranceType === "Self-Pay" ? "bg-slate-50" : "bg-green-50"}
                  iconColor={form.insuranceType === "Self-Pay" ? "text-slate-500" : "text-green-600"}
                  label="Insurance"
                  value={form.insuranceType === "Self-Pay" ? "Self-Pay" : `${form.cbhiScheme || form.insuranceType} (Valid)`}
                />
                {currentStep >= 2 && (
                  <SummaryRow icon={Ticket} tint="bg-teal-50" iconColor="text-teal-700" label="Queue Token" value={`${TOKEN} · ${form.priorityLevel}`} />
                )}
                {currentStep >= 3 && form.bp && (
                  <SummaryRow icon={Activity} tint="bg-amber-50" iconColor="text-amber-600" label="Vitals" value={`BP ${form.bp} · Temp ${form.temperature}°C`} />
                )}
              </div>
            </Card>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-2.5">
              <Lightbulb size={16} strokeWidth={2.25} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-800">Tips</span>
                <span className="text-xs text-slate-600 leading-relaxed">{TIPS[currentStep]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={<FooterButton tone="danger">Cancel Registration</FooterButton>}
        right={
          <>
            {currentStep > 1 && (
              <FooterButton tone="neutral" onClick={() => goToStep(currentStep - 1)}>
                <ArrowLeft size={15} strokeWidth={2.25} /> Back
              </FooterButton>
            )}
            <FooterButton tone="info">Save Draft</FooterButton>
            {isLastStep ? (
              <FooterPrimaryButton disabled={!form.confirmAccurate}>
                Complete Registration <CheckCircle2 size={15} strokeWidth={2.25} />
              </FooterPrimaryButton>
            ) : (
              <FooterPrimaryButton disabled={nextDisabled} onClick={() => goToStep(currentStep + 1)}>
                Next Step <ArrowRight size={15} strokeWidth={2.25} />
              </FooterPrimaryButton>
            )}
          </>
        }
      />
    </div>
  );
}

/* ============================================================================
   Root export — manages the stage state machine
   stage: "select" | "register"
   selectedPatient: PatientRow | null

   In a real Next.js app, the URL flow would be:
     /modules/opd-management/opd-registration           → Stage 0
     /modules/opd-management/opd-registration?patientId=1 → Wizard (Steps 1–4)

   Here we simulate it with local React state.
   ========================================================================== */

export default function OPDRegistrationForm() {
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);

  if (!selectedPatient) {
    return <PatientSelectionStage onSelect={setSelectedPatient} />;
  }

  return (
    <OPDWizard
      patient={selectedPatient}
      onClearPatient={() => setSelectedPatient(null)}
    />
  );
}
