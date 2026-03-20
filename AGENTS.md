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
As of March 20, 2026, the codebase has achieved **Backend API Operational** status. Agents must be aware of the following:

### Current State
- ✅ **Backend API:** Fully operational with Django REST Framework
- ✅ **Database:** PostgreSQL migrated with all models
- ✅ **Sample Data:** Created (3 courses, 3 categories, 1 cohort)
- ⏳ **Frontend Integration:** Mock data still in use (ready for API connection)

### Discrepancies
| Component | Documented (README/PRD) | Actual Implementation | Mandate |
|-----------|-------------------------|-----------------------|---------|
| **Framework** | Next.js 16.1.4 | Vite + React 19 SPA | **Maintain Vite** until explicit migration is requested. |
| **Tailwind** | v4.1.18 (CSS-First) | v3.4.19 (JS Config) | **Follow v4 philosophy** (CSS variables) within v3 limits. |
| **Data State** | Real-time API | Mock Data (`mockData.ts`) | **Preserve Mock Data** for UI until API integration task is issued. |

### Recent Fixes Applied
- **ENV Loading:** Added `load_dotenv()` to `academy/settings/base.py`
- **Migrations:** Generated and applied for `users`, `courses`, `api` apps
- **Sample Data:** Populated via Django shell with realistic course data

---

## 3. TECHNICAL STACK MANDATES

### Frontend (SPA)
- **Library:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **State:** Zustand 5.0.3
- **Animations:** Framer Motion 12.35.0 (Strictly follow `lib/animations.ts`)
- **Icons:** Lucide React 0.562.0
- **Primitives:** Radix UI / Shadcn UI

### Backend (REST API)
- **Framework:** Django 6.0.2
- **API:** Django REST Framework 3.15.2
- **Database:** PostgreSQL 16
- **Cache/Broker:** Redis 5.2.1
- **Payments:** Stripe 11.3.0

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
- `src/sections/`: High-level page blocks (Hero, Features, etc.). **Add new sections here.**
- `src/lib/animations.ts`: Centralized motion constants. **Never hardcode durations.**

### Backend Path: `/backend`
- `apps/users/`: Custom User model extending `AbstractUser`.
- `apps/courses/`: Core domain (Course, Cohort, Enrollment).
- `api/`: The DRF implementation layer (Serializers, ViewSets).
- `academy/settings/`: Split settings (base, development, production).

---

## 6. CODING STANDARDS FOR AGENTS

### General
- **Transparency:** Never call tools in silence. Explain the "Why" before the "How".
- **Surgical Edits:** Use `replace` or `write_file` with targeted precision. Avoid massive re-writes unless necessary.
- **Dryness:** Always check `lib/utils.ts` and `lib/animations.ts` before creating helpers.

### Frontend Logic
- Use `cn()` from `@/lib/utils` for all tailwind merging.
- Prefer **Composition** over inheritance.
- Handle all UI states: `Loading`, `Error`, `Empty`, `Success`.

### Backend Logic
- Strictly typed Model fields (Django 6 defaults).
- Use UUIDs for primary keys in `Course` and `Cohort`.
- Business logic belongs in **Models** or **Services**, not Views.

---

## 7. SECURITY & SAFETY
- **Credential Protection:** Never log, print, or commit `.env` variables or Stripe keys.
- **Sanitization:** All user inputs must be validated via Zod (Frontend) and Django Forms/Serializers (Backend).
- **Source Control:** Do not stage or commit unless explicitly directed.

---

## 8. DEFINITION OF DONE (DoD)
A task is complete only when:
1. **Validation:** Behavioral correctness is verified (simulated or shell test).
2. **Styling:** Adheres strictly to the Design System (sharp corners, indigo/cyan theme).
3. **Documentation:** Any new files/logic are added to `Project_Architecture_Document.md`.
4. **Performance:** No unnecessary re-renders or N+1 queries introduced.

---
**Status:** READY FOR EXECUTION
**Agent Mode:** Senior Architect & Avant-Garde Designer
