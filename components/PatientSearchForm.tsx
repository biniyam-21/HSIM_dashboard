"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Info,
  Search,
  Download,
  Bookmark,
  UserPlus,
  Users,
  ScanLine,
  Eye,
  FileText,
  MoreVertical,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import ModulePageHeader from "@/components/ModulePageHeader";
import DatePicker from "@/components/DatePicker";
import {
  Card,
  FieldLabel,
  inputClass,
  Avatar,
} from "@/components/FormFields";
import { FilterPopoverButton, FilterChips, useSessionFilters, type FilterChip } from "@/components/TableFilters";

/* ---------- mock data ---------- */

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
  dob: string;
  dobISO: string;
  phone: string;
  lastVisit: string;
  lastVisitISO: string;
  department: string;
  visitContext: string;
  status: "Active" | "Inactive" | "Merged";
};

const ALL_PATIENTS: PatientRow[] = [
  {
    id: "1",
    name: "Selamawit Desta",
    nationalId: "1001-2345-6789",
    bloodGroup: "O+",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&h=100&fit=crop&crop=faces",
    mrn: "MRN-2026-000123",
    gender: "Female", age: 33, dob: "05/12/1992", dobISO: "1992-12-05",
    phone: "0911234567",
    lastVisit: "May 21, 2026", lastVisitISO: "2026-05-21",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "2",
    name: "Abebe Kebede",
    nationalId: "1001-9876-5432",
    bloodGroup: "A+",
    initials: "AK",
    mrn: "MRN-2026-000122",
    gender: "Male", age: 45, dob: "12/03/1980", dobISO: "1980-03-12",
    phone: "0911876543",
    lastVisit: "May 20, 2026", lastVisitISO: "2026-05-20",
    department: "Hematology", visitContext: "Lab - Hematology",
    status: "Active",
  },
  {
    id: "3",
    name: "Yonas Alemu",
    nationalId: "1001-1122-3344",
    bloodGroup: "B+",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&fit=crop&crop=faces",
    mrn: "MRN-2026-000121",
    gender: "Male", age: 60, dob: "17/08/1965", dobISO: "1965-08-17",
    phone: "0911567890",
    lastVisit: "May 18, 2026", lastVisitISO: "2026-05-18",
    department: "Surgery", visitContext: "IPD - Private Room",
    status: "Active",
  },
  {
    id: "4",
    name: "Sara Ahmed",
    nationalId: "1001-5566-7788",
    bloodGroup: "AB-",
    initials: "SA",
    mrn: "MRN-2026-000120",
    gender: "Female", age: 28, dob: "22/11/1997", dobISO: "1997-11-22",
    phone: "0911223344",
    lastVisit: "May 17, 2026", lastVisitISO: "2026-05-17",
    department: "Pediatrics", visitContext: "OPD - Pediatrics",
    status: "Inactive",
  },
  {
    id: "5",
    name: "Mekdes Kassa",
    nationalId: "1001-6677-8899",
    bloodGroup: "O-",
    initials: "MK",
    mrn: "MRN-2026-000119",
    gender: "Female", age: 39, dob: "09/02/1987", dobISO: "1987-02-09",
    phone: "0911334455",
    lastVisit: "May 15, 2026", lastVisitISO: "2026-05-15",
    department: "Pharmacy", visitContext: "Pharmacy",
    status: "Merged",
  },
  {
    id: "6",
    name: "Dawit Haile",
    nationalId: "1001-2233-4455",
    bloodGroup: "A-",
    initials: "DH",
    mrn: "MRN-2026-000118",
    gender: "Male", age: 52, dob: "30/06/1973", dobISO: "1973-06-30",
    phone: "0912345678",
    lastVisit: "May 14, 2026", lastVisitISO: "2026-05-14",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "7",
    name: "Tigist Bekele",
    nationalId: "1001-3344-5566",
    bloodGroup: "B-",
    initials: "TB",
    mrn: "MRN-2026-000117",
    gender: "Female", age: 24, dob: "14/04/2001", dobISO: "2001-04-14",
    phone: "0913456789",
    lastVisit: "May 12, 2026", lastVisitISO: "2026-05-12",
    department: "Pediatrics", visitContext: "OPD - Pediatrics",
    status: "Active",
  },
  {
    id: "8",
    name: "Henok Tesfaye",
    nationalId: "1001-4455-6677",
    bloodGroup: "O+",
    initials: "HT",
    mrn: "MRN-2026-000116",
    gender: "Male", age: 37, dob: "03/09/1988", dobISO: "1988-09-03",
    phone: "0914567890",
    lastVisit: "May 10, 2026", lastVisitISO: "2026-05-10",
    department: "Surgery", visitContext: "Surgery",
    status: "Active",
  },
  {
    id: "9",
    name: "Meseret Girma",
    nationalId: "1001-5566-8877",
    bloodGroup: "AB+",
    initials: "MG",
    mrn: "MRN-2026-000115",
    gender: "Female", age: 46, dob: "25/01/1980", dobISO: "1980-01-25",
    phone: "0915678901",
    lastVisit: "May 8, 2026", lastVisitISO: "2026-05-08",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "10",
    name: "Solomon Tadesse",
    nationalId: "1001-6677-9988",
    bloodGroup: "A+",
    initials: "ST",
    mrn: "MRN-2026-000114",
    gender: "Male", age: 29, dob: "18/07/1996", dobISO: "1996-07-18",
    phone: "0916789012",
    lastVisit: "May 6, 2026", lastVisitISO: "2026-05-06",
    department: "Hematology", visitContext: "Lab - Hematology",
    status: "Inactive",
  },
  {
    id: "11",
    name: "Hiwot Mekonnen",
    nationalId: "1001-7788-0011",
    bloodGroup: "O-",
    initials: "HM",
    mrn: "MRN-2026-000113",
    gender: "Female", age: 55, dob: "11/10/1970", dobISO: "1970-10-11",
    phone: "0917890123",
    lastVisit: "May 4, 2026", lastVisitISO: "2026-05-04",
    department: "Pharmacy", visitContext: "Pharmacy",
    status: "Active",
  },
  {
    id: "12",
    name: "Bereket Wolde",
    nationalId: "1001-8899-1122",
    bloodGroup: "B+",
    initials: "BW",
    mrn: "MRN-2026-000112",
    gender: "Male", age: 41, dob: "27/03/1985", dobISO: "1985-03-27",
    phone: "0918901234",
    lastVisit: "May 2, 2026", lastVisitISO: "2026-05-02",
    department: "General Medicine", visitContext: "IPD - General",
    status: "Active",
  },
  {
    id: "13",
    name: "Azeb Tesfay",
    nationalId: "1001-9900-2233",
    bloodGroup: "O+",
    initials: "AT",
    mrn: "MRN-2026-000111",
    gender: "Female", age: 32, dob: "08/05/1993", dobISO: "1993-05-08",
    phone: "0919012345",
    lastVisit: "Apr 30, 2026", lastVisitISO: "2026-04-30",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "14",
    name: "Girma Negash",
    nationalId: "1001-0011-3344",
    bloodGroup: "A-",
    initials: "GN",
    mrn: "MRN-2026-000110",
    gender: "Male", age: 68, dob: "02/12/1957", dobISO: "1957-12-02",
    phone: "0920123456",
    lastVisit: "Apr 28, 2026", lastVisitISO: "2026-04-28",
    department: "Surgery", visitContext: "Surgery",
    status: "Active",
  },
  {
    id: "15",
    name: "Wubet Alemayehu",
    nationalId: "1001-1122-4455",
    bloodGroup: "B-",
    initials: "WA",
    mrn: "MRN-2026-000109",
    gender: "Female", age: 27, dob: "16/09/1998", dobISO: "1998-09-16",
    phone: "0921234567",
    lastVisit: "Apr 25, 2026", lastVisitISO: "2026-04-25",
    department: "Pediatrics", visitContext: "OPD - Pediatrics",
    status: "Active",
  },
  {
    id: "16",
    name: "Tesfaye Mamo",
    nationalId: "1001-2233-5566",
    bloodGroup: "AB+",
    initials: "TM",
    mrn: "MRN-2026-000108",
    gender: "Male", age: 50, dob: "20/02/1976", dobISO: "1976-02-20",
    phone: "0922345678",
    lastVisit: "Apr 22, 2026", lastVisitISO: "2026-04-22",
    department: "Surgery", visitContext: "Surgery",
    status: "Inactive",
  },
  {
    id: "17",
    name: "Almaz Birru",
    nationalId: "1001-3344-6677",
    bloodGroup: "O+",
    initials: "AB",
    mrn: "MRN-2026-000107",
    gender: "Female", age: 36, dob: "07/11/1989", dobISO: "1989-11-07",
    phone: "0923456789",
    lastVisit: "Apr 20, 2026", lastVisitISO: "2026-04-20",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "18",
    name: "Eyob Hailu",
    nationalId: "1001-4455-7788",
    bloodGroup: "A+",
    initials: "EH",
    mrn: "MRN-2026-000106",
    gender: "Male", age: 23, dob: "13/06/2002", dobISO: "2002-06-13",
    phone: "0924567890",
    lastVisit: "Apr 18, 2026", lastVisitISO: "2026-04-18",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "19",
    name: "Konjit Worku",
    nationalId: "1001-5566-8899",
    bloodGroup: "O-",
    initials: "KW",
    mrn: "MRN-2026-000105",
    gender: "Female", age: 44, dob: "29/04/1982", dobISO: "1982-04-29",
    phone: "0925678901",
    lastVisit: "Apr 15, 2026", lastVisitISO: "2026-04-15",
    department: "Pharmacy", visitContext: "Pharmacy",
    status: "Active",
  },
  {
    id: "20",
    name: "Yitagesu Bekele",
    nationalId: "1001-6677-9900",
    bloodGroup: "B+",
    initials: "YB",
    mrn: "MRN-2026-000104",
    gender: "Male", age: 31, dob: "01/08/1994", dobISO: "1994-08-01",
    phone: "0926789012",
    lastVisit: "Apr 12, 2026", lastVisitISO: "2026-04-12",
    department: "Hematology", visitContext: "Lab - Hematology",
    status: "Active",
  },
  {
    id: "21",
    name: "Liya Asefa",
    nationalId: "1001-7788-0012",
    bloodGroup: "AB-",
    initials: "LA",
    mrn: "MRN-2026-000103",
    gender: "Female", age: 19, dob: "23/01/2007", dobISO: "2007-01-23",
    phone: "0927890123",
    lastVisit: "Apr 10, 2026", lastVisitISO: "2026-04-10",
    department: "Pediatrics", visitContext: "OPD - Pediatrics",
    status: "Active",
  },
  {
    id: "22",
    name: "Tewodros Kebede",
    nationalId: "1001-8899-1123",
    bloodGroup: "O+",
    initials: "TK",
    mrn: "MRN-2026-000102",
    gender: "Male", age: 57, dob: "06/07/1968", dobISO: "1968-07-06",
    phone: "0928901234",
    lastVisit: "Apr 8, 2026", lastVisitISO: "2026-04-08",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Merged",
  },
  {
    id: "23",
    name: "Rahel Demeke",
    nationalId: "1001-9900-2234",
    bloodGroup: "A+",
    initials: "RD",
    mrn: "MRN-2026-000101",
    gender: "Female", age: 42, dob: "15/03/1984", dobISO: "1984-03-15",
    phone: "0929012345",
    lastVisit: "Apr 5, 2026", lastVisitISO: "2026-04-05",
    department: "General Medicine", visitContext: "OPD - General Medicine",
    status: "Active",
  },
  {
    id: "24",
    name: "Addisu Legesse",
    nationalId: "1001-0011-3345",
    bloodGroup: "B-",
    initials: "AL",
    mrn: "MRN-2026-000100",
    gender: "Male", age: 35, dob: "19/10/1990", dobISO: "1990-10-19",
    phone: "0930123456",
    lastVisit: "Apr 2, 2026", lastVisitISO: "2026-04-02",
    department: "Surgery", visitContext: "Surgery",
    status: "Active",
  },
  {
    id: "25",
    name: "Firehiwot Tesfaye",
    nationalId: "1001-1122-4456",
    bloodGroup: "O-",
    initials: "FT",
    mrn: "MRN-2026-000099",
    gender: "Female", age: 62, dob: "10/05/1963", dobISO: "1963-05-10",
    phone: "0931234567",
    lastVisit: "Mar 30, 2026", lastVisitISO: "2026-03-30",
    department: "Surgery", visitContext: "IPD - Private Room",
    status: "Active",
  },
];

