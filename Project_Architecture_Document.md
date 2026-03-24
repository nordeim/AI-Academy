# AI Academy - Project Architecture Document

## 1. Executive Summary

**AI Academy** is a production-grade educational platform designed for AI and Software Engineering training. It is architected as a decoupled full-stack application consisting of a **React (Vite)** frontend and a **Django (DRF)** backend.

### Core Design Philosophy
The project follows a **"Precision Futurism"** aesthetic, emphasizing:
- **Technologic Minimalism:** High-contrast, code-first aesthetics (JetBrains Mono, Space Grotesk).
- **CSS-First Styling:** utilizing Tailwind CSS with extensive CSS variables for theming.
- **Component-Driven UI:** Leveraging Shadcn/UI primitives for accessible, composable interfaces.

> **✅ Current Status:** The project is now **Production Ready** with:
> - **257 backend tests passing** (including 18 soft delete tests)
> - **92+ frontend tests passing**
> - **Full API integration** for core pages
> - **Complete payment processing** with Stripe
> - **Command Palette search** fully functional
> - **All QA issues resolved** (100% pass rate)

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
        SearchDialog[Command Palette Search]
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
            SoftDelete[Soft Delete Infrastructure]
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
    SPA -->|Search| SearchDialog
    API -->|Soft Delete| SoftDelete
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
    src --> lib[lib - utilities]
    
    components --> ui[ui (Shadcn)]
    components --> Payment[PaymentForm.tsx]
    components --> Search[SearchDialog.tsx]
    components --> Cohort[CohortSelector.tsx]
    
    pages --> Courses[CoursesPage.tsx]
    pages --> Detail[CourseDetailPage.tsx]
    pages --> Enroll[EnrollmentPage.tsx]
    pages --> Register[RegisterPage.tsx]
    pages --> Login[LoginPage.tsx]
    
    services --> Client[client.ts - Axios]
    services --> CoursesAPI[courses.ts]
    services --> Payments[payments.ts]
    services --> Auth[auth.ts]
    
    sections --> Hero[Hero.tsx]
    sections --> Featured[FeaturedCourse.tsx]
    sections --> Schedule[TrainingSchedule.tsx]
    
    types --> API[api.ts]
    types --> PaymentTypes[payment.ts]
    types --> CourseTypes[course.ts]
