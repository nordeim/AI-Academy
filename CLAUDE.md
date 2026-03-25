# CLAUDE.md - AI Academy Project Briefing

> **Single Source of Truth (SSoT)** for Claude Code / AI coding agents operating on this repository.  
> Defines technical standards, architectural mandates, aesthetic requirements, and operational procedures.  
> **Last Updated:** March 25, 2026 | **Status:** Production Ready

---

## 1. PROJECT IDENTITY

**Project:** AI Academy  
**Mission:** Practitioner-led, production-grade AI and Software Engineering training platform.  
**Architecture:** Decoupled full-stack — Vite + React 19 SPA frontend + Django 6 REST API backend.  
**Design Language:** *Precision Futurism with Technologic Minimalism.*

---

## 2. CURRENT STATE SUMMARY

| Layer | Status | Tests | Notes |
|-------|--------|-------|-------|
| **Backend (Django)** | ✅ Operational | 257 passing | All 18 test files in `api/tests/` + `courses/tests/` |
| **Frontend (React)** | ✅ Operational | 92+ passing | Vitest + React Testing Library |
| **E2E Smoke** | ✅ Passing | 12 tests | agent-browser integration |
| **TypeScript Build** | ✅ 0 errors | — | `verbatimModuleSyntax: true` enforced |
| **Total** | ✅ **364+ tests** | — | All passing as of March 24, 2026 |

### Critical Context for Agents

1. **Frontend uses Vite + React SPA, NOT Next.js.** Documentation references Next.js in some places — ignore them. Maintain Vite until explicit migration is requested.
2. **Tailwind is v3.4.19 (JS config), NOT v4.** Follow v4 CSS-variable philosophy within v3 limits.
3. **Landing page sections use mock data** (`src/data/mockData.ts`). Integrated pages (Courses, Course Detail, Enrollment) use real API data via React Query hooks.
4. **`verbatimModuleSyntax: true`** in `tsconfig.app.json` — ALL type-only imports MUST use `import type` syntax. This was the root cause of 218 build errors that were previously fixed.

---

## 3. TECHNICAL STACK

### Frontend (`/frontend`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.2.4+ | Build tool & dev server |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 3.4.19 | Styling (JS config, not v4 CSS-first) |
| TanStack Query | 5.x | Server state & caching |
| Zustand | 5.0.12 | Client state |
| Framer Motion | 12.35.0 | Animations (use `lib/animations.ts` constants) |
| Shadcn/UI | Latest | 53 Radix-based primitives in `components/ui/` |
| cmdk | 1.1.1 | Command Palette search |
| Stripe SDK | @stripe/stripe-js 8.11.0, @stripe/react-stripe-js 5.6.1 | Payments |
| React Router | 6.30.3 | Client-side routing |
| Axios | 1.13.6 | HTTP client |
| Zod | 4.3.5 | Form validation |
| Lucide React | 0.562.0 | Icons |

### Backend (`/backend`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 6.0.3 | Web framework |
| Django REST Framework | 3.15.2+ | API framework |
| PostgreSQL | 16 | Primary database |
| Redis | 5.2.1+ (django-redis 5.4.0) | Caching |
| SimpleJWT | 5.5.1 | JWT authentication |
| Stripe | 14.4.1 | Payment processing |
| drf-spectacular | 0.29.0 | OpenAPI 3.0 schema generation |
| MinIO/S3 | — | Object storage via django-storages |

---

## 4. DIRECTORY STRUCTURE