/* ---------- filter helpers ---------- */

function matchWildcard(text: string, pattern: string): boolean {
  if (!pattern) return true;
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(escaped, "i").test(text);
}

type Criteria = {
  searchBy: string;
  nameQuery: string;
  mrnQuery: string;
  phoneQuery: string;
  nationalIdQuery: string;
  dobQuery: string;
  gender: string;
  bloodGroup: string;
  department: string;
  visitDateFrom: string;
  visitDateTo: string;
  showInactive: boolean;
};

function applyFilters(patients: PatientRow[], c: Criteria): PatientRow[] {
  return patients.filter((p) => {
    // Status filter
    if (!c.showInactive && (p.status === "Inactive" || p.status === "Merged")) return false;

    // Text search
    if (c.searchBy === "Name") {
      if (c.nameQuery && !matchWildcard(p.name, c.nameQuery)) return false;
    } else if (c.searchBy === "MRN") {
      if (c.mrnQuery && !matchWildcard(p.mrn, c.mrnQuery)) return false;
    } else if (c.searchBy === "Phone") {
      if (c.phoneQuery && !matchWildcard(p.phone, c.phoneQuery)) return false;
    } else if (c.searchBy === "National ID") {
      if (c.nationalIdQuery && !matchWildcard(p.nationalId, c.nationalIdQuery)) return false;
    } else {
      // All Fields — apply every non-empty text filter with AND
      if (c.nameQuery && !matchWildcard(p.name, c.nameQuery)) return false;
      if (c.mrnQuery && !matchWildcard(p.mrn, c.mrnQuery)) return false;
      if (c.phoneQuery && !matchWildcard(p.phone, c.phoneQuery)) return false;
      if (c.nationalIdQuery && !matchWildcard(p.nationalId, c.nationalIdQuery)) return false;
    }

    // DOB partial match
    if (c.dobQuery && !p.dob.includes(c.dobQuery)) return false;

    // Gender
    if (c.gender !== "All" && p.gender !== c.gender) return false;

    // Blood group
    if (c.bloodGroup !== "All" && p.bloodGroup !== c.bloodGroup) return false;

    // Department
    if (c.department !== "All Departments" && p.department !== c.department) return false;

    // Visit date range
    if (c.visitDateFrom && p.lastVisitISO < c.visitDateFrom) return false;
    if (c.visitDateTo && p.lastVisitISO > c.visitDateTo) return false;

    return true;
  });
}

