# Phase 4 Sub-Plan: End-to-End (E2E) Testing

## Phase 4 Overview
**Objective:** Implement comprehensive E2E tests for the AI Academy platform using hybrid API+UI approach
**Scope:** Full user journeys from authentication to enrollment completion
**Expected Duration:** 2-3 hours
**Expected Outcome:** 10-15 E2E tests covering critical user paths

## Available Tools Analysis

Based on skills analysis, we have access to:

### Primary Tools
| Tool | Best For | Usage |
|------|----------|-------|
| **agent-browser** | Quick smoke tests, screenshots, ad-hoc verification | CLI-based browser automation |
| **chrome-devtools-mcp** | Lighthouse audits, performance traces, network inspection | Deep debugging and auditing |
| **Playwright** (implied) | Comprehensive E2E suites, CI/CD integration | Recommended for regression testing |
| **API Tests** | Authentication, data setup, assertions | Fast, reliable, no flake |

### Recommended Hybrid Approach (from e2e-testing-lessons)
```
Authentication → API (get JWT tokens)
Data Creation → API (fast, reliable, no flake)
Assertions → API + UI
Visual Proof → UI screenshots (agent-browser)
```

## Current State Analysis

### Existing Test Infrastructure
- Backend: 257 tests passing ✅
- Frontend: 92+ tests passing ✅
- Integration: 3/3 routes tests passing ✅
- Components: All rendering correctly ✅

### Missing E2E Coverage
| User Journey | Status | Priority |
|--------------|--------|----------|
| User registration → Login → Dashboard | ❌ Not tested | High |
| Browse courses → View details → Enroll | ❌ Not tested | High |
| Complete enrollment → Payment → Confirmation | ❌ Not tested | Critical |
| Authentication persistence across navigation | ❌ Not tested | High |
| Admin course management workflow | ❌ Not tested | Medium |

## Execution Steps (TDD Cycle)

### Step 4.1: RED Phase - Write Failing E2E Tests
**Duration:** 45 minutes
**Deliverables:**

