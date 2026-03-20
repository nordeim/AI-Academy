# AI Academy - Backend API Usage Guide

**Version:** 1.0.0  
**Last Updated:** March 20, 2026  
**Status:** Operational (Development Mode)

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Request/Response Examples](#requestresponse-examples)
6. [Filtering & Search](#filtering--search)
7. [Pagination](#pagination)
8. [Error Handling](#error-handling)
9. [Known Issues & Limitations](#known-issues--limitations)
10. [Best Practices](#best-practices)

---

## Overview

The AI Academy backend provides a RESTful API built with Django REST Framework (DRF). The API follows REST conventions and returns JSON responses.

### Base URL
```
Development: http://localhost:8000/api/v1/
Production:  https://api.aiacademy.com/api/v1/
```

### Supported HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT/PATCH` - Update resources
- `DELETE` - Remove resources

### Content Type
All requests should include:
```
Content-Type: application/json
```

---

## Base Configuration

### Current Settings (backend/academy/settings/base.py)

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",  # ⚠️ Not fully configured
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}
```

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React dev server (if used)
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # Vite dev server
]
```

**Note:** Development settings use `CORS_ALLOW_ALL_ORIGINS = True`

---

## Authentication

### JWT Token Authentication (Fully Operational) ✅

The API uses **JWT (JSON Web Token)** authentication via `djangorestframework-simplejwt`.

#### Token Lifetimes
- **Access Token:** 30 minutes
- **Refresh Token:** 7 days (with rotation and blacklist)

### Obtain Token Pair
```http
POST /api/v1/auth/token/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Refresh Access Token
```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Verify Token
```http
POST /api/v1/auth/token/verify/
Content-Type: application/json

{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Using Tokens
All protected endpoints require the access token in the Authorization header:

```http
GET /api/v1/enrollments/
Authorization: Bearer <access_token>
```

### Session Authentication (Admin Only)
For Django admin and browsable API:
```bash
# Login via Django admin
POST /admin/login/
```

---

## API Endpoints Reference

### 1. Courses

#### List All Courses
```http
GET /api/v1/courses/
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `level` | string | Filter by difficulty | `?level=intermediate` |
| `categories__slug` | string | Filter by category | `?categories__slug=ai-engineering` |
| `search` | string | Search title/subtitle/description | `?search=machine learning` |
| `ordering` | string | Sort results | `?ordering=-price` (descending) |
| `featured` | boolean | Featured courses only | `?featured=true` |

**Response (200 OK):**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "81ef745e-1d38-4c49-9cd2-f53f7f434d79",
      "slug": "ai-engineering-bootcamp",
      "title": "AI Engineering Bootcamp",
      "subtitle": "Master production-grade AI development",
      "thumbnail": null,
      "thumbnail_alt": "",
      "categories": [
        {
          "id": 1,
          "name": "AI Engineering",
          "slug": "ai-engineering",
          "description": "",
          "color": "#4f46e5",
          "icon": "Cpu",
          "course_count": 1
        }
      ],
      "level": "intermediate",
      "modules_count": 12,
      "duration_weeks": 8,
      "price": "2499.00",
      "original_price": null,
      "discount_percentage": 0,
      "currency": "USD",
      "rating": "4.8",
      "review_count": 127,
      "enrolled_count": 89,
      "is_featured": true
    }
  ]
}
```

#### Get Course Detail
```http
GET /api/v1/courses/{slug}/
```

**Response (200 OK):**
```json
{
  "id": "81ef745e-1d38-4c49-9cd2-f53f7f434d79",
  "slug": "ai-engineering-bootcamp",
  "title": "AI Engineering Bootcamp",
  "subtitle": "Master production-grade AI development",
  "description": "A comprehensive bootcamp covering transformer architectures...",
  "thumbnail": null,
  "thumbnail_alt": "",
  "categories": [...],
  "level": "intermediate",
  "modules_count": 12,
  "duration_weeks": 8,
  "duration_hours": 40,
  "price": "2499.00",
  "original_price": null,
  "discount_percentage": 0,
  "currency": "USD",
  "rating": "4.8",
  "review_count": 127,
  "enrolled_count": 89,
  "meta_title": "",
  "meta_description": "",
  "created_at": "2026-03-20T12:00:00Z",
  "updated_at": "2026-03-20T12:00:00Z"
}
```

#### Get Course Cohorts (Custom Action)
```http
GET /api/v1/courses/{slug}/cohorts/
```

**Response (200 OK):**
```json
[
  {
    "id": "ac467ab2-fc48-4609-9a71-9706080e08a7",
    "course_title": "AI Engineering Bootcamp",
    "course_slug": "ai-engineering-bootcamp",
    "start_date": "2026-04-19",
    "end_date": "2026-06-14",
    "timezone": "EST",
    "format": "online",
    "location": "",
    "instructor_name": "Jane Smith",
    "spots_total": 50,
    "spots_remaining": 38,
    "availability_status": "available",
    "early_bird_price": null,
    "early_bird_deadline": null,
    "status": "enrolling"
  }
]
```

⚠️ **Note:** This endpoint returns an array directly, not a paginated response.

---

### 2. Categories

#### List All Categories
```http
GET /api/v1/categories/
```

**Response (200 OK):**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "AI Engineering",
      "slug": "ai-engineering",
      "description": "",
      "color": "#4f46e5",
      "icon": "Cpu",
      "course_count": 1
    }
  ]
}
```

#### Get Category Detail
```http
GET /api/v1/categories/{slug}/
```

---

### 3. Cohorts

#### List All Cohorts
```http
GET /api/v1/cohorts/
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `course` | uuid | Filter by course ID | `?course=81ef745e-...` |
| `format` | string | Format type | `?format=online` |
| `status` | string | Cohort status | `?status=enrolling` |
| `ordering` | string | Sort by date | `?ordering=start_date` |

**Response (200 OK):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "ac467ab2-fc48-4609-9a71-9706080e08a7",
      "course_title": "AI Engineering Bootcamp",
      "course_slug": "ai-engineering-bootcamp",
      "start_date": "2026-04-19",
      "end_date": "2026-06-14",
      "timezone": "EST",
      "format": "online",
      "location": "",
      "instructor_name": "Jane Smith",
      "spots_total": 50,
      "spots_remaining": 38,
      "availability_status": "available",
      "early_bird_price": null,
      "early_bird_deadline": null,
      "status": "enrolling"
    }
  ]
}
```

#### Get Cohort Detail
```http
GET /api/v1/cohorts/{id}/
```

---

### 4. Enrollments (Authenticated Only)

#### List User Enrollments
```http
GET /api/v1/enrollments/
Authorization: Bearer <token>  # ⚠️ Not yet implemented
```

**Response (200 OK):**
```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

#### Create Enrollment
```http
POST /api/v1/enrollments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "course": "81ef745e-1d38-4c49-9cd2-f53f7f434d79",
  "cohort": "ac467ab2-fc48-4609-9a71-9706080e08a7",
  "amount_paid": "2499.00"
}
```

**Business Logic Implemented:**
- ✅ **Capacity Validation:** Returns 400 if cohort is full
- ✅ **Duplicate Prevention:** Returns 400 if already enrolled
- ✅ **Spot Reservation:** Increments `cohort.spots_reserved` atomically
- ✅ **Transaction Safety:** All operations wrapped in `@transaction.atomic`
- ✅ **Status Workflow:** New enrollments start as 'pending'
- ⏳ **Payment Integration:** Stripe integration planned (not yet implemented)

#### Cancel Enrollment
```http
POST /api/v1/enrollments/{id}/cancel/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "enrollment cancelled"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Cannot cancel this enrollment"
}
```

---

### 5. Admin Interface

```http
GET /admin/
```

**Authentication:** Session-based (requires superuser)

---

## Request/Response Examples

### Example 1: Search Courses
```bash
curl -X GET "http://localhost:8000/api/v1/courses/?search=AI&ordering=-rating" \
  -H "Content-Type: application/json"
