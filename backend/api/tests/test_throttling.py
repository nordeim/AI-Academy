"""
Test API Rate Limiting
TDD Phase: RED - Tests should fail initially
"""

from django.test import TestCase
from rest_framework.test import APITestCase
from courses.models import Course, Cohort, Category, Enrollment
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone

User = get_user_model()


class RateLimitingTests(APITestCase):
    """Test API rate limiting functionality"""

    def setUp(self):
        """Create test data"""
        # Create user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        # Create category and course
        self.category = Category.objects.create(
            name="Test Category", slug="test-category", color="#4f46e5"
        )

        self.course = Course.objects.create(
            title="Test Course",
            slug="test-course",
            subtitle="Test Subtitle",
            description="Test Description",
            level="intermediate",
            price=100.00,
            status="published",
            modules_count=5,
            duration_weeks=4,
            duration_hours=20,
        )
        self.course.categories.add(self.category)

        # Create cohort
        self.cohort = Cohort.objects.create(
            course=self.course,
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=60),
            format="online",
            spots_total=10,
            spots_reserved=0,
            status="enrolling",
        )

    def test_anonymous_rate_limiting(self):
        """
        Test: Anonymous requests are rate limited
        Expected: 429 after exceeding 100/hour
        TDD: Should FAIL initially (no throttling)
        """
        # Make requests until we hit the limit
        # Using 102 to ensure we exceed the limit
        last_response = None
        for i in range(102):
            response = self.client.get("/api/v1/courses/")
            last_response = response
            if response.status_code == 429:
                break

        # Should have been throttled
        self.assertEqual(last_response.status_code, 429)
        self.assertIn("throttled", str(last_response.data).lower())

    def test_authenticated_rate_limiting(self):
        """
        Test: Authenticated requests are rate limited
        Expected: 429 after exceeding 1000/hour
        TDD: Should FAIL initially
        """
        self.client.force_authenticate(user=self.user)

        # Make requests until we hit the limit
        # Using 1002 to ensure we exceed the limit
        last_response = None
        for i in range(1002):
            response = self.client.get("/api/v1/enrollments/")
            last_response = response
            if response.status_code == 429:
                break

        self.assertEqual(last_response.status_code, 429)
        self.assertIn("throttled", str(last_response.data).lower())

    def test_enrollment_throttle(self):
        """
        Test: Enrollment endpoint has stricter rate limit
        Expected: 429 after 10 requests per minute
        TDD: Should FAIL initially
        """
        self.client.force_authenticate(user=self.user)

        # Make enrollment requests
        last_response = None
        for i in range(12):
            response = self.client.post(
                "/api/v1/enrollments/",
                {
                    "course": str(self.course.id),
                    "cohort": str(self.cohort.id),
                    "amount_paid": "100.00",
                },
            )
            last_response = response
            if response.status_code == 429:
                break

        # Should have been throttled
        self.assertEqual(last_response.status_code, 429)

    def test_rate_limits_per_user(self):
        """
        Test: Rate limits are per user/IP, not global
        Expected: Different users have separate limits
        """
        # Make requests as user 1 until throttled
        self.client.force_authenticate(user=self.user)

        for i in range(102):
            response = self.client.get("/api/v1/courses/")
            if response.status_code == 429:
                break

        # Now create user 2
        user2 = User.objects.create_user(
            username="testuser2",
            email="test2@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User2",
        )

        # Switch to user 2
        self.client.force_authenticate(user=user2)

        # User 2 should be able to make requests
        response = self.client.get("/api/v1/courses/")
        self.assertEqual(response.status_code, 200)

    def test_throttle_response_format(self):
        """
        Test: Throttle response has correct format
        Expected: 429 with detail message
        """
        # Exceed rate limit
        last_response = None
        for i in range(102):
            response = self.client.get("/api/v1/courses/")
            last_response = response
            if response.status_code == 429:
                break

        self.assertEqual(last_response.status_code, 429)
        self.assertIn("throttled", str(last_response.data).lower())
