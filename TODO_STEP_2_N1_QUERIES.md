# Step 2: N+1 Query Optimization - TDD Sub-Plan

**Issue:** #2 N+1 Query Optimization  
**Priority:** P0 - Critical  
**Methodology:** Test-Driven Development (TDD)  
**Estimated Time:** 1 hour  
**Started:** March 20, 2026

---

## Phase 1: Analysis & Planning

### Problem Definition
**N+1 Query Problem:** When fetching a list of items, Django performs 1 query for the list, then N additional queries for each item's related data.

**Current Impact:**
- Course list: 1 query + N queries for categories per course
- Cohort list: 1 query + N queries for course and instructor per cohort

### Root Cause Analysis
**File:** `/home/project/AI-Academy/backend/api/views.py`

Current implementations lack `select_related()` and `prefetch_related()`:

```python
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(status='published')  # No prefetch
    # Each course.categories hits DB again
```

```python
class CohortViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cohort.objects.filter(status__in=['upcoming', 'enrolling'])
    # Each cohort.course and cohort.instructor hits DB
```

### Affected Serializers
**CourseListSerializer** includes:
- `categories = CategorySerializer(many=True, read_only=True)` - ManyToMany
- Triggers query for each course's categories

**CohortSerializer** includes:
- `course_title = serializers.CharField(source='course.title', read_only=True)` - ForeignKey
- `instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)` - ForeignKey
- Triggers query for each cohort's course and instructor

### Solution Strategy
1. **CourseViewSet**: Add `prefetch_related('categories')` to fetch all categories in 2 queries
2. **CohortViewSet**: Add `select_related('course', 'instructor')` to fetch related objects via JOINs

### Expected Query Count Improvement
| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/courses/` | 1 + N | 2 | ~95% reduction |
| `/cohorts/` | 1 + 2N | 1 | ~99% reduction |

---

## Phase 2: TDD Implementation - RED Phase

### Test 1: Course Query Count
**Test File:** `/home/project/AI-Academy/backend/api/tests/test_performance.py`

```python
"""
Test API Performance - N+1 Query Detection
TDD Phase: RED - Tests should fail initially (high query count)
"""
from django.test import TestCase
from django.db import connection
from rest_framework.test import APITestCase
from courses.models import Course, Category
from django.contrib.auth import get_user_model

User = get_user_model()


class QueryCountTests(APITestCase):
    """Test database query optimization"""
    
    def setUp(self):
        """Create test data with multiple courses and categories"""
        # Create categories
        self.categories = []
        for i in range(3):
            cat = Category.objects.create(
                name=f'Category {i}',
                slug=f'category-{i}',
                color='#4f46e5'
            )
            self.categories.append(cat)
        
        # Create courses with categories
        self.courses = []
        for i in range(5):
            course = Course.objects.create(
                title=f'Course {i}',
                slug=f'course-{i}',
                subtitle=f'Subtitle {i}',
                description=f'Description {i}',
                level='intermediate',
                price=100.00,
                status='published',
                modules_count=5,
                duration_weeks=4,
                duration_hours=20
            )
            # Add categories (ManyToMany)
            course.categories.add(*self.categories[:2])
            self.courses.append(course)
    
    def test_course_list_query_count(self):
        """
        Test: Course list should use prefetch_related to avoid N+1
        Expected: < 5 queries for 5 courses
        Current (without optimization): 1 + 5 = 6 queries
        TDD Status: Should FAIL initially (6 queries), PASS after fix (2 queries)
        """
        with self.assertNumQueries(2):  # Expect 2 queries: courses + categories
            response = self.client.get('/api/v1/courses/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data['results']), 5)
    
    def test_course_detail_query_count(self):
        """
        Test: Course detail should use prefetch_related
        Expected: < 3 queries for single course
        """
        course = self.courses[0]
        
        with self.assertNumQueries(2):  # Course + categories
            response = self.client.get(f'/api/v1/courses/{course.slug}/')
            self.assertEqual(response.status_code, 200)
    
    def test_cohort_list_query_count(self):
        """
        Test: Cohort list should use select_related to avoid N+1
        Expected: < 3 queries for all cohorts
        Current (without optimization): 1 + 2N queries
        TDD Status: Should FAIL initially, PASS after fix
        """
        # Create instructor
        instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Instructor',
            is_instructor=True
        )
        
        # Create cohorts
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        for i in range(5):
            from courses.models import Cohort
            Cohort.objects.create(
                course=self.courses[i],
                start_date=timezone.now().date() + timedelta(days=30),
                end_date=timezone.now().date() + timedelta(days=60),
                format='online',
                spots_total=30,
                status='enrolling',
                instructor=instructor
            )
        
        with self.assertNumQueries(1):  # Single query with JOINs
            response = self.client.get('/api/v1/cohorts/')
            self.assertEqual(response.status_code, 200)
    
    def test_course_cohorts_action_query_count(self):
        """
        Test: Course cohorts action should be optimized
        Expected: < 3 queries
        """
        # Create instructor and cohorts
        instructor = User.objects.create_user(
            username='instructor2',
            email='instructor2@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Instructor',
            is_instructor=True
        )
        
        from datetime import timedelta
        from django.utils import timezone
        from courses.models import Cohort
        
        for i in range(3):
            Cohort.objects.create(
                course=self.courses[0],
                start_date=timezone.now().date() + timedelta(days=30 + i*10),
                end_date=timezone.now().date() + timedelta(days=60 + i*10),
                format='online',
                spots_total=30,
                status='enrolling',
                instructor=instructor
            )
        
        # This endpoint returns array directly (not paginated)
        with self.assertNumQueries(3):  # Course + cohorts + instructor
            response = self.client.get(f'/api/v1/courses/{self.courses[0].slug}/cohorts/')
            self.assertEqual(response.status_code, 200)
            self.assertIsInstance(response.data, list)
