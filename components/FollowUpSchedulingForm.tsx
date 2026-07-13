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

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ============================================================================
   Follow-Up Scheduling — FRD 11.4 continuity (Follow-Up Appointment) + care-
   plan/reminder scaffolding. Reached at the close of a consultation, after
   Prescription and Investigation Orders.
   ========================================================================== */

/* ---------- calendar ---------- */

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

/* ---------- domain data ---------- */

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

export default function FollowUpSchedulingForm() {
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("2025-06-16");
  const [preferredTime, setPreferredTime] = useState("09:00 AM");
  const [department, setDepartment] = useState("General Medicine");
  const [doctor, setDoctor] = useState("Dr. Eyob Tesfaye");
  const [visitType, setVisitType] = useState("Chronic Care");
  const [reason, setReason] = useState("30-day diabetes and hypertension review — assess glycemic control and blood pressure trend, adjust medication as needed.");

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
        {/* Breadcrumb + title + right actions */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Patient &amp; Clinical</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <Link href="/modules/opd-management/consultation" className="hover:text-teal-700 hover:underline">
                Consultation
              </Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Follow-Up Scheduling</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Follow-Up Scheduling</h1>
              <p className="text-sm text-gray-400 mt-0.5">Schedule the patient&rsquo;s next visit and create a structured follow-up care plan.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5">Unsaved changes</span>
              <span>&middot; Last saved 2 min ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/modules/opd-management/consultation"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Consultation
            </Link>
            <button type="button" className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        {/* Patient header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PATIENT_PHOTO} alt="Selamawit Abebe" className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">Selamawit Abebe</h2>
              <span className="text-base leading-none text-rose-400" aria-label="Female">
                &#9792;
              </span>
              <Chip tone="teal">OPD</Chip>
              <Chip tone="slate">Follow-up</Chip>
              <Chip tone="blue">Diabetes</Chip>
              <Chip tone="amber">Hypertension</Chip>
              <Chip tone="emerald">CBHI Active</Chip>
              <Chip tone="emerald">Stable</Chip>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-6 gap-y-3 mt-3.5">
              <HeaderFact label="MRN" value="FSH-2025-00012345" />
              <HeaderFact label="Age / Gender" value="33 Y · Female" />
              <HeaderFact label="Phone" value="0911 234 567" />
              <HeaderFact label="Visit No." value="OPD-2025-000567" />
              <HeaderFact label="Visit Type" value="Follow-up Visit" />
              <HeaderFact label="Department" value="General Medicine" />
              <HeaderFact label="Primary Doctor" value="Dr. Eyob Tesfaye" />
              <HeaderFact label="Blood Group" value="O+" />
              <HeaderFact label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600" />
              <HeaderFact label="Primary Diagnosis" value="Type 2 Diabetes Mellitus" />
              <HeaderFact label="Secondary Diagnosis" value="Essential Hypertension" />
              <HeaderFact label="Status" value="Stable" valueClass="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* 3-column layout: left content / center calendar / right sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px_300px] gap-4 items-start">
          {/* ================= LEFT: main content ================= */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Section 1: Follow-Up Appointment */}
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

                  <div className="flex items-start gap-2.5 bg-amber-50 text-amber-700 rounded-lg p-3">
                    <AlertTriangle size={15} strokeWidth={2.25} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      Dr. Eyob Tesfaye already has 3 follow-ups booked on {followUpDateLabel}. No conflict for the selected {preferredTime} slot — go ahead and confirm.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 py-2">Follow-up is marked as not required for this visit.</p>
              )}
            </Card>

            {/* Section 2: Care Plan */}
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
                  <CheckboxRow label="Home Care Required" checked={homeCare} onToggle={() => setHomeCare((v) => !v)} />
                  <CheckboxRow label="Patient Education" checked={patientEducation} onToggle={() => setPatientEducation((v) => !v)} />
                </div>
              </div>

              <Field label="Next Evaluation Objectives">
                <textarea value={nextEvalObjectives} onChange={(e) => setNextEvalObjectives(e.target.value)} rows={3} className={`${inputBase} resize-none`} />
              </Field>
            </Card>

            {/* Section 3: Pre-Follow-Up Requirements */}
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
              <Field label="Other Preparation Notes">
                <input
                  value={otherPrepNotes}
                  onChange={(e) => setOtherPrepNotes(e.target.value)}
                  placeholder="Any other instructions for the patient before this visit…"
                  className={inputBase}
                />
              </Field>
            </Card>

            {/* Section 4: Reminder Settings */}
            <Card title="Reminder Settings" icon={MessageSquare} iconTone="text-blue-500">
              <Field label="Reminder Channel">
                <div className="flex flex-wrap gap-2">
                  {REMINDER_CHANNELS.map((c) => {
                    const active = channels.includes(c.key);
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => toggleChannel(c.key)}
                        className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${
                          active ? "bg-emerald-600 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={12} strokeWidth={2.5} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Reminder Timing">
                <div className="flex flex-wrap gap-2">
                  {REMINDER_TIMINGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTiming(t)}
                      className={`text-xs font-bold rounded-full px-3 py-1.5 transition-colors ${
                        t === timing ? "bg-emerald-600 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Automatic Missed Appointment Reminder</span>
                <ToggleSwitch checked={autoMissedReminder} onChange={setAutoMissedReminder} />
              </div>

              <div className="flex items-start gap-2.5 bg-blue-50 text-blue-700 rounded-lg p-3">
                <Info size={15} strokeWidth={2.25} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  Preview: &ldquo;Selamawit, your follow-up with Dr. Eyob Tesfaye is on {followUpDateLabel} at {preferredTime}.&rdquo; will be sent via{" "}
                  {channels.map((k) => REMINDER_CHANNELS.find((c) => c.key === k)?.label).join(" + ") || "no channel selected"}, {timing.toLowerCase()}.
                </p>
              </div>
            </Card>

            {/* Section 5: Follow-Up Attachments */}
            <Card title="Follow-Up Attachments" icon={UploadCloud}>
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-7 px-4 flex flex-col items-center gap-2 text-center bg-[#FBFCFD]">
                <UploadCloud size={24} strokeWidth={1.75} className="text-gray-300" />
                <p className="text-sm font-medium text-slate-700">
                  Drag &amp; drop files here, or <span className="text-teal-700">browse</span>
                </p>
                <p className="text-[11px] text-gray-400">Supports JPG, PNG, PDF · Max 10MB per file</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Clinical Instructions", file: "Post_Visit_Instructions.pdf" },
                  { label: "Exercise Plan", file: null },
                  { label: "Diet Plan", file: "Diabetic_Diet_Plan.pdf" },
                  { label: "Referral Letter", file: null },
                  { label: "Educational Material", file: null },
                  { label: "Previous Reports", file: "Lipid_Panel_Apr2025.pdf" },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <FileText size={13} strokeWidth={2} className="text-gray-400" />
                      {row.label}
                    </div>
                    {row.file ? (
                      <span className="text-[10.5px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 self-start truncate max-w-full">
                        {row.file}
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-gray-400">None attached</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ================= CENTER: Appointment Calendar Preview ================= */}
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

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Selected</span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200" /> Booked</span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200" /> Closure</span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2.5 h-2.5 rounded border border-gray-300" /> Available</span>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-600">Dr. Eyob Tesfaye &mdash; {followUpDateLabel}</span>
                <div className="flex flex-wrap gap-1.5">
                  {SLOTS.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={s.status === "booked"}
                      onClick={() => setPreferredTime(s.time)}
                      className={`text-[11.5px] font-bold rounded-lg px-2.5 py-1.5 transition-colors ${
                        s.time === preferredTime
                          ? "bg-emerald-600 text-white"
                          : s.status === "booked"
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ================= RIGHT: sidebar ================= */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <KeyValueRow label="Blood Group" value="O+" />
              <KeyValueRow label="Weight" value="68 kg" />
              <KeyValueRow label="Height" value="162 cm" />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-400">BMI</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums flex items-center gap-1.5">
                  25.9 <Badge tone="amber">Overweight</Badge>
                </span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <KeyValueRow label="Insurance" value="Woreda 07 CBHI" valueClass="text-emerald-600" />
              <KeyValueRow label="Allergies" value="Penicillin" valueClass="text-red-500" />
              <KeyValueRow label="Current Medications" value="Amlodipine 5mg OD" />
              <KeyValueRow label="Emergency Contact" value="Abebe T. · 0911987654" />
            </Card>

            <Card title="Patient Timeline" icon={History} iconTone="text-emerald-600">
              <div className="-mt-1">
                <TimelineItem title="Registration" detail="09:28 AM · Meron G." state="done" />
                <TimelineItem title="Vitals" detail="09:30 AM · Nurse Hana" state="done" />
                <TimelineItem title="Consultation" detail="09:31 AM · Dr. Eyob Tesfaye" state="done" />
                <TimelineItem title="Clinical Notes" detail="Completed" state="done" />
                <TimelineItem title="Prescription" detail="Completed" state="done" />
                <TimelineItem title="Investigation Orders" detail="Completed" state="done" />
                <TimelineItem title="Follow-Up Scheduling" detail="09:52 AM" state="active" badge="In Progress" />
              </div>
            </Card>

            <Card title="Previous Follow-Ups" icon={RefreshCw} iconTone="text-gray-400">
              {[
                { date: "Apr 15, 2025", dept: "General Medicine", doctor: "Dr. Eyob Tesfaye", outcome: "Completed" as const },
                { date: "Feb 10, 2025", dept: "General Medicine", doctor: "Dr. Eyob Tesfaye", outcome: "Completed" as const },
                { date: "Dec 20, 2024", dept: "General Medicine", doctor: "Dr. Dawit Bekele", outcome: "No-show" as const },
              ].map((v) => (
                <button key={v.date} type="button" className="w-full flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0 text-left">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-bold text-slate-800">{v.date}</div>
                    <div className="text-[11px] text-gray-400 truncate">{v.dept} &middot; {v.doctor}</div>
                  </div>
                  <Badge tone={v.outcome === "Completed" ? "emerald" : "red"}>{v.outcome}</Badge>
                </button>
              ))}
            </Card>

            <Card title="Upcoming Appointments" icon={Calendar} iconTone="text-blue-500">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-bold text-slate-800">Jun 02, 2025</span>
                  <Badge tone="blue">Confirmed</Badge>
                </div>
                <span className="text-[11px] text-gray-400">Dr. Kalkidan Mulugeta &middot; Radiology &middot; 11:00 AM</span>
                <button type="button" className="self-start mt-1.5 text-[11.5px] font-bold text-teal-700 hover:underline">
                  Quick Reschedule
                </button>
              </div>
            </Card>

            <Card title="AI Follow-Up Recommendation" icon={Sparkles} iconTone="text-violet-500" action={<Badge tone="slate">AI</Badge>}>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-slate-800">Type 2 Diabetes</span>
                <ul className="text-[11.5px] text-gray-500 list-disc pl-4 leading-relaxed">
                  <li>Recommended review in 30 days</li>
                  <li>HbA1c after 90 days</li>
                  <li>Blood glucose log review</li>
                  <li>Medication review &amp; lifestyle assessment</li>
                </ul>
                <button
                  type="button"
                  onClick={applyDiabetesRecommendation}
                  className="self-start mt-1.5 text-[11.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Quick Apply
                </button>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-slate-800">Hypertension</span>
                <ul className="text-[11.5px] text-gray-500 list-disc pl-4 leading-relaxed">
                  <li>Review in 2 weeks</li>
                  <li>Blood pressure monitoring</li>
                  <li>Kidney function test &amp; electrolytes</li>
                </ul>
                <button
                  type="button"
                  onClick={applyHypertensionRecommendation}
                  className="self-start mt-1.5 text-[11.5px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Quick Apply
                </button>
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <QuickActionButton icon={Calendar} label="Schedule Appointment" tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }} />
              <QuickActionButton icon={Printer} label="Print Follow-up Plan" tone={{ bg: "bg-gray-100", text: "text-gray-600", hover: "hover:bg-gray-200" }} />
              <QuickActionButton icon={GraduationCap} label="Generate Patient Instruction Sheet" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
              <QuickActionButton icon={Send} label="Send Reminder" tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }} />
              <QuickActionButton icon={History} label="View Appointment History" tone={{ bg: "bg-gray-100", text: "text-gray-600", hover: "hover:bg-gray-200" }} />
              <QuickActionButton icon={Save} label="Save Template" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
              <QuickActionButton icon={Ban} label="Cancel Follow-up" tone={{ bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" }} />
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
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
              Preview Follow-up Plan
            </FooterButton>
            <FooterPrimaryButton>
              Confirm Follow-Up
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}
