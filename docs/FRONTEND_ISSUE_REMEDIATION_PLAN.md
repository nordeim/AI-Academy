# Frontend Issue Investigation & Remediation Plan
**Date:** March 22, 2026
**Status:** Investigation Complete - Root Causes Identified

---

## Issues Identified from start_apps.md

### Issue 1: Frontend Runtime Crash (Naming Collision) ✅ RESOLVED
**Status:** Already fixed in current codebase

**Evidence:**
- `src/data/mockData.ts` exports `MockCategory` (line 10)
- `src/types/api.ts` exports `Category` (line 9)
- No naming collision exists

**Verification:**
```typescript
// mockData.ts
export interface MockCategory { ... }  // ✅ Correct
// types/api.ts
export interface Category { ... }  // ✅ No collision
```

---

### Issue 2: TypeScript Build Errors (218 errors) ⚠️ ACTIVE
**Status:** Active - Blocking production build

**Root Causes Identified:**

#### 2a. verbatimModuleSyntax Requirement
**File:** `tsconfig.app.json` (line 20)
**Setting:** `"verbatimModuleSyntax": true`

**Impact:** All type-only imports must use `import type` syntax
**Error Code:** TS1484

**Affected Files:**
- `src/hooks/useCategories.ts`
- `src/hooks/useCohorts.ts`
- `src/hooks/useCourses.ts`
- `src/hooks/usePayment.ts`
- `src/components/CohortSelector.tsx`
- `src/components/SearchDialog.tsx`
- `src/pages/CourseDetailPage.tsx`
- `src/hooks/__tests__/*.test.tsx`

**Example Error:**
```typescript
// ❌ Current (causes TS1484)
import { Category } from '@/types/api';

// ✅ Correct
import type { Category } from '@/types/api';
```

#### 2b. noUnusedLocals Requirement
**File:** `tsconfig.app.json` (line 27)
**Setting:** `"noUnusedLocals": true`

**Impact:** All declared imports must be used
**Error Code:** TS6133

**Affected Files:**
- Test files with unused imports
- `src/components/layout/Navigation.tsx` (scrollToSection)
- `src/hooks/usePayment.ts` (CardNumberElement)

#### 2c. Type Mismatches
**Error Code:** TS2339, TS2345

**Root Cause:** API type definitions don't match actual API responses

**Example:**
```typescript
// types/api.ts defines:
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;  // ❌ Missing from API response
  color: string;        // ❌ Missing from API response
  icon: string;         // ❌ Missing from API response
  course_count: number;
}

// But backend returns:
{ id: number, name: string, slug: string, course_count: number }
```

#### 2d. Missing Vitest Imports
**Error Code:** TS2304

**Affected Files:**
- `src/__tests__/integration/routes.test.tsx`

**Example:**
```typescript
// ❌ Current
vi.mocked(useIsAuthenticated).mockReturnValue(true);

// ✅ Correct
import { vi } from 'vitest';
vi.mocked(useIsAuthenticated).mockReturnValue(true);
```

---

### Issue 3: Vite Server Backgrounding Instability ⚠️ ACTIVE
**Status:** Active - Process dies when shell exits

**Root Causes:**
1. Node.js process requires active TTY
2. Standard `&` backgrounding doesn't persist
3. `nohup` alone insufficient
4. Process gets reaped by environment

**Evidence from start_apps.md:**
- `npm run dev &` - Port disappears within seconds
- `nohup npm run dev &` - Process still dies
- `setsid nohup` - No improvement
- Port shows in `ss -tlnp` but unreachable

**Working Pattern (from start_apps.md):**
```bash
cd frontend && (nohup npx vite --port 5173 --host 0.0.0.0 < /dev/null > /tmp/vite.log 2>&1 &) && sleep 5 && ss -tlnp | grep :5173
```

---

### Issue 4: Port Zombie State ⚠️ ACTIVE
**Status:** Active - Port shows listening but unreachable

**Root Causes:**
1. Process in zombie state after shell exits
2. Kernel shows socket in LISTEN but application not responding
3. Chrome DevTools gets `ERR_CONNECTION_REFUSED`

**Evidence:**
- `ss -tlnp | grep 5173` shows port listening
- `curl http://127.0.0.1:5173` returns "Connection refused"
- `chrome-devtools-mcp` gets `net::ERR_CONNECTION_REFUSED`

---

### Issue 5: Rendering Race Conditions ⚠️ ACTIVE
**Status:** Active - Screenshots captured before JavaScript mounts

**Root Cause:**
- Browser automation faster than React initialization
- Screenshots captured at "First Paint" moment
- DOM not yet populated with React components

**Solution:** Wait for `networkidle` before screenshots

---

## Remediation Plan

### Phase 1: Fix TypeScript Build Errors (Priority: HIGH)
**Duration:** 30 minutes
**Scope:** Fix verbatimModuleSyntax and type mismatches

**Steps:**
1. Fix all `import type` syntax in hooks
2. Fix type definitions to match actual API responses
3. Fix test file imports (vitest)
4. Remove unused imports

**Files to Fix:**
- `src/hooks/useCategories.ts` - 4 type imports
- `src/hooks/useCohorts.ts` - 4 type imports
- `src/hooks/useCourses.ts` - 5 type imports
- `src/hooks/usePayment.ts` - 5 type imports
- `src/components/CohortSelector.tsx` - 1 type import
- `src/components/SearchDialog.tsx` - 1 type import
- `src/pages/CourseDetailPage.tsx` - 1 type import
- `src/types/api.ts` - Fix Category interface
- `src/__tests__/integration/routes.test.tsx` - Add vitest import

### Phase 2: Fix Vite Server Stability (Priority: HIGH)
**Duration:** 15 minutes
**Scope:** Create stable server startup script

**Steps:**
1. Create `start-servers.sh` script with proven patterns
2. Use `nohup` with `/dev/null` redirection
3. Add verification steps
4. Document working pattern

### Phase 3: Create Screenshots (Priority: MEDIUM)
**Duration:** 15 minutes
**Scope:** Capture 8-10 diverse screenshots

**Pages to Capture:**
1. Homepage (/)
2. Courses (/courses)
3. Course Detail (/courses/:slug)
4. Login (/login)
5. Register (/register)
6. Enrollment (/courses/:slug/enroll)
7. Profile (/profile)
8. Mobile responsive view

---

## Execution Priority

**Immediate (Next 1 hour):**
1. ✅ Fix verbatimModuleSyntax errors (highest priority)
2. ✅ Fix type definitions
3. ✅ Create stable server script
4. ✅ Take screenshots

**Short-term (Next 2 hours):**
5. ✅ Run full test suite
6. ✅ Verify production build
7. ✅ Document all fixes

---

## Evidence Required

1. Screenshot of successful TypeScript build
2. Screenshots of all major pages
3. Test results showing passing tests
4. Verification of stable server process

---

**Status:** Ready to execute
**Next Step:** Fix verbatimModuleSyntax errors
