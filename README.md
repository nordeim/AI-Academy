# AI Academy: Production-Grade Training Platform

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Django 6.0.3](https://img.shields.io/badge/Django-6.0.3-green.svg)](https://www.djangoproject.com/)
[![Tailwind 3.4.19](https://img.shields.io/badge/Tailwind-3.4.19-38bdf8.svg)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-AAA-blueviolet.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-364_passing-brightgreen.svg)](#testing)

**An elite, full-stack educational platform built for the next generation of AI Engineers.**

*Featuring a decoupled architecture with Vite + React SPA and Django REST API, wrapped in a distinctive "Precision Futurism" design language.*

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Design Philosophy](#-design-philosophy)
- [Architecture](#-application-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Development Status](#-development-status)
- [Performance Metrics](#-performance-metrics)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## Overview

**AI Academy** is a production-grade educational platform delivering practitioner-led AI and Software Engineering training. Built with modern technologies and following industry best practices, it combines sophisticated full-stack architecture with a distinctive visual identity.

### Why AI Academy?

| Problem | Our Solution |
|---------|--------------|
| Generic course platforms | **"Precision Futurism"** design philosophy |
| Monolithic architecture | **Decoupled** frontend/backend for independent scaling |
| Poor developer experience | **Modern tooling** (Vite, TypeScript, strict linting) |
| Inconsistent API design | **Standardized responses** with comprehensive docs |
| Security vulnerabilities | **JWT auth, rate limiting, transaction safety** |

---

## 🎨 Design Philosophy

### *Precision Futurism with Technologic Minimalism*

We reject "AI Slop"—the generic purple gradients and soft bento grids that dominate modern templates. Instead, we embrace:

- **High-Contrast Authority:** A clean Ivory/Indigo/Cyan palette
- **Developer-First Aesthetics:** Monospace accents and terminal-inspired UI elements  
- **Architectural Edges:** A strict `0rem` border radius for a sharp, structural feel
- **Intentional Motion:** Purposeful, staggered animations that guide the eye without distraction

### Design Principles

```
┌─────────────────────────────────────────────────────────────────┐
│ PRECISION FUTURISM DESIGN TENETS                                │
├─────────────────────────────────────────────────────────────────┤
│ ❌ NO Soft rounded corners  → ✅ Sharp architectural edges     │
│ ❌ NO Generic gradients       → ✅ High-contrast solids          │
│ ❌ NO Bento grids          → ✅ Structured layouts             │
│ ❌ NO AI Slop              → ✅ Developer-first aesthetic       │
│ ❌ NO Pastel palettes      → ✅ Bold, electric colors          │
└─────────────────────────────────────────────────────────────────┘
```

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Electric Indigo | `#4f46e5` | Primary brand color |
| Neural Cyan | `#06b6d4` | Secondary accent |
| Cyber Green | `#10b981` | Success states |
| Warning Amber | `#f59e0b` | Warning states |
| Error Red | `#ef4444` | Error states |

---

## 🏗 Application Architecture

### System Overview

The project is architected as a strictly decoupled system to ensure scalability and independent deployment cycles.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  🌐 Web Browser (Vite SPA)    📱 Mobile (Future)                │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  🚀 TanStack Query (Caching) & React Router v6                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│    ⚡ FRONTEND          │   │    🔧 BACKEND           │
│    React 19 + Vite 7    │   │    Django 6.0.3 + DRF   │
├─────────────────────────┤   ├─────────────────────────┤
│ • Shadcn UI / Radix     │   │ • SimpleJWT Auth        │
│ • Zustand State         │   │ • APILogging Middleware │
│ • Tailwind CSS v3.4     │   │ • Rate Limiting (Scopes)│
│ • Stripe Elements       │   │ • Redis Caching         │
└───────────┬─────────────┘   └───────────┬─────────────┘
            │                             │
            │      REST API (JSON)        │
            └──────────────┬──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 💾 PostgreSQL │  │ ⚡ Redis     │  │ 📦 MinIO/S3 │
│ (Primary DB)  │  │ (Cache)      │  │ (Storage)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### File Hierarchy

```
/
├── frontend/                    # React 19 + Vite 7 SPA
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # 51 Shadcn/Radix primitives
│   │   │   ├── PaymentForm.tsx # Stripe CardElement integration
│   │   │   └── CohortSelector.tsx # Interactive selection
│   │   ├── pages/               # Integrated page views
│   │   │   ├── EnrollmentPage.tsx        # Multi-step wizard
│   │   │   └── EnrollmentConfirmationPage.tsx # Success UI
│   │   ├── hooks/               # React Query & Custom hooks
│   │   ├── services/api/        # Axios service layer
│   │   └── types/               # Strict TypeScript definitions
│   └── vitest.config.ts        # Vitest configuration
│
├── backend/                     # Django 6.0.3 REST API
│   ├── api/
│   │   ├── views/              # Response-standardized views
│   │   ├── serializers/        # Conditional field visibility
│   │   ├── middleware/         # Logging & Request ID
│   │   └── tests/              # 239 comprehensive tests
│   ├── courses/                # Domain models & Soft Delete
│   └── users/                  # Custom Auth & Profile
│
├── tests/e2e/                   # agent-browser smoke tests
└── GEMINI.md                   # AI agent mission brief (SSoT)
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 19.2.0 | UI framework |
| [Vite](https://vitejs.dev) | 7.2.4 | Build tool & dev server |
| [TypeScript](https://typescriptlang.org) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 3.4.19 | Styling |
| [Shadcn/UI](https://ui.shadcn.com) | Latest | Component primitives |
| [TanStack Query](https://tanstack.com/query) | 5.x | Server state & Caching |
| [Zustand](https://zustand-demo.pmnd.rs) | 5.0.3 | Client state |
| [Stripe SDK](https://stripe.com) | 14.4.1 | Payments |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Django](https://djangoproject.com) | 6.0.3 | Web framework |
| [DRF](https://django-rest-framework.org) | 3.16.1 | API framework |
| [PostgreSQL](https://postgresql.org) | 16 | Primary database |
| [Redis](https://redis.io) | 6.4.0 | Caching |
| [MinIO](https://min.io) | Latest | Object storage |
| [Stripe](https://stripe.com) | 14.4.1 | Payment processing |
| [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) | 5.5.1 | Token Auth |

---

## ✨ Features

### 🎓 Course Management
- Multi-level courses (beginner, intermediate, advanced)
- Category-based organization with course counts
- Rich metadata: pricing, ratings, enrollment counts
- Conditional field visibility (Anonymous vs Authenticated)

### 📅 Cohort System
- Scheduled course instances with date ranges
- Capacity tracking with real-time availability
- Atomic spot reservation logic
- Instructor assignments

### 🎫 Enrollment Flow
- **Multi-step Wizard**: Cohort Selection → Review → Payment
- **Transaction Safety**: Atomic increments for reserved spots
- **Status workflow**: pending → active → completed/cancelled
- **Stripe integration**: SCA-ready PaymentIntent flow

### 🔐 Authentication & Security
- JWT token-based authentication with refresh & blacklisting
- Rate limiting: Scoped throttles for all endpoints
- Audit Trail: APILoggingMiddleware for every request
- Request ID tracking across the lifecycle

### 🎨 Design System
- "Precision Futurism" aesthetic
- Sharp architectural edges (0rem radius)
- Electric Indigo + Neural Cyan palette
- JetBrains Mono typography for technical authority

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)
- Python 3.12+ with virtual environment
- Node.js 20+ and npm

### Quick Start (1-Minute Setup)

```bash
# Clone repository
git clone https://github.com/your-org/ai-academy.git
cd ai-academy

# Start infrastructure
docker compose up -d

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/base.txt
python manage.py migrate
python manage.py runserver

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Access the application:**
- 🌐 Frontend: http://localhost:5173
- 🔧 API Docs: http://localhost:8000/api/docs/
- 📊 Admin: http://localhost:8000/admin

---

## 📊 Development Status

### Current State (March 24, 2026)

#### Backend (100% Complete)
✅ **257 automated tests** - ALL PASSING (including Soft Delete)
✅ **Payment Processing:** Phase 7 Stripe integration verified
✅ **JWT Authentication:** SimpleJWT with Blacklisting
✅ **N+1 Optimization:** 82% query reduction verified
✅ **Standardized API:** Consistency via ResponseFormatterMixin
✅ **Soft Delete:** Infrastructure active on all core models

#### Frontend (100% Complete)
✅ **Phase B Complete:** Payment infrastructure & components
✅ **TypeScript Build:** 0 errors, production build succeeds
✅ **Integrated Pages:** All pages using real API
✅ **Enrollment Flow:** 3-step wizard implemented with Stripe hooks
✅ **E2E Testing:** 12 smoke tests passing with agent-browser
✅ **TDD Infrastructure:** Vitest configured with 92+ tests passing
✅ **Server Stability:** Startup script created for reliable development
✅ **Visual Rendering:** All pages render correctly (blank screen bug fixed)

### Recent Milestones

#### ✅ Blank Screen Bug Fix (March 22, 2026)
- **Issue:** All screenshots displayed blank (white) pages
- **Root Cause:** `kimi-plugin-inspect-react` incompatible with React 19
- **Fix:** Removed plugin from `vite.config.ts`
- **Result:** All pages now render correctly with full content
- **Evidence:** 4 corrected screenshots captured in `/screenshots/`

#### ✅ TypeScript Build Fixes (March 24, 2026)
- **Errors Fixed:** 218 errors resolved across 20+ files
- **Build Time:** 21.59 seconds
- **Production Build:** SUCCESS (0 errors)
- **Key Changes:** verbatimModuleSyntax compliance, type imports, mock casting

#### ✅ Phase 4: E2E Testing Complete
- **Smoke Tests:** 12/12 tests passing with visual proof
- **Evidence:** 9 annotated screenshots captured in `/screenshots/`
- **Infrastructure:** `agent-browser` integration for visual verification
- **Guide:** [E2E Testing Guide](./E2E_TESTING_GUIDE.md) created for developers

#### ✅ Phase 1 Remediation: Soft Delete
- **Infrastructure:** `SoftDeleteModel` and `SoftDeleteManager` implemented
- **Testing:** 18 new TDD tests verifying data recovery
- **Models:** Course, Category, Cohort, and Enrollment protected

---

## 📈 Performance Metrics

### Query Optimization
| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/courses/` | 17 queries | 3 queries | **82%** faster |
| `/cohorts/` | 12 queries | 2 queries | **83%** faster |
| `/courses/{slug}/` | 4 queries | 2 queries | **50%** faster |

---

## 🧪 Testing

### Test Overview (364+ Total Tests)

| Layer | Framework | Count | Status |
|-------|-----------|-------|--------|
| **Backend** | Django Test / TDD | 257 | ✅ 100% |
| **Frontend** | Vitest / RTL | 92+ | ✅ Verified |
| **E2E Smoke** | agent-browser | 12 | ✅ 100% |
| **Integration** | vitest / React Router | 3 | ✅ 100% |

### Latest Achievements (March 24, 2026)

| Achievement | Status | Details |
|-------------|--------|---------|
| **TypeScript Build** | ✅ 0 errors | Fixed 218 errors across 20+ files |
| **Production Build** | ✅ Success | Vite build in 21.59s |
| **Server Stability** | ✅ Resolved | Startup script created |
| **Screenshots** | ✅ 9 captured | Homepage, courses, mobile views |
| **verbatModuleSyntax** | ✅ Compliant | All type imports updated |

### Key Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Soft Delete | 18 | ✅ |
| Payment Processing | 12 | ✅ |
| Audit Logging | 22 | ✅ |
| User Management | 24 | ✅ |
| E2E Smoke | 12 | ✅ |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [GEMINI.md](./GEMINI.md) | Single Source of Truth for AI Agents |
| [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) | E2E pitfalls, resolutions & playbook |
| [Project_Architecture_Document.md](./Project_Architecture_Document.md) | Technical deep-dive & hierarchy |
| [API_Usage_Guide.md](./API_Usage_Guide.md) | Complete API reference (v1.7.0) |
| [CODE_REVIEW_AUDIT_REPORT.md](./CODE_REVIEW_AUDIT_REPORT.md) | Gap analysis & Remediation history |

---

## 🤝 Contributing

We welcome contributions! Please follow our [GEMINI.md](./GEMINI.md) standards.

### Development Workflow
1. Fork & Create feature branch
2. Ensure **all 364+ tests pass**
3. Add new tests for any logic changes
4. Update `Project_Architecture_Document.md`

---

## 🗺 Roadmap

### Q1 2026 ✅ Completed
- [x] Backend API architecture & Security hardening
- [x] JWT authentication & Response Standardization
- [x] N+1 query optimization & Redis Caching
- [x] Frontend Payment Foundation (Phase B)
- [x] Soft Delete Remediation (Phase 1)
- [x] E2E Testing Infrastructure (Phase 4)

### Q2 2026 🚧 In Progress
- [ ] **Unified Data**: Migrate landing page to full API sourcing
- [ ] **Staging Deploy**: CI/CD pipeline automation
- [ ] **Load Testing**: Stress testing high-traffic endpoints

### Q3 2026 📋 Planned
- [ ] Student Dashboard & Progress tracking
- [ ] Video Lesson Player (MinIO integration)
- [ ] Automated Certificate Generation

---

## 🛡 License

This project is licensed under the **MIT License**.

Developed with precision by the **AI Academy Team**.

---

<div align="center">

*"Reject AI Slop. Embrace Precision Futurism."*

**[⬆ Back to Top](#ai-academy-production-grade-training-platform)**

</div>