function applySorting(patients: PatientRow[], sortBy: string): PatientRow[] {
  const sorted = [...patients];
  if (sortBy === "Sort by: Name (A-Z)") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Sort by: MRN") {
    sorted.sort((a, b) => b.mrn.localeCompare(a.mrn));
  } else {
    // Last Visit (Recent) — default
    sorted.sort((a, b) => b.lastVisitISO.localeCompare(a.lastVisitISO));
  }
  return sorted;
}

/* ---------- status styles ---------- */

const STATUS_STYLES: Record<PatientRow["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
  Merged: "bg-amber-100 text-amber-700",
};

/* ---------- search criteria card ---------- */

const EMPTY_CRITERIA: Criteria = {
  searchBy: "All Fields",
  nameQuery: "",
  mrnQuery: "",
  phoneQuery: "",
  nationalIdQuery: "",
  dobQuery: "",
  gender: "All",
  bloodGroup: "All",
  department: "All Departments",
  visitDateFrom: "",
  visitDateTo: "",
  showInactive: false,
};

const ADVANCED_DEFAULTS: Pick<Criteria, "dobQuery" | "gender" | "bloodGroup" | "department" | "visitDateFrom" | "visitDateTo" | "showInactive"> = {
  dobQuery: "",
  gender: "All",
  bloodGroup: "All",
  department: "All Departments",
  visitDateFrom: "",
  visitDateTo: "",
  showInactive: false,
};

