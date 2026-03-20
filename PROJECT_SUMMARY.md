# AI Academy - Project Summary

## Overview
A production-grade AI & Software Training Platform built with Next.js 16.1.4, React 19.2.3, Tailwind CSS 4.1.18, and Django 6.0.2.

## Design Philosophy
**"Precision Futurism with Technologic Minimalism"**
- Dynamic intelligence-forward visual metaphors
- Conversion-optimized clarity
- Sharp, architectural edges (zero border radius)
- Code-first aesthetic

## Project Structure

### Frontend (Next.js)
```
src/
├── app/
│   ├── courses/page.tsx       # Course listing page
│   ├── globals.css            # Tailwind v4 theme config
│   ├── layout.tsx             # Root layout with fonts
│   └── page.tsx               # Homepage
├── components/
│   ├── layout/
│   │   ├── footer.tsx         # Site footer
│   │   └── navigation.tsx     # Header with mobile menu
│   ├── sections/
│   │   ├── hero.tsx           # Hero with animated visual
│   │   ├── trust-signals.tsx  # Company logos
│   │   ├── course-categories.tsx  # 6 category cards
│   │   ├── features.tsx       # 6 feature cards
│   │   ├── featured-course.tsx    # AI Bootcamp showcase
│   │   ├── training-schedule.tsx  # Cohort list
│   │   └── consulting-cta.tsx     # Enterprise CTA
│   └── ui/
│       ├── button.tsx         # 6 variants
│       ├── badge.tsx          # Status badges
│       ├── status-badge.tsx   # Pulse animation badge
│       ├── course-card.tsx    # Accent-top card
│       └── reveal.tsx         # Scroll animation wrapper
├── lib/
│   ├── animations.ts          # Framer Motion presets
│   ├── hooks/
│   │   └── useReducedMotion.ts    # Accessibility hook
│   └── utils.ts               # cn() helper
└── types/
    └── index.ts               # TypeScript interfaces
```

### Backend (Django)
```
backend/
├── academy/
│   ├── settings/
│   │   ├── base.py            # Base settings
│   │   ├── development.py     # Dev settings
│   │   └── production.py      # Prod settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI config
│   └── asgi.py                # ASGI config
├── api/
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # API routes
│   └── views.py               # ViewSets
├── courses/
│   ├── models.py              # Course, Cohort, Enrollment
│   └── admin.py               # Admin config
├── users/
│   ├── models.py              # Custom User model
│   └── admin.py               # Admin config
├── manage.py                  # Django CLI
└── requirements/
    ├── base.txt               # Production deps
    └── development.txt        # Dev deps
```

## Key Features Implemented

### Design System
- **Colors**: Electric Indigo (#4f46e5), Neural Cyan (#06b6d4), Signal Amber (#f59e0b)
- **Typography**: Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Spacing**: 4px base grid, 80px section padding
- **Zero Border Radius**: Sharp, architectural edges

### UI Components
1. **Button** - 6 variants (primary, secondary, ghost, urgency, outline, danger)
2. **Course Card** - Accent-top pattern with hover effects
3. **Status Badge** - Pulse animation for urgency indicators
4. **Navigation** - Glassmorphism with mobile menu
5. **Reveal** - Scroll-triggered animations with reduced motion support

### Page Sections
1. **Hero** - Animated status badge, stats, abstract neural network visualization
2. **Trust Signals** - Company logos with hover effects
3. **Course Categories** - 6 category cards with accent colors
4. **Features** - 6 feature cards with icons
5. **Featured Course** - AI Engineering Bootcamp showcase
6. **Training Schedule** - Upcoming cohorts with status indicators
7. **Consulting CTA** - Enterprise training call-to-action

### Backend Models
1. **User** - Custom user model with student/instructor roles
2. **Category** - Course categories with colors
3. **Course** - Full course details with pricing
4. **Cohort** - Scheduled course instances
5. **Enrollment** - Student enrollments with payment tracking

### API Endpoints
- `GET /api/v1/courses/` - List all courses
- `GET /api/v1/courses/{slug}/` - Get course details
- `GET /api/v1/courses/{slug}/cohorts/` - Get course cohorts
- `GET /api/v1/cohorts/` - List all cohorts
- `GET /api/v1/categories/` - List all categories
- `GET /api/v1/enrollments/` - List user enrollments (auth required)
- `POST /api/v1/enrollments/` - Create enrollment (auth required)

## Tech Stack

### Frontend
- Next.js 16.1.4
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS 4.1.18 (CSS-first config)
- Framer Motion 12.29.0
- Zustand 5.0.3
- Lucide React 0.469.0
- Radix UI

### Backend
- Django 6.0.2
- Django REST Framework 3.15.2
- PostgreSQL 16
- Redis 5.2.1
- Celery 5.4.0
- Stripe 11.3.0

## Getting Started

### Frontend
```bash
cd my-app
npm install
npm run dev
```

### Backend
```bash
cd my-app/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py runserver
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/academy_db
REDIS_URL=redis://localhost:6379/0
STRIPE_SECRET_KEY=sk_test_...
```

## Performance Targets
| Metric | Target |
|--------|--------|
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 100 |
| Largest Contentful Paint | < 2.5s |
| First Input Delay | < 100ms |
| Cumulative Layout Shift | < 0.1 |

## Accessibility (WCAG AAA)
- `useReducedMotion` hook for motion sensitivity
- Proper heading hierarchy
- ARIA labels on interactive elements
- Focus indicators on all buttons
- Color contrast compliance

## File Count
- **Frontend**: 24 TypeScript/React files
- **Backend**: 16 Python files
- **Config**: 6 configuration files
- **Total**: 46 files

## Lines of Code (Estimated)
- **Frontend**: ~3,500 lines
- **Backend**: ~1,200 lines
- **Total**: ~4,700 lines
