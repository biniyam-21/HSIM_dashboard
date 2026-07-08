"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Filter, X } from "lucide-react";

/**
 * Persists filter state to sessionStorage so filters survive navigation within
 * the same browser tab/session but reset on a fresh session — used by every
 * table's filter popover in this app. Reads happen after mount (client-only)
 * to avoid SSR/hydration mismatches; the very first render always uses `initial`.
 */
export function useSessionFilters<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [key, state]);

  return [state, setState];
}

/** Funnel-icon button that reveals a popover of filter fields. Closes on outside click. */
export function FilterPopoverButton({
  activeCount,
  children,
  align = "right",
}: {
  activeCount: number;
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Show filters"
        className={`h-10 px-3.5 inline-flex items-center gap-1.5 rounded-md border text-sm font-medium transition-colors ${
          activeCount > 0
            ? "border-teal-700 text-teal-700 bg-teal-50"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Filter size={14} strokeWidth={2} />
        Filters
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-4.5 h-4.5 min-w-[18px] px-1 text-[10px] font-bold rounded-full bg-teal-700 text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className={`absolute z-30 top-full mt-1.5 w-[320px] sm:w-[420px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export type FilterChip = { key: string; label: string; value: string };

/** Row of removable pills reflecting the currently-active filters, shown above the table. */
export function FilterChips({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-100 rounded-full pl-3 pr-1.5 py-1 whitespace-nowrap"
        >
          <span className="text-teal-500 font-normal">{c.label}:</span> {c.value}
          <button
            type="button"
            onClick={() => onRemove(c.key)}
            aria-label={`Remove ${c.label} filter`}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-teal-100 text-teal-600 transition-colors"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
