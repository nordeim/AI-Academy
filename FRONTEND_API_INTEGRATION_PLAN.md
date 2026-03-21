# Frontend API Integration Remediation Plan

**Version:** 1.1.0
**Date:** March 21, 2026
**Status:** Phase 7 Backend Complete - Ready for Frontend Payment Integration

---

## Executive Summary

The frontend currently uses hardcoded mock data (`/frontend/src/data/mockData.ts`) and has **no API integration layer**. This plan provides a systematic approach to migrate from mock data to real backend API calls while maintaining application functionality and following Test-Driven Development (TDD).

**Critical Issue:** Frontend is completely decoupled from backend - no API calls are being made.

**Phase 7 Update (March 21, 2026):** Backend payment infrastructure is now complete with 239 tests passing. Payment endpoints ready for frontend integration.

---

## Backend Status (Phase 7 Complete)

### Payment Endpoints Ready
| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/payments/create-intent/` | POST | Create Stripe PaymentIntent | ✅ Ready |
| `/api/v1/payments/{id}/status/` | GET | Check payment status | ✅ Ready |
| `/api/v1/webhooks/stripe/` | POST | Stripe webhook handler | ✅ Ready |

### Test Coverage
- **Total Backend Tests:** 239 (all passing)
- **Payment Tests:** 12 new tests covering all payment scenarios
- **Root Cause Fix:** Stale import in `api/exceptions.py` resolved

---

## Phase 1: Foundation & Infrastructure

### 1.1 Install Dependencies
**Priority:** P0 - Critical  
**Estimated Effort:** 30 minutes  
**TDD:** No (infrastructure setup)

```bash
cd /home/project/AI-Academy/frontend
npm install axios
npm install @tanstack/react-query  # For server state management
npm install zustand  # For client state (already installed)
```

**Rationale:**
- `axios`: HTTP client with interceptors for auth tokens
- `@tanstack/react-query`: Caching, background updates, error handling
- Existing `zustand`: Continue using for UI/client state

**Validation:**
- [ ] Dependencies added to package.json
- [ ] No version conflicts
- [ ] Build succeeds

---

### 1.2 Create API Service Layer
**Priority:** P0 - Critical  
**Estimated Effort:** 2 hours  
**TDD:** Yes - Write tests first

**Files to Create:**

1. `/frontend/src/services/api/client.ts` - Axios instance with interceptors
2. `/frontend/src/services/api/courses.ts` - Course API methods
3. `/frontend/src/services/api/categories.ts` - Category API methods
4. `/frontend/src/services/api/cohorts.ts` - Cohort API methods
5. `/frontend/src/services/api/auth.ts` - Authentication API methods
6. `/frontend/src/services/api/enrollments.ts` - Enrollment API methods
7. `/frontend/src/types/api.ts` - TypeScript interfaces matching backend

**Implementation Details:**

```typescript
// /frontend/src/services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**TDD Tests:**
- `/frontend/src/services/api/__tests__/client.test.ts`
  - [ ] Test: Creates axios instance with correct base URL
  - [ ] Test: Adds Authorization header when token exists
  - [ ] Test: Refreshes token on 401 response
  - [ ] Test: Redirects to login when refresh fails

**Validation:**
- [ ] All tests pass
- [ ] Interceptors handle auth correctly
- [ ] Error responses properly formatted

---

### 1.3 Create TypeScript Types
**Priority:** P0 - Critical  
**Estimated Effort:** 1 hour  
**TDD:** Yes - Type compatibility tests

**Files to Create:**
- `/frontend/src/types/api.ts` - Match backend response structures
- `/frontend/src/types/course.ts` - Course entity types
- `/frontend/src/types/cohort.ts` - Cohort entity types
- `/frontend/src/types/category.ts` - Category entity types
- `/frontend/src/types/auth.ts` - Auth-related types
- `/frontend/src/types/enrollment.ts` - Enrollment types

**Key Type Definitions:**

