# AI Academy: Production-Grade Training Platform

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Django 6.0.3](https://img.shields.io/badge/Django-6.0.3-green.svg)](https://www.djangoproject.com/)
[![Tailwind 3.4.19](https://img.shields.io/badge/Tailwind-3.4.19-38bdf8.svg)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-AAA-blueviolet.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-239_passing-brightgreen.svg)](#testing)

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
│   ├── courses/                # Domain models
│   └── users/                  # Custom Auth & Profile
│
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

### Current State (March 22, 2026)

#### Backend (100% Core Complete)
✅ **239 automated tests** - ALL PASSING
✅ **Payment Processing:** Phase 7 Stripe integration verified
✅ **JWT Authentication:** SimpleJWT with Blacklisting
✅ **N+1 Optimization:** 82% query reduction verified
✅ **Standardized API:** Consistency via ResponseFormatterMixin
✅ **API Documentation:** Swagger UI + ReDoc operational

#### Frontend (90% Integrated)
✅ **Phase B Complete:** Payment infrastructure & components
✅ **Integrated Pages:** `CoursesPage` and `CourseDetailPage` using real API
✅ **Enrollment Flow:** 3-step wizard implemented with Stripe hooks
✅ **TDD Infrastructure:** Vitest configured with 130+ tests (90+ passing)
⏳ **Unified Landing:** `Hero` and `Features` still use `mockData.ts`

### Recent Milestones

#### ✅ Phase B: Frontend Payment & Integration
- **EnrollmentPage:** Full multi-step enrollment wizard
- **API Services:** 100% coverage for Course and Category endpoints
- **Hooks:** React Query integration for caching and state
- **Security:** CSRF and JWT handling in Axios interceptors

#### ✅ Phase 7: Backend Payments
- **PaymentViewSet:** PaymentIntent lifecycle management
- **Webhooks:** Signature-verified Stripe webhook handling
- **Standardization:** standardized error codes for payment failures

---

## 📈 Performance Metrics

### Query Optimization
| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/courses/` | 17 queries | 3 queries | **82%** faster |
| `/cohorts/` | 12 queries | 2 queries | **83%** faster |
| `/courses/{slug}/` | 4 queries | 2 queries | **50%** faster |

### Caching Performance
| Endpoint | Cache TTL | Backend Action | Impact |
|----------|-----------|----------------|--------|
| Course List | 5 min | Signal Invalidation | **10x** speedup |
| Category List | 30 min | Manual Refresh | **~10ms** latency |

---

## 🧪 Testing

### Backend Tests (239 total - ALL PASSING)

| Category | Tests | Status |
|----------|-------|--------|
| Course API | 30 | ✅ |
| User Management | 24 | ✅ |
| Payment Processing | 12 | ✅ |
| Response Format | 17 | ✅ |
| Audit Logging | 22 | ✅ |
| **Total** | **239** | **✅** |

### Frontend Tests (Vitest)

```bash
# Run all tests
cd frontend
npm run test

# Run with coverage
npm run test:coverage
```

**Status:** 90 tests passing (Phase B components verified). Pre-existing failures in legacy components are being addressed.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [GEMINI.md](./GEMINI.md) | Single Source of Truth for AI Agents |
| [Project_Architecture_Document.md](./Project_Architecture_Document.md) | Technical deep-dive & hierarchy |
| [API_Usage_Guide.md](./API_Usage_Guide.md) | Complete API reference (v1.5.0) |
| [CODE_REVIEW_AUDIT_REPORT.md](./CODE_REVIEW_AUDIT_REPORT.md) | Gap analysis & Remediation plan |

---

## 🗺 Roadmap

### Q1 2026 ✅ Completed
- [x] Backend API architecture & Security hardening
- [x] JWT authentication & Response Standardization
- [x] N+1 query optimization & Redis Caching
- [x] Frontend Payment Foundation (Phase B)

### Q2 2026 🚧 In Progress
- [ ] **Remediation**: Restore Soft Delete logic (Step 14)
- [ ] **Unified Data**: Migrate landing page to full API sourcing
- [ ] **E2E Testing**: Playwright integration for critical flows
- [ ] **Deployment**: CI/CD pipelines & Production Docker

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
