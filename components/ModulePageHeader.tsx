import { Plus } from "lucide-react";

/** Shared header used across module pages: title/breadcrumb + hospital branding block. */
export default function ModulePageHeader({
  title,
  breadcrumb,
  subtitle,
  actions,
}: {
  title: string;
  breadcrumb: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{breadcrumb}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {actions}
        <span className="w-10 h-10 rounded-full border-2 border-teal-700 flex items-center justify-center shrink-0">
          <Plus size={18} strokeWidth={2.5} className="text-teal-700" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-teal-700 whitespace-nowrap">
            Fiker Selam General Hospital
          </span>
          <span className="text-sm text-gray-500 whitespace-nowrap">Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </div>
  );
}
