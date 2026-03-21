# Phase B Remaining Steps - Implementation Plan

**Date:** March 21, 2026  
**Status:** IN PROGRESS  
**Phase B Progress:** 73% → 100%  
**Methodology:** Test-Driven Development (TDD)

---

## Remaining Tasks

### Step 1: Route Integration (App.tsx)
**Priority:** P0 | **Duration:** 15 minutes

**Routes to Add:**
```typescript
<Route path="/enroll/:slug" element={<EnrollmentPage />} />
<Route path="/enroll/:slug/confirm" element={<EnrollmentConfirmationPage />} />
```

**TDD Tests:**
- Test: Enrollment route accessible at /enroll/:slug
- Test: Confirmation route accessible at /enroll/:slug/confirm
- Test: Routes protected (require auth)

---

### Step 2: Stripe Provider Setup (main.tsx)
**Priority:** P0 | **Duration:** 15 minutes

**Setup Required:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Wrap app with Elements provider
<Elements stripe={stripePromise}>
  <App />
</Elements>
```

**Environment Variables:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

**TDD Tests:**
- Test: Stripe provider initializes
- Test: Elements wraps App component
- Test: Error handling for missing publishable key

---

### Step 3: Test Infrastructure Setup
**Priority:** P0 | **Duration:** 30 minutes

**Setup Files:**
1. `vitest.config.ts` - Vitest configuration
2. `src/test/setup.ts` - Test setup and mocks
3. `src/test/mocks/stripe.ts` - Stripe SDK mocks
4. `package.json` scripts - Add test commands

**Dependencies to Install:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

---

### Step 4: TDD Tests (25+ tests)
**Priority:** P0 | **Duration:** 2-3 hours

#### Test Suite Breakdown

**A. PaymentForm Tests (6 tests)**
1. Render CardElement and order summary
2. Handle card validation errors
3. Process successful payment
4. Handle declined cards
5. Show loading state
6. Format currency correctly

**B. CohortSelector Tests (5 tests)**
1. Render cohorts with spots
2. Handle cohort selection
3. Disable full cohorts
4. Show loading state
5. Handle errors

**C. EnrollmentPage Tests (6 tests)**
1. Redirect to login if not authenticated
2. Load course and cohorts
3. Validate cohort selection
4. Proceed through steps
5. Handle payment success
6. Show progress indicator

**D. EnrollmentConfirmationPage Tests (2 tests)**
1. Render success message
2. Display enrollment details

**E. usePayment Hook Tests (4 tests)**
1. createPaymentIntent mutation
2. payment status query
3. confirmPayment success
4. Error handling

**F. Integration Tests (2+ tests)**
1. Full enrollment flow
2. Error recovery

---

## Implementation Strategy

### Phase 1: Infrastructure (30 min)
1. Install testing dependencies
2. Configure Vitest
3. Setup test utilities and mocks
4. Create environment variables

### Phase 2: Routes & Provider (30 min)
1. Update App.tsx with enrollment routes
2. Update main.tsx with Stripe provider
3. Test route navigation
4. Test Stripe initialization

### Phase 3: Write TDD Tests (2-3 hours)
1. Write tests first (RED phase)
2. Verify tests fail
3. Implement code to make pass (GREEN phase)
4. Refactor if needed (REFACTOR phase)

### Phase 4: Verification (30 min)
1. Run all 25+ tests
2. Verify TypeScript compilation
3. Check build succeeds
4. Update documentation

---

## Success Criteria

### Functional
- [ ] All enrollment routes accessible
- [ ] Stripe provider wraps app
- [ ] 25+ tests passing
- [ ] Test coverage >80%

### Technical
- [ ] TypeScript compilation succeeds
- [ ] Build succeeds
- [ ] No console errors
- [ ] Stripe test mode works

### Documentation
- [ ] README.md updated
- [ ] AGENTS.md updated
- [ ] Test documentation complete

---

**Ready to Execute**
