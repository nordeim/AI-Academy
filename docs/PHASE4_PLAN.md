# Phase 4: Component Integration Plan

**Date:** March 21, 2026  
**Estimated Duration:** 4 hours  
**Approach:** TDD (Red-Green-Refactor)

---

## Goal
Replace hardcoded mock data in React components with real API calls using the hooks created in Phase 3. All components must handle Loading, Error, and Success states.

---

## Architecture Context

### Current State
- Frontend uses hardcoded mock data from `/frontend/src/data/mockData.ts`
- Phase 3 hooks are ready (useCourses, useCategories, useCohorts)
- No real API integration in components yet

### Target State
- All data comes from backend API via React Query hooks
- Components display loading skeletons during fetch
- Error states handled gracefully with retry options
- Seamless fallback for API failures

---

## Phase 4A: Core Component Migration (Priority: P0)

### Task 4A.1: Analyze Current Sections
**Duration:** 15 minutes  
**Output:** Component inventory document  
**Verification:** List all components using mock data

Target Sections:
- [ ] `Courses.tsx` - Uses `courses` from mockData
- [ ] `CourseCategories.tsx` - Uses `courseCategories` from mockData
- [ ] `FeaturedCourse.tsx` - Uses `featuredCourse` from mockData
- [ ] `UpcomingCohorts.tsx` - Uses `cohorts` from mockData
- [ ] `CourseCard.tsx` - Prop structure analysis

### Task 4A.2: Create Component Tests (RED Phase)
**Duration:** 30 minutes  
**Output:** Test files for all sections  
**TDD:** Write failing tests first  
**Verification:** Tests fail with "not implemented" errors

Tests to create:
- [ ] `sections/__tests__/Courses.test.tsx` - API integration tests
- [ ] `sections/__tests__/CourseCategories.test.tsx` - Category loading tests
- [ ] `sections/__tests__/FeaturedCourse.test.tsx` - Single course fetch tests
- [ ] `sections/__tests__/UpcomingCohorts.test.tsx` - Cohorts list tests

**Test Coverage Requirements:**
- Initial loading state
- Success state with data
- Error state display
- Empty state handling
- Retry button functionality

### Task 4A.3: Update Courses.tsx (GREEN Phase)
**Duration:** 45 minutes  
**Output:** Courses section using useCourses hook  
**Verification:** 
- Component displays courses from API
- Loading skeleton visible during fetch
- Error message shown on failure

Changes:
- [ ] Import `useCourses` from '@/hooks/useCourses'
- [ ] Replace `const courseData = courses` with `const { data, isLoading, error } = useCourses()`
- [ ] Add loading skeleton (reuse existing CourseCard skeleton pattern)
- [ ] Add error boundary with retry button
- [ ] Map `data.data.results` to CourseCard components

### Task 4A.4: Update CourseCategories.tsx (GREEN Phase)
**Duration:** 30 minutes  
**Output:** Categories section using useCategories hook  
**Verification:**
- Categories load from API
- Category pills display correctly
- Click filtering works

Changes:
- [ ] Import `useCategories` from '@/hooks/useCategories'
- [ ] Replace mock categories with API data
- [ ] Add loading shimmer for category pills
- [ ] Handle empty categories gracefully

### Task 4A.5: Update FeaturedCourse.tsx (GREEN Phase)
**Duration:** 30 minutes  
**Output:** Featured course using useCourseDetail hook  
**Verification:**
- Featured course loads by slug
- Data structure matches CourseDetail type
- Image loading optimized

Changes:
- [ ] Import `useCourseDetail` from '@/hooks/useCourses'
- [ ] Hardcode featured course slug initially (or use first from list)
- [ ] Replace mock data with API response
- [ ] Add loading placeholder

### Task 4A.6: Update UpcomingCohorts.tsx (GREEN Phase)
**Duration:** 30 minutes  
**Output:** Cohorts using useUpcomingCohorts hook  
**Verification:**
- Cohorts load with status='enrolling'
- Available spots display correctly
- Registration CTA functional

Changes:
- [ ] Import `useUpcomingCohorts` from '@/hooks/useCohorts'
- [ ] Replace mock cohorts with API data
- [ ] Map cohort data to CohortCard components
- [ ] Handle no upcoming cohorts state

### Task 4A.7: Refactor & Optimize (REFACTOR Phase)
**Duration:** 30 minutes  
**Output:** Clean, DRY component code  
**Verification:**
- No code duplication
- Reusable loading/error components extracted
- Type safety maintained

Refactors:
- [ ] Extract `DataStateHandler` wrapper component
- [ ] Create shared `LoadingSkeleton` for sections
- [ ] Create shared `ErrorState` component with retry
- [ ] Ensure all TypeScript types are correct

