# Phase 6: User Authentication UI Plan

**Date:** March 21, 2026  
**Estimated Duration:** 6-7 hours  
**Approach:** TDD (Red-Green-Refactor)

---

## Goal
Implement complete user authentication UI flow including login, registration, password reset, and profile management. This phase connects the frontend auth store (created in Phase 2) with beautiful, functional UI components.

---

## Architecture Context

### Current State
- **Backend:** JWT authentication fully operational (SimpleJWT)
- **Auth Store:** Zustand store created in Phase 2 (`store/authStore.ts`)
- **API Services:** Auth API methods ready (`services/api/auth.ts`)
- **Frontend:** No auth UI components yet

### Target State
- Complete auth flow with protected routes
- Login page with form validation
- Registration page with email verification
- Password reset flow
- Profile page with edit capabilities
- Protected route wrapper

---

## Phase 6A: Login Page (Priority: P0)

### 6A.1: Create TDD Tests for LoginPage
**Duration:** 45 minutes  
**TDD:** Yes - Write failing tests first  
**Output:** Comprehensive test suite

**Test Coverage:**
- [ ] Renders login form with email/username and password fields
- [ ] Shows validation errors for empty fields
- [ ] Shows validation error for invalid email format
- [ ] Calls authStore.login() on form submission
- [ ] Shows loading state during login
- [ ] Displays error message on login failure
- [ ] Redirects to home/dashboard on successful login
- [ ] "Forgot password" link navigates to reset page
- [ ] "Sign up" link navigates to registration page
- [ ] Password visibility toggle works

**Test file:** `/frontend/src/pages/__tests__/LoginPage.test.tsx`

### 6A.2: Create LoginPage Component (GREEN Phase)
**Duration:** 1 hour  
**Output:** Full login page

**Features:**
- Email/username input
- Password input with visibility toggle
- "Remember me" checkbox
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Form validation with Zod
- Loading state with spinner
- Error display
- Redirect after successful login
- Responsive design

**File:** `/frontend/src/pages/LoginPage.tsx`

**Component Structure:**
```typescript
// Form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
});

// Form submission
const onSubmit = async (data: LoginFormData) => {
  await login(data.email, data.password);
  navigate(from, { replace: true });
};
```

---

## Phase 6B: Registration Page (Priority: P0)

### 6B.1: Create TDD Tests for RegisterPage
**Duration:** 45 minutes  
**TDD:** Yes - Write failing tests first

**Test Coverage:**
- [ ] Renders registration form with all fields
- [ ] Validates email format
- [ ] Validates password strength (min 8 chars)
- [ ] Validates password confirmation match
- [ ] Shows password strength indicator
- [ ] Calls authStore.register() on submission
- [ ] Shows loading state during registration
- [ ] Displays error on registration failure
- [ ] Shows success message and redirects
- [ ] Terms & conditions checkbox required
- [ ] "Already have an account? Sign in" link

**Test file:** `/frontend/src/pages/__tests__/RegisterPage.test.tsx`

### 6B.2: Create RegisterPage Component (GREEN Phase)
**Duration:** 1.5 hours  
**Output:** Full registration page

**Features:**
- Email input
- Username input
- Password input with strength indicator
- Confirm password input
- First name / Last name (optional)
- Terms & conditions checkbox
- Password strength meter
- Form validation with Zod
- Loading state
- Success message
- Error display
- Responsive design

**File:** `/frontend/src/pages/RegisterPage.tsx`

---

## Phase 6C: Password Reset Flow (Priority: P1)

### 6C.1: Create TDD Tests for ForgotPasswordPage
**Duration:** 30 minutes  
**TDD:** Yes - Write failing tests first

**Test Coverage:**
- [ ] Renders email input form
- [ ] Validates email format
- [ ] Calls password reset API
- [ ] Shows loading state
- [ ] Displays success message
- [ ] "Back to login" link works

**Test file:** `/frontend/src/pages/__tests__/ForgotPasswordPage.test.tsx`

### 6C.2: Create ForgotPasswordPage Component
**Duration:** 45 minutes  
**Output:** Password reset request page

**Features:**
- Email input
- Form validation
- Success message with instructions
- Back to login link
- Loading state

**File:** `/frontend/src/pages/ForgotPasswordPage.tsx`

### 6C.3: Create TDD Tests for ResetPasswordPage
**Duration:** 30 minutes  
**TDD:** Yes - Write failing tests first

**Test Coverage:**
- [ ] Renders password reset form
- [ ] Validates new password strength
- [ ] Validates password confirmation
- [ ] Submits reset with token from URL
- [ ] Shows success and redirects to login
- [ ] Handles invalid/expired tokens

**Test file:** `/frontend/src/pages/__tests__/ResetPasswordPage.test.tsx`

### 6C.4: Create ResetPasswordPage Component
**Duration:** 45 minutes  
**Output:** Password reset completion page

**Features:**
- New password input
- Confirm password input
- Password strength meter
- Token validation from URL
- Success message
- Redirect to login

**File:** `/frontend/src/pages/ResetPasswordPage.tsx`

---

## Phase 6D: Profile Page (Priority: P1)

### 6D.1: Create TDD Tests for ProfilePage
**Duration:** 30 minutes  
**TDD:** Yes - Write failing tests first

**Test Coverage:**
- [ ] Displays current user information
- [ ] Allows editing profile fields
- [ ] Validates form inputs
- [ ] Saves changes to API
- [ ] Shows success/error messages
- [ ] Avatar upload functionality
- [ ] Logout button works

