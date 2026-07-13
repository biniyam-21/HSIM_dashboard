"use client";

// Laboratory / LIS module component for pathology workflow and specimen case handling.

import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
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
  Plus,
  TestTube,
  History,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Check,
  Filter,
  FilterX,
  Microscope,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Ruler,
  Highlighter,
  Layers,
  Signature,
  Stamp,
  Send,
  Repeat,
  Gauge,
  RotateCw,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import { FieldLabel, inputClass, Card, Avatar } from "@/components/FormFields";
import DatePicker from "@/components/DatePicker";
import { StickyFooter, FooterButton } from "@/components/OpdShared";

/* ============================================================================
   Laboratory (LIS) — Pathology Case Review.
   A digital pathology case-review workstation: gross/microscopic narrative
   review, a digital slide viewer, structured diagnosis + staging, and a
   sign-and-release workflow. Deliberately document/image-centric rather than
   spreadsheet- or monitoring-centric, unlike the other LIS pages.
   ========================================================================== */

/* ---------- types ---------- */

type Priority = "Routine" | "Urgent" | "STAT";
type CaseStage = "Received" | "Gross Examination" | "Processing" | "Slide Ready" | "Microscopy" | "Diagnosis" | "Peer Review" | "Digitally Signed" | "Released";
type SpecimenType = "Histopathology" | "Biopsy" | "Cytology" | "Frozen Section" | "Bone Marrow" | "Breast Biopsy" | "Colon Biopsy" | "Skin Biopsy" | "Lymph Node";
type SlideType = "Gross" | "Microscopic" | "Frozen Section" | "Special Stain";
type Invasion = "Present" | "Absent" | "Not Applicable";

type SlideImage = { id: string; label: string; type: SlideType; tone: string };
type PriorCase = { caseNumber: string; date: string; diagnosis: string };
type AuditEvent = { time: string; action: string; user: string };

type PathologyCase = {
  id: string;
  specimenNumber: string;
  accessionNumber: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female";
  department: string;
  doctor: string;
  priority: Priority;
  stage: CaseStage;
  specimenType: SpecimenType;
  isCancer: boolean;
  isFrozenSection: boolean;
  receivedDate: string;
  receivedAtISO: string;
  collectionDate: string;
  fixative: string;
  containerCount: number;
  collectionSite: string;
  clinicalHistory: string;
  diagnosisSummary: string;
  bloodGroup: string;
  insurance: string;
  grossDescription: string;
  microscopicDescription: string;
  slides: SlideImage[];
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  icdOCode: string;
  snomedCode: string;
  tumorGrade: string;
  tnmStage: string;
  margins: string;
  lvi: Invasion;
  pni: Invasion;
  recommendations: string;
  pathologist: string;
  signedBy: string | null;
  signedAt: string | null;
  peerReviewRequested: boolean;
  peerReviewer: string | null;
  priorCases: PriorCase[];
  clinicalAlerts: string[];
  auditTrail: AuditEvent[];
};

/* ---------- mock data ---------- */

