"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageSquareText,
  Stethoscope,
  Activity,
  ClipboardList,
  Pill,
  FileCheck2,
  Plus,
  Search,
  X,
  Check,
  Printer,
  ArrowRight,
  FlaskConical,
  ScanLine,
  StickyNote,
  UploadCloud,
  Send,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Label,
  Field,
  Select,
  MicTextarea,
  ToggleSwitch,
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
   Consultation — FRD 11.4 (Consultation Workflow). Third screen in the OPD
   visit chain: OPD Registration -> Triage & Vitals -> Consultation -> Orders.
   ========================================================================== */

function Required() {
  return <span className="text-red-500">*</span>;
}

/**
 * Local-only variant of Field/Label: adds the required-field asterisk (with
 * the tight flex gap it needs), which the shared OpdShared primitives don't
 * support. Used solely for "Primary Diagnosis" below.
 */
function RequiredField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-600 flex items-center gap-0.5">
        {label}
        <Required />
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`${inputBase} ${readOnly ? "bg-gray-50 text-gray-500" : ""}`}
    />
  );
}

function GreenCheckbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 select-none">
      <span
        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-emerald-600" : "border border-gray-300 bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className={`text-xs font-bold ${checked ? "text-emerald-600" : "text-gray-500"}`}>{children}</span>
    </button>
  );
}

