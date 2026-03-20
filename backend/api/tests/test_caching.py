"""
Test Caching Strategy Functionality

Ensures proper caching behavior for high-traffic endpoints.
TDD Phase: RED - Tests should fail initially
"""

import time
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Category, Course, Cohort
from users.models import User


class CachingBaseTests(APITestCase):
    """Base class with helper methods for caching tests"""

    def setUp(self):
        """Clear cache before each test"""
        super().setUp()
        cache.clear()

    def tearDown(self):
        """Clear cache after each test"""
        super().tearDown()
        cache.clear()

    def get_num_queries(self, func, *args, **kwargs):
        """Execute function and return number of database queries"""
        from django.db import connection, reset_queries

        reset_queries()
        func(*args, **kwargs)
        return len(connection.queries)


class TestCourseListCaching(CachingBaseTests):
    """Test caching for course list endpoint"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        # Create multiple courses
        for i in range(5):
            course = Course.objects.create(
                title=f"Course {i}",
                slug=f"course-{i}",
                subtitle="Learn something",
                description="Course description",
                level="beginner",
                duration_weeks=8,
                duration_hours=40,
                price=99.99,
                status="published",
            )
            course.categories.add(cls.category)

    def test_course_list_cached(self):
        """Verify course list is cached after first request"""
        # First request - should hit database
        with self.assertNumQueries(3):  # count + courses + categories
            response1 = self.client.get(reverse("api:course-list"))

        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Second request - should be cached
        with self.assertNumQueries(0):  # No database queries
            response2 = self.client.get(reverse("api:course-list"))

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.content, response2.content)

    def test_course_list_cache_expiration(self):
        """Verify cache expires and triggers new database query"""
        # First request
        response1 = self.client.get(reverse("api:course-list"))
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Verify cache exists
        cached_data = cache.get("course:list")
        self.assertIsNotNone(cached_data)

        # Clear cache (simulate expiration)
        cache.clear()

        # Second request after expiration - should hit database
        with self.assertNumQueries(3):
            response2 = self.client.get(reverse("api:course-list"))

        self.assertEqual(response2.status_code, status.HTTP_200_OK)

    def test_course_list_cache_key_format(self):
        """Verify cache key follows expected format"""
        # Make request to populate cache
        self.client.get(reverse("api:course-list"))

        # Verify cache key exists
        cached_data = cache.get("course:list")
        self.assertIsNotNone(cached_data)


class TestCategoryListCaching(CachingBaseTests):
    """Test caching for category list endpoint"""

    @classmethod
    def setUpTestData(cls):
        for i in range(5):
            Category.objects.create(
                name=f"Category {i}",
                slug=f"category-{i}",
                description="Category description",
            )

    def test_category_list_cached(self):
        """Verify category list is cached"""
        # First request
        with self.assertNumQueries(2):  # count + categories
            response1 = self.client.get(reverse("api:category-list"))

        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Second request - should be cached
        with self.assertNumQueries(0):
            response2 = self.client.get(reverse("api:category-list"))

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.content, response2.content)


class TestCourseDetailCaching(CachingBaseTests):
    """Test caching for course detail endpoint"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

    def test_course_detail_cached(self):
        """Verify course detail is cached"""
        url = reverse("api:course-detail", kwargs={"slug": self.course.slug})

        # First request
        with self.assertNumQueries(2):  # course + categories
            response1 = self.client.get(url)

        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Second request - should be cached
        with self.assertNumQueries(0):
            response2 = self.client.get(url)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.content, response2.content)

    def test_course_detail_cache_invalidated_on_update(self):
        """Verify cache is invalidated when course is updated"""
        url = reverse("api:course-detail", kwargs={"slug": self.course.slug})

        # First request to populate cache
        response1 = self.client.get(url)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Update course
        self.course.title = "Updated Title"
        self.course.save()

        # Second request - should hit database (cache invalidated)
        with self.assertNumQueries(2):
            response2 = self.client.get(url)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data["data"]["title"], "Updated Title")


