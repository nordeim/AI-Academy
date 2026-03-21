# Phase 7: Enrollment Flow Implementation Plan

**Version:** 1.0.0  
**Date:** March 21, 2026  
**Status:** PLANNING  
**Estimated Duration:** 6-8 hours  
**Test-Driven Development:** Yes - RED/GREEN/REFACTOR  

---

## Executive Summary

Phase 7 implements the complete enrollment and payment flow, enabling users to:
1. Select a course cohort
2. Complete Stripe-powered checkout
3. Receive payment confirmation
4. View enrollment success

**Key Dependencies:**
- Backend: Stripe SDK configured (stripe==11.3.0), Payment Intents API ready
- Frontend: Phases 1-6 complete (authentication, course browsing, user management)

---

## Architecture Overview

### Enrollment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Enrollment Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Course Detail   │──│ Cohort Selector │──│ Enroll Page │ │
│  └─────────────────┘  └──────────────────┘  └──────────────┘ │
│         │                        │                │         │
│         │ Choose cohort          │                │         │
│         │ (requires auth)        ▼                ▼         │
│         │              ┌──────────────────┐ ┌─────────────┐ │
│         │              │ Check capacity   │ │ Stripe Form │ │
│         └──────────────│ Duplicate check  │ │ (Card Element)│ │
│                        └──────────────────┘ └─────────────┘ │
│                                 │                  │        │
│                                 ▼                  ▼        │
│                       ┌──────────────────┐ ┌─────────────┐ │
│                       │ Create enrollment │ │ Create PI   │ │
│                       │ (status: pending) │ │ (frontend)  │ │
│                       └──────────────────┘ └─────────────┘ │
│                                 │                  │        │
│                                 ▼                  ▼        │
│                       ┌──────────────────┐ ┌─────────────┐ │
│                       │ Confirm payment   │ │ Webhook     │ │
│                       │ Update status     │ │ (backend)   │ │
│                       └──────────────────┘ └─────────────┘ │
│                                 │                  │        │
│                                 ▼                  ▼        │
│                       ┌──────────────────┐ ┌─────────────┐ │
│                       │ Success Page      │ │ Release spot │ │
│                       │ (enrollment_id)   │ │ on failure   │ │
│                       └──────────────────┘ └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Management

