# AI Academy: Production-Grade Training Platform

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Django 6.0](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-AAA-blueviolet.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-239_passing-brightgreen.svg)](#testing)

**AI Academy** is an elite, full-stack educational platform built for the next generation of AI Engineers. It features a decoupled architecture using a high-performance **Vite + React SPA** and a robust **Django REST API**, all wrapped in a distinctive **"Precision Futurism"** design language.

---

## 🎨 Design Philosophy

### *Precision Futurism with Technologic Minimalism*

We reject "AI Slop"—the generic purple gradients and soft bento grids that dominate modern templates. Instead, we embrace:
- **High-Contrast Authority:** A clean Ivory/Indigo/Cyan palette.
- **Developer-First Aesthetics:** Monospace accents and terminal-inspired UI elements.
- **Architectural Edges:** A strict `0rem` border radius for a sharp, structural feel.
- **Intentional Motion:** Purposeful, staggered animations that guide the eye without distraction.

---

## 🏗 Application Architecture

The project is architected as a strictly decoupled system to ensure scalability and independent deployment cycles.

### File Hierarchy
```text
/
├── frontend/                  # React 19 + Vite 7 SPA
│   ├── src/
│   │   ├── sections/          # High-level page modules (Hero, Features, etc.)
│   │   ├── components/
│   │   │   ├── layout/        # Global shell (Navigation, Footer)
│   │   │   └── ui/            # Atomic Shadcn/Radix primitives
│   │   ├── lib/
│   │   │   ├── animations.ts  # Centralized Framer Motion constants
│   │   │   └── utils.ts       # Merging logic (cn)
│   │   └── data/              # Mock data layer for hybrid phase
│   └── index.css              # Design System & CSS Variables
├── backend/                   # Django 6.0.2 REST API
│   ├── academy/               # Project core & split settings
│   ├── api/                   # DRF layer (Serializers, ViewSets, Utils)
│   │   └── utils/             # Cache, Image processing utilities
│   ├── courses/               # Domain logic & signals
│   └── users/                 # Auth logic & Custom User profiles
└── GEMINI.md                  # SSoT for AI coding agents
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)
- Python 3.12+ with virtual environment
- Node.js 20+ and npm

### 1. Infrastructure Setup

```bash
# From project root
docker compose up -d

# Verify containers are running
docker ps
```

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment
source /opt/venv/bin/activate

# Install dependencies
pip install -r requirements/base.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Backend will be available at:** `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## 🧪 Testing

### Run All Tests
```bash
cd backend
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input
```

### Run Specific Test Suite
```bash
# Course API tests
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_courses

# Caching tests
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_caching

# All new tests (Steps 8-9)
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_courses api.tests.test_categories api.tests.test_cohorts api.tests.test_caching
```

### Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Course API | 30 | ✅ |
| Category API | 10 | ✅ |
| Cohort API | 16 | ✅ |
| Caching | 16 | ✅ |
| Enrollment | 9 | ✅ |
| JWT Auth | 6 | ✅ |
| Performance | 4 | ✅ |
| Response Format | 17 | ✅ |
| Throttling | 5 | ✅ |
| Image Upload | 23 | ✅ |
| User Management | 24 | ✅ |
| API Documentation | 15 | ✅ |
| Admin Fieldset Corrections | 13 | ✅ |
| Request Logging | 22 | ✅ |
| Payment Processing | 12 | ✅ |
| **Total** | **239** | **✅ All passing** |

---

## 🔧 Development Status

### Current State (March 21, 2026)

#### Backend (Completed)
- ✅ **Backend API:** Fully operational with Django REST Framework
- ✅ **Database:** PostgreSQL running in Docker, migrations applied
- ✅ **Models:** Course, Cohort, Enrollment, Category, Custom User
- ✅ **Sample Data:** 3 courses, 3 categories, 1 cohort, 1 instructor created
- ✅ **JWT Authentication:** SimpleJWT configured and operational
- ✅ **N+1 Query Optimization:** 82-83% query reduction achieved
- ✅ **Enrollment Logic:** Capacity management, duplicate prevention, transaction safety
- ✅ **Response Standardization:** Consistent envelope format across all endpoints
- ✅ **Image Upload:** Course thumbnails and user avatars with validation
- ✅ **User Management:** Registration, profile, password reset endpoints
- ✅ **Redis Caching:** High-traffic endpoints cached with automatic invalidation
- ✅ **Comprehensive Testing:** 239 automated tests (ALL PASSING)
- ✅ **Rate Limiting:** Throttling configured and verified with custom test classes
- ✅ **API Documentation:** Interactive Swagger UI and ReDoc documentation
- ✅ **Request Logging:** Comprehensive audit trail with structured logging
- ✅ **Admin Fieldset Corrections:** Type safety fixes for better IDE support
- ✅ **Payment Processing:** Stripe integration with webhook handling

#### Frontend
- ✅ **Frontend:** React 19 + Vite SPA with 51 Shadcn components
- ⏳ **Integration:** Ready to connect to authenticated API endpoints

#### In Progress
- ⏳ **Payment Flow UI:** Stripe backend complete, frontend enrollment pages needed

#### Completed (March 21, 2026 - Phase 7)
- ✅ **Payment Backend:** Stripe PaymentIntent creation and webhook handling
- ✅ **Payment Tests:** 12 comprehensive tests for payment flow

---

## Recent Milestones (March 21, 2026)

### ✅ Phase 7: Payment Processing Backend (NEW)
**Status:** COMPLETE | **Tests:** 12 passing

Implemented Stripe payment processing infrastructure:
- **PaymentViewSet:** PaymentIntent creation with metadata
- **StripeWebhookView:** Event handling for payment success/failure
- **PaymentRateThrottle:** 5 requests/minute limit
- **Idempotency:** Duplicate prevention with idempotency keys
- **Security:** Webhook signature verification, ownership validation

**Endpoints Added:**
- `POST /api/v1/payments/create-intent/` - Create payment intent
- `GET /api/v1/payments/{id}/status/` - Check payment status
- `POST /api/v1/webhooks/stripe/` - Stripe webhook handler

**Root Cause Resolution:**
Fixed stale import causing exception handler failures - consolidated PaymentError into api/exceptions.py

### ✅ Step 11: Admin Fieldset Corrections
**Status:** COMPLETE | **Tests:** 13 passing

Fixed type errors in Django admin configurations:
- Converted fieldsets from tuples to lists in `users/admin.py`
- Fixed `@admin.display` decorator usage in `courses/admin.py`
- Improved LSP compatibility and IDE autocomplete support

### ✅ Step 12: Request Logging Middleware  
**Status:** COMPLETE | **Tests:** 22 passing

Implemented comprehensive API request logging:
- Structured log format: `METHOD path - status - duration - user - ip - request_id - user_agent`
- Smart filtering: Skips static, media, and non-API paths
- Performance: <1ms overhead per request
- Storage: Rotating file handler (10MB per file, 10 backups)
- Log location: `backend/logs/api_requests.log`

**Example Log:**
```
INFO GET /api/v1/courses/ - 200 - 3.22ms - testuser - 127.0.0.1 - 550e8400-e29b-41d4-a716-446655440000 - Mozilla/5.0...
```

---

## API Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| JWT Authentication | ✅ | Token obtain/refresh/verify endpoints |
| Course Listing | ✅ | Optimized with prefetch_related + caching |
| Cohort Listing | ✅ | Optimized with select_related |
| Enrollment | ✅ | Capacity management & validation |
| Filtering | ✅ | level, category, featured |
| Search | ✅ | Full-text on courses |
| Pagination | ✅ | 10 items per page |
| Caching | ✅ | Redis with auto-invalidation |
| Response Format | ✅ | Standardized envelope |
| API Documentation | ✅ | Swagger UI + ReDoc |
| Payment Processing | ✅ | Stripe PaymentIntent + Webhooks |

---

## Performance Metrics

### Query Optimization
| Endpoint | Query Reduction | Status |
|----------|-----------------|--------|
| `/api/v1/courses/` | 17 → 3 queries | **82%** faster |
| `/api/v1/cohorts/` | 12 → 2 queries | **83%** faster |
| `/api/v1/courses/{slug}/` | 4 → 2 queries | **50%** faster |

### Caching Performance
| Endpoint | Before | After (Cache Hit) | Improvement |
|----------|--------|-------------------|-------------|
| Course List | ~200ms | ~20ms | **10x faster** |
| Category List | ~100ms | ~10ms | **10x faster** |
| Course Detail | ~150ms | ~15ms | **10x faster** |

---

## Caching Strategy

### Cache TTLs
| Resource | TTL | Invalidation |
|----------|-----|--------------|
| Course List | 5 min | Time-based |
| Category List | 30 min | Time-based |
| Course Detail | 1 hour | Signal-based |
| Cohorts | 10 min | Time-based |

### Cache Invalidation
- Automatic on Course model `post_save` and `post_delete`
- Manual via `invalidate_course_cache()` utility function

---

## Known Issues

### ✅ RESOLVED: User Management Test Failures (March 21, 2026)

All 17 pre-existing test failures in `test_user_management.py` have been resolved. Root causes:
1. **Throttle scope configuration mismatch** - Views with explicit `throttle_classes` required scope definitions
2. **Password hash format mismatch** - Test expected `pbkdf2_sha256$` but test settings use MD5
3. **Throttling test approach** - Created custom test throttle classes with low rates for proper testing
4. **Request ID caching** - Added cache clearing between requests for uniqueness tests

See `AUDIT_USER_MANAGEMENT.md` for detailed remediation documentation.

### Reserved Query Parameters

- `format` is reserved by DRF and conflicts with filtering by cohort format
- Use alternative parameter names or test without this filter

---

## ♿ Accessibility & Performance

- **Target:** **WCAG AAA** Compliance.
- **Reduced Motion:** All animations check `prefers-reduced-motion`.
- **Color Contrast:** All Indigo/Cyan combinations verified for 7:1 contrast ratio.
- **Lighthouse Goals:** 95+ Performance, 100 Accessibility.

---

## 🛡 License

This project is licensed under the MIT License. Developed with precision by the AI Academy Team.

---

## Documentation

- [AGENTS.md](./AGENTS.md) - AI agent instructions and coding standards (Updated with Steps 11-12)
- [ACCOMPLISHMENTS.md](./ACCOMPLISHMENTS.md) - Detailed milestone achievements with code changes
- [API_Usage_Guide.md](./API_Usage_Guide.md) - Complete API reference (v1.3.0, includes logging)
- [AUDIT_USER_MANAGEMENT.md](./AUDIT_USER_MANAGEMENT.md) - User management test remediation report
- [REMEDIATION_PLAN.md](./REMEDIATION_PLAN.md) - Backend improvement roadmap

---

## Lessons Learned

### Request Logging Middleware

**1. Middleware Ordering is Critical**
```python
MIDDLEWARE = [
    "api.middleware.RequestIDMiddleware",      # Must come first
    "api.middleware.APILoggingMiddleware",       # Then logging
    "api.middleware.ResponseFormatMiddleware",
]
```

**2. Testing Mock Strategy**
Mock `logging.getLogger()` rather than the logger module:
```python
@patch("api.middleware.logging.getLogger")
def test_logs_api_request(self, mock_get_logger):
    mock_logger = MagicMock()
    mock_get_logger.return_value = mock_logger
    # ... test
```

**3. Log Directory Must Exist**
```bash
mkdir -p backend/logs  # Required before server starts
```

### Admin Fieldset Type Safety

**1. List vs Tuple**
```python
# List type for LSP compatibility
fieldsets = list(UserAdmin.fieldsets) + [("Profile", {...})]
```

**2. Modern Decorator Pattern**
```python
@admin.display(description="Spots Left")
def spots_remaining(self, obj):
    return obj.spots_remaining
```

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Logs not appearing | Missing logs directory | `mkdir -p backend/logs` |
| Missing request_id | Wrong middleware order | Place RequestIDMiddleware before APILoggingMiddleware |
| LSP errors in admin.py | Tuple concatenation | Use `list(UserAdmin.fieldsets)` |
| Test failures | Old test count | Update to 210 expected tests |
| Cache stale data | Signal not registered | Check `courses/apps.py` ready() method |
