# AI Academy - Backend API Remediation Plan

**Version:** 1.0.0  
**Created:** March 20, 2026  
**Status:** Planning Phase

---

## Executive Summary

This document outlines identified opportunities for improvement in the AI Academy backend API, organized by priority and complexity. Issues range from critical security concerns to performance optimizations and best practice alignments.

---

## Priority Matrix

| Priority | Description | Items |
|----------|-------------|-------|
| **P0 - Critical** | Security vulnerabilities, broken functionality | 3 |
| **P1 - High** | Performance issues, missing core features | 5 |
| **P2 - Medium** | Code quality, API design improvements | 6 |
| **P3 - Low** | Nice-to-have enhancements | 4 |

---

## P0: Critical Issues

### 1. JWT Authentication Implementation
**Issue:** Token authentication is listed in settings but SimpleJWT is not installed or configured.

**Current State:**
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",  # Non-functional
    ],
}
```

**Impact:**
- Frontend cannot authenticate with the API
- Enrollment endpoints inaccessible programmatically
- No secure way to maintain user sessions

**Solution:**
1. Install `djangorestframework-simplejwt`
2. Configure JWT settings in `base.py`
3. Add authentication URLs
4. Update requirements files

**Implementation:**
```python
# requirements/base.txt
djangorestframework-simplejwt==5.4.0

# academy/settings/base.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

# api/urls.py
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # ... existing patterns
]
```

**Estimated Effort:** 2-3 hours  
**Dependencies:** None  
**Testing:** Manual token generation and refresh testing

---

### 2. N+1 Query Optimization
**Issue:** Serializers hit the database for each item in a list, causing N+1 queries.

**Affected Endpoints:**
- `GET /api/v1/courses/` - 1 query + N queries for categories
- `GET /api/v1/cohorts/` - 1 query + N queries for course/instructor

**Current Implementation:**
```python
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(status='published')  # No prefetch
    # Each course.categories hits DB again
```

**Solution:**
```python
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(status='published').prefetch_related('categories')
    # Now categories loaded in 2 queries total
```

**Implementation Details:**
```python
# views.py - CourseViewSet
def get_queryset(self):
    return Course.objects.filter(status='published').prefetch_related(
        'categories'
    ).select_related()  # If needed

# views.py - CohortViewSet  
def get_queryset(self):
    return Cohort.objects.filter(
        status__in=['upcoming', 'enrolling']
    ).select_related('course', 'instructor')
```

**Estimated Effort:** 1 hour  
**Dependencies:** None  
**Testing:** Django Debug Toolbar query count verification

---

### 3. Enrollment Permission & Business Logic
**Issue:** Enrollment create endpoint lacks critical business logic.

**Current Problems:**
1. No capacity checking before enrollment
2. No payment validation
3. No duplicate prevention (DB constraint exists but no API check)
4. Status auto-set to 'pending' but no workflow

**Required Logic:**
```python
class EnrollmentViewSet(viewsets.ModelViewSet):
    # ...
    
    def perform_create(self, serializer):
        cohort_id = self.request.data.get('cohort')
        cohort = Cohort.objects.get(id=cohort_id)
        
        # Check capacity
        if cohort.spots_remaining <= 0:
            raise ValidationError("Cohort is full")
        
        # Check duplicate
        if Enrollment.objects.filter(
            user=self.request.user, 
            cohort=cohort
        ).exists():
            raise ValidationError("Already enrolled in this cohort")
        
        # Increment reserved spots
        cohort.spots_reserved += 1
        cohort.save()
        
        serializer.save(user=self.request.user, status='pending')
```

**Estimated Effort:** 2 hours  
**Dependencies:** JWT implementation  
**Testing:** Unit tests for edge cases

---

## P1: High Priority

### 4. API Rate Limiting
**Issue:** No throttling configured, vulnerable to abuse.

**Implementation:**
```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "enrollment": "10/minute",  # Custom for sensitive ops
    },
}
```

**Estimated Effort:** 30 minutes  
**Dependencies:** None

---

### 5. Response Standardization
**Issue:** Inconsistent response formats across endpoints.

**Current Issues:**
- Some endpoints return arrays directly (`/courses/{slug}/cohorts/`)
- No standardized error format
- Missing metadata in some responses

**Solution:** Create custom response classes:
```python
# api/responses.py
from rest_framework.response import Response