**Test file:** `/frontend/src/pages/__tests__/ProfilePage.test.tsx`

### 6D.2: Create ProfilePage Component
**Duration:** 1 hour  
**Output:** User profile management page

**Features:**
- Profile picture with upload
- Editable fields (name, email, bio)
- Change password section
- Save/Cancel buttons
- Loading states
- Success/error notifications
- Account settings section

**File:** `/frontend/src/pages/ProfilePage.tsx`

---

## Phase 6E: Protected Route & Auth Integration

### 6E.1: Create ProtectedRoute Component
**Duration:** 30 minutes  
**Output:** Auth guard wrapper

**Features:**
- Check authentication status
- Redirect to login if not authenticated
- Preserve intended destination
- Loading state during auth check

**File:** `/frontend/src/components/ProtectedRoute.tsx`

### 6E.2: Update Routes with Auth
**Duration:** 15 minutes  
**Output:** Protected routes configured

**Routes to add:**
```typescript
/login                → LoginPage (public)
/register             → RegisterPage (public)
/forgot-password      → ForgotPasswordPage (public)
/reset-password/:token → ResetPasswordPage (public)
/profile              → ProfilePage (protected)
```

### 6E.3: Update Navigation with Auth State
**Duration:** 30 minutes  
**Output:** Nav shows user state

**Features:**
- Show user avatar/name when logged in
- Dropdown menu with profile/logout
- Show "Sign In" when not logged in
- Hide auth links when logged in

---

## Phase 6F: Refinement & Polish

### 6F.1: Create Loading Skeletons
**Duration:** 20 minutes  
**Output:** Auth page skeletons

### 6F.2: Add Form Animations
**Duration:** 20 minutes  
**Output:** Smooth form transitions

### 6F.3: Add Toast Notifications
**Duration:** 15 minutes  
**Output:** Success/error toasts

---

## Phase 6G: Validation & Documentation

### 6G.1: TypeScript Validation
**Duration:** 15 minutes  
**Verification:** `npx tsc --noEmit` passes

### 6G.2: Test All Auth Flows
**Duration:** 30 minutes  
**Manual tests:**
- Login with valid credentials
- Login with invalid credentials
- Register new user
- Password reset flow
- Profile update
- Logout
- Protected route access

### 6G.3: Documentation Update
**Duration:** 20 minutes  
**Update:**
- PHASE6_COMPLETE.md with completion status
- STATUS_UPDATE.md with auth status
- Component usage examples

---

## Success Criteria

### Definition of Done
- [ ] Login page fully functional with validation
- [ ] Registration page with password strength
- [ ] Password reset flow complete
- [ ] Profile page editable
- [ ] Protected routes working
- [ ] All UI states handled
- [ ] TypeScript compilation passes
- [ ] All TDD tests pass
- [ ] Auth state in navigation
- [ ] Responsive on all devices
- [ ] Documentation updated

### Quality Metrics
- **UX:** Intuitive forms with clear error messages
- **Security:** Proper password handling, no sensitive data in state
- **Accessibility:** Form labels, ARIA attributes, keyboard navigation
- **Performance:** Fast form validation, optimistic updates

---

## Technical Decisions

### Form Validation
- **Library:** react-hook-form + Zod (already installed)
- **Pattern:** Schema-first validation
- **Error Display:** Inline below fields

### Password Strength
- **Minimum:** 8 characters
- **Meter:** Visual strength indicator
- **Requirements:** Displayed to user

### State Management
- **Auth State:** Zustand (already created)
- **Form State:** react-hook-form
- **Redirect:** useNavigate + useLocation

### Token Storage
- **Access Token:** localStorage (via authStore)
- **Refresh Token:** localStorage (via authStore)
- **Auto-refresh:** Handled by API client interceptors

---

## Component Design System

### Form Components Used
- `Input` from shadcn/ui
- `Button` from shadcn/ui
- `Label` from shadcn/ui
- `Alert` from shadcn/ui
- `Checkbox` from shadcn/ui
- `Card` from shadcn/ui

### Layout Pattern
```typescript
<div className="min-h-screen flex items-center justify-center">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Login</CardTitle>
      <CardDescription>Enter your credentials</CardDescription>
    </CardHeader>
    <CardContent>
      <Form>...</Form>
    </CardContent>
    <CardFooter>
      <Link to="/register">Sign up</Link>
    </CardFooter>
  </Card>
</div>
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Token expiration | Auto-refresh via API interceptors |
| Invalid form data | Zod validation before submission |
| Network errors | Error boundary + retry |
| XSS attacks | Sanitize inputs, httpOnly cookies |
| CSRF | Token-based auth |

---

## Ready to Start

Phase 6 plan complete. Ready to execute with TDD methodology.

**Estimated Total Duration:** 6-7 hours  
**Actual Start Time:** [To be filled]  
**Expected Completion:** [To be filled]

---

## Execution Order

**Recommended sequence:**
1. **6A** → Login Page (most critical, establishes pattern)
2. **6B** → Registration Page (builds on login pattern)
3. **6C** → Password Reset Flow (completes auth flow)
4. **6E** → Protected Routes (enables profile access)
5. **6D** → Profile Page (requires protected route)
6. **6F** → Polish & Refinement
7. **6G** → Validation & Documentation

This order ensures early validation of core auth functionality.

Ready to proceed with Phase 6A: Login Page TDD tests?
