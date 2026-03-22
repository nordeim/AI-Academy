"""
Soft Delete Tests

TDD Test Suite for soft delete functionality
Tests cover soft delete, restore, manager filtering, and API handling

Expected: These tests will FAIL initially (RED phase)
After implementation: All tests should PASS (GREEN phase)

@module courses/tests/test_soft_delete
"""

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from courses.models import Category, Course, Cohort, Enrollment
from users.models import User


class CourseSoftDeleteTests(TestCase):
    """Tests for Course soft delete functionality"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for soft delete tests"""
        cls.category = Category.objects.create(
            name="AI Engineering",
            slug="ai-engineering",
            description="AI courses",
        )

        cls.course = Course.objects.create(
            title="AI Bootcamp",
            slug="ai-bootcamp",
            subtitle="Learn AI",
            description="Comprehensive AI course",
            level="advanced",
            price=2499.00,
            duration_weeks=12,
            duration_hours=120,
            status="published",
        )
        cls.course.categories.add(cls.category)

    def test_course_has_deleted_at_field(self):
        """Test that Course model has deleted_at field"""
        # This will fail until deleted_at is added to model
        self.assertTrue(hasattr(self.course, "deleted_at"))

    def test_course_soft_delete_sets_deleted_at(self):
        """Test that delete() sets deleted_at timestamp"""
        # Initially should be None
        self.assertIsNone(self.course.deleted_at)

        # Soft delete
        self.course.delete()
        self.course.refresh_from_db()

        # Should have deleted_at timestamp
        self.assertIsNotNone(self.course.deleted_at)
        self.assertIsInstance(self.course.deleted_at, timezone.datetime)

    def test_course_still_exists_after_soft_delete(self):
        """Test that soft deleted course still exists in database"""
        course_id = self.course.id
        self.course.delete()

        # Should still exist in database (via all_objects)
        self.assertTrue(Course.objects.all_objects().filter(id=course_id).exists())

    def test_course_manager_excludes_soft_deleted(self):
        """Test that default manager excludes soft deleted records"""
        course_id = self.course.id
        self.course.delete()

        # Should not appear in default queryset
        self.assertFalse(Course.objects.filter(id=course_id).exists())

        # But should exist with all_objects
        self.assertTrue(Course.objects.all_objects().filter(id=course_id).exists())

    def test_course_restore_clears_deleted_at(self):
        """Test that restore() clears deleted_at timestamp"""
        self.course.delete()
        self.course.refresh_from_db()

        # Restore
        self.course.restore()
        self.course.refresh_from_db()

        # deleted_at should be None again
        self.assertIsNone(self.course.deleted_at)

        # Should appear in default queryset
        self.assertTrue(Course.objects.filter(id=self.course.id).exists())


