import {
  Plus,
  ChevronDown,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  LayoutGrid,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  ScanLine,
  Pill,
  Scissors,
  Activity,
  FileText,
  Share2,
  RotateCcw,
  Users,
  Bed,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import PatientInfoBanner from "@/components/PatientInfoBanner";

/* ---------- header ---------- */

function Breadcrumb() {
  const crumbs = ["Patient Management", "Patient Timeline"];
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {crumbs.map((c, i) => (
        <span key={c} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">&gt;</span>}
          <span className={i === crumbs.length - 1 ? "text-gray-500" : "text-teal-700 font-medium"}>
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Timeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive chronological view of patient encounters, events and clinical history.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full border-2 border-teal-700 flex items-center justify-center shrink-0">
          <Plus size={18} strokeWidth={2.5} className="text-teal-700" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-teal-700 whitespace-nowrap">
            Fiker Selam General Hospital
          </span>
          <span className="text-sm text-gray-500 whitespace-nowrap">Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- controls bar ---------- */

function ControlsBar() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-3 flex flex-wrap items-center gap-3">
      <div className="relative shrink-0">
        <select className="appearance-none h-10 pl-3 pr-8 border border-gray-200 rounded-md text-sm text-gray-700 bg-white">
          <option>All Encounters</option>
        </select>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-md text-sm text-gray-700 shrink-0 whitespace-nowrap">
        <CalendarIcon size={15} strokeWidth={1.8} className="text-gray-400" />
        May 22, 2025 - May 22, 2026
      </div>
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search timeline events..."
          className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-md text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter size={14} strokeWidth={2} />
          Filters
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={14} strokeWidth={2} />
          Export
        </button>
      </div>
    </div>
  );
}

/* ---------- left column: Timeline Filters ---------- */

const TIMELINE_FILTERS: { icon: LucideIcon; label: string; count: number }[] = [
  { icon: Stethoscope, label: "Encounters", count: 24 },
  { icon: ClipboardList, label: "Clinical Notes", count: 18 },
  { icon: FlaskConical, label: "Lab Results", count: 28 },
  { icon: ScanLine, label: "Radiology", count: 12 },
  { icon: Pill, label: "Medications", count: 27 },
  { icon: Scissors, label: "Procedures", count: 10 },
  { icon: Activity, label: "Vitals & Measurements", count: 54 },
  { icon: FileText, label: "Documents", count: 21 },
  { icon: Share2, label: "Referrals", count: 8 },
  { icon: CalendarIcon, label: "Admissions / Discharges", count: 6 },
];

function TimelineFiltersCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Timeline Filters</h2>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-md bg-emerald-50">
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <LayoutGrid size={16} strokeWidth={1.8} />
            All Events
          </span>
          <span className="text-xs font-semibold text-emerald-700">128</span>
        </div>
        {TIMELINE_FILTERS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.label}
              type="button"
              className="flex items-center justify-between px-2.5 py-2 rounded-md text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <Icon size={16} strokeWidth={1.8} className="text-gray-400 shrink-0" />
                {f.label}
              </span>
              <span className="text-xs font-medium text-gray-400">{f.count}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="w-full mt-3 h-10 flex items-center justify-center gap-2 border border-teal-700 rounded-md text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
      >
        <RotateCcw size={15} strokeWidth={2} />
        Reset Filters
      </button>
    </div>
  );
}

/* ---------- center column: timeline ---------- */

type TimelineEvent = {
  time: string;
  icon: LucideIcon;
  bg: string;
  title: string;
  lines: string[];
  status: string;
  statusClass: string;
};

type TimelineGroup = { date: string; today?: boolean; events: TimelineEvent[] };

const TIMELINE: TimelineGroup[] = [
  {
    date: "May 22, 2026",
    today: true,
    events: [
      {
        time: "10:30 AM",
        icon: Users,
        bg: "bg-emerald-500",
        title: "OPD Visit",
        lines: ["Department: General Medicine  •  Doctor: Dr. Hana M.", "Chief complaint: Headache and dizziness"],
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700",
      },
      {
        time: "09:45 AM",
        icon: FlaskConical,
        bg: "bg-blue-500",
        title: "Lab Results Available",
        lines: ["Tests: CBC, Blood Glucose", "Ordered by: Dr. Hana M."],
        status: "Results Ready",
        statusClass: "bg-blue-50 text-blue-700",
      },
      {
        time: "09:20 AM",
        icon: FileText,
        bg: "bg-orange-500",
        title: "Document Uploaded",
        lines: ["File: Discharge Summary.pdf", "Uploaded by: Dr. Hana M."],
        status: "Document",
        statusClass: "bg-orange-50 text-orange-700",
      },
    ],
  },
  {
    date: "May 21, 2026",
    events: [
      {
        time: "04:10 PM",
        icon: ClipboardList,
        bg: "bg-purple-500",
        title: "Clinical Note",
        lines: ["Follow up note and assessment", "By: Dr. Kibrom A."],
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700",
      },
      {
        time: "03:40 PM",
        icon: Scissors,
        bg: "bg-red-500",
        title: "Procedure Performed",
        lines: ["Wound Dressing", "By: Nurse Selamawit"],
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700",
      },
    ],
  },
  {
    date: "May 20, 2026",
    events: [
      {
        time: "02:15 PM",
        icon: Bed,
        bg: "bg-sky-400",
        title: "IPD Discharge",
        lines: ["Department: General Ward", "Discharged by: Dr. Daniel K."],
        status: "Discharged",
        statusClass: "bg-gray-100 text-gray-600",
      },
    ],
  },
];

function TimelineRow({ event }: { event: TimelineEvent }) {
  const Icon = event.icon;
  return (
    <div className="relative flex items-start gap-3">
      <span className="w-16 text-right text-xs text-gray-400 shrink-0 pt-2 whitespace-nowrap">
        {event.time}
      </span>
      {/* z-10 so the node sits on top of the connecting line drawn behind it */}
      <span
        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${event.bg}`}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="flex-1 bg-white border border-gray-100 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-bold text-slate-900">{event.title}</span>
            {event.lines.map((l) => (
              <span key={l} className="text-xs text-gray-500">
                {l}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${event.statusClass}`}
            >
              {event.status}
            </span>
            <button
              type="button"
              aria-label="Expand"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="More actions"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientTimelineCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient Timeline</h2>
      <div className="flex flex-col gap-6">
        {TIMELINE.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-slate-900">{group.date}</span>
              {group.today && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Today
                </span>
              )}
            </div>
            {/* Connecting line spans icon-center to icon-center via calc(), so it
                stays correctly positioned regardless of each card's real height. */}
            <div className="relative">
              {group.events.length > 1 && (
                <div
                  className="absolute left-[94px] top-[18px] h-[calc(100%-36px)] w-px bg-gray-200"
                  aria-hidden
                />
              )}
              <div className="flex flex-col gap-4">
                {group.events.map((e) => (
                  <TimelineRow key={e.title + e.time} event={e} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center pt-1">
        <button
          type="button"
          className="inline-flex items-center gap-2 h-10 px-5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Load More Events
          <ChevronDown size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ---------- right column ---------- */

const SUMMARY_SEGMENTS = [
  { label: "Encounters", value: 24, pct: "19%", dot: "bg-emerald-600", stroke: "stroke-emerald-600" },
  { label: "Lab Results", value: 28, pct: "22%", dot: "bg-blue-500", stroke: "stroke-blue-500" },
  { label: "Medications", value: 27, pct: "21%", dot: "bg-orange-500", stroke: "stroke-orange-500" },
  { label: "Documents", value: 21, pct: "16%", dot: "bg-purple-500", stroke: "stroke-purple-500" },
  { label: "Others", value: 28, pct: "22%", dot: "bg-gray-400", stroke: "stroke-gray-400" },
];

function SummaryDonut() {
  const size = 140;
  const r = 52;
  const sw = 22;
  const c = 2 * Math.PI * r;
  const total = SUMMARY_SEGMENTS.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {SUMMARY_SEGMENTS.map((s) => {
            const len = (c * s.value) / total;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                className={s.stroke}
                strokeWidth={sw}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-acc}
              />
            );
            acc += len;
            return el;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-[11px] text-gray-400">Total Events</span>
      </div>
    </div>
  );
}

function TimelineSummaryCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-900 mb-4">Timeline Summary</h2>
      <div className="flex items-center gap-5">
        <SummaryDonut />
        <div className="flex flex-col gap-2.5 min-w-0">
          {SUMMARY_SEGMENTS.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
              <span className="text-gray-700 whitespace-nowrap">{s.label}</span>
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {s.value} ({s.pct})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VITALS: { label: string; value: string; cls: string }[] = [
  { label: "BP", value: "120/80 mmHg", cls: "text-emerald-600" },
  { label: "Pulse", value: "78 bpm", cls: "text-blue-600" },
  { label: "Temperature", value: "36.8 °C", cls: "text-emerald-600" },
  { label: "Respiratory Rate", value: "18 /min", cls: "text-blue-600" },
  { label: "SpO2", value: "98 %", cls: "text-blue-600" },
  { label: "Weight", value: "72.4 kg", cls: "text-emerald-600" },
  { label: "Height", value: "175 cm", cls: "text-blue-600" },
  { label: "BMI", value: "23.7", cls: "text-orange-500" },
];

function LatestVitalsCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-1">
        <h2 className="text-base font-bold text-slate-900">Latest Vitals</h2>
        <span className="text-xs text-gray-400 whitespace-nowrap">May 22, 2026 10:20 AM</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {VITALS.map((v) => (
          <div key={v.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{v.label}</span>
            <span className={`font-semibold ${v.cls}`}>{v.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CHRONIC_CONDITIONS = [
  { name: "Hypertension", date: "Diagnosed: Jan 10, 2020" },
  { name: "Type 2 Diabetes Mellitus", date: "Diagnosed: Mar 15, 2021" },
];

function ChronicConditionsCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-900 mb-4">Chronic Conditions</h2>
      <div className="flex flex-col gap-3">
        {CHRONIC_CONDITIONS.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{c.name}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">{c.date}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function PatientTimelineForm() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto flex flex-col gap-5">
      <Breadcrumb />
      <PageHeader />
      <PatientInfoBanner />
      <ControlsBar />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3 xl:col-span-2">
          <TimelineFiltersCard />
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-7">
          <PatientTimelineCard />
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          <TimelineSummaryCard />
          <LatestVitalsCard />
          <ChronicConditionsCard />
        </div>
      </div>
    </div>
  );
}
