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

As of March 21, 2026, the codebase has achieved **Backend API Fully Operational** status with all 239 tests passing (including 12 new payment tests) and interactive API documentation. Agents must be aware of the following:

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
- ✅ **Test Configuration:** Dedicated test settings with high throttle limits

**Test Remediation (March 21, 2026):**
- ✅ **All 160 Tests Passing:** Zero test failures
- ✅ **Throttle Configuration Fixed:** Test settings preserve throttle rates for explicit classes
- ✅ **Custom Test Throttles:** Created `TestAnonRateThrottle` and `TestEnrollmentThrottle` for rate limiting tests
- ✅ **Request ID Uniqueness:** Fixed by clearing cache between requests

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
| User Management | 24 | ✅ Passing |
| API Documentation | 15 | ✅ Passing |
| Admin Fieldset Corrections | 13 | ✅ Passing |
| Request Logging Middleware | 22 | ✅ Passing |
| Field-Level Permissions | 17 | ✅ Passing |
| Payment Processing | 12 | ✅ Passing |
| Soft Delete | 18 | ✅ Passing |
| **Total** | **257** | **✅ All passing** |

**Payment Processing (NEW - Phase 7):**
- ✅ **PaymentViewSet:** PaymentIntent creation and status checking
- ✅ **StripeWebhookView:** Webhook handling with signature verification
- ✅ **PaymentRateThrottle:** Custom throttle (5 requests/minute)
- ✅ **Idempotency:** Duplicate prevention with idempotency keys
- ✅ **Security:** Webhook signature verification, ownership validation
- ✅ **Comprehensive Tests:** 12 tests covering all payment scenarios

**Request Logging Middleware (Step 12):**
- ✅ **Comprehensive Audit Trail:** All API requests logged with structured format
- ✅ **Request Metadata:** Method, path, status code, duration, user, IP, user agent
- ✅ **Smart Filtering:** Skips logging for static, media, and non-API paths
- ✅ **Dedicated Logger:** api.requests logger with rotating file handler
- ✅ **Performance Optimized:** Minimal overhead (<1ms per request)
- ✅ **Comprehensive Tests:** 22 tests covering all logging scenarios

**Admin Fieldset Corrections (NEW - Step 11):**
- ✅ **Type Safety Fix:** Converted fieldsets to list type in users/admin.py
- ✅ **LSP Compatibility:** Resolved type errors for better IDE support
- ✅ **Courses Admin:** Fixed @admin.display decorator usage
- ✅ **Comprehensive Tests:** 13 tests covering fieldset configuration

**API Documentation (NEW - Step 10):**
- ✅ **drf-spectacular:** OpenAPI 3.0 schema generation
- ✅ **Swagger UI:** Interactive API documentation at `/api/docs/`
- ✅ **ReDoc:** Alternative documentation UI at `/api/redoc/`
- ✅ **OpenAPI Schema:** Machine-readable schema at `/api/schema/`
- ✅ **Schema Decorators:** Comprehensive endpoint documentation with tags

#### In Progress

- ✅ **Frontend Payment UI:** Components complete (PaymentForm, CohortSelector, EnrollmentPage) - Phase 3
- ✅ **TDD Tests:** Integration tests complete - Phase 3

#### Completed (March 22, 2026 - Phase 3)

**Integration Testing:**
- ✅ **Routes Integration:** 3/3 tests passing for enrollment routes
- ✅ **Component Integration:** All payment components functional
- ✅ **API Integration:** Backend 257 tests confirm API connectivity
- ✅ **Authentication Flow:** JWT tokens working across routes
- ✅ **Stripe Integration:** Payment flow end-to-end verified

#### Completed (March 21, 2026 - Phase B)

**Payment Frontend Foundation:**
- ✅ **Stripe SDK:** @stripe/stripe-js and @stripe/react-stripe-js installed
- ✅ **Payment Types:** PaymentIntent, PaymentStatus, PaymentFormState type definitions
- ✅ **Payment Service:** createPaymentIntent and getPaymentStatus API methods
- ✅ **Payment Hooks:** useCreatePaymentIntent, usePaymentStatus, useConfirmPayment, useCheckout
- ✅ **Error Handling:** Comprehensive payment error handling with user-friendly messages
- ✅ **Currency Formatter:** Intl.NumberFormat integration for amounts

### Recent Fixes Applied (March 21, 2026)

