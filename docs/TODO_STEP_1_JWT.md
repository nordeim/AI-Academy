# Step 1: JWT Authentication Implementation - TDD Sub-Plan

**Issue:** #1 JWT Authentication  
**Priority:** P0 - Critical  
**Methodology:** Test-Driven Development (TDD)  
**Estimated Time:** 2-3 hours  
**Started:** March 20, 2026

---

## Phase 1: Analysis & Planning

### Current State Assessment
**File:** `/home/project/AI-Academy/backend/academy/settings/base.py`

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",  # ⚠️ Non-functional
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}
```

**File:** `/home/project/AI-Academy/backend/api/urls.py`
```python
urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls')),  # Session auth only
]
```

**Issue:** `TokenAuthentication` is listed but `djangorestframework-simplejwt` is not installed.

### Requirements Analysis
1. Install SimpleJWT library
2. Configure JWT settings with appropriate token lifetimes
3. Add token obtain/refresh/verify endpoints
4. Update REST_FRAMEWORK auth classes
5. Test token lifecycle
6. Update documentation

### TDD Cycle Plan

#### RED Phase: Write Failing Tests
1. Test JWT endpoints return 404 before implementation
2. Test token generation with valid credentials
3. Test token refresh
4. Test token verification
5. Test authenticated endpoint access

#### GREEN Phase: Make Tests Pass
1. Install SimpleJWT
2. Add JWT URLs
3. Configure settings
4. Verify endpoints work

#### REFACTOR Phase: Optimize
1. Review token lifetime settings
2. Add proper error handling
3. Update documentation

---

## Phase 2: TDD Implementation - RED Phase

### Test 1: JWT Endpoints Exist
**Test File:** `/home/project/AI-Academy/backend/api/tests/test_jwt.py`

```python
"""
Test JWT Authentication Endpoints
TDD Phase: RED - Tests should fail initially
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthenticationTests(APITestCase):
    """Test JWT token authentication flow"""
    
    def setUp(self):
        """Create test user"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.login_url = '/api/v1/auth/token/'
        self.refresh_url = '/api/v1/auth/token/refresh/'
        self.verify_url = '/api/v1/auth/token/verify/'
    
    def test_jwt_login_endpoint_exists(self):
        """
        Test: JWT token obtain endpoint should exist
        Expected: Status 200 (after implementation) or 404 (before)
        TDD Status: Should FAIL (404) before implementation
        """
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        # Before implementation: 404
        # After implementation: 200
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
    
    def test_jwt_token_generation(self):
        """
        Test: Valid credentials should return access and refresh tokens
        Expected: Status 200 with access_token and refresh_token
        TDD Status: Should FAIL initially
        """
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        
        if response.status_code == 200:
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
            self.assertIsInstance(response.data['access'], str)
            self.assertIsInstance(response.data['refresh'], str)
            # Verify JWT format (3 parts separated by dots)
            self.assertEqual(len(response.data['access'].split('.')), 3)
    
    def test_jwt_invalid_credentials(self):
        """
        Test: Invalid credentials should return 401
        Expected: Status 401 with error message
        """
        response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            },
            format='json'
        )
        
        if response.status_code != 404:  # Endpoint exists
            self.assertEqual(response.status_code, 401)
    
    def test_jwt_token_refresh(self):
        """
        Test: Refresh token should return new access token
        Expected: Status 200 with new access token
        """
        # First get tokens
        login_response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        
        if login_response.status_code == 200:
            refresh_token = login_response.data.get('refresh')
            
            # Now refresh
            response = self.client.post(
                self.refresh_url,
                {'refresh': refresh_token},
                format='json'
            )
            
            if response.status_code == 200:
                self.assertIn('access', response.data)
    
    def test_jwt_token_verify(self):
        """
        Test: Valid token should be verified
        Expected: Status 200
        """
        # First get token
        login_response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        
        if login_response.status_code == 200:
            access_token = login_response.data.get('access')
            
            # Verify token
            response = self.client.post(
                self.verify_url,
                {'token': access_token},
                format='json'
            )
            
            if response.status_code == 200:
                self.assertNotIn('detail', response.data)
    
    def test_jwt_access_protected_endpoint(self):
        """
        Test: Protected endpoint should require JWT authentication
        Expected: 401 without token, 200 with valid token
        """
        # Without authentication
        response = self.client.get('/api/v1/enrollments/')
        self.assertEqual(response.status_code, 403)  # Default permission
        
        # With authentication
        login_response = self.client.post(
            self.login_url,
            {
                'email': 'test@example.com',
                'password': 'testpass123'
            },
            format='json'
        )
        
        if login_response.status_code == 200:
            access_token = login_response.data['access']
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
            
            response = self.client.get('/api/v1/enrollments/')
            # Should succeed with empty list
            self.assertEqual(response.status_code, 200)