---

## Phase 4B: Loading States Implementation (Priority: P1)

### Task 4B.1: Design Loading Skeletons
**Duration:** 20 minutes  
**Output:** Skeleton component specifications  
**Verification:** Skeletons match actual component layouts

Skeletons to create:
- [ ] `CourseCardSkeleton` - Shimmer effect on cards
- [ ] `CategoryPillSkeleton` - Shimmer on category buttons
- [ ] `CohortCardSkeleton` - Shimmer on cohort cards
- [ ] `FeaturedCourseSkeleton` - Hero section placeholder

### Task 4B.2: Implement Skeleton Components (TDD)
**Duration:** 40 minutes  
**Output:** Skeleton components with tests  
**Verification:** All skeletons render correctly, tests pass

Implementation:
- [ ] `components/ui/skeletons/CourseCardSkeleton.tsx`
- [ ] `components/ui/skeletons/CategoryPillSkeleton.tsx`
- [ ] `components/ui/skeletons/CohortCardSkeleton.tsx`
- [ ] `components/ui/skeletons/FeaturedCourseSkeleton.tsx`
- [ ] Tests for each skeleton component

### Task 4B.3: Integrate Loading States
**Duration:** 30 minutes  
**Output:** Components show skeletons while loading  
**Verification:** Loading states visible in browser

Integration:
- [ ] Add `isLoading` checks to all sections
- [ ] Display appropriate skeleton while loading
- [ ] Ensure smooth transitions between states

---

## Phase 4C: Error Handling & Recovery (Priority: P1)

### Task 4C.1: Design Error States
**Duration:** 20 minutes  
**Output:** Error state UI designs  
**Verification:** Designs reviewed and approved

Error states:
- [ ] Network error message
- [ ] API error display
- [ ] Empty state messaging
- [ ] Retry button styling

### Task 4C.2: Implement Error Components (TDD)
**Duration:** 40 minutes  
**Output:** Error components with tests  
**Verification:** Error states display correctly

Components:
- [ ] `components/ui/ErrorState.tsx` - Reusable error display
- [ ] `components/ui/EmptyState.tsx` - No data available
- [ ] Tests for error boundary behavior
- [ ] Tests for retry functionality

### Task 4C.3: Integrate Error Handling
**Duration:** 30 minutes  
**Output:** Components handle errors gracefully  
**Verification:** Error states trigger and recover correctly

Integration:
- [ ] Add `error` checks to all sections
- [ ] Display ErrorState on API errors
- [ ] Connect retry buttons to `refetch()`
- [ ] Test error recovery flow

---

## Phase 4D: Validation & Documentation

### Task 4D.1: TypeScript Validation
**Duration:** 15 minutes  
**Output:** Type-safe codebase  
**Verification:** `npx tsc --noEmit` passes

Checks:
- [ ] All components use correct types from '@/types'
- [ ] No `any` types introduced
- [ ] Prop types verified

### Task 4D.2: Integration Testing
**Duration:** 30 minutes  
**Output:** E2E happy path validation  **Verification:** Manual test of all sections loading data

Tests:
- [ ] Run frontend dev server
- [ ] Verify all sections load real data
- [ ] Test loading states
- [ ] Test error states (disconnect network)
- [ ] Verify retry functionality

### Task 4D.3: Documentation Update
**Duration:** 20 minutes  **Output:** Updated documentation  **Verification:** Documentation reflects current state

Documentation:
- [ ] Update FRONTEND_API_INTEGRATION_PLAN.md with completion status
- [ ] Document any deviations from plan
- [ ] Note any technical debt or future improvements
- [ ] Update status.md with Phase 4 completion

---

## Success Criteria

### Definition of Done
- [ ] All sections use API hooks instead of mock data
- [ ] Loading states display during data fetch
- [ ] Error states display with retry functionality
- [ ] TypeScript compilation passes
- [ ] All TDD tests pass
- [ ] Manual integration testing confirms real data loads
- [ ] Documentation updated

### Quality Metrics
- **Performance:** Initial load < 2 seconds, subsequent loads use cache
- **Reliability:** 100% test coverage for new components
- **UX:** Loading states prevent jarring layout shifts
- **Maintainability:** Reusable error/loading components extracted

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API unavailable | Mock service worker fallback for development |
| CORS issues | Verify backend CORS config allows localhost:5173 |
| Type mismatches | Strict TypeScript checking, validate against backend types |
| Performance degradation | React Query caching handles repeated requests |

---

## Ready to Start

Phase 4 plan complete. Ready to execute with TDD methodology.

**Estimated Total Duration:** 4 hours  
**Actual Start Time:** [To be filled]  
**Expected Completion:** [To be filled]