```
AI-Academy/
├── frontend/                          # Vite + React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # 53 Shadcn/Radix primitives
│   │   │   ├── layout/                # Navigation.tsx, Footer.tsx
│   │   │   ├── PaymentForm.tsx        # Stripe Elements payment form
│   │   │   ├── CohortSelector.tsx     # Interactive cohort selection
│   │   │   ├── SearchDialog.tsx       # Command Palette search (cmdk)
│   │   │   └── ProtectedRoute.tsx     # Auth route guard
│   │   ├── pages/
│   │   │   ├── CoursesPage.tsx        # Course listing (API-integrated)
│   │   │   ├── CourseDetailPage.tsx   # Course detail (API-integrated)
│   │   │   ├── EnrollmentPage.tsx     # Multi-step enrollment wizard
│   │   │   ├── EnrollmentConfirmationPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── sections/                  # Homepage sections (Hero, Features, etc.)
│   │   ├── hooks/                     # useCourses, useCategories, useCohorts, usePayment
│   │   ├── services/api/              # Axios service layer (courses, auth, payments, etc.)
│   │   ├── types/                     # TypeScript definitions (api, payment, course, etc.)
│   │   ├── store/                     # Zustand stores (authStore.ts)
│   │   ├── lib/                       # utils.ts, animations.ts
│   │   ├── data/                      # mockData.ts (for landing page sections)
│   │   └── index.css                  # Design tokens (CSS variables)
│   ├── tests/e2e/                     # E2E smoke tests
│   ├── vite.config.ts
│   ├── tsconfig.app.json              # verbatimModuleSyntax: true
│   └── vitest.config.ts
│
├── backend/                           # Django REST API
│   ├── academy/
│   │   ├── settings/
│   │   │   ├── base.py                # Main settings (DB, cache, Stripe, JWT, logging)
│   │   │   ├── development.py
│   │   │   ├── production.py
│   │   │   └── test.py                # Test settings (high throttle rates, MD5 hasher)
│   │   └── urls.py                    # Root URL config + drf-spectacular routes
│   ├── api/
│   │   ├── views/
│   │   │   ├── all_views.py           # Course, Category, Cohort, Enrollment, Auth ViewSets
│   │   │   └── payments.py            # PaymentViewSet, StripeWebhookView
│   │   ├── serializers.py
│   │   ├── urls.py                    # API router (courses, cohorts, categories, enrollments, payments)
│   │   ├── exceptions.py              # standardized_exception_handler, PaymentError
│   │   ├── middleware.py              # RequestIDMiddleware, APILoggingMiddleware, ResponseFormatMiddleware
│   │   ├── responses.py               # ResponseFormatterMixin
│   │   ├── throttles.py               # Custom throttle classes
│   │   ├── utils/
│   │   │   ├── cache.py               # Cache key generators & invalidation
│   │   │   └── images.py              # Image upload utilities
│   │   └── tests/                     # 17 test files (257 tests total)
│   ├── courses/
│   │   ├── models.py                  # Category, Course, Cohort, Enrollment (with soft delete)
│   │   ├── signals.py                 # Cache invalidation on post_save/post_delete
│   │   ├── admin.py
│   │   ├── apps.py                    # Signal registration in ready()
│   │   └── tests/test_soft_delete.py  # 18 soft delete tests
│   └── users/
│       ├── models.py                  # Custom User model (AbstractUser)
│       └── admin.py                   # UserAdmin with Profile/Roles fieldsets
│
├── start_servers.sh                   # Stable server startup (port cleanup + health checks)
├── screenshots/                       # E2E visual evidence
├── AGENTS.md                          # GEMINI Mission Brief (SSoT for Gemini)
├── CLAUDE.md                          # THIS FILE (SSoT for Claude)
├── README.md                          # Project overview
├── ACCOMPLISHMENTS.md                 # Complete milestone history
└── Project_Architecture_Document.md   # Technical architecture deep-dive
```

---

## 5. DESIGN SYSTEM

### Color Palette (60-30-10 Rule)

