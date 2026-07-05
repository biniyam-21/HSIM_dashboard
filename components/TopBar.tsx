"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  Plus,
  ChevronDown,
  Bell,
  Mail,
  Calendar,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";

/** Small red count badge used on the notification / email icons. */
function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute top-1 right-[3px] min-w-[16px] h-4 px-1 bg-[#ef4444] text-white text-[10px] font-bold leading-4 text-center rounded-lg box-border">
      {count}
    </span>
  );
}

export default function TopBar({
  onToggleSidebar,
  onLogout,
}: {
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}) {
  const [facilityMenuOpen, setFacilityMenuOpen] = useState(false);

  const handleLogout = () => {
    setFacilityMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="flex items-center gap-3 md:gap-4 w-full h-[68px] px-3 md:px-5 bg-white border-b border-[#eceff1] font-sans box-border">
      {/* Far left: hamburger */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer shrink-0 hover:bg-[#f3f5f7]"
        aria-label="Toggle sidebar"
      >
        <Menu size={22} strokeWidth={2} color="#1f2937" />
      </button>

      {/* Search field */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-[560px] h-[42px] px-3 bg-white border border-[#d7dde1] rounded-[10px]">
        <Search size={18} strokeWidth={2} color="#9ca3af" className="shrink-0" />
        <input
          type="text"
          placeholder="Search patient, module, report..."
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-sm text-[#374151]"
        />
        <span className="hidden sm:inline-block text-[11px] font-medium text-[#8b95a1] bg-[#f3f5f7] border border-[#e2e7eb] rounded-md py-[3px] px-2 whitespace-nowrap shrink-0">
          Ctrl + K
        </span>
      </div>

      {/* Quick Actions button */}
      <button
        type="button"
        className="flex items-center gap-2 h-[42px] px-3 md:px-4 bg-[#159a8c] rounded-[10px] cursor-pointer shrink-0"
      >
        <Plus size={18} strokeWidth={2.5} color="#ffffff" />
        <span className="hidden md:inline text-sm font-semibold text-white whitespace-nowrap">
          Quick Actions
        </span>
        <ChevronDown size={16} strokeWidth={2.5} color="#ffffff" />
      </button>

      {/* Tight strip of four icons — extra gap separates it from Quick Actions */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0 ml-1 md:ml-3">
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.75} color="#111827" />
          <CountBadge count={12} />
        </button>
        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Messages"
        >
          <Mail size={20} strokeWidth={1.75} color="#111827" />
          <CountBadge count={8} />
        </button>
        <button
          type="button"
          className="hidden sm:flex relative items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Calendar"
        >
          <Calendar size={20} strokeWidth={1.75} color="#111827" />
        </button>
        <button
          type="button"
          className="hidden sm:flex relative items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Settings"
        >
          <Settings size={20} strokeWidth={1.75} color="#111827" />
        </button>
      </div>

      {/* Push the hospital selector to the far right */}
      <div className="hidden lg:block flex-1" />

      {/* Facility selector + account menu */}
      <div className="relative hidden lg:block shrink-0">
        {facilityMenuOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setFacilityMenuOpen(false)}
            aria-hidden
          />
        )}

        <button
          type="button"
          onClick={() => setFacilityMenuOpen((v) => !v)}
          aria-expanded={facilityMenuOpen}
          className="flex items-center gap-2.5 h-12 px-3.5 bg-white border border-[#cfd6db] rounded-xl cursor-pointer"
        >
          <span className="flex items-center justify-center shrink-0">
            <Building2 size={18} strokeWidth={2} color="#1f2937" />
          </span>
          <span className="flex flex-col leading-[1.2] text-left min-w-0">
            <span className="text-[13px] font-semibold text-[#1f2937] whitespace-nowrap">
              Fiker Selam General Hospital
            </span>
            <span className="text-[11px] font-normal text-[#8b95a1] whitespace-nowrap">
              Addis Ababa, Ethiopia
            </span>
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            color="#111827"
            className={`shrink-0 transition-transform duration-200 ${
              facilityMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {facilityMenuOpen && (
          <div className="absolute z-40 top-full right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-3.5 border-b border-[#F1F5F9]">
              <span className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center shrink-0">
                <Building2 size={18} strokeWidth={2} className="text-[#0F766E]" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#1f2937] whitespace-nowrap overflow-hidden text-ellipsis">
                  Fiker Selam General Hospital
                </span>
                <span className="text-[11px] text-[#8b95a1] whitespace-nowrap">
                  Addis Ababa, Ethiopia
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} strokeWidth={2} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
