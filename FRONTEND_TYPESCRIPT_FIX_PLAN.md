# Frontend TypeScript Fix Plan

## Root Cause Analysis

### Issue 1: verbatimModuleSyntax Requirement
TypeScript compiler options have `verbatimModuleSyntax: true` which requires:
- Type-only imports must use `import type { ... }` syntax
- Regular imports must be used for runtime values

### Issue 2: Missing Type Exports
- `CategoryListResponse` is not defined in `src/types/api.ts`
- Need to either add it to types or remove from imports

### Issue 3: Unused Imports
- Many files import types but don't use them
- Need to remove unused imports or add usage

### Issue 4: Test Setup
- `beforeAll` and `afterAll` are not globally available
- Need to import from vitest

## Files to Fix

### Priority 1: API Service Files
1. `src/services/api/client.ts` - Fix InternalAxiosRequestConfig import
2. `src/services/api/auth.ts` - Fix type imports
3. `src/services/api/categories.ts` - Fix type imports, remove unused CategoryListResponse
4. `src/services/api/cohorts.ts` - Fix type imports
5. `src/services/api/courses.ts` - Fix type imports
6. `src/services/api/enrollments.ts` - Fix type imports
7. `src/services/api/payments.ts` - Fix type imports

### Priority 2: Store Files
1. `src/store/authStore.ts` - Fix type imports

### Priority 3: Test Files
1. `src/test/setup.ts` - Import vitest globals

### Priority 4: Add Missing Type
1. `src/types/api.ts` - Add CategoryListResponse type

## Implementation Order
1. Add CategoryListResponse to api.ts
2. Fix client.ts (base dependency)
3. Fix auth.ts
4. Fix categories.ts
5. Fix cohorts.ts
6. Fix courses.ts
7. Fix enrollments.ts
8. Fix payments.ts
9. Fix authStore.ts
10. Fix test/setup.ts

## Verification
- Run `npm run build` after each fix
- Verify no new errors introduced
- Test dev server functionality
