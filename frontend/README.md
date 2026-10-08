# BloodCare — Frontend

> React 19 + Vite 8 single-page application for the **BloodCare Blood Bank Management System**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Design System](#design-system)
- [Routing](#routing)

---

## Overview

BloodCare is a full-stack blood bank management platform. This directory contains the **React frontend** — a premium, dark-themed SPA that gives blood bank staff a unified dashboard to manage donors, donations, inventory, hospital partners, blood requests, and blood issuance.

The frontend communicates exclusively with the REST API served by the `backend/` service. No data is fabricated or mocked in production flows.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI component framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| Axios | 1 | HTTP client (shared instance) |
| Lucide React | 1 | Icon library |
| Recharts | 3 | Chart components (Reports) |
| Oxlint | 1 | Fast JavaScript linter |

---

## Project Structure

```
frontend/
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json
├── .env                          # Local env (git-ignored)
├── .env.example                  # Env template
└── src/
    ├── main.jsx                  # React root mount
    ├── App.jsx                   # Router setup & protected routes
    ├── index.css                 # Global styles & design tokens
    │
    ├── layouts/
    │   └── DashboardLayout.jsx   # Authenticated shell (sidebar + header)
    │
    ├── components/
    │   ├── layout/               # AppShell, Sidebar, Header, MobileSidebar
    │   ├── ui/                   # Shared primitives (Button, Badge, Card, Input…)
    │   ├── dashboard/            # Dashboard-specific widgets
    │   ├── donations/            # Donation table, filters, modals, skeletons
    │   ├── hospitals/            # Hospital table, form, modals, skeletons
    │   ├── inventory/            # Blood group cards, matrix, alerts, table
    │   ├── issues/               # Issue table, IssueBloodModal, skeletons
    │   └── requests/             # Request table, status modals, badges
    │
    ├── pages/
    │   ├── auth/
    │   │   └── Login.jsx
    │   ├── dashboard/
    │   │   └── Dashboard.jsx
    │   ├── donors/
    │   │   ├── Donors.jsx
    │   │   ├── DonorDetails.jsx
    │   │   └── AddDonor.jsx
    │   ├── donations/
    │   │   ├── Donations.jsx
    │   │   └── AddDonation.jsx
    │   ├── hospitals/
    │   │   ├── Hospitals.jsx
    │   │   └── AddHospital.jsx
    │   ├── inventory/
    │   │   └── Inventory.jsx
    │   ├── requests/
    │   │   ├── Requests.jsx
    │   │   ├── RequestDetails.jsx
    │   │   └── AddRequest.jsx
    │   ├── issues/
    │   │   ├── Issues.jsx
    │   │   └── IssueDetails.jsx
    │   └── reports/
    │       └── Reports.jsx       # Deferred — awaiting backend analytics
    │
    ├── services/
    │   └── api.js                # Shared Axios instance + all service functions
    │
    ├── hooks/
    │   └── useDashboardData.js   # Dashboard data-fetching hook
    │
    └── utils/
        ├── donorHelpers.js
        ├── inventoryHelpers.js
        └── tokens.js
```

---

## Modules

| Module | Route | Status |
|---|---|---|
| Login | `/login` | ✅ Complete |
| Dashboard | `/dashboard` | ✅ Complete |
| Donors | `/donors`, `/donors/:id`, `/donors/add` | ✅ Complete |
| Donations | `/donations`, `/donations/add` | ✅ Complete |
| Hospitals | `/hospitals`, `/hospitals/add` | ✅ Complete |
| Inventory | `/inventory` | ✅ Complete |
| Requests | `/requests`, `/requests/:id`, `/requests/add` | ✅ Complete |
| Issues | `/issues`, `/issues/:id` | ✅ Complete |
| Reports | `/reports` | ⏳ Deferred — pending backend analytics endpoints |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- The `backend/` service running on `http://localhost:5000`

### Install & Run

```bash
# From the frontend/ directory
npm install

# Copy the env template and set your API URL
cp .env.example .env

# Start the development server (hot-reload)
npm run dev
```

The dev server starts at **http://localhost:5174** by default.

---

## Environment Variables

Create a `.env` file in this directory (copy from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the BloodCare REST API | `http://localhost:5000/api` |

> All environment variables must be prefixed with `VITE_` to be exposed to the browser by Vite.

---

## Available Scripts

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # Run Oxlint static analysis
```

---

## API Integration

All HTTP communication is centralised in `src/services/api.js`.

- A **single shared Axios instance** is created with the base URL from `VITE_API_BASE_URL`.
- The `Authorization: Bearer <token>` header is injected automatically from `localStorage` via a request interceptor.
- No page component makes direct `fetch` calls — all data access goes through the service layer.

### Service Namespaces

| Export | Endpoints covered |
|---|---|
| `donorService` | `GET/POST /api/donors`, `GET/PUT /api/donors/:id` |
| `donationService` | `GET/POST /api/donations`, `GET /api/donations/:id` |
| `hospitalService` | `GET/POST /api/hospitals`, `GET/PUT/DELETE /api/hospitals/:id` |
| `inventoryService` | `GET /api/inventory`, `GET /api/inventory/units/available` |
| `requestService` | `GET/POST /api/requests`, `GET/PUT /api/requests/:id` |
| `issueService` | `GET/POST /api/issues`, `GET /api/issues/:id` |
| `dashboardService` | `GET /api/dashboard/stats` |

---

## Design System

The BloodCare design system is defined in `src/index.css` using CSS custom properties and Tailwind v4 theme tokens.

### Color Palette

| Token | Value | Role |
|---|---|---|
| `--color-brand-blood` | `#A51C30` | Primary crimson — CTAs, active nav, badges |
| `--color-sidebar-dark` | `#1C1315` | Deep burgundy sidebar canvas |
| `--color-workspace-bg` | `#F7F4F5` | Off-white main workspace |
| `--color-surface-white` | `#FFFFFF` | Card surfaces |
| `--color-text-main` | `#1C1315` | Primary text |
| `--color-text-muted` | `#7A7274` | Secondary / placeholder text |

### Typography

- **Font:** Inter (Google Fonts)
- Heading weights: `600–700`
- Body: `400`, labels: `500`

### Component Conventions

- All interactive elements have `aria-label` attributes.
- Every API-driven page implements three states: **loading skeleton**, **error with retry**, **empty state**.
- Modals use a focus-trapped overlay with `role="dialog"` and `aria-modal="true"`.

---

## Routing

Routes are defined in `src/App.jsx`.

- `/login` — public, redirects to `/dashboard` if already authenticated.
- All other routes are **protected** — unauthenticated users are redirected to `/login`.
- Authentication state is derived from `localStorage` (`token` key).

### Workflow State Machines

```
Request:  Pending ──► Approved ──► Completed (via Issue transaction)
                  └──► Rejected

Inventory unit:  Available ──► Issued (only via POST /api/issues)
```

> `Completed` status on a request is **never set manually** by the frontend.
> It is the result of the atomic `POST /api/issues` transaction on the backend.