```

---

## Phase 3: Baseline Measurement

Before implementing fixes, measure current query counts:

```bash
# Enable SQL logging and test manually
python manage.py shell -c "
from django.db import connection
from django.test.utils import override_settings
from courses.models import Course
from rest_framework.test import APIClient

client = APIClient()

# Reset query log
connection.queries_log.clear()

# Make request
response = client.get('/api/v1/courses/')
print(f'Courses returned: {len(response.data[\"results\"])}')
print(f'Queries executed: {len(connection.queries)}')
for i, query in enumerate(connection.queries[:10]):
    print(f'{i+1}. {query[\"sql\"][:100]}...')
"
```

**Expected Baseline:**
- 1 query for courses
- 5 queries for categories (one per course)
- **Total: 6 queries for 5 courses**

---

## Phase 4: TDD Implementation - GREEN Phase

### Step 4.1: Fix CourseViewSet N+1
**File:** `/home/project/AI-Academy/backend/api/views.py`

```python
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    # Original: queryset = Course.objects.filter(status='published')
    # Fixed: Add prefetch_related
    queryset = Course.objects.filter(status='published').prefetch_related('categories')
    serializer_class = CourseListSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'categories__slug']
    search_fields = ['title', 'subtitle', 'description']
    ordering_fields = ['price', 'rating', 'created_at', 'enrolled_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset

    @action(detail=True, methods=['get'])
    def cohorts(self, request, slug=None):
        course = self.get_object()
        cohorts = course.cohorts.filter(
            status__in=['upcoming', 'enrolling'],
            start_date__gte=timezone.now().date()
        ).select_related('instructor')  # Optimize instructor lookup
        serializer = CohortSerializer(cohorts, many=True)
        return Response(serializer.data)
```

### Step 4.2: Fix CohortViewSet N+1
**File:** `/home/project/AI-Academy/backend/api/views.py`

```python
class CohortViewSet(viewsets.ReadOnlyModelViewSet):
    # Original: queryset = Cohort.objects.filter(status__in=['upcoming', 'enrolling'])
    # Fixed: Add select_related
    queryset = Cohort.objects.filter(
        status__in=['upcoming', 'enrolling']
    ).select_related('course', 'instructor')
    serializer_class = CohortSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'format', 'status']
    ordering_fields = ['start_date', 'price']
    ordering = ['start_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by upcoming
        queryset = queryset.filter(start_date__gte=timezone.now().date())
        
        return queryset
```

---

## Phase 5: Verification & Testing

### Step 5.1: Run Performance Tests
```bash
python manage.py test api.tests.test_performance -v 2
```

### Step 5.2: Manual Query Count Verification
```bash
python manage.py shell -c "
from django.db import connection
from rest_framework.test import APIClient

client = APIClient()

# Test courses
connection.queries_log.clear()
response = client.get('/api/v1/courses/')
print(f'Courses: {len(connection.queries)} queries')

# Test cohorts
connection.queries_log.clear()
response = client.get('/api/v1/cohorts/')
print(f'Cohorts: {len(connection.queries)} queries')
"
```

### Expected Results After Fix
- `/courses/`: **2 queries** (courses + categories prefetch)
- `/cohorts/`: **1 query** (cohorts with JOINs)
- `/courses/{slug}/cohorts/`: **3 queries** (course + cohorts + instructor)

---

## Phase 6: REFACTOR Phase

### Code Review Checklist
- [ ] No redundant queries in serializers
- [ ] Prefetch_related used for ManyToMany/Reverse FK
- [ ] Select_related used for ForeignKey
- [ ] Query count is minimal for each endpoint
- [ ] No degradation in functionality

### Performance Monitoring
Consider adding Django Debug Toolbar to monitor queries in development:
```python
# settings/development.py
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

---

## Phase 7: Documentation Update

### Update ACCOMPLISHMENTS.md
Add section on N+1 query optimization with metrics.

### Update API_Usage_Guide.md
Add performance note:
```markdown
## Performance Notes

All list endpoints are optimized with:
- **Prefetching**: Categories loaded efficiently for course lists
- **Select Related**: Course and instructor data fetched via JOINs for cohorts

Expected response times:
- Course list: < 100ms (paginated, 20 items)
- Cohort list: < 50ms
```

---

## Success Criteria

- [ ] All query count tests pass
- [ ] Course list uses ≤ 2 queries for any page size
- [ ] Cohort list uses 1 query
- [ ] No functionality regression
- [ ] Documentation updated

---

## Definition of Done

- [ ] TDD cycle complete (RED-GREEN-REFACTOR)
- [ ] All performance tests pass
- [ ] Manual query count verified
- [ ] ACCOMPLISHMENTS.md updated
- [ ] API_Usage_Guide.md updated
- [ ] No breaking changes
- [ ] Code reviewed

---

## Current Status

**Phase:** 1 - Analysis & Planning ✅  
**Next Action:** Execute Phase 2 (Create test file)