```
┌──────────────────────────────────────────────────────────┐
│                    State Flow                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────┐    ┌───────────────┐                │
│  │ authStore     │───▶│ isAuthenticated│                │
│  │ (Zustand)     │    └───────────────┘                │
│  └───────────────┘                                      │
│                                                          │
│  ┌───────────────┐    ┌───────────────┐                │
│  │ useEnrollment │───▶│ EnrollmentData│                │
│  │ (React Query) │    └───────────────┘                │
│  └───────────────┘                                      │
│                                                          │
│  ┌───────────────┐    ┌───────────────┐                │
│  │ Stripe        │───▶│ PaymentIntent │                │
│  │ (Provider)    │    └───────────────┘                │
│  └───────────────┘                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

### 1. Backend Requirements

**Payment Intent Creation Endpoint:**
- POST `/api/v1/payments/create-intent/`
- Creates Stripe PaymentIntent
- Returns client_secret for frontend
- Validates course/cohort availability
- Creates enrollment with status: pending

**Webhook Handler:**
- POST `/api/v1/payments/webhook/`
- Handles `payment_intent.succeeded`
- Handles `payment_intent.payment_failed`
- Updates enrollment status
- Releases cohort spot on failure

### 2. Frontend Requirements

**Stripe Elements:**
- @stripe/stripe-js: Stripe JavaScript SDK
- @stripe/react-stripe-js: React bindings

**New Components:**
1. PaymentForm (Stripe Card Element)
2. CohortSelector (with availability check)
3. EnrollmentProgress (step indicator)
4. EnrollmentSuccess (confirmation page)

**New Hooks:**
1. useEnrollment (create/cancel/manage)
2. usePayment (Stripe integration)
3. useCohortAvailability (real-time spots check)

---

## Implementation Checklist

### Phase 7.1: Backend Payment Infrastructure
- [ ] Create PaymentViewSet with create_intent action
- [ ] Implement webhook handler for Stripe events
- [ ] Add payment URL routes
- [ ] Write backend payment tests (8 tests)

### Phase 7.2: Frontend Dependencies
- [ ] Install @stripe/stripe-js
- [ ] Install @stripe/react-stripe-js
- [ ] Add Stripe publishable key to .env

### Phase 7.3: Type Definitions
- [ ] Create types/payment.ts
- [ ] Update types/enrollment.ts if needed
- [ ] Create types/checkout.ts for Stripe types

### Phase 7.4: API Service Layer
- [ ] Create services/api/payments.ts
- [ ] Add createPaymentIntent method
- [ ] Add confirmPayment method
- [ ] Add getPaymentStatus method

### Phase 7.5: React Query Hooks
- [ ] Create hooks/usePayment.ts
- [ ] Create hooks/useCheckout.ts (orchestration)
- [ ] Update hooks/useEnrollments.ts

### Phase 7.6: UI Components
- [ ] Create components/CohortSelector.tsx
- [ ] Create components/PaymentForm.tsx (Stripe)
- [ ] Create components/EnrollmentProgress.tsx
- [ ] Create components/EnrollmentSummary.tsx

### Phase 7.7: Pages
- [ ] Create pages/EnrollmentPage.tsx (main checkout)
- [ ] Create pages/EnrollmentConfirmationPage.tsx
- [ ] Create pages/EnrollmentCancelPage.tsx

### Phase 7.8: Route Integration
- [ ] Add /enroll/:slug route
- [ ] Add /enroll/:slug/confirm route
- [ ] Add /enroll/:slug/cancel route
- [ ] Protect enrollment routes

### Phase 7.9: Testing
- [ ] Create hooks/__tests__/usePayment.test.ts (6 tests)
- [ ] Create components/__tests__/PaymentForm.test.tsx (8 tests)
- [ ] Create pages/__tests__/EnrollmentPage.test.tsx (11 tests)
- [ ] Total: 25 tests minimum

### Phase 7.10: Documentation
- [ ] Update README.md with enrollment flow
- [ ] Update AGENTS.md with payment patterns
- [ ] Update API_Usage_Guide.md with payment endpoints
- [ ] Update ACCOMPLISHMENTS.md with Phase 7

---

## Detailed Implementation Plan

### Step 1: Backend Payment Infrastructure (1 hour)

**Files to Create:**
```
backend/api/views/payments.py          # PaymentViewSet
backend/api/views/webhooks.py            # Webhook handlers
backend/api/tests/test_payments.py       # Payment tests
```

**Files to Modify:**
```
backend/api/urls.py                      # Add payment routes
backend/academy/settings/base.py         # Webhook secret config
```

**Key Requirements:**
- PaymentIntent creation with metadata (enrollment_id, user_id)
- Idempotency key for duplicate prevention
- Webhook signature verification
- Automatic enrollment status updates
- Cohort spot release on payment failure

### Step 2: Frontend Dependencies (15 minutes)

```bash
cd /home/project/AI-Academy/frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Environment Variables:**
```env
# frontend/.env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Step 3: Type Definitions (30 minutes)

**Create: types/payment.ts**
```typescript
// Stripe Payment Intent
type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled' | 'requires_action';

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
}

// Checkout session
interface CheckoutSession {
  enrollmentId: string;
  courseId: string;
  cohortId: string;
  amount: number;
  clientSecret: string;
}
```

### Step 4: API Service Layer (45 minutes)

**Create: services/api/payments.ts**
```typescript
export async function createPaymentIntent(
  enrollmentId: string
): Promise<ApiResponse<PaymentIntent>>;

export async function confirmPayment(
  clientSecret: string,
  cardElement: StripeCardElement
): Promise<PaymentResult>;
```

### Step 5: React Query Hooks (1 hour)

**Create: hooks/usePayment.ts**
```typescript
export function usePaymentIntent() {
  // Create payment intent mutation
}

