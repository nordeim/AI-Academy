# Phase 5: Course Pages & Search Plan

**Date:** March 21, 2026  
**Estimated Duration:** 5-6 hours  
**Approach:** TDD (Red-Green-Refactor)

---

## Goal
Build full course discovery and detail pages with search functionality. This phase transforms the AI Academy from a homepage into a complete course marketplace with discoverability features.

---

## Phase 5A: Courses Listing Page (Priority: P0)

### 5A.1: Create Router Setup
**Duration:** 30 minutes  
**TDD:** No (infrastructure setup)  
**Output:** React Router configured for course pages

**Implementation:**
- Install react-router-dom
- Create route configuration
- Add navigation from homepage
- Lazy loading for performance

**Routes to add:**
- `/courses` - Course listing page
- `/courses/:slug` - Course detail page

### 5A.2: Create TDD Tests for CoursesList Component
**Duration:** 45 minutes  
**TDD:** Yes - Write failing tests first  
**Output:** Comprehensive test suite

**Test Coverage:**
- [ ] Renders loading state initially
- [ ] Fetches and displays course list
- [ ] Handles error state
- [ ] Empty state when no courses
- [ ] Pagination controls
- [ ] Filter by category
- [ ] Filter by level
- [ ] Search input functionality
- [ ] Sort by price
- [ ] Sort by rating

**Test file:** `/frontend/src/pages/__tests__/CoursesPage.test.tsx`

### 5A.3: Create CoursesList Page Component (GREEN Phase)
**Duration:** 1.5 hours  
**Output:** Full courses listing page

**Features:**
- Grid layout of course cards
- Filter sidebar/pills
- Search input
- Sort dropdown
- Pagination
- Loading skeletons
- Error handling
- Empty state

**File:** `/frontend/src/pages/CoursesPage.tsx`

**Component Structure:**
```typescript
// State management
const [filters, setFilters] = useState<CourseFilters>({});
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState('relevance');
const [page, setPage] = useState(1);

// Data fetching
const { data, isLoading, isError } = useCourses({
  ...filters,
  search: searchQuery,
  ordering: sortBy,
  page,
});
```

---

## Phase 5B: Course Detail Page (Priority: P0)

### 5B.1: Create TDD Tests for CourseDetail Page
**Duration:** 45 minutes  
**TDD:** Yes - Write failing tests first  
**Output:** Comprehensive test suite

**Test Coverage:**
- [ ] Renders loading state
- [ ] Fetches course by slug
- [ ] Displays course info (title, description, price)
- [ ] Shows instructor details
- [ ] Lists available cohorts
- [ ] Shows curriculum/modules
- [ ] Handles 404 (course not found)
- [ ] Error state handling
- [ ] Enroll button functionality
- [ ] Back navigation

**Test file:** `/frontend/src/pages/__tests__/CourseDetailPage.test.tsx`

### 5B.2: Create CourseDetail Page Component (GREEN Phase)
**Duration:** 1.5 hours  
**Output:** Full course detail page

**Features:**
- Course hero with image
- Course info sidebar
- Instructor bio
- Cohorts list with enrollment CTAs
- Curriculum breakdown
- Reviews section
- Related courses
- Breadcrumbs
- SEO meta tags

**File:** `/frontend/src/pages/CourseDetailPage.tsx`

**Component Structure:**
```typescript
// Get slug from URL
const { slug } = useParams<{ slug: string }>();

// Fetch course detail
const { data: course, isLoading: courseLoading } = useCourseDetail(slug!);

// Fetch course cohorts
const { data: cohorts } = useCourseCohorts(slug!);
```

### 5B.3: Create CourseCard Component (Refactor)
**Duration:** 30 minutes  
**Output:** Reusable course card

**Extract from:** TrainingSchedule.tsx common patterns  
**Features:**
- Thumbnail image
- Title & subtitle
- Price display
- Rating
- Level badge
- Duration
- CTA button
- Hover effects

**File:** `/frontend/src/components/CourseCard.tsx`

---

## Phase 5C: Search Functionality (Priority: P1)

### 5C.1: Create TDD Tests for Search Component
**Duration:** 30 minutes  
**TDD:** Yes - Write failing tests first

**Test Coverage:**
- [ ] Debounced search input
- [ ] Shows search results
- [ ] Loading state during search
- [ ] Empty results handling
- [ ] Clear search button
- [ ] Click to navigate to course

**Test file:** `/frontend/src/components/__tests__/SearchDialog.test.tsx`

### 5C.2: Create Search Component (GREEN Phase)
**Duration:** 45 minutes  
**Output:** Global search component

