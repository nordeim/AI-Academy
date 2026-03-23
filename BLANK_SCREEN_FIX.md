# Root Cause Analysis: Blank Screenshot Issue

## Problem Summary

**Date:** March 22, 2026  
**Symptom:** All captured screenshots displayed as blank (white) pages  
**Impact:** Could not perform visual QA or E2E testing verification  

## Root Cause

The blank page issue was caused by the `kimi-plugin-inspect-react` Vite plugin, which conflicts with React 19.x and causes the React application to fail to mount properly.

### Technical Details

1. **Plugin:** `kimi-plugin-inspect-react` v1.0.3
2. **Location:** `vite.config.ts` line 9
3. **Symptom:** Plugin adds `code-path` attributes to React elements during development
4. **Conflict:** React 19.2.0 strict mode incompatibility causes mount failure
5. **Result:** Empty `<div id="root"></div>` - React never mounts

### Evidence

**Before Fix:**
```html
<div id="root"></div>  <!-- Empty - React not mounted -->
```

**After Fix:**
```html
<div id="root">
  <div class="min-h-screen bg-[var(--color-background)]">
    <!-- Full React component tree rendered -->
  </div>
</div>
```

## Solution

Removed the `kimi-plugin-inspect-react` plugin from `vite.config.ts`:

**Before:**
```typescript
plugins: [inspectAttr(), react()],
```

**After:**
```typescript
plugins: [react()],
```

## Verification

After removing the plugin:

1. ✅ React mounts successfully
2. ✅ All pages render correctly
3. ✅ Screenshots capture actual content
4. ✅ Full app functionality verified

### Screenshots Captured

| Screenshot | Content |
|------------|---------|
| `corrected-01-homepage.png` | Full homepage with hero, features, courses |
| `corrected-02-courses.png` | Course listing page with filters |
| `corrected-03-login.png` | Login form with email/password |
| `corrected-04-register.png` | Registration form with validation |

## Root Cause Summary

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Blank pages | `kimi-plugin-inspect-react` incompatible with React 19 | Remove plugin from vite.config.ts |
| React mount failure | Plugin interferes with React strict mode | Use only `@vitejs/plugin-react` |
| Empty DOM | React component tree never renders | Verify with simple test component |

## Prevention

To prevent similar issues:

1. **Test plugins thoroughly** before adding to production
2. **Verify React compatibility** with Vite plugins
3. **Use simple test components** to isolate rendering issues
4. **Check browser console** for hidden errors
5. **Monitor Vite HMR** for plugin conflicts

## Related Issues

This issue was documented in `start_apps.md` as the "white image phenomenon" with three root causes:

1. ✅ **Frontend Runtime Crash** - Fixed by removing incompatible plugin
2. ⚠️ **Rendering Race Conditions** - Mitigated with `wait --load networkidle`
3. ⚠️ **Server Backgrounding Instability** - Addressed with `start_servers.sh`

---

**Status:** ✅ RESOLVED  
**Date Fixed:** March 22, 2026  
**Screenshots Verified:** All pages rendering correctly
