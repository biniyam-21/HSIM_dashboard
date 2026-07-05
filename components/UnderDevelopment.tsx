import Link from "next/link";
import { ArrowLeft, Construction, type LucideIcon } from "lucide-react";

type Entry = {
  groupTitle: string;
  moduleLabel: string;
  moduleIcon: LucideIcon;
  childLabel: string;
} | null;

function toTitleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function UnderDevelopment({
  entry,
  fallbackSlug,
}: {
  entry: Entry;
  fallbackSlug: string[];
}) {
  const Icon: LucideIcon = entry?.moduleIcon ?? Construction;
  const title = entry?.childLabel ?? toTitleCase(fallbackSlug[fallbackSlug.length - 1] ?? "Page");
  const breadcrumb = entry ? `${entry.groupTitle} / ${entry.moduleLabel}` : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
        {/* Icon with a slow spinning dashed "in progress" ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0F766E]/30 animate-spin [animation-duration:6s]" />
          <div className="w-16 h-16 rounded-full bg-[#0F766E]/10 flex items-center justify-center">
            <Icon size={28} strokeWidth={1.8} className="text-[#0F766E]" />
          </div>
        </div>

        {breadcrumb && (
          <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            {breadcrumb}
          </span>
        )}

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-[#0F172A]">{title}</h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            This module is on our development roadmap and isn&apos;t available yet.
            Our team is actively building it — check back soon.
          </p>
        </div>

        {/* Decorative progress indicator */}
        <div className="w-full max-w-[220px] flex flex-col gap-1.5">
          <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-[#0F766E] rounded-full" />
          </div>
          <span className="text-[11px] text-[#94A3B8]">In development</span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#159a8c] hover:bg-[#0F766E] transition-colors rounded-lg text-white text-sm font-semibold"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
