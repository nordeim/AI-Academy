# Step 5: Response Standardization - TDD Implementation Plan

**Status:** Planning Complete | **Priority:** P1 - High | **Estimated Effort:** 3-4 hours

---

## Executive Summary

Implement a standardized API response format across all endpoints using Test-Driven Development. All responses will follow a consistent envelope structure with `success`, `data`, `message`, and `errors` fields, plus standard error formats.

---

## Standard Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2026-03-20T12:00:00Z",
    "request_id": "uuid",
    "pagination": { ... }
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"],
    "non_field_errors": ["General error message"]
  },
  "meta": {
    "timestamp": "2026-03-20T12:00:00Z",
    "request_id": "uuid",
    "error_code": "VALIDATION_ERROR"
  }
}
```

### List Response (Paginated)
```json
{
  "success": true,
  "data": [...],
  "message": "Records retrieved successfully",
  "meta": {
    "timestamp": "2026-03-20T12:00:00Z",
    "request_id": "uuid",
    "pagination": {
      "count": 100,
      "page": 1,
      "pages": 10,
      "page_size": 10,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## TDD Implementation Phases

### Phase 1: RED - Write Failing Tests
**Objective:** Create comprehensive tests that define expected behavior before implementation

#### Test Cases:

1. **Test Standard Success Response Format**
   - Verify all 2xx responses include `success: true`, `data`, `message`, `meta`
   - Test with Course list endpoint
   - Test with Course detail endpoint
   - Test with Cohort list endpoint

2. **Test Standard Error Response Format**
   - Verify 4xx responses include `success: false`, `errors` object, `message`
   - Test 400 Bad Request (validation errors)
   - Test 404 Not Found
   - Test 401 Unauthorized
   - Test 403 Forbidden
   - Test 429 Rate Limited

3. **Test Custom Action Response Standardization**
   - `/courses/{slug}/cohorts/` must return wrapped response, not raw array
   - Verify `success`, `data`, `message` structure

4. **Test Pagination Metadata**
   - List endpoints must include pagination info in `meta.pagination`
   - Verify `count`, `page`, `pages`, `page_size`, `has_next`, `has_previous`

5. **Test Non-Field Errors Format**
   - Validation errors without specific fields go in `errors.non_field_errors`
   - Test duplicate enrollment attempt

6. **Test Request ID Generation**
   - Each response must have unique `request_id` in `meta`
   - Test that different requests get different IDs

7. **Test Timestamp Consistency**
   - All responses must have ISO 8601 timestamp in `meta.timestamp`
   - Verify timezone awareness (UTC)

**Files to Create:**
- `/backend/api/tests/test_response_standardization.py` - 15+ comprehensive tests

---

### Phase 2: GREEN - Make Tests Pass
**Objective:** Implement minimal code to satisfy all test requirements

#### Implementation Steps:

1. **Create Response Utility Classes**
   - `/backend/api/responses.py`
   - `StandardizedResponse` class extending DRF Response
   - `SuccessResponse` and `ErrorResponse` helpers
   - `ResponseFormatter` mixin for ViewSets

2. **Create Custom Exception Handler**
   - `/backend/api/exceptions.py`
   - `standardized_exception_handler` function
   - Integrate with DRF's `EXCEPTION_HANDLER` setting
   - Handle all DRF/Django exceptions consistently

3. **Create Response Middleware**
   - `/backend/api/middleware.py`
   - Generate `request_id` for each request
   - Attach request metadata to response

4. **Update ViewSets**
   - `/backend/api/views.py`
   - Integrate ResponseFormatter mixin
   - Standardize custom action responses (cohorts endpoint)

5. **Configure DRF Settings**
   - `/backend/academy/settings/base.py`
   - Add custom exception handler
   - Configure response middleware

**Key Implementation Details:**

```python
# api/responses.py
class StandardizedResponse(Response):
    def __init__(self, data=None, status=None, message=None, errors=None, **kwargs):
        response_data = {
            "success": status < 400 if status else True,
            "data": data if data is not None else {},
            "message": message or self._get_default_message(status),
            "errors": errors or {},
            "meta": self._build_meta(kwargs.get("request")),
        }
        super().__init__(response_data, status=status, **kwargs)
```

---

### Phase 3: REFACTOR - Optimize & Polish
**Objective:** Improve code quality, performance, and maintainability

#### Refactoring Tasks:

1. **Code Organization**
   - Extract pagination metadata logic into reusable function
   - Create error code constants/enums
   - Move message templates to configuration

2. **Performance Optimization**
   - Ensure request_id generation is efficient
   - Optimize timestamp formatting
   - Cache error message templates

3. **Documentation**
   - Add docstrings to all new classes/functions
   - Update API_Usage_Guide.md with response format documentation
   - Create examples in code comments

4. **Edge Case Handling**
   - Handle empty data responses gracefully
   - Ensure 204 No Content responses follow format
   - Handle streaming responses appropriately

---

## Success Criteria

✅ All 15+ tests pass  
✅ `/courses/{slug}/cohorts/` returns wrapped response (not raw array)  
✅ Validation errors have consistent format with field-level errors  
✅ All 2xx responses include `success: true`, `data`, `message`, `meta`  
✅ All 4xx/5xx responses include `success: false`, `errors`, `message`  
✅ Pagination metadata present on list endpoints  
✅ Each response has unique `request_id` and ISO timestamp  
✅ Documentation updated with new response format  

---

## Implementation Checklist

### Phase 1: Tests
- [ ] Create `/backend/api/tests/test_response_standardization.py`
- [ ] Write test for standard success response (Course list)
- [ ] Write test for standard success response (Course detail)
- [ ] Write test for validation error format (400)
- [ ] Write test for not found error format (404)
- [ ] Write test for unauthorized error format (401)
- [ ] Write test for forbidden error format (403)
- [ ] Write test for rate limit error format (429)
- [ ] Write test for custom action response (cohorts endpoint)
- [ ] Write test for pagination metadata
- [ ] Write test for non-field errors
- [ ] Write test for request ID generation
- [ ] Write test for timestamp format
- [ ] Run tests to confirm they all FAIL (RED phase complete)

### Phase 2: Implementation
- [ ] Create `/backend/api/responses.py` with StandardizedResponse
- [ ] Create `/backend/api/exceptions.py` with custom exception handler
- [ ] Create `/backend/api/middleware.py` with request ID middleware
- [ ] Update `/backend/api/views.py` to use standardized responses
- [ ] Update `/backend/academy/settings/base.py` with exception handler config
- [ ] Run tests to confirm they all PASS (GREEN phase complete)

### Phase 3: Refactoring
- [ ] Extract pagination metadata logic
- [ ] Create error code constants
- [ ] Add comprehensive docstrings
- [ ] Handle edge cases (empty data, 204, streaming)
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
1. `/backend/api/responses.py` - Response utility classes
2. `/backend/api/exceptions.py` - Custom exception handler
3. `/backend/api/middleware.py` - Response middleware
4. `/backend/api/tests/test_response_standardization.py` - Test suite

### Modified Files:
1. `/backend/api/views.py` - Integrate standardized responses
2. `/backend/academy/settings/base.py` - Configure exception handler & middleware
3. `/home/project/AI-Academy/API_Usage_Guide.md` - Document new format
4. `/home/project/AI-Academy/ACCOMPLISHMENTS.md` - Add milestone
5. `/home/project/AI-Academy/TODO.md` - Mark complete
6. `/home/project/AI-Academy/AGENTS.md` - Update current state

---

## Dependencies

**No new packages required.** Uses existing DRF infrastructure.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking frontend compatibility | High | Critical | Keep mock data compatible, document changes |
| Performance overhead | Low | Medium | Efficient request_id generation, caching |
| Test coverage gaps | Medium | High | Comprehensive test suite with edge cases |

---

**Ready to proceed with Phase 1: RED - Writing Failing Tests**
