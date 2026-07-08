"use client";

import { useEffect, useState } from "react";

/** 40px circular progress gauge — grey track, dark teal fill, centered %. Sweeps in from 0 on mount. */
export default function AnimatedGauge({ percent, delayMs = 0 }: { percent: number; delayMs?: number }) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const [drawn, setDrawn] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(percent), delayMs + 60);
    return () => window.clearTimeout(id);
  }, [percent, delayMs]);

  const offset = c * (1 - drawn / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="fill-none stroke-[#E2E8F0]"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="fill-none stroke-[#216E6A] transition-[stroke-dashoffset] duration-[1100ms] ease-out"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="font-heading text-[11px] font-semibold fill-[#0F172A]"
      >
        {drawn}%
      </text>
    </svg>
  );
}
