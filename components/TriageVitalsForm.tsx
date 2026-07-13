"use client";

import { useState } from "react";
import {
  Users,
  ShieldAlert,
  Wind,
  Activity,
  HeartPulse,
  Brain,
  Eye,
  ListChecks,
  Printer,
  UserPlus,
  ClipboardList,
  IdCard,
  History,
  ChevronDown,
  ArrowRight,
  Check,
  RotateCcw,
  Eraser,
  type LucideIcon,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Select,
  Badge,
  type BadgeTone,
  Card,
  HeaderFact,
  TimelineItem,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";

/* ============================================================================
   Triage & Vitals — FRD 11.3 (Triage & Vitals Capture).
   Single-screen nursing intake that follows OPD Registration: priority/acuity,
   ABCDE quick indicators, risk screening, and full vitals, with patient
   safety context (allergies/chronic conditions) surfaced persistently.
   ========================================================================== */

/* ---------- local-only primitives ----------
   Label/Field keep a `required` flag (red asterisk) that OpdShared's Field
   does not support, so they stay local rather than mapping onto the shared
   version. TextInput and the numeric BP Select have no shared equivalent
   (OpdShared's Select has no "numeric"/tabular-nums variant), so they also
   stay local. */
const labelClass = "text-xs font-bold text-gray-600 flex items-center gap-0.5";

function Required() {
  return <span className="text-red-500">*</span>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className={labelClass}>
      {children}
      {required && <Required />}
    </label>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  suffix,
  readOnly,
  numeric,
}: {
  value: string;
  onChange?: (v: string) => void;
  suffix?: string;
  readOnly?: boolean;
  numeric?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`${inputBase} ${suffix ? "pr-9" : ""} ${readOnly ? "bg-gray-50 text-gray-500" : ""} ${numeric ? "tabular-nums" : ""}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** Numeric option Select (tabular-nums) for the BP systolic/diastolic pickers.
 *  OpdShared's Select has no numeric variant, so this stays local. */
function NumericSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer tabular-nums`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

function IndicatorRow({
  icon: Icon,
  label,
  value,
  tone,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: BadgeTone;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Icon size={14} strokeWidth={2.25} className="text-blue-500" />
        </span>
        <span className="text-sm text-slate-700 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge tone={tone}>{value}</Badge>
        {action}
      </div>
    </div>
  );
}

/* ---------- priority (acuity) selector ---------- */

const PRIORITIES = [
  { code: "P1", label: "Resuscitation", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-300" },
  { code: "P2", label: "Emergency", bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-300" },
  { code: "P3", label: "Urgent", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-400" },
  { code: "P4", label: "Less Urgent", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-300" },
  { code: "P5", label: "Non-Urgent", bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-300" },
];

function PriorityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2.5">
      {PRIORITIES.map((p) => {
        const selected = p.code === value;
        return (
          <button
            key={p.code}
            type="button"
            onClick={() => onChange(p.code)}
            className={`relative flex-1 min-w-[86px] rounded-lg border border-transparent px-2 py-3 flex flex-col items-center gap-0.5 transition-all ${p.bg} ${
              selected ? `${p.ring} ring-2` : ""
            }`}
          >
            {selected && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            <span className={`text-sm font-bold ${p.text}`}>{p.code}</span>
            <span className={`text-[11px] font-medium ${p.text}`}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   Main component
   ========================================================================== */

const DEFAULT_VITALS = {
  temperature: "37.2",
  pulse: "88",
  respRate: "18",
  systolic: "120",
  diastolic: "80",
  spo2: "98",
  weight: "65.0",
  height: "165",
  glucose: "98",
};

function bmiCategory(bmi: number): { label: string; tone: BadgeTone } {
  if (bmi < 18.5) return { label: "Underweight", tone: "amber" };
  if (bmi < 25) return { label: "Normal", tone: "emerald" };
  if (bmi < 30) return { label: "Overweight", tone: "amber" };
  return { label: "Obese", tone: "red" };
}

export default function TriageVitalsForm() {
  const [priority, setPriority] = useState("P3");
  const [chiefComplaint, setChiefComplaint] = useState("Headache and body weakness since 2 days.");
  const [presentingProblem, setPresentingProblem] = useState("New Problem");
  const [onset, setOnset] = useState("2 Days Ago");
  const [pain, setPain] = useState(6);
  const [arrivalMode, setArrivalMode] = useState("Walk-in");
  const [accompaniedBy, setAccompaniedBy] = useState("Self");
  const [consciousLevel, setConsciousLevel] = useState("Alert");
  const [triageNotes, setTriageNotes] = useState(
    "Patient reports general body weakness, no nausea or vomiting."
  );
  const [vitals, setVitals] = useState(DEFAULT_VITALS);

  const setVital = (key: keyof typeof DEFAULT_VITALS, value: string) =>
    setVitals((prev) => ({ ...prev, [key]: value }));

  const bmiValue = (() => {
    const h = parseFloat(vitals.height) / 100;
    const w = parseFloat(vitals.weight);
    if (!h || !w) return null;
    return w / (h * h);
  })();
  const bmi = bmiCategory(bmiValue ?? 22);

  const systolicOptions = Array.from({ length: 61 }, (_, i) => String(80 + i * 2));
  const diastolicOptions = Array.from({ length: 46 }, (_, i) => String(40 + i * 2));

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1600px] w-full mx-auto flex flex-col gap-4">
        {/* Patient profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PATIENT_PHOTO}
                alt="Selamawit Abebe"
                className="w-14 h-14 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Selamawit Abebe</h1>
                <span className="text-base leading-none text-rose-400" aria-label="Female">
                  &#9792;
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
                  OPD
                </span>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <HeaderFact label="MRN" value="FSH-2025-00012345" />
                <HeaderFact label="Age / DOB" value="33 Y 2 M 5 D / Apr 12, 1992" />
                <HeaderFact label="Phone" value="0911 234567" />
                <HeaderFact label="Visit Type" value="New Visit" />
                <HeaderFact label="Visit No." value="OPD-2025-000567" />
                <HeaderFact label="Visit Date & Time" value="May 17, 2025 · 09:30 AM" />
              </div>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors shrink-0"
          >
            <Users size={15} strokeWidth={2.25} />
            View Patient 360°
          </button>
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.2fr_0.9fr] gap-4 items-start">
          {/* Column 1: Triage Assessment + Vital Signs */}
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="1. Triage Assessment" icon={ClipboardList}>
              <div className="flex flex-col gap-4">
                <Field label="Triage Level / Priority" required>
                  <PriorityPicker value={priority} onChange={setPriority} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Chief Complaint" required>
                    <TextInput value={chiefComplaint} onChange={setChiefComplaint} />
                  </Field>
                  <Field label="Presenting Problem">
                    <Select
                      value={presentingProblem}
                      onChange={setPresentingProblem}
                      options={["New Problem", "Existing Problem", "Follow-Up"]}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <Field label="Onset">
                    <Select value={onset} onChange={setOnset} options={["Today", "1 Day Ago", "2 Days Ago", "1 Week Ago", "Chronic"]} />
                  </Field>
                  <Field label="Pain Scale (0-10)">
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[11px] text-gray-400 shrink-0">0</span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={pain}
                        onChange={(e) => setPain(Number(e.target.value))}
                        className="flex-1 h-1.5 rounded-full accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-[11px] text-gray-400 shrink-0">10</span>
                      <span className="shrink-0 w-9 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm font-bold text-slate-700 tabular-nums">
                        {pain}
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mode of Arrival">
                    <Select
                      value={arrivalMode}
                      onChange={setArrivalMode}
                      options={["Walk-in", "Wheelchair", "Ambulance", "Referred"]}
                    />
                  </Field>
                  <Field label="Accompanied By">
                    <TextInput value={accompaniedBy} onChange={setAccompaniedBy} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <Field label="Conscious Level">
                    <Select
                      value={consciousLevel}
                      onChange={setConsciousLevel}
                      options={["Alert", "Verbal", "Pain", "Unresponsive"]}
                    />
                  </Field>
                  <Field label="Triage Notes">
                    <textarea
                      value={triageNotes}
                      onChange={(e) => setTriageNotes(e.target.value)}
                      rows={2}
                      className={`${inputBase} resize-none`}
                    />
                  </Field>
                </div>
              </div>
            </Card>

            <Card title="2. Vital Signs" icon={HeartPulse} iconTone="text-blue-500">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Temperature (°C)" required>
                    <TextInput value={vitals.temperature} onChange={(v) => setVital("temperature", v)} numeric />
                  </Field>
                  <Field label="Pulse (bpm)" required>
                    <TextInput value={vitals.pulse} onChange={(v) => setVital("pulse", v)} numeric />
                  </Field>
                  <Field label="Respiratory Rate (breaths/min)">
                    <TextInput value={vitals.respRate} onChange={(v) => setVital("respRate", v)} numeric />
                  </Field>

                  <Field label="Blood Pressure (mmHg)" required>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        <NumericSelect value={vitals.systolic} onChange={(v) => setVital("systolic", v)} options={systolicOptions} />
                      </div>
                      <span className="text-gray-400 text-sm shrink-0">/</span>
                      <div className="flex-1">
                        <NumericSelect value={vitals.diastolic} onChange={(v) => setVital("diastolic", v)} options={diastolicOptions} />
                      </div>
                    </div>
                  </Field>
                  <Field label="SpO2 (%)">
                    <TextInput value={vitals.spo2} onChange={(v) => setVital("spo2", v)} numeric />
                  </Field>
                  <Field label="Weight (kg)">
                    <TextInput value={vitals.weight} onChange={(v) => setVital("weight", v)} numeric />
                  </Field>

                  <Field label="Height (cm)">
                    <TextInput value={vitals.height} onChange={(v) => setVital("height", v)} numeric />
                  </Field>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label>BMI (kg/m²)</Label>
                      {bmiValue && <Badge tone={bmi.tone}>{bmi.label}</Badge>}
                    </div>
                    <TextInput value={bmiValue ? bmiValue.toFixed(1) : "—"} readOnly numeric />
                  </div>
                  <Field label="Blood Glucose (mg/dl)">
                    <TextInput value={vitals.glucose} onChange={(v) => setVital("glucose", v)} numeric />
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setChiefComplaint("");
                      setTriageNotes("");
                    }}
                    className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eraser size={14} strokeWidth={2.25} />
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setVitals(DEFAULT_VITALS)}
                    className="flex items-center gap-1.5 border border-indigo-200 text-indigo-600 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-indigo-50 transition-colors"
                  >
                    <RotateCcw size={14} strokeWidth={2.25} />
                    Reset Vitals
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Quick Clinical Indicators + Risk Screening + Actions */}
          <div className="flex flex-col gap-4 min-w-0">
            <Card title="3. Quick Clinical Indicators" icon={Users} iconTone="text-blue-500">
              <div className="flex flex-col divide-y divide-gray-50">
                <IndicatorRow icon={Wind} label="Airway" value="Clear" tone="emerald" />
                <IndicatorRow icon={Activity} label="Breathing" value="Normal" tone="emerald" />
                <IndicatorRow icon={HeartPulse} label="Circulation" value="Stable" tone="emerald" />
                <IndicatorRow icon={Brain} label="Disability (Neuro)" value="Alert" tone="red" />
                <IndicatorRow icon={Eye} label="Exposure" value="No Issues" tone="blue" />
              </div>
            </Card>

            <Card title="4. Risk Screening" icon={ShieldAlert} iconTone="text-blue-500">
              <div className="flex flex-col divide-y divide-gray-50">
                <IndicatorRow
                  icon={ListChecks}
                  label="Allergies"
                  value="Yes"
                  tone="red"
                  action={<button className="text-xs font-semibold text-teal-700 hover:underline">View</button>}
                />
                <IndicatorRow
                  icon={ListChecks}
                  label="Chronic Illness"
                  value="Yes"
                  tone="amber"
                  action={<button className="text-xs font-semibold text-teal-700 hover:underline">View</button>}
                />
                <IndicatorRow icon={ListChecks} label="Current Medications" value="No" tone="slate" />
                <IndicatorRow icon={ListChecks} label="Pregnancy" value="N/A" tone="slate" />
                <IndicatorRow icon={ListChecks} label="Fall Risk" value="Moderate" tone="amber" />
                <IndicatorRow icon={ListChecks} label="Infectious Disease Risk" value="Low" tone="emerald" />
              </div>
            </Card>

            <Card title="5. Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="col-span-2 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  <Printer size={15} strokeWidth={2.25} />
                  Print Triage Slip
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <ArrowRight size={15} strokeWidth={2.25} />
                  Send to Doctor
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <UserPlus size={15} strokeWidth={2.25} />
                  Add to Queue
                </button>
              </div>
            </Card>
          </div>

          {/* Column 3: Alerts + Patient Summary + Triage History */}
          <div className="flex flex-col gap-4">
            <Card title="Alerts" icon={ShieldAlert} iconTone="text-red-500" action={
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
            }>
              <div className="flex flex-col gap-2.5">
                <div className="bg-red-50 rounded-lg p-3 flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-red-600">Allergy Alert</span>
                  <span className="text-xs text-red-500">Penicillin</span>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-amber-600">Hypertension</span>
                  <span className="text-xs text-amber-600">Known chronic condition</span>
                </div>
              </div>
            </Card>

            <Card title="Patient Summary" icon={IdCard} iconTone="text-slate-500">
              <div className="flex flex-col gap-2.5">
                {[
                  ["Blood Group", "O+", ""],
                  ["Insurance", "Woreda 03 CBHI (Valid)", "text-emerald-600 font-semibold"],
                  ["Last Visit", "Apr 10, 2025", ""],
                  ["Last BP", "130/85 mmHg", ""],
                  ["Last Weight", "64.0 kg", ""],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-sm text-slate-800 tabular-nums ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Triage History (Today)" icon={History} iconTone="text-slate-500">
              <div className="flex flex-col -mt-1">
                <TimelineItem time="09:28 AM" title="Registration Completed" detail="by Meron G." state="done" />
                <TimelineItem time="09:30 AM" title="Triage Completed" detail="by Nurse Hana" state="active" />
                <TimelineItem time="—" title="Consultation" detail="Pending" state="pending" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={<FooterButton tone="info">Save Draft</FooterButton>}
        right={
          <FooterPrimaryButton>
            Next: Consultation
            <ArrowRight size={15} strokeWidth={2.25} />
          </FooterPrimaryButton>
        }
      />
    </div>
  );
}