function SystemPill({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
        active ? "bg-emerald-600 text-white border-emerald-600" : "border border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

const TABS = [
  { key: "chief", label: "Chief Complaint & HPI", icon: MessageSquareText },
  { key: "exam", label: "Examination", icon: Stethoscope },
  { key: "diagnosis", label: "Diagnosis", icon: Activity },
  { key: "plan", label: "Plan & Orders", icon: ClipboardList },
  { key: "prescription", label: "Prescription", icon: Pill },
  { key: "summary", label: "Summary", icon: FileCheck2 },
];

const SYSTEMS = [
  "Constitutional",
  "Head & Neck",
  "Respiratory",
  "Cardiovascular",
  "GI",
  "GU",
  "Musculoskeletal",
  "Neurological",
  "Skin",
  "Psychiatric",
];

export default function ConsultationForm() {
  const [activeTab, setActiveTab] = useState("chief");
  const [hpi, setHpi] = useState(
    "Patient reports dull aching headache, more on frontal area, associated with generalized body weakness and mild dizziness. No history of fever, cough, chest pain or shortness of breath."
  );
  const [reviewOfSystems, setReviewOfSystems] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["Constitutional"]);
  const [generalAppearance, setGeneralAppearance] = useState("Alert");
  const [consciousness, setConsciousness] = useState("Alert & Oriented");
  const [hydration, setHydration] = useState("Normal");
  const [pallor, setPallor] = useState("None");
  const [systemicExam, setSystemicExam] = useState("No abnormal findings detected.");
  const [normalExam, setNormalExam] = useState(true);
  const [secondaryDx, setSecondaryDx] = useState("");
  const [clinicalImpression, setClinicalImpression] = useState("Most likely tension type headache with fatigue.");
  const [managementPlan, setManagementPlan] = useState(
    "Advice rest, adequate hydration and paracetamol as needed. Review after 3 days if no improvement."
  );
  const [advice, setAdvice] = useState("Avoid stress and ensure adequate sleep. Return if symptoms worsen.");
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("2025-05-20");
  const [followUpType, setFollowUpType] = useState("OPD Visit");
  const [followUpWith, setFollowUpWith] = useState("Dr. Eyob Tesfaye");

  const toggleSystem = (s: string) =>
    setSelectedSystems((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      <div className="flex-1 p-6 pb-24 max-w-[1760px] w-full mx-auto flex flex-col gap-4">
        {/* Breadcrumb + title + right actions */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span>Home</span>
              <span className="text-gray-300">&gt;</span>
              <span>OPD Management</span>
              <span className="text-gray-300">&gt;</span>
              <Link href="/modules/opd-management/opd-registration" className="hover:text-teal-700 hover:underline">
                OPD Registration
              </Link>
              <span className="text-gray-300">&gt;</span>
              <Link href="/modules/opd-management/triage-vitals" className="hover:text-teal-700 hover:underline">
                Triage &amp; Vitals
              </Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Consultation</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Consultation</h1>
              <p className="text-sm text-gray-400 mt-0.5">Examine patient, record clinical findings and manage treatment plan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/modules/opd-management/triage-vitals"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to Triage &amp; Vitals
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <Users size={15} strokeWidth={2.25} />
              View Patient 360°
            </button>
          </div>
        </div>

        {/* Patient profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PATIENT_PHOTO}
              alt="Selamawit Abebe"
              className="w-12 h-12 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Selamawit Abebe</h2>
              <span className="text-base leading-none text-rose-400" aria-label="Female">
                &#9792;
              </span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2.5 py-0.5">OPD</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              <HeaderFact label="MRN" value="FSH-2025-00012345" />
              <HeaderFact label="Age / DOB" value="33 Y 2 M 5 D / Apr 12, 1992" />
              <HeaderFact label="Phone" value="0911 234567" />
              <HeaderFact label="Visit Type" value="New Visit" />
              <HeaderFact label="Visit No." value="OPD-2025-000567" />
              <HeaderFact label="Visit Time" value="May 17, 2025 · 09:30 AM" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-6 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 pb-3 pt-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active ? "text-teal-700 border-teal-600" : "text-gray-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.25} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid: left content (~78%) + right sidebar (~22%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="1. Chief Complaint" icon={MessageSquareText}>
                <Field label="Chief Complaint">
                  <TextInput value="Headache and body weakness since 2 days." readOnly />
                </Field>
                <Field label="History of Present Illness">
                  <MicTextarea value={hpi} onChange={setHpi} rows={4} />
                </Field>
                <div className="flex flex-col gap-2">
                  <Label>Review of Systems</Label>
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1">
                      <Select
                        value={reviewOfSystems}
                        onChange={setReviewOfSystems}
                        options={["Select or add review of systems", ...SYSTEMS]}
                      />
                    </div>
                    <button
                      type="button"
                      className="shrink-0 w-9 flex items-center justify-center border border-gray-300 rounded-lg text-slate-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={15} strokeWidth={2.25} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SYSTEMS.map((s) => (
                      <SystemPill key={s} label={s} active={selectedSystems.includes(s)} onToggle={() => toggleSystem(s)} />
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="2. Key Examination (Quick View)" icon={Activity} iconTone="text-blue-500">
                <div className="flex flex-col divide-y divide-gray-50">
                  <KeyValueRow label="Temperature" value="37.2 °C" />
                  <KeyValueRow label="Pulse" value="88 bpm" />
                  <KeyValueRow label="Blood Pressure" value="120/80 mmHg" />
                  <KeyValueRow label="Respiratory Rate" value="18 /min" />
                  <KeyValueRow label="SpO2" value="98 %" />
                  <KeyValueRow label="Weight" value="65.0 kg" />
                </div>
                <Link
                  href="/modules/opd-management/triage-vitals"
                  className="mt-auto flex items-center justify-center border border-gray-300 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  View Full Vitals
                </Link>
              </Card>

              <Card title="3. Physical Examination" icon={Stethoscope} iconTone="text-blue-500">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="General Appearance">
                    <Select
                      value={generalAppearance}
                      onChange={setGeneralAppearance}
                      options={["Alert", "Lethargic", "Distressed", "Well-Appearing"]}
                    />
                  </Field>
                  <Field label="Consciousness">
                    <Select
                      value={consciousness}
                      onChange={setConsciousness}
                      options={["Alert & Oriented", "Drowsy", "Confused", "Unresponsive"]}
                    />
                  </Field>
                  <Field label="Hydration">
                    <Select value={hydration} onChange={setHydration} options={["Normal", "Mild Dehydration", "Moderate Dehydration"]} />
                  </Field>
                  <Field label="Pallor / Icterus / Cyanosis">
                    <Select value={pallor} onChange={setPallor} options={["None", "Pallor", "Icterus", "Cyanosis"]} />
                  </Field>
                </div>
                <Field label="Systemic Examination">
                  <textarea
                    value={systemicExam}
                    onChange={(e) => setSystemicExam(e.target.value)}
                    rows={3}
                    className={`${inputBase} resize-none`}
                  />
                </Field>
                <GreenCheckbox checked={normalExam} onChange={setNormalExam}>
                  Normal Examination
                </GreenCheckbox>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="4. Provisional Diagnosis" icon={ClipboardList}>
                <RequiredField label="Primary Diagnosis">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-emerald-500">
                    <Search size={14} strokeWidth={2.25} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-slate-800 flex-1 truncate">
                      G44.1 - Vascular headache, not elsewhere classified
                    </span>
                    <button type="button" className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <X size={14} strokeWidth={2.25} />
                    </button>
                  </div>
                </RequiredField>
                <Field label="Secondary Diagnosis (if any)">
                  <div className="flex items-stretch gap-2">
                    <input
                      value={secondaryDx}
                      onChange={(e) => setSecondaryDx(e.target.value)}
                      placeholder="Search diagnosis (ICD-10)"
                      className={`${inputBase} flex-1`}
                    />
                    <button
                      type="button"
                      className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-3 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      Add
                    </button>
                  </div>
                </Field>
                <Field label="Clinical Impression">
                  <MicTextarea value={clinicalImpression} onChange={setClinicalImpression} rows={3} />
                </Field>
              </Card>

              <Card title="5. Treatment Plan" icon={ClipboardList} iconTone="text-blue-500">
                <Field label="Management Plan">
                  <MicTextarea value={managementPlan} onChange={setManagementPlan} rows={4} />
                </Field>
                <Field label="Advice / Education">
                  <MicTextarea value={advice} onChange={setAdvice} rows={3} />
                </Field>
              </Card>

              <Card title="6. Follow Up" icon={ClipboardList} iconTone="text-blue-500">
                <div className="flex items-center justify-between">
                  <Label>Follow Up Required</Label>
                  <ToggleSwitch checked={followUpRequired} onChange={setFollowUpRequired} />
                </div>
                <Field label="Follow Up Date">
                  <DatePicker key={followUpDate} defaultValue={followUpDate ? new Date(followUpDate) : undefined} onChange={(d) => setFollowUpDate(toISO(d))} />
                </Field>
                <Field label="Follow Up Type">
                  <Select value={followUpType} onChange={setFollowUpType} options={["OPD Visit", "Teleconsultation", "Lab Recheck"]} />
                </Field>
                <Field label="Follow Up With">
                  <Select
                    value={followUpWith}
                    onChange={setFollowUpWith}
                    options={["Dr. Eyob Tesfaye", "Dr. Dawit Bekele", "Dr. Hanna Yohannes"]}
                  />
                </Field>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Allergies" value="Penicillin" />
                <KeyValueRow label="Chronic Illness" value="Hypertension" />
                <KeyValueRow label="Current Medications" value="Amlodipine 5mg OD" />
                <KeyValueRow label="Blood Group" value="O+" />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600" />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time="09:28 AM" title="Registration Completed" detail="by Meron G." state="done" />
                <TimelineItem time="09:30 AM" title="Triage Completed" detail="by Nurse Hana" state="done" />
                <TimelineItem time="09:31 AM" title="Consultation" detail="" state="active" badge="In Progress" />
                <TimelineItem time="--:--" title="Orders" detail="Pending" state="pending" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton
                  icon={FlaskConical}
                  label="Order Laboratory"
                  tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }}
                />
                <QuickActionButton
                  icon={ScanLine}
                  label="Order Radiology"
                  tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }}
                />
                <QuickActionButton
                  icon={StickyNote}
                  label="Add Clinical Note"
                  tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }}
                />
                <QuickActionButton
                  icon={UploadCloud}
                  label="Upload Document"
                  tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }}
                />
                <QuickActionButton
                  icon={Send}
                  label="Request Referral"
                  tone={{ bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter
        left={
          <>
            <FooterButton tone="danger">Cancel Consultation</FooterButton>
            <FooterButton tone="info">Save Draft</FooterButton>
          </>
        }
        right={
          <>
            <FooterButton tone="neutral">
              <Printer size={15} strokeWidth={2.25} />
              Print Preview
            </FooterButton>
            <FooterPrimaryButton>
              Save &amp; Continue to Orders
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}
