"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import HealthPulseLoader from "@/components/HealthPulseLoader";
import CommandPalette from "@/components/CommandPalette";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // true  = expanded (260px)  /  false = collapsed rail (72px on desktop, hidden drawer on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Demo mode: no real session to clear — just simulate the transition, then
    // return to the sign-in screen (mirrors the login page's own pulse loader).
    setLoggingOut(true);
    setTimeout(() => {
      router.push("/");
    }, 900);
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* Backdrop — only on small screens while the drawer is open */}
      <div
        onClick={() => setSidebarOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-10 bg-black/40 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <Sidebar open={sidebarOpen} onExpand={() => setSidebarOpen(true)} onLogout={handleLogout} />

      {/* Content column — margin follows the sidebar's desktop width (260 expanded / 72 rail) */}
      <div
        className={`h-screen flex flex-col min-w-0 ml-0 transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
        }`}
      >
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
        <section className="flex-1 bg-[#F8FAFC] overflow-y-auto overflow-x-hidden">
          {children}
        </section>
      </div>

      {/* Full-screen transition while logging out. Rendered here (not inside the
          transformed sidebar) so `fixed` correctly anchors to the viewport, not
          to a transformed ancestor's containing block. */}
      {loggingOut && (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC]/95 backdrop-blur-sm flex items-center justify-center">
          <HealthPulseLoader label="Signing you out" />
        </div>
      )}

      <CommandPalette />
    </div>
  );
}
