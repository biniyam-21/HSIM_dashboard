"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  HeartPulse,
  Eye,
  ClipboardList,
  Route,
  Paperclip,
  FileCheck2,
  ChevronDown,
  Plus,
  X,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  MoreHorizontal,
  Printer,
  ArrowRight,
  FlaskConical,
  ScanLine,
  Pill as PillIcon,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Label,
  Field,
  Select,
  MicTextarea,
  CheckboxRow,
  Card,
  HeaderFact,
  KeyValueRow,
  TimelineItem,
  QuickActionButton,
  StickyFooter,
  FooterButton,
  FooterPrimaryButton,
} from "@/components/OpdShared";

/* ============================================================================
   Clinical Notes (EMR) — FRD 10.1 (Clinical Notes & Documentation), 10.2 (ICD
   coding via System Review tags). Fourth screen in the OPD visit chain:
   OPD Registration -> Triage & Vitals -> Consultation -> Clinical Notes (EMR).
   ========================================================================== */

/* ---------- tag box (Past Medical History / Allergies / Current Medications) ---------- */

const TAG_TONE = {
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-700",
} as const;

function Tag({ label, tone, onRemove }: { label: string; tone: keyof typeof TAG_TONE; onRemove: () => void }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-1 whitespace-nowrap ${TAG_TONE[tone]}`}>
      {label}
      <button type="button" onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={12} strokeWidth={2.5} />
      </button>
    </span>
  );
}

function MultiSelectTagBox({ tags, tone, onRemove }: { tags: string[]; tone: keyof typeof TAG_TONE; onRemove: (t: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px] flex-wrap">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Tag key={t} label={t} tone={tone} onRemove={() => onRemove(t)} />
        ))}
      </div>
      <ChevronDown size={15} strokeWidth={2} className="text-gray-400 shrink-0" />
    </div>
  );
}

function TagRow({
  tags,
  tone,
  onRemove,
  addLabel,
}: {
  tags: string[];
  tone: keyof typeof TAG_TONE;
  onRemove: (t: string) => void;
  addLabel: string;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex-1 flex flex-wrap items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-2 min-h-[42px]">
        {tags.map((t) => (
          <Tag key={t} label={t} tone={tone} onRemove={() => onRemove(t)} />
        ))}
      </div>
      <button
        type="button"
        className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline whitespace-nowrap px-1"
      >
        <Plus size={14} strokeWidth={2.5} />
        {addLabel}
      </button>
    </div>
  );
}

const SYSTEMS_LEFT = ["Constitutional", "Head & Neck", "Eyes", "ENT", "Respiratory", "Cardiovascular", "Gastrointestinal"];
const SYSTEMS_RIGHT = ["Genitourinary", "Musculoskeletal", "Neurological", "Skin", "Endocrine", "Hematologic", "Psychiatric"];

const TABS = [
  { key: "subjective", label: "Subjective (History)", icon: HeartPulse },
  { key: "objective", label: "Objective (Exam)", icon: Eye },
  { key: "assessment", label: "Assessment", icon: ClipboardList },
  { key: "plan", label: "Plan", icon: Route },
  { key: "notes", label: "Notes & Attachments", icon: Paperclip },
  { key: "summary", label: "Summary", icon: FileCheck2 },
];

const TOOLBAR_ICONS: LucideIcon[] = [Undo2, Redo2, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Paperclip, MoreHorizontal];

export default function ClinicalNotesForm() {
  const [activeTab, setActiveTab] = useState("subjective");
  const [historySource, setHistorySource] = useState("Patient");
  const [chiefComplaint, setChiefComplaint] = useState("Headache and body weakness since 2 days.");
  const [hpi, setHpi] = useState(
    "Patient reports dull aching headache, more on frontal area, associated with generalized body weakness and mild dizziness. No history of fever, cough, chest pain or shortness of breath."
  );
  const [pastMedicalHistory, setPastMedicalHistory] = useState(["Hypertension", "Migraine"]);
  const [pastSurgicalHistory, setPastSurgicalHistory] = useState("No previous surgeries");
  const [familyHistory, setFamilyHistory] = useState("No significant family history");
  const [socialHistory, setSocialHistory] = useState("Non-smoker, No alcohol use");
  const [systems, setSystems] = useState<string[]>(["Constitutional"]);
  const [allergies, setAllergies] = useState(["Penicillin"]);
  const [medications, setMedications] = useState(["Amlodipine 5mg OD", "Paracetamol 500mg PRN"]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const toggleSystem = (s: string) =>
    setSystems((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const wordCount = hpi.trim() ? hpi.trim().split(/\s+/).length : 0;
  const charCount = hpi.length;

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
              <Link href="/modules/opd-management/consultation" className="hover:text-teal-700 hover:underline">
                Consultation
              </Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-slate-800 font-semibold">Clinical Notes (EMR)</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Clinical Notes (EMR)</h1>
              <p className="text-sm text-gray-400 mt-0.5">Create and manage electronic medical records</p>
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

        {/* Patient profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PATIENT_PHOTO} alt="Selamawit Abebe" className="w-12 h-12 rounded-full object-cover ring-[3px] ring-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
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
                    active ? "text-emerald-600 border-emerald-500" : "text-gray-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.25} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main grid: left content (~75%) + right sidebar (~25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Left column: Subjective (History) */}
              <Card title="1. Subjective (History)" icon={HeartPulse}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="History Source">
                    <Select value={historySource} onChange={setHistorySource} options={["Patient", "Guardian", "Caregiver", "Referral Note"]} />
                  </Field>
                  <Field label="Chief Complaint">
                    <MicTextarea value={chiefComplaint} onChange={setChiefComplaint} rows={2} />
                  </Field>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>History of Present Illness</Label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
                      {TOOLBAR_ICONS.map((Icon, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          <Icon size={14} strokeWidth={2.25} />
                        </button>
                      ))}
                      <div className="relative ml-1">
                        <select className="text-xs border border-gray-300 rounded px-2 py-1 pr-6 appearance-none bg-white text-gray-600 cursor-pointer">
                          <option>Paragraph</option>
                          <option>Heading</option>
                        </select>
                        <ChevronDown size={12} strokeWidth={2} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <textarea
                      value={hpi}
                      onChange={(e) => setHpi(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2.5 text-sm text-slate-800 resize-none focus:outline-none"
                    />
                    <div className="flex justify-end px-3 py-1.5 border-t border-gray-100">
                      <span className="text-xs text-gray-400 tabular-nums">
                        Words: {wordCount} &nbsp; Chars: {charCount}
                      </span>
                    </div>
                  </div>
                </div>

                <Field label="Past Medical History">
                  <MultiSelectTagBox tags={pastMedicalHistory} tone="green" onRemove={(t) => setPastMedicalHistory((p) => p.filter((x) => x !== t))} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Past Surgical History">
                    <Select
                      value={pastSurgicalHistory}
                      onChange={setPastSurgicalHistory}
                      options={["No previous surgeries", "Appendectomy", "C-Section", "Other (see notes)"]}
                    />
                  </Field>
                  <Field label="Family History">
                    <input value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className={inputBase} />
                  </Field>
                </div>

                <Field label="Social History">
                  <input value={socialHistory} onChange={(e) => setSocialHistory(e.target.value)} className={inputBase} />
                </Field>
              </Card>

              {/* Right column: System Review, Allergies, Current Medications */}
              <div className="flex flex-col gap-4">
                <Card title="2. System Review" icon={Users} iconTone="text-blue-500">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex flex-col">
                      {SYSTEMS_LEFT.map((s) => (
                        <CheckboxRow key={s} label={s} checked={systems.includes(s)} onToggle={() => toggleSystem(s)} />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      {SYSTEMS_RIGHT.map((s) => (
                        <CheckboxRow key={s} label={s} checked={systems.includes(s)} onToggle={() => toggleSystem(s)} />
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="3. Allergies" icon={Users} iconTone="text-violet-500">
                  <TagRow tags={allergies} tone="red" onRemove={(t) => setAllergies((p) => p.filter((x) => x !== t))} addLabel="Add" />
                </Card>

                <Card title="4. Current Medications" icon={Users} iconTone="text-blue-500">
                  <TagRow tags={medications} tone="blue" onRemove={(t) => setMedications((p) => p.filter((x) => x !== t))} addLabel="Add Medication" />
                </Card>
              </div>
            </div>

            {/* Full-width bottom: Additional Notes */}
            <Card title="5. Additional Notes" icon={Users}>
              <MicTextarea value={additionalNotes} onChange={setAdditionalNotes} rows={3} placeholder="Add any additional patient notes..." />
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Blood Group" value="O+" />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600" />
                <KeyValueRow label="Last Visit" value="Apr 10, 2025" />
                <KeyValueRow label="Last BP" value="130/85 mmHg" />
                <KeyValueRow label="Last Weight" value="64.0 kg" />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time="09:28 AM" title="Registration Completed" detail="by Meron G." state="done" />
                <TimelineItem time="09:30 AM" title="Triage Completed" detail="by Nurse Hana" state="done" />
                <TimelineItem time="09:31 AM" title="Consultation Started" detail="by Dr. Eyob Tesfaye" state="active" />
                <TimelineItem time="--:--" title="Clinical Notes" detail="" state="active" badge="In Progress" />
                <TimelineItem time="--" title="Orders" detail="Pending" state="pending" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton icon={FlaskConical} label="Order Laboratory" tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }} />
                <QuickActionButton icon={ScanLine} label="Order Radiology" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
                <QuickActionButton icon={PillIcon} label="Prescription" tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }} />
                <QuickActionButton icon={StickyNote} label="Add Clinical Note" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
              </div>
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