export function useConfirmPayment() {
  // Confirm payment with Stripe
}
```

**Create: hooks/useCheckout.ts**
```typescript
export function useCheckout() {
  // Orchestrate enrollment + payment flow
  // Step 1: Create enrollment
  // Step 2: Create payment intent
  // Step 3: Confirm payment
  // Step 4: Handle result
}
```

### Step 6: UI Components (1.5 hours)

**Create: components/CohortSelector.tsx**
- Dropdown with available cohorts
- Shows spots remaining
- Handles waitlist option
- Validates against full cohorts

**Create: components/PaymentForm.tsx**
- Stripe CardElement wrapper
- Card validation feedback
- Error messaging
- Loading states
- Success callback

**Create: components/EnrollmentProgress.tsx**
- Step indicator (1: Select cohort, 2: Payment, 3: Confirmation)
- Visual progress bar
- Step completion status

**Create: components/EnrollmentSummary.tsx**
- Course details summary
- Cohort details
- Price breakdown
- Terms checkbox

### Step 7: Enrollment Pages (1.5 hours)

**Create: pages/EnrollmentPage.tsx**
- Protected route (requires auth)
- Cohort selection step
- Payment form step
- Error handling
- Progress tracking

**Create: pages/EnrollmentConfirmationPage.tsx**
- Success message
- Enrollment details
- Next steps
- Receipt/invoice link
- Continue learning CTA

**Create: pages/EnrollmentCancelPage.tsx**
- Cancellation options
- Confirmation dialog
- Grace period explanation
- Support links

### Step 8: Route Integration (30 minutes)

**Update: App.tsx**
```typescript
<Route path="/enroll/:slug" element={<EnrollmentPage />} />
<Route path="/enroll/:slug/confirm" element={<EnrollmentConfirmationPage />} />
<Route path="/enroll/:slug/cancel" element={<EnrollmentCancelPage />} />
```

**Update: CourseDetailPage.tsx**
- Add "Enroll Now" button
- Navigate to enrollment flow
- Pre-select cohort if query param

### Step 9: Comprehensive Testing (1.5 hours)

**Test Coverage Requirements:**

1. **Payment Hook Tests (6 tests)**
   - Should create payment intent successfully
   - Should handle payment intent creation error
   - Should confirm payment with valid card
   - Should handle card validation errors
   - Should handle network errors
   - Should reset payment state

2. **Payment Form Tests (8 tests)**
   - Should render Stripe CardElement
   - Should validate empty card
   - Should submit valid card
   - Should display card errors
   - Should show loading state during submission
   - Should handle payment success
   - Should handle payment failure
   - Should respect reduced motion preference

3. **Enrollment Page Tests (11 tests)**
   - Should redirect to login if not authenticated
   - Should load course and cohorts on mount
   - Should validate cohort selection
   - Should show enrollment summary
   - Should initiate payment flow
   - Should handle payment success
   - Should handle payment failure with retry
   - Should show progress through steps
   - Should handle network errors gracefully
   - Should prevent double submission
   - Should navigate to confirmation on success

---

## Test Specifications

### Backend Tests

```python
class PaymentTests(APITestCase):
    """
    Test Coverage:
    1. test_create_payment_intent_success
    2. test_create_payment_intent_unauthenticated
    3. test_create_payment_intent_invalid_enrollment
    4. test_webhook_payment_succeeded
    5. test_webhook_payment_failed
    6. test_webhook_invalid_signature
    7. test_webhook_duplicate_event
    8. test_idempotency_key_prevent_duplicate
    """
```

### Frontend Tests

```typescript
describe('usePayment', () => {
  // 6 tests as specified above
});

describe('PaymentForm', () => {
  // 8 tests as specified above
});

describe('EnrollmentPage', () => {
  // 11 tests as specified above
});
```

---

## UI/UX Design Guidelines

### Enrollment Flow Wireframe

```
┌─────────────────────────────────────────────────────┐
│  Enrollment Progress                                │
│  [●──○──○]  Step 1 of 3: Select Cohort              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  AI Engineering Bootcamp                          │
│  12 weeks • Instructor-led • $2,499               │
│                                                     │
│  ┌─────────────────────────────────────┐          │
│  │ Select Cohort:                      │          │
│  │ ┌─────────────────────────────┐     │          │
│  │ │ March 2025 (5 spots left) ▼ │     │          │
│  │ └─────────────────────────────┘     │          │
│  │                                     │          │
│  │ Start: March 1, 2025              │          │
│  │ End: May 24, 2025                 │          │
│  │ Format: Live Online               │          │
│  │ Instructor: Dr. Sarah Chen        │          │
│  └─────────────────────────────────────┘          │
│                                                     │
│  [             Continue             ]             │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [●──●──○]  Step 2 of 3: Payment                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Payment Information                                │
│                                                     │
│  ┌─────────────────────────────────────┐          │
│  │ Card Number:                        │          │
│  │ ┌─────────────────────────────┐     │          │
│  │ │ 4242 4242 4242 4242 [Stripe]│     │          │
│  │ └─────────────────────────────┘     │          │
│  │                                     │          │
│  │ MM/YY  CVC                          │          │
│  │ ┌────────┐  ┌────────┐             │          │
│  │ │ 12/25  │  │ 123    │             │          │
│  │ └────────┘  └────────┘             │          │
│  └─────────────────────────────────────┘          │
│                                                     │
│  Order Summary                                     │
│  Course:                      $2,499.00           │
│  Discount:                   -$0.00               │
│  ─────────────────────────────────                │
│  Total:                       $2,499.00           │
│                                                     │
│  [     Pay $2,499.00 Securely      ]             │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [●──●──●]  Step 3 of 3: Confirmation              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅ Enrollment Confirmed!                          │
│                                                     │
│  You're enrolled in:                              │
│  AI Engineering Bootcamp                          │
│  Cohort: March 2025                               │
│                                                     │
│  Enrollment ID: ENT-2025-03-001                   │
│  Confirmation sent to: user@example.com            │
│                                                     │
│  [    Access Course Dashboard    ]                 │
│  [         Back to Home          ]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Design Tokens

