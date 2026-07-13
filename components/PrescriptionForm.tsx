"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Trash2,
  UploadCloud,
  FileText,
  History,
  Printer,
  ArrowRight,
  Info,
  Cross,
  Send,
  Star,
  Ban,
  Eye,
  Check,
} from "lucide-react";
import {
  PATIENT_PHOTO,
  inputBase,
  Field,
  Label,
  Select,
  Chip,
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
   Prescription — FRD 26.1 (E-Prescribing). Fifth screen in the OPD visit
   chain: OPD Registration -> Triage & Vitals -> Consultation -> Prescription.
   ========================================================================== */

/* ---------- prescription items table ---------- */

type Medicine = {
  id: number;
  name: string;
  tag: string;
  tagTone: "green" | "blue";
  strength: string;
  form: string;
  dose: string;
  route: string;
  duration: string;
  qty: string;
  frequency: string;
};

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 1,
    name: "Amlodipine",
    tag: "Anti-hypertensive",
    tagTone: "green",
    strength: "5 mg",
    form: "Tablet",
    dose: "1 tablet",
    route: "Oral",
    duration: "30 Days",
    qty: "30",
    frequency: "OD - Once daily",
  },
  {
    id: 2,
    name: "Paracetamol",
    tag: "Analgesic",
    tagTone: "blue",
    strength: "500 mg",
    form: "Tablet",
    dose: "1 tablet",
    route: "Oral",
    duration: "5 Days",
    qty: "10",
    frequency: "PRN - SOS",
  },
  {
    id: 3,
    name: "Omeprazole",
    tag: "Gastric Acid Reducer",
    tagTone: "green",
    strength: "20 mg",
    form: "Capsule",
    dose: "1 capsule",
    route: "Oral",
    duration: "30 Days",
    qty: "30",
    frequency: "OD - Once daily",
  },
];

