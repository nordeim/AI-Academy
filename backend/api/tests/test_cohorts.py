"""
Cohort API Tests

Tests for Cohort API endpoints including:
- List operations
- Filtering (course, format, status)
- Ordering (start_date, price)
- Related data (instructor, course)
"""

from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Category, Course, Cohort
from users.models import User


class CohortAPITests(APITestCase):
    """Tests for Cohort API endpoints"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for all cohort tests"""
        cls.instructor1 = User.objects.create_user(
            username="instructor1",
            email="instructor1@example.com",
            password="testpass123",
            is_instructor=True,
        )
        cls.instructor2 = User.objects.create_user(
            username="instructor2",
            email="instructor2@example.com",
            password="testpass123",
            is_instructor=True,
        )

        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        cls.course1 = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Start your AI journey",
            description="Beginner friendly AI course",
            level="beginner",
            price=99.99,
            duration_weeks=8,
            duration_hours=40,
            status="published",
        )
        cls.course1.categories.add(cls.category)

        cls.course2 = Course.objects.create(
            title="Machine Learning",
            slug="ml-course",
            subtitle="Learn ML",
            description="ML course",
            level="intermediate",
            price=199.99,
            duration_weeks=12,
            duration_hours=60,
            status="published",
        )
        cls.course2.categories.add(cls.category)

        today = date.today()

        cls.cohort_upcoming_live = Cohort.objects.create(
            course=cls.course1,
            start_date=today + timedelta(days=30),
            end_date=today + timedelta(days=60),
            timezone="UTC",
            format="live",
            instructor=cls.instructor1,
            spots_total=20,
            spots_reserved=5,
            status="upcoming",
            early_bird_price=79.99,
        )

        cls.cohort_enrolling_self = Cohort.objects.create(
            course=cls.course1,
            start_date=today + timedelta(days=45),
            end_date=today + timedelta(days=75),
            timezone="UTC",
            format="self-paced",
            instructor=cls.instructor2,
            spots_total=100,
            spots_reserved=25,
            status="enrolling",
            early_bird_price=89.99,
        )

        cls.cohort_another_course = Cohort.objects.create(
            course=cls.course2,
            start_date=today + timedelta(days=20),
            end_date=today + timedelta(days=50),
            timezone="UTC",
            format="live",
            instructor=cls.instructor1,
            spots_total=15,
            spots_reserved=10,
            status="upcoming",
            early_bird_price=149.99,
        )

        cls.cohort_past = Cohort.objects.create(
            course=cls.course1,
            start_date=today - timedelta(days=30),
            end_date=today - timedelta(days=1),
            timezone="UTC",
            format="live",
            instructor=cls.instructor1,
            spots_total=20,
            spots_reserved=20,
            status="completed",
        )

        cls.cohort_cancelled = Cohort.objects.create(
            course=cls.course1,
            start_date=today + timedelta(days=60),
            end_date=today + timedelta(days=90),
            timezone="UTC",
            format="live",
            instructor=cls.instructor2,
            spots_total=20,
            spots_reserved=0,
            status="cancelled",
        )


