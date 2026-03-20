# AI Academy - Implementation ToDo List

**Last Updated:** March 20, 2026  
**Priority:** P0 (Critical) → P3 (Low)

---

## Legend

- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

---

## P0: Critical (Must Fix)

### Issue #1: JWT Authentication Implementation
**Priority:** P0 | **Effort:** 2-3 hours | **Risk:** Low

- [ ] Install djangorestframework-simplejwt
  ```bash
  pip install djangorestframework-simplejwt==5.4.0
  ```
- [ ] Update `backend/requirements/base.txt`
- [ ] Configure SIMPLE_JWT settings in `academy/settings/base.py`
- [ ] Add JWT authentication URLs to `api/urls.py`
  - [ ] Token obtain endpoint (`/api/v1/auth/token/`)
  - [ ] Token refresh endpoint (`/api/v1/auth/token/refresh/`)
  - [ ] Token verify endpoint (`/api/v1/auth/token/verify/`)
- [ ] Update REST_FRAMEWORK auth classes
- [ ] Test token generation/refresh
- [ ] Update `API_Usage_Guide.md` with authentication examples
- [ ] Add authentication to POSTMAN/curl examples

**Dependencies:** None  
**Blockers:** None

---

### Issue #2: N+1 Query Optimization
**Priority:** P0 | **Effort:** 1 hour | **Risk:** None

- [ ] Add `prefetch_related('categories')` to CourseViewSet queryset
- [ ] Add `select_related('course', 'instructor')` to CohortViewSet queryset
- [ ] Verify with Django Debug Toolbar
- [ ] Document query count improvement in ACCOMPLISHMENTS.md

**Dependencies:** None  
**Blockers:** None

---

### Issue #3: Enrollment Business Logic
**Priority:** P0 | **Effort:** 2 hours | **Risk:** Medium

- [ ] Add capacity validation in EnrollmentViewSet.perform_create()
- [ ] Add duplicate enrollment check
- [ ] Implement spots_reserved increment logic
- [ ] Add proper error handling with ValidationError
- [ ] Create enrollment workflow state machine
- [ ] Add cancellation business logic
- [ ] Write unit tests for enrollment edge cases

**Dependencies:** Issue #1 (JWT)  
**Blockers:** None

---

## P1: High Priority

### Issue #4: API Rate Limiting
**Priority:** P1 | **Effort:** 30 min | **Risk:** None

- [ ] Add DEFAULT_THROTTLE_CLASSES to REST_FRAMEWORK settings
- [ ] Configure throttle rates for anon/user
- [ ] Add custom throttle for enrollment operations
- [ ] Test rate limiting with curl/Postman
- [ ] Document rate limits in API_Usage_Guide.md

**Dependencies:** None  
**Blockers:** None

---

### Issue #5: Response Standardization ✅ COMPLETED
**Priority:** P1 | **Effort:** 3-4 hours | **Status:** COMPLETED with TDD

- [x] Create standardized response wrapper classes (`api/responses.py`)
- [x] Create custom exception handler (`api/exceptions.py`)
- [x] Create request ID middleware (`api/middleware.py`)
- [x] Refactor CourseViewSet responses (using ResponseFormatterMixin)
- [x] Refactor CohortViewSet responses (using ResponseFormatterMixin)
- [x] Refactor EnrollmentViewSet responses (using ResponseFormatterMixin)
- [x] Refactor CategoryViewSet responses (using ResponseFormatterMixin)
- [x] Write comprehensive test suite (17 tests, all passing)
- [x] Update API documentation (`API_Usage_Guide.md`)

**Standard Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "errors": {},
  "meta": {
    "timestamp": "ISO8601",
    "request_id": "uuid",
    "pagination": { ... }
  }
}
```

**Test Results:** ✅ 17/17 tests passing
**Files Created:** `responses.py`, `exceptions.py`, `middleware.py`, `tests/test_response_standardization.py`
**Files Modified:** `views.py`, `settings/base.py`, `urls.py`

**Dependencies:** None
**Blockers:** None

---

### Issue #6: Image Upload Support ✅ COMPLETED
**Priority:** P1 | **Effort:** 4-6 hours | **Status:** COMPLETED with TDD

- [x] Configure MinIO/S3 storage backend (django-storages, boto3)
- [x] Create CourseThumbnailUploadView with MultiPartParser
- [x] Create UserAvatarUploadView with image processing
- [x] Implement image validation (format: JPG/PNG/WebP, size: max 10MB, dimensions)
- [x] Add image resizing and optimization (thumbnails: max 1920x1080, avatars: 400x400)
- [x] Add upload endpoints to urls.py
- [x] Write comprehensive test suite (23 tests, all passing)
- [x] Configure test storage (local filesystem override)

**Test Results:**
```
Ran 23 tests in 6.251s
OK

