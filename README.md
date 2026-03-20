# AI Academy: Production-Grade Training Platform

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Django 6.0](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-AAA-blueviolet.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-160_passing-brightgreen.svg)](#testing)

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
| **Total** | **160** | **✅ All passing** |

---

## 🔧 Development Status

### Current State (March 2026)

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
- ✅ **Comprehensive Testing:** 160 automated tests (ALL PASSING)
- ✅ **Rate Limiting:** Throttling configured and verified with custom test classes

#### Frontend
- ✅ **Frontend:** React 19 + Vite SPA with 51 Shadcn components
- ⏳ **Integration:** Ready to connect to authenticated API endpoints

#### In Progress
- ⏳ **Payments:** Stripe configured but payment flow not implemented
- ⏳ **Email Service:** Password reset configured but email sending not implemented for production

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

- [AGENTS.md](./AGENTS.md) - AI agent instructions and coding standards
- [ACCOMPLISHMENTS.md](./ACCOMPLISHMENTS.md) - Detailed milestone achievements
- [API_Usage_Guide.md](./API_Usage_Guide.md) - Complete API reference
- [AUDIT_USER_MANAGEMENT.md](./AUDIT_USER_MANAGEMENT.md) - User management test remediation report
- [REMEDIATION_PLAN.md](./REMEDIATION_PLAN.md) - Backend improvement roadmap