const PATHOLOGY_CASES: PathologyCase[] = [
  {
    id: "PATH-2026-000487", specimenNumber: "SPC-PATH-2026-0221", accessionNumber: "ACC-2026-004871",
    patientName: "Selamawit Abebe", mrn: "MRN-2026-000123", age: 34, gender: "Female",
    department: "General Surgery", doctor: "Dr. Eyob Tesfaye", priority: "Routine", stage: "Diagnosis",
    specimenType: "Breast Biopsy", isCancer: true, isFrozenSection: false,
    receivedDate: "05/19/2026 · 09:40 AM", receivedAtISO: "2026-05-19", collectionDate: "05/19/2026",
    fixative: "10% Neutral Buffered Formalin", containerCount: 1, collectionSite: "Left breast, upper outer quadrant",
    clinicalHistory: "34-year-old female with a palpable left breast mass, 2.1 cm, first noted 6 weeks ago. Family history of breast cancer (mother, age 58). Core needle biopsy submitted for histopathological evaluation.",
    diagnosisSummary: "Invasive ductal carcinoma — pending staging", bloodGroup: "O+", insurance: "Woreda 07 CBHI",
    grossDescription: "Received in formalin, one core biopsy fragment measuring 1.8 cm in length, 0.2 cm in diameter, tan-white, firm. Entirely submitted in one cassette.",
    microscopicDescription: "Sections show infiltrating nests and cords of atypical epithelial cells with moderate nuclear pleomorphism, hyperchromasia, and increased mitotic activity (8/10 HPF). Desmoplastic stroma surrounds tumor nests. No definite lymphovascular invasion identified in submitted sections.",
    slides: [
      { id: "s1", label: "Gross Photo — Specimen A", type: "Gross", tone: "from-rose-100 via-rose-50 to-amber-50" },
      { id: "s2", label: "H&E ×100 — Section 1", type: "Microscopic", tone: "from-fuchsia-200 via-pink-100 to-rose-100" },
      { id: "s3", label: "H&E ×400 — Section 2", type: "Microscopic", tone: "from-purple-200 via-fuchsia-100 to-pink-100" },
      { id: "s4", label: "IHC — ER Stain", type: "Special Stain", tone: "from-amber-200 via-yellow-100 to-orange-100" },
      { id: "s5", label: "IHC — HER2 Stain", type: "Special Stain", tone: "from-teal-100 via-emerald-50 to-cyan-100" },
    ],
    primaryDiagnosis: "Invasive ductal carcinoma, no special type (NST), grade 2", secondaryDiagnosis: "Ductal carcinoma in situ, adjacent, low grade",
    icdOCode: "8500/3", snomedCode: "M-85003", tumorGrade: "Grade 2 (Modified Bloom-Richardson)", tnmStage: "",
    margins: "Not assessable (core biopsy)", lvi: "Absent", pni: "Not Applicable",
    recommendations: "Recommend excisional biopsy / lumpectomy with margin assessment. ER/PR/HER2 IHC pending. Multidisciplinary tumor board review advised.",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: null, signedAt: null,
    peerReviewRequested: false, peerReviewer: null,
    priorCases: [{ caseNumber: "PATH-2024-000112", date: "Mar 2024", diagnosis: "Fibroadenoma, benign — right breast" }],
    clinicalAlerts: ["Family history of breast cancer", "First malignant diagnosis for this patient"],
    auditTrail: [
      { time: "09:40 AM", action: "Specimen received", user: "Martha Alemu (Accessioning)" },
      { time: "10:15 AM", action: "Gross examination completed", user: "Martha Alemu" },
      { time: "05/20 08:00 AM", action: "Slides prepared — 5 slides", user: "Histology Technician" },
      { time: "05/20 02:30 PM", action: "Microscopic examination started", user: "Dr. Hanna Bekele" },
    ],
  },
  {
    id: "PATH-2026-000502", specimenNumber: "SPC-PATH-2026-0236", accessionNumber: "ACC-2026-005022",
    patientName: "Bekele Hailu Tesfaye", mrn: "MRN-2026-000456", age: 38, gender: "Male",
    department: "General Surgery", doctor: "Dr. Dawit Bekele", priority: "STAT", stage: "Microscopy",
    specimenType: "Frozen Section", isCancer: false, isFrozenSection: true,
    receivedDate: "05/21/2026 · 11:10 AM", receivedAtISO: "2026-05-21", collectionDate: "05/21/2026",
    fixative: "None (fresh, frozen intra-operatively)", containerCount: 1, collectionSite: "Right knee — synovial tissue",
    clinicalHistory: "Intra-operative frozen section requested during right knee arthroscopy for suspected inflammatory vs. infectious synovitis.",
    diagnosisSummary: "Frozen section — chronic synovitis, intra-op consult", bloodGroup: "O+", insurance: "Self-Pay",
    grossDescription: "Fresh synovial tissue fragment, 0.8 x 0.5 x 0.3 cm, tan-pink, submitted intact for frozen section.",
    microscopicDescription: "Frozen section shows synovial hyperplasia with mild chronic inflammatory infiltrate. No acute inflammation, no granulomas, no malignant cells identified on frozen sections.",
    slides: [
      { id: "s1", label: "Frozen Section ×100", type: "Frozen Section", tone: "from-sky-100 via-cyan-50 to-blue-50" },
      { id: "s2", label: "Frozen Section ×400", type: "Frozen Section", tone: "from-indigo-100 via-sky-50 to-blue-100" },
    ],
    primaryDiagnosis: "Chronic synovitis, no evidence of malignancy on frozen section", secondaryDiagnosis: "",
    icdOCode: "", snomedCode: "", tumorGrade: "", tnmStage: "",
    margins: "Not applicable", lvi: "Not Applicable", pni: "Not Applicable",
    recommendations: "Permanent sections to follow for final confirmation. Correlate with synovial fluid culture.",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: null, signedAt: null,
    peerReviewRequested: false, peerReviewer: null,
    priorCases: [],
    clinicalAlerts: ["STAT frozen section — surgeon awaiting intra-operative result"],
    auditTrail: [
      { time: "11:10 AM", action: "Specimen received (fresh, intra-op)", user: "OT Runner" },
      { time: "11:16 AM", action: "Frozen section prepared", user: "Histology Technician" },
      { time: "11:22 AM", action: "Microscopic examination started", user: "Dr. Hanna Bekele" },
    ],
  },
  {
    id: "PATH-2026-000469", specimenNumber: "SPC-PATH-2026-0203", accessionNumber: "ACC-2026-004691",
    patientName: "Alemu Getahun", mrn: "MRN-2026-000234", age: 51, gender: "Male",
    department: "Gastroenterology", doctor: "Dr. Eyob Tesfaye", priority: "Urgent", stage: "Peer Review",
    specimenType: "Colon Biopsy", isCancer: true, isFrozenSection: false,
    receivedDate: "05/16/2026 · 02:20 PM", receivedAtISO: "2026-05-16", collectionDate: "05/16/2026",
    fixative: "10% Neutral Buffered Formalin", containerCount: 3, collectionSite: "Sigmoid colon, colonoscopic biopsy",
    clinicalHistory: "51-year-old male, screening colonoscopy for family history of colorectal cancer. 3.5 cm sigmoid mass biopsied.",
    diagnosisSummary: "Adenocarcinoma, sigmoid colon — peer review requested", bloodGroup: "AB+", insurance: "Woreda 07 CBHI",
    grossDescription: "Three fragments of tan-pink tissue, aggregate size 0.6 x 0.5 x 0.3 cm, entirely submitted in one cassette.",
    microscopicDescription: "Sections show glandular structures with cribriform architecture, moderate nuclear atypia, and loss of normal crypt architecture, consistent with invasive adenocarcinoma. Tumor infiltrates submucosa in available sections.",
    slides: [
      { id: "s1", label: "Gross Photo — Fragments", type: "Gross", tone: "from-rose-100 via-orange-50 to-amber-50" },
      { id: "s2", label: "H&E ×100 — Fragment 1", type: "Microscopic", tone: "from-fuchsia-200 via-rose-100 to-pink-100" },
      { id: "s3", label: "H&E ×400 — Fragment 2", type: "Microscopic", tone: "from-purple-200 via-pink-100 to-fuchsia-100" },
    ],
    primaryDiagnosis: "Invasive adenocarcinoma, sigmoid colon, moderately differentiated", secondaryDiagnosis: "Tubulovillous adenoma, adjacent, with high-grade dysplasia",
    icdOCode: "8140/3", snomedCode: "M-81403", tumorGrade: "Grade 2 (Moderately differentiated)", tnmStage: "pT2 (biopsy — depth not fully assessable)",
    margins: "Not assessable (biopsy)", lvi: "Absent", pni: "Absent",
    recommendations: "Recommend surgical resection with formal TNM staging on resection specimen. Refer to oncology for staging workup (CT chest/abdomen/pelvis, CEA).",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: null, signedAt: null,
    peerReviewRequested: true, peerReviewer: "Dr. Tewodros Girma (Senior Pathologist)",
    priorCases: [],
    clinicalAlerts: ["Family history of colorectal cancer", "Peer review requested — new malignancy diagnosis"],
    auditTrail: [
      { time: "05/16 02:20 PM", action: "Specimen received", user: "Martha Alemu" },
      { time: "05/17 09:00 AM", action: "Slides prepared", user: "Histology Technician" },
      { time: "05/17 03:15 PM", action: "Diagnosis entered", user: "Dr. Hanna Bekele" },
      { time: "05/18 10:00 AM", action: "Peer review requested", user: "Dr. Hanna Bekele" },
    ],
  },
  {
    id: "PATH-2026-000441", specimenNumber: "SPC-PATH-2026-0177", accessionNumber: "ACC-2026-004411",
    patientName: "Hana Yohannes", mrn: "MRN-2026-000321", age: 45, gender: "Female",
    department: "Dermatology", doctor: "Dr. Hana Alemayehu", priority: "Routine", stage: "Released",
    specimenType: "Skin Biopsy", isCancer: false, isFrozenSection: false,
    receivedDate: "05/10/2026 · 10:00 AM", receivedAtISO: "2026-05-10", collectionDate: "05/10/2026",
    fixative: "10% Neutral Buffered Formalin", containerCount: 1, collectionSite: "Left forearm, punch biopsy",
    clinicalHistory: "Pigmented lesion, left forearm, 0.6 cm, stable for 2 years. Punch biopsy for histological confirmation.",
    diagnosisSummary: "Compound melanocytic nevus, benign", bloodGroup: "B-", insurance: "Self-Pay",
    grossDescription: "Punch biopsy of skin, 0.4 cm in diameter, 0.3 cm in depth, with central pigmented papule. Bisected and entirely submitted.",
    microscopicDescription: "Sections show a well-circumscribed compound melanocytic proliferation with maturation with depth, no cytologic atypia, no mitotic figures, no evidence of malignancy.",
    slides: [
      { id: "s1", label: "H&E ×40 — Overview", type: "Microscopic", tone: "from-pink-100 via-rose-50 to-fuchsia-50" },
      { id: "s2", label: "H&E ×200 — Detail", type: "Microscopic", tone: "from-fuchsia-100 via-pink-50 to-rose-50" },
    ],
    primaryDiagnosis: "Compound melanocytic nevus, benign, completely excised", secondaryDiagnosis: "",
    icdOCode: "8760/0", snomedCode: "M-87600", tumorGrade: "", tnmStage: "",
    margins: "Negative, clear margins", lvi: "Not Applicable", pni: "Not Applicable",
    recommendations: "No further treatment required. Routine dermatological follow-up recommended.",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: "Dr. Hanna Bekele", signedAt: "05/12/2026 · 04:30 PM",
    peerReviewRequested: false, peerReviewer: null,
    priorCases: [],
    clinicalAlerts: [],
    auditTrail: [
      { time: "05/10 10:00 AM", action: "Specimen received", user: "Martha Alemu" },
      { time: "05/11 09:00 AM", action: "Slides prepared", user: "Histology Technician" },
      { time: "05/12 11:00 AM", action: "Diagnosis entered", user: "Dr. Hanna Bekele" },
      { time: "05/12 04:30 PM", action: "Digitally signed", user: "Dr. Hanna Bekele" },
      { time: "05/12 04:32 PM", action: "Report released to physician", user: "Dr. Hanna Bekele" },
    ],
  },
  {
    id: "PATH-2026-000455", specimenNumber: "SPC-PATH-2026-0189", accessionNumber: "ACC-2026-004551",
    patientName: "Genet Alemu", mrn: "MRN-2026-000275", age: 29, gender: "Female",
    department: "General Surgery", doctor: "Dr. Eyob Tesfaye", priority: "Urgent", stage: "Digitally Signed",
    specimenType: "Lymph Node", isCancer: true, isFrozenSection: false,
    receivedDate: "05/14/2026 · 01:00 PM", receivedAtISO: "2026-05-14", collectionDate: "05/14/2026",
    fixative: "10% Neutral Buffered Formalin", containerCount: 1, collectionSite: "Right axillary lymph node, excisional biopsy",
    clinicalHistory: "Persistent right axillary lymphadenopathy x3 months, night sweats, weight loss. Excisional biopsy for tissue diagnosis.",
    diagnosisSummary: "Diffuse large B-cell lymphoma", bloodGroup: "A-", insurance: "Self-Pay",
    grossDescription: "Single lymph node, 2.8 x 2.1 x 1.9 cm, tan-white, homogeneous cut surface, capsule intact. Serially sectioned and entirely submitted.",
    microscopicDescription: "Effacement of normal nodal architecture by diffuse infiltrate of large atypical lymphoid cells with vesicular nuclei, prominent nucleoli, and high mitotic rate. IHC pending for confirmation of lineage.",
    slides: [
      { id: "s1", label: "Gross Photo — Lymph Node", type: "Gross", tone: "from-amber-100 via-orange-50 to-rose-50" },
      { id: "s2", label: "H&E ×100", type: "Microscopic", tone: "from-purple-200 via-fuchsia-100 to-pink-100" },
      { id: "s3", label: "IHC — CD20", type: "Special Stain", tone: "from-teal-100 via-cyan-50 to-emerald-100" },
      { id: "s4", label: "IHC — Ki-67", type: "Special Stain", tone: "from-amber-200 via-yellow-100 to-orange-100" },
    ],
    primaryDiagnosis: "Diffuse large B-cell lymphoma (DLBCL), NOS", secondaryDiagnosis: "",
    icdOCode: "9680/3", snomedCode: "M-96803", tumorGrade: "High grade", tnmStage: "Ann Arbor stage pending imaging",
    margins: "Not applicable (lymph node excision)", lvi: "Not Applicable", pni: "Not Applicable",
    recommendations: "Urgent oncology / hematology referral. PET-CT for staging. Bone marrow biopsy to complete staging workup.",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: "Dr. Hanna Bekele", signedAt: "05/16/2026 · 09:15 AM",
    peerReviewRequested: true, peerReviewer: "Dr. Tewodros Girma (Senior Pathologist)",
    priorCases: [],
    clinicalAlerts: ["Critical diagnosis — high-grade lymphoma", "Urgent oncology referral pending"],
    auditTrail: [
      { time: "05/14 01:00 PM", action: "Specimen received", user: "Martha Alemu" },
      { time: "05/15 08:30 AM", action: "Slides prepared", user: "Histology Technician" },
      { time: "05/15 02:00 PM", action: "Diagnosis entered", user: "Dr. Hanna Bekele" },
      { time: "05/15 04:00 PM", action: "Peer review completed — concurrence", user: "Dr. Tewodros Girma" },
      { time: "05/16 09:15 AM", action: "Digitally signed", user: "Dr. Hanna Bekele" },
    ],
  },
  {
    id: "PATH-2026-000511", specimenNumber: "SPC-PATH-2026-0245", accessionNumber: "ACC-2026-005111",
    patientName: "Kebede Worku", mrn: "MRN-2026-000512", age: 55, gender: "Male",
    department: "Hematology", doctor: "Dr. Hana Alemayehu", priority: "Routine", stage: "Gross Examination",
    specimenType: "Bone Marrow", isCancer: false, isFrozenSection: false,
    receivedDate: "05/21/2026 · 08:30 AM", receivedAtISO: "2026-05-21", collectionDate: "05/21/2026",
    fixative: "B-Plus Fixative + Decalcification", containerCount: 2, collectionSite: "Posterior iliac crest, bone marrow biopsy + aspirate",
    clinicalHistory: "Pancytopenia workup, rule out marrow infiltration vs. aplastic process.",
    diagnosisSummary: "Bone marrow biopsy — gross examination in progress", bloodGroup: "O+", insurance: "Woreda 07 CBHI",
    grossDescription: "", microscopicDescription: "",
    slides: [],
    primaryDiagnosis: "", secondaryDiagnosis: "", icdOCode: "", snomedCode: "", tumorGrade: "", tnmStage: "",
    margins: "", lvi: "Not Applicable", pni: "Not Applicable", recommendations: "",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: null, signedAt: null,
    peerReviewRequested: false, peerReviewer: null,
    priorCases: [],
    clinicalAlerts: [],
    auditTrail: [{ time: "08:30 AM", action: "Specimen received", user: "Martha Alemu" }],
  },
  {
    id: "PATH-2026-000398", specimenNumber: "SPC-PATH-2026-0142", accessionNumber: "ACC-2026-003981",
    patientName: "Marta Alemu", mrn: "MRN-2026-000567", age: 29, gender: "Female",
    department: "Gynecology", doctor: "Dr. Hana Alemayehu", priority: "Routine", stage: "Received",
    specimenType: "Cytology", isCancer: false, isFrozenSection: false,
    receivedDate: "05/21/2026 · 09:00 AM", receivedAtISO: "2026-05-21", collectionDate: "05/21/2026",
    fixative: "Liquid-based cytology (ThinPrep)", containerCount: 1, collectionSite: "Cervix, Pap smear",
    clinicalHistory: "Routine cervical cancer screening, age 29, no prior abnormal Pap smears.",
    diagnosisSummary: "Pap smear — awaiting processing", bloodGroup: "O-", insurance: "Self-Pay",
    grossDescription: "", microscopicDescription: "",
    slides: [],
    primaryDiagnosis: "", secondaryDiagnosis: "", icdOCode: "", snomedCode: "", tumorGrade: "", tnmStage: "",
    margins: "", lvi: "Not Applicable", pni: "Not Applicable", recommendations: "",
    pathologist: "Dr. Hanna Bekele (Pathology)", signedBy: null, signedAt: null,
    peerReviewRequested: false, peerReviewer: null,
    priorCases: [{ caseNumber: "PATH-2023-000891", date: "May 2023", diagnosis: "Pap smear — negative for intraepithelial lesion" }],
    clinicalAlerts: [],
    auditTrail: [{ time: "09:00 AM", action: "Specimen received", user: "Martha Alemu" }],
  },
];

