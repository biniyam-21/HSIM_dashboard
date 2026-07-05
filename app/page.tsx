"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Sparkles, UserRound } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import HealthPulseLoader, { EcgTrace } from "@/components/HealthPulseLoader";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-heading text-xl font-bold text-white">{value}</span>
      <span className="text-[11px] text-white/60">{label}</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin@orbithmis.com");
  const [password, setPassword] = useState("Demo@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Warm up the dashboard route ahead of time so the post-login navigation
  // doesn't race the dev server's on-demand compilation of that segment.
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo mode: any credentials are accepted — simulate a brief auth check, then enter.
    setSubmitting(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1100);
  }

  return (
    <main className="relative min-h-screen w-full flex bg-white overflow-hidden">
      {submitting && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <HealthPulseLoader label="Signing you in" />
        </div>
      )}

      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#032b2b] via-[#0a4a4a] to-[#0F766E] overflow-hidden">
        {/* decorative blurred glows */}
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#26A69A]/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C79A46]/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <BrandMark size={28} />
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold text-white tracking-wide">HMIS</span>
            <span className="text-[11px] text-white/70">
              Hospital Management Information System
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-6 max-w-md">
          <h1 className="font-heading text-4xl font-bold text-white leading-tight">
            Every department.
            <br />
            One connected platform.
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            Registration, clinical care, diagnostics, pharmacy, billing, and
            analytics — run your entire hospital operation from a single,
            secure system.
          </p>
          <div className="flex items-center gap-8 pt-2">
            <Stat value="500+" label="Facilities" />
            <Stat value="10K+" label="Clinicians" />
            <Stat value="99.9%" label="Uptime" />
          </div>
        </div>

        <div className="relative">
          <EcgTrace className="w-full h-14 text-white/60" />
          <p className="text-[11px] text-white/50 mt-3">
            © 2026 Orbit Technology Solutions PLC
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
          {/* Mobile-only compact logo (brand panel is hidden below lg) */}
          <div className="flex lg:hidden items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center shrink-0">
              <BrandMark size={20} />
            </span>
            <span className="text-xl font-bold text-[#0F172A]">HMIS</span>
          </div>

          <span className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-full px-3 py-1">
            <Sparkles size={12} strokeWidth={2.5} />
            Demo Mode
          </span>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-2xl font-bold text-[#0F172A]">
              Welcome back
            </h2>
            <p className="text-sm text-[#64748B]">
              Sign in to continue to your dashboard.
            </p>
          </div>

          {/* Username */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#334155]">
              Username or Email
            </span>
            <div className="flex items-center gap-2.5 h-12 px-3.5 bg-white border border-[#E2E8F0] rounded-xl focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-[#0F766E]/15 transition-shadow">
              <UserRound size={18} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm text-[#0F172A]"
              />
            </div>
          </label>

          {/* Password */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#334155]">Password</span>
            <div className="flex items-center gap-2.5 h-12 px-3.5 bg-white border border-[#E2E8F0] rounded-xl focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-[#0F766E]/15 transition-shadow">
              <Lock size={18} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm text-[#0F172A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#94A3B8] hover:text-[#334155] shrink-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[#0F766E] rounded"
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-sm font-medium text-[#0F766E] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#159a8c] text-white text-sm font-semibold hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-70"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-xs text-[#94A3B8] text-center">
            Demo credentials are pre-filled — any input will sign you in.
          </p>

          <p className="text-[11px] text-[#CBD5E1] text-center mt-4">
            © 2026 Orbit Technology Solutions PLC · v2026.1.0
          </p>
        </form>
      </div>
    </main>
  );
}
