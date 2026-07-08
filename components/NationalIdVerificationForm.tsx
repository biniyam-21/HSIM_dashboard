import {
  Search,
  Info,
  Lock,
  Check,
  User,
  Languages,
  Calendar as CalendarIcon,
  Flag,
  MapPin,
  CalendarCheck,
  CalendarX,
  ShieldCheck,
  FileText,
  Eye,
  UserPlus,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import Stepper from "@/components/Stepper";
import {
  Card,
  FieldLabel,
  TextField,
  SelectField,
  inputClass,
  Avatar,
  ComplianceNote,
} from "@/components/FormFields";

const STEPS = [
  "Enter National ID",
  "Verify with National ID System",
  "Review & Confirm",
  "Link to Patient Record",
];

/* ---------- Enter National ID ---------- */

function EnterNationalIdCard() {
  return (
    <Card title="Enter National ID">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-52 shrink-0">
            <SelectField
              label="ID Type"
              defaultValue="Fayda National ID"
              options={["Fayda National ID", "Kebele ID", "Passport"]}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <FieldLabel required>National ID Number</FieldLabel>
            <div className="flex items-stretch gap-2">
              <input type="text" defaultValue="1001-2345-6789" className={`${inputClass} flex-1`} />
              <button
                type="button"
                className="px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white whitespace-nowrap transition-colors"
              >
                <Search size={15} strokeWidth={2.5} />
                Verify ID
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-md">
          <Info size={17} strokeWidth={2} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-blue-800">About National ID Verification</span>
            <span className="text-sm text-blue-800/90 leading-relaxed">
              This will verify the patient&apos;s identity with the Ethiopian National ID (Fayda)
              system. Ensure you have a valid consent to use national ID for patient
              identification.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Verification Result ---------- */

const RESULT_ROWS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: CalendarIcon, label: "Verification Date", value: "May 22, 2026 11:24 AM" },
  { icon: User, label: "Verified By", value: "Dr. Eyob Tesfaye" },
  { icon: FileText, label: "Reference Number", value: "NID-2026-05-22-1124-001" },
  { icon: ShieldCheck, label: "Status", value: "Matched" },
];

function VerificationResultCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-sm font-bold text-slate-900">Verification Result</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
          Verified Successfully
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The National ID is valid and the details below are retrieved from the Ethiopian National
        ID (Fayda) system.
      </p>

      <div className="flex items-center gap-5">
        <span className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Check size={40} strokeWidth={3} className="text-green-600" />
        </span>
        <div className="flex flex-col gap-2.5 min-w-0">
          {RESULT_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-2 text-sm">
                <Icon size={14} strokeWidth={1.8} className="text-gray-400 shrink-0" />
                <span className="text-gray-500 w-36 shrink-0">{row.label}</span>
                <span className="font-medium text-slate-800">{row.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 -mx-5 -mb-5 px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg flex items-start gap-2">
        <Lock size={14} strokeWidth={1.8} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Data is retrieved securely from the National ID system and will be used only for
          patient identification as per MOH regulations.
        </p>
      </div>
    </div>
  );
}

/* ---------- National ID Information ---------- */

const ID_INFO_ROWS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: User, label: "Full Name (English)", value: "Selamawit Desta Abebe" },
  { icon: Languages, label: "Full Name (Amharic)", value: "ሰላማዊት ደስታ አበበ" },
  { icon: User, label: "Gender", value: "Female" },
  { icon: CalendarIcon, label: "Date of Birth", value: "May 12, 1992" },
  { icon: Flag, label: "Nationality", value: "Ethiopian" },
  { icon: MapPin, label: "Place of Birth", value: "Addis Ababa" },
  { icon: CalendarCheck, label: "ID Issue Date", value: "Jan 01, 2018" },
  { icon: CalendarX, label: "ID Expiry Date", value: "Jan 01, 2028" },
  { icon: ShieldCheck, label: "ID Status", value: "Active" },
  { icon: FileText, label: "ID Type", value: "Fayda National ID" },
];

