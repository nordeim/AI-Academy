# Phase B: Frontend Implementation Plan
## Enrollment Flow UI with Stripe Integration

**Version:** 1.0.0  
**Date:** March 21, 2026  
**Status:** PLANNING  
**Estimated Duration:** 6-8 hours  
**Methodology:** Test-Driven Development (TDD) - RED → GREEN → REFACTOR  

---

## Executive Summary

Phase B implements the frontend enrollment and payment flow for AI Academy, completing the Phase 7 integration. This phase builds upon the backend payment infrastructure (Phase A) to create a seamless checkout experience using Stripe Elements.

### Current State
- ✅ Backend: 239 tests passing, Payment API operational
- ✅ API Client: JWT authentication and token refresh implemented
- ⏳ Frontend: No Stripe integration, no enrollment flow UI

### Target State
- ✅ Stripe Elements integration for secure card input
- ✅ Cohort selection with availability display
- ✅ Multi-step enrollment flow (1. Select Cohort → 2. Payment → 3. Confirmation)
- ✅ 25 comprehensive TDD tests

---

## Architecture Overview

### Enrollment Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Enrollment Flow                              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CourseDetailPage                                                │
│       │                                                          │
│       │ Click "Enroll Now"                                       │
│       ▼                                                          │
│  ┌──────────────────────┐                                        │
│  │ EnrollmentPage       │                                        │
│  │ Step 1: Select Cohort│                                        │
│  │                      │                                        │
│  │ [CohortSelector]     │                                        │
│  │ - March 2025 (5 left)│                                        │
│  │ - April 2025 (8 left)│                                        │
│  │                      │                                        │
│  │ [Continue →]         │                                        │
│  └──────────────────────┘                                        │
│       │                                                          │
│       │ Valid cohort selected                                    │
│       ▼                                                          │
│  ┌──────────────────────┐                                        │
│  │ Step 2: Payment      │                                        │
│  │                      │                                        │
│  │ [PaymentForm]        │                                        │
│  │ - Stripe CardElement │                                        │
│  │ - Card validation    │                                        │
│  │ - Order summary      │                                        │
│  │                      │                                        │
│  │ [Pay $2,499.00 →]    │                                        │
│  └──────────────────────┘                                        │
│       │                                                          │
│       │ Payment successful                                       │
│       ▼                                                          │
│  ┌──────────────────────┐                                        │
│  │ EnrollmentConfirmationPage                                   │
│  │ Step 3: Success      │                                        │
│  │                      │                                        │
│  │ ✅ Enrollment Confirmed!                                     │
│  │ Course: AI Engineering                                     │
│  │ Cohort: March 2025                                         │
│  │ Amount: $2,499.00                                          │
│  │                      │                                        │
│  │ [Access Dashboard →] │                                        │
│  └──────────────────────┘                                        │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
src/
├── types/
│   └── payment.ts          # NEW: Stripe and Payment types
├── services/api/
│   └── payments.ts         # NEW: Payment API service
├── hooks/
│   └── usePayment.ts       # NEW: Payment hooks
├── components/
│   ├── CohortSelector.tsx  # NEW: Cohort selection component
│   ├── PaymentForm.tsx     # NEW: Stripe payment form
│   └── EnrollmentProgress.tsx # NEW: Step indicator
└── pages/
    ├── EnrollmentPage.tsx         # NEW: Main enrollment flow
    └── EnrollmentConfirmationPage.tsx # NEW: Success confirmation
```

---

## Implementation Plan

### Step 1: Install Dependencies (15 minutes)

**TDD Phase:** Infrastructure (no tests needed)

**Dependencies:**
```bash
cd /home/project/AI-Academy/frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Rationale:**
- `@stripe/stripe-js`: Core Stripe JavaScript SDK
- `@stripe/react-stripe-js`: React bindings for Stripe Elements

**Validation:**
- [ ] Dependencies added to package.json
- [ ] No version conflicts
- [ ] Build succeeds (`npm run build`)

---

### Step 2: Type Definitions (30 minutes)

**TDD Phase:** RED - Write type tests

**File:** `/frontend/src/types/payment.ts`

**Types to Define:**

1. **PaymentIntent**
   ```typescript
   interface PaymentIntent {
     id: string;
     client_secret: string;
     status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
     amount: number;
     currency: string;
   }
   ```

2. **PaymentIntentCreateRequest**
   ```typescript
   interface PaymentIntentCreateRequest {
     enrollment_id: string;
   }
   ```

3. **PaymentIntentCreateResponse**
   ```typescript
   interface PaymentIntentCreateResponse {
     client_secret: string;
     payment_intent_id: string;
     status: string;
   }
   ```

4. **PaymentStatus**
   ```typescript
   interface PaymentStatus {
     enrollment_id: string;
     status: string;
     payment_intent_status: string | null;
     amount_received?: number;
   }
   ```

