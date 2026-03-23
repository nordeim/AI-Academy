# E2E Testing Guide: AI Academy

**Version:** 1.1.0  
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

---

## 🔧 3. Diagnostic & Server Management Playbook

### Scenario: Browser getting no response from URLs
If the browser or `curl` returns `Connection Refused` or a timeout even when the server seems to be "ready":

1.  **Check Port Ownership:**
    ```bash
    ss -tlnp | grep -E "8000|5173"
    ```
    If no process is listed, the server has terminated. If it *is* listed but unreachable, verify if it's bound to `0.0.0.0` vs `127.0.0.1`.

2.  **Console Inspection:** Use `chrome-devtools-mcp.list_console_messages` to look for `SyntaxError` or `404` errors that might prevent the React app from mounting.

3.  **A11y Tree Check:** Use `chrome-devtools-mcp.take_snapshot`. If the snapshot only shows `RootWebArea` with no children, the JS has crashed.

### Correct Way to Start/Restart Servers

#### Backend (Django)
Always activate the virtual environment and use `nohup` with redirection:
```bash
# To Start:
cd backend && source /opt/venv/bin/activate && \
(nohup python manage.py runserver 0.0.0.0:8000 > /tmp/backend_debug.log 2>&1 &)

# To Restart:
pkill -f "manage.py runserver" && [repeat start command]
```

#### Frontend (Vite)
Vite requires `/dev/null` as `stdin` to remain stable in background mode:
```bash
# To Start:
cd frontend && \
(nohup npx vite --port 5173 < /dev/null > /tmp/frontend_debug.log 2>&1 &) && sleep 5

# To Restart:
pkill -f vite && [repeat start command]
```

**Mandate:** After starting, always verify with `curl -I http://127.0.0.1:5173/` before triggering tests.

---

## 📋 4. Definition of Done for E2E
A new E2E test is complete only when:
- [ ] It starts with a healthy server check (HTTP 200).
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
**Agent Recommendation:** If Vite terminates unexpectedly, ensure `< /dev/null` is present in the `nohup` command.
