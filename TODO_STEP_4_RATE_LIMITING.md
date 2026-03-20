# Step 4: API Rate Limiting - TDD Sub-Plan

**Issue:** #4 API Rate Limiting  
**Priority:** P1 - High  
**Methodology:** Test-Driven Development (TDD)  
**Estimated Time:** 30 minutes  
**Started:** March 20, 2026  
**Dependencies:** None

---

## Phase 1: Analysis & Planning

### Problem Definition
**Security Vulnerability:** The API has no rate limiting configured, making it vulnerable to:
- Brute force attacks on authentication endpoints
- Denial of Service (DoS) attacks
- Resource exhaustion from automated scraping
- Enumeration attacks on enrollment endpoints

### Current State
**File:** `/home/project/AI-Academy/backend/academy/settings/base.py`

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [...],
    "DEFAULT_PERMISSION_CLASSES": [...],
    # ❌ NO THROTTLE CONFIGURATION
}
```

### Requirements

#### AnonRateThrottle
- **Target:** Unauthenticated requests
- **Rate:** 100 requests per hour
- **Scope:** All public endpoints (courses, categories, cohorts)

#### UserRateThrottle
- **Target:** Authenticated requests
- **Rate:** 1000 requests per hour
- **Scope:** All authenticated endpoints

#### Custom Enrollment Throttle
- **Target:** Enrollment operations
- **Rate:** 10 requests per minute
- **Scope:** POST /api/v1/enrollments/, POST /api/v1/enrollments/{id}/cancel/
- **Reason:** Prevent enrollment abuse and capacity manipulation

### Expected Behavior

**When Rate Exceeded:**
```json
{
  "detail": "Request was throttled. Expected available in 3600 seconds."
}
```

**HTTP Status:** 429 Too Many Requests

---

## Phase 2: TDD Implementation - RED Phase

### Test 1: Anonymous Rate Limiting
**Test:** Verify unauthenticated requests are rate limited

```python
def test_anonymous_rate_limiting(self):
    """
    Test: Anonymous requests are rate limited
    Expected: 429 after exceeding 100/hour
    TDD: Should FAIL initially (no throttling)
    """
    # Make 101 requests
    for i in range(101):
        response = self.client.get('/api/v1/courses/')
    
    # 101st request should be throttled
    self.assertEqual(response.status_code, 429)
```

### Test 2: Authenticated Rate Limiting
**Test:** Verify authenticated requests are rate limited

```python
def test_authenticated_rate_limiting(self):
    """
    Test: Authenticated requests are rate limited
    Expected: 429 after exceeding 1000/hour
    """
    self.client.force_authenticate(user=self.user)
    
    # Make 1001 requests
    for i in range(1001):
        response = self.client.get('/api/v1/enrollments/')
    
    self.assertEqual(response.status_code, 429)
```

### Test 3: Enrollment Throttle
**Test:** Verify enrollment operations have stricter limits

```python
def test_enrollment_throttle(self):
    """
    Test: Enrollment endpoint has stricter rate limit
    Expected: 429 after 10 requests per minute
    """
    self.client.force_authenticate(user=self.user)
    
    # Make 11 enrollment requests
    for i in range(11):
        response = self.client.post('/api/v1/enrollments/', {
            'course': str(self.course.id),
            'cohort': str(self.cohort.id),
            'amount_paid': '100.00'
        })
    
    self.assertEqual(response.status_code, 429)
```

### Test 4: Different Users Have Separate Limits
**Test:** Rate limits are per user/IP, not global

```python
def test_rate_limits_per_user(self):
    """
    Test: Rate limits are per user, not global
    Expected: Different users have separate limits
    """
    # User 1 makes 10 enrollment requests
    self.client.force_authenticate(user=self.user)
    for i in range(10):
        response = self.client.post('/api/v1/enrollments/', {...})
    self.assertEqual(response.status_code, 429)  # User 1 throttled
    
    # User 2 should still be able to enroll
    user2 = User.objects.create_user(...)
    self.client.force_authenticate(user=user2)
    response = self.client.post('/api/v1/enrollments/', {...})
    self.assertEqual(response.status_code, 201)  # User 2 succeeds
```

### Test 5: Throttle Response Format
**Test:** Verify 429 response has correct format

```python
def test_throttle_response_format(self):
    """
    Test: Throttle response has correct format
    Expected: 429 with detail message
    """
    # Exceed rate limit
    for i in range(101):
        response = self.client.get('/api/v1/courses/')
    
    self.assertEqual(response.status_code, 429)
    self.assertIn('throttled', str(response.data).lower())
```

---

## Phase 3: GREEN Phase - Implementation

### Step 3.1: Add Throttle Configuration
**File:** `backend/academy/settings/base.py`

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # ... rest of config
}
```

### Step 3.2: Create Custom Enrollment Throttle
**File:** `backend/api/throttles.py`

```python
from rest_framework.throttling import UserRateThrottle


class EnrollmentThrottle(UserRateThrottle):
    """
    Custom throttle for enrollment operations.
    Prevents abuse of enrollment endpoints.
    """
    scope = 'enrollment'
    rate = '10/minute'
```

### Step 3.3: Apply Custom Throttle to EnrollmentViewSet
**File:** `backend/api/views.py`

```python
from rest_framework.throttling import UserRateThrottle
from .throttles import EnrollmentThrottle


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [EnrollmentThrottle]  # Custom throttle
    
    # ... rest of viewset
```

### Step 3.4: Add Scope to Settings
**File:** `backend/academy/settings/base.py`

```python
REST_FRAMEWORK = {
    # ... existing config
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "enrollment": "10/minute",  # Custom scope
    },
}
```

---

## Phase 4: Verification

### Test Execution
```bash
python manage.py test api.tests.test_throttling -v 2
```

### Manual Testing
```bash
# Test anonymous throttling
for i in {1..101}; do
    curl -s http://localhost:8000/api/v1/courses/
done

# Should return 429 on 101st request

# Test enrollment throttling
curl -X POST http://localhost:8000/api/v1/enrollments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Run 11 times, 11th should return 429
```

---

## Success Criteria

- [ ] Anonymous requests limited to 100/hour
- [ ] Authenticated requests limited to 1000/hour
- [ ] Enrollment operations limited to 10/minute
- [ ] Rate limits are per user/IP (not global)
- [ ] 429 response returned when limit exceeded
- [ ] Response includes retry information
- [ ] All tests passing

---

## Definition of Done

- [ ] TDD cycle complete (RED-GREEN-REFACTOR)
- [ ] All throttle tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No breaking changes to existing functionality
- [ ] API_Usage_Guide.md updated with rate limit info

---

## Current Status

**Phase:** 1 - Analysis & Planning ✅  
**Next Action:** Execute Phase 2 (Create test file)