```typescript
// /frontend/src/types/api.ts

// Backend standardized response envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: Record<string, string[]>;
  meta: {
    timestamp: string;
    request_id: string;
    pagination?: {
      count: number;
      page: number;
      pages: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

// Backend Course structure
export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string | null;
  thumbnail_alt: string;
  categories: Category[];
  level: 'beginner' | 'intermediate' | 'advanced';
  modules_count: number;
  duration_weeks: number;
  duration_hours?: number;  // Only for authenticated users
  price: string;  // Backend returns as string
  original_price: string | null;
  discount_percentage: number;
  currency: string;
  rating: string;  // Backend returns as string
  review_count: number;
  enrolled_count?: number;  // Only for authenticated users
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  created_at?: string;  // Only for authenticated users
  updated_at?: string;  // Only for authenticated users
}

// Backend Category structure
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  course_count: number;
}

// Backend Cohort structure
export interface Cohort {
  id: string;
  course_title: string;
  course_slug: string;
  start_date: string;
  end_date: string;
  timezone: string;
  format: 'online' | 'in_person' | 'hybrid';
  location: string;
  instructor_name: string;
  spots_total: number;
  spots_remaining: number;
  availability_status: 'available' | 'filling-fast' | 'waitlist';
  early_bird_price: string | null;
  early_bird_deadline: string | null;
  status: 'upcoming' | 'enrolling' | 'in_progress' | 'completed' | 'cancelled';
}

// Backend Enrollment structure
export interface Enrollment {
  id: string;
  course_title: string;
  cohort_info: Cohort;
  amount_paid: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  created_at: string;
  confirmed_at: string | null;
}

// Auth types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
  avatar_url: string | null;
  company: string;
  title: string;
  linkedin_url: string;
  github_url: string;
  is_student: boolean;
  is_instructor: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}
```

**TDD Tests:**
- `/frontend/src/types/__tests__/api.types.test.ts`
  - [ ] Test: Course type matches backend structure
  - [ ] Test: ApiResponse envelope structure correct
  - [ ] Test: Optional fields only present when authenticated

**Validation:**
- [ ] Types compile without errors
- [ ] Interfaces match backend API documentation
- [ ] Optional fields correctly marked

---

## Phase 2: Authentication Layer

### 2.1 Create Auth Store (Zustand)
**Priority:** P1 - High  
**Estimated Effort:** 2 hours  
**TDD:** Yes

**Files to Create:**
- `/frontend/src/store/authStore.ts`
- `/frontend/src/store/__tests__/authStore.test.ts`

**Implementation:**

```typescript
// /frontend/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types/auth';
import * as authApi from '@/services/api/auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authApi.login({ email, password });
          set({ tokens, isAuthenticated: true });
          
          // Store tokens
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          
          // Fetch user profile
          await get().fetchProfile();
        } catch (error) {
          set({ error: error.message, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(credentials);
          // Auto-login after registration
          await get().login(credentials.email, credentials.password);
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, tokens: null, isAuthenticated: false });
      },
      
      fetchProfile: async () => {
        try {
          const user = await authApi.getProfile();
          set({ user });
        } catch (error) {
          set({ error: error.message });
        }
      },
      
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.updateProfile(data);
          set({ user });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

**TDD Tests:**
- [ ] Test: Store initializes with unauthenticated state
- [ ] Test: Login action stores tokens and fetches profile
- [ ] Test: Login failure sets error state
- [ ] Test: Logout clears all auth data
- [ ] Test: Token persistence works across page reloads

**Validation:**
- [ ] Store persists tokens to localStorage
- [ ] Actions handle loading states correctly
- [ ] Errors are properly captured and displayed

---

## Phase 3: Data Fetching Layer

### 3.1 Implement React Query Hooks
**Priority:** P1 - High  
**Estimated Effort:** 3 hours  
**TDD:** Yes

**Files to Create:**
- `/frontend/src/hooks/useCourses.ts`
- `/frontend/src/hooks/useCategories.ts`
- `/frontend/src/hooks/useCohorts.ts`
- `/frontend/src/hooks/useEnrollments.ts`
- `/frontend/src/hooks/useCourseDetail.ts`

**Implementation:**

```typescript
// /frontend/src/hooks/useCourses.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCourses, fetchCourseDetail } from '@/services/api/courses';
import { Course } from '@/types/course';

const COURSES_KEY = 'courses';

export function useCourses(filters?: {
  level?: string;
  categories__slug?: string;
  search?: string;
  ordering?: string;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: [COURSES_KEY, filters],
    queryFn: () => fetchCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
  });
}

export function useCourseDetail(slug: string) {
  return useQuery({
    queryKey: [COURSES_KEY, slug],
    queryFn: () => fetchCourseDetail(slug),
    staleTime: 60 * 60 * 1000, // 1 hour (matches backend cache)
    enabled: !!slug,
  });
}