class StandardizedResponse(Response):
    def __init__(self, data=None, status=None, message=None, errors=None, **kwargs):
        response_data = {
            "success": status < 400 if status else True,
            "message": message,
            "data": data,
            "errors": errors,
        }
        super().__init__(response_data, status=status, **kwargs)
```

**Estimated Effort:** 3-4 hours (refactoring all views)  
**Dependencies:** None

---

### 6. Image Upload Support
**Issue:** Thumbnail and avatar fields are ImageFields but not configured for API uploads.

**Current State:**
```python
class Course(models.Model):
    thumbnail = models.ImageField(upload_to='courses/thumbnails/')
    # No API endpoint to upload
```

**Solution:**
1. Create dedicated upload endpoints
2. Configure MinIO/S3 storage backend
3. Implement image validation and resizing

```python
# api/views.py
class CourseImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, slug):
        course = get_object_or_404(Course, slug=slug)
        course.thumbnail = request.FILES['thumbnail']
        course.save()
        return Response({'thumbnail_url': course.thumbnail.url})
```

**Estimated Effort:** 4-6 hours  
**Dependencies:** MinIO/S3 configuration

---

### 7. Add User Management Endpoints
**Issue:** No user registration, profile update, or password reset endpoints.

**Missing Endpoints:**
- `POST /api/v1/auth/register/` - User registration
- `GET /api/v1/users/me/` - Current user profile
- `PATCH /api/v1/users/me/` - Update profile
- `POST /api/v1/auth/password-reset/` - Password reset
- `POST /api/v1/auth/password-reset/confirm/` - Reset confirmation

**Implementation:**
```python
# api/views.py
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'User created successfully',
            'user_id': str(user.id)
        }, status=201)
```

**Estimated Effort:** 4 hours  
**Dependencies:** JWT implementation

---

### 8. Implement Caching Strategy
**Issue:** No caching configured, every request hits the database.

**High-Value Cache Targets:**
- Course list (cache 5 minutes)
- Category list (cache 30 minutes)
- Course detail (cache until modified)

**Implementation:**
```python
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from rest_framework.decorators import action

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    @method_decorator(cache_page(60 * 5))  # 5 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @action(detail=True)
    def cohorts(self, request, slug=None):
        cache_key = f'course_cohorts_{slug}'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        
        course = self.get_object()
        cohorts = course.cohorts.filter(...)
        serializer = CohortSerializer(cohorts, many=True)
        cache.set(cache_key, serializer.data, 60 * 10)  # 10 minutes
        return Response(serializer.data)
```

**Estimated Effort:** 3 hours  
**Dependencies:** Redis already configured

---

## P2: Medium Priority

### 9. Comprehensive Testing Suite
**Issue:** No automated tests exist.

**Required Tests:**
```python
# tests/test_api.py
class CourseAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(...)
        self.course = Course.objects.create(...)
    
    def test_list_courses(self):
        response = self.client.get('/api/v1/courses/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_by_level(self):
        response = self.client.get('/api/v1/courses/?level=intermediate')
        self.assertEqual(response.status_code, 200)
    
    def test_search_courses(self):
        response = self.client.get('/api/v1/courses/?search=AI')
        self.assertEqual(response.status_code, 200)

class EnrollmentAPITests(APITestCase):
    def test_enroll_requires_auth(self):
        response = self.client.post('/api/v1/enrollments/', {...})
        self.assertEqual(response.status_code, 401)
    
    def test_enroll_full_cohort(self):
        # Test capacity logic
```

**Estimated Effort:** 8-12 hours  
**Dependencies:** None

---

### 10. API Documentation with drf-spectacular
**Issue:** No interactive API documentation.

**Implementation:**
```python
# requirements/base.txt
drf-spectacular==0.28.0

# academy/settings/base.py
INSTALLED_APPS = [
    # ...
    "drf_spectacular",
]

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "AI Academy API",
    "DESCRIPTION": "Production-grade training platform API",
    "VERSION": "1.0.0",
}

# urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
```

**Estimated Effort:** 2 hours  
**Dependencies:** None

---

### 11. Admin Fieldset Corrections
**Issue:** Type errors in admin.py fieldsets (detected by LSP).

**Current Code (Problematic):**
```python
fieldsets = UserAdmin.fieldsets + (
    ('Profile', {...}),  # Type mismatch
)
```

**Solution:** Convert to list:
```python
fieldsets = list(UserAdmin.fieldsets) + [
    ('Profile', {'fields': (...) }),
]
```

**Estimated Effort:** 30 minutes  
**Dependencies:** None

---

### 12. Request Logging Middleware
**Issue:** No audit trail of API usage.

**Implementation:**
```python
# middleware/logging.py
import logging
import time

class APILoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('api')
    
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        self.logger.info(
            f"{request.method} {request.path} - {response.status_code} - {duration:.2f}s"
        )
        return response
```

**Estimated Effort:** 1 hour  
**Dependencies:** None

---

### 13. Field-Level Permissions
**Issue:** Serializers expose all fields regardless of user role.

**Solution:**
```python
class CourseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [...]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Hide stats from non-authenticated users
        if not request or not request.user.is_authenticated:
            data.pop('enrolled_count', None)
        
        return data
```

**Estimated Effort:** 2 hours  
**Dependencies:** None

---

### 14. Soft Delete Implementation
**Issue:** Hard deletes are irreversible.

**Implementation:**
```python
# courses/models.py
class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

class Course(SoftDeleteModel):
    # ... fields
```

**Estimated Effort:** 4 hours (requires migration)  
**Dependencies:** None

---

## P3: Low Priority

### 15. API Versioning Strategy
**Issue:** No versioning mechanism in place.

**Options:**
- URL path: `/api/v1/`, `/api/v2/`
- Header: `Accept: application/json; version=1.0`
- Query param: `?version=1.0`

**Estimated Effort:** 3 hours  
**Dependencies:** None

---

### 16. Content Negotiation
**Issue:** Only JSON supported.

**Potential Additions:**
- CSV export for reports
- XML for legacy integrations
- YAML for configuration

**Estimated Effort:** 4 hours  
**Dependencies:** None

---

### 17. Webhook Support
**Issue:** No webhook system for event notifications.

**Use Cases:**
- Enrollment confirmation
- Course published
- Cohort starting soon

**Estimated Effort:** 6 hours  
**Dependencies:** Celery setup

---

### 18. GraphQL Support (Apollo/Strawberry)
**Issue:** REST-only limits frontend flexibility.

**Implementation:**
```python
# Install strawberry-graphql
pip install strawberry-django

# Create schema
import strawberry
from strawberry import auto

@strawberry.django.type(Course)
class CourseType:
    id: auto
    title: auto
    slug: auto
    price: auto
```

**Estimated Effort:** 8 hours  
**Dependencies:** None

---

## Implementation Timeline

### Week 1: Critical
- [ ] 1. JWT Authentication (2-3 days)
- [ ] 2. N+1 Query Fix (1 day)
- [ ] 3. Enrollment Logic (2 days)

### Week 2: High Priority
- [ ] 4. Rate Limiting (1 day)
- [ ] 5. Response Standardization (3 days)
- [ ] 6. Image Upload (4 days)

### Week 3: High/Medium
- [ ] 7. User Management (3 days)
- [ ] 8. Caching (2 days)
- [ ] 9. Testing Suite (ongoing)

### Week 4: Medium Priority
- [ ] 10. API Documentation (2 days)
- [ ] 11. Admin Fixes (1 day)
- [ ] 12. Request Logging (1 day)
- [ ] 13. Field Permissions (2 days)

### Week 5: Polish
- [ ] 14. Soft Delete (3 days)
- [ ] 15. Versioning (2 days)
- [ ] Performance testing and optimization

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Query Count (Course List) | < 5 queries | ~10+ queries |
| Response Time (p95) | < 200ms | Unknown |
| Test Coverage | > 80% | 0% |
| API Documentation | Interactive | Static markdown |
| Security Score | A+ | Not rated |
| Authentication Methods | JWT + Session | Session only |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking changes | Medium | High | Maintain backward compatibility |
| Performance degradation | Low | Medium | Load testing before deploy |
| Security vulnerabilities | Low | Critical | Security audit |
| Scope creep | High | Medium | Stick to priority matrix |

---

**Document Version:** 1.0.0  
**Next Review:** After Week 1 implementation  
**Owner:** Backend Development Team
