"use client";

import { useEffect, useRef, useState } from "react";

/** Splits "Birr 285,430" into { prefix: "Birr ", num: 285430, suffix: "", grouped: true }. */
function parseValue(raw: string) {
  const match = raw.match(/^(\D*)([\d,]+)(\D*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const num = parseInt(numStr.replace(/,/g, ""), 10);
  if (Number.isNaN(num)) return null;
  return { prefix, num, suffix, grouped: numStr.includes(",") };
}

/**
 * Animates a numeric display string from 0 up to its target value on mount
 * (e.g. "342", "Birr 285,430", "76%"). Falls back to rendering the raw value
 * immediately if it isn't numeric, or if the user prefers reduced motion.
 */
export default function CountUp({
  value,
  durationMs = 900,
  delayMs = 0,
  className,
}: {
  value: string;
  durationMs?: number;
  delayMs?: number;
  className?: string;
}) {
  const parsed = parseValue(value);
  const [display, setDisplay] = useState(value);
  const animatedOnce = useRef(false);

  useEffect(() => {
    if (!parsed || animatedOnce.current) return;
    animatedOnce.current = true;

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    setDisplay(`${parsed.prefix}0${parsed.suffix}`);

    let raf = 0;
    let start: number | null = null;
    const timeout = window.setTimeout(() => {
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(parsed.num * eased);
        const formatted = parsed.grouped ? current.toLocaleString() : String(current);
        setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span className={className}>{display}</span>;
}
