"""
Test suite for Field-Level Permissions
Step 13: Serializers hide sensitive fields based on user authentication

TDD Approach: RED → GREEN → REFACTOR
Tests written before implementation to define expected behavior.
"""

from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from courses.models import Category, Course, Cohort
from api.serializers import CourseListSerializer, CourseDetailSerializer
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


class FieldLevelPermissionTests(TestCase):
    """Test field-level permissions based on user authentication."""

    def setUp(self):
        """Set up test data."""
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpass123"
        )
        self.category = Category.objects.create(
            name="AI Engineering", slug="ai-engineering", color="#4f46e5", icon="Cpu"
        )
        self.course = Course.objects.create(
            title="AI Engineering Bootcamp",
            slug="ai-engineering-bootcamp",
            subtitle="Master production-grade AI development",
            description="Comprehensive bootcamp covering transformer architectures...",
            level="intermediate",
            modules_count=12,
            duration_weeks=8,
            duration_hours=40,
            price=2499.00,
            rating=4.8,
            review_count=127,
            enrolled_count=89,
            status="published",
            is_featured=True,
        )
        self.course.categories.add(self.category)

    def _create_serializer(self, serializer_class, instance, user=None):
        """Helper to create serializer with request context."""
        request = self.factory.get("/api/v1/courses/")
        if user:
            request.user = user
        else:
            request.user = AnonymousUser()
        context = {"request": request}
        return serializer_class(instance, context=context)

    def test_course_list_anonymous_cannot_see_enrolled_count(self):
        """Anonymous users should NOT see enrolled_count in CourseListSerializer."""
        serializer = self._create_serializer(
            CourseListSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertNotIn(
            "enrolled_count", data, "Anonymous users should not see enrolled_count"
        )

    def test_course_list_anonymous_can_see_public_fields(self):
        """Anonymous users should see public fields in CourseListSerializer."""
        serializer = self._create_serializer(
            CourseListSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertIn("title", data)
        self.assertIn("price", data)
        self.assertIn("rating", data)
        self.assertIn("review_count", data)

    def test_course_list_authenticated_can_see_enrolled_count(self):
        """Authenticated users should see enrolled_count in CourseListSerializer."""
        serializer = self._create_serializer(
            CourseListSerializer, self.course, user=self.user
        )
        data = serializer.data
        self.assertIn(
            "enrolled_count", data, "Authenticated users should see enrolled_count"
        )
        self.assertEqual(data["enrolled_count"], 89)

    def test_course_list_authenticated_can_see_all_fields(self):
        """Authenticated users should see all fields in CourseListSerializer."""
        serializer = self._create_serializer(
            CourseListSerializer, self.course, user=self.user
        )
        data = serializer.data
        # Should include all fields
        expected_fields = [
            "id",
            "slug",
            "title",
            "subtitle",
            "thumbnail",
            "thumbnail_alt",
            "categories",
            "level",
            "modules_count",
            "duration_weeks",
            "price",
            "original_price",
            "discount_percentage",
            "currency",
            "rating",
            "review_count",
            "enrolled_count",
            "is_featured",
        ]
        for field in expected_fields:
            self.assertIn(field, data, f"Field {field} should be present")

    def test_course_detail_anonymous_cannot_see_enrolled_count(self):
        """Anonymous users should NOT see enrolled_count in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertNotIn(
            "enrolled_count",
            data,
            "Anonymous users should not see enrolled_count in detail",
        )

    def test_course_detail_anonymous_cannot_see_created_at(self):
        """Anonymous users should NOT see created_at in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertNotIn(
            "created_at", data, "Anonymous users should not see created_at"
        )

    def test_course_detail_anonymous_cannot_see_updated_at(self):
        """Anonymous users should NOT see updated_at in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertNotIn(
            "updated_at", data, "Anonymous users should not see updated_at"
        )

    def test_course_detail_anonymous_can_see_public_fields(self):
        """Anonymous users should see public fields in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=None
        )
        data = serializer.data
        self.assertIn("title", data)
        self.assertIn("description", data)
        self.assertIn("price", data)
        self.assertIn("rating", data)
        self.assertIn("review_count", data)

    def test_course_detail_authenticated_can_see_enrolled_count(self):
        """Authenticated users should see enrolled_count in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=self.user
        )
        data = serializer.data
        self.assertIn(
            "enrolled_count",
            data,
            "Authenticated users should see enrolled_count in detail",
        )

    def test_course_detail_authenticated_can_see_created_at(self):
        """Authenticated users should see created_at in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=self.user
        )
        data = serializer.data
        self.assertIn("created_at", data, "Authenticated users should see created_at")

    def test_course_detail_authenticated_can_see_updated_at(self):
        """Authenticated users should see updated_at in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=self.user
        )
        data = serializer.data
        self.assertIn("updated_at", data, "Authenticated users should see updated_at")

    def test_course_detail_authenticated_can_see_all_fields(self):
        """Authenticated users should see all fields in CourseDetailSerializer."""
        serializer = self._create_serializer(
            CourseDetailSerializer, self.course, user=self.user
        )
        data = serializer.data
        # Should include all fields including sensitive ones
        expected_sensitive_fields = ["enrolled_count", "created_at", "updated_at"]
        for field in expected_sensitive_fields:
            self.assertIn(
                field, data, f"Field {field} should be present for authenticated users"
            )

    def test_serializer_without_context_does_not_crash(self):
        """Serializer should not crash when request not in context."""
        serializer = CourseListSerializer(self.course)
        data = serializer.data
        # Should work without context (defaults to hiding sensitive fields)
        self.assertIn("title", data)

    def test_serializer_with_none_context_does_not_crash(self):
        """Serializer should not crash when context is None."""
        serializer = CourseListSerializer(self.course, context={})
        data = serializer.data
        # Should work with empty context (defaults to hiding sensitive fields)
        self.assertIn("title", data)


class FieldLevelPermissionEdgeCaseTests(TestCase):
    """Test edge cases for field-level permissions."""

    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpass123"
        )
        self.category = Category.objects.create(
            name="AI Engineering", slug="ai-engineering", color="#4f46e5"
        )
        self.course = Course.objects.create(
            title="AI Engineering Bootcamp",
            slug="ai-engineering-bootcamp",
            subtitle="Master production-grade AI development",
            level="intermediate",
            modules_count=12,
            duration_weeks=8,
            duration_hours=40,
            price=2499.00,
            enrolled_count=89,
            status="published",
        )

    def test_staff_user_can_see_all_fields(self):
        """Staff users should see all fields."""
        staff_user = User.objects.create_user(
            username="staff",
            email="staff@test.com",
            password="testpass123",
            is_staff=True,
        )
        request = self.factory.get("/api/v1/courses/")
        request.user = staff_user
        serializer = CourseDetailSerializer(self.course, context={"request": request})
        data = serializer.data
        self.assertIn("enrolled_count", data)
        self.assertIn("created_at", data)

    def test_instructor_user_can_see_all_fields(self):
        """Instructor users should see all fields."""
        instructor_user = User.objects.create_user(
            username="instructor",
            email="instructor@test.com",
            password="testpass123",
            is_instructor=True,
        )
        request = self.factory.get("/api/v1/courses/")
        request.user = instructor_user
        serializer = CourseDetailSerializer(self.course, context={"request": request})
        data = serializer.data
        self.assertIn("enrolled_count", data)

    def test_enrolled_user_can_see_all_fields(self):
        """Enrolled users should see all fields."""
        # Create enrollment for user
        from courses.models import Cohort, Enrollment

        cohort = Cohort.objects.create(
            course=self.course,
            start_date="2026-04-01",
            end_date="2026-06-01",
            spots_total=50,
            status="enrolling",
        )
        Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=cohort,
            amount_paid=2499.00,
            status="confirmed",
        )
        request = self.factory.get("/api/v1/courses/")
        request.user = self.user
        serializer = CourseDetailSerializer(self.course, context={"request": request})
        data = serializer.data
        self.assertIn("enrolled_count", data)
