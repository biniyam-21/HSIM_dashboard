"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/* ---------- date helpers ---------- */

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(d: Date, months: number) {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Format date as MM/DD/YYYY for the text input. */
function formatInput(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/**
 * Try to parse a manually typed string.
 * Accepts: MM/DD/YYYY · DD/MM/YYYY · YYYY-MM-DD · M/D/YYYY · natural variants with - or .
 */
function parseInput(s: string): Date | null {
  const clean = s.trim();
  const parts = clean.split(/[\/\-\.]/).map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [a, b, c] = parts;

  // YYYY-MM-DD
  if (a > 1000 && b >= 1 && b <= 12 && c >= 1 && c <= 31) {
    const d = new Date(a, b - 1, c);
    if (d.getMonth() === b - 1 && d.getDate() === c) return startOfDay(d);
  }
  // MM/DD/YYYY
  if (c > 1000 && a >= 1 && a <= 12 && b >= 1 && b <= 31) {
    const d = new Date(c, a - 1, b);
    if (d.getMonth() === a - 1 && d.getDate() === b) return startOfDay(d);
  }
  // DD/MM/YYYY — only try if first number > 12 (unambiguous)
  if (c > 1000 && a > 12 && b >= 1 && b <= 12 && a >= 1 && a <= 31) {
    const d = new Date(c, b - 1, a);
    if (d.getMonth() === b - 1 && d.getDate() === a) return startOfDay(d);
  }

  return null;
}

/** Always a full 6-week (42-cell) grid. */
function getMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells: { date: Date; inCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({ date, inCurrentMonth: date.getMonth() === month });
  }
  return cells;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const QUICK_SELECTS: { label: string; resolve: () => Date }[] = [
  { label: "Today",      resolve: () => startOfDay(new Date()) },
  { label: "Yesterday",  resolve: () => startOfDay(addDays(new Date(), -1)) },
  { label: "Last 7 Days",resolve: () => startOfDay(addDays(new Date(), -6)) },
  { label: "This Month", resolve: () => startOfMonth(new Date()) },
  { label: "Last Month", resolve: () => startOfMonth(addMonths(new Date(), -1)) },
];

/* ---------- component ---------- */

export type DatePickerProps = {
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
};

export default function DatePicker({
  defaultValue,
  onChange,
  placeholder = "MM/DD/YYYY",
  className = "",
}: DatePickerProps) {
  const initial = defaultValue ?? startOfDay(new Date());
  const [open, setOpen] = useState(false);
  const [committed, setCommitted] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [viewDate, setViewDate] = useState(startOfMonth(initial));
  const [inputText, setInputText] = useState(formatInput(initial));

  /* ---- helpers ---- */

  const commit = (date: Date) => {
    setCommitted(date);
    setDraft(date);
    setViewDate(startOfMonth(date));
    setInputText(formatInput(date));
    onChange?.(date);
  };

  /* ---- text input handlers ---- */

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    const parsed = parseInput(val);
    if (parsed) {
      setDraft(parsed);
      setViewDate(startOfMonth(parsed));
    }
  };

  const handleTextBlur = () => {
    const parsed = parseInput(inputText);
    if (parsed) {
      commit(parsed);
    } else {
      // Revert to last committed
      setInputText(formatInput(committed));
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const parsed = parseInput(inputText);
      if (parsed) {
        commit(parsed);
        setOpen(false);
      } else {
        setInputText(formatInput(committed));
      }
    }
    if (e.key === "Escape") {
      setInputText(formatInput(committed));
      setOpen(false);
    }
  };

  /* ---- calendar handlers ---- */

  const openPicker = () => {
    setDraft(committed);
    setViewDate(startOfMonth(committed));
    setOpen(true);
  };

  const cancel = () => {
    setDraft(committed);
    setOpen(false);
  };

  const apply = () => {
    commit(draft);
    setOpen(false);
  };

  const selectDay = (date: Date) => {
    setDraft(date);
    if (
      date.getMonth() !== viewDate.getMonth() ||
      date.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(startOfMonth(date));
    }
  };

  const runQuickSelect = (resolve: () => Date) => {
    const date = resolve();
    setDraft(date);
    setViewDate(startOfMonth(date));
  };

  const cells = getMonthGrid(viewDate);

  return (
    <div className={`relative ${className}`}>
      {open && (
        <div className="fixed inset-0 z-30" onClick={cancel} aria-hidden />
      )}

      {/* Input + calendar icon trigger */}
      <div className="relative">
        <input
          type="text"
          value={inputText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md pl-3 pr-9 h-[38px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#008080] focus:border-[#008080] transition-colors bg-white"
        />
        <button
          type="button"
          onClick={() => (open ? cancel() : openPicker())}
          aria-expanded={open}
          aria-label="Open date picker"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#008080] hover:text-[#006666] transition-colors"
        >
          <Calendar size={16} strokeWidth={1.8} />
        </button>
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute z-40 top-full left-0 mt-1.5 w-[290px] bg-white border border-gray-200 rounded-xl shadow-xl p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => setViewDate((v) => addMonths(v, -12))}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#008080] hover:bg-[#008080]/10 transition-colors"
              >
                <ChevronsLeft size={15} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewDate((v) => addMonths(v, -1))}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#008080] hover:bg-[#008080]/10 transition-colors"
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>
            </div>
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              {monthLabel(viewDate)}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewDate((v) => addMonths(v, 1))}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#008080] hover:bg-[#008080]/10 transition-colors"
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next year"
                onClick={() => setViewDate((v) => addMonths(v, 12))}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#008080] hover:bg-[#008080]/10 transition-colors"
              >
                <ChevronsRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="text-center text-[11px] font-semibold text-[#008080] py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map(({ date, inCurrentMonth }) => {
              const isSelected = isSameDay(date, draft);
              const isToday = isSameDay(date, startOfDay(new Date()));
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => selectDay(date)}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] transition-colors ${
                    isSelected
                      ? "bg-[#008080] text-white font-semibold"
                      : isToday && inCurrentMonth
                        ? "border border-[#008080] text-[#008080] font-semibold hover:bg-[#008080]/10"
                        : inCurrentMonth
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick selects */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-gray-100">
            {QUICK_SELECTS.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => runQuickSelect(q.resolve)}
                className="text-[12px] text-[#008080] hover:underline whitespace-nowrap"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={cancel}
              className="h-8 px-3.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              className="h-8 px-3.5 bg-[#008080] hover:bg-[#006666] rounded-md text-sm font-semibold text-white transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