const DOCTORS = ["Dr. Eyob Tesfaye", "Dr. Hana Alemayehu", "Dr. Dawit Bekele"];
const DEPARTMENTS = ["General Surgery", "Gastroenterology", "Dermatology", "Hematology", "Gynecology"];
const SPECIMEN_TYPES: SpecimenType[] = ["Histopathology", "Biopsy", "Cytology", "Frozen Section", "Bone Marrow", "Breast Biopsy", "Colon Biopsy", "Skin Biopsy", "Lymph Node"];
const PATHOLOGISTS = ["Dr. Hanna Bekele (Pathology)", "Dr. Tewodros Girma (Senior Pathologist)"];
const CURRENT_PATHOLOGIST = "Dr. Hanna Bekele (Pathology)";
const QUICK_STATUS_CHIPS = ["All", "Pending", "Gross Exam", "Slide Ready", "Microscopy", "Diagnosis", "Awaiting Signature", "Released", "Critical", "Cancer", "Frozen Section"];
const CASE_TIMELINE_STAGES: CaseStage[] = ["Received", "Gross Examination", "Processing", "Slide Ready", "Microscopy", "Diagnosis", "Peer Review", "Digitally Signed", "Released"];

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

const STAGE_STYLES: Record<CaseStage, string> = {
  Received: "bg-slate-100 text-slate-600",
  "Gross Examination": "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  "Slide Ready": "bg-violet-50 text-violet-700",
  Microscopy: "bg-blue-50 text-blue-700",
  Diagnosis: "bg-amber-50 text-amber-700",
  "Peer Review": "bg-violet-50 text-violet-700",
  "Digitally Signed": "bg-teal-50 text-teal-700",
  Released: "bg-teal-700 text-white",
};

