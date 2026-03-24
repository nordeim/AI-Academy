# CohortSelector Component - TDD Implementation Plan

**Component:** CohortSelector  
**Location:** `/frontend/src/components/CohortSelector.tsx`  
**Approach:** Test-Driven Development (RED → GREEN → REFACTOR)  
**Estimated Time:** 1 hour

---

## Component Requirements

### Props Interface
```typescript
interface CohortSelectorProps {
  courseSlug: string;           // Course slug to fetch cohorts
  value: string | null;         // Selected cohort ID
  onChange: (cohortId: string, cohortData: Cohort) => void;  // Selection callback
  disabled?: boolean;         // Disable selector
  error?: string;              // Error message to display
}
```

### Features
1. **Cohort List** - Display available cohorts for course
2. **Spots Indicator** - Show remaining spots for each cohort
3. **Cohort Details** - Show dates, format, instructor
4. **Disabled State** - Full cohorts cannot be selected
5. **Loading State** - Skeleton while loading
6. **Error Handling** - Display fetch errors
7. **Validation** - Prevent selection of full cohorts

---

## TDD Test Plan (5 Tests)

### Test 1: Render Cohorts
**Scenario:** Component loads cohorts for course
**Expected:**
- Cohorts displayed in list
- Each cohort shows spots remaining
- Dates and format visible

### Test 2: Handle Selection
**Scenario:** User clicks on cohort
**Expected:**
- onChange callback called with cohort ID
- Selected cohort highlighted
- Cohort data passed to callback

### Test 3: Disable Full Cohorts
**Scenario:** Cohort has 0 spots remaining
**Expected:**
- Cohort displayed as disabled
- Cannot be selected
- Shows "Full" indicator

### Test 4: Loading State
**Scenario:** Cohorts are loading
**Expected:**
- Loading skeleton displayed
- No cohorts shown
- Loading indicator visible

### Test 5: Handle Errors
**Scenario:** API returns error
**Expected:**
- Error message displayed
- Retry option available
- Graceful error state

---

## Implementation Strategy

### Step 1: Write Component
- Create CohortSelector component
- Use useCohorts hook for data fetching
- Implement selection logic
- Add loading and error states

### Step 2: Style Component
- Follow design system (sharp corners, colors)
- Responsive layout
- Accessible (keyboard navigation)

---

## Design Specifications

### Layout
- Card-based list items
- Each cohort in separate card
- Horizontal or vertical layout
- Max width: 600px

### Colors
- Available: Green indicator (spots > 5)
- Limited: Amber indicator (spots ≤ 5)
- Full: Red indicator (spots = 0)
- Selected: Primary border

### Spacing
- Card padding: 16px
- Gap between cards: 12px
- Section padding: 24px

---

**Ready to Execute**
