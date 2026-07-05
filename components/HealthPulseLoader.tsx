/** Builds a repeating ECG/heartbeat waveform path, normalized so pathLength=100 per unit. */
function buildEcgPath(units: number) {
  const unit: [number, number][] = [
    [14, 50],
    [20, 42],
    [26, 50],
    [36, 50],
    [40, 72],
    [46, 8],
    [52, 68],
    [58, 50],
    [72, 50],
    [80, 38],
    [88, 50],
    [100, 50],
  ];
  let d = `M0,50`;
  for (let u = 0; u < units; u++) {
    const offset = u * 100;
    for (const [x, y] of unit) d += ` L${x + offset},${y}`;
  }
  return d;
}

const ECG_UNITS = 4;
const ECG_PATH = buildEcgPath(ECG_UNITS);
const VIEW_W = ECG_UNITS * 100;

/** The animated heartbeat trace itself — reused by the loader and decoratively on the login page. */
export function EcgTrace({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} 100`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d={ECG_PATH}
        fill="none"
        className="stroke-current opacity-20"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
      />
      <path
        d={ECG_PATH}
        fill="none"
        className="stroke-current animate-ecg-travel"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray="18 100"
      />
    </svg>
  );
}

/** Health-wave pulse loader — shown while a route segment lazy-loads. */
export default function HealthPulseLoader({
  label = "Loading",
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-[#0F766E] ${
        fullScreen ? "fixed inset-0 z-50 bg-[#F8FAFC]" : "py-10"
      }`}
    >
      <div className="relative w-[220px] h-[90px]">
        <EcgTrace className="w-full h-full" />
      </div>
      <span className="text-sm font-semibold tracking-wide animate-pulse font-heading">
        {label}…
      </span>
    </div>
  );
}
