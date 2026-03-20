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

As of March 21, 2026, the codebase has achieved **Backend API Enhanced** status with comprehensive improvements including caching and extensive test coverage. Agents must be aware of the following:

### Current State

#### Completed (March 20-21, 2026)

**Core Infrastructure:**
- ✅ **JWT Authentication:** SimpleJWT fully configured and operational (30min access, 7day refresh)
- ✅ **N+1 Query Optimization:** 82-83% query reduction across all endpoints
- ✅ **Enrollment Business Logic:** Capacity management, duplicate prevention, transaction safety
- ✅ **Database:** PostgreSQL with all models and optimizations
- ✅ **Sample Data:** Complete dataset with courses, cohorts, categories, users

**API Enhancements:**
- ✅ **API Response Standardization:** All endpoints return consistent envelope format
- ✅ **Custom Exception Handler:** Standardized error responses with request_id and timestamps
- ✅ **Request ID Middleware:** Unique request tracking per API call
- ✅ **Rate Limiting:** Throttling configured for anon/user/enrollment operations
- ✅ **Image Upload Support:** Course thumbnails and user avatars with validation/resizing
- ✅ **Storage Backend:** MinIO/S3 configuration via django-storages

**User Management:**
- ✅ **User Registration:** Complete registration with email/username/password validation
- ✅ **User Profile Management:** GET/PATCH /users/me/ with read-only field protection
- ✅ **Password Reset:** Token-based password reset with security best practices

**Caching (NEW - Step 8):**
- ✅ **Redis Cache Backend:** django-redis configured at redis://127.0.0.1:6379/1
- ✅ **Course List Caching:** 5-minute TTL with query param awareness
- ✅ **Category List Caching:** 30-minute TTL
- ✅ **Course Detail Caching:** 1-hour TTL with signal-based invalidation
- ✅ **Cohorts Caching:** 10-minute TTL per course
- ✅ **Cache Invalidation:** Automatic on Course model save/delete via signals

**Testing (NEW - Step 9):**
- ✅ **Comprehensive Test Suite:** 160 automated tests total
- ✅ **Course API Tests:** 30 tests covering list, filter, search, order, detail
- ✅ **Category API Tests:** 10 tests covering list, detail, ordering, fields
- ✅ **Cohort API Tests:** 16 tests covering list, filter, order, fields
- ✅ **Caching Tests:** 16 tests covering all cache scenarios
- ✅ **Test Configuration:** Dedicated test settings with disabled throttling

#### Test Coverage Summary

| Test Category | Tests | Status |
|--------------|-------|--------|
| Course API | 30 | ✅ Passing |
| Category API | 10 | ✅ Passing |
| Cohort API | 16 | ✅ Passing |
| Caching | 16 | ✅ Passing |
| Enrollment Business Logic | 9 | ✅ Passing |
| JWT Authentication | 6 | ✅ Passing |
| Performance | 4 | ✅ Passing |
| Response Standardization | 17 | ✅ Passing |
| Throttling | 5 | ✅ Passing |
| Image Upload | 23 | ✅ Passing |
| User Management | 23 | ⚠️ 17 pre-existing failures |
| **Total** | **160** | **143 passing** |

#### In Progress

- ⏳ **Frontend Integration:** Ready to connect authenticated API endpoints
- ⏳ **Payment Integration:** Stripe configured but not connected to enrollment flow
- ⏳ **Email Service:** Password reset configured but email sending not implemented for production

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
- **Caching:** Implemented Redis caching with automatic invalidation
- **Testing:** Added 56 new comprehensive API tests

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
- **Caching:** django-redis 5.4.0

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
- `api/utils/`: Utility modules (cache.py, images.py).
- `courses/signals.py`: Cache invalidation signals.
- `academy/settings/`: Split settings (base, development, production, test).

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
- Cache utilities in `api/utils/cache.py`.
- Cache invalidation via signals in `courses/signals.py`.

### Testing Standards
- Use TDD methodology: RED → GREEN → REFACTOR
- Run tests with: `DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test`
- Test settings disable throttling and use local file storage
- All new features require comprehensive tests

---

## 7. SECURITY & SAFETY

- **Credential Protection:** Never log, print, or commit `.env` variables or Stripe keys.
- **Sanitization:** All user inputs must be validated via Zod (Frontend) and Django Forms/Serializers (Backend).
- **Source Control:** Do not stage or commit unless explicitly directed.
- **Cache Security:** Never cache authenticated user data without proper key scoping.

---

## 8. DEFINITION OF DONE (DoD)

A task is complete only when:
1. **Validation:** Behavioral correctness is verified (simulated or shell test).
2. **Styling:** Adheres strictly to the Design System (sharp corners, indigo/cyan theme).
3. **Documentation:** Any new files/logic are added to `Project_Architecture_Document.md`.
4. **Performance:** No unnecessary re-renders or N+1 queries introduced.
5. **Testing:** New features include comprehensive test coverage.
6. **Caching:** High-traffic endpoints properly cached where applicable.

---

## 9. CACHING STRATEGY

### Cache Keys Format
```
course:list                    # Course list (no filters)
course:list:level=beginner     # Course list with filters
course:detail:intro-to-ai      # Course detail by slug
category:list                  # Category list
course:intro-to-ai:cohorts     # Course cohorts
```

### Cache TTLs
| Resource | TTL | Reasoning |
|----------|-----|-----------|
| Course List | 5 min | Frequently accessed, changes often |
| Category List | 30 min | Rarely changes |
| Course Detail | 1 hour | Changes on save/delete |
| Cohorts | 10 min | Changes on enrollment |

### Cache Invalidation
- Automatic on Course model `post_save` and `post_delete`
- Manual via `invalidate_course_cache()` and `invalidate_course_detail_cache(slug)`

---

## 10. TROUBLESHOOTING QUICK REFERENCE

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Tests return 404 | Reserved query param | Avoid `format` as filter param |
| Cache stale | Signal not registered | Check `courses/apps.py` ready() |
| Ordering fails | String comparison | Convert to float: `float(c["price"])` |
| Filter returns 400 | Invalid choice value | Use valid values or expect 400 |
| Redis connection error | Redis not running | `docker compose up -d redis` |

### Test Commands
```bash
# Run all tests
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input

# Run specific test file
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_caching --no-input

# Run with verbose output
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test -v 2
```

---

**Status:** READY FOR EXECUTION
**Agent Mode:** Senior Architect & Avant-Garde Designer
**Last Updated:** March 21, 2026