Coverage:
✅ Valid uploads (JPEG, PNG, WebP)
✅ Invalid format rejection (GIF, PDF, text, executables)
✅ Size validation (10MB limit)
✅ Dimension validation (min 300x200)
✅ Path traversal sanitization
✅ Unique filename generation with UUID
✅ Authentication requirements
✅ Standardized response format
```

**API Endpoints:**
- `POST /api/v1/courses/{slug}/thumbnail/` - Course thumbnail upload
- `POST /api/v1/users/me/avatar/` - User avatar upload

**Files Created:**
- `/backend/api/utils/images.py` - Image processing utilities
- `/backend/api/tests/test_image_upload.py` - Test suite (23 tests)

**Dependencies:** MinIO configuration
**Blockers:** None

---

### Issue #7: User Management Endpoints
**Priority:** P1 | **Effort:** 4 hours | **Risk:** Medium

- [ ] Create User registration endpoint
  - [ ] Create UserCreateSerializer
  - [ ] Add validation for unique email
  - [ ] Implement password hashing
- [ ] Create `/api/v1/users/me/` endpoint
  - [ ] GET - Retrieve current user profile
  - [ ] PATCH - Update user profile
- [ ] Create password reset flow
  - [ ] Request password reset endpoint
  - [ ] Password reset confirmation endpoint
- [ ] Add email sending functionality
- [ ] Test all endpoints

**Dependencies:** Issue #1 (JWT)  
**Blockers:** None

---

### Issue #8: Redis Caching
**Priority:** P1 | **Effort:** 3 hours | **Risk:** Low

- [ ] Add cache_page decorator to Course list endpoint
- [ ] Add cache_page decorator to Category list endpoint
- [ ] Implement manual caching for custom actions
- [ ] Configure cache timeout values
- [ ] Add cache invalidation on model save
- [ ] Test cache hit/miss with Redis CLI
- [ ] Document caching strategy

**Dependencies:** Redis configured (✅ Done)  
**Blockers:** None

---

## P2: Medium Priority

### Issue #9: Comprehensive Testing Suite
**Priority:** P2 | **Effort:** 8-12 hours | **Risk:** Low

- [ ] Set up pytest configuration
- [ ] Create test factories with factory-boy
- [ ] Write Course API tests
  - [ ] List endpoint
  - [ ] Detail endpoint
  - [ ] Filtering
  - [ ] Search
  - [ ] Ordering
- [ ] Write Cohort API tests
- [ ] Write Enrollment API tests
- [ ] Write Category API tests
- [ ] Write authentication tests
- [ ] Write user management tests
- [ ] Set up test database in Docker
- [ ] Achieve 80%+ coverage
- [ ] Configure CI pipeline for tests

**Dependencies:** None  
**Blockers:** None

---

### Issue #10: API Documentation (drf-spectacular)
**Priority:** P2 | **Effort:** 2 hours | **Risk:** None

- [ ] Install drf-spectacular
- [ ] Add to INSTALLED_APPS
- [ ] Configure SPECTACULAR_SETTINGS
- [ ] Add schema and docs URLs
- [ ] Add docstrings to all viewsets
- [ ] Add serializer field descriptions
- [ ] Customize schema generation
- [ ] Test Swagger UI at /api/v1/docs/
- [ ] Update README.md with docs link

**Dependencies:** None  
**Blockers:** None

---

### Issue #11: Admin Fieldset Corrections
**Priority:** P2 | **Effort:** 30 min | **Risk:** None

- [ ] Fix users/admin.py fieldset type error
  - [ ] Convert tuple to list
  - [ ] Test admin loads without errors
- [ ] Fix courses/admin.py short_description warning
  - [ ] Use decorator syntax instead
- [ ] Verify no LSP errors
- [ ] Run Django check --deploy

**Dependencies:** None  
**Blockers:** None

---

### Issue #12: Request Logging Middleware
**Priority:** P2 | **Effort:** 1 hour | **Risk:** None

- [ ] Create APILoggingMiddleware class
- [ ] Add to MIDDLEWARE in settings
- [ ] Configure logging format
- [ ] Add request/response logging
- [ ] Add performance timing
- [ ] Configure log rotation
- [ ] Test middleware with requests
- [ ] Document logging configuration

**Dependencies:** None  
**Blockers:** None

---

### Issue #13: Field-Level Permissions
**Priority:** P2 | **Effort:** 2 hours | **Risk:** Low

- [ ] Add conditional field exposure in serializers
- [ ] Hide sensitive fields from anonymous users
- [ ] Add role-based field filtering
- [ ] Update tests for field permissions
- [ ] Document field visibility rules

**Dependencies:** Issue #1 (JWT)  
**Blockers:** None

---

### Issue #14: Soft Delete
**Priority:** P2 | **Effort:** 4 hours | **Risk:** Medium

- [ ] Create SoftDeleteModel abstract base class
- [ ] Add is_deleted and deleted_at fields
- [ ] Override delete() method
- [ ] Update Course model to inherit from SoftDeleteModel
- [ ] Update Cohort model
- [ ] Update Category model
- [ ] Create custom manager that filters deleted
- [ ] Create migrations
- [ ] Update admin to show deleted items
- [ ] Test soft delete functionality

**Dependencies:** None  
**Blockers:** None

---

## P3: Low Priority

### Issue #15: API Versioning
**Priority:** P3 | **Effort:** 3 hours | **Risk:** Low

- [ ] Decide on versioning strategy
- [ ] Implement URL path versioning
- [ ] Create version 2 endpoints structure
- [ ] Add deprecation notices
- [ ] Document versioning policy
- [ ] Test backward compatibility

**Dependencies:** None  
**Blockers:** None

---

### Issue #16: Content Negotiation
**Priority:** P3 | **Effort:** 4 hours | **Risk:** Low

- [ ] Add CSV renderer for reports
- [ ] Add XML renderer
- [ ] Implement content type negotiation
- [ ] Test Accept header handling
- [ ] Document supported formats

**Dependencies:** None  
**Blockers:** None

---

### Issue #17: Webhook Support
**Priority:** P3 | **Effort:** 6 hours | **Risk:** Medium

- [ ] Create Webhook model
- [ ] Implement webhook delivery system
- [ ] Add retry logic with exponential backoff
- [ ] Create webhook UI in admin
- [ ] Implement events:
  - [ ] enrollment.created
  - [ ] course.published
  - [ ] cohort.starting_soon
- [ ] Test webhook delivery

**Dependencies:** Celery setup  
**Blockers:** None

---

### Issue #18: GraphQL Support
**Priority:** P3 | **Effort:** 8 hours | **Risk:** High

- [ ] Install strawberry-graphql
- [ ] Create GraphQL types for models
- [ ] Implement queries
- [ ] Implement mutations
- [ ] Add GraphQL endpoint
- [ ] Write GraphQL documentation
- [ ] Test with GraphQL Playground

**Dependencies:** None  
**Blockers:** None

---

## Quick Wins (Low Effort, High Value)

These can be done in parallel or during code review:

- [x] Add `load_dotenv()` to base.py (✅ Done)
- [ ] Add type hints to view functions
- [ ] Add docstrings to all classes/methods
- [ ] Add pre-commit hooks (black, flake8)
- [ ] Update .gitignore for Python/Django
- [ ] Add health check endpoint
- [ ] Add metrics endpoint (Prometheus)
- [ ] Configure Sentry for error tracking
- [ ] Add database connection pooling
- [ ] Optimize Docker image size

---

## Daily Standup Template

**Yesterday:**
- Completed: [Issue #X - description]

**Today:**
- Working on: [Issue #Y - description]
- Planned: [Issue #Z]

**Blockers:**
- [ ] Describe any blockers

**Notes:**
- Query count reduced from X to Y
- Response time improved by Z%
- New endpoint documented

---

## Definition of Done (DoD)

Before marking any task complete:

- [ ] Code written and tested locally
- [ ] Unit tests pass
- [ ] API documentation updated
- [ ] API_Usage_Guide.md updated (if applicable)
- [ ] No LSP errors/warnings
- [ ] Django check passes
- [ ] Manual testing completed
- [ ] Code reviewed (if required)
- [ ] Migrations created (if models changed)
- [ ] Sample data updated (if needed)

---

## Progress Tracker

| Week | Focus | Tasks Completed | Blockers |
|------|-------|-----------------|----------|
| Week 1 | P0 Critical | 0/3 | None |
| Week 2 | P1 High | 0/5 | None |
| Week 3 | P1/P2 Mix | 0/3 | None |
| Week 4 | P2 Medium | 0/6 | None |
| Week 5 | P3 + Polish | 0/4 | None |

---

## Resources

- **API Usage Guide:** See `API_Usage_Guide.md`
- **Remediation Plan:** See `REMEDIATION_PLAN.md`
- **Architecture Document:** See `Project_Architecture_Document.md`
- **Accomplishments:** See `ACCOMPLISHMENTS.md`

---

**Total Issues:** 18  
**Estimated Total Effort:** ~70-90 hours  
**Critical Path:** Issues #1 → #3 → #7  
**Sprint Planning Date:** TBD
