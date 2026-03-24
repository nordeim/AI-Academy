# PaymentForm Component - TDD Implementation Plan

**Component:** PaymentForm  
**Location:** `/frontend/src/components/PaymentForm.tsx`  
**Test File:** `/frontend/src/components/__tests__/PaymentForm.test.tsx`  
**Approach:** Test-Driven Development (RED → GREEN → REFACTOR)  
**Estimated Time:** 1.5 hours

---

## Component Requirements

### Props Interface
```typescript
interface PaymentFormProps {
  clientSecret: string;           // Stripe PaymentIntent client_secret
  amount: number;                 // Amount in cents (e.g., 249900 = $2,499.00)
  currency: string;               // Currency code (e.g., 'USD')
  courseTitle: string;            // Course title for summary
  cohortName: string;             // Cohort name for summary
  onSuccess: () => void;          // Callback on successful payment
  onError: (error: string) => void; // Callback on payment error
  disabled?: boolean;             // Disable form submission
}
```

### Features
1. **Stripe CardElement** - Secure card input via Stripe Elements
2. **Card Validation** - Real-time validation feedback
3. **Order Summary** - Display course, cohort, and price
4. **Submit Button** - Pay button with loading state
5. **Error Display** - User-friendly error messages
6. **Security** - PCI compliant (no card data stored)

---

## TDD Test Plan (6 Tests)

### Test 1: Render Component
**Scenario:** Component renders with required props
**Expected:** 
- CardElement is rendered
- Order summary displayed
- Submit button visible
- Amount formatted correctly

### Test 2: Card Validation Error
**Scenario:** User submits with invalid card
**Expected:**
- Validation error displayed
- onError callback called
- Button not disabled

### Test 3: Payment Success
**Scenario:** User enters valid card and submits
**Expected:**
- stripe.confirmCardPayment called
- onSuccess callback called
- Loading state shown during processing

### Test 4: Payment Failure
**Scenario:** Card is declined
**Expected:**
- Error message displayed
- onError callback called with error
- Form remains submittable

### Test 5: Loading State
**Scenario:** Payment is processing
**Expected:**
- Button shows loading indicator
- Button is disabled
- Card input is disabled

### Test 6: Order Summary Display
**Scenario:** Component renders
**Expected:**
- Course title displayed
- Cohort name displayed
- Price formatted with currency

---

## Implementation Strategy

### Step 1: Write Tests (RED)
- Create test file with 6 tests
- Mock Stripe Elements
- Mock usePayment hook
- All tests should FAIL initially

### Step 2: Create Component (GREEN)
- Create PaymentForm component
- Integrate Stripe CardElement
- Implement payment confirmation
- Handle errors
- Make all tests PASS

### Step 3: Refactor (REFACTOR)
- Extract reusable logic
- Improve error handling
- Optimize re-renders
- Add accessibility

---

## Stripe Integration Notes

### Required Setup
```typescript
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
```

### CardElement Options
```typescript
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};
```

### Payment Confirmation Flow
1. Get CardElement from useElements()
2. Call stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement }})
3. Handle result (success or error)
4. Call appropriate callback

---

## Error Handling Strategy

### Stripe Error Types
- `card_error` - Card validation issues
- `validation_error` - Input validation
- `api_error` - Stripe API issues

### User-Friendly Messages
- "Your card was declined. Please try a different payment method."
- "Your card has insufficient funds."
- "Your card has expired."
- "An error occurred while processing your payment."

---

## Design Specifications

### Colors
- Primary button: `#4f46e5` (Electric Indigo)
- Error text: `#ef4444` (Red)
- Success: `#10b981` (Emerald)
- Loading spinner: `#4f46e5`

### Layout
- Max width: 500px
- Card input: Full width
- Submit button: Full width
- Order summary: Card above form

### Spacing
- Section padding: 24px
- Element gap: 16px
- Button height: 48px

---

**Ready to Execute**