#### E2E Test Suite 1: Authentication Flow
```typescript
// tests/e2e/auth-flow.spec.ts
describe('E2E: Authentication Flow', () => {
  it('should complete full registration and login', async () => {
    // RED: Will fail until E2E infrastructure set up
    await page.goto('http://localhost:5173/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');
    
    // Login with new credentials
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

#### E2E Test Suite 2: Course Enrollment Journey
```typescript
// tests/e2e/enrollment.spec.ts
describe('E2E: Complete Enrollment Flow', () => {
  it('should complete full enrollment with payment', async () => {
    // RED: Will fail until Stripe integration tested end-to-end
    
    // 1. Login via API (fast, reliable)
    const tokens = await apiLogin('test@example.com', 'password');
    await page.context().setExtraHTTPHeaders({
      'Authorization': `Bearer ${tokens.access}`
    });
    
    // 2. Navigate to course
    await page.goto('/courses/ai-engineering');
    await page.click('text=Enroll Now');
    await expect(page).toHaveURL(/\/courses\/.*\/enroll/);
    
    // 3. Select cohort
    await page.click('text=Online Cohort');
    await page.click('text=Continue');
    await expect(page.locator('text=Review Your Enrollment')).toBeVisible();
    
    // 4. Proceed to payment
    await page.click('text=Proceed to Payment');
    await expect(page.locator('[data-testid="card-element"]')).toBeVisible();
    
    // 5. Enter payment (Stripe test card)
    await fillStripeCard('4242424242424242', '12/25', '123');
    await page.click('text=Pay');
    
    // 6. Verify confirmation
    await expect(page).toHaveURL('/enrollment/confirmation');
    await expect(page.locator('text=Enrollment Confirmed')).toBeVisible();
    
    // 7. Screenshot for evidence
    await page.screenshot({ path: 'enrollment-success.png' });
  });
});
```

#### E2E Test Suite 3: Smoke Tests
```typescript
// tests/e2e/smoke.spec.ts
describe('E2E: Smoke Tests', () => {
  it('all major pages load without errors', async () => {
    // RED: Will fail if any page has errors
    const pages = ['/', '/courses', '/login', '/register'];
    
    for (const path of pages) {
      await page.goto(path);
      await expect(page.locator('body')).not.toContainText('Error');
      await expect(page.locator('body')).not.toContainText('404');
      
      // Capture console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      
      expect(consoleErrors).toHaveLength(0);
    }
  });
});
```

### Step 4.2: GREEN Phase - Implement E2E Infrastructure
**Duration:** 90 minutes

#### Task 4.2.1: Set Up Playwright
**Files:**
- `frontend/playwright.config.ts` (NEW)
- `frontend/package.json` (add scripts)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

#### Task 4.2.2: Create API Helpers
**File:** `frontend/tests/e2e/helpers/api.ts` (NEW)

```typescript
// API helper for authentication and data setup
export async function apiLogin(email: string, password: string) {
  const response = await fetch('http://localhost:8000/api/v1/auth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function createTestUser() {
  // Create test user via API
}

export async function cleanupTestData(userId: string) {
  // Cleanup via API
}
```

#### Task 4.2.3: Create UI Helpers
**File:** `frontend/tests/e2e/helpers/ui.ts` (NEW)

```typescript
// UI helper for common interactions
export async function fillStripeCard(
  page: Page,
  cardNumber: string,
  expiry: string,
  cvc: string
) {
  await page.frameLocator('iframe[name^="__privateStripeFrame"]').
    locator('[placeholder="Card number"]').fill(cardNumber);
  await page.frameLocator('iframe[name^="__privateStripeFrame"]').
    locator('[placeholder="MM / YY"]').fill(expiry);
  await page.frameLocator('iframe[name^="__privateStripeFrame"]').
    locator('[placeholder="CVC"]').fill(cvc);
}
```

### Step 4.3: Run Tests and Fix Issues
**Duration:** 45 minutes

#### Expected Issues & Solutions:

**Issue 1: JWT Token Storage**
- Problem: HttpOnly cookies invisible to browser automation
- Solution: Use API auth and set headers

**Issue 2: Stripe Elements in Iframes**
- Problem: Test selectors can't reach iframe content
- Solution: Use frameLocator as shown in helpers

**Issue 3: Database State**
- Problem: Tests depend on existing data
- Solution: Create fresh data in beforeEach

**Issue 4: Flaky Tests**
- Problem: Timing issues with async operations
- Solution: Use explicit waits and retry logic

## Validation Points

### Pre-Execution Validation
- [ ] Backend API running on localhost:8000
- [ ] Frontend dev server running on localhost:5173
- [ ] Stripe test keys configured
- [ ] Test database isolated

### Post-Execution Validation
- [ ] All E2E tests passing
- [ ] Screenshots captured for visual proof
- [ ] Console error-free
- [ ] Network requests successful
- [ ] No authentication failures

## Success Criteria

### Test Coverage Targets:
| Journey | Tests | Status Target |
|---------|-------|---------------|
| Authentication | 3 | 100% passing |
| Course Browse | 2 | 100% passing |
| Enrollment | 4 | 100% passing |
| Payment | 2 | 100% passing |
| Smoke Tests | 2 | 100% passing |
| **Total** | **13** | **100%** |

### Quality Metrics:
- Flaky test rate: < 5%
- Average test duration: < 30 seconds
- Screenshot coverage: 100% of critical paths
- Console error rate: 0%

## Time Estimate
- **Total:** 3 hours
- **RED (tests):** 45 minutes
- **GREEN (setup):** 90 minutes
- **Execution:** 45 minutes

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe iframe complexity | High | Medium | Use frameLocator helper |
| Test data cleanup | Medium | Medium | API cleanup in afterEach |
| Environment differences | Medium | Low | Dockerize test environment |
| Flaky tests | Medium | High | Add retries and waits |

## Evidence Collection
- Test execution video (optional)
- Screenshots of successful runs
- Console logs
- Network HAR files
- Performance traces (chrome-devtools-mcp)

---

## Quick Start with agent-browser

For immediate smoke testing without full Playwright setup:

```bash
# Quick smoke test of critical paths
agent-browser open http://localhost:5173 && \
  agent-browser screenshot --annotate /tmp/homepage.png && \
  agent-browser find text "Courses" click && \
  agent-browser wait --load networkidle && \
  agent-browser screenshot --annotate /tmp/courses.png
```

---

## Pre-Execution Validation Required
Before proceeding:
1. ⏳ Verify dev servers are running
2. ⏳ Check Stripe test configuration
3. ⏳ Confirm test database isolation
4. ⏳ Review existing test patterns

**Ready for Phase 4?** Review this plan, then confirm to proceed.
