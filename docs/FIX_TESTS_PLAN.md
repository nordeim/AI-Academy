# Fix Test Imports and Run Tests - Execution Plan

**Date:** March 21, 2026  
**Status:** In Progress  
**Approach:** TDD GREEN Phase  
**Estimated Duration:** 30 minutes

---

## Current State

### Known Issues
1. **Import Error:** Test runner cannot find `api.tests.test_payments` module
2. **URL Import:** `api.views.payments` not resolving in urls.py
3. **Stripe Error:** Reference to `stripe.error.StripeError` vs `stripe.StripeError`

### Test Coverage
- 11 payment tests written
- Target: All 11 tests passing
- Total project tests: Should be 238 (227 existing + 11 new)

---

## Execution Steps

### Step 1: Diagnose Import Issues (5 minutes)

**Action:** Check import paths and module structure

**Verification:**
- Verify file exists: `backend/api/tests/test_payments.py`
- Check __init__.py in all directories
- Verify Python path configuration

### Step 2: Fix Module Imports (10 minutes)

**Issues to Fix:**

1. **URL Import Fix**
   - File: `api/urls.py`
   - Issue: Import `api.views.payments` fails
   - Fix: Use relative import or add to __init__.py

2. **Test Import Fix**
   - File: `api/tests/__init__.py`
   - Issue: Test module not discovered
   - Fix: Ensure proper module structure

3. **Stripe Error References**
   - File: `api/tests/test_payments.py`
   - Issue: `from stripe.error import SignatureVerificationError`
   - Fix: Use `stripe.error.SignatureVerificationError`

### Step 3: Run Tests and Verify (10 minutes)

**Commands:**

```bash
# Run specific payment tests
cd /home/project/AI-Academy/backend
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test api.tests.test_payments -v 2

# Run all tests to check for regressions
DJANGO_SETTINGS_MODULE=academy.settings.test python manage.py test --no-input
```

**Expected Results:**
- Payment tests: 11/11 passing
- All tests: 238/238 passing
- No import errors
- No test failures

### Step 4: Document Results (5 minutes)

**Deliverables:**
- Test run output
- Success confirmation
- Summary of fixes applied

---

## Success Criteria

- [ ] All import errors resolved
- [ ] 11 payment tests passing
- [ ] All existing tests still passing (227+)
- [ ] Total: 238 tests passing
- [ ] No warnings or errors in test output

---

**Status:** Ready for execution