- **Primary (60%):** `--color-background` (#fafaf9) / `--color-surface` (#ffffff)
- **Secondary (30%):** `--color-primary-600` (#4f46e5 — Electric Indigo)
- **Accent (10%):** `--color-cyan-500` (#06b6d4 — Neural Cyan)
- **Urgency/CTA:** `--color-amber-500` (#f59e0b — Signal Amber)

### Typography

| Role | Font | Rationale |
|------|------|-----------|
| Display/Headings | Space Grotesk | Geometric, futurist |
| Body | Inter | High readability |
| Code/Labels | JetBrains Mono | Technical authority |

### UI Rules

- **Radius:** `--radius: 0rem` — **MANDATORY sharp corners.** Never use rounded corners.
- **Spacing:** 4px base grid (`--space-*` CSS variables).
- **Cards:** Use `card-accent-top` pattern (3px top border colored by category).
- **Animations:** Use constants from `lib/animations.ts`. Never hardcode durations.
- **Accessibility:** WCAG AAA target. All animations must respect `useReducedMotion`.
- **Anti-Generic:** Reject purple gradients, soft blobs, bento grids, generic Inter pairings.

---

## 6. BACKEND ARCHITECTURE

### Models

- **Category** — Course categories with color, icon, ordering
- **Course** — UUID PK, slug, M2M categories, level/price/rating, soft delete
- **Cohort** — UUID PK, FK to Course, schedule, capacity, soft delete
- **Enrollment** — UUID PK, FK to User/Course/Cohort, payment tracking, soft delete
- **User** — Custom `AbstractUser`, email as USERNAME_FIELD, profile fields

### Soft Delete Infrastructure

All core models (Course, Cohort, Enrollment) use soft delete:
- `deleted_at` DateTimeField with db_index
- `SoftDeleteManager` — default excludes deleted records
- `objects.all_objects()` — includes deleted
- `objects.only_deleted()` — only deleted
- Instance `.delete()` sets `deleted_at`, `.restore()` clears it

### API Response Format

All endpoints return standardized envelope:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "errors": {},
  "meta": {
    "timestamp": "2026-03-21T12:00:00Z",
    "request_id": "uuid"
  }
}
```

Implemented via `ResponseFormatterMixin` in `api/responses.py` and `standardized_exception_handler` in `api/exceptions.py`.

### Authentication

- **JWT:** SimpleJWT with 30-min access, 7-day refresh, token rotation + blacklisting
- **Endpoints:** `POST /api/v1/auth/token/`, `/auth/token/refresh/`, `/auth/token/verify/`
- **Registration:** `POST /api/v1/auth/register/`
- **Profile:** `GET/PATCH /api/v1/users/me/`
- **Password Reset:** `POST /api/v1/auth/password-reset/` and `/auth/password-reset/confirm/`

### Rate Limiting

| Scope | Rate | Applies To |
|-------|------|------------|
| anon | 100/hour | Anonymous users |
| user | 1000/hour | Authenticated users |
| enrollment | 10/minute | Enrollment operations |

### Caching Strategy

| Resource | TTL | Key Pattern | Invalidation |
|----------|-----|-------------|--------------|
| Course List | 5 min | `course:list:{params}` | Time-based |
| Category List | 30 min | `category:list` | Time-based |
| Course Detail | 1 hour | `course:detail:{slug}` | Signal (post_save/post_delete) |
| Cohorts | 10 min | `course:{slug}:cohorts` | Time-based |

Cache utilities: `api/utils/cache.py`  
Invalidation signals: `courses/signals.py` (registered in `courses/apps.py` ready())

### Middleware Stack (Order Matters)

1. CorsMiddleware
2. SecurityMiddleware
3. WhiteNoiseMiddleware
4. SessionMiddleware
5. CommonMiddleware
6. CsrfViewMiddleware
7. AuthenticationMiddleware
8. MessageMiddleware
9. XFrameOptionsMiddleware
10. **RequestIDMiddleware** — generates unique request_id
11. **APILoggingMiddleware** — audit trail (must be after RequestIDMiddleware)
12. **ResponseFormatMiddleware** — fallback standardization

### API Documentation

- **Swagger UI:** `/api/docs/`
- **ReDoc:** `/api/redoc/`
- **OpenAPI Schema:** `/api/schema/`

---

## 7. FRONTEND ARCHITECTURE

### Routing (React Router v6)

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | HomePage (Hero, TrustSignals, CourseCategories, Features, FeaturedCourse, TrainingSchedule, ConsultingCTA) | No |
| `/courses` | CoursesPage | No |
| `/courses/:slug` | CourseDetailPage | No |
| `/courses/:slug/enroll` | EnrollmentPage | Yes (ProtectedRoute) |
| `/enrollment/confirmation` | EnrollmentConfirmationPage | Yes (ProtectedRoute) |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/profile` | ProfilePage | Yes (ProtectedRoute) |

### State Management

- **Server State:** TanStack Query (`@tanstack/react-query`) — queries in `hooks/`, services in `services/api/`
- **Client State:** Zustand — `store/authStore.ts`
- **Query Config:** 5-minute stale time (matches backend cache), 3 retries, no refetch on window focus

### Data Flow

1. **Integrated Pages** (Courses, Course Detail, Enrollment): Use `useQuery` hooks from `hooks/` → `services/api/` → Axios → Backend API
2. **Landing Page Sections** (Hero, Features, etc.): Use `data/mockData.ts` (NOT API-integrated)
3. **Command Palette:** Real-time search via `SearchDialog.tsx` → `GET /api/v1/courses/?search={query}`

### API Service Layer

| File | Purpose |
|------|---------|
| `services/api/client.ts` | Axios instance with base URL and interceptors |
| `services/api/courses.ts` | Course CRUD operations |
| `services/api/categories.ts` | Category listing |
| `services/api/cohorts.ts` | Cohort operations |
| `services/api/auth.ts` | Authentication (login, register, token refresh) |
| `services/api/payments.ts` | Stripe PaymentIntent creation, status checks |
| `services/api/enrollments.ts` | Enrollment operations |

### Payment Flow

1. User selects cohort → `CohortSelector` component
2. `POST /api/v1/payments/create-intent/` with `enrollment_id`
3. Server returns Stripe `client_secret`
4. `PaymentForm` renders Stripe Elements card input
5. User confirms payment via Stripe
6. Webhook `payment_intent.succeeded` → enrollment confirmed

### TypeScript Configuration

- **`verbatimModuleSyntax: true`** — Use `import type` for type-only imports
- **`strict: true`** — Full strict mode
- **`noUnusedLocals/noUnusedParameters: true`** — Clean code enforced
- Path alias: `@/` → `./src/`

---

## 8. TESTING

### Backend Tests

```bash
# Run all tests
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input

# Run specific test file
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_courses --no-input

# Run with verbose output
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test -v 2
```

**Test files** (17 files, 257 tests total):
- `api/tests/test_courses.py` — 30 tests
- `api/tests/test_categories.py` — 10 tests
- `api/tests/test_cohorts.py` — 16 tests
- `api/tests/test_caching.py` — 16 tests
- `api/tests/test_enrollment.py` — 9 tests
- `api/tests/test_jwt.py` — 6 tests
- `api/tests/test_performance.py` — 4 tests
- `api/tests/test_response_standardization.py` — 17 tests
- `api/tests/test_throttling.py` — 5 tests
- `api/tests/test_image_upload.py` — 23 tests
- `api/tests/test_user_management.py` — 24 tests
- `api/tests/test_api_documentation.py` — 15 tests
- `api/tests/test_admin_fieldsets.py` — 13 tests
- `api/tests/test_request_logging.py` — 22 tests
- `api/tests/test_field_level_permissions.py` — 17 tests
- `api/tests/test_payments.py` — 12 tests
- `courses/tests/test_soft_delete.py` — 18 tests

### Frontend Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Test files located in:
- `src/components/__tests__/`
- `src/pages/__tests__/`
- `src/hooks/__tests__/`
- `src/__tests__/`
- `src/sections/__tests__/`
- `tests/e2e/`

### Test Settings Notes

- Test settings use `MD5PasswordHasher` for speed — password hash assertions must handle both `pbkdf2_sha256$` and `md5$` prefixes
- Throttle rates are set high in test settings (`1000/minute` for anon, `10000/minute` for user)
- Custom test throttle classes: `TestAnonRateThrottle` (3/min), `TestEnrollmentThrottle` (5/min)
- Clear `cache.clear()` between requests when testing uniqueness (e.g., request_id)
- Payment tests use Stripe mock mode — never hit live API

---

## 9. CODING STANDARDS

### General

- **TDD:** RED → GREEN → REFACTOR cycle for new features
- **Surgical Edits:** Targeted changes, avoid massive rewrites
- **DRY:** Check `lib/utils.ts` and `lib/animations.ts` before creating helpers
- **No comments** unless explicitly requested

### Frontend

- Use `cn()` from `@/lib/utils` for all Tailwind class merging
- Handle all UI states: Loading, Error, Empty, Success
- Use `import type` for type-only imports (verbatimModuleSyntax requirement)
- Never hardcode animation durations — use `lib/animations.ts` constants
- Prefer Composition over inheritance
- Disable buttons during async mutations, show loading indicators
- Use Shadcn/UI primitives from `components/ui/` — never rebuild from scratch

### Backend

- Strictly typed model fields (Django 6 defaults)
- UUIDs for primary keys in Course, Cohort, Enrollment
- Business logic in Models or Services, NOT Views
- All views inherit from `ResponseFormatterMixin`
- Apply `@extend_schema` decorators for OpenAPI documentation
- Cache utilities in `api/utils/cache.py`
- Cache invalidation via signals in `courses/signals.py`
- Handle `swagger_fake_view` in ViewSets that access `request.user`:
  ```python
  def get_queryset(self):
      if getattr(self, "swagger_fake_view", False):
          return Model.objects.none()
      return Model.objects.filter(user=self.request.user)
  ```

---

## 10. SECURITY

- Never log, print, or commit `.env` variables or Stripe keys
- All user inputs validated via Zod (frontend) and Django Serializers (backend)
- Never store card numbers — use Stripe Elements for PCI compliance
- Always verify Stripe webhook signatures before processing
- Never cache authenticated user data without proper key scoping
- Rate limiting enforced on all endpoints

---

## 11. COMMON COMMANDS

```bash
# Start both servers (with health checks)
./start_servers.sh

# Stop servers
pkill -f 'manage.py runserver'
pkill -f 'vite'

# Backend tests
cd backend && DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input

# Frontend tests
cd frontend && npm run test

# Frontend build
cd frontend && npm run build

# Frontend dev server only
cd frontend && npm run dev

# Backend dev server only
cd backend && python manage.py runserver 0.0.0.0:8000
```

---

## 12. API ENDPOINTS REFERENCE

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/courses/` | List published courses (filter, search, order) |
| GET | `/api/v1/courses/{slug}/` | Course detail |
| GET | `/api/v1/courses/{slug}/cohorts/` | Course cohorts |
| GET | `/api/v1/categories/` | List categories with course counts |
| GET | `/api/v1/cohorts/` | List cohorts |
| POST | `/api/v1/auth/register/` | User registration |
| POST | `/api/v1/auth/token/` | JWT token obtain |
| POST | `/api/v1/auth/token/refresh/` | JWT token refresh |
| POST | `/api/v1/auth/token/verify/` | JWT token verify |
| POST | `/api/v1/auth/password-reset/` | Password reset request |
| POST | `/api/v1/auth/password-reset/confirm/` | Password reset confirm |

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/api/v1/users/me/` | User profile |
| POST | `/api/v1/enrollments/` | Create enrollment |
| POST | `/api/v1/payments/create-intent/` | Create Stripe PaymentIntent |
| GET | `/api/v1/payments/{id}/status/` | Check payment status |
| POST | `/api/v1/courses/{slug}/thumbnail/` | Upload course thumbnail |
| POST | `/api/v1/users/me/avatar/` | Upload user avatar |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks/stripe/` | Stripe webhook handler |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schema/` | OpenAPI 3.0 schema (YAML) |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/redoc/` | ReDoc |
| GET | `/admin/` | Django Admin |

---

## 13. TROUBLESHOOTING

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeScript build errors (TS1484) | `verbatimModuleSyntax` | Use `import type` for type-only imports |
| Blank white page | `kimi-plugin-inspect-react` incompatible with React 19 | Remove plugin from `vite.config.ts` |
| Server dies after shell exit | Process requires active TTY | Use `nohup` with `< /dev/null` redirection |
| Tests return 404 | Reserved query param `format` | Avoid `format` as filter param name |
| Throttle tests fail | Rate too high in test settings | Use custom test throttle classes |
| Request IDs identical | Response caching | Call `cache.clear()` between requests |
| Cache stale data | Signal not registered | Check `courses/apps.py` `ready()` method |
| Ordering fails (string comparison) | API returns decimals as strings | Convert to float: `float(c["price"])` |
| LSP type error in admin | Tuple concatenation | Convert fieldsets to list: `list(UserAdmin.fieldsets) + [...]` |
| `ImproperlyConfigured: No default throttle rate` | Missing scope in settings | Add scope to `DEFAULT_THROTTLE_RATES` |
| Import error from `api.exceptions` | Stale import from deleted module | Remove invalid import, consolidate in `exceptions.py` |
| Stripe Elements init error | Elements wrapper applied too early | Make `<Elements>` conditional on stripePromise |
| Mobile menu not closing | Missing state management | Verify `setIsMobileMenuOpen(false)` on navigation |
| Button not responding | Missing onClick handler | Add `useNavigate` + `onClick` handler |

---

## 14. DEFINITION OF DONE

A task is complete only when:

1. **Validation:** Behavioral correctness verified (tests or shell verification)
2. **Styling:** Adheres to Design System (sharp corners, indigo/cyan theme, CSS variables)
3. **Testing:** New features include comprehensive test coverage (TDD preferred)
4. **TypeScript:** Build succeeds with 0 errors (`npm run build`)
5. **No regressions:** All existing tests still pass
6. **Documentation:** Update relevant docs if architecture changes

---

## 15. RECENT LESSONS LEARNED

1. **`verbatimModuleSyntax`** requires `import type` — caused 218 build errors when violated
2. **React 19** is incompatible with some Vite plugins (e.g., `kimi-plugin-inspect-react`)
3. **DRF throttle rates** are computed at class init — `override_settings` doesn't affect them; use custom throttle classes for testing
4. **Cached responses** include dynamic metadata — clear cache between tests verifying uniqueness
5. **Django signals** must be registered in `apps.py` `ready()` method
6. **`format`** is a reserved DRF query parameter — don't use it as a filter name
7. **Server backgrounding** requires `nohup` + `< /dev/null` for Node.js processes
8. **cmdk** component needs `shouldFilter={false}` to disable built-in filtering when using custom search logic

---

## 16. ROADMAP STATUS

### Completed (Q1 2026)
- [x] Backend API architecture & security hardening
- [x] JWT authentication & response standardization
- [x] N+1 query optimization & Redis caching
- [x] Payment processing (Stripe)
- [x] Soft delete infrastructure
- [x] Frontend UI components & pages
- [x] TypeScript build fixes (218 → 0 errors)
- [x] E2E testing infrastructure
- [x] QA verification (all issues resolved)

### Pending (Q2-Q3 2026)
- [ ] Production deployment (Docker, CI/CD)
- [ ] Load testing (100+ concurrent users)
- [ ] Security audit (OWASP compliance)
- [ ] Student dashboard & progress tracking
- [ ] Video lesson player (MinIO integration)
- [ ] Certificate generation

---

*This document is the authoritative reference for Claude Code agents. When in doubt, this document takes precedence over all other documentation in the repository.*