```

### Example 2: Filter by Level and Category
```bash
curl -X GET "http://localhost:8000/api/v1/courses/?level=intermediate&categories__slug=ai-engineering" \
  -H "Content-Type: application/json"
```

### Example 3: Get Upcoming Cohorts for a Course
```bash
curl -X GET "http://localhost:8000/api/v1/courses/ai-engineering-bootcamp/cohorts/" \
  -H "Content-Type: application/json"
```

---

## Filtering & Search

### Available Filters by Endpoint

| Endpoint | Filters |
|----------|---------|
| `/courses/` | `level`, `categories__slug` |
| `/courses/` | `?featured=true` (custom query param) |
| `/cohorts/` | `course`, `format`, `status` |
| All List | `?search=<term>` (search filter) |
| All List | `?ordering=<field>` (ordering filter) |

### Ordering Fields

**Courses:**
- `price`, `-price` (ascending/descending)
- `rating`, `-rating`
- `created_at`, `-created_at`
- `enrolled_count`, `-enrolled_count`

**Cohorts:**
- `start_date`, `-start_date`

### Search Scope

The `?search=` parameter searches across:
- Course: `title`, `subtitle`, `description`

---

## Pagination

### Default Behavior
- **Page Size:** 20 items per page
- **Style:** PageNumberPagination

### Response Format
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/v1/courses/?page=2",
  "previous": null,
  "results": [...]
}
```

### Query Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number | `?page=2` |
| `page_size` | Items per page (if allowed) | `?page_size=50` |

### Non-Paginated Endpoints
⚠️ The following endpoints return arrays directly (no pagination):
- `GET /api/v1/courses/{slug}/cohorts/`

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Typical Causes |
|------|---------|----------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid data, validation errors |
| 401 | Unauthorized | Missing/invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unhandled exception |

