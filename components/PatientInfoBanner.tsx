import {
  Calendar as CalendarIcon,
  Droplet,
  BadgeCheck,
  User,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";

const PATIENT_PHOTO =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop&crop=faces";

function BannerDivider() {
  return <span className="h-12 w-px bg-gray-100 shrink-0" />;
}

function DataColumn({
  label,
  labelIcon: LabelIcon,
  icon: Icon,
  iconClass,
  value,
  sub,
}: {
  label: string;
  labelIcon?: LucideIcon;
  icon?: LucideIcon;
  iconClass?: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center min-w-0">
      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium whitespace-nowrap">
        {LabelIcon && <LabelIcon className="w-3 h-3" strokeWidth={2} />}
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mt-1 whitespace-nowrap">
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconClass ?? ""}`} strokeWidth={1.75} />}
        {value}
      </span>
      {sub && (
        <span className="text-[11px] font-medium text-gray-500 mt-0.5 whitespace-nowrap">{sub}</span>
      )}
    </div>
  );
}

/** Shared dense patient-context banner reused across patient-record sub-pages. */
export default function PatientInfoBanner() {
  return (
    <div className="flex flex-row items-center bg-white border border-gray-100 rounded-xl py-3 px-5 shadow-sm w-full gap-5 overflow-x-auto">
      {/* Column 1: Patient Profile */}
      <div className="flex flex-row items-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PATIENT_PHOTO}
          alt="Abebe Kebede"
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex flex-col ml-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Abebe Kebede</span>
            <span
              className="w-4 h-4 flex items-center justify-center text-blue-500 text-sm leading-none"
              aria-hidden
            >
              ♂
            </span>
          </div>
          <span className="inline-flex bg-blue-50 text-blue-600 text-[11px] font-medium px-2 py-0.5 rounded-md mt-0.5 mb-1 w-fit whitespace-nowrap">
            MRN: 2026-000241
          </span>
          <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
            Phone: +251 91 123 4567
          </span>
        </div>
      </div>

      <BannerDivider />

      {/* Column 2: Age / DOB */}
      <DataColumn
        icon={CalendarIcon}
        iconClass="text-gray-600"
        label="Age / DOB"
        value="45 Years"
        sub="Jan 12, 1981"
      />

      <BannerDivider />

      {/* Column 3: Blood Group */}
      <DataColumn icon={Droplet} iconClass="text-red-500" label="Blood Group" value="O+" />

      <BannerDivider />

      {/* Column 4: Insurance */}
      <DataColumn
        labelIcon={Shield}
        icon={BadgeCheck}
        iconClass="text-gray-600"
        label="Insurance"
        value="CBHI - Valid"
        sub="ID: CBHI-889221"
      />

      <BannerDivider />

      {/* Column 5: Current Visit */}
      <DataColumn label="Current Visit" value="OPD-2026-001245" sub="May 22, 2026" />

      <BannerDivider />

      {/* Column 6: Attending Doctor */}
      <DataColumn
        icon={User}
        iconClass="text-gray-600"
        label="Attending Doctor"
        value="Dr. Hana M."
        sub="General Medicine"
      />

      <BannerDivider />

      {/* Column 7: Ward / Department */}
      <DataColumn
        icon={Settings}
        iconClass="text-gray-600"
        label="Ward / Department"
        value="OPD"
        sub="General Medicine"
      />
    </div>
  );
}