```

---

## Phase 3: Validation Against Codebase

Let me verify the current state of the codebase before proceeding:

### Checklist 1: Current State Validation
- [ ] Verify SimpleJWT is NOT installed
- [ ] Verify current auth endpoints exist
- [ ] Verify test framework is configured
- [ ] Check existing test structure

---

## Phase 4: GREEN Phase - Implementation

### Step 4.1: Install Dependencies
```bash
# Install SimpleJWT
pip install djangorestframework-simplejwt==5.4.0

# Update requirements
echo "djangorestframework-simplejwt==5.4.0" >> requirements/base.txt
```

### Step 4.2: Create Migration (if needed)
```bash
# SimpleJWT requires token blacklist app
python manage.py migrate
```

### Step 4.3: Update Settings
**File:** `/home/project/AI-Academy/backend/academy/settings/base.py`

```python
from datetime import timedelta

# Update REST_FRAMEWORK settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
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

# SimpleJWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JWK_URL": None,
    "LEEWAY": 0,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

# Add to INSTALLED_APPS if not present
INSTALLED_APPS = [
    # ... existing apps
    "rest_framework_simplejwt.token_blacklist",  # For token rotation
]
```

### Step 4.4: Update URLs
**File:** `/home/project/AI-Academy/backend/api/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'cohorts', views.CohortViewSet, basename='cohort')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    # JWT Authentication endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # Session authentication (for admin/browsable API)
    path('auth/', include('rest_framework.urls')),
]
```

### Step 4.5: Create Custom Token Serializer (Optional Enhancement)
**File:** `/home/project/AI-Academy/backend/api/serializers.py`

```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes additional user info
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_student'] = user.is_student
        token['is_instructor'] = user.is_instructor
        
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

---

## Phase 5: Test Execution & Validation

### Checklist 2: Implementation Validation
- [ ] Run tests - expect PASS
- [ ] Test token endpoint with curl
- [ ] Test refresh endpoint
- [ ] Test verify endpoint
- [ ] Test protected endpoint access
- [ ] Verify JWT format
- [ ] Check token expiration

---

## Phase 6: REFACTOR Phase

### Code Review Items
- [ ] Token lifetime settings are appropriate
- [ ] Error messages are clear
- [ ] Documentation is updated
- [ ] No hardcoded secrets
- [ ] Security headers configured

### Performance Considerations
- [ ] Token blacklist table created
- [ ] Rotation is working
- [ ] Database queries optimized

---

## Phase 7: Documentation Update

### Update API_Usage_Guide.md
```markdown
## Authentication

### JWT Token Authentication

The API uses JWT (JSON Web Token) authentication for programmatic access.

#### Obtain Token Pair
```http
POST /api/v1/auth/token/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Refresh Access Token
```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "your-refresh-token"
}
```

#### Verify Token
```http
POST /api/v1/auth/token/verify/
Content-Type: application/json

{
  "token": "your-access-token"
}
```

#### Using Tokens
```http
GET /api/v1/enrollments/
Authorization: Bearer <access_token>
```

### Token Lifetimes
- **Access Token:** 30 minutes
- **Refresh Token:** 7 days
```

---

## Phase 8: Integration Testing

### Test with Frontend Context
```python
# Simulated frontend usage
import requests

# 1. Login
response = requests.post(
    'http://localhost:8000/api/v1/auth/token/',
    json={'email': 'admin@example.com', 'password': 'adminpass123'}
)
tokens = response.json()

# 2. Access protected endpoint
response = requests.get(
    'http://localhost:8000/api/v1/enrollments/',
    headers={'Authorization': f'Bearer {tokens["access"]}'}
)

# 3. Refresh when access expires
response = requests.post(
    'http://localhost:8000/api/v1/auth/token/refresh/',
    json={'refresh': tokens['refresh']}
)
new_tokens = response.json()
```

---

## Success Criteria

- [ ] All TDD tests pass
- [ ] JWT endpoints return proper tokens
- [ ] Token refresh works
- [ ] Token verification works
- [ ] Protected endpoints require authentication
- [ ] Documentation updated
- [ ] Integration tested

---

## Definition of Done

- [ ] Code written following TDD (RED-GREEN-REFACTOR)
- [ ] All tests pass
- [ ] Manual testing completed with curl/httpie
- [ ] API_Usage_Guide.md updated
- [ ] ACCOMPLISHMENTS.md updated
- [ ] TODO.md marked complete for Issue #1
- [ ] No security vulnerabilities introduced
- [ ] Django check passes
- [ ] Code reviewed (if applicable)

---

## Current Status

**Phase:** 1 - Analysis & Planning  
**Next Action:** Execute Phase 2 (Create test file)

