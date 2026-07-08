"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Users,
  ScanLine,
  Eraser,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  LocateFixed,
  Copy,
  ShieldCheck,
  UserPlus,
  Wallet,
  Briefcase,
  AlertTriangle,
  Bell,
  FileSignature,
  HeartHandshake,
  Accessibility,
  RotateCcw,
  Pencil,
  QrCode,
  Printer,
  Download,
  CreditCard,
  ClipboardCheck,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import PatientPhotoUploader from "@/components/PatientPhotoUploader";
import ModulePageHeader from "@/components/ModulePageHeader";
import Stepper from "@/components/Stepper";
import {
  Card,
  FieldLabel,
  TextField,
  SelectField,
  ActionInputField,
  TagsField,
  ComplianceNote,
  Avatar,
  inputClass,
} from "@/components/FormFields";

const STEPS = [
  "Patient Information",
  "Contact & Address",
  "Insurance & Next of Kin",
  "Additional Information",
  "Review & Confirm",
];

const LAST_BUILT_STEP = 5;
const PATIENT_PHOTO =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=320&h=320&fit=crop&crop=faces";

/* ---------- shared local primitives ---------- */

function Checkbox({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "bg-teal-700 border-teal-700"
            : "border-gray-300 bg-white group-hover:border-teal-400"
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-slate-800">{title}</span>
        {description && <span className="text-xs text-gray-500 mt-0.5">{description}</span>}
      </span>
    </label>
  );
}