function buildChips(c: Criteria): FilterChip[] {
  const chips: FilterChip[] = [];
  if (c.gender !== "All") chips.push({ key: "gender", label: "Gender", value: c.gender });
  if (c.bloodGroup !== "All") chips.push({ key: "bloodGroup", label: "Blood Group", value: c.bloodGroup });
  if (c.department !== "All Departments") chips.push({ key: "department", label: "Department", value: c.department });
  if (c.dobQuery) chips.push({ key: "dobQuery", label: "DOB", value: c.dobQuery });
  if (c.visitDateFrom || c.visitDateTo) {
    chips.push({ key: "visitDate", label: "Visit Date", value: `${c.visitDateFrom || "…"} – ${c.visitDateTo || "…"}` });
  }
  if (c.showInactive) chips.push({ key: "showInactive", label: "Status", value: "Including inactive/merged" });
  return chips;
}

function SearchToolbar({
  criteria,
  clearKey,
  onChange,
  onRemoveChip,
  onClearAdvanced,
}: {
  criteria: Criteria;
  clearKey: number;
  onChange: (field: keyof Criteria, value: string | boolean) => void;
  onRemoveChip: (key: string) => void;
  onClearAdvanced: () => void;
}) {
  const activeCount = buildChips(criteria).length;
  const quickField: Record<string, keyof Criteria> = {
    Name: "nameQuery",
    MRN: "mrnQuery",
    Phone: "phoneQuery",
    "National ID": "nationalIdQuery",
  };
  const quickValue =
    criteria.searchBy === "All Fields"
      ? criteria.nameQuery || criteria.mrnQuery || criteria.phoneQuery || criteria.nationalIdQuery
      : criteria[quickField[criteria.searchBy]];

  const handleQuickChange = (value: string) => {
    if (criteria.searchBy === "All Fields") {
      onChange("nameQuery", value);
    } else {
      onChange(quickField[criteria.searchBy], value);
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative sm:w-48 shrink-0">
            <select
              value={criteria.searchBy}
              onChange={(e) => onChange("searchBy", e.target.value)}
              className={`${inputClass} pr-8 appearance-none bg-white`}
            >
              {["All Fields", "Name", "MRN", "Phone", "National ID"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={criteria.searchBy === "All Fields" ? "Search by name, MRN, phone, or National ID" : `Search by ${criteria.searchBy}`}
              value={quickValue as string}
              onChange={(e) => handleQuickChange(e.target.value)}
              className={`${inputClass} pl-9`}
            />
            <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <FilterPopoverButton activeCount={activeCount}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <FieldLabel>Date of Birth</FieldLabel>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={criteria.dobQuery}
                    onChange={(e) => onChange("dobQuery", e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                  <CalendarIcon size={16} strokeWidth={1.8} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel>Gender</FieldLabel>
                  <select
                    value={criteria.gender}
                    onChange={(e) => onChange("gender", e.target.value)}
                    className={`${inputClass} appearance-none bg-white`}
                  >
                    {["All", "Female", "Male"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel>Blood Group</FieldLabel>
                  <select
                    value={criteria.bloodGroup}
                    onChange={(e) => onChange("bloodGroup", e.target.value)}
                    className={`${inputClass} appearance-none bg-white`}
                  >
                    {["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Department</FieldLabel>
                <select
                  value={criteria.department}
                  onChange={(e) => onChange("department", e.target.value)}
                  className={`${inputClass} appearance-none bg-white`}
                >
                  {["All Departments", "General Medicine", "Pediatrics", "Surgery", "Hematology", "Pharmacy"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Visit Date Range</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 min-w-0">
                    <DatePicker
                      key={`visit-from-${clearKey}`}
                      placeholder="From"
                      className="w-full"
                      onChange={(d) => onChange("visitDateFrom", toISO(d))}
                    />
                  </div>
                  <span className="text-gray-400 text-xs shrink-0 select-none">—</span>
                  <div className="flex-1 min-w-0">
                    <DatePicker
                      key={`visit-to-${clearKey}`}
                      placeholder="To"
                      className="w-full"
                      onChange={(d) => onChange("visitDateTo", toISO(d))}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange("showInactive", !criteria.showInactive)}
                className="flex items-center gap-2.5"
              >
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    criteria.showInactive ? "bg-teal-700" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      criteria.showInactive ? "translate-x-[18px]" : "translate-x-1"
                    }`}
                  />
                </span>
                <span className="text-sm text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                  Show inactive/merged patients
                  <Info size={13} strokeWidth={2} className="text-gray-400 shrink-0" />
                </span>
              </button>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAdvanced}
                  className="self-start text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Clear advanced filters
                </button>
              )}
            </div>
          </FilterPopoverButton>
        </div>
        <FilterChips chips={buildChips(criteria)} onRemove={onRemoveChip} onClearAll={onClearAdvanced} />
      </div>
    </Card>
  );
}

/* ---------- search results card ---------- */

function SearchResultsCard({
  patients,
  total,
  sortBy,
  onSortChange,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: {
  patients: PatientRow[];
  total: number;
  sortBy: string;
  onSortChange: (v: string) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, total);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Search Results{" "}
          <span className="text-gray-400 font-normal text-base">
            ({total} Patient{total !== 1 ? "s" : ""} Found)
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-teal-700 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <Download size={14} strokeWidth={2} />
            Export Results
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none border border-gray-300 rounded-md pl-3 pr-8 h-9 text-sm text-gray-700 bg-white"
            >
              <option>Sort by: Last Visit (Recent)</option>
              <option>Sort by: Name (A-Z)</option>
              <option>Sort by: MRN</option>
            </select>
            <ChevronDown size={14} strokeWidth={2} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["#", "Patient", "MRN", "Gender / Age", "Phone", "Last Visit", "Status", "Actions"].map((h) => (
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
            {patients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                  No patients match your search criteria. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              patients.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 text-sm text-gray-400 font-medium tabular-nums w-8">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar photo={p.photo} initials={p.initials} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 whitespace-nowrap">{p.name}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {p.nationalId} • {p.bloodGroup}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{p.mrn}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 whitespace-nowrap">{p.gender} / {p.age} Y</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{p.dob}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{p.phone}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-slate-800 whitespace-nowrap">{p.lastVisit}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{p.visitContext}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="View patient" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                        <Eye size={15} strokeWidth={1.8} />
                      </button>
                      <button type="button" aria-label="View chart" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                        <FileText size={15} strokeWidth={1.8} />
                      </button>
                      <button type="button" aria-label="More actions" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                        <MoreVertical size={15} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-4 mt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {total === 0 ? "No results" : `Showing ${startRow} to ${endRow} of ${total} results`}
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
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400">...</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
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
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
          <div className="relative ml-2">
            <select
              value={`${pageSize} / page`}
              onChange={(e) => {
                onPageSizeChange(parseInt(e.target.value));
                onPageChange(1);
              }}
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
    </div>
  );
}

/* ---------- right column sidebars ---------- */

const SAVED_SEARCHES = [
  "Active Females - General Medicine",
  "Recent Lab Patients - Hematology",
  "Pending Pharmacy - May 2026",
];

function SavedSearchesCard() {
  return (
    <Card title="Saved Searches">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <select defaultValue="" className={`${inputClass} pr-8 appearance-none text-gray-400`}>
            <option value="" disabled>Select saved search</option>
            {SAVED_SEARCHES.map((s) => (
              <option key={s} value={s} className="text-gray-800">{s}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 h-10 border border-teal-700 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
        >
          <Bookmark size={15} strokeWidth={2} />
          Manage Saved Searches
        </button>
      </div>
    </Card>
  );
}

const QUICK_ACTIONS: { icon: LucideIcon; title: string; subtitle: string; href: string }[] = [
  { icon: UserPlus, title: "Register New Patient", subtitle: "Create a new patient record", href: "/modules/patient-management/patient-registration" },
  { icon: Users, title: "Check for Duplicates", subtitle: "Search similar patients", href: "/modules/patient-management/duplicate-management" },
  { icon: ScanLine, title: "Scan National ID", subtitle: "Scan Fayda ID card", href: "/modules/patient-management/national-id-verification" },
];

function QuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-col gap-1">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.title}
              href={a.href}
              className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-teal-700 bg-teal-50">
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-gray-500">{a.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function SearchTipsCard() {
  return (
    <Card title="Search Tips">
      <ul className="list-disc ml-4 text-sm text-gray-600 space-y-2">
        <li>Use National ID for the most accurate results.</li>
        <li>Enter at least 2 characters of the name.</li>
        <li>Use * as wildcard. Example: &quot;Sel*&quot;</li>
        <li>Date format: DD/MM/YYYY</li>
      </ul>
    </Card>
  );
}

/* ---------- floating action button ---------- */

function ChatSupportButton() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 h-11 px-5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-full shadow-lg transition-colors"
    >
      <MessageCircle size={17} strokeWidth={2} />
      Chat Support
    </button>
  );
}

/* ---------- page ---------- */

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PatientSearchForm() {
  const [criteria, setCriteria] = useSessionFilters<Criteria>("patient-search-filters", EMPTY_CRITERIA);
  const [sortBy, setSortBy] = useState("Sort by: Last Visit (Recent)");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateClearKey, setDateClearKey] = useState(0);

  const handleChange = (field: keyof Criteria, value: string | boolean) => {
    setCriteria((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleRemoveChip = (key: string) => {
    if (key === "visitDate") {
      setCriteria((prev) => ({ ...prev, visitDateFrom: "", visitDateTo: "" }));
      setDateClearKey((k) => k + 1);
    } else {
      setCriteria((prev) => ({ ...prev, [key]: (ADVANCED_DEFAULTS as Record<string, string | boolean>)[key] }));
    }
    setCurrentPage(1);
  };

  const handleClearAdvanced = () => {
    setCriteria((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setDateClearKey((k) => k + 1);
    setCurrentPage(1);
  };

  const filteredSorted = useMemo(() => {
    return applySorting(applyFilters(ALL_PATIENTS, criteria), sortBy);
  }, [criteria, sortBy]);

  const paginatedPatients = useMemo(
    () => filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredSorted, currentPage, pageSize]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
      <ModulePageHeader title="Patient Search" breadcrumb="Patient Management > Patient Search" />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <SearchToolbar
            criteria={criteria}
            clearKey={dateClearKey}
            onChange={handleChange}
            onRemoveChip={handleRemoveChip}
            onClearAdvanced={handleClearAdvanced}
          />
          <SearchResultsCard
            patients={paginatedPatients}
            total={filteredSorted.length}
            sortBy={sortBy}
            onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <SavedSearchesCard />
          <QuickActionsCard />
          <SearchTipsCard />
        </div>
      </div>

      <ChatSupportButton />
    </div>
  );
}
