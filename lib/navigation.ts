import {
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
  type LucideIcon,
} from "lucide-react";

export type NavChild = { label: string };
export type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
  children: NavChild[];
};
export type NavGroup = { title: string; items: NavItem[] };

/* ============================================================================
   Enterprise HMS navigation — single source of truth. Both the Sidebar and the
   "under development" route resolver read from this list, so labels/routes
   never drift apart.
   ========================================================================== */
export const NAV_GROUPS: NavGroup[] = [
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

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export type NavLookupResult = {
  groupTitle: string;
  moduleLabel: string;
  moduleIcon: LucideIcon;
  childLabel: string;
};

/** Resolves a module/child slug pair back to its display metadata for breadcrumbs. */
export function findNavEntry(
  moduleSlug: string,
  childSlug: string
): NavLookupResult | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (slugify(item.label) !== moduleSlug) continue;
      const child = item.children.find((c) => slugify(c.label) === childSlug);
      if (child) {
        return {
          groupTitle: group.title,
          moduleLabel: item.label,
          moduleIcon: item.icon,
          childLabel: child.label,
        };
      }
    }
  }
  return null;
}
