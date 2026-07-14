"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { NAV_GROUPS, slugify, type NavItem } from "@/lib/navigation";
import BrandMark from "@/components/BrandMark";
import { openCommandPalette } from "@/components/CommandPalette";

function GroupHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="text-[10.5px] font-semibold tracking-[0.8px] text-[#6b8e8e] whitespace-nowrap">
        {title}
      </span>
      <span className="flex-1 h-px bg-[#6b8e8e]/40" />
    </div>
  );
}

function MenuItem({
  item,
  collapsed,
  open,
  onClick,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  open: boolean;
  onClick: () => void;
  pathname: string;
}) {
  const Icon: LucideIcon = item.icon;
  const moduleSlug = slugify(item.label);

  // Collapsed rail: centered icon only, tooltip on hover, badge shown as a dot.
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={item.label}
        aria-label={item.label}
        className="relative flex items-center justify-center w-full py-2.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
      >
        <Icon size={20} strokeWidth={1.75} color="#ffffff" />
        {item.badge && (
          <span className="absolute top-1.5 right-3 w-[7px] h-[7px] rounded-full bg-[#26a69a] ring-2 ring-[#032b2b]" />
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="flex items-center gap-3 w-full py-1.5 px-1 cursor-pointer text-left rounded-md hover:bg-white/5 transition-colors"
      >
        <Icon
          size={18}
          strokeWidth={1.75}
          color="#ffffff"
          className="shrink-0"
        />
        <span className="text-sm font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis">
          {item.label}
        </span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {item.badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#032b2b] bg-[#26a69a] rounded-full px-1.5 py-0.5 leading-none">
              {item.badge}
            </span>
          )}
          <ChevronDown
            size={16}
            strokeWidth={2}
            color="#7f9a9a"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {/* Sub-routes */}
      {open && (
        <div className="mt-1 ml-[13px] pl-[16px] border-l border-white/10 flex flex-col gap-0.5">
          {item.children.map((child) => {
            const href = `/modules/${moduleSlug}/${slugify(child.label)}`;
            const active = pathname === href;
            return (
              <Link
                key={child.label}
                href={href}
                className={`text-left text-[12.5px] leading-snug py-1.5 px-2 rounded-md transition-colors ${
                  active
                    ? "text-white bg-white/10 font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function findModuleForPath(pathname: string): string | null {
  const match = pathname.match(/^\/modules\/([^/]+)\//);
  if (!match) return null;
  const moduleSlug = match[1];
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (slugify(item.label) === moduleSlug) return item.label;
    }
  }
  return null;
}

export default function Sidebar({
  open = true,
  onExpand,
  onLogout,
}: {
  open?: boolean;
  onExpand?: () => void;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  // Which module is expanded. Accordion state keyed by unique top-level label,
  // seeded so the module containing the active route starts open.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const active = findModuleForPath(pathname);
    return active ? { [active]: true } : {};
  });
  const toggle = (label: string) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  // Desktop rail vs full. On mobile !open means the drawer is off-screen (rail markup is hidden).
  const collapsed = !open;

  // In rail mode, clicking an icon re-expands the sidebar and opens that module.
  const handleItemClick = (label: string) => {
    if (collapsed) {
      onExpand?.();
      setExpanded({ [label]: true });
    } else {
      toggle(label);
    }
  };

  const dashboardActive = pathname === "/dashboard";

  return (
    <aside
      className={`fixed top-0 left-0 z-20 h-screen bg-[#032b2b] flex flex-col text-white font-sans transition-all duration-300 ease-in-out w-[260px] min-w-[260px] lg:min-w-0 lg:translate-x-0 ${
        open ? "translate-x-0 lg:w-[260px]" : "-translate-x-full lg:w-[72px]"
      }`}
    >
      {/* 1. Branding Header */}
      <header
        className={`flex items-center pt-6 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <BrandMark />
        {!collapsed && (
          <div className="flex flex-col leading-[1.1] min-w-0">
            <span className="text-[22px] font-bold text-white tracking-[0.5px]">
              HMIS
            </span>
            <span className="text-[9px] font-normal text-white/85 mt-0.5">
              Hospital Management Information System
            </span>
          </div>
        )}
      </header>

      {/* 1.5 Search trigger — pinned above the scrolling nav (and above Dashboard)
          so it stays reachable no matter how far the module list is scrolled. */}
      <div
        className={collapsed ? "flex justify-center px-2 pt-5" : "px-5 pt-5"}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={openCommandPalette}
            title="Search (Ctrl K)"
            aria-label="Search modules and routes"
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-[#26a69a] hover:text-white focus-visible:bg-white/10 focus-visible:border-[#26a69a] focus:outline-none transition-colors cursor-pointer"
          >
            <Search size={16} strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2.5 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white/45 hover:bg-white/10 hover:border-[#26a69a] hover:text-white/70 focus-visible:bg-white/10 focus-visible:border-[#26a69a] focus:outline-none transition-colors cursor-pointer"
          >
            <Search size={15} strokeWidth={2} className="shrink-0" />
            <span className="flex-1 text-left text-sm truncate">
              Search modules &amp; routes
            </span>
            <span className="shrink-0 text-[10px] font-semibold tracking-wide text-white/40 bg-white/10 rounded px-1.5 py-0.5">
              Ctrl K
            </span>
          </button>
        )}
      </div>

      {/* Scrolling menu region */}
      <nav
        className={`sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-3 flex flex-col ${
          collapsed ? "px-2" : "px-5"
        }`}
      >
        {/* 2. Active Menu Item */}
        <Link
          href="/dashboard"
          title={collapsed ? "Dashboard" : undefined}
          className={`flex items-center rounded-lg cursor-pointer ${
            dashboardActive ? "bg-[#0a4a4a]" : "hover:bg-white/5"
          } ${collapsed ? "justify-center py-2.5" : "gap-3 w-full py-[11px] px-3 text-left"}`}
        >
          <Home
            size={collapsed ? 20 : 18}
            strokeWidth={2}
            color={dashboardActive ? "#26a69a" : "#ffffff"}
            className="shrink-0"
          />
          {!collapsed && (
            <span
              className={`text-sm font-medium ${
                dashboardActive ? "text-[#26a69a]" : "text-white"
              }`}
            >
              Dashboard
            </span>
          )}
        </Link>

        {/* 3 + 4. Groups and their expandable items */}
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mt-[22px]">
            {collapsed ? (
              <div className="mx-2 mb-2 h-px bg-white/10" />
            ) : (
              <GroupHeader title={group.title} />
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <MenuItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  open={!!expanded[item.label]}
                  onClick={() => handleItemClick(item.label)}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 5. Sticky Footer */}
      <footer
        className={`relative pt-3 pb-5 flex flex-col gap-3 border-t border-white/5 ${
          collapsed ? "px-2 items-center" : "px-5"
        }`}
      >
        {collapsed ? (
          <button
            type="button"
            title="Need Help? — Open Support Ticket"
            className="w-10 h-10 rounded-full bg-[#26a69a] flex items-center justify-center cursor-pointer shrink-0"
          >
            <HelpCircle size={18} strokeWidth={2.25} color="#032b2b" />
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-3 w-full p-3 bg-[#0a3a3a] rounded-xl cursor-pointer text-left"
          >
            <span className="w-[34px] h-[34px] rounded-full bg-[#26a69a] flex items-center justify-center shrink-0">
              <HelpCircle size={18} strokeWidth={2.25} color="#032b2b" />
            </span>
            <span className="flex flex-col leading-[1.2] min-w-0">
              <span className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                Need Help?
              </span>
              <span className="text-[11px] font-normal text-[#8fb0b0] mt-0.5">
                Open Support Ticket
              </span>
            </span>
            <ChevronRight
              size={18}
              strokeWidth={2.25}
              color="#26a69a"
              className="ml-auto shrink-0"
            />
          </button>
        )}
      </footer>
    </aside>
  );
}
