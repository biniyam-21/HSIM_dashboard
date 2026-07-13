"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, type LucideIcon } from "lucide-react";
import { NAV_GROUPS, slugify } from "@/lib/navigation";

const OPEN_EVENT = "hmis:open-command-palette";

/** Fire-and-forget trigger — call from anywhere (sidebar button, top bar field, …) without prop drilling. */
export function openCommandPalette() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_EVENT));
}

type Entry = {
  groupTitle: string;
  moduleLabel: string;
  moduleIcon: LucideIcon;
  moduleBadge?: string;
  childLabel: string;
  href: string;
};

const ALL_ENTRIES: Entry[] = NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) =>
    item.children.map((child) => ({
      groupTitle: group.title,
      moduleLabel: item.label,
      moduleIcon: item.icon,
      moduleBadge: item.badge,
      childLabel: child.label,
      href: `/modules/${slugify(item.label)}/${slugify(child.label)}`,
    }))
  )
);

/** Curated first-touch destinations shown before the user types anything. */
const QUICK_JUMP: Entry[] = (
  [
    ["Appointments & Queue", "Queue Management"],
    ["Patient Management", "Patient Registration"],
    ["IPD Management", "Bed Allocation"],
    ["Billing & Invoicing", "OPD Billing"],
    ["User Management", "Roles & Permissions"],
  ] as const
)
  .map(([mod, child]) => ALL_ENTRIES.find((e) => e.moduleLabel === mod && e.childLabel === child))
  .filter((e): e is Entry => Boolean(e));

const MAX_RESULTS = 40;

