"""
Test Enrollment Business Logic
TDD Phase: RED - Tests should fail initially
"""

from django.test import TestCase
from django.db import transaction
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Course, Cohort, Enrollment, Category
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone

User = get_user_model()


class EnrollmentBusinessLogicTests(APITestCase):
    """Test enrollment business rules and validation"""

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

        # Create category
        self.category = Category.objects.create(
            name="Test Category", slug="test-category", color="#4f46e5"
        )

        # Create course
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

        # Create cohort with available spots
        self.cohort = Cohort.objects.create(
            course=self.course,
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=60),
            format="online",
            spots_total=10,
            spots_reserved=0,
            status="enrolling",
        )

        # Authenticate
        self.client.force_authenticate(user=self.user)

    def test_enrollment_fails_when_cohort_full(self):
        """
        Test: Cannot enroll when cohort has no spots remaining
        Expected: 400 Bad Request with error message
        TDD: Should FAIL initially (allows enrollment), PASS after fix
        """
        # Fill the cohort
        self.cohort.spots_reserved = self.cohort.spots_total
        self.cohort.save()

        response = self.client.post(
            "/api/v1/enrollments/",
            {
                "course": str(self.course.id),
                "cohort": str(self.cohort.id),
                "amount_paid": "100.00",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cohort", str(response.data).lower())

    def test_enrollment_fails_when_already_enrolled(self):
        """
        Test: Cannot enroll twice in same cohort
        Expected: 400 Bad Request
        TDD: Should FAIL initially (allows duplicate), PASS after fix
        """
        # Create first enrollment
        Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="confirmed",
        )
        self.cohort.spots_reserved = 1
        self.cohort.save()

        # Attempt duplicate
        response = self.client.post(
            "/api/v1/enrollments/",
            {
                "course": str(self.course.id),
                "cohort": str(self.cohort.id),
                "amount_paid": "100.00",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        error_text = str(response.data)
        self.assertTrue(
            "already enrolled" in error_text.lower()
            or "duplicate" in error_text.lower()
            or "unique" in error_text.lower()
        )

    def test_successful_enrollment_increments_spots_reserved(self):
        """
        Test: Creating enrollment increments cohort.spots_reserved
        Expected: spots_reserved increases by 1
        TDD: Should FAIL initially (no increment), PASS after fix
        """
        initial_spots = self.cohort.spots_reserved

        response = self.client.post(
            "/api/v1/enrollments/",
            {
                "course": str(self.course.id),
                "cohort": str(self.cohort.id),
                "amount_paid": "100.00",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Refresh cohort from DB
        self.cohort.refresh_from_db()
        self.assertEqual(self.cohort.spots_reserved, initial_spots + 1)

    def test_enrollment_starts_as_pending(self):
        """
        Test: New enrollment has status 'pending'
        Expected: status='pending'
        TDD: Should FAIL initially (no status set), PASS after fix
        """
        response = self.client.post(
            "/api/v1/enrollments/",
            {
                "course": str(self.course.id),
                "cohort": str(self.cohort.id),
                "amount_paid": "100.00",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "pending")

    def test_cancel_enrollment_decrements_spots_reserved(self):
        """
        Test: Cancelling enrollment decrements cohort.spots_reserved
        Expected: spots_reserved decreases by 1
        TDD: Should FAIL initially (no decrement), PASS after fix
        """
        # Create enrollment
        enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="confirmed",
        )
        self.cohort.spots_reserved = 1
        self.cohort.save()

        response = self.client.post(f"/api/v1/enrollments/{enrollment.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh cohort
        self.cohort.refresh_from_db()
        self.assertEqual(self.cohort.spots_reserved, 0)

    def test_cancel_already_cancelled_fails(self):
        """
        Test: Cannot cancel already cancelled enrollment
        Expected: 400 Bad Request
        TDD: Should FAIL initially (allows re-cancel), PASS after fix
        """
        enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="cancelled",
        )

        response = self.client.post(f"/api/v1/enrollments/{enrollment.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_updates_enrollment_status(self):
        """
        Test: Cancelling updates enrollment status to 'cancelled'
        Expected: status='cancelled'
        TDD: Should FAIL initially, PASS after fix
        """
        enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="confirmed",
        )
        self.cohort.spots_reserved = 1
        self.cohort.save()

        response = self.client.post(f"/api/v1/enrollments/{enrollment.id}/cancel/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh enrollment
        enrollment.refresh_from_db()
        self.assertEqual(enrollment.status, "cancelled")

    def test_enrollment_requires_authentication(self):
        """
        Test: Cannot enroll without authentication
        Expected: 401 Unauthorized
        """
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/v1/enrollments/",
            {
                "course": str(self.course.id),
                "cohort": str(self.cohort.id),
                "amount_paid": "100.00",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_only_see_own_enrollments(self):
        """
        Test: User can only see their own enrollments
        Expected: Only user's enrollments in list
        """
        # Create another user and their enrollment
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpass123",
            first_name="Other",
            last_name="User",
        )

        Enrollment.objects.create(
            user=other_user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="confirmed",
        )

        # Create enrollment for current user
        Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="confirmed",
        )

        response = self.client.get("/api/v1/enrollments/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see 1 enrollment (current user's)
        self.assertEqual(response.data["count"], 1)