function isReadOnly(stage: CaseStage) {
  return stage === "Released";
}

function isCritical(c: PathologyCase) {
  return c.clinicalAlerts.some((a) => a.toLowerCase().includes("critical")) || (c.isCancer && (c.stage === "Diagnosis" || c.stage === "Peer Review"));
}

function matchesQuickStatus(c: PathologyCase, q: string): boolean {
  if (q === "All") return true;
  if (q === "Pending") return c.stage === "Received";
  if (q === "Gross Exam") return c.stage === "Gross Examination";
  if (q === "Slide Ready") return c.stage === "Slide Ready";
  if (q === "Microscopy") return c.stage === "Microscopy";
  if (q === "Diagnosis") return c.stage === "Diagnosis";
  if (q === "Awaiting Signature") return c.stage === "Peer Review" || (c.stage === "Diagnosis" && !c.signedBy);
  if (q === "Released") return c.stage === "Released";
  if (q === "Critical") return isCritical(c);
  if (q === "Cancer") return c.isCancer;
  if (q === "Frozen Section") return c.isFrozenSection;
  return true;
}

/* ---------- KPI cards ---------- */

type KpiCard = { icon: typeof ClipboardList; iconBg: string; label: string; value: string; sublabel: string; quickFilter: string };

function buildKpiCards(cases: PathologyCase[]): KpiCard[] {
  const pending = cases.filter((c) => c.stage === "Received").length;
  const underReview = cases.filter((c) => ["Gross Examination", "Processing", "Slide Ready", "Microscopy", "Diagnosis", "Peer Review"].includes(c.stage)).length;
  const completedToday = cases.filter((c) => c.stage === "Digitally Signed" || c.stage === "Released").length;
  const critical = cases.filter((c) => isCritical(c)).length;
  const peerReviewPending = cases.filter((c) => c.peerReviewRequested && c.stage === "Peer Review").length;

  return [
    { icon: Hourglass, iconBg: "bg-[#F8A05F]", label: "Pending Cases", value: String(pending), sublabel: "Awaiting gross exam", quickFilter: "Pending" },
    { icon: Microscope, iconBg: "bg-[#627EC1]", label: "Cases Under Review", value: String(underReview), sublabel: "In active workflow", quickFilter: "All" },
    { icon: CircleCheckBig, iconBg: "bg-[#216E6A]", label: "Completed Today", value: String(completedToday), sublabel: "Signed / released", quickFilter: "Released" },
    { icon: ShieldAlert, iconBg: "bg-[#DB5567]", label: "Critical Findings", value: String(critical), sublabel: "Needs confirmation", quickFilter: "Critical" },
    { icon: Repeat, iconBg: "bg-[#5C8E64]", label: "Peer Reviews Pending", value: String(peerReviewPending), sublabel: "Awaiting concurrence", quickFilter: "Awaiting Signature" },
    { icon: Gauge, iconBg: "bg-[#216E6A]", label: "Avg. Turnaround Time", value: "2.1 days", sublabel: "Receipt to release", quickFilter: "All" },
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

type SearchField = "All Fields" | "Patient Name" | "MRN" | "Case Number" | "Specimen Number" | "Accession Number" | "National ID" | "Physician" | "Diagnosis";

type CaseFilters = {
  searchBy: SearchField;
  query: string;
  department: string;
  specimenType: string;
  status: string;
  pathologist: string;
  priority: string;
  cancerCases: string;
  date: string;
};

const EMPTY_FILTERS: CaseFilters = {
  searchBy: "All Fields", query: "", department: "All", specimenType: "All", status: "All", pathologist: "All Pathologists", priority: "All", cancerCases: "All", date: "",
};

const ADVANCED_DEFAULTS: Omit<CaseFilters, "searchBy" | "query"> = {
  department: "All", specimenType: "All", status: "All", pathologist: "All Pathologists", priority: "All", cancerCases: "All", date: "",
};

function matchesSearch(o: PathologyCase, searchBy: SearchField, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const fieldValue: Record<Exclude<SearchField, "All Fields">, string> = {
    "Patient Name": o.patientName, MRN: o.mrn, "Case Number": o.id, "Specimen Number": o.specimenNumber, "Accession Number": o.accessionNumber,
    "National ID": o.mrn, Physician: o.doctor, Diagnosis: o.diagnosisSummary,
  };
  if (searchBy === "All Fields") return Object.values(fieldValue).some((v) => v.toLowerCase().includes(needle));
  return fieldValue[searchBy].toLowerCase().includes(needle);
}

function applyFilters(cases: PathologyCase[], f: CaseFilters, quickStatus: string): PathologyCase[] {
  return cases.filter((o) => {
    if (!matchesSearch(o, f.searchBy, f.query)) return false;
    if (f.department !== "All" && o.department !== f.department) return false;
    if (f.specimenType !== "All" && o.specimenType !== f.specimenType) return false;
    if (f.status !== "All" && o.stage !== f.status) return false;
    if (f.pathologist !== "All Pathologists" && o.pathologist !== f.pathologist) return false;
    if (f.priority !== "All" && o.priority !== f.priority) return false;
    if (f.cancerCases === "Cancer Only" && !o.isCancer) return false;
    if (f.cancerCases === "Non-Cancer Only" && o.isCancer) return false;
    if (f.date && o.receivedAtISO !== f.date) return false;
    if (!matchesQuickStatus(o, quickStatus)) return false;
    return true;
  });
}

function countActiveFilters(f: CaseFilters): number {
  let n = 0;
  (Object.keys(ADVANCED_DEFAULTS) as (keyof typeof ADVANCED_DEFAULTS)[]).forEach((k) => {
    if (k === "date") return;
    if (f[k] !== ADVANCED_DEFAULTS[k]) n++;
  });
  if (f.date) n++;
  return n;
}

/* ---------- filter bar ---------- */

function PathologyFilterBar({
  filters, clearKey, quickStatus, onChange, onQuickStatus, onClearAdvanced,
}: {
  filters: CaseFilters; clearKey: number; quickStatus: string;
  onChange: (partial: Partial<CaseFilters>) => void; onQuickStatus: (q: string) => void; onClearAdvanced: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-52 shrink-0">
          <select value={filters.searchBy} onChange={(e) => onChange({ searchBy: e.target.value as SearchField })} className={`${inputClass} pr-8 appearance-none bg-white`}>
            {(["All Fields", "Patient Name", "MRN", "Case Number", "Specimen Number", "Accession Number", "National ID", "Physician", "Diagnosis"] as SearchField[]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={filters.searchBy === "All Fields" ? "Search by patient, MRN, case #, specimen #…" : `Search by ${filters.searchBy}`}
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
          aria-controls="pathology-filters-panel"
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
          <div id="pathology-filters-panel" aria-hidden={!filtersOpen} className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100">
            <ControlledSelect label="Department" value={filters.department} onChange={(v) => onChange({ department: v })} options={["All", ...DEPARTMENTS]} />
            <ControlledSelect label="Specimen Type" value={filters.specimenType} onChange={(v) => onChange({ specimenType: v })} options={["All", ...SPECIMEN_TYPES]} />
            <ControlledSelect label="Case Status" value={filters.status} onChange={(v) => onChange({ status: v })} options={["All", ...CASE_TIMELINE_STAGES]} />
            <ControlledSelect label="Pathologist" value={filters.pathologist} onChange={(v) => onChange({ pathologist: v })} options={["All Pathologists", ...PATHOLOGISTS]} />
            <ControlledSelect label="Priority" value={filters.priority} onChange={(v) => onChange({ priority: v })} options={["All", "Routine", "Urgent", "STAT"]} />
            <ControlledSelect label="Cancer Cases" value={filters.cancerCases} onChange={(v) => onChange({ cancerCases: v })} options={["All", "Cancer Only", "Non-Cancer Only"]} />
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

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/* ---------- left panel: case queue ---------- */

function CaseQueueCard({ c, selected, onSelect }: { c: PathologyCase; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-2 text-left w-full rounded-lg border p-3 transition-colors ${PRIORITY_BORDER[c.priority]} ${
        selected ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLES[c.priority]}`}>{c.priority}</span>
        <div className="flex items-center gap-1.5">
          {c.isFrozenSection && <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-blue-700 bg-blue-50 rounded-full px-1.5 py-0.5">Frozen</span>}
          {c.isCancer && <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-red-600 bg-red-50 rounded-full px-1.5 py-0.5">Cancer</span>}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-slate-900 truncate">{c.patientName}</span>
        <span className="text-[11px] text-gray-400 truncate">{c.mrn} · {c.id}</span>
      </div>
      <span className="text-[11px] text-gray-500 truncate">{c.specimenType} · {c.doctor}</span>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${STAGE_STYLES[c.stage]}`}>{c.stage}</span>
        <span className="text-[10.5px] text-gray-400">{c.receivedDate.split(" · ")[0]}</span>
      </div>
    </button>
  );
}

/* ---------- center panel: structured narrative editor ---------- */

function StructuredEditor({
  templates, value, onChange, placeholder, disabled,
}: {
  templates: string[]; value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean;
}) {
  const insertTemplate = (t: string) => {
    onChange(value ? `${value}\n${t}: ` : `${t}: `);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => insertTemplate(t)}
            className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-full px-2.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + {t}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder={placeholder}
        className={`${inputClass} resize-none leading-relaxed disabled:bg-gray-50 disabled:text-gray-500`}
      />
    </div>
  );
}

/* ---------- digital slide viewer ---------- */

function SlideViewer({ slides }: { slides: SlideImage[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [annotate, setAnnotate] = useState(false);

  const active = slides[activeIdx];

  if (slides.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <SectionHeading icon={ImageIcon} iconTone="bg-violet-50 text-violet-600" title="Digital Slide Viewer" />
        <div className="flex flex-col items-center justify-center gap-2 h-56 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
          <Microscope size={28} strokeWidth={1.5} className="text-gray-300" />
          <span className="text-sm text-gray-400">No slides have been prepared for this case yet.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${fullscreen ? "fixed inset-4 z-50 shadow-2xl overflow-y-auto" : ""}`}>
      <div className="p-4">
        <SectionHeading
          icon={ImageIcon}
          iconTone="bg-violet-50 text-violet-600"
          title="Digital Slide Viewer"
          action={
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Zoom out" className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                <ZoomOut size={13} strokeWidth={2.25} />
              </button>
              <span className="text-[11px] font-semibold text-slate-600 w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.5))} aria-label="Zoom in" className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                <ZoomIn size={13} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => setAnnotate((v) => !v)}
                aria-pressed={annotate}
                className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors ${annotate ? "border-teal-700 bg-teal-50 text-teal-700" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                aria-label="Toggle annotation mode"
              >
                <Highlighter size={13} strokeWidth={2.25} />
              </button>
              <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Measurement tool">
                <Ruler size={13} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => setFullscreen((v) => !v)}
                aria-pressed={fullscreen}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="Toggle fullscreen"
              >
                {fullscreen ? <Minimize2 size={13} strokeWidth={2.25} /> : <Maximize2 size={13} strokeWidth={2.25} />}
              </button>
            </div>
          }
        />

        <div className={`relative rounded-lg overflow-hidden border ${annotate ? "border-teal-600 ring-2 ring-teal-600/20" : "border-gray-200"} ${fullscreen ? "h-[60vh]" : "h-72"} bg-gray-50 flex items-center justify-center`}>
          <div
            className={`w-full h-full bg-gradient-to-br ${active.tone} relative transition-transform duration-300 ease-out`}
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0px, transparent 3px, transparent 14px), repeating-radial-gradient(circle at 70% 60%, rgba(120,40,90,0.25) 0px, transparent 4px, transparent 18px)" }}
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1">
              <Microscope size={12} strokeWidth={2.25} /> {active.label}
            </div>
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide text-slate-700 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5">{active.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setActiveIdx(i); setZoom(1); }}
              className={`shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors bg-gradient-to-br ${s.tone} ${i === activeIdx ? "border-teal-700" : "border-transparent hover:border-gray-300"}`}
              title={s.label}
              aria-label={`View ${s.label}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- final diagnosis structured editor ---------- */

function FinalDiagnosisSection({ c, onFieldChange, disabled }: { c: PathologyCase; onFieldChange: (field: keyof PathologyCase, value: string) => void; disabled: boolean }) {
  const needsStaging = c.isCancer && !c.tnmStage;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <SectionHeading icon={FileText} iconTone="bg-teal-50 text-teal-700" title="Final Diagnosis" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <FieldLabel required>Primary Diagnosis</FieldLabel>
          <textarea value={c.primaryDiagnosis} onChange={(e) => onFieldChange("primaryDiagnosis", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50 disabled:text-gray-500`} />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Secondary Diagnosis</FieldLabel>
          <input type="text" value={c.secondaryDiagnosis} onChange={(e) => onFieldChange("secondaryDiagnosis", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <FieldLabel>ICD-O Coding</FieldLabel>
            <input type="text" value={c.icdOCode} onChange={(e) => onFieldChange("icdOCode", e.target.value)} disabled={disabled} placeholder="e.g. 8500/3" className={`${inputClass} font-mono disabled:bg-gray-50 disabled:text-gray-500`} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>SNOMED Coding</FieldLabel>
            <input type="text" value={c.snomedCode} onChange={(e) => onFieldChange("snomedCode", e.target.value)} disabled={disabled} placeholder="e.g. M-85003" className={`${inputClass} font-mono disabled:bg-gray-50 disabled:text-gray-500`} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Tumor Grade</FieldLabel>
            <input type="text" value={c.tumorGrade} onChange={(e) => onFieldChange("tumorGrade", e.target.value)} disabled={disabled} placeholder="e.g. Grade 2" className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel required={c.isCancer}>Tumor Stage (TNM)</FieldLabel>
            <input
              type="text"
              value={c.tnmStage}
              onChange={(e) => onFieldChange("tnmStage", e.target.value)}
              disabled={disabled}
              placeholder="e.g. pT2N1M0"
              className={`${inputClass} font-mono disabled:bg-gray-50 disabled:text-gray-500 ${needsStaging ? "border-amber-300 bg-amber-50/40" : ""}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Margins</FieldLabel>
            <input type="text" value={c.margins} onChange={(e) => onFieldChange("margins", e.target.value)} disabled={disabled} className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-500`} />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Lymphovascular Invasion</FieldLabel>
            <div className="relative">
              <select value={c.lvi} onChange={(e) => onFieldChange("lvi", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
                {["Present", "Absent", "Not Applicable"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Perineural Invasion</FieldLabel>
            <div className="relative">
              <select value={c.pni} onChange={(e) => onFieldChange("pni", e.target.value)} disabled={disabled} className={`${inputClass} pr-8 appearance-none bg-white disabled:bg-gray-50`}>
                {["Present", "Absent", "Not Applicable"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={16} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Recommendations</FieldLabel>
          <textarea value={c.recommendations} onChange={(e) => onFieldChange("recommendations", e.target.value)} disabled={disabled} rows={2} className={`${inputClass} resize-none disabled:bg-gray-50 disabled:text-gray-500`} />
        </div>
        {needsStaging && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
            <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
            <span>This is a cancer case — TNM staging must be completed before the report can be signed.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- right panel ---------- */

function PatientSummaryCard({ c }: { c: PathologyCase }) {
  return (
    <Card>
      <SectionHeading icon={Users} iconTone="bg-blue-50 text-blue-600" title="Patient Summary" />
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={initialsOf(c.patientName)} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate">{c.patientName}</span>
          <span className="text-xs text-gray-400 truncate">{c.mrn}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        <InfoRow label="Age / Gender" value={`${c.age} · ${c.gender}`} />
        <InfoRow label="Blood Group" value={c.bloodGroup} />
        <InfoRow label="Insurance" value={c.insurance} valueClass="text-emerald-600" />
        <InfoRow label="Clinical History" value={c.clinicalHistory} />
      </div>
    </Card>
  );
}

function CaseTimelineCard({ stage }: { stage: CaseStage }) {
  const currentIdx = CASE_TIMELINE_STAGES.indexOf(stage);
  return (
    <Card>
      <SectionHeading icon={History} iconTone="bg-teal-50 text-teal-700" title="Case Timeline" />
      <div className="flex flex-col">
        {CASE_TIMELINE_STAGES.map((s, i) => {
          const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
          return (
            <div key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${state === "active" ? "bg-teal-600 ring-4 ring-teal-600/15" : state === "done" ? "bg-emerald-500" : "bg-gray-200"}`} />
                {i < CASE_TIMELINE_STAGES.length - 1 && <span className="w-px flex-1 bg-gray-200 mt-1" />}
              </div>
              <div className="flex flex-col pb-3.5 min-w-0">
                <span className={`text-sm ${state === "active" ? "font-bold text-slate-800" : state === "done" ? "text-slate-600 font-medium" : "text-gray-400"}`}>{s}</span>
                {state === "active" && <span className="text-[11px] text-teal-600 font-semibold">Current stage</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ClinicalDecisionSupportCard({ c }: { c: PathologyCase }) {
  return (
    <Card>
      <SectionHeading icon={FlaskConical} iconTone="bg-violet-50 text-violet-600" title="Clinical Decision Support" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Previous Pathology Cases</span>
          {c.priorCases.length === 0 ? (
            <span className="text-[13px] text-gray-400">No prior pathology cases on file.</span>
          ) : (
            <div className="flex flex-col gap-2">
              {c.priorCases.map((p) => (
                <div key={p.caseNumber} className="flex items-center justify-between gap-2 bg-gray-50 rounded-md px-3 py-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-700 truncate">{p.diagnosis}</span>
                    <span className="text-[10.5px] text-gray-400">{p.caseNumber} · {p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Cancer History</span>
          <span className="text-[13px] text-slate-700">{c.priorCases.some((p) => p.diagnosis.toLowerCase().includes("carcinoma") || p.diagnosis.toLowerCase().includes("malig")) ? "Prior malignancy on file — correlate with current findings." : "No documented cancer history."}</span>
        </div>
        {c.clinicalAlerts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-gray-400">Clinical Alerts</span>
            <div className="flex flex-col gap-1.5">
              {c.clinicalAlerts.map((a) => (
                <div key={a} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
                  <AlertTriangle size={12} strokeWidth={2.25} className="shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const SLIDE_TYPE_TONE: Record<SlideType, string> = {
  Gross: "bg-amber-50 text-amber-700",
  Microscopic: "bg-violet-50 text-violet-700",
  "Frozen Section": "bg-blue-50 text-blue-700",
  "Special Stain": "bg-teal-50 text-teal-700",
};

function ImageGalleryCard({ slides }: { slides: SlideImage[] }) {
  const grouped: Record<SlideType, SlideImage[]> = { Gross: [], Microscopic: [], "Frozen Section": [], "Special Stain": [] };
  slides.forEach((s) => grouped[s.type].push(s));
  return (
    <Card>
      <SectionHeading icon={Layers} iconTone="bg-amber-50 text-amber-700" title="Image Gallery" action={<span className="text-xs font-semibold text-gray-400">{slides.length} images</span>} />
      {slides.length === 0 ? (
        <p className="text-xs text-gray-400">No images attached yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {(Object.keys(grouped) as SlideType[]).filter((t) => grouped[t].length > 0).map((type) => (
            <div key={type} className="flex flex-col gap-1.5">
              <span className={`inline-block w-fit text-[10px] font-semibold px-2 py-0.5 rounded-full ${SLIDE_TYPE_TONE[type]}`}>{type} ({grouped[type].length})</span>
              <div className="grid grid-cols-4 gap-1.5">
                {grouped[type].map((s) => (
                  <div key={s.id} title={s.label} className={`aspect-square rounded-md bg-gradient-to-br ${s.tone}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const CHECKLIST_ITEMS = ["Patient Identity Verified", "Specimen Label Verified", "Slides Verified", "Diagnosis Reviewed", "Images Attached", "Coding Completed", "Digital Signature Pending"] as const;

function QualityChecklistCard({ checklist, onToggle }: { checklist: Record<string, boolean>; onToggle: (item: string) => void }) {
  const completedCount = CHECKLIST_ITEMS.filter((i) => checklist[i]).length;
  return (
    <Card>
      <SectionHeading
        icon={ClipboardCheck}
        iconTone={completedCount === CHECKLIST_ITEMS.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}
        title="Quality Checklist"
        action={<span className="text-xs font-semibold text-gray-400">{completedCount} / {CHECKLIST_ITEMS.length}</span>}
      />
      <div className="flex flex-col gap-1">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!checklist[item];
          return (
            <button key={item} type="button" onClick={() => onToggle(item)} className="flex items-center gap-2.5 py-1.5 text-left select-none">
              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-teal-700" : "border border-gray-300 bg-white"}`}>
                {checked && <Check size={11} strokeWidth={3} className="text-white" />}
              </span>
              <span className="text-sm text-slate-700">{item}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function QuickActionTile({ icon: Icon, label, tone, disabled, onClick }: { icon: typeof Printer; label: string; tone: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-1.5 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone}`}>
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function QuickActionsCard({ onSign, signed }: { onSign: () => void; signed: boolean }) {
  return (
    <Card>
      <SectionHeading icon={ClipboardList} iconTone="bg-blue-50 text-blue-600" title="Quick Actions" />
      <div className="grid grid-cols-3 gap-2">
        <QuickActionTile icon={FileText} label="Save Draft" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" />
        <QuickActionTile icon={Layers} label="Request Additional Slides" tone="border-violet-100 bg-violet-50 text-violet-700 hover:bg-violet-100" />
        <QuickActionTile icon={TestTube} label="Request Special Stain" tone="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100" />
        <QuickActionTile icon={FlaskConical} label="Request Immunohistochemistry" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" />
        <QuickActionTile icon={Repeat} label="Request Peer Review" tone="border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100" />
        <QuickActionTile icon={ClipboardCheck} label="Finalize Diagnosis" tone="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
        <QuickActionTile icon={Signature} label="Digitally Sign Report" tone="border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100" disabled={signed} onClick={onSign} />
        <QuickActionTile icon={Send} label="Release Report" tone="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100" disabled={!signed} />
      </div>
    </Card>
  );
}

/* ---------- header actions ---------- */

function HeaderActionButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-colors">
        <Plus size={15} strokeWidth={2.25} /> New Case
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Upload size={15} strokeWidth={2.25} /> Import Images
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <RefreshCw size={15} strokeWidth={2.25} /> Refresh
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Download size={15} strokeWidth={2.25} /> Export Report
      </button>
      <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
        <Printer size={15} strokeWidth={2.25} /> Print Case
      </button>
    </div>
  );
}

/* ---------- page ---------- */

export default function PathologyForm() {
  const [filters, setFilters] = useState<CaseFilters>(EMPTY_FILTERS);
  const [quickStatus, setQuickStatus] = useState("All");
  const [clearKey, setClearKey] = useState(0);
  const [selectedCaseId, setSelectedCaseId] = useState(PATHOLOGY_CASES[0].id);
  const [casesState, setCasesState] = useState<PathologyCase[]>(PATHOLOGY_CASES);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [signed, setSigned] = useState(false);

  const kpiCards = useMemo(() => buildKpiCards(casesState), [casesState]);

  const filteredCases = useMemo(() => {
    const rows = applyFilters(casesState, filters, quickStatus);
    return [...rows].sort((a, b) => {
      if (a.isFrozenSection !== b.isFrozenSection) return a.isFrozenSection ? -1 : 1;
      const priorityRank: Record<Priority, number> = { STAT: 0, Urgent: 1, Routine: 2 };
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
  }, [casesState, filters, quickStatus]);

  const selectedCase = casesState.find((c) => c.id === selectedCaseId) ?? casesState[0];
  const readOnly = isReadOnly(selectedCase.stage);

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setChecklist({});
    setSigned(!!casesState.find((c) => c.id === id)?.signedBy);
  };

  const handleChange = (partial: Partial<CaseFilters>) => setFilters((prev) => ({ ...prev, ...partial }));
  const handleQuickStatus = (q: string) => setQuickStatus(q);
  const handleClearAdvanced = () => {
    setFilters((prev) => ({ ...prev, ...ADVANCED_DEFAULTS }));
    setClearKey((k) => k + 1);
  };

  const toggleChecklistItem = (item: string) => setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));

  const updateCaseField = (field: keyof PathologyCase, value: string) => {
    setCasesState((prev) => prev.map((c) => (c.id !== selectedCaseId ? c : { ...c, [field]: value })));
  };

  const handleSign = () => {
    setSigned(true);
    setCasesState((prev) =>
      prev.map((c) =>
        c.id !== selectedCaseId
          ? c
          : {
              ...c,
              signedBy: CURRENT_PATHOLOGIST,
              signedAt: "Just now",
              stage: c.stage === "Peer Review" || c.stage === "Diagnosis" ? "Digitally Signed" : c.stage,
              auditTrail: [...c.auditTrail, { time: "Just now", action: "Digitally signed", user: CURRENT_PATHOLOGIST }],
            }
      )
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1900px] w-full mx-auto flex flex-col gap-6">
        <ModulePageHeader
          title="Pathology Case Review"
          breadcrumb="Diagnostics & Laboratory > Laboratory (LIS) > Pathology"
          subtitle="Review pathology specimens, analyze microscopic findings, document diagnoses, and release finalized pathology reports."
          actions={<HeaderActionButtons />}
        />

        <KpiRow cards={kpiCards} onSelect={handleQuickStatus} />

        <PathologyFilterBar
          filters={filters}
          clearKey={clearKey}
          quickStatus={quickStatus}
          onChange={handleChange}
          onQuickStatus={handleQuickStatus}
          onClearAdvanced={handleClearAdvanced}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[25fr_50fr_25fr] gap-4 items-start">
          {/* LEFT — Pathology Case Queue */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800">Pathology Case Queue</h2>
              <span className="text-xs text-gray-400">{filteredCases.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {filteredCases.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-10 text-center text-sm text-gray-400">No cases match the current filters.</div>
              ) : (
                filteredCases.map((c) => <CaseQueueCard key={c.id} c={c} selected={c.id === selectedCaseId} onSelect={() => handleSelectCase(c.id)} />)
              )}
            </div>
          </div>

          {/* CENTER — Digital Case Review Workspace */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* sticky patient / case identity strip */}
            <div className="sticky top-4 z-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center gap-4 flex-wrap">
              <Avatar initials={initialsOf(selectedCase.patientName)} />
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-900">{selectedCase.patientName}</span>
                <span className="text-xs text-gray-400">{selectedCase.mrn} · {selectedCase.age} · {selectedCase.gender} · {selectedCase.department}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {selectedCase.isCancer && <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-red-600 bg-red-50 rounded-full px-2 py-0.5">Cancer</span>}
                {selectedCase.isFrozenSection && <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">Frozen Section</span>}
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[selectedCase.priority]}`}>{selectedCase.priority}</span>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STAGE_STYLES[selectedCase.stage]}`}>{selectedCase.stage}</span>
              </div>
              <div className="w-full text-xs text-gray-500 pt-2 border-t border-gray-100">
                <b className="font-semibold text-slate-700">Clinical History:</b> {selectedCase.clinicalHistory}
              </div>
            </div>

            {/* Specimen Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <SectionHeading icon={TestTube} iconTone="bg-blue-50 text-blue-600" title="Specimen Information" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 divide-y divide-gray-100 sm:divide-y-0">
                <InfoRow label="Specimen Number" value={selectedCase.specimenNumber} />
                <InfoRow label="Accession Number" value={selectedCase.accessionNumber} />
                <InfoRow label="Specimen Type" value={selectedCase.specimenType} />
                <InfoRow label="Collection Date" value={selectedCase.collectionDate} />
                <InfoRow label="Received Date" value={selectedCase.receivedDate} />
                <InfoRow label="Fixative Used" value={selectedCase.fixative} />
                <InfoRow label="Containers" value={String(selectedCase.containerCount)} />
                <InfoRow label="Collection Site" value={selectedCase.collectionSite} />
              </div>
            </div>

            {/* Gross Examination */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <SectionHeading icon={FlaskConical} iconTone="bg-amber-50 text-amber-700" title="Gross Examination" />
              <StructuredEditor
                templates={["Size", "Weight", "Color", "Consistency", "Margins", "Lymph Nodes"]}
                value={selectedCase.grossDescription}
                onChange={(v) => updateCaseField("grossDescription", v)}
                placeholder="Describe the gross appearance of the specimen…"
                disabled={readOnly}
              />
            </div>

            {/* Microscopic Examination */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <SectionHeading icon={Microscope} iconTone="bg-violet-50 text-violet-600" title="Microscopic Examination" />
              <StructuredEditor
                templates={["Architecture", "Inflammation", "Necrosis", "Atypia", "Margins", "Mitotic Activity", "Special Stains", "Immunohistochemistry"]}
                value={selectedCase.microscopicDescription}
                onChange={(v) => updateCaseField("microscopicDescription", v)}
                placeholder="Record cellular findings, architecture, inflammation, atypia…"
                disabled={readOnly}
              />
            </div>

            {/* Digital Slide Viewer */}
            <SlideViewer slides={selectedCase.slides} />

            {/* Final Diagnosis */}
            <FinalDiagnosisSection c={selectedCase} onFieldChange={updateCaseField} disabled={readOnly} />
          </div>

          {/* RIGHT — Clinical Information & Decision Support */}
          <div className="flex flex-col gap-4 min-w-0">
            <PatientSummaryCard c={selectedCase} />
            <CaseTimelineCard stage={selectedCase.stage} />
            <ClinicalDecisionSupportCard c={selectedCase} />
            <ImageGalleryCard slides={selectedCase.slides} />
            <QualityChecklistCard checklist={checklist} onToggle={toggleChecklistItem} />
            <QuickActionsCard onSign={handleSign} signed={signed} />
          </div>
        </div>
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
              <Repeat size={15} strokeWidth={2.25} /> Request Review
            </FooterButton>
            <FooterButton tone="neutral" onClick={handleSign} disabled={signed}>
              <Stamp size={15} strokeWidth={2.25} /> Digitally Sign
            </FooterButton>
            <button type="button" disabled={!signed} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white transition-colors">
              <RotateCw size={15} strokeWidth={2.25} />
              Release Final Report
            </button>
          </>
        }
      />
    </div>
  );
}
