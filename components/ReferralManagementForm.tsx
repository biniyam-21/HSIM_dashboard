"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Paperclip,
  CalendarPlus,
  Check,
  X,
  Building2,
  Stethoscope,
  Clock3,
} from "lucide-react";
import ModulePageHeader from "@/components/ModulePageHeader";
import IconUnderlineTabs from "@/components/IconUnderlineTabs";
import { Card, FieldLabel, TextField, SelectField, Avatar, inputClass } from "@/components/FormFields";
import { PriorityBadge } from "@/components/AppointmentBadges";
import { HOSPITALS, DOCTORS, PATIENTS, type Priority } from "@/lib/appointmentsQueueData";

type Referral = {
  id: string;
  patient: string;
  initials: string;
  fromFacility: string;
  toFacility: string;
  provider: string;
  reason: string;
  priority: Priority;
  direction: "Incoming" | "Outgoing";
  stage: "Requested" | "Accepted" | "Scheduled" | "Completed" | "Declined";
  attachments: number;
};

const REFERRALS: Referral[] = [
  { id: "REF-2026-0091", patient: "Yonas Tadesse", initials: "YT", fromFacility: "Hayat Hospital", toFacility: "Fiker Selam General Hospital", provider: "Dr. Samuel Tadesse", reason: "Suspected fracture — needs orthopedic imaging & assessment", priority: "Urgent", direction: "Incoming", stage: "Requested", attachments: 2 },
  { id: "REF-2026-0090", patient: "Meron Alemu", initials: "MA", fromFacility: "St. Paul's Hospital", toFacility: "Fiker Selam General Hospital", provider: "Dr. Ruth Girma", reason: "High-risk pregnancy follow-up", priority: "High Risk", direction: "Incoming", stage: "Accepted", attachments: 4 },
  { id: "REF-2026-0088", patient: "Bereket Haile", initials: "BH", fromFacility: "Fiker Selam General Hospital", toFacility: "Tikur Anbessa Specialized Hospital", provider: "Dr. Getachew Wolde", reason: "Neurology consult for recurrent seizures", priority: "Emergency", direction: "Outgoing", stage: "Scheduled", attachments: 3 },
  { id: "REF-2026-0085", patient: "Frehiwot Solomon", initials: "FS", fromFacility: "Fiker Selam General Hospital", toFacility: "Tikur Anbessa Specialized Hospital", provider: "Dr. Yared Mekonnen", reason: "Cardiology work-up for arrhythmia", priority: "Urgent", direction: "Outgoing", stage: "Completed", attachments: 5 },
  { id: "REF-2026-0082", patient: "Kalkidan Girma", initials: "KG", fromFacility: "Hayat Hospital", toFacility: "Fiker Selam General Hospital", provider: "Dr. Getachew Wolde", reason: "Chronic migraine management", priority: "Routine", direction: "Incoming", stage: "Declined", attachments: 1 },
];

const STAGE_STYLES: Record<Referral["stage"], string> = {
  Requested: "bg-sky-50 text-sky-700",
  Accepted: "bg-teal-50 text-teal-700",
  Scheduled: "bg-indigo-50 text-indigo-700",
  Completed: "bg-gray-100 text-gray-600",
  Declined: "bg-red-50 text-red-600",
};

const STAGES: Referral["stage"][] = ["Requested", "Accepted", "Scheduled", "Completed"];

function ReferralStatusTimeline({ stage }: { stage: Referral["stage"] }) {
  if (stage === "Declined") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <X size={15} strokeWidth={2.2} />
        Referral Declined
      </div>
    );
  }
  const idx = STAGES.indexOf(stage);
  return (
    <div className="flex items-center w-full">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i <= idx ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < idx ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-[11px] whitespace-nowrap ${i <= idx ? "text-slate-700 font-medium" : "text-gray-400"}`}>{s}</span>
          </div>
          {i !== STAGES.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${i < idx ? "bg-teal-700" : "bg-gray-100"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ReferralCard({ r, onSelect, selected }: { r: Referral; onSelect: () => void; selected: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex flex-col gap-3 p-4 rounded-lg border transition-colors ${
        selected ? "border-teal-700 bg-teal-50/40" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar initials={r.initials} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">{r.patient}</span>
            <span className="text-xs font-mono text-gray-400">{r.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={r.priority} />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STAGE_STYLES[r.stage]}`}>{r.stage}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Building2 size={13} strokeWidth={2} className="text-gray-400" />
        <span className="truncate">{r.fromFacility}</span>
        <span className="text-gray-300">&rarr;</span>
        <span className="truncate">{r.toFacility}</span>
      </div>
      <p className="text-sm text-gray-700 leading-snug">{r.reason}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Stethoscope size={13} strokeWidth={2} />
          {r.provider}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Paperclip size={13} strokeWidth={2} />
          {r.attachments} attachment{r.attachments !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
}