### Error Response Format

**Validation Errors (400):**
```json
{
  "field_name": [
    "Error message for this field"
  ],
  "non_field_errors": [
    "General error message"
  ]
}
```

**Authentication Errors (401/403):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Not Found (404):**
```json
{
  "detail": "Not found."
}
```

---

## Known Issues & Limitations

### Critical Issues

| Issue | Impact | Workaround |
|-------|--------|------------|
| **JWT Not Implemented** | Cannot authenticate API requests | Use session auth in browser, implement JWT |
| **N+1 Query Problem** | Slow performance on nested serializers | Use `select_related`/`prefetch_related` |
| **No Throttling** | Vulnerable to abuse | Add REST_FRAMEWORK throttle settings |

### API Design Issues (FIXED)

| Issue | Status | Description | Priority |
|-------|--------|-------------|----------|
| **Inconsistent Pagination** | ✅ FIXED | `/cohorts/` action returns array, not paginated | High |
| **Missing Error Format** | ✅ FIXED | Standardized error responses with serializers | Medium |
| **No API Versioning** | ⏳ PENDING | Only URL path versioning implemented | Low |
| **Missing Endpoints** | ⏳ PENDING | User registration, password reset, profile endpoints | High |

### Security Concerns

| Issue | Status | Description | Priority |
|-------|--------|-------------|----------|
| **No Rate Limiting** | ⏳ PENDING | API vulnerable to brute force | High |
| **CORS Wide Open** | ✅ ACCEPTABLE | Dev settings allow all origins (expected in development) | Medium |
| **No Request Logging** | ⏳ PENDING | Cannot audit API usage | Low |
| **Missing Permissions** | ✅ FIXED | Enrollment create now has business logic | High |

### Performance Issues (FIXED)

| Issue | Status | Before | After | Solution |
|-------|--------|--------|-------|----------|
| **N+1 Queries** | ✅ FIXED | 17 queries | 3 queries | Added `prefetch_related('categories')` to CourseViewSet |
| **Cohort N+1** | ✅ FIXED | 12 queries | 2 queries | Added `select_related('course', 'instructor')` |
| **No Caching** | ⏳ PENDING | - | - | Redis caching implementation planned |
| **Large Payloads** | ⏳ PENDING | - | - | Field filtering (?fields=) planned |

---

## Best Practices

### For Frontend Developers

1. **Cache Category Data**: Categories change infrequently, cache them locally
2. **Use Pagination**: Always handle `next` and `previous` URLs
3. **Handle Errors Gracefully**: Implement retry logic for 500 errors
4. **Debounce Search**: Wait 300ms before sending search requests
5. **Optimistic Updates**: Update UI before API confirmation for better UX

### For API Consumers

1. **Use Query Parameters**: Filter on server, not client
2. **Request Only Needed Fields**: Consider implementing `?fields=` parameter
3. **Respect Rate Limits**: Implement exponential backoff
4. **Handle Partial Failures**: Some endpoints may succeed while others fail

### Authentication (Future)

```javascript
// Store tokens securely (not localStorage for production)
const tokens = {
  access: sessionStorage.getItem('access_token'),
  refresh: sessionStorage.getItem('refresh_token')
};

// Add to request headers
fetch('/api/v1/enrollments/', {
  headers: {
    'Authorization': `Bearer ${tokens.access}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Appendix: Data Models

### Course Model Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | Slug | URL-friendly identifier |
| `title` | Char(200) | Course title |
| `subtitle` | Char(300) | Short description |
| `description` | Text | Full description |
| `level` | Choice | beginner/intermediate/advanced |
| `status` | Choice | draft/published/archived |
| `price` | Decimal | Current price |
| `original_price` | Decimal | Strikethrough price |
| `rating` | Decimal(2,1) | Average rating |
| `enrolled_count` | Integer | Total enrollments |
| `is_featured` | Boolean | Featured on homepage |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last modified |

### Cohort Model Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `course` | FK | Related course |
| `start_date` | Date | Cohort start |
| `end_date` | Date | Cohort end |
| `format` | Choice | online/in_person/hybrid |
| `instructor` | FK | Teaching user |
| `spots_total` | Integer | Maximum capacity |
| `spots_reserved` | Integer | Currently enrolled |
| `status` | Choice | upcoming/enrolling/etc. |

### Enrollment Model Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user` | FK | Enrolled student |
| `course` | FK | Enrolled course |
| `cohort` | FK | Specific cohort |
| `amount_paid` | Decimal | Payment amount |
| `status` | Choice | pending/confirmed/etc. |
| `created_at` | DateTime | Enrollment time |

---

**Document Version:** 1.0.0  
**Next Review:** After JWT implementation  
**Questions?** Check ACCOMPLISHMENTS.md for troubleshooting
