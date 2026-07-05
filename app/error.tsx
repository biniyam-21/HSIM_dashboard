"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function GlobalError({
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-[#F8FAFC] p-8">
      <span className="w-12 h-12 rounded-xl bg-[#0F766E] flex items-center justify-center">
        <BrandMark size={22} />
      </span>

      <div className="flex flex-col items-center text-center gap-3 max-w-sm">
        <span className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center">
          <AlertTriangle size={26} strokeWidth={1.8} className="text-[#DC2626]" />
        </span>
        <h1 className="font-heading text-xl font-bold text-[#0F172A]">
          Something went wrong
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          An unexpected error occurred while loading this page. You can try
          again, or head back to the sign-in screen.
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
          href="/"
          className="inline-flex items-center h-11 px-5 border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors rounded-lg text-[#334155] text-sm font-semibold"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