class TestCohortList(CohortAPITests):
    """Tests for cohort list endpoint"""

    def test_list_upcoming_cohorts(self):
        """Verify only upcoming/enrolling cohorts are returned"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for cohort in response.data["data"]:
            self.assertIn(cohort["status"], ["upcoming", "enrolling"])

    def test_list_excludes_past_cohorts(self):
        """Verify past cohorts are excluded"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [c["id"] for c in response.data["data"]]
        self.assertNotIn(str(self.cohort_past.id), ids)

    def test_list_success_format(self):
        """Verify standardized response format"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("success", response.data)
        self.assertIn("data", response.data)
        self.assertIn("message", response.data)
        self.assertTrue(response.data["success"])


class TestCohortFiltering(CohortAPITests):
    """Tests for cohort filtering"""

    def test_filter_by_course(self):
        """Verify filtering by course"""
        response = self.client.get(
            f"{reverse('api:cohort-list')}?course={self.course1.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for cohort in response.data["data"]:
            self.assertEqual(cohort["course_slug"], self.course1.slug)

    def test_filter_by_status_upcoming(self):
        """Verify filtering by upcoming status"""
        response = self.client.get(f"{reverse('api:cohort-list')}?status=upcoming")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for cohort in response.data["data"]:
            self.assertEqual(cohort["status"], "upcoming")

    def test_filter_by_status_enrolling(self):
        """Verify filtering by enrolling status"""
        response = self.client.get(f"{reverse('api:cohort-list')}?status=enrolling")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for cohort in response.data["data"]:
            self.assertEqual(cohort["status"], "enrolling")

    def test_filter_combined(self):
        """Verify combining filters"""
        response = self.client.get(
            f"{reverse('api:cohort-list')}?status=upcoming&course={self.course1.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestCohortOrdering(CohortAPITests):
    """Tests for cohort ordering"""

    def test_order_by_start_date_asc(self):
        """Verify ordering by start_date ascending"""
        response = self.client.get(f"{reverse('api:cohort-list')}?ordering=start_date")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dates = [c["start_date"] for c in response.data["data"]]
        self.assertEqual(dates, sorted(dates))

    def test_order_by_start_date_desc(self):
        """Verify ordering by start_date descending"""
        response = self.client.get(f"{reverse('api:cohort-list')}?ordering=-start_date")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dates = [c["start_date"] for c in response.data["data"]]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_default_ordering_is_start_date(self):
        """Verify default ordering is start_date ascending"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestCohortRelatedData(CohortAPITests):
    """Tests for cohort related data"""

    def test_cohort_includes_instructor(self):
        """Verify cohort includes instructor name"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if len(response.data["data"]) > 0:
            cohort = response.data["data"][0]
            self.assertIn("instructor_name", cohort)

    def test_cohort_includes_course_data(self):
        """Verify cohort includes course data"""
        response = self.client.get(reverse("api:cohort-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if len(response.data["data"]) > 0:
            cohort = response.data["data"][0]
            self.assertIn("course_title", cohort)
            self.assertIn("course_slug", cohort)


class TestCohortDetail(CohortAPITests):
    """Tests for cohort detail endpoint"""

    def test_retrieve_cohort_by_id(self):
        """Verify retrieving cohort by id"""
        response = self.client.get(
            reverse("api:cohort-detail", kwargs={"pk": self.cohort_upcoming_live.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            str(response.data["data"]["id"]), str(self.cohort_upcoming_live.id)
        )

    def test_retrieve_nonexistent_cohort_404(self):
        """Verify 404 for non-existent cohort"""
        response = self.client.get(
            reverse(
                "api:cohort-detail",
                kwargs={"pk": "00000000-0000-0000-0000-000000000000"},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestCohortFields(CohortAPITests):
    """Tests for cohort field responses"""

    def test_cohort_includes_all_expected_fields(self):
        """Verify cohort includes all expected fields"""
        response = self.client.get(
            reverse("api:cohort-detail", kwargs={"pk": self.cohort_upcoming_live.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertIn("id", data)
        self.assertIn("course_title", data)
        self.assertIn("course_slug", data)
        self.assertIn("start_date", data)
        self.assertIn("end_date", data)
        self.assertIn("timezone", data)
        self.assertIn("format", data)
        self.assertIn("instructor_name", data)
        self.assertIn("spots_total", data)
        self.assertIn("spots_remaining", data)
        self.assertIn("status", data)

    def test_cohort_spots_available(self):
        """Verify spots remaining calculation"""
        response = self.client.get(
            reverse("api:cohort-detail", kwargs={"pk": self.cohort_upcoming_live.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertIn("spots_remaining", data)
        self.assertGreaterEqual(data["spots_remaining"], 0)
