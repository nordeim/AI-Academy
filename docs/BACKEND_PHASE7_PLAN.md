# Backend Phase 7 Implementation Plan
## Option A: Complete Backend (TDD Methodology)

**Version:** 1.0.0  
**Date:** March 21, 2026  
**Estimated Duration:** 2-3 hours  
**Approach:** Test-Driven Development (RED → GREEN → REFACTOR)

---

## Phase Overview

This phase completes the backend payment infrastructure for Phase 7: Enrollment Flow. Following TDD, we'll write tests first, implement the code to make them pass, then refactor for quality.

### Success Criteria
- [ ] 8+ payment-related tests passing
- [ ] URL routes configured and accessible
- [ ] Stripe keys properly configured
- [ ] Webhook handling verified
- [ ] API documentation updated
- [ ] All existing tests still passing (227+)

---

## Execution Steps

### Step 1: Test Planning & Setup (30 minutes)

**Objective:** Define test cases and create test infrastructure

**Test Cases (8 total):**

1. **test_create_payment_intent_success**
   - Input: Authenticated user with pending enrollment
   - Expected: 200 OK, client_secret returned, payment_intent_id stored
   - Verifies: PaymentIntent creation, metadata storage

2. **test_create_payment_intent_unauthenticated**
   - Input: Anonymous request
   - Expected: 401 Unauthorized
   - Verifies: Auth protection

3. **test_create_payment_intent_invalid_enrollment**
   - Input: Non-existent enrollment ID
   - Expected: 404 Not Found
   - Verifies: Resource validation

4. **test_create_payment_intent_wrong_user**
   - Input: User trying to pay for another user's enrollment
   - Expected: 403 Forbidden
   - Verifies: Ownership validation

5. **test_create_payment_intent_already_confirmed**
   - Input: Already confirmed enrollment
   - Expected: 400 Bad Request
   - Verifies: Duplicate prevention

6. **test_webhook_payment_succeeded**
   - Input: Valid webhook payload for payment_intent.succeeded
   - Expected: Enrollment confirmed, spots_reserved incremented
   - Verifies: Webhook processing, state updates

7. **test_webhook_payment_failed**
   - Input: Valid webhook payload for payment_intent.payment_failed
   - Expected: Enrollment cancelled, spot released
   - Verifies: Failure handling

8. **test_webhook_invalid_signature**
   - Input: Webhook with invalid signature
   - Expected: 400 Bad Request
   - Verifies: Security validation

**Files to Create:**
- `api/tests/test_payments.py`

**Dependencies:**
- Django test framework
- Stripe Python SDK (mock mode)
- Existing test fixtures

---

### Step 2: URL Configuration (15 minutes)

**Objective:** Register payment endpoints in URL routing

**Routes to Add:**

```python
# In api/urls.py
from api.views.payments import PaymentViewSet, StripeWebhookView

router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns += [
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
```

**Verification:**
- Access `/api/v1/payments/` → 200 OK
- Access `/api/v1/webhooks/stripe/` → 200/400 OK
- Check API documentation at `/api/docs/`

**Files to Modify:**
- `api/urls.py`

---

### Step 3: Stripe Configuration (15 minutes)

**Objective:** Configure Stripe keys for test environment

**Environment Variables:**

```bash
# backend/.env (test mode)
STRIPE_PUBLISHABLE_KEY=pk_test_51ExampleKey123
STRIPE_SECRET_KEY=sk_test_51ExampleSecretKey456
STRIPE_WEBHOOK_SECRET=whsec_exampleWebhookSecret789
```

**Configuration in Settings:**
- Verify `STRIPE_SECRET_KEY` is read from environment
- Verify `STRIPE_WEBHOOK_SECRET` is available
- Add validation to ensure keys are set in production

**Files to Modify:**
- `.env.example` (add Stripe keys)
- `academy/settings/base.py` (validate configuration)

**Security:**
- Never commit real keys
- Use test mode keys only
- Document key rotation process

---

### Step 4: Implementation Fixes (30 minutes)

**Objective:** Fix import errors and integration issues in payment views

**Known Issues to Fix:**

1. **Import Resolution**
   - Fix `api.serializers.enrollment` import
   - Verify `api.exceptions.PaymentError` import
   - Update `api/views/__init__.py` exports

2. **Stripe Error Handling**
   - Fix `stripe.error.StripeError` access pattern
   - Ensure proper exception catching

3. **Response Formatting**
   - Ensure all responses use standardized format
   - Add request_id tracking

**Files to Modify:**
- `api/views/payments.py`
- `api/views/__init__.py`
- `api/serializers/` (if enrollment serializer needed)

---

