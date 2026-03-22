# AI Academy - Project Architecture Document

## 1. Executive Summary

**AI Academy** is a production-grade educational platform designed for AI and Software Engineering training. It is architected as a decoupled full-stack application consisting of a **React (Vite)** frontend and a **Django (DRF)** backend.

### Core Design Philosophy
The project follows a **"Precision Futurism"** aesthetic, emphasizing:
- **Technologic Minimalism:** High-contrast, code-first aesthetics (JetBrains Mono, Space Grotesk).
- **CSS-First Styling:** utilizing Tailwind CSS with extensive CSS variables for theming.
- **Component-Driven UI:** Leveraging Shadcn/UI primitives for accessible, composable interfaces.

> **⚠️ Architecture Note:** The project is implemented as a **Vite + React Single Page Application (SPA)** and a **Django REST API**. While initially documented as using mock data, the system is currently in a **Hybrid Integration Phase** where core pages (`CoursesPage`, `CourseDetailPage`) are fully integrated with the backend API, while landing page sections still utilize legacy mock data.

---

## 2. High-Level System Architecture

The system follows a strictly decoupled **Client-Server** architecture.

```mermaid
graph TD
    User[User / Browser]
    
    subgraph Frontend [Frontend (Vite + React)]
        SPA[Single Page App]
        Router[React Router v6]
        TanStack[TanStack Query - Data Fetching]
        Zustand[State Management]
        UI[Shadcn UI Components]
    end
    
    subgraph Backend [Backend (Django)]
        API[Django REST Framework]
        Auth[SimpleJWT Authentication]
        Logging[APILoggingMiddleware - Audit Trail]
        Admin[Django Admin]
        
        subgraph Services
            CoursesApp[Courses App]
            UsersApp[Users App]
            EnrollmentApp[Enrollment App]
        end
    end
    
    subgraph Infrastructure
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
        Stripe[Stripe Payment Gateway]
        Storage[MinIO / S3 - Media]
    end

    User -->|HTTPS| SPA
    SPA -->|REST API (JSON)| API
    API -->|Read/Write| DB
    API -->|Cache| Redis
    API -->|Payments| Stripe
    API -->|Object Storage| Storage
```

---

## 3. Frontend Architecture

The frontend is built with **React 19** using **Vite 7** for tooling. It follows a modular architecture separating pages, sections, and low-level primitives.

### 3.1 Directory Structure

```mermaid
graph TD
    src[src]
    src --> components[components]
    src --> pages[pages]
    src --> sections[sections]
    src --> services[services/api]
    src --> hooks[hooks]
    src --> types[types]
    
    components --> ui[ui (Shadcn)]
    components --> Payment[PaymentForm.tsx]
    
    pages --> Courses[CoursesPage.tsx]
    pages --> Detail[CourseDetailPage.tsx]
    pages --> Enroll[EnrollmentPage.tsx]
    
    services --> Client[client.ts - Axios]
    services --> CoursesAPI[courses.ts]
    
    sections --> Hero[Hero.tsx]
    
    types --> API[api.ts]
    types --> PaymentTypes[payment.ts]
```

### 3.2 Key Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 7.2.4 | Build tool and dev server. |
| **React** | 19.2.0 | UI Library. |
| **TanStack Query** | 5.x | Server state management and caching. |
| **Tailwind CSS** | 3.4.19 | Styling engine with CSS-variable based theme. |
| **Framer Motion** | 12.35.0 | High-fidelity animations. |
| **Stripe SDK** | 14.4.1 | Frontend payment processing (Stripe Elements). |

### 3.3 Design System Implementation
Centralized in `src/index.css` via CSS variables.
- **Sharp Corners:** `--radius: 0rem` mandatory.
- **Accent Top:** `card-accent-top` pattern for all containers.
- **Contrast:** High contrast Ivory/Indigo/Cyan palette.

### 3.4 Data Flow
- **Integrated Pages:** Use `useQuery` hooks from `src/hooks/` which consume services in `src/services/api/`.
- **Legacy Sections:** Still import from `src/data/mockData.ts` (Scheduled for migration).

---

## 4. Backend Architecture

A modular **Django 6.0.2** application utilizing DRF for a standardized REST API.

### 4.1 Middleware & Security
- **JWT:** simplejwt for secure token-based authentication.
- **Audit Logging:** `APILoggingMiddleware` records every API request with user metadata, IP, and duration.
- **Throttling:** Scoped rate limiting for anonymous, authenticated, and enrollment endpoints.
- **Response Envelopes:** All responses wrapped in a `SuccessResponse` or error envelope via `ResponseFormatterMixin`.

### 4.2 Application Modules
1. **`users`:** Custom User model, registration, and profile management.
2. **`courses`:** Core domain models (Course, Category, Cohort, Enrollment).
3. **`api`:** The DRF implementation layer (Views, Serializers, Custom Exceptions).

### 4.3 Key Features
- **N+1 Optimization:** 82% query reduction via `select_related` and `prefetch_related`.
- **Field-Level Permissions:** Serializers conditionally hide sensitive fields (e.g., `enrolled_count`) from anonymous users.
- **Caching:** Redis-backed caching for high-traffic endpoints (Courses, Categories).

---

## 5. Key Interactions & Workflows

### 5.1 Enrollment & Payment Flow
1. **Client:** `POST /api/v1/enrollments/` (Authenticated).
2. **Server:** Validates capacity, creates a `pending` Enrollment.
3. **Client:** `POST /api/v1/payments/create-intent/` with `enrollment_id`.
4. **Server:** Returns Stripe `client_secret`.
5. **Client:** Confirms payment via Stripe Elements.
6. **Server (Webhook):** Receives `payment_intent.succeeded`, updates Enrollment to `confirmed`.

---

## 6. Project Status & Roadmap

### 6.1 Completed Milestones
- [x] Backend API Fully Operational (239 tests).
- [x] JWT Authentication & Token Blacklisting.
- [x] Standardized API Response Format.
- [x] Frontend Payment Foundation (Stripe integration).
- [x] Course & Category API Integration in Frontend.

### 6.2 Pending / Missing Features
- [ ] **Soft Delete (Step 14):** Documented but currently missing from implementation.
- [ ] **Unified Landing Data:** Migration of `Hero` and `Features` to API data.
- [ ] **Deployment:** Finalization of production Docker configurations.

---

## 7. Developer Handbook

### Running Tests
- **Backend:** `cd backend && DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test`
- **Frontend:** `cd frontend && npm run test`

### Adding a New View
1. Inherit from `ResponseFormatterMixin` in `api/views/all_views.py`.
2. Apply `@extend_schema` for OpenAPI documentation.
3. Update `api/urls.py`.
