"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  FlaskConical,
  ScanLine,
  FileText,
  Pill as PillIcon,
  HeartPulse,
  Droplet,
  Scale,
  GraduationCap,
  MessageSquare,
  PhoneCall,
  Smartphone,
  Video,
  UploadCloud,
  Printer,
  Save,
  Send,
  History,
  Star,
  Ban,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CalendarClock,
  Search,
  CheckCircle2,
  Brain,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  labelClass,
  Field,
  Select,
  ToggleSwitch,
  CheckboxRow,
  Chip,
  Badge,
  Card,
  HeaderFact,
  KeyValueRow,
  TimelineItem,
  QuickActionButton,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";
import DatePicker from "@/components/DatePicker";

/* ============================================================================
   Follow-Up Scheduling — Care-plan scheduling and appointment desk.
   FRD 11.4 continuity (Follow-Up Appointment) + care-plan reminder scaffolding.
   
   Enhanced with Stage 0: Outpatient Appointment Booking Queue.
   ========================================================================== */

type FollowUpPatient = {
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
  checkInTime: string;
  department: string;
  doctor: string;
  visitType: "New Visit" | "Follow-Up" | "Referral";
  priorityLevel: "Routine" | "Priority" | "Urgent" | "Emergency";
  diagnosis: string;
  secondaryDiagnosis: string;
  allergies: string;
  medications: string;
  weight: string;
  height: string;
};

const MOCK_SCHEDULING_QUEUE: FollowUpPatient[] = [
  {
    id: "1",
    name: "Selamawit Abebe",
    nationalId: "1001-2345-6789",
    bloodGroup: "O+",
    photo: PATIENT_PHOTO,
    mrn: "FSH-2025-00012345",
    gender: "Female",
    age: 33,
    dob: "12/04/1992",
    dobISO: "1992-04-12",
    phone: "0911 234 567",
    checkInTime: "09:30 AM",
    department: "General Medicine",
    doctor: "Dr. Eyob Tesfaye",
    visitType: "Follow-Up",
    priorityLevel: "Urgent",
    diagnosis: "Type 2 Diabetes Mellitus",
    secondaryDiagnosis: "Essential Hypertension",
    allergies: "Penicillin",
    medications: "Amlodipine 5mg OD",
    weight: "68",
    height: "162"
  },
  {
    id: "2",
    name: "Abebe Kebede",
    nationalId: "1001-9876-5432",
    bloodGroup: "A+",
    initials: "AK",
    mrn: "MRN-2026-000122",
    gender: "Male",
    age: 45,
    dob: "12/03/1980",
    dobISO: "1980-03-12",
    phone: "0911 876 543",
    checkInTime: "09:12 AM",
    department: "General Medicine",
    doctor: "Dr. Dawit Bekele",
    visitType: "New Visit",
    priorityLevel: "Routine",
    diagnosis: "Type 2 Diabetes Mellitus",
    secondaryDiagnosis: "None",
    allergies: "No known allergies",
    medications: "Metformin 500mg BD",
    weight: "74",
    height: "172"
  }
];

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = first.getDay();
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const BOOKED_DAYS = [5, 9, 12, 19, 23, 26];
const CLOSURE_DAYS = [22];
const MONTH_LABEL = new Date(2025, 5, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const SLOTS = [
  { time: "09:00 AM", status: "available" },
  { time: "09:30 AM", status: "available" },
  { time: "10:00 AM", status: "booked" },
  { time: "10:30 AM", status: "available" },
  { time: "11:00 AM", status: "booked" },
  { time: "02:00 PM", status: "available" },
];

const VISIT_TYPES = ["Routine", "Urgent", "Review Results", "Medication Review", "Chronic Care", "Post Procedure", "Post Surgery", "Telemedicine"];

const PREP_ITEMS: { key: string; label: string; icon: LucideIcon; priority: "Required" | "Recommended" | "Optional" }[] = [
  { key: "labs", label: "Laboratory tests before visit", icon: FlaskConical, priority: "Required" },
  { key: "radiology", label: "Radiology before visit", icon: ScanLine, priority: "Optional" },
  { key: "reports", label: "Bring previous reports", icon: FileText, priority: "Recommended" },
  { key: "medList", label: "Bring medication list", icon: PillIcon, priority: "Required" },
  { key: "fasting", label: "Fasting required (8 hours)", icon: Clock, priority: "Required" },
  { key: "bpLog", label: "Blood pressure log", icon: HeartPulse, priority: "Recommended" },
  { key: "sugarLog", label: "Blood sugar log", icon: Droplet, priority: "Recommended" },
  { key: "weight", label: "Weight tracking", icon: Scale, priority: "Optional" },
];

const REMINDER_CHANNELS = [
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "call", label: "Phone Call", icon: PhoneCall },
  { key: "email", label: "Email", icon: FileText },
  { key: "app", label: "Mobile App", icon: Smartphone },
  { key: "whatsapp", label: "WhatsApp", icon: Video },
];

