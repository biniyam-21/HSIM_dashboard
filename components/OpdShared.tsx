"use client";

import { ChevronDown, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================================
   Shared design-system primitives for the OPD Management module.
   Used by OPDRegistrationForm, TriageVitalsForm, ConsultationForm,
   ClinicalNotesForm, PrescriptionForm, InvestigationOrdersForm, and
   FollowUpSchedulingForm — single source of truth so a style change (like the
   sticky footer) only has to happen in one place.
   ========================================================================== */

export const PATIENT_PHOTO =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&h=200&fit=crop&crop=faces";

export const inputBase =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow";

export const labelClass = "text-xs font-bold text-gray-600";

/* ---------- form primitives ---------- */

export function Label({ children }: { children: React.ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} pr-8 appearance-none bg-white cursor-pointer ${!value ? "text-gray-400" : ""}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o} className="text-gray-800">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={15} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function MicTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputBase} resize-none pb-7`}
      />
      <button type="button" className="absolute right-2.5 bottom-2 text-gray-400 hover:text-teal-600 transition-colors" aria-label="Dictate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v4" />
        </svg>
      </button>
    </div>
  );
}

export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform"
        style={{ width: 18, height: 18, transform: checked ? "translateX(18px)" : "translateX(0)" }}
      />
    </button>
  );
}

export function CheckboxRow({ label, checked, onToggle }: { label: React.ReactNode; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2.5 py-1 select-none text-left">
      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-emerald-600" : "border border-gray-300 bg-white"}`}>
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className="text-sm text-slate-700">{label}</span>
    </button>
  );
}

/* ---------- chips & badges ---------- */

export type ChipTone = "slate" | "teal" | "emerald" | "red" | "amber" | "blue";

const CHIP_TONE_CLASS: Record<ChipTone, string> = {
  slate: "bg-gray-100 text-gray-600",
  teal: "bg-teal-50 text-teal-700",
  emerald: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
};

export function Chip({
  children,
  tone = "slate",
  removable,
  onRemove,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  removable?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${CHIP_TONE_CLASS[tone]}`}>
      {children}
      {removable && (
        <button type="button" onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
          <X size={11} strokeWidth={2.75} />
        </button>
      )}
    </span>
  );
}

export type BadgeTone = "emerald" | "amber" | "red" | "slate" | "blue";

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  slate: "bg-gray-100 text-gray-500",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone: BadgeTone }) {
  return <span className={`text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2 py-0.5 ${BADGE_TONE_CLASS[tone]}`}>{children}</span>;
}

/* ---------- cards ---------- */

export function Card({
  title,
  icon: Icon,
  iconTone = "text-gray-400",
  children,
  action,
  subtitle,
  className = "",
}: {
  title: string;
  icon: LucideIcon;
  iconTone?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={16} strokeWidth={2.25} className={iconTone} />
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        </div>
        {action}
      </div>
      {subtitle && <p className="text-xs text-gray-400 -mt-3">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ---------- patient-facts / key-value rows ---------- */

export function HeaderFact({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`text-[13.5px] font-bold text-slate-800 truncate tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}

export function KeyValueRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-bold text-slate-800 tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ---------- timeline ---------- */

export type TimelineState = "done" | "active" | "pending";

export function TimelineItem({
  time,
  title,
  detail,
  state,
  badge,
}: {
  time?: string;
  title: string;
  detail: string;
  state: TimelineState;
  badge?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            state === "active" ? "bg-teal-600 ring-4 ring-teal-600/15" : state === "done" ? "bg-emerald-500" : "bg-gray-200"
          }`}
        />
        <span className="w-px flex-1 bg-gray-200 mt-1" />
      </div>
      <div className="flex flex-col pb-3.5 min-w-0">
        {time && <span className="text-[11px] text-gray-400">{time}</span>}
        <div className="flex items-center gap-1.5">
          <span className={`text-sm ${state === "active" ? "font-bold text-slate-800" : "text-slate-600 font-medium"}`}>{title}</span>
          {badge && (
            <span className="text-[9.5px] font-extrabold uppercase tracking-wide text-teal-700 bg-teal-50 rounded-full px-1.5 py-0.5">{badge}</span>
          )}
        </div>
        <span className="text-[11px] text-gray-400">{detail}</span>
      </div>
    </div>
  );
}

/* ---------- quick action buttons ---------- */

export function QuickActionButton({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: { bg: string; text: string; hover: string };
}) {
  return (
    <button type="button" className={`w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-colors ${tone.bg} ${tone.text} ${tone.hover}`}>
      <Icon size={15} strokeWidth={2.25} />
      {label}
    </button>
  );
}

/* ---------- sticky footer ---------- */

export function StickyFooter({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  );
}

const FOOTER_BUTTON_TONE = {
  danger: "border-red-200 text-red-500 hover:bg-red-50",
  info: "border-blue-200 text-blue-600 hover:bg-blue-50",
  neutral: "border-gray-300 text-slate-700 hover:bg-gray-50",
} as const;

/** Secondary footer action (Cancel / Save Draft / Back / Preview / Print). */
export function FooterButton({
  tone = "neutral",
  onClick,
  disabled,
  children,
}: {
  tone?: keyof typeof FOOTER_BUTTON_TONE;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 border rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        disabled ? "border-gray-200 text-gray-300 cursor-not-allowed" : FOOTER_BUTTON_TONE[tone]
      }`}
    >
      {children}
    </button>
  );
}

/** The one primary brand CTA (Submit / Confirm / Save & Continue / Next Step). */
export function FooterPrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#148375] hover:bg-[#116a5f] text-white"
      }`}
    >
      {children}
    </button>
  );
}
