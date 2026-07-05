"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-sm">
        <span className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center">
          <AlertTriangle size={26} strokeWidth={1.8} className="text-[#DC2626]" />
        </span>
        <h1 className="font-heading text-xl font-bold text-[#0F172A]">
          Something went wrong
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          This module couldn&apos;t be loaded. You can try again, or head back
          to the dashboard.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-11 px-5 bg-[#159a8c] hover:bg-[#0F766E] transition-colors rounded-lg text-white text-sm font-semibold"
        >
          <RotateCw size={16} strokeWidth={2.5} />
          Try Again
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center h-11 px-5 border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors rounded-lg text-[#334155] text-sm font-semibold"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
