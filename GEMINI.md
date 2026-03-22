# GEMINI Mission Brief: AI Academy

This document serves as the absolute single-source-of-truth (SSoT) for any AI coding agent (GEMINI CLI) operating on this repository. It defines the technical standards, architectural mandates, and aesthetic requirements for the **AI Academy** project.

---

## 1. PROJECT IDENTITY & VISION
**Project Name:** AI Academy
**Core Mission:** To provide practitioner-led, production-grade AI and Software Engineering training.
**Design Philosophy:** *Precision Futurism with Technologic Minimalism.*
- **Reject:** "AI Slop" (purple-to-pink gradients, soft blobs, bento grids, generic Inter font pairings).
- **Embrace:** High-contrast, code-centric aesthetics, monospace accents, and sharp, architectural edges.

---

## 2. CRITICAL CONTEXT & DISCREPANCIES
As of **March 22, 2026**, the codebase is in a **Production-Ready Hybrid Phase**. All critical infrastructure components, including Soft Delete and Frontend Enrollment Routes, are fully implemented and verified.

| Component | Documented (README/PRD) | Actual Implementation | Mandate |
|-----------|-------------------------|-----------------------|---------|
| **Framework** | Next.js 16.1.4 | Vite 7.2.4 + React 19 SPA | **Maintain Vite** until explicit migration is requested. |
| **Tailwind** | v4.1.18 (CSS-First) | v3.4.19 (JS Config) | **Follow v4 philosophy** (CSS variables) within v3 limits. |
| **Data State** | Real-time API | **Integrated** | Core pages and Enrollment flow use real APIs. Landing sections migration in progress. |
| **Soft Delete** | ✅ Completed | ✅ **Implemented** | `SoftDeleteModel` infrastructure active on all core models. |
| **Routes** | ✅ Completed | ✅ **Implemented** | Enrollment and Confirmation routes active in `App.tsx`. |

---

## 3. TECHNICAL STACK MANDATES

### Frontend (SPA)
- **Library:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **State:** Zustand 5.0.3 (Client) / TanStack Query 5.x (Server)
- **Animations:** Framer Motion 12.35.0 (Strictly follow `lib/animations.ts`)
- **Icons:** Lucide React 0.562.0
- **Primitives:** Radix UI / Shadcn UI
- **Payments:** Stripe SDK 14.4.1
- **Testing:** Vitest + React Testing Library + MSW

### Backend (REST API)
- **Framework:** Django 6.0.3
- **API:** Django REST Framework 3.16.1
- **Database:** PostgreSQL 16
- **Cache:** Redis 6.4.0 (via django-redis 6.0.0)
- **Payments:** Stripe 14.4.1
- **Auth:** SimpleJWT 5.5.1

---

## 4. DESIGN SYSTEM STANDARDS (`index.css`)

### Color Palette (The "60-30-10" Rule)
- **Primary (60%):** `--color-background` (#fafaf9) / `--color-surface` (#ffffff)
- **Secondary (30%):** `--color-primary-600` (#4f46e5 - Electric Indigo)
- **Accent (10%):** `--color-cyan-500` (#06b6d4 - Neural Cyan)
- **Urgency:** `--color-amber-500` (#f59e0b - Signal Amber)

### Typography
- **Display:** `Space Grotesk` (Geometric, futurist)
- **Body:** `Inter` (High readability)
- **Code/Labels:** `JetBrains Mono` (Technical authority)

### UI Rules
- **Radius:** `--radius: 0rem` (Mandatory sharp corners).
- **Spacing:** 4px base grid (`--space-*`).
- **Cards:** Must use `card-accent-top` pattern (3px top border colored by category).
- **Accessibility:** Targeted at **WCAG AAA**. All animations must respect `useReducedMotion`.

---

## 5. ARCHITECTURAL HIERARCHY

### Frontend Path: `/frontend`
- `src/components/ui/`: Low-level Shadcn primitives.
- `src/components/layout/`: Global Shell (Navigation, Footer).
- `src/pages/`: Full page components (`CoursesPage.tsx`, `EnrollmentPage.tsx`).
- `src/sections/`: High-level landing page blocks (Hero, Features, etc.).
- `src/services/api/`: Axios-based API client and domain-specific services.
- `src/hooks/`: React Query hooks for data fetching (e.g., `useCourses.ts`).
- `src/types/`: TypeScript interfaces and API response shapes.
- `src/__tests__/integration/`: Comprehensive integration tests for user flows.

### Backend Path: `/backend`
- `users/`: Custom User model, registration, and profile management.
- `courses/`: Core domain models (Course, Category, Cohort, Enrollment).
- `api/views/`: ViewSets inheriting from `ResponseFormatterMixin`.
- `api/serializers/`: Data transformation with field-level permissions.
- `api/middleware/`: `APILoggingMiddleware` (Audit Trail) and `RequestIDMiddleware`.
- `academy/settings/`: Split settings (base, development, production, test).

---

## 6. CODING STANDARDS FOR AGENTS

### General
- **Transparency:** Never call tools in silence. Explain the "Why" before the "How".
- **Surgical Edits:** Use `replace` or `write_file` with targeted precision.
- **TDD Mandate:** ALWAYS write or update tests before/during implementation.

### Frontend Logic
- Use React Query hooks from `src/hooks/` for all API interactions.
- Use `cn()` from `@/lib/utils` for all tailwind merging.
- Handle all UI states: `Loading`, `Error`, `Empty`, `Success`.
- Strictly typed props and API responses.
- **Route Protection:** Use `ProtectedRoute` for all authenticated views.

### Backend Logic
- Strictly typed Model fields (Django 6 defaults).
- Use UUIDs for primary keys in `Course`, `Cohort`, and `Enrollment`.
- All ViewSets must use `ResponseFormatterMixin` for standardized envelopes.
- Implement conditional field visibility in Serializers via `to_representation()`.
- **Soft Delete:** All core models must implement `SoftDeleteManager` and provide `delete()` (soft) and `restore()` methods. Use `Model.objects.all_objects()` to include deleted records in queries.

---

## 7. SECURITY & SAFETY
- **Credential Protection:** Never log, print, or commit `.env` variables or Stripe keys.
- **Sanitization:** All user inputs must be validated via Zod (Frontend) and Django Serializers (Backend).
- **Payment Security:** Never store card numbers. Use Stripe Elements for PCI compliance.
- **Audit Trail:** Ensure every API request is logged via `APILoggingMiddleware`.

---

## 8. DEFINITION OF DONE (DoD)
A task is complete only when:
1. **Tests Pass:** `python manage.py test` (Backend) and `npm run test` (Frontend) return 100% success.
2. **Standardization:** Response format adheres to the standardized JSON envelope (`success`, `data`, `message`, `errors`, `meta`).
3. **Styling:** Adheres strictly to the Design System (sharp corners, high contrast).
4. **Documentation:** New files/logic are added to `Project_Architecture_Document.md`.
5. **Performance:** No N+1 queries introduced; caching used for high-traffic GETs.

---
**Status:** READY FOR PRODUCTION
**Agent Mode:** Senior Architect & Avant-Garde Designer
**Last Updated:** March 22, 2026