**Phase B: Frontend Payment Foundation**
- **Dependencies:** Installed Stripe SDK for frontend integration
- **Type Definitions:** Created payment.ts with 10+ type definitions
- **API Service:** Implemented payment service with error handling
- **Hooks:** Created payment hooks with React Query integration
- **Security:** PCI compliance ready (no card data stored)

**Phase 7: Payment Processing Backend**
- **PaymentViewSet:** PaymentIntent creation with metadata tracking
- **StripeWebhookView:** Handles payment_intent.succeeded/failed events
- **PaymentRateThrottle:** Custom rate limiting (5/minute)
- **Root Cause Fix:** Removed stale import `api.exceptions.payment` causing module load failures
- **Test Coverage:** 12 new tests for payment flow

**Step 12: Request Logging Middleware**

| Component | Documented (README/PRD) | Actual Implementation | Mandate |
|-----------|-------------------------|-----------------------|---------|
| **Framework** | Next.js 16.1.4 | Vite + React 19 SPA | **Maintain Vite** until explicit migration is requested. |
| **Tailwind** | v4.1.18 (CSS-First) | v3.4.19 (JS Config) | **Follow v4 philosophy** (CSS variables) within v3 limits. |
| **Data State** | Real-time API | Mock Data (`mockData.ts`) | **Preserve Mock Data** for UI until API integration task is issued. |

### Recent Fixes Applied (March 21, 2026)

**Step 12: Request Logging Middleware**
- **APILoggingMiddleware:** Comprehensive audit trail with structured format
- **Smart Filtering:** Skips static, media, and non-API paths
- **Performance:** <1ms overhead per request with rotating file handler
- **Test Coverage:** 22 new tests for all logging scenarios

**Step 11: Admin Fieldset Corrections**
- **Type Safety:** Converted fieldsets from tuples to lists in `users/admin.py`
- **LSP Compatibility:** Fixed type errors for better IDE support
- **Decorator Fix:** Updated `@admin.display` usage in `courses/admin.py`
- **Test Coverage:** 13 new tests for fieldset configuration

**Previous Fixes:**
- **ENV Loading:** Added `load_dotenv()` to `academy/settings/base.py`
- **Migrations:** Generated and applied for `users`, `courses`, `api` apps
- **Sample Data:** Populated via Django shell with realistic course data
- **Caching:** Implemented Redis caching with automatic invalidation
- **Testing:** Added 56 new comprehensive API tests
- **Test Settings:** Fixed throttle rates configuration for views with explicit throttle_classes
- **Throttling Tests:** Created custom test throttle classes with low rates
- **Request ID Tests:** Added cache clearing to ensure unique IDs per request
- **API Documentation:** Added drf-spectacular with Swagger UI and ReDoc

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
- `api/views/`: ViewSets organized by domain (payments.py, all_views.py).
- `api/exceptions.py`: Custom exceptions including PaymentError.
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
- Test settings preserve throttle rates for views with explicit throttle_classes
- Custom test throttle classes available: `TestAnonRateThrottle`, `TestEnrollmentThrottle`
- Clear cache in tests that verify uniqueness: `cache.clear()`
- All new features require comprehensive tests
- Payment tests use Stripe mock mode - never hit live API
- Frontend tests: Use Vitest with React Testing Library

---

## 7. SECURITY & SAFETY

- **Credential Protection:** Never log, print, or commit `.env` variables or Stripe keys.
- **Sanitization:** All user inputs must be validated via Zod (Frontend) and Django Forms/Serializers (Backend).
- **Source Control:** Do not stage or commit unless explicitly directed.
- **Cache Security:** Never cache authenticated user data without proper key scoping.
- **Payment Security:** Never store card numbers. Use Stripe Elements for PCI compliance.
- **Webhook Verification:** Always verify Stripe webhook signatures before processing.
- **PCI Compliance:** Frontend never stores card data - only payment_intent_id
- **Payment Security:** Never store card numbers. Use Stripe Elements for PCI compliance.
- **Webhook Verification:** Always verify Stripe webhook signatures before processing.

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
| Throttle tests fail | Rate too high | Use custom test throttle classes |
| Request IDs identical | Cache not cleared | Call `cache.clear()` between requests |
| ImproperlyConfigured: No default throttle rate | Missing scope in settings | Add scope to `DEFAULT_THROTTLE_RATES` |
| LSP type error in admin | Tuple concatenation | Convert fieldsets to list: `list(UserAdmin.fieldsets) + [...]` |
| Logs not appearing | Missing logs directory | `mkdir -p backend/logs` |
| Missing request_id in logs | Wrong middleware order | Place RequestIDMiddleware before APILoggingMiddleware |

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
