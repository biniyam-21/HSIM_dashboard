<div align="center">

# 🏥 HMIS — Hospital Management Information System

**A high-fidelity, enterprise-grade dashboard for modern hospital operations.**

Registration • Clinical Care • Diagnostics • Pharmacy • Billing • Analytics — one connected platform.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hsim--dashboard.vercel.app-0F766E?style=for-the-badge&logo=vercel&logoColor=white)](https://hsim-dashboard.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)

**[🚀 View Live Demo](https://hsim-dashboard.vercel.app/)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo & Credentials](#-live-demo--credentials)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Routing Architecture](#-routing-architecture)
- [Design System](#-design-system)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🩺 Overview

**HMIS** is a pixel-perfect, high-fidelity front-end mockup of a modern **Hospital Management Information System** — the kind of enterprise SaaS product hospitals use to run every department from a single platform, in the spirit of Epic, Cerner, and Oracle Health.

It ships with a fully-designed **authentication flow**, a **collapsible enterprise navigation system** covering 7 functional domains and 50+ documented sub-modules, a **live analytics dashboard** with hand-built charts, and a consistent **"under development" experience** for every module still on the roadmap — so the entire product feels complete and navigable end-to-end, even where the underlying workflows aren't built yet.

> This is a front-end design system and interactive prototype. Authentication is intentionally a **demo flow** — any credentials will sign you in — and most sub-module pages are placeholders describing what's coming next.

---

## 🔗 Live Demo & Credentials

**Production URL:** **[https://hsim-dashboard.vercel.app/](https://hsim-dashboard.vercel.app/)**

The sign-in screen is pre-filled with demo credentials — just click **Sign In**:

| Field | Value |
|---|---|
| **Username** | `admin@orbithmis.com` |
| **Password** | `Demo@2026` |

> 🔓 **Demo Mode** — no real authentication is performed. Any input will successfully sign you in.

---

## ✨ Features

### 🔐 Authentication
- Split-screen sign-in experience with an animated brand panel and a clean credentials form
- Pre-filled demo credentials with a password visibility toggle
- Simulated auth transition using the custom **Health Pulse Loader**
- Consistent **Logout** flow accessible from two standard locations — the sidebar profile menu and the top-bar facility switcher — both routing back to the sign-in screen

### 🧭 Enterprise Navigation
- **7 functional groups**, **26 top-level modules**, **170+ documented sub-routes** — derived from real HMS functional requirements, not generic filler pages
- Fully **collapsible sidebar**: expanded (260px) ⇄ icon-only rail (72px) on desktop, off-canvas drawer with backdrop on mobile
- Accordion-style module expansion with active-route highlighting and auto-expand on deep-link
- Single source of truth for navigation data ([`lib/navigation.ts`](lib/navigation.ts)) — sidebar labels and routes can never drift apart

### 📊 Dashboard
- Six live KPI cards (OPD/IPD patients, ER cases, lab tests, revenue, bed availability) with trend indicators and a circular occupancy gauge
- Hand-built **SVG charts** — no charting library:
  - Smooth multi-series line chart (patient flow)
  - Interactive bar chart with **per-bar hover tooltips**
  - Thick donut chart (department distribution)
- Bed occupancy & top-services progress breakdowns, system announcements, quick-action shortcuts, and a live system-status panel

### 🚧 "Under Development" Experience
- Every one of the 170+ sub-module links resolves to a real route (`/modules/<module>/<submodule>`)
- Consistent, on-brand placeholder page with contextual breadcrumbs, the module's own icon, and a "Back to Dashboard" action — so the whole product feels navigable, not broken

### 💓 Health Pulse Loader
- A custom-animated ECG/heartbeat waveform (pure SVG + Tailwind keyframes, no GIFs or external assets)
- Used as the route-level `loading.tsx` for lazy-loaded module transitions, and reused decoratively on the login screen for full visual consistency

### 📱 Fully Responsive
- Sidebar becomes a rail on desktop and a slide-over drawer on mobile
- Dashboard grid collapses from a 3-column subgrid layout to a single stacked column below `lg`
- Every table, chart, and card adapts down to phone widths without horizontal overflow

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Route Groups, Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) (custom theme, keyframe animations) |
| **Icons** | [lucide-react](https://lucide.dev/) |
| **Fonts** | Inter (body), Space Grotesk (headings & KPIs), IBM Plex Mono (identifiers) |
| **Charts** | Hand-authored inline SVG — zero charting dependencies |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd HSM

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll land on the sign-in screen — the demo credentials are pre-filled, so just click **Sign In**.

---

## 📁 Project Structure

```
HSM/
├── app/
│   ├── page.tsx                       # Sign-in screen (root "/")
│   ├── layout.tsx                     # Root layout — fonts, metadata
│   ├── error.tsx                      # Global error boundary
│   ├── globals.css                    # Tailwind directives, CSS variables, scrollbar theming
│   └── (protected)/                   # Route group — shares the dashboard shell
│       ├── layout.tsx                 # Wraps children in <DashboardShell>
│       ├── loading.tsx                # Health Pulse Loader (route-level Suspense)
│       ├── error.tsx                  # Scoped error boundary
│       ├── dashboard/
│       │   └── page.tsx               # Main analytics dashboard
│       └── modules/
│           └── [...slug]/
│               └── page.tsx           # Catch-all → "Under Development" page
│
├── components/
│   ├── DashboardShell.tsx             # Sidebar + TopBar shell, owns collapse/logout state
│   ├── Sidebar.tsx                    # Collapsible nav, accordion, profile menu
│   ├── TopBar.tsx                     # Search, quick actions, notifications, facility switcher
│   ├── ContentHeader.tsx              # Greeting banner + KPI card grid
│   ├── MainGrid.tsx                   # Charts, tables, progress panels
│   ├── UnderDevelopment.tsx           # Placeholder page for unbuilt modules
│   ├── HealthPulseLoader.tsx          # Animated ECG loading indicator
│   └── BrandMark.tsx                  # The HMIS product mark (shared SVG)
│
├── lib/
│   └── navigation.ts                  # Single source of truth for all nav data + slug resolver
│
├── tailwind.config.ts                 # Theme extensions — fonts, custom keyframes
└── next.config.js
```

---

## 🧩 Routing Architecture

The app uses a Next.js **route group**, `(protected)`, so the sidebar and top bar persist across navigation without remounting:

```
/                     →  Sign-in (standalone, no shell)
/dashboard            →  (protected)/layout.tsx  →  DashboardShell  →  dashboard/page.tsx
/modules/x/y          →  (protected)/layout.tsx  →  DashboardShell  →  modules/[...slug]/page.tsx
```

- `(protected)/layout.tsx` renders the persistent `<DashboardShell>` **once**; `{children}` is the slot for whichever page is active.
- `(protected)/loading.tsx` wraps that `{children}` slot in a Suspense boundary — so navigating between the dashboard and any module shows the **Health Pulse Loader** in the content area while the sidebar and top bar stay mounted and interactive.
- Both `dashboard/page.tsx` and `modules/[...slug]/page.tsx` are async Server Components with a brief artificial delay, purely so the loading state is demonstrable during local navigation.
- `lib/navigation.ts` exports both the nav tree **and** a `findNavEntry()` resolver, so a URL like `/modules/patient-management/patient-registration` can be traced back to its group, module, and display label for accurate breadcrumbs.

---

## 🎨 Design System

### Color Palette

| Swatch | Hex | Usage |
|---|---|---|
| 🟢 | `#032B2B` | Sidebar background (deep teal) |
| 🟢 | `#0A4A4A` | Active nav item background |
| 🟢 | `#26A69A` | Mint accent — active text, badges |
| 🟢 | `#0F766E` | Primary brand teal — buttons, links, icons |
| 🟢 | `#159A8C` | Quick actions / primary CTA |
| ⚪ | `#F8FAFC` | Dashboard content background |
| ⚫ | `#0F172A` | Primary heading text |
| 🔘 | `#64748B` | Secondary / muted text |
| 🟡 | `#C79A46` | Gold accent — hospital branding ring |

### Typography

| Role | Font | Weight |
|---|---|---|
| Headings & KPI figures | **Space Grotesk** | 600–700 |
| Body, tables, labels | **Inter** | 400–600 |
| Identifiers / monospace | **IBM Plex Mono** | 400–500 |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## ☁️ Deployment

The project is deployed on **Vercel**:

**🔗 [https://hsim-dashboard.vercel.app/](https://hsim-dashboard.vercel.app/)**

To deploy your own instance, push to a Git repository and import it into [Vercel](https://vercel.com/new) — no additional configuration is required.

---

## 🗺 Roadmap

Every sidebar sub-module currently resolves to a consistent **"Under Development"** placeholder. Planned build-out follows the same functional groupings already mapped in [`lib/navigation.ts`](lib/navigation.ts):

- [ ] Patient & Clinical workflows (registration, OPD/IPD, ER, ICU, OT)
- [ ] Diagnostics & Laboratory (LIS, radiology, PACS, AI report writer)
- [ ] Pharmacy & Inventory management
- [ ] Finance, Billing & Insurance claims
- [ ] HR, Payroll & Asset management
- [ ] Reports & Analytics builder
- [ ] Multi-tenant system settings & RBAC

---

<div align="center">

**© 2026 Orbit Technology Solutions PLC.** All rights reserved.

</div>
