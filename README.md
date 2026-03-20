# AI Academy: Production-Grade Training Platform

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Django 6.0](https://img.shields.io/badge/Django-6.0-green.svg)](https://www.djangoproject.com/)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-AAA-blueviolet.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

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
├── frontend/               # React 19 + Vite 7 SPA
│   ├── src/
│   │   ├── sections/       # High-level page modules (Hero, Features, etc.)
│   │   ├── components/
│   │   │   ├── layout/     # Global shell (Navigation, Footer)
│   │   │   └── ui/         # Atomic Shadcn/Radix primitives
│   │   ├── lib/
│   │   │   ├── animations.ts # Centralized Framer Motion constants
│   │   │   └── utils.ts    # Merging logic (cn)
│   │   └── data/           # Mock data layer for hybrid phase
│   └── index.css           # Design System & CSS Variables
├── backend/                # Django 6.0.2 REST API
│   ├── academy/            # Project core & split settings
│   ├── api/                # DRF layer (Serializers & ViewSets)
│   ├── courses/            # Domain logic (Course, Cohort, Enrollment models)
│   └── users/              # Auth logic & Custom User profiles
└── GEMINI.md               # SSoT for AI coding agents
```

### Key Files Description
- **`frontend/src/index.css`**: The heart of the design system. Contains all CSS variables for the 60-30-10 color rule.
- **`frontend/src/lib/animations.ts`**: Standardizes all transition durations and easings across the app.
- **`backend/courses/models.py`**: Defines the complex relationship between Courses, scheduled Cohorts, and User Enrollments.
- **`backend/api/serializers.py`**: Ensures type-safe data transmission between Django and React.

---

## 🔄 Interaction & Logic Flows

### User Interaction Journey
This diagram illustrates the path from discovery to enrollment.

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant App as React SPA
    participant API as Django REST API
    participant DB as PostgreSQL

    User->>App: Loads Landing Page
    App->>App: Executes Staggered Animations
    User->>App: Clicks "Explore Courses"
    App->>User: Smooth Scrolls to #courses
    User->>App: Clicks "Enroll" on AI Engineering
    App->>API: GET /api/v1/cohorts/?course=1
    API->>DB: Query Upcoming Cohorts
    DB-->>API: Return Result
    API-->>App: Return JSON Data
    App->>User: Renders Training Schedule Component
```

### Application Logic Flow
The following flowchart describes the internal data-handling logic during the "Hybrid Phase".

```mermaid
graph TD
    Start[User Interaction] --> Trigger{Is API Connected?}
    Trigger -- No --> Mock[Fetch from src/data/mockData.ts]
    Trigger -- Yes --> Real[Fetch from /api/v1/courses/]
    
    Mock --> Transform[Apply lib/animations.ts Variants]
    Real --> Transform
    
    Transform --> Render[Render Section Component]
    Render --> Reveal[Reveal via Framer Motion]
    
    Render --> Interaction{Action Taken?}
    Interaction -- Enrollment --> AuthCheck[Check JWT via users/models.py]
    AuthCheck -- Valid --> Payment[Redirect to Stripe]
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)
- Python 3.12+ with virtual environment
- Node.js 20+ and npm

### 1. Infrastructure Setup

Start the required services (PostgreSQL, Redis, MinIO):

```bash
# From project root
docker compose up -d

# Verify containers are running
docker ps
```

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment (or use existing)
source /opt/venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements/base.txt

# Run migrations (creates database tables)
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Backend will be available at:** `http://localhost:8000`

**API Endpoints:**
- `GET /api/v1/courses/` - List all courses
- `GET /api/v1/courses/{slug}/` - Course detail
- `GET /api/v1/categories/` - List categories
- `GET /api/v1/cohorts/` - List cohorts
- `GET /admin/` - Django admin panel

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend will be available at:** `http://localhost:5173` (or as shown in terminal)

---

## 🌐 Deployment Strategy

### Frontend (Edge)
- **Target:** Vercel or Netlify.
- **Workflow:** Automatic deployment on `git push main`.
- **Environment:** Production build using `vite build`.

### Backend (Cloud)
- **Target:** Dockerized container on DigitalOcean or AWS.
- **Database:** Managed PostgreSQL 16.
- **Storage:** AWS S3 for course thumbnails and user avatars.
- **Task Queue:** Celery + Redis for asynchronous enrollment emails.

---

## 🔧 Development Status

### Current State (March 2026)
- ✅ **Backend API:** Fully operational with Django REST Framework
- ✅ **Database:** PostgreSQL running in Docker, migrations applied
- ✅ **Models:** Course, Cohort, Enrollment, Category, Custom User
- ✅ **Sample Data:** 3 courses, 3 categories, 1 cohort created
- ✅ **Frontend:** React 19 + Vite SPA with 51 Shadcn components
- ⏳ **Integration:** Frontend still using mock data (ready for API connection)
- ⏳ **Authentication:** JWT not yet implemented
- ⏳ **Payments:** Stripe configured but not integrated

### Known Issues
See [ACCOMPLISHMENTS.md](./ACCOMPLISHMENTS.md) for detailed troubleshooting guide.

---

## ♿ Accessibility & Performance
- **Target:** **WCAG AAA** Compliance.
- **Reduced Motion:** All animations check `prefers-reduced-motion` via the `useReducedMotion` hook.
- **Color Contrast:** All Indigo/Cyan combinations are verified for a 7:1 contrast ratio.
- **Lighthouse Goals:** 95+ Performance, 100 Accessibility.

---

## 🛡 License
This project is licensed under the MIT License. Developed with precision by the AI Academy Team.
