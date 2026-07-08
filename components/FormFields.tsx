import { ChevronDown, X, Lock, type LucideIcon } from "lucide-react";

/* ---------- shared field primitives for module form pages ---------- */

export const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-colors";

export function FieldLabel({
  children,
  required,
  icon: Icon,
}: {
  children: React.ReactNode;
  required?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
      {children} {required && <span className="text-red-500">*</span>}
      {Icon && <Icon size={12} strokeWidth={2} className="text-gray-400" />}
    </label>
  );
}

export function TextField({
  label,
  required,
  defaultValue,
  placeholder,
  icon: Icon,
  labelIcon,
  readOnly,
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  icon?: LucideIcon;
  labelIcon?: LucideIcon;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel required={required} icon={labelIcon}>
        {label}
      </FieldLabel>
      <div className="relative">
        <input
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${inputClass} ${Icon ? "pr-9" : ""} ${
            readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
          }`}
        />
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.8}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}

/** Read-only display of removable-looking tag pills inside a select-style box. */
export function TagsField({
  label,
  tags,
  placeholder,
}: {
  label: string;
  tags: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <div className={`${inputClass} flex flex-wrap items-center gap-1.5 min-h-[38px] pr-8`}>
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-100 rounded px-2 py-0.5 whitespace-nowrap"
            >
              {t}
              <X size={12} strokeWidth={2.5} />
            </span>
          ))}
          {tags.length === 0 && placeholder && (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  required,
  defaultValue,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  options: string[];
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        <select
          defaultValue={defaultValue ?? ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={`${inputClass} pr-8 appearance-none bg-white ${
            !defaultValue ? "text-gray-400" : "text-gray-800"
          }`}
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
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

export function ActionInputField({
  label,
  required,
  defaultValue,
  actionLabel,
  actionColor = "gray",
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  actionLabel: string;
  actionColor?: "gray" | "teal";
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="flex items-stretch border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-teal-700 focus-within:border-teal-700">
        <input
          type="text"
          defaultValue={defaultValue}
          className="flex-1 min-w-0 px-3 py-2 text-sm text-gray-800 outline-none border-none"
        />
        <button
          type="button"
          className={`px-3.5 text-xs font-semibold whitespace-nowrap border-l border-gray-300 transition-colors ${
            actionColor === "teal"
              ? "text-teal-700 bg-white hover:bg-teal-50"
              : "text-gray-700 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      {title && <h2 className="text-sm font-bold text-slate-900 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

/** Photo avatar when available, otherwise a plain initials circle. */
export function Avatar({ photo, initials }: { photo?: string; initials?: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    );
  }
  return (
    <span className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
      {initials}
    </span>
  );
}

/** Small page-level legal/compliance note — icon + one or more lines of muted text. */
export function ComplianceNote({
  icon: Icon = Lock,
  lines,
}: {
  icon?: LucideIcon;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} strokeWidth={1.8} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="flex flex-col text-xs text-gray-500 leading-relaxed">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </div>
  );
}
