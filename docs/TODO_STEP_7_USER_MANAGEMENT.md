# Step 7: User Management Endpoints - TDD Implementation Plan

**Status:** Planning Complete | **Priority:** P1 - High | **Estimated Effort:** 4 hours

---

## Executive Summary

Implement comprehensive user management endpoints for user registration, profile management, and password reset functionality using Test-Driven Development methodology.

---

## Required Endpoints

### Authentication Endpoints
1. **POST `/api/v1/auth/register/`** - User registration
2. **POST `/api/v1/auth/password-reset/`** - Request password reset
3. **POST `/api/v1/auth/password-reset/confirm/`** - Confirm password reset

### User Profile Endpoints
4. **GET `/api/v1/users/me/`** - Retrieve current user profile
5. **PATCH `/api/v1/users/me/`** - Update user profile

---

## TDD Implementation Phases

### Phase 1: RED - Write Failing Tests
**Objective:** Create comprehensive tests that define expected behavior before implementation

#### Test Cases:

**User Registration Tests:**
1. **Test Valid Registration**
   - POST with valid email, password, first_name, last_name
   - Verify 201 Created status
   - Verify user created in database
   - Verify password hashed (not plain text)
   - Verify standardized response format

2. **Test Duplicate Email**
   - Attempt registration with existing email
   - Verify 400 Bad Request
   - Verify appropriate error message

3. **Test Duplicate Username**
   - Attempt registration with existing username
   - Verify 400 Bad Request

4. **Test Weak Password**
   - Attempt registration with short password (< 8 chars)
   - Verify validation error

5. **Test Missing Required Fields**
   - POST without email, password, or name
   - Verify validation errors for each missing field

6. **Test Invalid Email Format**
   - POST with malformed email
   - Verify email validation error

**User Profile Tests:**
7. **Test Get Current User Profile**
   - GET /users/me/ with valid token
   - Verify 200 OK
   - Verify response contains user data (email, name, avatar_url, etc.)
   - Verify sensitive data excluded (password_hash, is_staff, etc.)

8. **Test Get Profile Without Auth**
   - GET without authentication
   - Verify 401 Unauthorized

9. **Test Update Profile**
   - PATCH with valid data (first_name, last_name, bio, phone, company, title)
   - Verify 200 OK
   - Verify data updated in database

10. **Test Update Email**
    - PATCH with new email
    - Verify email changed (if allowed) or validation error

11. **Test Update Read-Only Fields**
    - Attempt to PATCH is_staff, is_superuser, date_joined
    - Verify these fields not updated