**TDD Tests:**
- `/frontend/src/types/__tests__/payment.test.ts`
- Test: TypeScript compilation
- Test: Type exports
- Test: Interface definitions

---

### Step 3: API Service Layer (45 minutes)

**TDD Phase:** RED - Write service tests

**File:** `/frontend/src/services/api/payments.ts`

**Methods:**

1. **createPaymentIntent**
   ```typescript
   export async function createPaymentIntent(
     enrollmentId: string
   ): Promise<ApiResponse<PaymentIntentCreateResponse>>
   ```

2. **getPaymentStatus**
   ```typescript
   export async function getPaymentStatus(
     enrollmentId: string
   ): Promise<ApiResponse<PaymentStatus>>
   ```

**TDD Tests:**
- `/frontend/src/services/api/__tests__/payments.test.ts`
- Test: createPaymentIntent returns PaymentIntent
- Test: createPaymentIntent handles errors
- Test: getPaymentStatus returns status
- Test: getPaymentStatus handles 404

---

### Step 4: React Query Hooks (1 hour)

**TDD Phase:** RED - Write hook tests

**File:** `/frontend/src/hooks/usePayment.ts`

**Hooks:**

1. **useCreatePaymentIntent**
   ```typescript
   export function useCreatePaymentIntent() {
     // Returns mutation for creating payment intent
   }
   ```

2. **usePaymentStatus**
   ```typescript
   export function usePaymentStatus(enrollmentId: string) {
     // Returns query for checking payment status
   }
   ```

3. **useCheckout**
   ```typescript
   export function useCheckout() {
     // Orchestrates enrollment + payment flow
   }
   ```

**TDD Tests:**
- `/frontend/src/hooks/__tests__/usePayment.test.ts`
- Test: createPaymentIntent mutation succeeds
- Test: createPaymentIntent mutation fails with error
- Test: payment status query fetches data
- Test: checkout flow completes successfully

---

### Step 5: UI Components (3 hours)

**TDD Phase:** RED → GREEN → REFACTOR

#### Component 1: CohortSelector

**File:** `/frontend/src/components/CohortSelector.tsx`

**Props Interface:**
```typescript
interface CohortSelectorProps {
  courseSlug: string;
  value: string | null;
  onChange: (cohortId: string) => void;
  disabled?: boolean;
}
```

**Features:**
- Display available cohorts with spots remaining
- Show cohort details (dates, format, instructor)
- Disabled state for full cohorts
- Loading state
- Validation feedback

**TDD Tests:**
- `/frontend/src/components/__tests__/CohortSelector.test.tsx`
- Test: Renders cohorts with spots
- Test: Handles cohort selection
- Test: Disables full cohorts
- Test: Shows loading state
- Test: Handles errors

#### Component 2: PaymentForm

**File:** `/frontend/src/components/PaymentForm.tsx`

**Props Interface:**
```typescript
interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
}
```

**Features:**
- Stripe CardElement integration
- Card validation feedback
- Submit button with loading state
- Error messaging
- Order summary display

**TDD Tests:**
- `/frontend/src/components/__tests__/PaymentForm.test.tsx`
- Test: Renders Stripe CardElement
- Test: Validates empty card
- Test: Handles payment success
- Test: Handles payment failure
- Test: Shows loading state
- Test: Displays order summary

#### Component 3: EnrollmentProgress

**File:** `/frontend/src/components/EnrollmentProgress.tsx`

**Props Interface:**
```typescript
interface EnrollmentProgressProps {
  currentStep: 1 | 2 | 3;
  steps: { label: string; description: string }[];
}
```

**Features:**
- Visual step indicator
- Step completion status
- Current step highlighting
- Responsive design

**TDD Tests:**
- `/frontend/src/components/__tests__/EnrollmentProgress.test.tsx`
- Test: Renders all steps
- Test: Highlights current step
- Test: Shows completed steps

---

### Step 6: Enrollment Pages (2 hours)

**TDD Phase:** RED → GREEN → REFACTOR

#### Page 1: EnrollmentPage

**File:** `/frontend/src/pages/EnrollmentPage.tsx`

**Features:**
- Protected route (requires authentication)
- Multi-step wizard (Step 1 → Step 2 → Step 3)
- Cohort selection
- Payment form
- Error handling
- Progress tracking

**State Management:**
```typescript
interface EnrollmentState {
  step: 1 | 2 | 3;
  selectedCohort: string | null;
  enrollmentId: string | null;
  clientSecret: string | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';
  error: string | null;
}
```

**TDD Tests:**
- `/frontend/src/pages/__tests__/EnrollmentPage.test.tsx`
- Test: Redirects to login if not authenticated
- Test: Loads course and cohorts on mount
- Test: Validates cohort selection
- Test: Proceeds to payment step
- Test: Handles payment success
- Test: Handles payment failure
- Test: Shows progress indicator
- Test: Navigates between steps

#### Page 2: EnrollmentConfirmationPage

**File:** `/frontend/src/pages/EnrollmentConfirmationPage.tsx`

