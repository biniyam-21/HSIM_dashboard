"use client";

import { useState } from "react";
import {
  Home,
  Users,
  CalendarClock,
  Stethoscope,
  BedDouble,
  Siren,
  HeartPulse,
  Scissors,
  Activity,
  FlaskConical,
  ScanLine,
  Bot,
  Images,
  Pill,
  Package,
  ShoppingCart,
  ReceiptText,
  ShieldCheck,
  Landmark,
  UsersRound,
  CalendarCheck,
  Boxes,
  BarChart3,
  FileText,
  UserCog,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type Child = { label: string };

type Item = {
  label: string;
  icon: LucideIcon;
  badge?: string;
  children: Child[];
};

type Group = {
  title: string;
  items: Item[];
};

/* ============================================================================
   Enterprise HMS navigation — every top-level module expanded into documented,
   workflow-based subroutes (Epic / Cerner / Oracle Health style).
   ========================================================================== */
const GROUPS: Group[] = [
  {
    title: "PATIENT & CLINICAL",
    items: [
      {
        label: "Patient Management",
        icon: Users,
        children: [
          { label: "Patient Registration" },
          { label: "Patient Search" },
          { label: "Duplicate Management" },
          { label: "National ID Verification" },
          { label: "Demographics & Contacts" },
          { label: "Consent & Documents" },
          { label: "Patient Timeline" },
        ],
      },
      {
        label: "Appointments & Queue",
        icon: CalendarClock,
        children: [
          { label: "Appointment Scheduling" },
          { label: "Slot & Calendar Management" },
          { label: "Queue Management" },
          { label: "Token Display Board" },
          { label: "Check-In / Check-Out" },
          { label: "No-Show & Rescheduling" },
          { label: "Referral Management" },
        ],
      },
      {
        label: "OPD Management",
        icon: Stethoscope,
        children: [
          { label: "OPD Registration" },
          { label: "Triage & Vitals" },
          { label: "Consultation" },
          { label: "Clinical Notes (EMR)" },
          { label: "Prescriptions" },
          { label: "Investigation Orders" },
          { label: "Follow-Up Scheduling" },
        ],
      },
      {
        label: "IPD Management",
        icon: BedDouble,
        children: [
          { label: "Admission" },
          { label: "Bed Allocation" },
          { label: "Ward Management" },
          { label: "Transfers" },
          { label: "Doctor Rounds & Progress Notes" },
          { label: "Nursing Orders" },
          { label: "Discharge Summary" },
        ],
      },
      {
        label: "Emergency (ER)",
        icon: Siren,
        children: [
          { label: "ER Registration" },
          { label: "Triage & Acuity" },
          { label: "Emergency Bed Board" },
          { label: "Trauma & Critical Care" },
          { label: "Ambulance Dispatch" },
          { label: "ER Observation" },
          { label: "Admission / Referral" },
        ],
      },
      {
        label: "Nursing Management",
        icon: HeartPulse,
        children: [
          { label: "Nursing Station" },
          { label: "Medication Administration Record" },
          { label: "Vitals Charting" },
          { label: "Care Plans" },
          { label: "Intake & Output" },
          { label: "Shift Handover" },
          { label: "Nursing Tasks & Alerts" },
        ],
      },
      {
        label: "Operation Theatre",
        icon: Scissors,
        children: [
          { label: "Surgery Scheduling" },
          { label: "Pre-Operative Assessment" },
          { label: "OT Safety Checklist" },
          { label: "Intra-Operative Notes" },
          { label: "Anesthesia Records" },
          { label: "Recovery Notes (PACU)" },
          { label: "Consumables & Implants" },
          { label: "OT Utilization" },
        ],
      },
      {
        label: "ICU Management",
        icon: Activity,
        children: [
          { label: "ICU Admission" },
          { label: "ICU Bed Board" },
          { label: "Critical Care Charting" },
          { label: "Ventilator Management" },
          { label: "Fluid Balance" },
          { label: "Severity Scoring (APACHE/SOFA)" },
          { label: "ICU Handover" },
        ],
      },
    ],
  },
  {
    title: "DIAGNOSTICS & LABORATORY",
    items: [
      {
        label: "Laboratory (LIS)",
        icon: FlaskConical,
        children: [
          { label: "Test Orders" },
          { label: "Sample Collection" },
          { label: "Sample Tracking" },
          { label: "Result Entry" },
          { label: "Result Validation" },
          { label: "Analyzer Interface" },
          { label: "Pathology" },
          { label: "Quality Control" },
          { label: "Test Catalog" },
        ],
      },
      {
        label: "Radiology (X-Ray, MRI, CT)",
        icon: ScanLine,
        children: [
          { label: "Imaging Orders" },
          { label: "Scheduling & Slots" },
          { label: "Modality Worklist" },
          { label: "Technologist Console" },
          { label: "Reporting & Sign-Off" },
          { label: "Critical Findings Alerts" },
          { label: "Radiology Catalog" },
        ],
      },
      {
        label: "AI Report Writer",
        icon: Bot,
        badge: "New",
        children: [
          { label: "Draft Generator" },
          { label: "Clinical Summaries" },
          { label: "Template Library" },
          { label: "Voice Dictation" },
          { label: "Review & Approval" },
          { label: "Model Settings" },
        ],
      },
      {
        label: "PACS & Image Viewer",
        icon: Images,
        children: [
          { label: "Study Browser" },
          { label: "DICOM Viewer" },
          { label: "Image Comparison" },
          { label: "Annotations & Measurements" },
          { label: "Image Sharing" },
          { label: "Archive & Retrieval" },
        ],
      },
    ],
  },
  {
    title: "PHARMACY & INVENTORY",
    items: [
      {
        label: "Pharmacy Management",
        icon: Pill,
        children: [
          { label: "Prescription Queue" },
          { label: "Dispensing" },
          { label: "Drug Formulary" },
          { label: "Drug Interaction Checks" },
          { label: "Batch & Expiry Tracking" },
          { label: "Narcotics Register" },
          { label: "Returns & Recalls" },
          { label: "Pharmacy Billing" },
        ],
      },
      {
        label: "Inventory & Stock",
        icon: Package,
        children: [
          { label: "Stock Overview" },
          { label: "Goods Receipt (GRN)" },
          { label: "Stock Issue & Requisition" },
          { label: "Inter-Store Transfers" },
          { label: "Stock Adjustments" },
          { label: "Reorder & Par Levels" },
          { label: "Expiry & Batch Management" },
          { label: "Physical Count & Audit" },
        ],
      },
      {
        label: "Procurement",
        icon: ShoppingCart,
        children: [
          { label: "Purchase Requisitions" },
          { label: "Purchase Orders" },
          { label: "Supplier Management" },
          { label: "Quotations & Comparison" },
          { label: "Goods Receipt" },
          { label: "Invoice Matching (3-Way)" },
          { label: "Contracts" },
        ],
      },
    ],
  },
  {
    title: "FINANCE & BILLING",
    items: [
      {
        label: "Billing & Invoicing",
        icon: ReceiptText,
        children: [
          { label: "OPD Billing" },
          { label: "IPD / Interim Billing" },
          { label: "Invoice Management" },
          { label: "Payment Collection" },
          { label: "Deposits & Advances" },
          { label: "Refunds & Adjustments" },
          { label: "Package & Tariff Management" },
          { label: "Credit Notes" },
        ],
      },
      {
        label: "Insurance Management",
        icon: ShieldCheck,
        children: [
          { label: "Payer & Scheme Setup" },
          { label: "Eligibility Verification" },
          { label: "Pre-Authorization" },
          { label: "Claims Submission" },
          { label: "Claim Tracking" },
          { label: "Denial Management" },
          { label: "Reconciliation" },
        ],
      },
      {
        label: "Finance & Accounts",
        icon: Landmark,
        children: [
          { label: "General Ledger" },
          { label: "Accounts Receivable" },
          { label: "Accounts Payable" },
          { label: "Cash & Bank" },
          { label: "Journal Entries" },
          { label: "Cost Centers" },
          { label: "Financial Statements" },
          { label: "Tax Management" },
        ],
      },
    ],
  },
  {
    title: "HR & ADMINISTRATION",
    items: [
      {
        label: "HR & Payroll",
        icon: UsersRound,
        children: [
          { label: "Employee Directory" },
          { label: "Recruitment & Onboarding" },
          { label: "Payroll Processing" },
          { label: "Salary Structure" },
          { label: "Loans & Advances" },
          { label: "Statutory Deductions" },
          { label: "Performance Appraisal" },
          { label: "Credentialing & Licenses" },
        ],
      },
      {
        label: "Attendance & Leave",
        icon: CalendarCheck,
        children: [
          { label: "Attendance Tracking" },
          { label: "Shift & Roster Management" },
          { label: "Duty Scheduling" },
          { label: "Leave Requests" },
          { label: "Leave Balances" },
          { label: "Overtime Management" },
          { label: "Biometric Integration" },
        ],
      },
      {
        label: "Asset Management",
        icon: Boxes,
        children: [
          { label: "Asset Register" },
          { label: "Asset Tracking" },
          { label: "Preventive Maintenance" },
          { label: "Breakdown & Work Orders" },
          { label: "Calibration Schedule" },
          { label: "Depreciation" },
          { label: "Disposal & Retirement" },
        ],
      },
    ],
  },
  {
    title: "REPORTS & ANALYTICS",
    items: [
      {
        label: "Dashboard & Analysis",
        icon: BarChart3,
        children: [
          { label: "Executive Dashboard" },
          { label: "Clinical Analytics" },
          { label: "Financial Analytics" },
          { label: "Operational KPIs" },
          { label: "Bed Occupancy Analytics" },
          { label: "Revenue Cycle Analytics" },
          { label: "Custom Dashboards" },
        ],
      },
      {
        label: "Report Center",
        icon: FileText,
        children: [
          { label: "Regulatory & Statutory Reports" },
          { label: "MOH / Public Health Reports" },
          { label: "Financial Reports" },
          { label: "Clinical Reports" },
          { label: "Ad-Hoc Report Builder" },
          { label: "Scheduled Reports" },
          { label: "Export Center" },
        ],
      },
    ],
  },
  {
    title: "SYSTEM SETTINGS",
    items: [
      {
        label: "User Management",
        icon: UserCog,
        children: [
          { label: "Users & Accounts" },
          { label: "Roles & Permissions" },
          { label: "Access Control (RBAC)" },
          { label: "Departments & Facilities" },
          { label: "Session Management" },
          { label: "Password Policies" },
          { label: "Audit Logs" },
        ],
      },
      {
        label: "System Settings",
        icon: Settings,
        children: [
          { label: "Hospital Profile" },
          { label: "Multi-Tenant / Branch Setup" },
          { label: "Master Data & Code Sets" },
          { label: "Templates & Documents" },
          { label: "Integrations & APIs" },
          { label: "Notifications (SMS/Email)" },
          { label: "Localization & Language" },
          { label: "Backup & Data Retention" },
        ],
      },
    ],
  },
];

/** Minimalist outline medical cross, 2px stroke, pure white. */
function MedicalCross() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

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
}: {
  item: Item;
  collapsed: boolean;
  open: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

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
        <Icon size={18} strokeWidth={1.75} color="#ffffff" className="shrink-0" />
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
          {item.children.map((child) => (
            <button
              key={child.label}
              type="button"
              className="text-left text-[12.5px] leading-snug text-white/65 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors"
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  open = true,
  onExpand,
}: {
  open?: boolean;
  onExpand?: () => void;
}) {
  // Which module is expanded. Accordion state keyed by unique top-level label.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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
        <MedicalCross />
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

      {/* Scrolling menu region */}
      <nav
        className={`sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden pt-[30px] pb-3 flex flex-col ${
          collapsed ? "px-2" : "px-5"
        }`}
      >
        {/* 2. Active Menu Item */}
        <button
          type="button"
          title={collapsed ? "Dashboard" : undefined}
          className={`flex items-center bg-[#0a4a4a] rounded-lg cursor-pointer ${
            collapsed
              ? "justify-center py-2.5"
              : "gap-3 w-full py-[11px] px-3 text-left"
          }`}
        >
          <Home size={collapsed ? 20 : 18} strokeWidth={2} color="#26a69a" className="shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium text-[#26a69a]">Dashboard</span>
          )}
        </button>

        {/* 3 + 4. Groups and their expandable items */}
        {GROUPS.map((group) => (
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
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 5. Sticky Footer */}
      <footer
        className={`pt-3 pb-5 flex flex-col gap-3 border-t border-white/5 ${
          collapsed ? "px-2 items-center" : "px-5"
        }`}
      >
        {collapsed ? (
          <>
            {/* Help */}
            <button
              type="button"
              title="Need Help? — Open Support Ticket"
              className="w-10 h-10 rounded-full bg-[#26a69a] flex items-center justify-center cursor-pointer shrink-0"
            >
              <HelpCircle size={18} strokeWidth={2.25} color="#032b2b" />
            </button>
            {/* Profile */}
            <button
              type="button"
              title="Dr. Eyob Tesfaye — System Administrator"
              className="cursor-pointer shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop&crop=faces"
                alt="Dr. Eyob Tesfaye"
                className="w-9 h-9 rounded-full object-cover bg-[#0a4a4a]"
              />
            </button>
          </>
        ) : (
          <>
            {/* Help Card */}
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

            {/* User Profile Card */}
            <button
              type="button"
              className="flex items-center gap-3 w-full py-2.5 px-3 bg-[#021f1f] rounded-xl border border-white/[0.08] cursor-pointer text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop&crop=faces"
                alt="Dr. Eyob Tesfaye"
                className="w-9 h-9 rounded-full object-cover shrink-0 bg-[#0a4a4a]"
              />
              <span className="flex flex-col leading-[1.2] min-w-0">
                <span className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  Dr. Eyob Tesfaye
                </span>
                <span className="text-[11px] font-normal text-[#8fb0b0] mt-0.5">
                  System Administrator
                </span>
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2}
                color="#7f9a9a"
                className="ml-auto shrink-0"
              />
            </button>
          </>
        )}
      </footer>
    </aside>
  );
}
