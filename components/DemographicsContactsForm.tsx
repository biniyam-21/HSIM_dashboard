import {
  Calendar as CalendarIcon,
  Info,
  FileText,
  Pencil,
  ShieldCheck,
  Upload,
  GitMerge,
  Printer,
  History,
  Building2,
  Stethoscope,
  Phone,
  Shield,
  Save,
  type LucideIcon,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import PatientProfileTabs from "@/components/PatientProfileTabs";
import {
  Card,
  FieldLabel,
  TextField,
  SelectField,
  TagsField,
  inputClass,
  ComplianceNote,
} from "@/components/FormFields";

const PATIENT_PHOTO =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&h=200&fit=crop&crop=faces";

/* ---------- Personal Information ---------- */

function PersonalInformationCard() {
  return (
    <Card title="Personal Information">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="First Name" required defaultValue="Selamawit" />
          <TextField label="Middle Name" defaultValue="Abebe" />
          <TextField label="Last Name" required defaultValue="Desta" />
          <TextField label="Preferred Name" defaultValue="Selamawit" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Gender" required defaultValue="Female" options={["Female", "Male"]} />
          <TextField label="Date of Birth" required defaultValue="05/12/1992" icon={CalendarIcon} />
          <TextField label="Age" defaultValue="33 Years" readOnly />
          <SelectField
            label="Nationality"
            required
            defaultValue="Ethiopian"
            options={["Ethiopian", "Other"]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField
            label="Marital Status"
            defaultValue="Married"
            options={["Single", "Married", "Divorced", "Widowed"]}
          />
          <SelectField
            label="Religion"
            defaultValue="Orthodox"
            options={["Orthodox", "Muslim", "Protestant", "Catholic", "Other"]}
          />
          <SelectField
            label="Occupation"
            defaultValue="Teacher"
            options={["Teacher", "Engineer", "Farmer", "Merchant", "Other"]}
          />
          <SelectField
            label="Education Level"
            defaultValue="Bachelor's Degree"
            options={["None", "High School", "Diploma", "Bachelor's Degree", "Master's Degree"]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TagsField label="Language Spoken" tags={["Amharic", "English"]} />
          <SelectField
            label="Ethnicity (Optional)"
            defaultValue="Oromo"
            options={["Oromo", "Amhara", "Tigray", "Somali", "Other"]}
          />
          <SelectField
            label="Blood Group"
            defaultValue="O+"
            options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]}
          />
          <SelectField
            label="RH Factor"
            defaultValue="Positive (+)"
            options={["Positive (+)", "Negative (-)"]}
          />
        </div>
      </div>
    </Card>
  );
}

/* ---------- Additional Details ---------- */

function BmiField() {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>BMI</FieldLabel>
      <div className="flex items-center gap-2">
        <input type="text" defaultValue="22.1" readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} />
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap shrink-0">
          Normal
        </span>
      </div>
    </div>
  );
}

function AdditionalDetailsCard() {
  return (
    <Card title="Additional Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Height (cm)" defaultValue="162" />
          <TextField label="Weight (kg)" defaultValue="58" />
          <BmiField />
          <SelectField label="Cigarette Smoker" defaultValue="No" options={["No", "Yes"]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Alcohol Use" defaultValue="No" options={["No", "Occasionally", "Yes"]} />
          <TextField label="Known Allergies" labelIcon={Info} defaultValue="Penicillin, Peanuts" />
          <div className="lg:col-span-2">
            <TagsField label="Chronic Conditions" tags={["Hypertension", "None"]} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Special Needs" defaultValue="None" />
          <SelectField label="Physical Disability" defaultValue="No" options={["No", "Yes"]} />
          <div className="lg:col-span-2">
            <TextField label="Disability Details (If Yes)" placeholder="Enter details..." />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Identification Numbers ---------- */

function VerifiedInputField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input type="text" defaultValue={defaultValue} className={`${inputClass} pr-20`} />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
          Verified
        </span>
      </div>
    </div>
  );
}

function IdentificationNumbersCard() {
  return (
    <Card title="Identification Numbers">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VerifiedInputField label="Fayda National ID" defaultValue="1001-2345-6789" />
          <TextField label="ID Issue Date" defaultValue="01/01/2018" icon={CalendarIcon} />
          <TextField label="ID Expiry Date" defaultValue="01/01/2028" icon={CalendarIcon} />
          <TextField label="ID Document Number" defaultValue="NID-2026-05-22-1124-001" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextField label="Passport Number (Optional)" placeholder="Enter passport number" />
          <TextField label="Driving License (Optional)" placeholder="Enter driving license number" />
          <TextField label="Additional ID (Optional)" placeholder="Enter additional ID number" />
          <div className="flex flex-col gap-1">
            <FieldLabel>ID Document</FieldLabel>
            <button
              type="button"
              className="h-[38px] flex items-center justify-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
            >
              <FileText size={15} strokeWidth={2} />
              View Document
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- right column: Patient Profile ---------- */

function PatientProfileCard() {
  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PATIENT_PHOTO}
          alt="Selamawit Desta Abebe"
          className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100 mb-2"
        />
        <span className="text-lg font-bold text-slate-900">Selamawit Desta Abebe</span>
        <span className="text-sm text-gray-500">MRN: MRN-2026-000123</span>
        <span className="mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          Active Patient
        </span>

        <div className="w-full h-px bg-gray-100 my-3" />

        <div className="flex items-center gap-1.5 text-sm">
          <ShieldCheck size={15} strokeWidth={2} className="text-gray-400" />
          <span className="text-gray-500">Fayda ID:</span>
          <span className="font-bold text-teal-700">1001-2345-6789</span>
        </div>
        <span className="text-xs font-medium text-emerald-600 mt-0.5">✓ Verified</span>

        <span className="text-xs text-gray-500 mt-3">Registered on: May 21, 2026</span>
      </div>
    </Card>
  );
}

/* ---------- right column: Actions ---------- */

const ACTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Pencil, label: "Edit Demographics" },
  { icon: ShieldCheck, label: "Verify National ID" },
  { icon: Upload, label: "Upload Document" },
  { icon: GitMerge, label: "Merge Patient" },
  { icon: Printer, label: "Print Patient Summary" },
  { icon: History, label: "View Audit History" },
];