**Features:**
- Success confirmation display
- Enrollment details summary
- Next steps CTA
- Receipt/invoice link

**TDD Tests:**
- `/frontend/src/pages/__tests__/EnrollmentConfirmationPage.test.tsx`
- Test: Renders success message
- Test: Displays enrollment details
- Test: Shows navigation CTAs

---

### Step 7: Route Integration (15 minutes)

**File:** `/frontend/src/App.tsx`

**Routes to Add:**
```typescript
<Route path="/enroll/:slug" element={<EnrollmentPage />} />
<Route path="/enroll/:slug/confirm" element={<EnrollmentConfirmationPage />} />
```

**TDD Tests:**
- `/frontend/src/__tests__/App.test.tsx`
- Test: Enrollment route accessible
- Test: Confirmation route accessible

---

### Step 8: Stripe Provider Setup (15 minutes)

**File:** `/frontend/src/main.tsx`

**Setup:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Wrap app with Elements provider
```

---

## Test Coverage Requirements

### Test Breakdown (25 total)

| Category | Tests | File |
|----------|-------|------|
| Type Definitions | 3 | `types/__tests__/payment.test.ts` |
| API Service | 4 | `services/api/__tests__/payments.test.ts` |
| Payment Hooks | 4 | `hooks/__tests__/usePayment.test.ts` |
| CohortSelector | 5 | `components/__tests__/CohortSelector.test.tsx` |
| PaymentForm | 6 | `components/__tests__/PaymentForm.test.tsx` |
| EnrollmentProgress | 3 | `components/__tests__/EnrollmentProgress.test.tsx` |
| EnrollmentPage | 6 | `pages/__tests__/EnrollmentPage.test.tsx` |
| ConfirmationPage | 2 | `pages/__tests__/EnrollmentConfirmationPage.test.tsx` |
| App Routes | 2 | `__tests__/App.test.tsx` |
| **Total** | **35** | - |

---

## Environment Variables

**File:** `/frontend/.env.local`

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Security Considerations

### PCI Compliance
- ✅ Never store card numbers on frontend
- ✅ Use Stripe Elements for card input
- ✅ Stripe.js handles sensitive data
- ✅ Webhook verification on backend

### Authentication
- ✅ Enrollment routes protected
- ✅ JWT token passed in API calls
- ✅ Automatic token refresh

### Error Handling
- ✅ User-friendly error messages
- ✅ No sensitive data in logs
- ✅ Graceful degradation

---

## Design Tokens

**Colors:**
- Primary: `#4f46e5` (Electric Indigo)
- Success: `#10b981` (Emerald)
- Error: `#ef4444` (Red)
- Background: `#ffffff` / `#fafaf9`

**Spacing:**
- Section padding: 24px
- Card padding: 16px
- Element gap: 12px

**Typography:**
- Headings: Space Grotesk, 24px
- Body: Inter, 16px

---

## Implementation Schedule

| Step | Task | Duration | TDD Phase |
|------|------|----------|-----------|
| 1 | Install dependencies | 15 min | Infrastructure |
| 2 | Type definitions | 30 min | RED |
| 3 | API service layer | 45 min | RED |
| 4 | React Query hooks | 1 hour | RED |
| 5 | CohortSelector component | 1 hour | RED→GREEN→REFACTOR |
| 6 | PaymentForm component | 1.5 hours | RED→GREEN→REFACTOR |
| 7 | EnrollmentProgress component | 30 min | RED→GREEN→REFACTOR |
| 8 | EnrollmentPage | 1.5 hours | RED→GREEN→REFACTOR |
| 9 | EnrollmentConfirmationPage | 30 min | RED→GREEN→REFACTOR |
| 10 | Route integration | 15 min | RED |
| 11 | Stripe provider setup | 15 min | Infrastructure |
| **Total** | | **6-8 hours** | |

---

## Success Criteria

### Functional Requirements
- [ ] Users can select cohort and proceed to payment
- [ ] Stripe payment form accepts valid cards (test: 4242 4242 4242 4242)
- [ ] Payment success navigates to confirmation page
- [ ] Payment failure shows error with retry option
- [ ] All 25 TDD tests passing

### Performance Requirements
- [ ] Payment form loads in < 2 seconds
- [ ] Stripe Elements initializes in < 1 second
- [ ] Page transitions smooth (60fps)

### Quality Requirements
- [ ] WCAG AAA accessibility compliance
- [ ] Responsive design (mobile-first)
- [ ] All error states handled
- [ ] No security vulnerabilities

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stripe test keys not configured | Medium | Document setup process |
| Component library conflicts | Low | Test with existing Shadcn components |
| Test mocking complexity | Medium | Use MSW for API mocking |
| Route protection issues | Low | Reuse existing ProtectedRoute pattern |

---

**Prepared By:** GEMINI Agent  
**Status:** Ready for Execution  
**Next Action:** Begin Step 1 - Install Stripe dependencies