const REMINDER_TIMINGS = ["1 Day Before", "3 Days Before", "1 Week Before", "Custom"];

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PatientAvatar({ photo, initials, size = "md" }: { photo?: string; initials?: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-xs";
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
   Stage 0 — Appointment Booking Queue selection desk
   ========================================================================== */

function SchedulingQueueStage({
  patients,
  onSelect,
  schedulesCount,
}: {
  patients: FollowUpPatient[];
  onSelect: (p: FollowUpPatient) => void;
  schedulesCount: number;
}) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.mrn.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query);
      const matchesPriority =
        priorityFilter === "All Priorities" || p.priorityLevel === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [patients, query, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const waiting = patients.length;
    return {
      waiting,
      remindersSent: 42,
      scheduledToday: schedulesCount,
    };
  }, [patients, schedulesCount]);

  const priorityStyles: Record<FollowUpPatient["priorityLevel"], string> = {
    Routine: "bg-slate-50 text-slate-700 border-slate-200",
    Priority: "bg-blue-50 text-blue-700 border-blue-200",
    Urgent: "bg-amber-50 text-amber-700 border-amber-200",
    Emergency: "bg-red-50 text-red-700 border-red-200 font-bold",
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">
        
        <p className="text-xs text-gray-400">
          Home <span className="mx-1 text-gray-300">&gt;</span> OPD Management{" "}
          <span className="mx-1 text-gray-300">&gt;</span>
          <span className="text-slate-800 font-semibold">Follow-Up Scheduling</span>
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 font-display">Outpatient Scheduling Desk</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Review discharge criteria and book follow-up outpatient visits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Pending Scheduling", value: stats.waiting, color: "text-blue-600 bg-blue-50/70 border-blue-100", subtitle: "Awaiting booking" },
            { label: "Reminders Dispatched", value: stats.remindersSent, color: "text-indigo-600 bg-indigo-50/70 border-indigo-100", subtitle: "Reminders sent today" },
            { label: "Bookings Completed", value: stats.scheduledToday, color: "text-emerald-600 bg-emerald-50/70 border-emerald-100", subtitle: "Scheduled today" },
          ].map(({ label, value, color, subtitle }) => (
            <div key={label} className={`rounded-2xl p-4 ${color.split(" ")[1]} border ${color.split(" ")[2]} flex flex-col gap-1 shadow-sm`}>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
              <span className={`text-2xl font-bold font-display tabular-nums ${color.split(" ")[0]}`}>{value}</span>
              <span className="text-xs text-gray-400 font-medium">{subtitle}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Search size={16} strokeWidth={2.25} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-slate-800">Search Scheduling Queue</h2>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 font-medium">
                  {filtered.length} patient{filtered.length !== 1 ? "s" : ""} waiting
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, MRN, phone..."
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative sm:w-48 shrink-0">
                  <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                    className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer`}
                  >
                    {["All Priorities", "Routine", "Priority", "Urgent", "Emergency"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Patient", "MRN", "Diagnosis", "Attending Doctor / Dept", "Priority", ""].map((h) => (
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
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <Search size={22} strokeWidth={1.8} className="text-gray-400" />
                            </span>
                            <p className="text-sm text-gray-500 font-medium">No patients found in your scheduling queue.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paged.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-teal-50/40 transition-colors group"
                        >
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <PatientAvatar photo={p.photo} initials={p.initials} size="sm" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-800 whitespace-nowrap group-hover:text-teal-700 transition-colors font-display">
                                  {p.name}
                                </span>
                                <span className="text-[11px] text-gray-400 whitespace-nowrap">{p.gender} · {p.age} Y · {p.dob}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 tabular-nums whitespace-nowrap">
                              {p.mrn}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 font-semibold text-slate-705 max-w-[200px] truncate">
                            {p.diagnosis}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-860">{p.doctor}</span>
                              <span className="text-[11px] text-gray-460">{p.department}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`inline-flex items-center text-xs font-bold border rounded-full px-2.5 py-0.5 ${priorityStyles[p.priorityLevel] || ""}`}>
                              {p.priorityLevel}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-display">
                            <button
                              type="button"
                              onClick={() => onSelect(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#148375] hover:bg-[#116a5f] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              <Calendar size={13} strokeWidth={2.5} className="shrink-0" />
                              Book Appointment
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Brain size={16} strokeWidth={2.25} className="text-teal-700" />
                <h2 className="text-sm font-bold text-slate-800 font-display">Scheduling Info</h2>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Confirm doctor availability calendars before setting appointments. Patients should get printouts of pre-visit prep requirements.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================================
   Stage 1 — Follow-Up Scheduling Form
   ========================================================================== */

function SchedulingIntake({
  patient,
  onClear,
  onSubmit,
}: {
  patient: FollowUpPatient;
  onClear: () => void;
  onSubmit: (date: string, time: string) => void;
}) {
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("2025-06-16");
  const [preferredTime, setPreferredTime] = useState("09:00 AM");
  const [department, setDepartment] = useState(patient.department);
  const [doctor, setDoctor] = useState(patient.doctor);
  const [visitType, setVisitType] = useState("Chronic Care");
  const [reason, setReason] = useState(`Chronic care review - ${patient.diagnosis}. Reassess clinical goals and adjust medications.`);

  const [treatmentGoals, setTreatmentGoals] = useState("Achieve HbA1c below 7.5%; blood pressure consistently under 140/90 mmHg.");
  const [lifestyleRecs, setLifestyleRecs] = useState("Reduce salt intake, 30 minutes of walking 5 days/week, continue diabetic diet.");
  const [continueMeds, setContinueMeds] = useState(true);
  const [medAdjustment, setMedAdjustment] = useState(false);
  const [physio, setPhysio] = useState(false);
  const [dietician, setDietician] = useState(true);
  const [specialistReferral, setSpecialistReferral] = useState(false);
  const [nursingFollowUp, setNursingFollowUp] = useState(false);
  const [homeCare, setHomeCare] = useState(false);
  const [patientEducation, setPatientEducation] = useState(true);
  const [nextEvalObjectives, setNextEvalObjectives] = useState("Review HbA1c and lipid results; reassess cardiovascular risk; confirm medication adherence.");

  const [prepChecked, setPrepChecked] = useState<Record<string, boolean>>({
    labs: true, radiology: false, reports: true, medList: true, fasting: true, bpLog: true, sugarLog: true, weight: false,
  });
  const [otherPrepNotes, setOtherPrepNotes] = useState("");

  const [channels, setChannels] = useState<string[]>(["sms", "app"]);
  const [timing, setTiming] = useState("3 Days Before");
  const [autoMissedReminder, setAutoMissedReminder] = useState(true);

  const togglePrep = (key: string) => setPrepChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleChannel = (key: string) => setChannels((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  const weeks = useMemo(() => buildMonthGrid(2025, 5), []);
  const selectedDay = Number(followUpDate.split("-")[2]);

  const applyDiabetesRecommendation = () => {
    setFollowUpDate("2025-06-16");
    setVisitType("Chronic Care");
    setReason("30-day diabetes review — HbA1c due at 90 days, blood glucose log review, medication review, lifestyle assessment.");
  };
  const applyHypertensionRecommendation = () => {
    setFollowUpDate("2025-05-31");
    setVisitType("Chronic Care");
    setReason("2-week hypertension review — blood pressure monitoring, kidney function test, electrolytes.");
  };

  const followUpDateLabel = new Date(followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1920px] w-full mx-auto flex flex-col gap-4">
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Patient &amp; Clinical</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Follow-Up Scheduling</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 font-display">Follow-Up Scheduling</h1>
              <p className="text-sm text-gray-400 mt-0.5">Schedule the patient&rsquo;s next visit and create a structured follow-up care plan.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Queue
            </button>
            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={patient.photo || PATIENT_PHOTO} alt={patient.name} className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 font-display">{patient.name}</h2>
              <span className="text-base leading-none text-rose-400" aria-label={patient.gender}>
                {patient.gender === "Female" ? "♀" : "♂"}
              </span>
              <Chip tone="teal">OPD</Chip>
              <Chip tone="slate">{patient.visitType}</Chip>
              <Chip tone="emerald">CBHI Active</Chip>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-3 mt-3.5">
              <HeaderFact label="MRN" value={patient.mrn} />
              <HeaderFact label="Age / Gender" value={`${patient.age} Y · ${patient.gender}`} />
              <HeaderFact label="Phone" value={patient.phone} />
              <HeaderFact label="Visit Type" value={patient.visitType} />
              <HeaderFact label="Department" value={patient.department} />
              <HeaderFact label="Primary Doctor" value={patient.doctor} />
              <HeaderFact label="Blood Group" value={patient.bloodGroup} />
              <HeaderFact label="Primary Diagnosis" value={patient.diagnosis} />
              <HeaderFact label="Secondary Diagnosis" value={patient.secondaryDiagnosis} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <Card
              title="Follow-Up Appointment"
              icon={CalendarClock}
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Follow-up Required</span>
                  <ToggleSwitch checked={followUpRequired} onChange={setFollowUpRequired} />
                </div>
              }
            >
              {followUpRequired ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Recommended Follow-up Date">
                      <DatePicker key={followUpDate} defaultValue={followUpDate ? new Date(followUpDate) : undefined} onChange={(d) => setFollowUpDate(toISO(d))} />
                    </Field>
                    <Field label="Preferred Time">
                      <Select value={preferredTime} onChange={setPreferredTime} options={SLOTS.map((s) => s.time)} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Department">
                      <Select value={department} onChange={setDepartment} options={["General Medicine", "Cardiology", "Endocrinology", "Nephrology"]} />
                    </Field>
                    <Field
                      label="Doctor"
                      hint="Recommended: same doctor, for continuity of care"
                    >
                      <Select value={doctor} onChange={setDoctor} options={["Dr. Eyob Tesfaye", "Dr. Dawit Bekele", "Dr. Hanna Yohannes"]} />
                    </Field>
                  </div>

                  <Field label="Visit Type">
                    <div className="flex flex-wrap gap-2">
                      {VISIT_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setVisitType(t)}
                          className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${
                            t === visitType ? "bg-emerald-600 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Reason for Follow-up">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={`${inputBase} resize-none`} />
                  </Field>
                </>
              ) : (
                <p className="text-sm text-gray-400 py-2">Follow-up is marked as not required for this visit.</p>
              )}
            </Card>

            <Card title="Care Plan" icon={ClipboardList}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Treatment Goals">
                  <textarea value={treatmentGoals} onChange={(e) => setTreatmentGoals(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <Field label="Lifestyle Recommendations">
                  <textarea value={lifestyleRecs} onChange={(e) => setLifestyleRecs(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
              </div>

              <div className="flex flex-col gap-1">
                <label className={`${labelClass} mb-1`}>Medication Changes</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <CheckboxRow label="Continue Current Medication" checked={continueMeds} onToggle={() => setContinueMeds((v) => !v)} />
                  <CheckboxRow label="Medication Adjustment" checked={medAdjustment} onToggle={() => setMedAdjustment((v) => !v)} />
                  <CheckboxRow label="Physiotherapy Required" checked={physio} onToggle={() => setPhysio((v) => !v)} />
                  <CheckboxRow label="Dietician Referral" checked={dietician} onToggle={() => setDietician((v) => !v)} />
                  <CheckboxRow label="Specialist Referral" checked={specialistReferral} onToggle={() => setSpecialistReferral((v) => !v)} />
                  <CheckboxRow label="Nursing Follow-up" checked={nursingFollowUp} onToggle={() => setNursingFollowUp((v) => !v)} />
                </div>
              </div>
            </Card>

            <Card title="Pre-Follow-Up Requirements" icon={FlaskConical} iconTone="text-violet-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PREP_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const checked = prepChecked[item.key];
                  const priorityTone = item.priority === "Required" ? "red" : item.priority === "Recommended" ? "amber" : "slate";
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => togglePrep(item.key)}
                      className="flex items-center gap-3 border border-gray-200 rounded-xl px-3.5 py-3 bg-[#FBFCFD] text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <Icon size={15} strokeWidth={2.25} />
                      </span>
                      <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-slate-700">{item.label}</span>
                      <Badge tone={priorityTone as "red" | "amber" | "slate"}>{item.priority}</Badge>
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-emerald-600" : "border border-gray-300 bg-white"}`}>
                        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Appointment Calendar" icon={Calendar} iconTone="text-teal-600">
              <div className="flex items-center justify-between">
                <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  <ChevronLeft size={15} strokeWidth={2.25} />
                </button>
                <span className="text-sm font-bold text-slate-800">{MONTH_LABEL}</span>
                <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                  <ChevronRight size={15} strokeWidth={2.25} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="text-[10.5px] font-bold text-gray-400 pb-1">
                    {d}
                  </span>
                ))}
                {weeks.flat().map((day, i) => {
                  if (day === null) return <span key={i} />;
                  const isSelected = day === selectedDay;
                  const isBooked = BOOKED_DAYS.includes(day);
                  const isClosure = CLOSURE_DAYS.includes(day);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isClosure}
                      onClick={() => setFollowUpDate(`2025-06-${String(day).padStart(2, "0")}`)}
                      className={`aspect-square rounded-lg text-[12.5px] font-semibold flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : isClosure
                          ? "bg-gray-100 text-gray-300 line-through cursor-not-allowed"
                          : isBooked
                          ? "bg-gray-100 text-gray-400"
                          : "text-slate-700 hover:bg-teal-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <KeyValueRow label="Blood Group" value={patient.bloodGroup} />
              <KeyValueRow label="Allergies" value={patient.allergies} valueClass="text-red-500" />
              <KeyValueRow label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600 font-semibold" />
              <KeyValueRow label="Current Medications" value={patient.medications} />
            </Card>

            <Card title="Patient Timeline" icon={History} iconTone="text-emerald-600">
              <div className="-mt-1">
                <TimelineItem title="Registration" detail={`${patient.checkInTime}`} state="done" />
                <TimelineItem title="Vitals" detail="Nurse Hana" state="done" />
                <TimelineItem title="Consultation" detail="Completed" state="done" />
                <TimelineItem title="Follow-Up" detail="Active" state="active" badge="In Progress" />
              </div>
            </Card>

            <Card title="AI Follow-Up Recommendation" icon={Sparkles} iconTone="text-violet-500" action={<Badge tone="slate">AI</Badge>}>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-slate-800">Diabetes &amp; HTN</span>
                <button
                  type="button"
                  onClick={applyDiabetesRecommendation}
                  className="self-start mt-1.5 text-[11.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Quick Apply 30D
                </button>
                <button
                  type="button"
                  onClick={applyHypertensionRecommendation}
                  className="self-start mt-1 text-[11.5px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Quick Apply 14D
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <StickyFooter
        left={
          <>
            <FooterButton tone="neutral" onClick={onClear}>Cancel &amp; Return</FooterButton>
            <FooterButton tone="info">Save Draft</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="neutral">
              <Printer size={15} strokeWidth={2.25} />
              Preview Follow-up Plan
            </FooterButton>
            <FooterPrimaryButton onClick={() => onSubmit(followUpDate, preferredTime)}>
              Confirm Follow-Up
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}

/* ============================================================================
   Stage 2 — Scheduling Success Screen
   ========================================================================== */

function SchedulingSuccessScreen({
  patient,
  date,
  time,
  onBack,
}: {
  patient: FollowUpPatient;
  date: string;
  time: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#F7F9FA]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 font-display">Appointment Scheduled</h2>
          <p className="text-sm text-gray-500 px-4">
            A follow-up visit for <strong>{patient.name}</strong> has been successfully booked in the scheduling system.
          </p>
        </div>
        
        <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-2.5 text-left border border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Patient Name</span>
            <span className="text-slate-800 font-bold">{patient.name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">MRN Code</span>
            <span className="font-mono text-slate-800 font-bold">{patient.mrn}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2 mt-1">
            <span className="text-gray-400 font-medium">Appointment Date</span>
            <span className="text-emerald-700 font-bold">{date}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Time Slot</span>
            <span className="text-slate-850 font-bold">{time}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#148375] hover:bg-[#116a5f] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-display"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Scheduling Queue
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   Root Export
   ========================================================================== */

export default function FollowUpSchedulingForm() {
  const [selectedPatient, setSelectedPatient] = useState<FollowUpPatient | null>(null);
  const [queue, setQueue] = useState<FollowUpPatient[]>(MOCK_SCHEDULING_QUEUE);
  const [schedulesCount, setSchedulesCount] = useState(11);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedDate, setBookedDate] = useState("");
  const [bookedTime, setBookedTime] = useState("");

  const handleSelectPatient = (patient: FollowUpPatient) => {
    setSelectedPatient(patient);
    setIsSuccess(false);
  };

  const handleComplete = (date: string, time: string) => {
    if (selectedPatient) {
      setBookedDate(date);
      setBookedTime(time);
      setQueue((prev) => prev.filter((p) => p.id !== selectedPatient.id));
      setSchedulesCount((prev) => prev + 1);
      setIsSuccess(true);
    }
  };

  if (isSuccess && selectedPatient) {
    return (
      <SchedulingSuccessScreen
        patient={selectedPatient}
        date={bookedDate}
        time={bookedTime}
        onBack={() => {
          setSelectedPatient(null);
          setIsSuccess(false);
        }}
      />
    );
  }

  if (!selectedPatient) {
    return (
      <SchedulingQueueStage
        patients={queue}
        onSelect={handleSelectPatient}
        schedulesCount={schedulesCount}
      />
    );
  }

  return (
    <SchedulingIntake
      patient={selectedPatient}
      onClear={() => setSelectedPatient(null)}
      onSubmit={handleComplete}
    />
  );
}