**Password Reset Tests:**
12. **Test Password Reset Request**
    - POST with valid email
    - Verify 200 OK (even if email doesn't exist - security)
    - Verify reset token/token generated (implementation dependent)

13. **Test Password Reset Request Nonexistent Email**
    - POST with non-existent email
    - Verify 200 OK (don't reveal user existence)

14. **Test Password Reset Confirm**
    - POST with valid token and new password
    - Verify 200 OK
    - Verify password changed
    - Verify can login with new password

15. **Test Password Reset Invalid Token**
    - POST with invalid/expired token
    - Verify 400 Bad Request

16. **Test Password Reset Weak Password**
    - POST with valid token but weak password
    - Verify validation error

**Security Tests:**
17. **Test Registration Rate Limiting**
    - Multiple registration attempts from same IP
    - Verify throttling applied

18. **Test Password Reset Rate Limiting**
    - Multiple reset requests for same email
    - Verify throttling applied

19. **Test Profile Access Other Users**
    - Attempt to access /users/{other_user_id}/
    - Verify 404 or permission denied

20. **Test Update Other User Profile**
    - Attempt to PATCH another user's data
    - Verify not allowed

**Files to Create:**
- `/backend/api/tests/test_user_management.py` - 20+ comprehensive tests

---

### Phase 2: GREEN - Make Tests Pass
**Objective:** Implement minimal code to satisfy all test requirements

#### Implementation Steps:

1. **Create User Serializers**
   - `/backend/api/serializers.py` additions:
     - `UserCreateSerializer` - For registration
     - `UserProfileSerializer` - For profile get/update
     - `PasswordResetRequestSerializer`
     - `PasswordResetConfirmSerializer`

2. **Create Registration View**
   - `/backend/api/views.py` - `RegisterView` class
   - AllowAny permission
   - Validation and user creation

3. **Create User ViewSet**
   - `/backend/api/views.py` - `UserViewSet` with `me` action
   - GET and PATCH methods
   - IsAuthenticated permission

4. **Create Password Reset Views**
   - `/backend/api/views.py` - `PasswordResetRequestView`
   - `/backend/api/views.py` - `PasswordResetConfirmView`
   - Token generation and validation

5. **Add URL Routes**
   - `/backend/api/urls.py` - Registration endpoint
   - `/backend/api/urls.py` - Password reset endpoints
   - `/backend/api/urls.py` - User profile endpoints

6. **Add Rate Limiting**
   - Configure throttling for registration
   - Configure throttling for password reset

7. **Email Configuration** (if needed)
   - Configure email backend for password reset emails
   - Create email templates

**Key Implementation Details:**

```python
# User Registration
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return SuccessResponse(
            data={"user_id": str(user.id)},
            status=201,
            message="User registered successfully"
        )

# User Profile
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return SuccessResponse(data=serializer.data)
        else:
            serializer = self.get_serializer(
                request.user, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return SuccessResponse(data=serializer.data)
```

---

### Phase 3: REFACTOR - Optimize & Polish
**Objective:** Improve code quality, performance, and maintainability

#### Refactoring Tasks:

1. **Code Organization**
   - Extract user-related views to separate module if file too large
   - Create user service layer for business logic
   - Add type hints throughout

2. **Security Hardening**
   - Add password strength validation
   - Implement email verification (optional)
   - Add account lockout after failed attempts (optional)

3. **Documentation**
   - Add docstrings to all new classes/functions
   - Update API_Usage_Guide.md with examples

4. **Testing**
   - Ensure edge cases covered
   - Verify no regressions in existing tests

---

## Success Criteria

✅ All 20+ tests pass  
✅ User registration works with validation  
✅ Duplicate email/username detection  
✅ Password strength validation  
✅ Current user profile endpoint works  
✅ Profile update with PATCH works  
✅ Password reset request works  
✅ Password reset confirmation works  
✅ Rate limiting applied to sensitive endpoints  
✅ Sensitive fields excluded from responses  
✅ Standardized response format for all endpoints  
✅ Documentation updated with examples  

---

## Implementation Checklist

### Phase 1: Tests
- [ ] Create `/backend/api/tests/test_user_management.py`
- [ ] Write test for valid registration
- [ ] Write test for duplicate email
- [ ] Write test for duplicate username
- [ ] Write test for weak password
- [ ] Write test for missing required fields
- [ ] Write test for invalid email
- [ ] Write test for get profile
- [ ] Write test for get profile without auth
- [ ] Write test for update profile
- [ ] Write test for update read-only fields
- [ ] Write test for password reset request
- [ ] Write test for password reset nonexistent email
- [ ] Write test for password reset confirm
- [ ] Write test for password reset invalid token
- [ ] Write test for registration rate limiting
- [ ] Write test for password reset rate limiting
- [ ] Run tests to confirm they all FAIL (RED phase complete)

### Phase 2: Implementation
- [ ] Create user serializers (`UserCreateSerializer`, `UserProfileSerializer`)
- [ ] Create password reset serializers
- [ ] Create `RegisterView` in `views.py`
- [ ] Create `UserViewSet` with `me` action
- [ ] Create password reset views
- [ ] Add URL routes
- [ ] Configure rate limiting
- [ ] Run tests to confirm they all PASS (GREEN phase complete)

### Phase 3: Refactoring
- [ ] Add comprehensive docstrings
- [ ] Optimize queries
- [ ] Handle edge cases
- [ ] Run full test suite to ensure no regressions
- [ ] Run lint/typecheck (RED phase complete)

### Phase 4: Documentation
- [ ] Update `/home/project/AI-Academy/API_Usage_Guide.md`
- [ ] Update `/home/project/AI-Academy/ACCOMPLISHMENTS.md`
- [ ] Update `/home/project/AI-Academy/TODO.md`
- [ ] Update `/home/project/AI-Academy/AGENTS.md`

---

## Files Modified/Created

### New Files:
1. `/backend/api/tests/test_user_management.py` - Test suite (20+ tests)

### Modified Files:
1. `/backend/api/serializers.py` - Add user serializers
2. `/backend/api/views.py` - Add registration, profile, password reset views
3. `/backend/api/urls.py` - Add user management routes
4. `/backend/academy/settings/base.py` - Configure rate limiting (if needed)
5. `/home/project/AI-Academy/API_Usage_Guide.md` - Document new endpoints
6. `/home/project/AI-Academy/ACCOMPLISHMENTS.md` - Add milestone
7. `/home/project/AI-Academy/TODO.md` - Mark complete
8. `/home/project/AI-Academy/AGENTS.md` - Update current state

---

## Dependencies

**No new packages required.** Uses existing DRF and Django infrastructure.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Security vulnerabilities in registration | Low | Critical | Input validation, rate limiting, password strength |
| Email delivery issues | Medium | Medium | Configurable email backend, console fallback |
| Breaking existing user model | Low | High | Migration safety, backward compatibility |
| Password reset token exposure | Low | Critical | Time-limited tokens, secure storage |

---

**Ready to proceed with Phase 1: RED - Writing Failing Tests**
