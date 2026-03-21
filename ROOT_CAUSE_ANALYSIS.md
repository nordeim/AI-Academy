# Root Cause Investigation: Test Failures Analysis

**Date:** March 21, 2026  
**Status:** IN PROGRESS  
**Objective:** Identify root cause of 5 test errors

---

## Error Summary

### Test Results
- **Total Tests:** 12
- **Passed:** 7
- **Errors:** 5 (not failures - these are import/configuration errors)
- **Failed:** 0

### Affected Tests
1. `test_create_payment_intent_already_confirmed`
2. `test_create_payment_intent_invalid_enrollment`
3. `test_create_payment_intent_unauthenticated`
4. `test_create_payment_intent_wrong_user`
5. `test_payment_rate_limit`

### Common Error Pattern
All 5 errors show the same stack trace ending with:
```
ImportError: Could not import 'api.exceptions.standardized_exception_handler' 
for API setting 'EXCEPTION_HANDLER'.
ImportError: Module "api.exceptions" does not define a 
"standardized_exception_handler" attribute/class.
```

---

## Error Analysis

### Stack Trace Breakdown

```python
# Location: rest_framework/settings.py:182
ImportError: Module "api.exceptions" does not define a 
"standardized_exception_handler" attribute/class

# Called from: rest_framework/settings.py:168
return import_from_string(val, setting_name)

# Called from: rest_framework/settings.py:227
val = perform_import(val, attr)

# Called from: rest_framework/views.py:304
return self.settings.EXCEPTION_HANDLER

# Called from: rest_framework/views.py:469
exception_handler = self.get_exception_handler()

# Triggered when: An exception occurs during request handling
response = self.handle_exception(exc)
```

### Key Observation
The error occurs when any exception is raised during request handling. The 7 passing tests likely don't trigger exceptions, while the 5 erroring tests do trigger exceptions (e.g., 404, 403, 401) which then fail when trying to load the exception handler.

---

## Root Cause Hypotheses

### Hypothesis 1: Import Path Issue
**Theory:** The settings file references `api.exceptions.standardized_exception_handler`, but the function cannot be found in the `api.exceptions` module.

**Evidence:**
- The function IS defined in `api/exceptions.py` line 79
- The import SHOULD work from a file
- Python can import functions from modules

**Verdict:** UNLIKELY - The function exists in the file

### Hypothesis 2: Settings Configuration
**Theory:** The settings file has the wrong import path.

**Evidence to check:**
- What's the actual value of `EXCEPTION_HANDLER` in settings?
- Is it using the correct dotted path?

### Hypothesis 3: Package vs File Conflict
**Theory:** Previously had `api/exceptions/` package directory which was deleted, but Python is still caching or confused about the module type.

**Evidence:**
- We removed `api/exceptions/` directory
- We have `api/exceptions.py` file
- Python might have cached `.pyc` files

**Verdict:** POSSIBLE - Need to check for cached bytecode

### Hypothesis 4: Circular Import
**Theory:** Importing the exception handler causes a circular import that prevents the function from being defined.

**Evidence to check:**
- Does `api/exceptions.py` import anything that imports it?
- Is there a circular dependency?

### Hypothesis 5: Test Database/Environment Issue
**Theory:** The test environment doesn't have the same Python path or module structure.

**Evidence to check:**
- Can we manually import in test environment?
- Is `api/` in Python path?

---

## Investigation Steps

### Step 1: Check Settings Configuration
```python
# File: academy/settings/base.py
# Look for: REST_FRAMEWORK['EXCEPTION_HANDLER']
```

### Step 2: Verify Manual Import
```python
# Test if we can manually import the function
from api.exceptions import standardized_exception_handler
print("Import successful!")
```

### Step 3: Check for Cached Bytecode
```bash
# Remove __pycache__ directories
find . -type d -name __pycache__ -exec rm -rf {} +
find . -name "*.pyc" -delete
```

### Step 4: Check Import Path
```python
import api.exceptions
print(api.exceptions.__file__)
print(dir(api.exceptions))
```

### Step 5: Check for Circular Imports
```python
# Trace the import chain
import traceback
import api.exceptions
```

---

## Next Actions

1. **Verify settings configuration** - Check the exact import path
2. **Test manual import** - Confirm the function is accessible
3. **Clear Python cache** - Remove all `.pyc` and `__pycache__`
4. **Test again** - Run tests after clearing cache

---

**Investigation Status:** IN PROGRESS  
**Confidence Level:** Medium (70%) - Likely a caching or import path issue