### Step 5: Test Execution & Verification (45 minutes)

**Objective:** Run all tests and ensure passing

**Commands:**

```bash
# Run specific payment tests
cd /home/project/AI-Academy/backend
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_payments --no-input -v 2

# Run all tests to ensure no regressions
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input
```

**Expected Results:**
- Payment tests: 8/8 passing
- All tests: 227+/227+ passing
- No new warnings or errors

**Debugging:**
- If tests fail, check Stripe mock setup
- Verify database transactions roll back correctly
- Check webhook signature generation in tests

---

### Step 6: Refactoring & Optimization (30 minutes)

**Objective:** Improve code quality without changing functionality

**Refactoring Opportunities:**

1. **Extract Common Logic**
   - Create helper for enrollment lookup with validation
   - Extract webhook event handlers

2. **Add Logging**
   - Add structured logging for payment operations
   - Log webhook events
   - Log payment intent lifecycle

3. **Error Messages**
   - Standardize error message formats
   - Add user-friendly error codes

4. **Code Documentation**
   - Add docstrings to all methods
   - Document webhook event flow

**Files to Modify:**
- `api/views/payments.py`
- `api/exceptions/payment.py`

---

### Step 7: Webhook Testing Utilities (20 minutes)

**Objective:** Create utilities for testing webhooks

**Create: api/tests/utils/webhooks.py**

```python
def generate_stripe_signature(payload, secret):
    """Generate Stripe webhook signature for testing."""
    timestamp = int(time.time())
    signed_payload = f"{timestamp}.{payload}"
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f"t={timestamp},v1={signature}"

def create_payment_intent_event(event_type, payment_intent_id, enrollment_id):
    """Create mock webhook event payload."""
    return {
        "id": "evt_test",
        "object": "event",
        "type": event_type,
        "data": {
            "object": {
                "id": payment_intent_id,
                "status": "succeeded" if event_type == "payment_intent.succeeded" else "requires_payment_method",
                "metadata": {
                    "enrollment_id": enrollment_id
                }
            }
        }
    }
```

**Files to Create:**
- `api/tests/utils/webhooks.py`

---

### Step 8: API Documentation Updates (20 minutes)

**Objective:** Document payment endpoints in usage guide

**Documentation to Add:**

1. **Payment Endpoints Section**
   - `POST /api/v1/payments/create-intent/`
   - `GET /api/v1/payments/{id}/status/`
   - `POST /api/v1/webhooks/stripe/`

2. **Webhook Events**
   - List of supported events
   - Event payload examples
   - Error responses

3. **Authentication**
   - Payment endpoints require authentication
   - Webhook uses signature verification

**Files to Modify:**
- `API_Usage_Guide.md`

---

## Implementation Schedule

| Step | Task | Duration | Status |
|------|------|----------|--------|
| 1 | Test Planning & Setup | 30 min | ⏳ Pending |
| 2 | URL Configuration | 15 min | ⏳ Pending |
| 3 | Stripe Configuration | 15 min | ⏳ Pending |
| 4 | Implementation Fixes | 30 min | ⏳ Pending |
| 5 | Test Execution | 45 min | ⏳ Pending |
| 6 | Refactoring | 30 min | ⏳ Pending |
| 7 | Webhook Utilities | 20 min | ⏳ Pending |
| 8 | Documentation | 20 min | ⏳ Pending |
| **Total** | | **3h 45min** | |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stripe SDK version conflicts | Low | Pin to stripe==11.3.0 in requirements |
| Webhook signature generation | Medium | Create comprehensive utility with examples |
| Test database state pollution | Low | Use transactions, clean up in tearDown |
| Missing serializer imports | Medium | Check imports before running tests |
| Environment variable issues | Low | Add validation with helpful error messages |

---

## Success Validation

### Definition of Done

✅ **All Criteria Met:**
1. `test_payments.py` exists with 8 tests
2. All 8 tests pass (DJANGO_SETTINGS_MODULE=academy.settings.test)
3. URL routes accessible:
   - `/api/v1/payments/`
   - `/api/v1/webhooks/stripe/`
4. Stripe environment variables configured
5. Total test count: 227+ (all passing)
6. No new warnings in test output
7. API documentation updated
8. Code reviewed for quality

### Post-Implementation Checklist

- [ ] Tests run successfully
- [ ] URLs accessible in browser/API client
- [ ] Webhook signature generation working
- [ ] Documentation accurate
- [ ] No security vulnerabilities introduced
- [ ] Performance acceptable (< 100ms for payment operations)

---

**Prepared By:** GEMINI Agent  
**Status:** Ready for Execution  
**Next Action:** Begin Step 1 - Write test cases