function scoreEntry(e: Entry, q: string): number {
  const child = e.childLabel.toLowerCase();
  const mod = e.moduleLabel.toLowerCase();
  if (child === q) return 100;
  if (child.startsWith(q)) return 90;
  if (child.includes(q)) return 70;
  if (mod.startsWith(q)) return 55;
  if (mod.includes(q)) return 40;
  return -1;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-teal-700 font-semibold">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const keyboardNav = useRef(false);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_ENTRIES.map((e) => ({ e, s: scoreEntry(e, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.moduleLabel.localeCompare(b.e.moduleLabel))
      .slice(0, MAX_RESULTS)
      .map((x) => x.e);
  }, [query]);

  const list = query.trim() ? matches : QUICK_JUMP;

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { groupTitle: string; moduleLabel: string; moduleIcon: LucideIcon; moduleBadge?: string; rows: Entry[] }
    >();
    list.forEach((e) => {
      const key = `${e.groupTitle}|${e.moduleLabel}`;
      if (!map.has(key)) {
        map.set(key, {
          groupTitle: e.groupTitle,
          moduleLabel: e.moduleLabel,
          moduleIcon: e.moduleIcon,
          moduleBadge: e.moduleBadge,
          rows: [],
        });
      }
      map.get(key)!.rows.push(e);
    });
    return Array.from(map.values());
  }, [list]);

  // Global open triggers: the custom event (sidebar / top bar buttons) and Ctrl/Cmd+K anywhere.
  useEffect(() => {
    const onOpenEvent = () => setOpen(true);
    const onKeyDown = (ev: KeyboardEvent) => {
      const meta = ev.ctrlKey || ev.metaKey;
      if (meta && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setOpen((v) => !v);
      } else if (ev.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Mount / enter / exit choreography — two rAFs on the way in so the browser
  // paints the closed state at least once before transitioning to open.
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timeout = 0;
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      setMounted(true);
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setEntered(true));
      });
      timeout = window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setEntered(false);
      document.body.style.overflow = "";
      timeout = window.setTimeout(() => {
        setMounted(false);
        setQuery("");
        setSelected(0);
      }, 200);
      previouslyFocused.current?.focus?.();
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    if (keyboardNav.current) {
      rowRefs.current[selected]?.scrollIntoView({ block: "nearest" });
      keyboardNav.current = false;
    }
  }, [selected]);

  function moveSelection(delta: number) {
    if (list.length === 0) return;
    keyboardNav.current = true;
    setSelected((s) => (s + delta + list.length) % list.length);
  }

  function go(entry: Entry) {
    setOpen(false);
    router.push(entry.href);
  }

  function handleInputKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      moveSelection(1);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      moveSelection(-1);
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      const entry = list[selected];
      if (entry) go(entry);
    }
  }

  if (!mounted) return null;

  let runningIndex = -1;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4 transition-opacity duration-150 motion-reduce:transition-none ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search HMIS"
    >
      <div className="absolute inset-0 bg-[#032b2b]/50 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[600px] max-h-[70vh] bg-white rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-black/5 flex flex-col overflow-hidden transition duration-200 ease-out motion-reduce:transition-none ${
          entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
        }`}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 shrink-0">
          <Search size={18} strokeWidth={2} className="text-teal-700 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search modules, sub-modules, routes…"
            aria-label="Search modules, sub-modules, and routes"
            className="flex-1 min-w-0 outline-none border-none bg-transparent text-[15px] text-slate-900 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="shrink-0 text-[11px] font-medium text-[#8b95a1] bg-[#f3f5f7] border border-[#e2e7eb] rounded-md py-[3px] px-2 hover:bg-[#e9eef2] transition-colors"
          >
            Esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center px-6">
              <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Search size={16} strokeWidth={2} className="text-gray-300" />
              </span>
              <p className="text-sm text-gray-500">No matches for &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-gray-400">Try a different module, sub-module, or route name.</p>
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div className="px-2.5 pt-1 pb-2 text-[10.5px] font-semibold tracking-wide text-gray-400 uppercase">
                  Quick jump
                </div>
              )}
              {groups.map((group) => {
                const Icon = group.moduleIcon;
                return (
                  <div key={`${group.groupTitle}|${group.moduleLabel}`} className="mb-1">
                    {query.trim() && (
                      <div className="px-2.5 pt-2 pb-1 text-[10.5px] font-semibold tracking-wide text-gray-400 uppercase flex items-center gap-1.5">
                        <span className="truncate">{group.groupTitle}</span>
                        <span className="text-gray-300 shrink-0">&rsaquo;</span>
                        <span className="truncate">{group.moduleLabel}</span>
                        {group.moduleBadge && (
                          <span className="ml-1 shrink-0 text-[9px] font-bold uppercase tracking-wide text-white bg-teal-600 rounded-full px-1.5 py-[1px]">
                            {group.moduleBadge}
                          </span>
                        )}
                      </div>
                    )}
                    {group.rows.map((row) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const isSelected = idx === selected;
                      return (
                        <div
                          key={row.href}
                          ref={(el) => {
                            rowRefs.current[idx] = el;
                          }}
                          onMouseEnter={() => setSelected(idx)}
                          onClick={() => go(row)}
                          className={`flex items-center gap-3 mx-1 px-2.5 py-2 rounded-lg cursor-pointer transition-colors motion-reduce:transition-none ${
                            isSelected ? "bg-teal-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors motion-reduce:transition-none ${
                              isSelected ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Icon size={15} strokeWidth={2} />
                          </span>
                          <span className="flex flex-col min-w-0 flex-1">
                            <span className="text-[13.5px] font-medium text-slate-900 truncate">
                              <Highlight text={row.childLabel} query={query} />
                            </span>
                            {!query.trim() && (
                              <span className="text-[11px] text-gray-400 truncate">{row.moduleLabel}</span>
                            )}
                          </span>
                          <CornerDownLeft
                            size={14}
                            strokeWidth={2}
                            className={`shrink-0 text-teal-600 transition-opacity motion-reduce:transition-none ${
                              isSelected ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 h-10 border-t border-gray-100 text-[11px] text-gray-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-md">
              &uarr;
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-md">
              &darr;
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-md">
              Enter
            </kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded-md">
              Esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
