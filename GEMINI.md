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
As of **March 24, 2026**, the codebase is in a **Production-Ready Verified Phase**. All core features, infrastructure, and testing suites are fully implemented and validated.

| Component | Documented (README/PRD) | Actual Implementation | Mandate |
|-----------|-------------------------|-----------------------|---------|
| **Framework** | Next.js 16.1.4 | Vite 7.3.0 + React 19 SPA | **Maintain Vite** until explicit migration is requested. |
| **Tailwind** | v4.1.18 (CSS-First) | v3.4.19 (JS Config) | **Follow v4 philosophy** (CSS variables) within v3 limits. |
| **Data State** | Real-time API | **Integrated** | Core pages and Enrollment flow use real APIs. Landing sections migration in progress. |
| **Soft Delete** | ✅ Completed | ✅ **Verified** | `SoftDeleteModel` active on core models with 18 TDD tests. |
| **Routes** | ✅ Completed | ✅ **Verified** | Enrollment and Confirmation routes active in `App.tsx`. |
| **E2E Testing** | ✅ Phase 4 Complete | ✅ **Verified** | 12 smoke tests passing with high-fidelity visual evidence. |

### ⚠️ Technical Findings & Architectural Learnings (March 24, 2026)

#### 1. React 19 & Vite Plugin Compatibility
Discovered a critical "Blank Screen" bug where the React application failed to mount silently.
- **Root Cause:** The `kimi-plugin-inspect-react` plugin was incompatible with React 19's strict element handling, causing a mount failure in the root `div`.
- **Resolution:** Removed the incompatible plugin from `vite.config.ts`. 
- **Learning:** Always verify third-party Vite plugins against specific React major versions, especially during "Advanced Hybrid" integration phases.

#### 2. Naming Collisions in SPA Modules
Encountered an `Uncaught SyntaxError` blocking the frontend runtime.
- **Root Cause:** Exporting identical names (e.g., `interface Category`) from both `mockData.ts` and `types/api.ts` confused Vite's module resolution.
- **Resolution:** Standardized on prefixing mock interfaces with `Mock` (e.g., `MockCategory`).
- **Learning:** Strict namespace discipline is mandatory when maintaining mixed mock/real data states.

#### 3. TypeScript Strictness (`verbatimModuleSyntax`)
The project uses `verbatimModuleSyntax: true`, which triggered 218 errors during the first production build attempt.
- **Mandate:** All type-only imports **must** use the `import type` syntax to ensure the compiler correctly strips them during transpilation.

#### 4. E2E Visual Verification Standards
Learned that standard `agent-browser screenshot` calls are prone to capturing the "First Paint" (empty state).
- **Mandate:** Every E2E visual test must follow the **Wait-Snapshot-Capture** pattern:
  1. `wait --load networkidle` (Ensure JS is executed).
  2. `snapshot -i` (Verify the structural presence of content).
  3. `screenshot --annotate` (Capture visual proof).

#### 5. API Response Standardization (Hybrid State)
Core pages (`CoursesPage`, `SearchDialog`) must handle the standardized JSON envelope.
- **Mandate:** Always check `data.success` and access payload via `data.data`.
- **Learning:** Backend pagination returns the result list directly in `data` with metadata in `meta.pagination`. Use `Array.isArray(data?.data)` for robust list handling.

#### 6. Accessibility & ARIA Compliance
- **Mandate:** Interactive elements (buttons, dialogs) must include `aria-haspopup` and `aria-expanded`.
- **Mandate:** Screen-reader-only content (`sr-only`) must be placed inside the active container (e.g., `DialogContent`) to prevent leakage into the accessibility tree when inactive.

---

## 3. TECHNICAL STACK MANDATES

### Frontend (SPA)
- **Library:** React 19.2.0
- **Build Tool:** Vite 7.3.0
- **State:** Zustand 5.0.3 (Client) / TanStack Query 5.x (Server)
- **Animations:** Framer Motion 12.35.0 (Strictly follow `lib/animations.ts`)
- **Icons:** Lucide React 0.562.0
- **Primitives:** Radix UI / Shadcn UI
- **Testing:** Vitest + React Testing Library + MSW + agent-browser

### Backend (REST API)
- **Framework:** Django 6.0.3
- **API:** Django REST Framework 3.16.1
- **Database:** PostgreSQL 16
- **Cache:** Redis 6.4.0 (via django-redis 6.0.0)
- **Auth:** SimpleJWT 5.5.1

---

## 4. DESIGN SYSTEM STANDARDS (`index.css`)

### Color Palette (The "60-30-10" Rule)
- **Primary (60%):** `--color-background` (#fafaf9) / `--color-surface` (#ffffff)
- **Secondary (30%):** `--color-primary-600` (#4f46e5 - Electric Indigo)
- **Accent (10%):** `--color-cyan-500` (#06b6d4 - Neural Cyan)

### UI Rules
- **Radius:** `--radius: 0rem` (Mandatory sharp corners).
- **Cards:** Must use `card-accent-top` pattern (3px top border colored by category).

---

## 5. CODING STANDARDS FOR AGENTS

### General
- **TDD Mandate:** ALWAYS write or update tests before/during implementation.
- **Build Verification:** Before marking a frontend task as complete, verify that `vite build` succeeds without TypeScript errors.

### Frontend Logic
- **Button Handlers:** All landing page buttons must use the `useNavigate` hook for SPA transitions; avoid `<a href="#">` or window-level redirects.
- **Type Imports:** Use `import type` for all TypeScript interfaces and types to comply with `verbatimModuleSyntax`.

### Backend Logic
- **Soft Delete:** All core models must implement `SoftDeleteManager` and provide `delete()` (soft) and `restore()` methods. Use `Model.objects.all_objects()` to include deleted records in queries.
- **Standardized Responses:** Use `ResponseFormatterMixin` for all ViewSets to ensure consistent JSON envelopes.

---

## 6. DEFINITION OF DONE (DoD)
A task is complete only when:
1. **Tests Pass:** `python manage.py test` (Backend: 257 tests) and `npm run test` (Frontend: 92+ tests) return 100% success.
2. **E2E Validation:** Basic smoke tests (`tests/e2e/smoke.spec.ts`) pass with visual verification (non-blank screenshots).
3. **Build Integrity:** Production build (`npm run build`) completes with zero TypeScript errors.
4. **Standardization:** Response format adheres to the standardized JSON envelope.
5. **Accessibility:** Targeted at **WCAG AAA**. All animations respect `useReducedMotion`.

---
**Status:** READY FOR PRODUCTION
**Agent Mode:** Senior Architect & Avant-Garde Designer
**Last Updated:** March 24, 2026