class CohortSoftDeleteTests(TestCase):
    """Tests for Cohort soft delete functionality"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for cohort soft delete tests"""
        cls.category = Category.objects.create(
            name="Data Science",
            slug="data-science",
        )

        cls.course = Course.objects.create(
            title="Data Science Bootcamp",
            slug="ds-bootcamp",
            subtitle="Learn DS",
            description="DS course",
            level="intermediate",
            price=1999.00,
            duration_weeks=8,
            duration_hours=80,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.cohort = Cohort.objects.create(
            course=cls.course,
            start_date="2025-04-01",
            end_date="2025-05-30",
            timezone="EST",
            format="online",
            spots_total=30,
            status="enrolling",
        )

    def test_cohort_has_deleted_at_field(self):
        """Test that Cohort model has deleted_at field"""
        self.assertTrue(hasattr(self.cohort, "deleted_at"))

    def test_cohort_soft_delete_sets_deleted_at(self):
        """Test that delete() sets deleted_at timestamp"""
        self.assertIsNone(self.cohort.deleted_at)

        self.cohort.delete()
        self.cohort.refresh_from_db()

        self.assertIsNotNone(self.cohort.deleted_at)

    def test_cohort_manager_excludes_soft_deleted(self):
        """Test that default manager excludes soft deleted cohorts"""
        cohort_id = self.cohort.id
        self.cohort.delete()

        self.assertFalse(Cohort.objects.filter(id=cohort_id).exists())
        # Use method call instead of attribute access
        self.assertTrue(Cohort.objects.all_objects().filter(id=cohort_id).exists())

    def test_cohort_restore_clears_deleted_at(self):
        """Test that restore() clears deleted_at"""
        self.cohort.delete()
        self.cohort.restore()
        self.cohort.refresh_from_db()

        self.assertIsNone(self.cohort.deleted_at)
        self.assertTrue(Cohort.objects.filter(id=self.cohort.id).exists())


class EnrollmentSoftDeleteTests(TestCase):
    """Tests for Enrollment soft delete functionality"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for enrollment soft delete tests"""
        cls.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )

        cls.category = Category.objects.create(
            name="Web Development",
            slug="web-dev",
        )

        cls.course = Course.objects.create(
            title="Web Dev Bootcamp",
            slug="web-dev-bootcamp",
            subtitle="Learn web dev",
            description="Web development course",
            level="beginner",
            price=999.00,
            duration_weeks=6,
            duration_hours=60,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.cohort = Cohort.objects.create(
            course=cls.course,
            start_date="2025-05-01",
            end_date="2025-06-30",
            timezone="EST",
            format="online",
            spots_total=25,
            status="enrolling",
        )

        cls.enrollment = Enrollment.objects.create(
            user=cls.user,
            course=cls.course,
            cohort=cls.cohort,
            amount_paid=999.00,
            currency="USD",
            status="pending",
        )

    def test_enrollment_has_deleted_at_field(self):
        """Test that Enrollment model has deleted_at field"""
        self.assertTrue(hasattr(self.enrollment, "deleted_at"))

    def test_enrollment_soft_delete_sets_deleted_at(self):
        """Test that delete() sets deleted_at timestamp"""
        self.assertIsNone(self.enrollment.deleted_at)

        self.enrollment.delete()
        self.enrollment.refresh_from_db()

        self.assertIsNotNone(self.enrollment.deleted_at)

    def test_enrollment_manager_excludes_soft_deleted(self):
        """Test that default manager excludes soft deleted enrollments"""
        enrollment_id = self.enrollment.id
        self.enrollment.delete()

        self.assertFalse(Enrollment.objects.filter(id=enrollment_id).exists())
        # Use method call instead of attribute access
        self.assertTrue(
            Enrollment.objects.all_objects().filter(id=enrollment_id).exists()
        )

    def test_enrollment_restore_clears_deleted_at(self):
        """Test that restore() clears deleted_at"""
        self.enrollment.delete()
        self.enrollment.restore()
        self.enrollment.refresh_from_db()

        self.assertIsNone(self.enrollment.deleted_at)
        self.assertTrue(Enrollment.objects.filter(id=self.enrollment.id).exists())


class SoftDeleteManagerTests(TestCase):
    """Tests for SoftDeleteManager functionality"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for manager tests"""
        cls.category = Category.objects.create(
            name="AI",
            slug="ai",
        )

        cls.active_course = Course.objects.create(
            title="Active Course",
            slug="active-course",
            subtitle="Active",
            description="Active course",
            level="beginner",
            price=100.00,
            duration_weeks=4,
            duration_hours=40,
            status="published",
        )
        cls.active_course.categories.add(cls.category)

        cls.deleted_course = Course.objects.create(
            title="Deleted Course",
            slug="deleted-course",
            subtitle="Deleted",
            description="Deleted course",
            level="intermediate",
            price=200.00,
            duration_weeks=6,
            duration_hours=60,
            status="published",
        )
        cls.deleted_course.categories.add(cls.category)
        cls.deleted_course.delete()  # Soft delete

    def test_objects_returns_only_active(self):
        """Test that objects manager returns only active records"""
        courses = Course.objects.all()
        self.assertEqual(courses.count(), 1)
        self.assertEqual(courses.first().title, "Active Course")

    def test_all_objects_returns_including_deleted(self):
        """Test that all_objects returns all records including deleted"""
        # all_objects() returns a QuerySet directly
        courses = Course.objects.all_objects()
        self.assertEqual(courses.count(), 2)

    def test_only_deleted_returns_only_soft_deleted(self):
        """Test that only_deleted returns only deleted records"""
        # only_deleted() returns a QuerySet directly
        deleted_courses = Course.objects.only_deleted()
        self.assertEqual(deleted_courses.count(), 1)
        self.assertEqual(deleted_courses.first().title, "Deleted Course")


class SoftDeleteAPITests(APITestCase):
    """Tests for API soft delete handling"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for API tests"""
        cls.category = Category.objects.create(
            name="ML",
            slug="ml",
        )

        cls.course = Course.objects.create(
            title="ML Course",
            slug="ml-course",
            subtitle="ML",
            description="ML course",
            level="advanced",
            price=500.00,
            duration_weeks=8,
            duration_hours=80,
            status="published",
        )
        cls.course.categories.add(cls.category)

    def test_api_list_excludes_soft_deleted(self):
        """Test that API list endpoint excludes soft deleted courses"""
        # Soft delete the course
        self.course.delete()

        # Get course list via API
        url = reverse("api:course-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Deleted course should not appear
        course_titles = [c["title"] for c in response.data["results"]]
        self.assertNotIn("ML Course", course_titles)

    def test_api_detail_returns_404_for_soft_deleted(self):
        """Test that API detail returns 404 for soft deleted course"""
        # Soft delete the course
        self.course.delete()

        # Try to get deleted course via API
        url = reverse("api:course-detail", kwargs={"slug": self.course.slug})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
