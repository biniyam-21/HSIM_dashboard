/** Shared tab strip used across a patient-record sub-page family (Demographics, Consent & Documents, etc.).
 *  Pass `onChange` to make it an interactive tab switcher; omit it to keep the
 *  strip purely decorative (existing behavior for read-only usages). */
export default function PatientProfileTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange?: (tab: string) => void;
}) {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={onChange ? () => onChange(tab) : undefined}
            className={`pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              isActive
                ? "font-semibold text-slate-900 border-teal-700"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