const TAG_CHIP_TONE: Record<Medicine["tagTone"], "emerald" | "blue"> = { green: "emerald", blue: "blue" };

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PrescriptionForm() {
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [search, setSearch] = useState("");
  const [notesToPharmacist, setNotesToPharmacist] = useState("Advise patient to take after food.");
  const [adviceToPatient, setAdviceToPatient] = useState("Avoid salty food and regular exercise. Return if symptoms worsen.");
  const [followUpDate, setFollowUpDate] = useState("2025-05-24");
  const [followUpType, setFollowUpType] = useState("OPD Visit");
  const [maySubstitute, setMaySubstitute] = useState(false);

  const removeMedicine = (id: number) => setMedicines((prev) => prev.filter((m) => m.id !== id));
  const clearAll = () => setMedicines([]);
  const addMedicine = () =>
    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "New Medicine",
        tag: "Unspecified",
        tagTone: "blue",
        strength: "—",
        form: "—",
        dose: "—",
        route: "Oral",
        duration: "—",
        qty: "—",
        frequency: "—",
      },
    ]);

  const followUpDateLabel = new Date(followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
              <span className="text-slate-800 font-semibold">Prescription</span>
            </p>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">Prescription</h1>
              <p className="text-sm text-gray-400 mt-0.5">Create, manage and print patient prescription</p>
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
              <Chip tone="teal">OPD</Chip>
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

        {/* Main grid: left content (~75%) + right sidebar (~25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            {/* Panel 1: Prescription Items */}
            <Card title="1. Prescription Items" icon={ClipboardList}>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search medicine (generic or brand name)..."
                    className={`${inputBase} pl-9`}
                  />
                  <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg px-3.5 hover:bg-emerald-50 transition-colors whitespace-nowrap"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Add from Favorites
                </button>
              </div>

              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr className="text-left text-[10.5px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="px-1 py-2">#</th>
                      <th className="px-2 py-2">Medicine</th>
                      <th className="px-2 py-2">Strength</th>
                      <th className="px-2 py-2">Form</th>
                      <th className="px-2 py-2">Dose &amp; Instruction</th>
                      <th className="px-2 py-2">Route</th>
                      <th className="px-2 py-2">Duration</th>
                      <th className="px-2 py-2">Qty</th>
                      <th className="px-2 py-2">Frequency</th>
                      <th className="px-2 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-[#FBFCFD] transition-colors">
                        <td className="px-1 py-3 text-slate-500 tabular-nums">{m.id <= 3 ? m.id : medicines.indexOf(m) + 1}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 whitespace-nowrap">{m.name}</span>
                            <Chip tone={TAG_CHIP_TONE[m.tagTone]}>{m.tag}</Chip>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.strength}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.form}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.dose}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.route}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.duration}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap tabular-nums">{m.qty}</td>
                        <td className="px-2 py-3 text-slate-700 whitespace-nowrap">{m.frequency}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors">
                              <Pencil size={14} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMedicine(m.id)}
                              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-2 py-8 text-center text-sm text-gray-400">
                          No medicines added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-4 pt-3">
                  <button type="button" onClick={addMedicine} className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                    <Plus size={14} strokeWidth={2.5} />
                    Add Medicine
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <span className="text-sm font-semibold text-slate-700 pt-3">Total Items: <span className="tabular-nums">{medicines.length}</span></span>
              </div>
            </Card>

            {/* Bottom 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <Card title="2. Prescription Details" icon={Users}>
                <Field label="Diagnosis (ICD-10)">
                  <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-lg px-2.5 py-2">
                    <Chip tone="blue" removable>
                      I10 - Essential (primary) hypertension
                    </Chip>
                    <Search size={14} strokeWidth={2.25} className="text-gray-400 shrink-0" />
                  </div>
                </Field>
                <Field label="Notes to Pharmacist">
                  <textarea value={notesToPharmacist} onChange={(e) => setNotesToPharmacist(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <Field label="Advice to Patient">
                  <textarea value={adviceToPatient} onChange={(e) => setAdviceToPatient(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Follow Up">
                    <DatePicker key={followUpDate} defaultValue={followUpDate ? new Date(followUpDate) : undefined} onChange={(d) => setFollowUpDate(toISO(d))} />
                  </Field>
                  <Field label="Follow Up Type">
                    <Select value={followUpType} onChange={setFollowUpType} options={["OPD Visit", "Teleconsultation", "Lab Recheck"]} />
                  </Field>
                </div>
                <button type="button" onClick={() => setMaySubstitute((v) => !v)} className="flex items-center gap-2 select-none">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      maySubstitute ? "bg-emerald-600" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {maySubstitute && <Check size={11} strokeWidth={3} className="text-white" />}
                  </span>
                  <span className="text-xs font-bold text-gray-600">May Substitute</span>
                  <Info size={13} strokeWidth={2.25} className="text-gray-400" />
                </button>
              </Card>

              <Card title="3. Attachments (Optional)" icon={Users}>
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                  <UploadCloud size={26} strokeWidth={1.75} className="text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Drag &amp; drop files here
                    <br />
                    or
                  </p>
                  <button type="button" className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                    Choose Files
                  </button>
                  <p className="text-[11px] text-gray-400">Supports: JPG, PNG, PDF (Max. 5MB)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Previous Prescriptions</Label>
                  <button type="button" className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-lg py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                    <History size={15} strokeWidth={2.25} />
                    View History
                  </button>
                </div>
              </Card>

              <Card
                title="4. Prescription Preview"
                icon={FileText}
                action={
                  <button type="button" className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                    <Eye size={13} strokeWidth={2.25} />
                    Preview
                  </button>
                }
              >
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Cross size={16} strokeWidth={2.25} className="text-teal-700" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold text-slate-900">Fekre selam General Hospital</span>
                      <span className="text-[11px] text-gray-400">Addis Ababa, Ethiopia</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-900">Selamawit Abebe</span>
                      <span className="text-[11px] text-gray-500 tabular-nums">Age: 33 Y 2 M 5 D | Visit No: OPD-2025-000567</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-[11px] text-gray-500 tabular-nums">Date: May 17, 2025</span>
                      <span className="text-[11px] text-gray-500">Doctor: Dr. Eyob Tesfaye</span>
                    </div>
                  </div>

                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-100">
                        <th className="py-1 font-semibold">Rx</th>
                        <th className="py-1 font-semibold">Medicine</th>
                        <th className="py-1 font-semibold">Strength</th>
                        <th className="py-1 font-semibold">Dose &amp; Instruction</th>
                        <th className="py-1 font-semibold">Duration</th>
                        <th className="py-1 font-semibold">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((m, i) => (
                        <tr key={m.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-1.5 text-slate-500 tabular-nums">{i + 1}</td>
                          <td className="py-1.5 text-slate-800 font-medium">{m.name}</td>
                          <td className="py-1.5 text-slate-700 tabular-nums">{m.strength}</td>
                          <td className="py-1.5 text-slate-700">{m.dose}</td>
                          <td className="py-1.5 text-slate-700 tabular-nums">{m.duration}</td>
                          <td className="py-1.5 text-slate-700">{m.frequency.split(" - ")[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <p className="text-slate-700">
                      <span className="font-semibold">Advice to Patient:</span> {adviceToPatient}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">Follow Up:</span> <span className="tabular-nums">{followUpDateLabel}</span> ({followUpType})
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col items-end gap-0.5 ml-auto">
                    <span className="border-t border-gray-300 w-40 pt-1 text-right text-slate-800 font-semibold">Dr. Eyob Tesfaye</span>
                    <span className="text-[11px] text-gray-400">General Practitioner</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            <Card title="Patient Summary" icon={Users}>
              <div className="flex flex-col divide-y divide-gray-50">
                <KeyValueRow label="Blood Group" value="O+" />
                <KeyValueRow label="Allergies" value="Penicillin" />
                <KeyValueRow label="Insurance" value="Woreda 03 CBHI (Valid)" valueClass="text-emerald-600" />
                <KeyValueRow label="Current Medications" value="Amlodipine 5mg OD" />
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View Full Patient 360°
              </button>
            </Card>

            <Card title="Visit Timeline" icon={ClipboardList} iconTone="text-emerald-600">
              <div className="flex flex-col -mt-1">
                <TimelineItem time="09:28 AM" title="Registration Completed" detail="by Meron G." state="done" />
                <TimelineItem time="09:30 AM" title="Triage Completed" detail="by Nurse Hana" state="done" />
                <TimelineItem time="09:31 AM" title="Consultation" detail="by Dr. Eyob Tesfaye" state="done" />
                <TimelineItem time="09:45 AM" title="Prescription" detail="" state="active" badge="In Progress" />
              </div>
            </Card>

            <Card title="Quick Actions" icon={ClipboardList} iconTone="text-blue-500">
              <div className="flex flex-col gap-2">
                <QuickActionButton icon={Printer} label="Print Prescription" tone={{ bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" }} />
                <QuickActionButton icon={Send} label="Send to Pharmacy" tone={{ bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" }} />
                <QuickActionButton icon={FileText} label="Save as Draft" tone={{ bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" }} />
                <QuickActionButton icon={Star} label="Add to Favorites" tone={{ bg: "bg-violet-50", text: "text-violet-700", hover: "hover:bg-violet-100" }} />
                <QuickActionButton icon={Ban} label="Cancel Prescription" tone={{ bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" }} />
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
              Save &amp; Send to Pharmacy
              <ArrowRight size={15} strokeWidth={2.25} />
            </FooterPrimaryButton>
          </>
        }
      />
    </div>
  );
}