export function usePrefetchCourse() {
  const queryClient = useQueryClient();
  
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: [COURSES_KEY, slug],
      queryFn: () => fetchCourseDetail(slug),
    });
  };
}
```

**TDD Tests:**
- `/frontend/src/hooks/__tests__/useCourses.test.ts`
  - [ ] Test: Fetches courses on mount
  - [ ] Test: Applies filters correctly
  - [ ] Test: Caches data for 5 minutes
  - [ ] Test: Refetches when filters change
  - [ ] Test: Returns loading state initially
  - [ ] Test: Returns error state on failure

**Validation:**
- [ ] Hooks fetch data from API, not mock data
- [ ] Caching behavior matches backend TTL
- [ ] Loading and error states handled

---

### 3.2 Create Data Mapping Layer
**Priority:** P2 - Medium  
**Estimated Effort:** 2 hours  
**TDD:** Yes

**Problem:** Backend and frontend data structures differ. Need mapping layer.

**Files to Create:**
- `/frontend/src/mappers/course.mapper.ts`
- `/frontend/src/mappers/cohort.mapper.ts`
- `/frontend/src/mappers/category.mapper.ts`

**Implementation:**

```typescript
// /frontend/src/mappers/course.mapper.ts
import { Course as BackendCourse } from '@/types/api';
import { Course as FrontendCourse } from '@/data/mockData';