function OptionTile({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-lg border text-center transition-colors ${
        active
          ? "border-teal-700 bg-teal-50 text-teal-700"
          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Icon size={19} strokeWidth={1.8} />
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </button>
  );
}

function SectionIntro({ icon: Icon, title, blurb }: { icon: LucideIcon; title: string; blurb: string }) {
  return (
    <div className="flex items-start gap-3 bg-teal-50/60 border border-teal-100 rounded-lg p-3.5">
      <span className="w-8 h-8 rounded-full bg-white text-teal-700 flex items-center justify-center shrink-0 shadow-sm">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-teal-900">{title}</span>
        <span className="text-xs text-teal-800/80 leading-relaxed">{blurb}</span>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 1 — Patient Information
   ========================================================================= */

function BasicInformationCard() {
  return (
    <Card title="Basic Information">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="First Name" required defaultValue="Selamawit" />
          <TextField label="Middle Name" defaultValue="Abebe" />
          <TextField label="Last Name" required defaultValue="Desta" />
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
            label="Religion"
            defaultValue="Orthodox"
            options={["Orthodox", "Muslim", "Protestant", "Catholic", "Other"]}
          />
          <SelectField
            label="Marital Status"
            defaultValue="Married"
            options={["Single", "Married", "Divorced", "Widowed"]}
          />
          <SelectField
            label="Occupation"
            defaultValue="Teacher"
            options={["Teacher", "Engineer", "Farmer", "Merchant", "Other"]}
          />
          <SelectField
            label="Preferred Language"
            defaultValue="Amharic"
            options={["Amharic", "Oromiffa", "Tigrinya", "English"]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Blood Group"
            defaultValue="O+"
            options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]}
          />
          <ActionInputField
            label="Unique Medical Record Number (MRN)"
            defaultValue="MRN-2026-000123"
            actionLabel="Generate"
            actionColor="gray"
          />
          <ActionInputField
            label="Fayda National ID (Optional)"
            defaultValue="1001-2345-6789"
            actionLabel="Verify"
            actionColor="teal"
          />
        </div>
      </div>
    </Card>
  );
}

function IdentificationCard() {
  return (
    <Card title="Identification">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectField
          label="ID Type"
          defaultValue="Ethiopian National ID"
          options={["Ethiopian National ID", "Passport", "Driving License", "Kebele ID"]}
        />
        <TextField label="ID Number" defaultValue="1234567890123" />
        <TextField label="ID Issue Date" defaultValue="01/01/2018" icon={CalendarIcon} />
        <TextField label="ID Expiry Date" defaultValue="01/01/2028" icon={CalendarIcon} />
      </div>
    </Card>
  );
}

function InitialVisitCard() {
  return (
    <Card title="Initial Visit Information">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField
            label="Visit Type"
            required
            defaultValue="Outpatient (OPD)"
            options={["Outpatient (OPD)", "Inpatient (IPD)", "Emergency"]}
          />
          <TextField label="Visit Date" required defaultValue="05/22/2026" icon={CalendarIcon} />
          <SelectField
            label="Referred From (Optional)"
            placeholder="Select facility"
            options={["St. Paul's Hospital", "Black Lion Hospital", "Self-Referral"]}
          />
          <SelectField
            label="Department"
            required
            defaultValue="General Medicine"
            options={["General Medicine", "Pediatrics", "Surgery", "Gynecology", "Orthopedics"]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Notes (Optional)</FieldLabel>
          <textarea
            rows={3}
            placeholder="Enter any additional notes..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </Card>
  );
}

function PatientPhotoCard() {
  return (
    <Card title="Patient Photo">
      <PatientPhotoUploader />
    </Card>
  );
}

const STEP1_QUICK_ACTIONS: { icon: LucideIcon; title: string; subtitle: string; color: string }[] = [
  {
    icon: Users,
    title: "Check for Duplicates",
    subtitle: "Search similar patients",
    color: "text-teal-700 bg-teal-50",
  },
  {
    icon: ScanLine,
    title: "Scan ID Document",
    subtitle: "Scan national ID card",
    color: "text-teal-700 bg-teal-50",
  },
  {
    icon: Eraser,
    title: "Clear Form",
    subtitle: "Reset all fields",
    color: "text-amber-600 bg-amber-50",
  },
];

function QuickActionsCard({
  actions,
}: {
  actions: { icon: LucideIcon; title: string; subtitle: string; color: string }[];
}) {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-col gap-1">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              type="button"
              className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${a.color}`}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-gray-500">{a.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function PatientInformationStep() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <BasicInformationCard />
        <IdentificationCard />
        <InitialVisitCard />
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <PatientPhotoCard />
        <QuickActionsCard actions={STEP1_QUICK_ACTIONS} />
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 2 — Contact & Address
   ========================================================================= */

const REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "Sidama",
  "SNNPR",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Dire Dawa",
];

function ContactDetailsCard() {
  return (
    <Card title="Contact Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField
            label="Primary Phone Number"
            required
            defaultValue="0911 234 567"
            icon={Phone}
          />
          <TextField label="Alternate Phone Number" placeholder="Optional" icon={Phone} />
          <TextField
            label="Email Address"
            placeholder="patient@example.com"
            icon={Mail}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Preferred Contact Method"
            required
            defaultValue="SMS"
            options={["SMS", "Phone Call", "WhatsApp", "Telegram", "Email"]}
          />
          <SelectField
            label="Preferred Contact Time"
            defaultValue="Any Time"
            options={["Any Time", "Morning", "Afternoon", "Evening"]}
          />
        </div>
      </div>
    </Card>
  );
}

function CurrentAddressCard() {
  return (
    <Card title="Current Residential Address">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectField label="Region" required defaultValue="Addis Ababa" options={REGIONS} />
          <TextField label="Zone / Sub-City" required defaultValue="Bole" />
          <TextField label="Woreda" required defaultValue="Woreda 03" />
          <TextField label="Kebele" required defaultValue="Kebele 12" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="House / Building Number" placeholder="e.g., House No. 245" />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <FieldLabel>Specific Address / Landmark</FieldLabel>
            <textarea
              rows={1}
              defaultValue="Near Bole Medhanialem Church, behind Sunshine Real Estate"
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function PermanentAddressCard() {
  const [sameAsCurrent, setSameAsCurrent] = useState(true);
  return (
    <Card title="Permanent / Origin Address">
      <div className="flex flex-col gap-4">
        <Checkbox
          checked={sameAsCurrent}
          onChange={() => setSameAsCurrent((v) => !v)}
          title="Same as current residential address"
          description="Uncheck if the patient's permanent home area differs (e.g., referred from another region)"
        />
        {!sameAsCurrent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <SelectField label="Region" defaultValue="Oromia" options={REGIONS} />
            <TextField label="Zone" defaultValue="East Shewa" />
            <TextField label="Woreda" defaultValue="Lume" />
            <TextField label="Kebele" defaultValue="Kebele 04" />
          </div>
        )}
      </div>
    </Card>
  );
}

function LocationActionsCard() {
  return (
    <Card title="Address Tools">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-teal-700 bg-teal-50">
            <LocateFixed size={17} strokeWidth={2} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900">Use Current GPS Location</span>
            <span className="text-xs text-gray-500">Auto-fill from device location</span>
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-teal-700 bg-teal-50">
            <Copy size={17} strokeWidth={2} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900">Copy to Permanent Address</span>
            <span className="text-xs text-gray-500">Mirror the current address fields</span>
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-amber-600 bg-amber-50">
            <Eraser size={17} strokeWidth={2} />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900">Clear Section</span>
            <span className="text-xs text-gray-500">Reset contact & address fields</span>
          </span>
        </button>
      </div>
    </Card>
  );
}

function ContactAddressStep() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <ContactDetailsCard />
        <CurrentAddressCard />
        <PermanentAddressCard />
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <LocationActionsCard />
        <Card title="Why We Ask">
          <ComplianceNote
            icon={MapPin}
            lines={[
              "Region, zone and woreda data feeds Ethiopia's",
              "catchment-area and MOH reporting requirements,",
              "and helps route referrals to the right facility.",
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 3 — Insurance & Next of Kin
   ========================================================================= */

type PaymentType = "Self-Pay" | "CBHI" | "Private Insurance" | "Corporate";

const PAYMENT_TYPES: { key: PaymentType; label: string; icon: LucideIcon }[] = [
  { key: "Self-Pay", label: "Self-Pay", icon: Wallet },
  { key: "CBHI", label: "CBHI", icon: HeartHandshake },
  { key: "Private Insurance", label: "Private Insurance", icon: ShieldCheck },
  { key: "Corporate", label: "Corporate / Employer", icon: Briefcase },
];

function PaymentTypeCard({
  value,
  onChange,
}: {
  value: PaymentType;
  onChange: (v: PaymentType) => void;
}) {
  return (
    <Card title="Payment & Coverage Type">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PAYMENT_TYPES.map((p) => (
          <OptionTile
            key={p.key}
            icon={p.icon}
            label={p.label}
            active={value === p.key}
            onClick={() => onChange(p.key)}
          />
        ))}
      </div>
    </Card>
  );
}

function CbhiDetailsCard() {
  return (
    <Card title="CBHI Membership Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Woreda Health Office" defaultValue="Bole Woreda Health Office" />
          <TextField label="Household ID Number" required defaultValue="HH-04-2381" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionInputField
            label="CBHI Membership / Card Number"
            defaultValue="CBHI-AA-119284"
            actionLabel="Verify"
            actionColor="teal"
          />
          <div className="flex flex-col gap-1">
            <FieldLabel>Verification Status</FieldLabel>
            <div className="h-[38px] flex items-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                <AlertTriangle size={12} strokeWidth={2.5} />
                Pending Verification
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Coverage Start Date" defaultValue="01/07/2025" icon={CalendarIcon} />
          <TextField label="Renewal Date" defaultValue="30/06/2026" icon={CalendarIcon} />
        </div>
      </div>
    </Card>
  );
}

function PrivateInsuranceCard() {
  return (
    <Card title="Private Insurance Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Insurance Provider"
            required
            defaultValue="Nyala Insurance S.C."
            options={[
              "Nyala Insurance S.C.",
              "Nile Insurance S.C.",
              "Awash Insurance S.C.",
              "Ethiopian Insurance Corporation",
              "Other",
            ]}
          />
          <ActionInputField
            label="Policy / Membership Number"
            defaultValue="NYL-2026-88410"
            actionLabel="Verify"
            actionColor="teal"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Coverage Start Date" defaultValue="15/01/2026" icon={CalendarIcon} />
          <TextField label="Coverage Expiry Date" defaultValue="14/01/2027" icon={CalendarIcon} />
          <SelectField
            label="Co-Payment"
            defaultValue="20%"
            options={["0%", "10%", "20%", "30%", "50%"]}
          />
        </div>
      </div>
    </Card>
  );
}

function CorporateDetailsCard() {
  return (
    <Card title="Corporate / Employer Details">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Employer / Company Name" defaultValue="Ethio Telecom" />
          <TextField label="Employee ID" defaultValue="ET-EMP-55291" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="HR Contact Phone" defaultValue="0116 62 30 00" icon={Phone} />
          <TextField label="Coverage Start Date" defaultValue="01/01/2026" icon={CalendarIcon} />
          <TextField label="Coverage Expiry Date" defaultValue="31/12/2026" icon={CalendarIcon} />
        </div>
      </div>
    </Card>
  );
}

function SelfPayNoticeCard() {
  return (
    <Card>
      <SectionIntro
        icon={Wallet}
        title="Self-Pay Patient"
        blurb="No insurance details are required. The patient will be billed directly for services at the point of care."
      />
    </Card>
  );
}

function NextOfKinCard({
  title,
  removable,
  onRemove,
  defaults,
}: {
  title: string;
  removable?: boolean;
  onRemove?: () => void;
  defaults?: { name: string; relationship: string; phone: string };
}) {
  return (
    <Card title={title}>
      {removable && (
        <div className="flex justify-end -mt-8 mb-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField label="Full Name" required defaultValue={defaults?.name} />
          <SelectField
            label="Relationship"
            required
            defaultValue={defaults?.relationship ?? "Spouse"}
            options={["Spouse", "Parent", "Sibling", "Child", "Guardian", "Friend", "Other"]}
          />
          <TextField
            label="Phone Number"
            required
            defaultValue={defaults?.phone}
            icon={Phone}
          />
        </div>
        <Checkbox
          checked
          onChange={() => {}}
          title="Address same as patient"
          description="Uncheck to record a different address for this contact"
        />
      </div>
    </Card>
  );
}

function InsuranceCoverageSummaryCard({ paymentType }: { paymentType: PaymentType }) {
  const meta: Record<PaymentType, { icon: LucideIcon; text: string; style: string }> = {
    "Self-Pay": {
      icon: Wallet,
      text: "Billed directly at point of service. No coverage verification needed.",
      style: "bg-gray-50 text-gray-700",
    },
    CBHI: {
      icon: HeartHandshake,
      text: "Community-Based Health Insurance — verify household membership before billing.",
      style: "bg-emerald-50 text-emerald-700",
    },
    "Private Insurance": {
      icon: ShieldCheck,
      text: "Private policy — confirm active coverage and co-payment before service.",
      style: "bg-blue-50 text-blue-700",
    },
    Corporate: {
      icon: Briefcase,
      text: "Employer-sponsored coverage — confirm employment status if unverified.",
      style: "bg-violet-50 text-violet-700",
    },
  };
  const m = meta[paymentType];
  const Icon = m.icon;
  return (
    <Card title="Coverage Summary">
      <div className="flex flex-col gap-3">
        <span
          className={`inline-flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 rounded-full ${m.style}`}
        >
          <Icon size={13} strokeWidth={2.5} />
          {paymentType}
        </span>
        <p className="text-xs text-gray-500 leading-relaxed">{m.text}</p>
      </div>
    </Card>
  );
}

function InsuranceNextOfKinStep() {
  const [paymentType, setPaymentType] = useState<PaymentType>("CBHI");
  const [hasSecondaryContact, setHasSecondaryContact] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <PaymentTypeCard value={paymentType} onChange={setPaymentType} />
        {paymentType === "CBHI" && <CbhiDetailsCard />}
        {paymentType === "Private Insurance" && <PrivateInsuranceCard />}
        {paymentType === "Corporate" && <CorporateDetailsCard />}
        {paymentType === "Self-Pay" && <SelfPayNoticeCard />}

        <NextOfKinCard
          title="Next of Kin / Primary Emergency Contact"
          defaults={{ name: "Yonas Abebe Desta", relationship: "Spouse", phone: "0911 987 654" }}
        />
        {hasSecondaryContact ? (
          <NextOfKinCard
            title="Secondary Emergency Contact"
            removable
            onRemove={() => setHasSecondaryContact(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setHasSecondaryContact(true)}
            className="flex items-center justify-center gap-2 h-11 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/40 transition-colors"
          >
            <UserPlus size={16} strokeWidth={2} />
            Add Secondary Emergency Contact
          </button>
        )}
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <InsuranceCoverageSummaryCard paymentType={paymentType} />
        <QuickActionsCard
          actions={[
            {
              icon: ShieldCheck,
              title: "Verify Coverage",
              subtitle: "Re-check membership status",
              color: "text-teal-700 bg-teal-50",
            },
            {
              icon: UserPlus,
              title: "Add Another Contact",
              subtitle: "Record extra next of kin",
              color: "text-teal-700 bg-teal-50",
            },
            {
              icon: Eraser,
              title: "Clear Section",
              subtitle: "Reset insurance & contacts",
              color: "text-amber-600 bg-amber-50",
            },
          ]}
        />
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 4 — Additional Information
   ========================================================================= */

function HealthFlagsCard() {
  const [disability, setDisability] = useState("None");
  return (
    <Card title="Health & Safety Flags">
      <div className="flex flex-col gap-4">
        <TagsField
          label="Known Allergies"
          tags={["Penicillin", "Peanuts"]}
          placeholder="No known allergies"
        />
        <TagsField
          label="Chronic Conditions"
          tags={["Hypertension"]}
          placeholder="None reported"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Disability / Special Needs"
            defaultValue={disability}
            onChange={setDisability}
            options={[
              "None",
              "Visual Impairment",
              "Hearing Impairment",
              "Mobility Impairment",
              "Cognitive / Developmental",
              "Other",
            ]}
          />
          {disability !== "None" && (
            <TextField label="Support Notes" placeholder="e.g., requires wheelchair access" />
          )}
        </div>
      </div>
    </Card>
  );
}

function GuardianCard() {
  const [needsGuardian, setNeedsGuardian] = useState(false);
  return (
    <Card title="Guardian / Legal Representative">
      <div className="flex flex-col gap-4">
        <Checkbox
          checked={needsGuardian}
          onChange={() => setNeedsGuardian((v) => !v)}
          title="Patient requires a guardian or legal representative"
          description="For minors, incapacitated patients, or dependent adults"
        />
        {needsGuardian && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <TextField label="Guardian Full Name" />
            <SelectField
              label="Relationship to Patient"
              defaultValue="Parent"
              options={["Parent", "Sibling", "Legal Guardian", "Caregiver", "Other"]}
            />
            <TextField label="Phone Number" icon={Phone} />
            <TextField label="ID Number" />
          </div>
        )}
      </div>
    </Card>
  );
}

function CommunicationConsentCard() {
  const [channels, setChannels] = useState<Record<string, boolean>>({
    SMS: true,
    WhatsApp: false,
    Telegram: false,
    Email: false,
  });
  const [consents, setConsents] = useState({
    reminders: true,
    shareRecords: true,
    anonymizedReporting: false,
  });

  return (
    <Card title="Communication & Consent Preferences">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel icon={Bell}>Notification Channels</FieldLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(channels).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannels((c) => ({ ...c, [ch]: !c[ch] }))}
                className={`h-9 rounded-md text-xs font-semibold border transition-colors ${
                  channels[ch]
                    ? "bg-teal-700 border-teal-700 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1 border-t border-gray-100">
          <Checkbox
            checked={consents.reminders}
            onChange={() => setConsents((c) => ({ ...c, reminders: !c.reminders }))}
            title="Receive appointment reminders and health notifications"
            description="Sent via the channels selected above"
          />
          <Checkbox
            checked={consents.shareRecords}
            onChange={() => setConsents((c) => ({ ...c, shareRecords: !c.shareRecords }))}
            title="Share records with referring / receiving facilities"
            description="Supports continuity of care across facilities"
          />
          <Checkbox
            checked={consents.anonymizedReporting}
            onChange={() =>
              setConsents((c) => ({ ...c, anonymizedReporting: !c.anonymizedReporting }))
            }
            title="Allow anonymized data use for public health reporting"
            description="No personally identifying information is included"
          />
        </div>
      </div>
    </Card>
  );
}

function SpecialConsiderationsCard() {
  const [interpreterNeeded, setInterpreterNeeded] = useState(false);
  return (
    <Card title="Special Considerations">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Priority / Care Flag"
            defaultValue="Standard"
            options={[
              "Standard",
              "Elderly (60+)",
              "Pregnant",
              "Person with Disability",
              "Chronic / Critical Follow-Up",
              "VIP",
            ]}
          />
          <div className="flex flex-col gap-1">
            <FieldLabel>Interpreter</FieldLabel>
            <div className="h-[38px] flex items-center">
              <Checkbox
                checked={interpreterNeeded}
                onChange={() => setInterpreterNeeded((v) => !v)}
                title="Interpreter needed"
              />
            </div>
          </div>
        </div>
        {interpreterNeeded && (
          <SelectField
            label="Preferred Interpreter Language"
            defaultValue="Afaan Oromo"
            options={["Afaan Oromo", "Somali", "Tigrinya", "Sign Language", "Other"]}
          />
        )}
        <div className="flex flex-col gap-1">
          <FieldLabel>Additional Notes (Optional)</FieldLabel>
          <textarea
            rows={3}
            placeholder="Anything else the care team should know before this patient's first visit..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </Card>
  );
}

function RegistrationProgressCard({ currentStep }: { currentStep: number }) {
  return (
    <Card title="Registration Progress">
      <div className="flex flex-col gap-3">
        {STEPS.slice(0, LAST_BUILT_STEP).map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < currentStep;
          const active = stepNum === currentStep;
          return (
            <div key={label} className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done
                    ? "bg-emerald-100 text-emerald-700"
                    : active
                      ? "bg-teal-700 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : stepNum}
              </span>
              <span
                className={`text-sm ${active ? "font-semibold text-slate-900" : "text-gray-500"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AdditionalInformationStep({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <HealthFlagsCard />
        <GuardianCard />
        <CommunicationConsentCard />
        <SpecialConsiderationsCard />
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <RegistrationProgressCard currentStep={currentStep} />
        <QuickActionsCard
          actions={[
            {
              icon: FileSignature,
              title: "Attach Consent Form",
              subtitle: "Upload a signed document",
              color: "text-teal-700 bg-teal-50",
            },
            {
              icon: Accessibility,
              title: "Accessibility Options",
              subtitle: "Set assistive requirements",
              color: "text-teal-700 bg-teal-50",
            },
            {
              icon: Eraser,
              title: "Clear Section",
              subtitle: "Reset additional information",
              color: "text-amber-600 bg-amber-50",
            },
          ]}
        />
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 5 — Review & Confirm
   ========================================================================= */

/** A single "written on the line" field, styled after a paper intake form. */
function PaperField({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${wide ? "col-span-full" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 border-b border-dotted border-gray-300 pb-1.5 truncate">
        {value && value.length > 0 ? value : <span className="text-gray-300">&mdash;</span>}
      </span>
    </div>
  );
}

/** Small uppercase caption used to break a review section into paper-form sub-blocks. */
function PaperGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700/70">
      {children}
    </span>
  );
}

function ReviewSection({
  icon: Icon,
  title,
  stepNum,
  onEdit,
  children,
}: {
  icon: LucideIcon;
  title: string;
  stepNum: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-6 first:pt-0 border-b border-dashed border-gray-200 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Icon size={14} strokeWidth={2} />
          </span>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEdit(stepNum)}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <Pencil size={12} strokeWidth={2.2} />
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function PatientIdCard() {
  return (
    <div className="flex items-center gap-5 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="w-16 h-16 rounded-full ring-4 ring-teal-50 overflow-hidden shrink-0">
        <Avatar photo={PATIENT_PHOTO} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
          Patient Registration Summary
        </span>
        <h2 className="text-xl font-bold text-slate-900 truncate">Selamawit Abebe Desta</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-2.5 py-1">
            MRN-2026-000123
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 rounded-full px-2.5 py-1">
            Female &middot; 33 Years
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 rounded-full px-2.5 py-1">
            Blood Group O+
          </span>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-center gap-1.5 shrink-0 pl-5 border-l border-gray-100">
        <span className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
          <QrCode size={22} strokeWidth={1.6} />
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide whitespace-nowrap">
          Scan at Reception
        </span>
      </div>
    </div>
  );
}

function ReviewDocumentCard({ onEdit }: { onEdit: (step: number) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-6">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-semibold text-slate-900">Patient Intake Summary</h2>
        <p className="text-xs text-gray-500">
          Verify every section against the physical patient before completing registration.
        </p>
      </div>

      <ReviewSection icon={Users} title="Patient Information" stepNum={1} onEdit={onEdit}>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Identity</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="First Name" value="Selamawit" />
            <PaperField label="Middle Name" value="Abebe" />
            <PaperField label="Last Name" value="Desta" />
            <PaperField label="Gender" value="Female" />
            <PaperField label="Date of Birth" value="05/12/1992" />
            <PaperField label="Age" value="33 Years" />
            <PaperField label="Nationality" value="Ethiopian" />
            <PaperField label="Religion" value="Orthodox" />
            <PaperField label="Marital Status" value="Married" />
            <PaperField label="Occupation" value="Teacher" />
            <PaperField label="Preferred Language" value="Amharic" />
            <PaperField label="Blood Group" value="O+" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Identification</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="MRN" value="MRN-2026-000123" />
            <PaperField label="Fayda National ID" value="1001-2345-6789" />
            <PaperField label="ID Type" value="Ethiopian National ID" />
            <PaperField label="ID Number" value="1234567890123" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Initial Visit</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="Visit Type" value="Outpatient (OPD)" />
            <PaperField label="Visit Date" value="05/22/2026" />
            <PaperField label="Department" value="General Medicine" />
            <PaperField label="Referred From" value="Self-Referral" />
          </div>
        </div>
      </ReviewSection>

      <ReviewSection icon={MapPin} title="Contact & Address" stepNum={2} onEdit={onEdit}>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Contact Details</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="Primary Phone" value="0911 234 567" />
            <PaperField label="Alternate Phone" value="" />
            <PaperField label="Email Address" value="" />
            <PaperField label="Preferred Contact" value="SMS" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Current Residential Address</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="Region" value="Addis Ababa" />
            <PaperField label="Zone / Sub-City" value="Bole" />
            <PaperField label="Woreda" value="Woreda 03" />
            <PaperField label="Kebele" value="Kebele 12" />
            <PaperField
              label="Specific Address / Landmark"
              value="Near Bole Medhanialem Church, behind Sunshine Real Estate"
              wide
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-md px-3 py-2 w-fit">
          <ClipboardCheck size={13} strokeWidth={2.2} />
          Permanent address matches current residence
        </div>
      </ReviewSection>

      <ReviewSection icon={HeartHandshake} title="Insurance & Next of Kin" stepNum={3} onEdit={onEdit}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <PaperGroupLabel>Payment & Coverage</PaperGroupLabel>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              <HeartHandshake size={12} strokeWidth={2.5} />
              CBHI
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="Woreda Health Office" value="Bole Woreda Health Office" />
            <PaperField label="Household ID" value="HH-04-2381" />
            <PaperField label="Membership Number" value="CBHI-AA-119284" />
            <PaperField label="Verification Status" value="Pending Verification" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Next of Kin / Primary Emergency Contact</PaperGroupLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <PaperField label="Full Name" value="Yonas Abebe Desta" />
            <PaperField label="Relationship" value="Spouse" />
            <PaperField label="Phone Number" value="0911 987 654" />
            <PaperField label="Address" value="Same as patient" />
          </div>
        </div>
        <span className="text-xs text-gray-400 italic">No secondary emergency contact added</span>
      </ReviewSection>

      <ReviewSection icon={ClipboardCheck} title="Additional Information" stepNum={4} onEdit={onEdit}>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Health & Safety Flags</PaperGroupLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Known Allergies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Penicillin", "Peanuts"].map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Chronic Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                  Hypertension
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <PaperGroupLabel>Communication & Consent</PaperGroupLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Bell size={13} strokeWidth={2} className="text-gray-400" />
              Notifications via SMS
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Check size={13} strokeWidth={2.5} className="text-emerald-600" />
              Appointment reminders enabled
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Check size={13} strokeWidth={2.5} className="text-emerald-600" />
              Records may be shared for continuity of care
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-[13px] h-[13px] rounded-full border border-gray-300 shrink-0" />
              Anonymized reporting not consented
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
          <PaperField label="Disability / Special Needs" value="None" />
          <PaperField label="Guardian Required" value="No" />
          <PaperField label="Priority / Care Flag" value="Standard" />
          <PaperField label="Interpreter Needed" value="No" />
        </div>
      </ReviewSection>

      <div className="pt-6">
        <PaperGroupLabel>Declaration</PaperGroupLabel>
        <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">
          I hereby declare that the information captured above has been reviewed with the patient
          (or their guardian) and is accurate and complete to the best of my knowledge at the time
          of registration.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
          <div className="flex flex-col gap-1.5">
            <div className="h-10 flex items-end gap-2 border-b border-dotted border-gray-300">
              <PenLine size={14} strokeWidth={2} className="text-gray-300 mb-1" />
            </div>
            <span className="text-xs font-medium text-slate-700">Patient / Guardian Signature</span>
            <span className="text-[11px] text-gray-400">Date: 05/22/2026</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-10 flex items-end gap-2 border-b border-dotted border-gray-300">
              <PenLine size={14} strokeWidth={2} className="text-gray-300 mb-1" />
            </div>
            <span className="text-xs font-medium text-slate-700">Registered By (Reception Staff)</span>
            <span className="text-[11px] text-gray-400">Date: 05/22/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationGateCard({
  confirmed,
  onToggle,
}: {
  confirmed: boolean;
  onToggle: () => void;
}) {
  const StatusIcon = confirmed ? CheckCircle2 : AlertTriangle;
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
        confirmed ? "bg-emerald-50/60 border-emerald-100" : "bg-amber-50/60 border-amber-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <StatusIcon
          size={15}
          strokeWidth={2.2}
          className={confirmed ? "text-emerald-600" : "text-amber-600"}
        />
        <span className="text-sm font-bold text-slate-900">
          {confirmed ? "Ready to Submit" : "Final Confirmation Required"}
        </span>
      </div>
      <Checkbox
        checked={confirmed}
        onChange={onToggle}
        title="I confirm this information has been verified with the patient"
        description="Required before the MRN record can be finalized"
      />
    </div>
  );
}

/** Standalone print stylesheet — the print window has no access to the app's
 *  Tailwind build, so the printable document is fully self-contained CSS that
 *  mirrors the on-screen paper-form styling (dotted field lines, group
 *  captions, section dividers, badges). */
const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 28px 36px; font-size: 13px; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand .mark { width: 32px; height: 32px; border: 2px solid #0f766e; border-radius: 50%; }
  .brand .name { font-size: 15px; font-weight: 700; color: #0f766e; }
  .brand .addr { font-size: 11px; color: #64748b; margin-top: 1px; }
  .doc-meta { text-align: right; }
  .doc-meta .title { font-size: 13px; font-weight: 700; }
  .doc-meta .sub { font-size: 10.5px; color: #64748b; margin-top: 3px; }

  .id-card { display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; }
  .id-card img { width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 3px solid #ccfbf1; flex-shrink: 0; }
  .id-card .tag { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #0f766e; font-weight: 700; }
  .id-card .name { font-size: 16px; font-weight: 700; margin: 2px 0 7px; }
  .id-card .badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge { font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
  .badge.mrn { background: #f0fdfa; color: #0f766e; }
  .badge.meta { background: #f1f5f9; color: #475569; }

  .section { margin-bottom: 20px; page-break-inside: avoid; }
  .section-head { display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; }
  .section-head .dot { width: 20px; height: 20px; border-radius: 50%; background: #f0fdfa; color: #0f766e; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .section-head h2 { font-size: 12.5px; font-weight: 700; margin: 0; }

  .group-label { display: block; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #0f766e; opacity: .75; margin: 14px 0 9px; }
  .group-label.first { margin-top: 0; }

  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 16px; }
  .grid.two { grid-template-columns: repeat(2, 1fr); }
  .field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .field.wide { grid-column: 1 / -1; }
  .field label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .field span { font-size: 11.5px; font-weight: 500; border-bottom: 1px dotted #cbd5e1; padding-bottom: 4px; color: #1e293b; min-height: 14px; }
  .field span.empty { color: #cbd5e1; }

  .note { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; color: #047857; background: #ecfdf5; border-radius: 6px; padding: 5px 10px; margin-top: 10px; }
  .note.muted { color: #94a3b8; background: transparent; font-style: italic; padding-left: 0; margin-top: 8px; }

  .chip-row { display: flex; flex-direction: column; gap: 4px; }
  .chip-row label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; border: 1px solid; }
  .chip.red { color: #b91c1c; background: #fef2f2; border-color: #fee2e2; }
  .chip.amber { color: #b45309; background: #fffbeb; border-color: #fde68a; }

  .checklist { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 14px; margin-top: 4px; }
  .checklist .item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #334155; }
  .checklist .item.off { color: #94a3b8; }
  .tick { width: 12px; height: 12px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; flex-shrink: 0; }
  .tick.on { background: #d1fae5; color: #047857; }
  .tick.off { border: 1px solid #cbd5e1; }

  .declaration { margin-top: 24px; page-break-inside: avoid; }
  .declaration p { font-size: 11px; font-style: italic; color: #475569; line-height: 1.6; margin: 8px 0 0; }
  .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 28px; }
  .sign-line { border-bottom: 1px dotted #94a3b8; height: 30px; }
  .sign-label { font-size: 10.5px; font-weight: 600; margin-top: 6px; }
  .sign-date { font-size: 9.5px; color: #94a3b8; }

  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }

  @page { margin: 14mm; }
`;

function printField(label: string, value: string, wide?: boolean) {
  const isEmpty = !value;
  return `
    <div class="field${wide ? " wide" : ""}">
      <label>${label}</label>
      <span class="${isEmpty ? "empty" : ""}">${isEmpty ? "&mdash;" : value}</span>
    </div>`;
}

function printGroupLabel(text: string, first?: boolean) {
  return `<span class="group-label${first ? " first" : ""}">${text}</span>`;
}

/** Builds the standalone printable document — mirrors ReviewDocumentCard's
 *  on-screen sections and field values 1:1 so the printed page matches what
 *  reception just reviewed. */
function buildPrintableSummaryHtml() {
  const printedOn = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Patient Registration Summary - Selamawit Abebe Desta</title>
<style>${PRINT_STYLES}</style>
</head>
<body>

  <div class="letterhead">
    <div class="brand">
      <div class="mark"></div>
      <div>
        <div class="name">Fiker Selam General Hospital</div>
        <div class="addr">Addis Ababa, Ethiopia</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="title">Patient Registration Summary</div>
      <div class="sub">Printed on ${printedOn}</div>
    </div>
  </div>

  <div class="id-card">
    <img src="${PATIENT_PHOTO}" alt="Patient photo" />
    <div>
      <div class="tag">Patient Registration Summary</div>
      <div class="name">Selamawit Abebe Desta</div>
      <div class="badges">
        <span class="badge mrn">MRN-2026-000123</span>
        <span class="badge meta">Female &middot; 33 Years</span>
        <span class="badge meta">Blood Group O+</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-head"><span class="dot">1</span><h2>Patient Information</h2></div>
    ${printGroupLabel("Identity", true)}
    <div class="grid">
      ${printField("First Name", "Selamawit")}
      ${printField("Middle Name", "Abebe")}
      ${printField("Last Name", "Desta")}
      ${printField("Gender", "Female")}
      ${printField("Date of Birth", "05/12/1992")}
      ${printField("Age", "33 Years")}
      ${printField("Nationality", "Ethiopian")}
      ${printField("Religion", "Orthodox")}
      ${printField("Marital Status", "Married")}
      ${printField("Occupation", "Teacher")}
      ${printField("Preferred Language", "Amharic")}
      ${printField("Blood Group", "O+")}
    </div>
    ${printGroupLabel("Identification")}
    <div class="grid">
      ${printField("MRN", "MRN-2026-000123")}
      ${printField("Fayda National ID", "1001-2345-6789")}
      ${printField("ID Type", "Ethiopian National ID")}
      ${printField("ID Number", "1234567890123")}
    </div>
    ${printGroupLabel("Initial Visit")}
    <div class="grid">
      ${printField("Visit Type", "Outpatient (OPD)")}
      ${printField("Visit Date", "05/22/2026")}
      ${printField("Department", "General Medicine")}
      ${printField("Referred From", "Self-Referral")}
    </div>
  </div>

  <div class="section">
    <div class="section-head"><span class="dot">2</span><h2>Contact &amp; Address</h2></div>
    ${printGroupLabel("Contact Details", true)}
    <div class="grid">
      ${printField("Primary Phone", "0911 234 567")}
      ${printField("Alternate Phone", "")}
      ${printField("Email Address", "")}
      ${printField("Preferred Contact", "SMS")}
    </div>
    ${printGroupLabel("Current Residential Address")}
    <div class="grid">
      ${printField("Region", "Addis Ababa")}
      ${printField("Zone / Sub-City", "Bole")}
      ${printField("Woreda", "Woreda 03")}
      ${printField("Kebele", "Kebele 12")}
      ${printField("Specific Address / Landmark", "Near Bole Medhanialem Church, behind Sunshine Real Estate", true)}
    </div>
    <span class="note">&#10003; Permanent address matches current residence</span>
  </div>

  <div class="section">
    <div class="section-head"><span class="dot">3</span><h2>Insurance &amp; Next of Kin</h2></div>
    ${printGroupLabel("Payment & Coverage &mdash; CBHI", true)}
    <div class="grid">
      ${printField("Woreda Health Office", "Bole Woreda Health Office")}
      ${printField("Household ID", "HH-04-2381")}
      ${printField("Membership Number", "CBHI-AA-119284")}
      ${printField("Verification Status", "Pending Verification")}
    </div>
    ${printGroupLabel("Next of Kin / Primary Emergency Contact")}
    <div class="grid">
      ${printField("Full Name", "Yonas Abebe Desta")}
      ${printField("Relationship", "Spouse")}
      ${printField("Phone Number", "0911 987 654")}
      ${printField("Address", "Same as patient")}
    </div>
    <span class="note muted">No secondary emergency contact added</span>
  </div>

  <div class="section">
    <div class="section-head"><span class="dot">4</span><h2>Additional Information</h2></div>
    ${printGroupLabel("Health & Safety Flags", true)}
    <div class="grid two">
      <div class="chip-row">
        <label>Known Allergies</label>
        <div class="chips">
          <span class="chip red">Penicillin</span>
          <span class="chip red">Peanuts</span>
        </div>
      </div>
      <div class="chip-row">
        <label>Chronic Conditions</label>
        <div class="chips">
          <span class="chip amber">Hypertension</span>
        </div>
      </div>
    </div>
    ${printGroupLabel("Communication & Consent")}
    <div class="checklist">
      <span class="item"><span class="tick on">&#10003;</span> Notifications via SMS</span>
      <span class="item"><span class="tick on">&#10003;</span> Appointment reminders enabled</span>
      <span class="item"><span class="tick on">&#10003;</span> Records may be shared for continuity of care</span>
      <span class="item off"><span class="tick off"></span> Anonymized reporting not consented</span>
    </div>
    <div class="grid" style="margin-top: 14px;">
      ${printField("Disability / Special Needs", "None")}
      ${printField("Guardian Required", "No")}
      ${printField("Priority / Care Flag", "Standard")}
      ${printField("Interpreter Needed", "No")}
    </div>
  </div>

  <div class="declaration">
    ${printGroupLabel("Declaration", true)}
    <p>I hereby declare that the information captured above has been reviewed with the patient
    (or their guardian) and is accurate and complete to the best of my knowledge at the time of
    registration.</p>
    <div class="sign-grid">
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">Patient / Guardian Signature</div>
        <div class="sign-date">Date: 05/22/2026</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">Registered By (Reception Staff)</div>
        <div class="sign-date">Date: 05/22/2026</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Fiker Selam General Hospital &middot; Patient Management System</span>
    <span>MRN-2026-000123</span>
  </div>

</body>
</html>`;
}

/** Opens the printable summary in a new window and triggers the browser
 *  print dialog once the document (and patient photo) has fully loaded. */
function printPatientSummary() {
  const printWindow = window.open("", "_blank", "width=920,height=1040");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(buildPrintableSummaryHtml());
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

function DocumentActionsCard() {
  const actions: { icon: LucideIcon; title: string; subtitle: string; onClick?: () => void }[] = [
    {
      icon: Printer,
      title: "Print Summary",
      subtitle: "Full intake form, ready to sign",
      onClick: printPatientSummary,
    },
    { icon: CreditCard, title: "Print Patient ID Card", subtitle: "Barcode + MRN card" },
    { icon: Download, title: "Download as PDF", subtitle: "Save a copy to file" },
  ];
  return (
    <Card title="Document Actions">
      <div className="flex flex-col gap-1">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              type="button"
              onClick={a.onClick}
              className="flex items-center gap-3 w-full p-2 -mx-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-teal-700 bg-teal-50">
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900">{a.title}</span>
                <span className="text-xs text-gray-500">{a.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function ReviewConfirmStep({
  currentStep,
  onEdit,
  confirmed,
  onToggleConfirmed,
}: {
  currentStep: number;
  onEdit: (step: number) => void;
  confirmed: boolean;
  onToggleConfirmed: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <PatientIdCard />
        <ReviewDocumentCard onEdit={onEdit} />
      </div>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <ConfirmationGateCard confirmed={confirmed} onToggle={onToggleConfirmed} />
        <RegistrationProgressCard currentStep={currentStep} />
        <DocumentActionsCard />
      </div>
    </div>
  );
}

/* =========================================================================
   Success state
   ========================================================================= */

function RegistrationSuccess({ onRegisterAnother }: { onRegisterAnother: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-14">
      <span className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 size={32} strokeWidth={1.8} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-slate-900">Registration Submitted</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Selamawit Abebe Desta has been registered with MRN{" "}
          <span className="font-semibold text-slate-700">MRN-2026-000123</span>. A patient ID card
          is ready to print at the reception desk.
        </p>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <Link
          href="/dashboard"
          className="h-10 px-5 inline-flex items-center border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={onRegisterAnother}
          className="h-10 px-5 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors"
        >
          <RotateCcw size={15} strokeWidth={2.5} />
          Register Another Patient
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   Page
   ========================================================================= */

export default function PatientRegistrationForm() {
  const [step, setStep] = useState(1);
  const [maxVisited, setMaxVisited] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const isReviewStep = step === LAST_BUILT_STEP;
  const canAdvance = !isReviewStep || confirmed;

  const goToStep = (n: number) => {
    if (n <= maxVisited) setStep(n);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const goNext = () => {
    if (!canAdvance) return;
    if (step < LAST_BUILT_STEP) {
      const next = step + 1;
      setStep(next);
      setMaxVisited((m) => Math.max(m, next));
    } else {
      setSubmitted(true);
    }
  };

  const registerAnother = () => {
    setSubmitted(false);
    setStep(1);
    setMaxVisited(1);
    setConfirmed(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
      <ModulePageHeader
        title="Patient Registration"
        breadcrumb="Patient Management > Patient Registration"
      />

      {!submitted && (
        <Stepper
          steps={STEPS}
          activeStep={step}
          onStepClick={goToStep}
          maxStep={Math.min(maxVisited, LAST_BUILT_STEP)}
        />
      )}

      {submitted ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <RegistrationSuccess onRegisterAnother={registerAnother} />
        </div>
      ) : (
        <>
          {step === 1 && <PatientInformationStep />}
          {step === 2 && <ContactAddressStep />}
          {step === 3 && <InsuranceNextOfKinStep />}
          {step === 4 && <AdditionalInformationStep currentStep={step} />}
          {step === 5 && (
            <ReviewConfirmStep
              currentStep={step}
              onEdit={goToStep}
              confirmed={confirmed}
              onToggleConfirmed={() => setConfirmed((v) => !v)}
            />
          )}

          <div className="mt-2 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-between items-center">
            <Link
              href="/dashboard"
              className="h-10 px-5 inline-flex items-center border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="h-10 px-5 inline-flex items-center gap-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  Back
                </button>
              )}
              <button
                type="button"
                className="h-10 px-5 inline-flex items-center border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                title={!canAdvance ? "Confirm the declaration above to submit" : undefined}
                className={`h-10 px-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-white transition-colors ${
                  canAdvance
                    ? "bg-teal-700 hover:bg-teal-800"
                    : "bg-teal-700/40 cursor-not-allowed"
                }`}
              >
                {isReviewStep ? "Submit Registration" : "Next Step"}
                {isReviewStep ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <ArrowRight size={16} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
