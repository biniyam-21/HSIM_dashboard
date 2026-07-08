# Appointments & Queue Module

Seven screens covering the full patient flow from booking to being seen: scheduling, calendar/resource management, live queue operations, the public token display, front-desk check-in/out, no-show recovery, and inter-facility referrals. Routed through the shared `[...slug]` catch-all at `app/(protected)/modules/[...slug]/page.tsx`, registered in `BUILT_PAGES` under the `appointments-queue/*` prefix (module slug comes from the `Appointments & Queue` entry in `lib/navigation.ts`).

Shared mock data for the whole module lives in `lib/appointmentsQueueData.ts` (hospitals, departments, doctors, patients, insurance, status/priority style maps, ID formatters) — unlike Patient Management, this module centralizes mock data because every screen must reference the same patients/doctors/departments to feel like one coherent system. Shared badges live in `components/AppointmentBadges.tsx` (`StatusBadge`, `QueueBadge`, `PriorityBadge`).

---

## 1. Appointment Scheduling

**Route:** `/modules/appointments-queue/appointment-scheduling`
**Component:** `components/AppointmentSchedulingForm.tsx`

A 4-step wizard (`Stepper`) for booking an appointment, with a persistent right-column context sidebar.

| Step | Content |
|---|---|
| 1. Find / Register Patient | Live-filtered patient search (name/MRN/phone) against `PATIENTS`; inline "Quick Register" panel for walk-ins who aren't in the system yet |
| 2. Visit Details | Department, specialty (derived from department's doctors), visit type, appointment type, referral source, priority, insurance, preferred language, interpreter toggle, estimated duration, symptoms/notes textareas |
| 3. Provider & Slot | Provider cards filtered by department, date picker, time-slot grid (available/booked/blocked states), a smart-suggestion callout, and a dismissible duplicate-appointment warning banner |
| 4. Review & Confirm | Full summary with per-field "Edit" jump links back to the owning step; confirming shows a success state with the generated `APT-2026-XXXXXX` ID |

**Right sidebar (persistent across all steps):** Quick Patient Card (updates once a patient is selected), Today's Provider Schedule (capacity bars), Next Available Slots, Waiting Patients teaser (links to Queue Management), Recently Booked Appointments.

---

## 2. Slot & Calendar Management

**Route:** `/modules/appointments-queue/slot-calendar-management`
**Component:** `components/SlotCalendarManagementBoard.tsx`

Stats panel (Appointments Today, Cancelled, Completed, Available Slots, Utilization) above a filter bar (Department / Doctor / Facility / Appointment Type + date navigation) and an `IconUnderlineTabs` view switcher:

- **Monthly** — full 6-week grid with per-day appointment/cancellation counts.
- **Weekly** — 7-day × hourly grid with positioned appointment blocks color-coded by department.
- **Daily** — one row per doctor, a strip of hourly cells highlighting booked slots.
- **Timeline** — resource-timeline bars per doctor across the day (drag-and-drop and context-menu behavior are described in the sidebar's "Quick Actions" card as the intended interaction model; not wired to real DnD in this mock).

**Right sidebar:** Doctor Availability (on-duty status), Blocked Periods & Leaves, department color-coding legend, a note on right-click context actions.

---

## 3. Queue Management

**Route:** `/modules/appointments-queue/queue-management`
**Component:** `components/QueueManagementBoard.tsx`

The module's flagship "live ops" screen. KPI row (In Queue, Now Serving, Avg Wait, Completed Today, Missed/Cancelled) + a Smart Queue auto-reorder banner, then a tabbed queue table (All Queue / Now Serving / Waiting / Completed / Missed / Transferred) with search + department filter.

Table columns: Token, Patient, Appt Time, Department/Doctor, Elapsed (color-escalates past 20/40 min), Est. Wait, Priority badge, Status badge, Actions. Row actions (Call, Skip, Transfer, Complete, Hold, Cancel) are context-sensitive to the ticket's current status and mutate local state so the board feels live. Emergency/High-Risk rows get a red tint.

**Right sidebar:** Priority Patients breakdown (Emergency/VIP/Senior/Pregnant/Children counts), Queue Heat Map (per-department load bars), Queue Timeline (recent queue events feed).

---

## 4. Token Display Board

**Route:** `/modules/appointments-queue/token-display-board`
**Component:** `components/TokenDisplayBoard.tsx`

The only screen in the module that intentionally breaks from the light theme — a dark, high-contrast public display meant for a waiting-room TV. Large "Now Serving" token, next-up list, a live clock (client-only, ticks via `setInterval`), a pulsing emergency alert banner, a scrolling announcement ticker (CSS keyframe marquee), and a QR panel for mobile queue tracking. A fullscreen toggle expands the board to cover the viewport (kiosk mode); an "Exit display mode" link returns to the dashboard shell.

---

## 5. Check-In / Check-Out

**Route:** `/modules/appointments-queue/check-in-check-out`
**Component:** `components/CheckInCheckOutForm.tsx`

Front-desk workflow driven by a `Stage` state machine: `search → arrived → in-visit → checked-out`.

- **Search stage** — name/MRN/phone search plus QR/barcode scan buttons.
- **Arrived/in-visit stage** — patient banner with appointment context, Fayda ID + insurance verification chips, a pre-visit checklist (arrival, vitals, forms, payment — each toggleable), and the full quick-action bar (Check In, Print Queue Ticket, Print Labels, Print Visit Slip, Generate Encounter, Start Visit, Check Out) with buttons enabled only for the stage they apply to.
- **Checked-out stage** — visit summary (encounter ID, duration, outcome), a follow-up scheduling prompt, and a 5-star feedback control.

**Right sidebar:** Today's Arrivals (click to load a patient straight into the flow), Reception Stats.

---

## 6. No-Show & Rescheduling

**Route:** `/modules/appointments-queue/no-show-rescheduling`
**Component:** `components/NoShowReschedulingForm.tsx`

KPI row (No-Show Rate, Cancellation Rate, Rescheduled, Recovered Appointments) above a tabbed list (Today's No-Shows / Cancelled / Late Arrivals). Each row shows contact-attempt icons (SMS/Email/Call, lit when attempted) and a reason string. Clicking "Reschedule" opens an inline wizard card with suggested slots; confirming removes the row from its current tab (simulating recovery).

**Right sidebar:** Rebook Suggestions (policy nudge), Patient Contact History feed.

---

## 7. Referral Management

**Route:** `/modules/appointments-queue/referral-management`
**Component:** `components/ReferralManagementForm.tsx`

Incoming/Outgoing tab switch over a card list of referrals (patient, from/to facility, referring provider, reason, priority, attachment count). Selecting a referral reveals its Status Timeline (`Requested → Accepted → Scheduled → Completed`, or a terminal "Declined" state) with stage-appropriate actions (Accept/Decline while Requested, Book Appointment once Accepted). A "Create Outgoing Referral" form sits below for initiating new referrals.

**Right sidebar:** Referral Analytics (volume, accept rate, turnaround, pending count), per-facility turnaround times.

---

## Shared Components

In addition to the Patient Management shared set (`ModulePageHeader`, `Stepper`, `IconUnderlineTabs`, `FormFields`, `DatePicker`), this module adds:

### `AppointmentBadges` (`components/AppointmentBadges.tsx`)

| Export | Description |
|---|---|
| `StatusBadge` | Appointment lifecycle pill — Scheduled, Confirmed, Checked In, Waiting, In Progress, Completed, Cancelled, Rescheduled, No Show |
| `QueueBadge` | Live queue ticket pill — Waiting, Called, Serving, Transferred, Completed, Missed, Cancelled |
| `PriorityBadge` | Priority pill — Routine, Urgent, Emergency, VIP, High Risk |

### `lib/appointmentsQueueData.ts`

Central mock data + types: `HOSPITALS`, `DEPARTMENTS`, `DOCTORS`, `PATIENTS`, `INSURANCE_OPTIONS`, status/priority style maps, and formatters `appointmentId()`, `encounterId()`, `queueToken()`, `toISO()`. ID conventions: `APT-2026-000123` (appointments), `ENC-2026-000123` (encounters), `<DEPT>-045` (queue tokens, e.g. `GM-024`) — consistent with Patient Management's `MRN-2026-000123` format.

---

## Design Conventions

Follows the same conventions documented in `doc/patient-management.md` (primary/secondary buttons, card wrapper, page max-width, typography, icon sizing). Additions specific to this module:

| Convention | Value |
|---|---|
| Status badge — Scheduled/Confirmed | `bg-sky-50 text-sky-700` / `bg-teal-50 text-teal-700` |
| Status badge — Cancelled/No Show | `bg-red-50 text-red-600` / `bg-red-100 text-red-700` |
| Priority badge — Emergency/High Risk | `bg-red-100 text-red-700` / `bg-rose-100 text-rose-700` |
| Priority badge — VIP | `bg-violet-100 text-violet-700` |
| Department color chips | keyed via `deptChipClass()` — teal/sky/red/amber/pink/violet/rose/indigo, `bg-{c}-50 text-{c}-700` |
| Token Display Board | only screen using a dark theme (`bg-[#06141a]`) — intentional exception for public kiosk display |