function NewReferralCard() {
  return (
    <Card title="Create Outgoing Referral">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Patient" required options={PATIENTS.map((p) => `${p.name} (${p.mrn})`)} placeholder="Search patient" />
        <SelectField label="Receiving Facility" required options={HOSPITALS.map((h) => h.name)} placeholder="Select facility" />
        <SelectField label="Referring Provider" required options={DOCTORS.map((d) => d.name)} placeholder="Select provider" />
        <SelectField label="Priority" required options={["Routine", "Urgent", "Emergency", "VIP", "High Risk"]} placeholder="Select priority" />
      </div>
      <div className="mt-4">
        <FieldLabel required>Reason for Referral</FieldLabel>
        <textarea rows={2} placeholder="Clinical reason for referral" className={`${inputClass} mt-1 resize-none`} />
      </div>
      <div className="mt-4">
        <FieldLabel>Clinical Notes</FieldLabel>
        <textarea rows={2} placeholder="Relevant history, findings, or instructions" className={`${inputClass} mt-1 resize-none`} />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:underline">
          <Paperclip size={15} strokeWidth={2} />
          Attach Clinical Documents
        </button>
        <button type="button" className="h-10 px-5 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
          <ArrowUpFromLine size={15} strokeWidth={2.2} />
          Send Referral
        </button>
      </div>
    </Card>
  );
}

function AnalyticsCard() {
  const stats = [
    { label: "Total Referrals (30d)", value: "142" },
    { label: "Accepted Rate", value: "88%" },
    { label: "Avg Turnaround", value: "1.8 days" },
    { label: "Pending Response", value: "6" },
  ];
  return (
    <Card title="Referral Analytics">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</span>
            <span className="text-xl font-heading font-semibold text-slate-900">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ReferralManagementForm() {
  const [direction, setDirection] = useState<"Incoming" | "Outgoing">("Incoming");
  const [selectedId, setSelectedId] = useState<string>(REFERRALS[0].id);

  const filtered = useMemo(() => REFERRALS.filter((r) => r.direction === direction), [direction]);
  const selected = REFERRALS.find((r) => r.id === selectedId) ?? filtered[0];

  return (
    <div className="p-4 sm:p-6 max-w-[1700px] mx-auto flex flex-col gap-4">
      <ModulePageHeader title="Referral Management" breadcrumb="Appointments & Queue > Referral Management" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <IconUnderlineTabs
              tabs={[
                { icon: ArrowDownToLine, label: "Incoming" },
                { icon: ArrowUpFromLine, label: "Outgoing" },
              ]}
              active={direction}
              onChange={(v) => setDirection(v as "Incoming" | "Outgoing")}
            />
            <div className="flex flex-col gap-3 mt-4">
              {filtered.map((r) => (
                <ReferralCard key={r.id} r={r} selected={r.id === selected?.id} onSelect={() => setSelectedId(r.id)} />
              ))}
            </div>
          </div>

          {selected && (
            <Card title="Referral Status Timeline">
              <div className="flex flex-col gap-4">
                <ReferralStatusTimeline stage={selected.stage} />
                {selected.direction === "Incoming" && selected.stage === "Requested" && (
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button type="button" className="h-9 px-4 inline-flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold transition-colors">
                      <X size={14} strokeWidth={2.2} />
                      Decline
                    </button>
                    <button type="button" className="h-9 px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
                      <Check size={14} strokeWidth={2.2} />
                      Accept Referral
                    </button>
                  </div>
                )}
                {selected.stage === "Accepted" && (
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button type="button" className="h-9 px-4 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 rounded-md text-sm font-semibold text-white transition-colors">
                      <CalendarPlus size={14} strokeWidth={2.2} />
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}

          <NewReferralCard />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <AnalyticsCard />
          <Card title="Turnaround by Facility">
            <div className="flex flex-col gap-3">
              {HOSPITALS.map((h, i) => (
                <div key={h.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-700 truncate">{h.name}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 shrink-0">
                    <Clock3 size={12} strokeWidth={2} />
                    {[1.2, 2.4, 0.9, 3.1][i] ?? 1.5}d
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
