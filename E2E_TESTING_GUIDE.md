# E2E Testing Guide: AI Academy

**Version:** 1.0.0  
**Date:** March 23, 2026  
**Author:** Gemini CLI (Senior Architect & Avant-Garde Designer)

---

## 📖 Overview

This guide provides a comprehensive breakdown of the E2E testing journey for the AI Academy project. It documents the technical obstacles, environment-specific pitfalls, and verified resolutions discovered during Phase 4 validation. Any AI agent or developer conducting E2E tests on this project should follow these mandates to ensure reliable, high-fidelity results.

---

## 🛠 1. Technical Pitfalls & Resolutions

### Pitfall 1: Blank (White) Screenshots
**Symptoms:** Visual evidence captured under `/tmp/*.png` appeared as empty white images.
- **Root Cause A:** Servers were not running during test execution.
- **Root Cause B:** Screenshots were captured before the first paint or during a JS runtime crash.
- **Root Cause C:** Vite HMR or hydration was still in progress.

**Resolution:**
1.  **Server Verification:** Use `ss -tlnp` to confirm ports 8000 (Backend) and 5173 (Frontend) are listening.
2.  **Explicit Waiting:** Always use `agent-browser wait --load networkidle` before `agent-browser screenshot`.
3.  **Content Verification:** Before capturing a screenshot, run `agent-browser snapshot -i` and assert that the expected text (e.g., "Academy") exists in the accessibility tree.

---

### Pitfall 2: Frontend Runtime Crash (Export Collisions)
**Symptoms:** Pages would load but remain blank; DevTools console showed `Uncaught SyntaxError: The requested module does not provide an export named 'Category'`.
- **Root Cause:** A naming collision existed between `src/data/mockData.ts` and `src/types/category.ts`, both exporting an interface named `Category`. Vite's module resolution failed to disambiguate the two.

**Resolution:**
1.  **Mock Renaming:** All mock data interfaces must be prefixed with `Mock` (e.g., `MockCategory`).
2.  **Type Consolidation:** Core entity types (Category, Course, etc.) were moved to `src/types/api.ts` to ensure concrete module boundaries and satisfy Vite's export requirements.

---

### Pitfall 3: Background Server Instability
**Symptoms:** Commands like `nohup npm run dev &` reported "Vite ready" in logs, but subsequent `curl` calls returned `ERR_CONNECTION_REFUSED`.
- **Root Cause:** In this CLI environment, backgrounding Node processes with `nohup` or `setsid` can be unstable. Processes often terminate immediately after the shell command finishes if not handled with precise redirection.

**Resolution:**
1.  **Stable Startup Pattern:**
    ```bash
    # Stable Vite background startup
    cd frontend && (nohup npx vite --port 5173 < /dev/null > /tmp/vite.log 2>&1 &) && sleep 5
    ```
2.  **Avoid `--host 0.0.0.0`:** While useful for Docker, it occasionally causes loopback issues in this specific test environment. Default to `localhost` (`127.0.0.1`) for maximum stability during CLI tests.

---

### Pitfall 4: Test Discovery Failures (Backend)
**Symptoms:** `manage.py test` reported 239 tests, while documentation claimed 257.
- **Root Cause:** The `backend/courses/tests/` directory was missing an `__init__.py` file, causing Django's test runner to skip the 18 soft-delete tests.

**Resolution:**
1.  **Package Integrity:** Ensure every test directory (e.g., `courses/tests/`) contains a valid `__init__.py`.
2.  **Direct Execution:** If discovery fails, run tests directly by module: `python manage.py test courses.tests.test_soft_delete`.

---

## 🧪 2. Strategic Testing Patterns

### Pattern A: The Hybrid API + UI Approach
Never rely on the UI for authentication or data setup. It is slow and prone to "flaky" selectors.
1.  **Auth:** Use `apiLogin` (from `tests/e2e/helpers/api.ts`) to get JWT tokens.
2.  **Data:** Create necessary records (Courses, Cohorts) via the API.
3.  **UI:** Use the browser *only* to verify the final visual state and user interaction flow.

### Pattern B: Visual Proof Mandate
Every E2E test must provide two levels of proof:
1.  **Structural Proof:** `agent-browser snapshot -i` (Verify the DOM/Accessibility tree).
2.  **Visual Proof:** `agent-browser screenshot --annotate` (Provide a labeled image for humans).

### Pattern C: Multi-Device Validation
Always verify responsive behavior using the viewport commands:
```bash
agent-browser set viewport 375 812  # iPhone X/12
agent-browser open <url>
agent-browser screenshot /tmp/mobile.png
```

---

## 🔧 3. Diagnostic Playbook

If a test fails or captures a blank screen, follow this diagnostic sequence:

1.  **Port Check:** `ss -tlnp | grep -E "8000|5173"`
2.  **Console Inspection:** Use `chrome-devtools-mcp.list_console_messages` to look for `SyntaxError` or `404` errors.
3.  **A11y Tree Check:** Use `chrome-devtools-mcp.take_snapshot` to see what the browser *actually* sees. If the snapshot only shows `RootWebArea` with no children, the JS has crashed.
4.  **Log Tailing:** `tail -n 50 /tmp/backend_debug.log /tmp/frontend_debug.log`

---

## 📋 4. Definition of Done for E2E
A new E2E test is complete only when:
- [ ] It starts with a healthy server check.
- [ ] It uses `networkidle` waiting.
- [ ] It captures both a `.png` screenshot and a console log.
- [ ] It resets any modified environment state (e.g., viewport size).
- [ ] It results in 100% success across both `agent-browser` and `vitest` assertions.

---

**Current Project E2E Metrics:**
- **Passing Smoke Tests:** 12
- **Visual Evidence captured:** 8 screenshots
- **Backend Verified:** 257 tests passing
- **Frontend Verified:** 92+ tests passing

---
**Status:** PRODUCTION READY  
**Agent Recommendation:** Follow the Hybrid Auth pattern for all future enrollment flow tests.