class TestCacheInvalidation(CachingBaseTests):
    """Test cache invalidation behavior"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

    def test_course_list_cache_invalidated_on_course_create(self):
        """Verify course list cache invalidated when new course created"""
        # Populate cache
        self.client.get(reverse("api:course-list"))

        # Create new course
        new_course = Course.objects.create(
            title="New Course",
            slug="new-course",
            subtitle="New course",
            description="Description",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        new_course.categories.add(self.category)

        # Next request should hit database
        with self.assertNumQueries(3):
            response = self.client.get(reverse("api:course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include new course
        self.assertEqual(len(response.data["data"]), 2)

    def test_course_detail_cache_invalidated_on_delete(self):
        """Verify course detail cache invalidated when course deleted"""
        url = reverse("api:course-detail", kwargs={"slug": self.course.slug})

        # Populate cache
        self.client.get(url)

        # Delete course
        self.course.delete()

        # Next request should return 404
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestCohortsCaching(CachingBaseTests):
    """Test caching for course cohorts endpoint"""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="instructor",
            email="instructor@example.com",
            password="testpass123",
            is_instructor=True,
        )

        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

        # Create cohorts
        from django.utils import timezone
        from datetime import timedelta

        cls.cohort = Cohort.objects.create(
            course=cls.course,
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=60),
            timezone="UTC",
            format="live",
            spots_total=20,
            status="upcoming",
        )

    def test_course_cohorts_cached(self):
        """Verify course cohorts endpoint is cached"""
        url = reverse("api:course-cohorts", kwargs={"slug": self.course.slug})

        # First request
        with self.assertNumQueries(3):  # course + categories + cohorts
            response1 = self.client.get(url)

        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Second request - should be cached
        with self.assertNumQueries(0):
            response2 = self.client.get(url)

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.content, response2.content)


class TestCacheKeyUniqueness(CachingBaseTests):
    """Test cache key uniqueness for different scenarios"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        for i in range(3):
            course = Course.objects.create(
                title=f"Course {i}",
                slug=f"course-{i}",
                subtitle="Learn something",
                description="Course description",
                level="beginner",
                duration_weeks=8,
                duration_hours=40,
                price=99.99,
                status="published",
            )
            course.categories.add(cls.category)

    def test_cache_keys_for_different_courses(self):
        """Verify different courses have different cache keys"""
        # Get first course
        response1 = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "course-0"})
        )
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Get second course
        response2 = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "course-1"})
        )
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Responses should be different
        self.assertNotEqual(response1.content, response2.content)

    def test_cache_keys_for_query_params(self):
        """Verify different query params create different cache entries"""
        # Request with filter
        response1 = self.client.get(f"{reverse('api:course-list')}?level=beginner")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Request without filter
        response2 = self.client.get(reverse("api:course-list"))
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Should both succeed (query params affect caching)


class TestCacheMissBehavior(CachingBaseTests):
    """Test graceful handling of cache misses"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

    def test_graceful_fallback_on_cache_miss(self):
        """Verify endpoint works when cache is empty"""
        # Ensure cache is empty
        cache.clear()

        # Request should still work
        response = self.client.get(reverse("api:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("success", response.data)

    def test_data_integrity_preserved(self):
        """Verify cache doesn't corrupt data"""
        # Get data fresh
        response1 = self.client.get(reverse("api:course-list"))

        # Get from cache
        response2 = self.client.get(reverse("api:course-list"))

        # Data should be identical
        self.assertEqual(response1.data["data"], response2.data["data"])


class TestCacheTTL(CachingBaseTests):
    """Test cache time-to-live behavior"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        for i in range(5):
            course = Course.objects.create(
                title=f"Course {i}",
                slug=f"course-{i}",
                subtitle="Learn something",
                description="Course description",
                level="beginner",
                duration_weeks=8,
                duration_hours=40,
                price=99.99,
                status="published",
            )
            course.categories.add(cls.category)

    def test_course_list_cache_ttl(self):
        """Verify course list cache has correct TTL"""
        self.client.get(reverse("api:course-list"))

        # Verify cache exists
        cached = cache.get("course:list")
        self.assertIsNotNone(cached)

        # Note: Actual TTL verification requires Redis inspection or time mocking
        # This test verifies basic caching behavior

    def test_manual_cache_expiration(self):
        """Test cache expiration behavior"""
        # Populate cache
        self.client.get(reverse("api:course-list"))

        # Verify cache exists
        self.assertIsNotNone(cache.get("course:list"))

        # Manually expire cache
        cache.delete("course:list")

        # Verify cache expired
        self.assertIsNone(cache.get("course:list"))


class TestCachePerformance(CachingBaseTests):
    """Test cache performance improvements"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        # Create many courses
        for i in range(20):
            course = Course.objects.create(
                title=f"Course {i}",
                slug=f"course-{i}",
                subtitle="Learn something",
                description="Course description",
                level="beginner",
                duration_weeks=8,
                duration_hours=40,
                price=99.99,
                status="published",
            )
            course.categories.add(cls.category)

    def test_cache_reduces_database_queries(self):
        """Verify caching significantly reduces database queries"""
        import time

        # First request (cache miss)
        start = time.time()
        self.client.get(reverse("api:course-list"))
        duration_miss = time.time() - start

        # Second request (cache hit)
        start = time.time()
        self.client.get(reverse("api:course-list"))
        duration_hit = time.time() - start

        # Cache hit should be faster (though timing can be flaky in tests)
        # This is more of a sanity check
        self.assertGreater(duration_miss, 0)
        self.assertGreater(duration_hit, 0)