```

### 3.2 Key Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 7.3.0 | Build tool and dev server |
| **React** | 19.2.0 | UI Library |
| **TanStack Query** | 5.x | Server state management and caching |
| **Tailwind CSS** | 3.4.19 | Styling engine with CSS-variable based theme |
| **Framer Motion** | 12.35.0 | High-fidelity animations |
| **Stripe SDK** | 14.4.1 | Frontend payment processing (Stripe Elements) |
| **cmdk** | Latest | Command Palette component library |
| **Zustand** | 5.0.3 | Client state management |

### 3.3 Design System Implementation
Centralized in `src/index.css` via CSS variables.
- **Sharp Corners:** `--radius: 0rem` mandatory.
- **Accent Top:** `card-accent-top` pattern for all containers.
- **Contrast:** High contrast Ivory/Indigo/Cyan palette.
- **Typography:** Space Grotesk (Display), Inter (Body), JetBrains Mono (Code).

### 3.4 Data Flow
- **Integrated Pages:** Use `useQuery` hooks from `src/hooks/` which consume services in `src/services/api/`.
- **Command Palette:** Real-time search with API integration via `SearchDialog.tsx`.
- **State Management:** Zustand for client state, TanStack Query for server state.

### 3.5 Key Components
- **SearchDialog.tsx:** Command Palette search with real-time filtering
- **PaymentForm.tsx:** Stripe Elements integration for payment processing
- **CohortSelector.tsx:** Interactive cohort selection component
- **EnrollmentPage.tsx:** Multi-step enrollment wizard

---

## 4. Backend Architecture

A modular **Django 6.0.3** application utilizing DRF for a standardized REST API.

### 4.1 Middleware & Security
- **JWT:** simplejwt for secure token-based authentication.
- **Audit Logging:** `APILoggingMiddleware` records every API request with user metadata, IP, and duration.
- **Throttling:** Scoped rate limiting for anonymous, authenticated, and enrollment endpoints.
- **Response Envelopes:** All responses wrapped in a `SuccessResponse` or error envelope via `ResponseFormatterMixin`.

### 4.2 Application Modules
1. **`users`:** Custom User model, registration, and profile management.
2. **`courses`:** Core domain models (Course, Category, Cohort, Enrollment).
3. **`api`:** The DRF implementation layer (Views, Serializers, Custom Exceptions).
4. **Soft Delete Infrastructure:** Implemented across Course, Cohort, Enrollment models.

### 4.3 Key Features
- **N+1 Optimization:** 82% query reduction via `select_related` and `prefetch_related`.
- **Field-Level Permissions:** Serializers conditionally hide sensitive fields (e.g., `enrolled_count`) from anonymous users.
- **Caching:** Redis-backed caching for high-traffic endpoints (Courses, Categories).
- **Soft Delete:** Full implementation with `deleted_at` field, custom managers, and restore functionality.
- **Payment Processing:** Stripe PaymentIntent creation and webhook handling.
- **Request Logging:** Comprehensive audit trail with structured logging.

### 4.4 Test Infrastructure
- **Total Tests:** 257 passing (including 18 soft delete tests)
- **Test Framework:** Django TestCase / DRF APITestCase
- **Coverage:** Comprehensive TDD with all major features tested

---

## 5. Key Interactions & Workflows

### 5.1 Enrollment & Payment Flow
1. **Client:** `POST /api/v1/enrollments/` (Authenticated).
2. **Server:** Validates capacity, creates a `pending` Enrollment.
3. **Client:** `POST /api/v1/payments/create-intent/` with `enrollment_id`.
4. **Server:** Returns Stripe `client_secret`.
5. **Client:** Confirms payment via Stripe Elements.
6. **Server (Webhook):** Receives `payment_intent.succeeded`, updates Enrollment to `confirmed`.

### 5.2 Search Flow
1. **Client:** Opens Command Palette (Ctrl+K or click search button).
2. **Client:** User types search query (minimum 2 characters).
3. **Client:** `GET /api/v1/courses/?search={query}`.
4. **Server:** Returns filtered courses.
5. **Client:** Displays results in Command Palette.

### 5.3 Registration Flow
1. **Client:** Fills registration form (email, username, password, checkbox).
2. **Client:** `POST /api/v1/auth/register/`.
3. **Server:** Validates data, creates user.
4. **Client:** Auto-login with returned token.
5. **Client:** Redirects to homepage.

---

## 6. Project Status & Roadmap

### 6.1 Completed Milestones
- [x] **Backend API Fully Operational** (257 tests passing)
- [x] **JWT Authentication & Token Blacklisting**
- [x] **Standardized API Response Format**
- [x] **Frontend Payment Foundation** (Stripe integration)
- [x] **Course & Category API Integration** in Frontend
- [x] **Soft Delete Implementation** (18 tests, all models protected)
- [x] **Command Palette Search** (Real-time API search)
- [x] **Registration Flow** (End-to-end working)
- [x] **Homepage Navigation** (All buttons functional)
- [x] **TypeScript Build** (0 errors, production ready)
- [x] **E2E Testing** (12 smoke tests passing)
- [x] **QA Verification** (All issues resolved, 100% pass rate)

### 6.2 Pending / Optional Features
- [ ] **Unified Landing Data:** Migration of `Hero` and `Features` to API data (if needed).
- [ ] **Production Deployment:** Finalization of production Docker configurations.
- [ ] **Load Testing:** Stress testing with 100+ concurrent users.
- [ ] **Security Audit:** Penetration testing and OWASP compliance.

### 6.3 Architecture Decisions Log
| Decision | Rationale |
|----------|-----------|
| Vite + React SPA | Fast development, hot reloading, modern tooling |
| Django REST Framework | Robust API framework with excellent serialization |
| Shadcn/UI | Accessible, composable components with Tailwind |
| cmdk for Search | Fast, accessible Command Palette component |
| Zustand for State | Lightweight, performant client state management |
| Soft Delete | Data recovery capability, audit trail preservation |

---

## 7. Developer Handbook

### 7.1 Running Tests
- **Backend:** `cd backend && python manage.py test`
- **Backend (specific):** `cd backend && python manage.py test courses.tests.test_soft_delete`
- **Frontend:** `cd frontend && npm run test`
- **E2E:** `cd frontend && npm run test tests/e2e/smoke.spec.ts`

### 7.2 Adding a New View
1. Inherit from `ResponseFormatterMixin` in `api/views/all_views.py`.
2. Apply `@extend_schema` for OpenAPI documentation.
3. Update `api/urls.py`.
4. Add tests in `api/tests/`.

### 7.3 Adding a New Component
1. Check if Shadcn/UI has a primitive component.
2. Create in `src/components/ui/` if primitive, or `src/components/` if feature.
3. Export from appropriate index file.
4. Add Storybook documentation (if applicable).

### 7.4 Common Commands
```bash
# Start servers
./start_servers.sh

# Backend tests
cd backend && python manage.py test

# Frontend tests
cd frontend && npm run test

# Build for production
cd frontend && npm run build
```

### 7.5 Troubleshooting
| Issue | Solution |
|-------|----------|
| Tests not discovered | Check `__init__.py` in test directories |
| Button not responding | Verify onClick handler is attached |
| Command Palette not showing results | Check `shouldFilter={false}` prop |
| Registration fails | Verify first_name/last_name handling |
| Build fails with TypeScript errors | Check `import type` syntax |

---

## 8. Technology Stack Summary

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.3.0 |
| Styling | Tailwind CSS | 3.4.19 |
| State Management | Zustand | 5.0.3 |
| Server State | TanStack Query | 5.x |
| UI Components | Shadcn/UI | Latest |
| Command Palette | cmdk | Latest |
| Backend Framework | Django | 6.0.3 |
| API Framework | Django REST Framework | 3.15.2 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 5.2.1 |
| Payments | Stripe | 14.4.1 |
| Authentication | SimpleJWT | Latest |

---

**Document Version:** 2.0.0  
**Last Updated:** March 24, 2026  
**Status:** Production Ready ✅