export function mapCourseToFrontend(backendCourse: BackendCourse): FrontendCourse {
  return {
    id: backendCourse.id,
    slug: backendCourse.slug,
    title: backendCourse.title,
    subtitle: backendCourse.subtitle,
    description: backendCourse.description,
    thumbnail: backendCourse.thumbnail || '',
    modules: backendCourse.modules_count,
    duration: `${backendCourse.duration_weeks} weeks`,
    level: capitalizeFirst(backendCourse.level) as CourseLevel,
    rating: parseFloat(backendCourse.rating),
    reviewCount: backendCourse.review_count,
    enrolledCount: backendCourse.enrolled_count || 0,
    price: {
      amount: parseFloat(backendCourse.price),
      currency: backendCourse.currency,
      original: backendCourse.original_price 
        ? parseFloat(backendCourse.original_price) 
        : undefined,
    },
    categories: backendCourse.categories.map(c => c.name),
    categoryColor: backendCourse.categories[0]?.color || '#4f46e5',
    skills: [], // Backend doesn't provide this yet
    nextCohort: '', // To be populated from cohorts API
    spotsRemaining: 0, // To be populated from cohorts API
    waitlistAvailable: true,
    badge: backendCourse.is_featured 
      ? { text: 'Featured', variant: 'popular' } 
      : undefined,
  };
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**TDD Tests:**
- [ ] Test: Maps all required fields correctly
- [ ] Test: Handles missing optional fields
- [ ] Test: Transforms data types (string -> number for price)
- [ ] Test: Provides default values for missing data

**Validation:**
- [ ] Mapped data matches frontend component expectations
- [ ] No TypeScript errors
- [ ] Handles edge cases (null values, empty arrays)

---

## Phase 4: Component Updates

### 4.1 Update Course-Related Components
**Priority:** P1 - High  
**Estimated Effort:** 4 hours  
**TDD:** Yes

**Components to Update:**
- `CourseCategories.tsx` - Use `useCategories()` hook
- `FeaturedCourse.tsx` - Use `useCourses({ featured: true })`
- `TrainingSchedule.tsx` - Use `useCohorts()` hook
- `CourseDetail.tsx` (if exists) - Use `useCourseDetail(slug)`

**Example Migration:**

```typescript
// BEFORE: /frontend/src/sections/CourseCategories.tsx
import { categories } from '@/data/mockData';

export function CourseCategories() {
  // Uses hardcoded data
  return (
    <div>
      {categories.map(category => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
}

// AFTER: /frontend/src/sections/CourseCategories.tsx
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

export function CourseCategories() {
  const { data: response, isLoading, error } = useCategories();
  
  if (isLoading) {
    return <CategoriesSkeleton />;
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        Failed to load categories. Please try again.
      </Alert>
    );
  }
  
  const categories = response?.data?.results || [];
  
  return (
    <div>
      {categories.map(category => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
}
```

**TDD Tests:**
- `/frontend/src/sections/__tests__/CourseCategories.test.tsx`
  - [ ] Test: Shows loading skeleton initially
  - [ ] Test: Renders categories after data loads
  - [ ] Test: Shows error message on API failure
  - [ ] Test: Empty state when no categories

**Validation:**
- [ ] Component fetches from API, not mock data
- [ ] Loading states work correctly
- [ ] Error handling implemented
- [ ] Data displays correctly

---

## Phase 5: Error Handling & UX

### 5.1 Global Error Boundary
**Priority:** P2 - Medium  
**Estimated Effort:** 1 hour  
**TDD:** Yes

**Files to Create:**
- `/frontend/src/components/ErrorBoundary.tsx`
- `/frontend/src/components/ErrorFallback.tsx`

**Validation:**
- [ ] Catches React errors
- [ ] Shows user-friendly error message
- [ ] Provides retry option

---

### 5.2 Toast Notifications
**Priority:** P2 - Medium  
**Estimated Effort:** 1 hour  
**TDD:** No (UI enhancement)

**Implementation:**
- Use existing `sonner` component (already in shadcn)
- Show toast on successful operations
- Show error toast on API failures

**Validation:**
- [ ] Success messages shown
- [ ] Error messages shown
- [ ] Auto-dismiss after timeout

---

## Phase 6: Authentication Flows

### 6.1 Login/Register Pages
**Priority:** P1 - High  
**Estimated Effort:** 3 hours  
**TDD:** Yes

**Files to Create:**
- `/frontend/src/pages/Login.tsx`
- `/frontend/src/pages/Register.tsx`
- `/frontend/src/components/ProtectedRoute.tsx`

**Validation:**
- [ ] Form validation matches backend rules
- [ ] JWT tokens stored correctly
- [ ] Protected routes redirect when not authenticated
- [ ] Token refresh works automatically

---

## Phase 7: Testing & Validation

### 7.1 Integration Tests
**Priority:** P1 - High  
**Estimated Effort:** 4 hours  
**TDD:** Yes

**Test Strategy:**
- Mock API responses using MSW (Mock Service Worker)
- Test complete user flows
- Verify data transformation

**Files to Create:**
- `/frontend/src/mocks/handlers.ts`
- `/frontend/src/mocks/server.ts`
- `/frontend/src/__tests__/integration/courses.test.tsx`

**Validation:**
- [ ] All user flows tested
- [ ] API integration tested
- [ ] Error scenarios covered

---

## Phase 8: Performance & Optimization

### 8.1 Optimize Data Fetching
**Priority:** P3 - Low  
**Estimated Effort:** 2 hours  
**TDD:** No

**Optimizations:**
- [ ] Implement React Query caching
- [ ] Prefetch data on hover
- [ ] Implement optimistic updates for mutations
- [ ] Add request deduplication

---

## Testing Strategy

### Unit Tests
- **Location:** `__tests__` directories alongside source files
- **Coverage Target:** 80%
- **Key Areas:**
  - API service methods
  - Store actions
  - Data mappers
  - Component logic

### Integration Tests
- **Location:** `/frontend/src/__tests__/integration/`
- **Approach:** Test complete user flows
- **Tools:** React Testing Library + MSW

### E2E Tests (Future)
- **Framework:** Playwright or Cypress
- **Scenarios:**
  - User registration flow
  - Course enrollment flow
  - Search and filter

---

## Migration Checklist

### Pre-Migration
- [ ] Backend API is running and accessible
- [ ] CORS configured for frontend origin
- [ ] JWT authentication tested
- [ ] All endpoints documented in API_Usage_Guide.md

### During Migration
- [ ] Phase 1: Foundation complete
- [ ] Phase 2: Auth layer complete
- [ ] Phase 3: Data fetching complete
- [ ] Phase 4: Components updated
- [ ] Phase 5: Error handling complete
- [ ] Phase 6: Auth flows complete

### Post-Migration
- [ ] All tests pass
- [ ] No mock data imports remain
- [ ] Error handling verified
- [ ] Performance tested
- [ ] Accessibility checked
- [ ] Documentation updated

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| API contract mismatch | Medium | High | Thorough testing, TypeScript types |
| CORS issues | Low | High | Verify backend CORS config |
| JWT token expiration | Medium | Medium | Implement refresh token flow |
| Performance degradation | Medium | Medium | React Query caching, lazy loading |
| Breaking changes in components | Medium | High | Incremental migration, feature flags |

---

## Success Criteria

1. **Functionality:** All features work with real API data
2. **Performance:** Page load times < 3 seconds
3. **Reliability:** 99% uptime, proper error handling
4. **User Experience:** No loading jank, smooth transitions
5. **Code Quality:** 80% test coverage, no TypeScript errors
6. **Security:** JWT tokens handled securely, XSS protection

---

## Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Foundation | 3 hours | 3 hours |
| Phase 2: Authentication | 2 hours | 5 hours |
| Phase 3: Data Fetching | 5 hours | 10 hours |
| Phase 4: Components | 4 hours | 14 hours |
| Phase 5: Error Handling | 2 hours | 16 hours |
| Phase 6: Auth Flows | 3 hours | 19 hours |
| Phase 7: Testing | 4 hours | 23 hours |
| Phase 8: Optimization | 2 hours | 25 hours |
| **Total** | **25 hours** | **~3 days** |

---

## Next Steps

1. **Review Plan** - Get approval from stakeholders
2. **Setup Environment** - Ensure backend is running
3. **Begin Phase 1** - Start with infrastructure
4. **Daily Standups** - Track progress, address blockers
5. **Validation Gates** - Review at end of each phase

---

**Plan Status:** Draft  
**Last Updated:** March 21, 2026  
**Next Review:** After stakeholder approval
