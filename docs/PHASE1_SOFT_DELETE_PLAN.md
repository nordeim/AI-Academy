# Phase 1 Sub-Plan: Backend Soft Delete Implementation

## Phase 1 Overview
**Objective:** Implement soft delete functionality for Course, Cohort, and Enrollment models using Test-Driven Development (TDD)
**Scope:** Backend only - models, managers, and tests
**Expected Duration:** 2-3 hours
**Expected Outcome:** 20 new passing tests, soft delete fields in models

## Validation Checklist (Pre-Execution)
Before executing, verify:
- [ ] Current models lack soft delete fields
- [ ] No soft delete tests exist
- [ ] No soft delete custom managers exist
- [ ] API endpoints need soft delete filtering

## Execution Steps (TDD Cycle)

### Step 1.1: RED Phase - Write Failing Tests
**Duration:** 45 minutes
**Deliverables:**
- Test file: `courses/tests/test_soft_delete.py`
- 20 test cases covering:
  - Course soft delete (5 tests)
  - Cohort soft delete (5 tests)
  - Enrollment soft delete (5 tests)
  - Manager queryset filtering (3 tests)
  - API endpoint soft delete handling (2 tests)

**Test Categories:**
1. Model-level soft delete
2. Manager filtering (active vs deleted)
3. QuerySet filtering
4. API endpoint responses
5. Related object handling

### Step 1.2: GREEN Phase - Implement Soft Delete
**Duration:** 90 minutes
**Deliverables:**
1. Add `deleted_at` field to models
2. Create custom SoftDeleteManager
3. Override `delete()` method
4. Add `restore()` method
5. Update API views to filter deleted records

**Files to Modify:**
- `courses/models.py` - Add fields and managers
- `courses/managers.py` - Create new (or add to models)
- `api/views/courses.py` - Filter deleted records
- `api/views/cohorts.py` - Filter deleted records

### Step 1.3: REFACTOR Phase - Optimize
**Duration:** 30 minutes
**Deliverables:**
- Optimize queries with `.filter(deleted_at__isnull=True)`
- Add database index on `deleted_at`
- Update serializers to exclude deleted
- Documentation updates

## Validation Points

### Pre-Execution Validation
- [ ] Confirm models.py has no soft delete fields
- [ ] Confirm no soft delete tests exist
- [ ] Verify 239 tests currently passing

### Post-Execution Validation
- [ ] 259 tests passing (239 + 20 new)
- [ ] Soft delete fields present in models
- [ ] Managers filter deleted records by default
- [ ] API endpoints exclude deleted records
- [ ] Migrations generated and applied

## Risks and Mitigation
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing tests | Medium | High | Run full test suite after each change |
| Migration conflicts | Low | Medium | Create migration, don't modify existing |
| Performance impact | Low | Medium | Add database indexes |
| API contract changes | Medium | High | Ensure deleted records not returned |

## Evidence Collection
- Screenshot of test results before (239 tests)
- Screenshot of test results after (259 tests)
- Code diff showing changes
- Migration files generated

## Success Criteria
1. All 20 new soft delete tests pass
2. All 239 existing tests still pass
3. Soft delete fields present in database schema
4. API endpoints filter deleted records
5. Documentation updated

---

## Pre-Execution Validation Required
Before proceeding, I must:
1. ✅ Verify current models lack soft delete fields
2. ✅ Verify no soft delete tests exist
3. ✅ Verify current test count is 239
4. ⏳ Review existing test structure to match patterns
5. ⏳ Check for any existing soft delete implementations

**Ready for Phase 1?** Review this plan, then confirm to proceed.
