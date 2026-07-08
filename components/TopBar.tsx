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
  LogOut,
  User,
  Building2,
  Palette,
  type LucideIcon,
} from "lucide-react";

/** Small red count badge used on the notification / email icons. */
function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute top-1 right-[3px] min-w-[16px] h-4 px-1 bg-[#ef4444] text-white text-[10px] font-bold leading-4 text-center rounded-lg box-border">
      {count}
    </span>
  );
}

function DropdownSeparator() {
  return <div className="my-1 -mx-0 h-px bg-[#f1f5f9]" />;
}

function DropdownItem({
  icon: Icon,
  label,
  description,
  onClick,
  variant = "default",
  shortcut,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2.5 w-full px-2 py-[7px] rounded-md text-left transition-colors ${
        variant === "danger"
          ? "text-red-600 hover:bg-red-50 focus-visible:bg-red-50"
          : "text-[#1f2937] hover:bg-[#f3f5f7] focus-visible:bg-[#f3f5f7]"
      }`}
    >
      <span
        className={`flex items-center justify-center w-[30px] h-[30px] rounded-md shrink-0 transition-colors ${
          variant === "danger"
            ? "bg-red-50 text-red-500 group-hover:bg-red-100"
            : "bg-[#f3f5f7] text-[#6b7280] group-hover:bg-[#e9eef2] group-hover:text-[#374151]"
        }`}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-medium leading-snug">{label}</span>
        {description && (
          <span className="text-[11px] text-[#94a3b8] leading-snug">{description}</span>
        )}
      </span>
      {shortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-0.5 shrink-0 px-1.5 py-0.5 text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-md">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

export default function TopBar({
  onToggleSidebar,
  onLogout,
}: {
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setProfileOpen(false);
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
      <div className="flex items-center gap-2.5 flex-[2] min-w-[240px] h-[42px] px-3 bg-white border border-[#d7dde1] rounded-[10px]">
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

      {/* Spacer — pushes icon strip + profile to the far right */}
      <div className="flex-1" />

      {/* Icon strip — sits directly left of the profile trigger */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={2.25} color="#374151" />
          <CountBadge count={12} />
        </button>
        <button
          type="button"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Messages"
        >
          <Mail size={19} strokeWidth={2.25} color="#374151" />
          <CountBadge count={8} />
        </button>
        <button
          type="button"
          className="hidden sm:flex relative items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Calendar"
        >
          <Calendar size={19} strokeWidth={2.25} color="#374151" />
        </button>
        <button
          type="button"
          className="hidden sm:flex relative items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-[#f3f5f7]"
          aria-label="Settings"
        >
          <Settings size={19} strokeWidth={2.25} color="#374151" />
        </button>
        {/* Thin divider between icons and profile */}
        <div className="hidden lg:block w-px h-6 bg-[#e2e8f0] mx-1.5" />
      </div>

      {/* User profile menu */}
      <div className="relative hidden lg:block shrink-0">
        {profileOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setProfileOpen(false)}
            aria-hidden
          />
        )}

        {/* ── Trigger ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          className={`flex items-center gap-2.5 h-11 pl-3 pr-2.5 rounded-r-sm cursor-pointer transition-all duration-200 border-l-2 ${
            profileOpen
              ? "border-l-[#159a8c] bg-[#f3f5f7]"
              : "border-l-[#159a8c]/35 hover:border-l-[#159a8c] hover:bg-[#f3f5f7]"
          }`}
        >
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop&crop=faces"
              alt="Dr. Eyob Tesfaye"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
            />
            <span className="absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <span className="flex flex-col leading-[1.2] text-left min-w-0">
            <span className="text-[13px] font-semibold text-[#1f2937] whitespace-nowrap">
              Dr. Eyob Tesfaye
            </span>
            <span className="text-[10.5px] font-normal text-[#8b95a1] whitespace-nowrap">
              System Administrator
            </span>
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            color="#94a3b8"
            className={`shrink-0 transition-transform duration-200 ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── Dropdown ────────────────────────────────────────────── */}
        {profileOpen && (
          <div className="absolute z-40 top-full right-0 mt-2 w-[272px] bg-white border border-[#e2e8f0] rounded-xl shadow-xl shadow-black/[0.07] py-1.5 overflow-hidden">

            {/* Identity header */}
            <div className="flex items-start gap-3 px-3 pt-2.5 pb-3">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop&crop=faces"
                  alt="Dr. Eyob Tesfaye"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#e2e8f0]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="flex flex-col min-w-0 pt-0.5">
                <span className="text-[13.5px] font-semibold text-[#111827] whitespace-nowrap overflow-hidden text-ellipsis">
                  Dr. Eyob Tesfaye
                </span>
                <span className="text-[11.5px] text-[#6b7280] whitespace-nowrap">
                  eyob.tesfaye@fikerhospital.et
                </span>
                <span className="inline-flex mt-1.5 self-start items-center px-2 py-0.5 rounded-md bg-[#159a8c]/10 text-[#159a8c] text-[10px] font-semibold tracking-wide uppercase">
                  System Admin
                </span>
              </div>
            </div>

            <DropdownSeparator />

            {/* All actions — single group */}
            <div className="px-1.5 py-1 flex flex-col gap-0.5">
              <DropdownItem
                icon={User}
                label="My Profile"
                description="Personal info, photo & bio"
              />
              <DropdownItem
                icon={Settings}
                label="Account Settings"
                description="Password, 2FA & security"
                shortcut="⌘,"
              />
              {/* System admin only */}
              <DropdownItem
                icon={Building2}
                label="Switch Facility"
                description="Fiker Selam General Hospital"
              />
              <DropdownItem
                icon={Palette}
                label="Appearance"
                description="Theme, density & language"
              />
            </div>

            <DropdownSeparator />

            {/* Sign out */}
            <div className="px-1.5 py-1">
              <DropdownItem
                icon={LogOut}
                label="Log Out"
                onClick={handleLogout}
                variant="danger"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