**Features:**
- Command/Dialog pattern (CMD+K)
- Debounced search (300ms)
- Real-time results
- Keyboard navigation
- Highlight matches
- Recent searches
- Empty state

**File:** `/frontend/src/components/SearchDialog.tsx`

**Implementation:**
```typescript
// Use existing Command component
// Search hook with debounce
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);
const { data: results, isLoading } = useCourses({
  search: debouncedQuery,
  page: 1,
});
```

### 5C.3: Integrate Search into Navigation
**Duration:** 15 minutes  
**Output:** Search accessible globally

**Implementation:**
- Add search trigger to Navigation.tsx
- CMD+K keyboard shortcut
- Mobile search button

---

## Phase 5D: Refinement & Polish

### 5D.1: Create Loading Skeletons
**Duration:** 30 minutes  
**Output:** Page-level skeletons

**Skeletons:**
- CoursesPage skeleton (grid + sidebar)
- CourseDetailPage skeleton (hero + content)
- Search results skeleton

### 5D.2: Add Error Boundaries
**Duration:** 20 minutes  
**Output:** Error fallback UI

**Implementation:**
- React ErrorBoundary
- Fallback component
- Retry functionality
- Error logging

### 5D.3: Add SEO Meta Tags
**Duration:** 20 minutes  
**Output:** SEO optimized pages

**Implementation:**
- react-helmet-async for meta tags
- Dynamic titles/descriptions
- OpenGraph tags
- Structured data (JSON-LD)

---

## Phase 5E: Validation & Documentation

### 5E.1: TypeScript Validation
**Duration:** 15 minutes  
**Verification:** `npx tsc --noEmit` passes

### 5E.2: Component Testing
**Duration:** 30 minutes  
**Verification:** All TDD tests pass

### 5E.3: Integration Testing
**Duration:** 30 minutes  
**Manual tests:**
- Navigate between pages
- Filter courses
- Search functionality
- Course detail page loads
- Back button works
- URLs update correctly

### 5E.4: Performance Audit
**Duration:** 20 minutes  
**Checks:**
- Code splitting works
- Lazy loading verified
- Bundle size acceptable
- React Query caching effective

### 5E.5: Documentation Update
**Duration:** 15 minutes  
**Update:**
- STATUS_UPDATE.md with Phase 5 completion
- Architecture documentation
- Component usage guide

---

## Success Criteria

### Definition of Done
- [ ] Courses listing page fully functional
- [ ] Course detail page fully functional
- [ ] Search functionality working
- [ ] All UI states handled (loading, error, empty, success)
- [ ] TypeScript compilation passes
- [ ] All TDD tests pass
- [ ] Navigation between pages works smoothly
- [ ] SEO meta tags implemented
- [ ] Performance optimized (code splitting, lazy loading)
- [ ] Documentation updated

### Quality Metrics
- **Performance:** Page load < 2s, route transitions < 200ms
- **Accessibility:** All interactive elements keyboard accessible
- **SEO:** Proper meta tags, structured data
- **Test Coverage:** 90%+ for new components

---

## Technical Decisions

### Routing
- **Library:** react-router-dom v6
- **Pattern:** Declarative routing with lazy loading
- **Code Splitting:** Route-level splitting for performance

### Search
- **Debounce:** 300ms (balanced responsiveness vs API calls)
- **Implementation:** Command/Dialog pattern for UX consistency
- **Results:** Real-time with loading indicator

### State Management
- **URL State:** Filter/sort/page params in URL for shareability
- **React Query:** Server state with caching
- **Zustand:** Client state if needed

### Performance
- **Code Splitting:** React.lazy() for route components
- **Image Optimization:** Lazy loading for course images
- **Prefetching:** Hover prefetch for course cards

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large bundle size | Code splitting, lazy loading |
| Slow search | Debouncing, caching, 300ms delay |
| SEO issues | SSR preparation, meta tags, structured data |
| Mobile UX | Responsive design, touch targets, scroll performance |

---

## Ready to Start

Phase 5 plan complete. Ready to execute with TDD methodology.

**Estimated Total Duration:** 5-6 hours  
**Actual Start Time:** [To be filled]  
**Expected Completion:** [To be filled]

### Decision Point:
Should I proceed with all of Phase 5 or focus on specific parts?

**A) Full Phase 5** - Complete all (courses list, detail, search) - 5-6 hours  
**B) Phase 5A + 5B** - Course pages only, skip search for now - 4 hours  
**C) Phase 5A only** - Just courses listing page - 2.5 hours  

My recommendation: **Option A** - Full Phase 5 for complete user journey.

Ready to proceed? I'll start with the router setup and TDD tests.
