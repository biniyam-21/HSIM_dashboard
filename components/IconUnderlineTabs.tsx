import type { LucideIcon } from "lucide-react";

export type IconTab = { icon: LucideIcon; label: string };

/** Icon + label tab strip with a teal underline/text active state (distinct from PatientProfileTabs' plain style). */
export default function IconUnderlineTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: IconTab[];
  active: string;
  onChange: (label: string) => void;
}) {
  return (
    <div className="flex items-center gap-7 border-b border-gray-200 overflow-x-auto">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.label === active;
        return (
          <button
            key={t.label}
            type="button"
            onClick={() => onChange(t.label)}
            className={`flex items-center gap-2 pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              isActive
                ? "font-semibold text-teal-700 border-teal-700"
                : "font-medium text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
