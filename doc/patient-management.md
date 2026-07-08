# Patient Management — Frontend Design Documentation

> **Module:** Patient Management
> **Location in navigation:** `PATIENT & CLINICAL > Patient Management`
> **Route prefix:** `/modules/patient-management/<child-slug>`
> **Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React
> **Design system color:** Teal (`teal-700` primary, `teal-50` accent), white cards, `slate-900` headings, `gray-*` neutrals

---

## Table of Contents

1. [Patient Registration](#1-patient-registration)
2. [Patient Search](#2-patient-search)
3. [Duplicate Management](#3-duplicate-management)
4. [National ID Verification](#4-national-id-verification)
5. [Demographics & Contacts](#5-demographics--contacts)
6. [Consent & Documents](#6-consent--documents)
7. [Patient Timeline](#7-patient-timeline)
8. [Shared Components](#8-shared-components)

---

## 1. Patient Registration

**Route:** `/modules/patient-management/patient-registration`
**Component:** `components/PatientRegistrationForm.tsx`
**Status:** Implemented

### Description

A structured, multi-step form that captures all information required to create a new patient record in the HMS. It is the entry point for all first-time patients visiting any department. The form is designed for front-desk staff and admissions clerks.

### Layout

Two-column layout (`8/4` column split on large screens):

- **Left column (main form area):** Sequential form cards
- **Right column (sidebar):** Patient photo upload + quick action shortcuts

### Form Sections

| Card | Fields |
|---|---|
| Basic Information | First Name, Middle Name, Last Name, Gender, Date of Birth, Age (auto-calculated, read-only), Nationality, Religion, Marital Status, Occupation, Preferred Language, Blood Group, MRN (auto-generated), Fayda National ID (optional, with Verify action) |
| Identification | ID Type (National ID / Passport / Driving License / Kebele ID), ID Number, ID Issue Date, ID Expiry Date |
| Initial Visit Information | Visit Type (OPD / IPD / Emergency), Visit Date, Referred From (optional), Department, Notes (optional textarea) |
| Patient Photo (sidebar) | Photo uploader — `PatientPhotoUploader` component (drag/drop or file select) |
| Quick Actions (sidebar) | Check for Duplicates, Scan ID Document, Clear Form |

### Stepper

Five-step progress indicator using the `Stepper` component, active on step 1:

```
Patient Information → Contact & Address → Insurance & Next of Kin → Additional Information → Review & Confirm
```

### Action Bar

| Button | Behavior |
|---|---|
| Cancel | Links back to `/dashboard` |
| Save as Draft | Saves partial record |
| Next Step | Advances to step 2 with arrow icon |

### Requirements

- MRN must be auto-generated (format: `MRN-YYYY-XXXXXX`).
- Fayda National ID field includes an inline "Verify" button that triggers the National ID Verification flow.
- Date of Birth automatically computes Age.
- Required fields: First Name, Last Name, Gender, Date of Birth, Nationality, Visit Type, Visit Date, Department.
- Photo upload is optional at registration but encouraged.

### Workflow

```
Admissions clerk opens form
  → Fills Basic Information (step 1 active)
  → Optionally clicks "Check for Duplicates" to detect existing records
  → Optionally scans ID document
  → Clicks "Next Step" to proceed through remaining 4 steps
  → "Review & Confirm" on step 5 before final save
  → Record is created and MRN is assigned
```

---

## 2. Patient Search

**Route:** `/modules/patient-management/patient-search`
**Component:** `components/PatientSearchForm.tsx`
**Status:** Implemented

### Description

A full-featured patient lookup screen. Staff can search by any combination of identifiers and view paginated results in a sortable table. From the results table, they can navigate to the patient record, view clinical chart, or trigger further actions.

### Layout

Two-column layout (`8/4` column split on large screens):

- **Left column:** Search criteria card + results table
- **Right column:** Saved searches, quick actions, search tips

### Search Criteria Card

| Field | Type | Options / Notes |
|---|---|---|
| Search By | Select | All Fields, Name, MRN, Phone, National ID |
| Full Name | Text | Free text |
| MRN | Text | Free text |
| Phone Number | Text | Free text |
| National ID / Fayda ID | Text | Free text |
| Date of Birth | Date | DD/MM/YYYY format |
| Gender | Select | All, Female, Male |
| Blood Group | Select | All, O+, O-, A+, A-, B+, B-, AB+, AB- |
| Department | Select | All Departments + department list |
| Visit Date Range | Date range | From / To date pickers |
| Show inactive/merged patients | Toggle | Off by default |

Actions: **Clear** (resets all fields), **Search** (executes query).

### Results Table

Columns: Patient (avatar + name + Fayda ID + blood group), MRN, Gender / Age (with DOB sub-row), Phone, Last Visit (with visit context sub-row), Status badge, Actions.

**Status badges:**
- `Active` — emerald
- `Inactive` — gray
- `Merged` — amber

**Row actions:** View patient (Eye icon), View chart (FileText icon), More options (MoreVertical icon).

**Sort options:** Last Visit (Recent), Name (A-Z), MRN.

**Export:** "Export Results" button exports the current result set.

### Pagination

Shows `1 to N of total results`. Page buttons + `...` ellipsis + last page. Per-page selector: 5 / 10 / 25.

### Right Sidebar

- **Saved Searches:** Dropdown to load a saved search + "Manage Saved Searches" button.
- **Quick Actions:** Register New Patient, Check for Duplicates, Scan National ID.
- **Search Tips:** Wildcard hint (`Sel*`), minimum characters, date format guidance.

### Floating Action Button

"Chat Support" button fixed to `bottom-right` for contextual help.

### Requirements

- Search must support wildcard (`*`) queries.
- Inactive and merged patients are hidden by default and shown only when the toggle is enabled.
- Results table must support export to CSV/Excel.
- Minimum 2 characters required for name-based search.

### Workflow

```
Staff opens Patient Search
  → Enters at least one search criterion
  → Clicks "Search"
  → Reviews paginated results table
  → Clicks Eye icon to open patient record
  → Or clicks FileText icon to open clinical chart
  → Or clicks "Register New Patient" quick action if not found
```

---

## 3. Duplicate Management

**Route:** `/modules/patient-management/duplicate-management`
**Component:** `UnderDevelopment` placeholder
**Status:** Under Development (UI not yet implemented)

### Description

A dedicated workflow to detect, review, and resolve duplicate patient records in the system. Duplicates can arise from multiple registrations of the same patient across departments or facilities.

### Planned Requirements

- Automatic detection of potential duplicates based on name similarity, date of birth, phone number, and National ID.
- Side-by-side comparison view of two suspected duplicate records.
- Merge action that consolidates all encounters, documents, and clinical data from the secondary record into the primary record.
- Audit trail for all merge operations (who merged, when, what was merged).
- Ability to mark two records as "Not a Duplicate" to dismiss the alert.
- Bulk review queue for all pending duplicate suspects.

### Planned Workflow

```
System flags two records as potential duplicates
  → Staff opens Duplicate Management queue
  → Reviews side-by-side comparison of fields
  → Confirms or dismisses duplicate
  → If confirmed: selects primary record, triggers merge
  → System consolidates records and marks secondary as "Merged"
  → Audit entry logged
```

---

## 4. National ID Verification

**Route:** `/modules/patient-management/national-id-verification`
**Component:** `components/NationalIdVerificationForm.tsx`
**Status:** Implemented

### Description

Verifies a patient's identity against the Ethiopian Fayda National ID system in real time. Used both standalone and as an inline step during Patient Registration. Displays retrieved biographic data and ID photo from the external system. Enforces consent capture before using the ID for identification.

### Layout

Three-zone layout:

- **Top row (5/7 split):** Enter National ID card + Verification Result card | National ID Information card
- **Bottom row (3 equal columns):** Match with Existing Patient | Consent & Legal | Recent Verifications

### Stepper

Four-step flow:

```
Enter National ID → Verify with National ID System → Review & Confirm → Link to Patient Record
```

### Sections

#### Enter National ID Card
- ID Type selector (Fayda National ID / Kebele ID / Passport)
- National ID Number text input
- Inline "Verify ID" button
- Info callout: explains consent requirement and the Fayda system

#### Verification Result Card
- Success badge ("Verified Successfully" — emerald)
- Confirmation message
- Large checkmark indicator in green circle
- Result rows: Verification Date, Verified By (staff member), Reference Number, Status
- Compliance footer: data usage locked to MOH-compliant patient identification only

#### National ID Information Card
- Two-thirds column: key-value rows for Full Name (English + Amharic), Gender, Date of Birth, Nationality, Place of Birth, ID Issue Date, ID Expiry Date, ID Status, ID Type — each with a Lucide icon
- One-third column: Valid ID badge, ID photo (portrait from Fayda system), "View Full ID Document" button

#### Match with Existing Patient Card
- If no match found: green success callout + "Register New Patient" primary button + "Search Again" secondary button
- If match found: displays the matched patient record with a "Link to Existing Patient" option

#### Consent & Legal Card
- Consent declaration text (emerald callout)
- Checkbox: "Consent confirmed" (pre-checked)
- Consent Date/Time field

#### Recent Verifications Card
- List of the day's verifications: avatar, name, ID number, status badge (Verified / Failed), time

### Requirements

- Integration with the Ethiopian Fayda National ID API (all calls encrypted and audit-logged).
- Consent must be confirmed before verification result can be used to populate a patient record.
- Verification reference number must be stored against the patient record.
- Failed verifications must be logged with the reason.
- Compliant with MOH data protection regulations.

### Workflow

```
Staff enters patient's National ID number
  → Selects ID type
  → Clicks "Verify ID"
  → System calls Fayda API
  → On success: result card shows verified status + biographic data
  → Staff reviews data accuracy
  → Confirms consent checkbox
  → Clicks "Register New Patient" or "Link to Existing Patient"
  → Verification reference is stored on the patient record
```

---

## 5. Demographics & Contacts

**Route:** `/modules/patient-management/demographics-contacts`
**Component:** `components/DemographicsContactsForm.tsx`
**Status:** Implemented

### Description

A comprehensive view and edit screen for a patient's demographic and contact data. Accessed from a patient's record after registration. Displays the current patient's information with inline editing across multiple profile sections accessible via tabs.

### Layout

Three-column layout (`9/3` split on large screens):

- **Left/center (9 cols):** Form cards
- **Right sidebar (3 cols):** Patient profile card, Actions panel, Data Quality ring, Quick Info

### Tab Navigation

`PatientProfileTabs` component with underline-style tabs:

```
Demographics | Contact Information | Emergency Contacts | Family | Address | Additional Information
```

Active tab: **Demographics** (shown in detail). Other tabs route to their respective sub-screens.

### Form Cards

#### Personal Information Card
| Field | Notes |
|---|---|
| First Name, Middle Name, Last Name | Required: First + Last |
| Preferred Name | Optional |
| Gender | Required |
| Date of Birth | Required |
| Age | Read-only, auto-calculated |
| Nationality | Required |
| Marital Status, Religion, Occupation, Education Level | Select fields |
| Language Spoken | Tags field (multi-value, e.g. Amharic, English) |
| Ethnicity | Optional select |
| Blood Group | Select |
| RH Factor | Select |

#### Additional Details Card
| Field | Notes |
|---|---|
| Height (cm), Weight (kg) | Numeric inputs |
| BMI | Read-only, auto-calculated with Normal/Overweight/etc. badge |
| Cigarette Smoker, Alcohol Use | Select fields |
| Known Allergies | Free text with info icon tooltip |
| Chronic Conditions | Tags field (multi-value) |
| Special Needs | Free text |
| Physical Disability | Yes/No select; expands details field when "Yes" |

#### Identification Numbers Card
| Field | Notes |
|---|---|
| Fayda National ID | Inline "Verified" badge when confirmed via National ID Verification |
| ID Issue Date, ID Expiry Date | Date fields |
| ID Document Number | Reference from verification |
| Passport, Driving License, Additional ID | Optional fields |
| ID Document | "View Document" button linking to the stored document |

### Right Sidebar

| Card | Content |
|---|---|
| Patient Profile | Photo, full name, MRN, Active badge, Fayda ID with verified tick, registration date |
| Actions | Edit Demographics, Verify National ID, Upload Document, Merge Patient, Print Patient Summary, View Audit History |
| Data Quality | SVG ring chart (96% complete in demo), "View Missing Fields" button |
| Quick Info | Last Visit, Primary Department, Primary Doctor, Phone (Primary), Insurance type |

### Bottom Action Bar

- Compliance note: data security statement + last-updated attribution
- Cancel / Save Changes buttons

### Requirements

- All changes must be saved with a timestamp and the staff member who made the edit (audit trail).
- BMI must be auto-calculated from Height + Weight.
- Data quality score must reflect percentage of mandatory fields completed.
- Fayda ID field shows verified/unverified state.
- Tags fields support adding/removing values inline.

### Workflow

```
Staff opens patient record → navigates to Demographics & Contacts
  → Selects tab (Demographics shown by default)
  → Reviews / edits fields
  → Data Quality ring updates in real-time
  → Clicks "Save Changes"
  → Audit entry logged (staff, timestamp, changed fields)
```

---

## 6. Consent & Documents

**Route:** `/modules/patient-management/consent-documents`
**Component:** `components/ConsentDocumentsForm.tsx`
**Status:** Implemented (Overview + Consents tabs fully built; Documents, Certificates, Identity, Legal, Sharing, Audit Log tabs are placeholders)

### Description

Manages all consent forms and attached documents for a patient. Provides an overview dashboard of consent status, a full consent records table, and document categorization. Supports digital signature requests, scanning, and document sharing between departments.

### Layout

Full-width layout with icon-based tab bar. Patient context is always visible via `PatientInfoBanner`.

### Tab Bar (`IconUnderlineTabs`)

| Tab | Icon | Status |
|---|---|---|
| Overview | LayoutDashboard | Implemented |
| Consents | FileCheck | Implemented |
| Documents | FileText | Placeholder |
| Certificates | Award | Placeholder |
| Identity | Fingerprint | Placeholder |
| Legal | Scale | Placeholder |
| Sharing | Share2 | Placeholder |
| Audit Log | History | Placeholder |

### Overview Tab

#### Stat Cards Row (5 cards)
| Metric | Color |
|---|---|
| Active Consents | Emerald |
| Pending Signature | Amber |
| Expired Consents | Red |
| Total Documents | Blue |
| Shared Documents | Purple |

#### Middle Row (3-column)
- **Consent Status Overview** (3 cols): SVG donut chart showing Active / Pending Signature / Expired / Withdrawn / Emergency Override with legend. "View all consents" link.
- **Recent Activity** (4 cols): Timestamped feed of consent signings, document uploads, pending requests, shares, expiries.
- **Quick Actions** (5 cols): 3x3 grid of icon buttons — Create Consent, Upload Document, Scan Document, Request Signature, Generate Certificate, Share Document, Verify Identity, View Audit Trail, Document Template.

#### Bottom Row
- **Recent Consents** (2/3 width): Table with Consent Type, Encounter ID, Signed By (multi-signer), Signed On, Status badge, Actions (view/send/download + more).
- **Document Categories** (1/3 width): Categorized count list — Clinical Documents, Identity Documents, Medical Certificates, Legal & Medico-Legal, Insurance Documents, Referral & External, Others.

### Consents Tab

Three-column layout (`2 / 7 / 3`):

#### Left: Consent Types sidebar
Filter by type: Treatment, Surgery, Procedure, Anesthesia, Blood Transfusion, Research, Photography, Other — with count badges. "All Consent Types" active state.

#### Left: Consent Status Donut
Small SVG donut: Active / Expired / Revoked with percentages.

#### Center: Consent Records table
Searchable + filterable. Columns: Consent Type (with icon), Purpose/Description, Status badge, Signed On, Valid Until, Signed By (with role), Actions (view + more).

#### Right sidebar
- **Consent Summary:** Total / Active / Expired / Revoked counts in a 2x2 grid.
- **Upcoming Expiry:** Alerts for consents expiring within 30 days.
- **Quick Actions:** Upload Document, Use Template, Print Consent, Request E-Signature.

### Requirements

- Consent records must track: type, purpose, all signatories (patient + doctor), dates, validity period, and status.
- Expired consents must trigger renewal alerts.
- Digital signature requests must be sendable to the patient (email/SMS).
- Documents must be categorized and searchable.
- All consent operations are logged in the Audit Log tab.
- MOH compliance: consent data is stored encrypted and access is restricted to authorized staff.

### Workflow

```
Staff opens Consent & Documents for a patient
  → Overview tab shows at-a-glance status
  → Clicks "New Consent / Document" to create a new record
  → Selects consent type and fills required fields
  → Optionally requests e-signature via "Request E-Signature" quick action
  → Patient receives notification, signs digitally
  → Status updates from "Pending" to "Active"
  → Documents tab stores all uploaded clinical and identity documents
  → Audit Log tab records every action
```

---

## 7. Patient Timeline

**Route:** `/modules/patient-management/patient-timeline`
**Component:** `components/PatientTimelineForm.tsx`
**Status:** Implemented

### Description

A chronological, read-oriented view of the patient's entire clinical history across all departments and visit types. Events are grouped by date and filtered by category. Intended for clinicians and care coordinators to quickly review a patient's care journey.

### Layout

Three-column layout (`2 / 7 / 3` on large screens, `2 / 7 / 3` on XL):

- **Left (2 cols):** Timeline filter sidebar
- **Center (7 cols):** Timeline event feed
- **Right (3 cols):** Summary donut, latest vitals, chronic conditions

Patient context always visible via `PatientInfoBanner`.

### Controls Bar

| Control | Description |
|---|---|
| Encounter type dropdown | Filter by encounter type (All Encounters, OPD, IPD, etc.) |
| Date range picker | Defaults to last 12 months |
| Search input | Search within timeline events |
| Filters button | Advanced filter panel |
| Export button | Download timeline as PDF/CSV |

### Timeline Filters Card (left column)

Filter buttons for event categories, each showing a count badge:

| Category | Count (demo) |
|---|---|
| All Events | 128 |
| Encounters | 24 |
| Clinical Notes | 18 |
| Lab Results | 28 |
| Radiology | 12 |
| Medications | 27 |
| Procedures | 10 |
| Vitals & Measurements | 54 |
| Documents | 21 |
| Referrals | 8 |
| Admissions / Discharges | 6 |

"Reset Filters" button clears active filters.

### Timeline Event Feed (center column)

Events grouped by date, with a "Today" badge on the current day. Each date group has a vertical connecting line between events.

#### Event Card Structure
- **Timestamp** (left, small gray text)
- **Colored circle icon** (event type color-coded)
- **Content card:** Event title (bold), 1–2 detail lines, Status badge, Expand (chevron-down) + More Actions (ellipsis) buttons

#### Event Type Colors
| Event | Circle Color |
|---|---|
| OPD Visit / Encounters | Emerald |
| Lab Results | Blue |
| Document Upload | Orange |
| Clinical Note | Purple |
| Procedure | Red |
| IPD Discharge / Admissions | Sky blue |

#### "Load More Events" button
Paginated loading at the bottom of the feed.

### Right Sidebar

#### Timeline Summary Donut
SVG donut chart totaling 128 events, segmented by: Encounters (emerald), Lab Results (blue), Medications (orange), Documents (purple), Others (gray).

#### Latest Vitals Card
Key-value pairs with color-coded values: BP, Pulse, Temperature, Respiratory Rate, SpO2, Weight, Height, BMI. Timestamped to last measurement.

#### Chronic Conditions Card
List of diagnosed chronic conditions with diagnosis date and Active status badge.

### Requirements

- Timeline must aggregate events from all HMS modules (OPD, IPD, Lab, Radiology, Pharmacy, Nursing, etc.).
- Events must be filterable by type and date range.
- Full-text search must work across event titles and descriptions.
- Expanding an event card must show full clinical detail (notes, results, etc.).
- Export must produce a patient-facing summary document.
- Read-only by default; edits redirect to the source module.

### Workflow

```
Clinician opens Patient Timeline from the patient record
  → PatientInfoBanner shows patient context at a glance
  → All events shown by default, grouped by date
  → Clinician filters by category (e.g. Lab Results only)
  → Or searches for a specific event keyword
  → Expands a card to read full detail
  → Navigates to the source module to edit if needed
  → Exports timeline PDF for referral or patient copy
```

---

## 8. Shared Components

These components are reused across all Patient Management screens.

### `ModulePageHeader`

Renders the page title and breadcrumb trail. Props: `title`, `breadcrumb`.

### `Stepper`

Horizontal step indicator. Props: `steps: string[]`, `activeStep: number` (1-indexed). Used in Patient Registration and National ID Verification.

### `PatientInfoBanner`

A dense horizontal banner showing: patient photo, name, MRN, phone, Age/DOB, Blood Group, Insurance, Current Visit ID, Attending Doctor, Ward/Department. Used in Consent & Documents and Patient Timeline to anchor the user's context to a specific patient.

### `PatientProfileTabs`

Underline-style horizontal tab navigation for patient sub-sections. Props: `tabs: string[]`, `active: string`. Used in Demographics & Contacts.

### `IconUnderlineTabs`

Tab bar where each tab has a Lucide icon + label. Props: `tabs: IconTab[]`, `active: string`, `onChange`. Used in Consent & Documents.

### `PatientPhotoUploader`

Drag-and-drop / file-select photo uploader. Displays preview of uploaded photo. Used in Patient Registration sidebar.

### `FormFields` (shared field components)

| Export | Description |
|---|---|
| `Card` | White bordered card wrapper with optional `title` prop |
| `FieldLabel` | Styled `<label>` with optional `required` asterisk and info icon |
| `TextField` | Text input with optional icon, readOnly, defaultValue |
| `SelectField` | Styled `<select>` with ChevronDown icon |
| `ActionInputField` | Text input with an inline action button (e.g. Generate, Verify) |
| `TagsField` | Displays a list of removable tag pills |
| `Avatar` | Circular avatar — shows photo or initials fallback |
| `ComplianceNote` | Bottom-of-page compliance disclaimer with lock/shield icon |

### `DatePicker`

Standalone date picker component. Used via the `icon={CalendarIcon}` pattern in `TextField` across all forms.

---

## Design Conventions

| Convention | Value |
|---|---|
| Primary action button | `bg-teal-700 hover:bg-teal-800`, white text, `h-10`, `px-5`, rounded-md |
| Secondary / outline button | `border border-gray-300`, gray text, same sizing |
| Danger / warning | amber (`amber-50` / `amber-600`) or red (`red-50` / `red-600`) |
| Card wrapper | `bg-white border border-gray-200 rounded-lg shadow-sm p-5` |
| Status badge — Active | `bg-emerald-50 text-emerald-700` rounded-full |
| Status badge — Inactive | `bg-gray-100 text-gray-600` |
| Status badge — Merged / Pending | `bg-amber-100 text-amber-700` |
| Status badge — Expired / Revoked | `bg-red-50 text-red-600` |
| Page max-width | `max-w-[1600px]` to `max-w-[1800px]` depending on screen density |
| Responsive grid | 12-column, `lg:col-span-*` breakpoints, stacks to single column on mobile |
| Typography — headings | `font-bold text-slate-900` |
| Typography — labels | `text-sm text-gray-500` |
| Typography — body | `text-sm text-gray-700` |
| Icons | Lucide React, `size={15-17}`, `strokeWidth={1.8-2.5}` |