**Colors:**
- Primary: `#4f46e5` (Electric Indigo)
- Success: `#10b981` (Emerald)
- Error: `#ef4444` (Red)
- Background: `#ffffff` / `#fafaf9`
- Border: `#e5e7eb`

**Typography:**
- Headings: Space Grotesk, 24px, 600 weight
- Body: Inter, 16px, 400 weight
- Monospace: JetBrains Mono (for enrollment ID)

**Spacing:**
- Section padding: 24px
- Card padding: 16px
- Element gap: 12px
- Progress indicator: 8px circles

**Animation:**
- Step transitions: 300ms ease-in-out
- Success check: Scale from 0 to 1 with bounce
- Error shake: 400ms horizontal wobble

---

## Error Handling Strategy

### Payment Errors

| Error Code | User Message | Action |
|------------|--------------|--------|
| card_declined | "Your card was declined. Please try a different payment method." | Show retry button |
| insufficient_funds | "Your card has insufficient funds." | Suggest different card |
| expired_card | "Your card has expired." | Prompt for new card |
| incorrect_cvc | "Your card's security code is incorrect." | Focus CVC field |
| processing_error | "An error occurred while processing your payment." | Allow retry |
| network_error | "Connection error. Please check your internet and try again." | Auto-retry with backoff |

### Enrollment Errors

| Scenario | User Message | Action |
|----------|--------------|--------|
| Cohort full | "Sorry, this cohort is now full." | Show waitlist option |
| Already enrolled | "You're already enrolled in this cohort." | Redirect to dashboard |
| Capacity exceeded | "Enrollment failed: cohort capacity exceeded." | Release spot, show alternatives |
| Payment failed | "Payment failed. Your spot has been reserved for 15 minutes." | Allow retry within window |

---

## Security Considerations

### Frontend
- Never log or expose Stripe keys
- Use PKCE for payment intent creation
- Validate all user inputs before submission
- Implement CSRF protection for webhooks
- Sanitize enrollment IDs in URLs

### Backend
- Webhook signature verification mandatory
- Idempotency key for duplicate prevention
- Validate enrollment ownership
- Rate limit payment endpoints (5/minute)
- PCI compliance: Never store full card data

---

## Success Criteria

### Functional Requirements
- [ ] Users can select cohort and proceed to payment
- [ ] Stripe payment form accepts valid cards
- [ ] Payment success creates confirmed enrollment
- [ ] Payment failure releases cohort spot
- [ ] Email confirmation sent on success
- [ ] Enrollment shows in user profile

### Performance Requirements
- [ ] Payment form loads in < 2 seconds
- [ ] Payment processing completes in < 5 seconds
- [ ] Webhook processing < 1 second
- [ ] Page transitions smooth (60fps)

### Quality Requirements
- [ ] 25+ passing TDD tests
- [ ] WCAG AAA accessibility compliance
- [ ] Responsive design (mobile-first)
- [ ] Graceful degradation for JavaScript disabled
- [ ] All error states handled with user-friendly messages

---

## Rollback Plan

If critical issues arise:
1. Disable enrollment routes in App.tsx
2. Revert to "Coming Soon" page
3. Maintain course browsing functionality
4. Notify users via toast notification
5. Deploy fix within 24 hours

---

## Post-Implementation Review

**After Phase 7 completion, document:**
- Actual vs. estimated time
- Issues encountered and resolutions
- Performance metrics
- User feedback
- Recommended improvements

---

## Sign-off

**Planning Approval:** _______________ Date: _________

**Technical Review:** _______________ Date: _________

**QA Review:** _______________ Date: _________
