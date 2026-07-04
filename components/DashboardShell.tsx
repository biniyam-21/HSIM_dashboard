"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ContentHeader from "@/components/ContentHeader";
import MainGrid from "@/components/MainGrid";

export default function DashboardShell() {
  // true  = expanded (260px)  /  false = collapsed rail (72px on desktop, hidden drawer on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      <Sidebar open={sidebarOpen} onExpand={() => setSidebarOpen(true)} />

      {/* Content column — margin follows the sidebar's desktop width (260 expanded / 72 rail) */}
      <div
        className={`h-screen flex flex-col min-w-0 ml-0 transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
        }`}
      >
        <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <section className="flex-1 bg-[#F8FAFC] overflow-y-auto overflow-x-hidden">
          <ContentHeader />
          <MainGrid />
        </section>
      </div>
    </div>
  );
}
