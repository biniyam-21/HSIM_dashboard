import {
  Calendar,
  ChevronDown,
  Users,
  BedSingle,
  Activity,
  FlaskConical,
  DollarSign,
  Bed,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";

type Trend = "up" | "down";

type Kpi = {
  title: string;
  value: string;
  valueClass: string;
  icon: LucideIcon;
  iconBgClass: string;
  label: string;
  stat?: string;
  trend?: Trend;
  gauge?: number; // enables the special card-6 gauge footer
};

const KPIS: Kpi[] = [
  {
    title: "OPD Patients",
    value: "276",
    valueClass: "text-[22px]",
    icon: Users,
    iconBgClass: "bg-[#216E6A]",
    label: "Today",
    stat: "18.6%",
    trend: "up",
  },
  {
    title: "IPD Patients",
    value: "158",
    valueClass: "text-[22px]",
    icon: BedSingle,
    iconBgClass: "bg-[#5C8E64]",
    label: "Today",
    stat: "12.4%",
    trend: "up",
  },
  {
    title: "ER Cases",
    value: "48",
    valueClass: "text-[22px]",
    icon: Activity,
    iconBgClass: "bg-[#DB5567]",
    label: "Today",
    stat: "5.3%",
    trend: "down",
  },
  {
    title: "Lab Tests",
    value: "342",
    valueClass: "text-[22px]",
    icon: FlaskConical,
    iconBgClass: "bg-[#F8A05F]",
    label: "Today",
    stat: "24.7%",
    trend: "up",
  },
  {
    title: "Revenue (Today)",
    value: "Birr 285,430",
    valueClass: "text-[18px]",
    icon: DollarSign,
    iconBgClass: "bg-[#627EC1]",
    label: "Today",
    stat: "14.8%",
    trend: "up",
  },
  {
    title: "Available Beds",
    value: "76",
    valueClass: "text-[22px]",
    icon: Bed,
    iconBgClass: "bg-[#216E6A]",
    label: "Total: 234",
    gauge: 32,
  },
];

/** 48px gold-bordered circle with a dark teal cross on white. */
function HospitalLogo() {
  return (
    <div className="w-12 h-12 rounded-full border-2 border-[#C79A46] bg-white flex items-center justify-center shrink-0 box-border">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 5v14M5 12h14"
          stroke="#0F766E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** 40px circular progress gauge — grey track, dark teal fill, centered %. */
function Gauge({ percent }: { percent: number }) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
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
        className="fill-none stroke-[#216E6A]"
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
        {percent}%
      </text>
    </svg>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const isUp = kpi.trend === "up";
  const isGauge = kpi.gauge !== undefined;
  return (
    <div className="flex items-center gap-4 py-4 px-4 bg-white border border-[#F1F5F9] rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] min-w-0 box-border">
      <span
        className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 ${kpi.iconBgClass}`}
      >
        <Icon size={24} strokeWidth={2} color="#ffffff" />
      </span>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#475569] mb-1 leading-snug">
          {kpi.title}
        </div>
        <div
          className={`font-heading font-semibold text-[#0F172A] mb-2 leading-[1.1] whitespace-nowrap ${kpi.valueClass}`}
        >
          {kpi.value}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[13px] font-medium whitespace-nowrap ${
              isGauge ? "text-[#64748B]" : "text-[#94A3B8]"
            }`}
          >
            {kpi.label}
          </span>
          {kpi.stat && (
            <span
              className={`inline-flex items-center gap-0.5 text-[13px] font-semibold whitespace-nowrap ${
                isUp ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {isUp ? (
                <ArrowUp size={13} strokeWidth={2.5} className="stroke-current" />
              ) : (
                <ArrowDown size={13} strokeWidth={2.5} className="stroke-current" />
              )}
              {kpi.stat}
            </span>
          )}
        </div>
      </div>

      {isGauge && (
        <div className="ml-auto shrink-0 flex items-center">
          <Gauge percent={kpi.gauge!} />
        </div>
      )}
    </div>
  );
}

export default function ContentHeader() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 bg-[#F8FAFC] font-sans">
      {/* Section 1: Header row */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        {/* Left: greeting */}
        <div className="flex flex-col">
          <h1 className="font-heading text-xl sm:text-[26px] font-bold text-[#0F172A] m-0">
            Welcome back, Dr. Eyob Tesfaye! <span aria-hidden>👋</span>
          </h1>
          <p className="text-sm sm:text-[15px] font-medium text-[#64748B] mt-1 mb-0">
            Here&apos;s what&apos;s happening at your hospital today.
          </p>
        </div>

        {/* Center-right + right: controls & branding */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center justify-between gap-2 w-[160px] sm:w-[180px] h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg box-border">
              <span className="text-sm font-semibold text-[#334155] whitespace-nowrap">
                May 22, 2026
              </span>
              <Calendar size={16} strokeWidth={2} color="#64748B" />
            </div>
            <div className="flex items-center justify-between gap-2 w-[160px] sm:w-[180px] h-10 px-3 bg-white border border-[#E2E8F0] rounded-lg box-border">
              <span className="text-sm font-semibold text-[#334155] whitespace-nowrap">
                All Departments
              </span>
              <ChevronDown size={16} strokeWidth={2} color="#64748B" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HospitalLogo />
            <div className="flex flex-col leading-[1.25]">
              <span className="text-[15px] font-bold text-[#0F766E] whitespace-nowrap">
                Fiker Selam General Hospital
              </span>
              <span className="text-[13px] font-medium text-[#64748B] whitespace-nowrap">
                Addis Ababa, Ethiopia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.title} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