function ActionsCard() {
  return (
    <Card title="Actions">
      <div className="flex flex-col gap-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              type="button"
              className="flex items-center gap-2.5 w-full h-10 px-3 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <Icon size={16} strokeWidth={1.8} className="text-teal-700 shrink-0" />
              {a.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- right column: Data Quality ---------- */

function CompletionRing({ percent }: { percent: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-gray-100" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-teal-700"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-900 font-heading text-sm font-bold"
      >
        {percent}%
      </text>
    </svg>
  );
}

function DataQualityCard() {
  return (
    <Card title="Data Quality">
      <div className="flex items-center gap-4 mb-4">
        <CompletionRing percent={96} />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-slate-900">Complete</span>
          <span className="text-xs text-gray-500">All required fields are filled.</span>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 h-10 border border-gray-300 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
      >
        <History size={15} strokeWidth={2} />
        View Missing Fields
      </button>
    </Card>
  );
}

/* ---------- right column: Quick Info ---------- */

const QUICK_INFO: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: CalendarIcon, label: "Last Visit", value: "May 21, 2026 (OPD)" },
  { icon: Building2, label: "Primary Department", value: "General Medicine" },
  { icon: Stethoscope, label: "Primary Doctor", value: "Dr. Hana M." },
  { icon: Phone, label: "Phone (Primary)", value: "0911 234 567" },
  { icon: ShieldCheck, label: "Insurance", value: "CBHI Member" },
];

function QuickInfoCard() {
  return (
    <Card title="Quick Info">
      <div className="flex flex-col gap-3">
        {QUICK_INFO.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500 shrink-0">
                <Icon size={13} strokeWidth={1.8} className="text-teal-700 shrink-0" />
                {row.label}
              </span>
              <span className="font-medium text-slate-800 text-right">{row.value}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- bottom action bar ---------- */

function ActionBar() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
      <ComplianceNote
        icon={Shield}
        lines={[
          "All demographic data is stored securely and accessible only to authorized personnel.",
          "Last updated by Dr. Eyob Tesfaye on May 21, 2026 11:30 AM",
        ]}
      />
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="h-10 px-5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="h-10 px-5 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors"
        >
          <Save size={15} strokeWidth={2} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function DemographicsContactsForm() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto flex flex-col gap-6">
      <ModulePageHeader
        title="Demographics & Contacts"
        breadcrumb="Patient Management > Demographics & Contacts > Selamawit Desta Abebe (MRN: MRN-2026-000123)"
      />

      <PatientProfileTabs
        tabs={[
          "Demographics",
          "Contact Information",
          "Emergency Contacts",
          "Family",
          "Address",
          "Additional Information",
        ]}
        active="Demographics"
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <PersonalInformationCard />
          <AdditionalDetailsCard />
          <IdentificationNumbersCard />
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <PatientProfileCard />
          <ActionsCard />
          <DataQualityCard />
          <QuickInfoCard />
        </div>
      </div>

      <ActionBar />
    </div>
  );
}
