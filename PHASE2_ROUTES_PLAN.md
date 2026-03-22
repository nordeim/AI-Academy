# Phase 2 Sub-Plan: Frontend Enrollment Routes (TDD)

## Phase 2 Overview
**Objective:** Add enrollment routes to App.tsx for the payment flow
**Scope:** Frontend only - React Router configuration
**Expected Duration:** 45 minutes
**Expected Outcome:** Enrollment routes accessible with authentication protection

## Validation Checklist (Pre-Execution)
- [x] EnrollmentPage component exists (287 lines)
- [x] EnrollmentConfirmationPage component exists (156 lines)
- [x] ProtectedRoute component exists and working
- [x] Components already imported in App.tsx (lines 17-18)
- [ ] Routes missing from Routes component

## Current State Analysis
**File:** frontend/src/App.tsx

**Lines 17-18:** Components imported but NOT used in Routes
```tsx
import { EnrollmentPage } from '@/pages/EnrollmentPage';
import { EnrollmentConfirmationPage } from '@/pages/EnrollmentConfirmationPage';
```

**Lines 41-55:** Routes defined but NO enrollment routes
```tsx
<Route path="/" element={<HomePage />} />
<Route path="/courses" element={<CoursesPage />} />
<Route path="/courses/:slug" element={<CourseDetailPage />} />
{/* MISSING: /courses/:slug/enroll */}
{/* MISSING: /enrollment/confirmation */}
```

## Execution Steps (TDD Cycle)

### Step 2.1: RED Phase - Write Failing Tests
**Duration:** 15 minutes
**Deliverables:**
- Test file: `frontend/src/App.test.tsx` (if exists) OR
- Create integration test: `frontend/src/__tests__/integration/routes.test.tsx`

**Test Cases:**
1. `/courses/:slug/enroll` route exists
2. `/courses/:slug/enroll` renders EnrollmentPage
3. `/courses/:slug/enroll` requires authentication (redirects to login if not authenticated)
4. `/enrollment/confirmation` route exists
5. `/enrollment/confirmation` renders EnrollmentConfirmationPage
6. `/enrollment/confirmation` requires authentication

**RED Phase Verification:**
- Run tests: `npm run test -- routes.test.tsx`
- Expected: All tests FAIL (routes don't exist)

### Step 2.2: GREEN Phase - Implement Routes
**Duration:** 20 minutes
**Files:** frontend/src/App.tsx

**Changes Required:**
Add routes inside `<Routes>` component (after line 44, before line 55):

```tsx
{/* Enrollment routes - Protected */}
<Route
  path="/courses/:slug/enroll"
  element={
    <ProtectedRoute>
      <EnrollmentPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/enrollment/confirmation"
  element={
    <ProtectedRoute>
      <EnrollmentConfirmationPage />
    </ProtectedRoute>
  }
/>
```

**GREEN Phase Verification:**
- Run tests again
- Expected: All tests PASS

### Step 2.3: REFACTOR Phase - Optimize
**Duration:** 10 minutes
**Considerations:**
- Check if route order matters (it does - more specific before generic)
- Ensure /courses/:slug/enroll comes BEFORE /courses/:slug
- Verify ProtectedRoute is properly configured
- Check for any console errors

**REFACTOR Verification:**
- Run all frontend tests
- Verify no regressions
- Manual browser test (optional)

## Test Implementation Details

### Test 1: Route Existence
```tsx
it('should have enrollment route at /courses/:slug/enroll', () => {
  render(<App />, { wrapper: MemoryRouter });
  // Navigate to enrollment
  window.history.pushState({}, '', '/courses/ai-engineering/enroll');
  // Verify enrollment page content appears
  expect(screen.getByText(/Select Your Cohort/i)).toBeInTheDocument();
});
```

### Test 2: Protected Route
```tsx
it('should redirect unauthenticated users to login', () => {
  // Mock unauthenticated state
  vi.mock('@/store/authStore', () => ({
    useAuthStore: () => ({ token: null, isAuthenticated: false }),
  }));
  
  render(<App />, { wrapper: MemoryRouter });
  window.history.pushState({}, '', '/courses/test/enroll');
  
  // Should redirect to login
  expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
});
```

### Test 3: Confirmation Route
```tsx
it('should have confirmation route at /enrollment/confirmation', () => {
  render(<App />, { wrapper: MemoryRouter });
  window.history.pushState({}, '', '/enrollment/confirmation');
  expect(screen.getByText(/Enrollment Confirmed/i)).toBeInTheDocument();
});
```

## Validation Points

### Pre-Execution Validation
- [x] Components exist at specified paths
- [x] ProtectedRoute component is working
- [x] No existing route conflicts

### Post-Execution Validation
- [ ] 6 new tests passing
- [ ] No existing tests broken
- [ ] Routes accessible in browser
- [ ] Authentication protection working

## Success Criteria

1. **Route Existence:**
   - `/courses/:slug/enroll` → EnrollmentPage ✅
   - `/enrollment/confirmation` → EnrollmentConfirmationPage ✅

2. **Authentication:**
   - Unauthenticated users redirected to login ✅
   - Authenticated users see enrollment pages ✅

3. **No Regressions:**
   - All existing routes still work ✅
   - All existing tests pass ✅

## Time Estimate
- **Total:** 45 minutes
- **RED (tests):** 15 minutes
- **GREEN (implementation):** 20 minutes
- **REFACTOR:** 10 minutes

## Evidence Collection
- Screenshot of failing tests (RED phase)
- Screenshot of passing tests (GREEN phase)
- Code diff of App.tsx changes
- Browser screenshot of working routes

---

## Pre-Execution Validation Required
Before proceeding, I must:
1. ✅ Verify EnrollmentPage exists at src/pages/EnrollmentPage.tsx
2. ✅ Verify EnrollmentConfirmationPage exists at src/pages/EnrollmentConfirmationPage.tsx
3. ✅ Verify ProtectedRoute exists and is functional
4. ⏳ Check for existing route tests
5. ⏳ Verify MemoryRouter in test setup

**Ready for Phase 2?** Review this plan, then confirm to proceed.