function NationalIdInformationCard() {
  return (
    <Card title="National ID Information">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 sm:col-span-2">
          {ID_INFO_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                  <Icon size={15} strokeWidth={1.8} className="text-teal-700 shrink-0" />
                  {row.label}
                </span>
                <span className="text-sm font-medium text-slate-800 text-right">{row.value}</span>
              </div>
            );
          })}
        </div>

        <div className="col-span-3 sm:col-span-1 flex flex-col gap-3">
          <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            Valid ID
          </span>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-900">ID Photo</span>
            <div className="w-full max-w-[150px] mx-auto aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=320&h=420&fit=crop&crop=faces"
                alt="National ID photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 h-10 border border-gray-300 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <Eye size={15} strokeWidth={2} />
            View Full ID Document
          </button>
          <p className="text-xs text-gray-500 text-center">Image provided by Fayda System</p>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Match with Existing Patient ---------- */

function MatchWithExistingPatientCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Match with Existing Patient</h2>
        <button type="button" className="text-sm font-medium text-teal-700 hover:underline">
          How it works?
        </button>
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-md mb-4">
        <CheckCircle2 size={18} strokeWidth={2} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-emerald-800">
            No matching patient found in the system.
          </span>
          <span className="text-xs text-emerald-700">
            You can register a new patient with this National ID.
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="flex-1 h-10 inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors"
        >
          <UserPlus size={15} strokeWidth={2} />
          Register New Patient
        </button>
        <button
          type="button"
          className="flex-1 h-10 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Search size={15} strokeWidth={2} />
          Search Again
        </button>
      </div>
    </Card>
  );
}

/* ---------- Consent & Legal ---------- */

function ConsentLegalCard() {
  return (
    <Card title="Consent & Legal">
      <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-md mb-4">
        <ShieldCheck size={18} strokeWidth={2} className="text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-800 leading-relaxed">
          I confirm that I have obtained consent from the patient to use their National ID for
          identification and treatment as per Ethiopian Ministry of Health regulations.
        </p>
      </div>

      <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
        <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-700 rounded" />
        <span className="text-sm font-semibold text-slate-900">Consent confirmed</span>
      </label>

      <TextField label="Consent Date" defaultValue="05/22/2026 11:24 AM" icon={CalendarIcon} />
    </Card>
  );
}

/* ---------- Recent Verifications ---------- */

type VerificationRow = {
  name: string;
  idNumber: string;
  status: "Verified" | "Failed";
  time: string;
  photo?: string;
  initials?: string;
};

const RECENT: VerificationRow[] = [
  {
    name: "Abebe Kebede",
    idNumber: "1001-9876-5432",
    status: "Verified",
    time: "10:45 AM",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&fit=crop&crop=faces",
  },
  { name: "Yonas Alemu", idNumber: "1001-1122-3344", status: "Verified", time: "10:30 AM", initials: "YA" },
  { name: "Mekdes Kassa", idNumber: "1001-6677-8899", status: "Failed", time: "09:50 AM", initials: "MK" },
  {
    name: "Sara Ahmed",
    idNumber: "1001-5566-7788",
    status: "Verified",
    time: "09:15 AM",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&fit=crop&crop=faces",
  },
  { name: "Betelhem Amare", idNumber: "1001-4455-6677", status: "Verified", time: "08:40 AM", initials: "BA" },
];

function RecentVerificationsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Recent Verifications</h2>
        <button type="button" className="text-sm font-medium text-teal-700 hover:underline">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {RECENT.map((r) => (
          <div key={r.idNumber} className="flex items-center gap-3">
            <Avatar photo={r.photo} initials={r.initials} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {r.name}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">{r.idNumber}</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                r.status === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
              }`}
            >
              {r.status}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap w-16 text-right shrink-0">
              {r.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- page ---------- */

export default function NationalIdVerificationForm() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto flex flex-col gap-6">
      <ModulePageHeader
        title="National ID Verification"
        breadcrumb="Patient Management > National ID Verification"
      />
      <Stepper steps={STEPS} activeStep={1} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <EnterNationalIdCard />
          <VerificationResultCard />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <NationalIdInformationCard />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MatchWithExistingPatientCard />
        <ConsentLegalCard />
        <RecentVerificationsCard />
      </div>

      <ComplianceNote
        lines={[
          "National ID verification is performed securely via the Fayda (Ethiopian National ID) system API. All data is encrypted and access is logged for audit and compliance.",
        ]}
      />
    </div>
  );
}
