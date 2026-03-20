"""
Test suite for Admin Fieldset Corrections
Step 11: Fixes type errors in users/admin.py fieldsets
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.contrib.admin.sites import AdminSite
from users.admin import CustomUserAdmin
from users.models import User

User = get_user_model()


class AdminFieldsetTests(TestCase):
    """Test admin fieldset configuration and functionality."""

    def setUp(self):
        """Set up test data."""
        self.site = AdminSite()
        self.admin = CustomUserAdmin(User, self.site)
        self.superuser = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="adminpass123"
        )
        self.regular_user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.client = Client()
        self.client.login(username="admin", password="adminpass123")

    def test_fieldsets_is_list_type(self):
        """Verify fieldsets is a list (not tuple) for proper type safety."""
        self.assertIsInstance(
            self.admin.fieldsets,
            list,
            "fieldsets should be a list type for LSP compatibility",
        )

    def test_fieldsets_contains_required_sections(self):
        """Verify all required fieldset sections are present."""
        fieldset_names = [name for name, opts in self.admin.fieldsets]

        # Check for Django default sections
        self.assertIn(None, fieldset_names)  # Basic info section
        self.assertIn("Personal info", fieldset_names)
        self.assertIn("Permissions", fieldset_names)
        self.assertIn("Important dates", fieldset_names)

        # Check for custom sections
        self.assertIn(
            "Profile", fieldset_names, "Custom Profile section should be present"
        )
        self.assertIn("Roles", fieldset_names, "Custom Roles section should be present")

    def test_profile_section_has_correct_fields(self):
        """Verify Profile section contains expected fields."""
        profile_section = next(
            (name, opts) for name, opts in self.admin.fieldsets if name == "Profile"
        )

        fields = profile_section[1].get("fields", ())
        expected_fields = (
            "phone",
            "bio",
            "avatar",
            "company",
            "title",
            "linkedin_url",
            "github_url",
        )

        for field in expected_fields:
            self.assertIn(field, fields, f"Profile section should contain {field}")

    def test_roles_section_has_correct_fields(self):
        """Verify Roles section contains expected fields."""
        roles_section = next(
            (name, opts) for name, opts in self.admin.fieldsets if name == "Roles"
        )

        fields = roles_section[1].get("fields", ())
        expected_fields = ("is_student", "is_instructor")

        for field in expected_fields:
            self.assertIn(field, fields, f"Roles section should contain {field}")

    def test_list_display_configuration(self):
        """Verify list_display is configured correctly."""
        expected_display = [
            "email",
            "username",
            "first_name",
            "last_name",
            "is_student",
            "is_instructor",
            "created_at",
        ]

        self.assertEqual(self.admin.list_display, expected_display)

    def test_list_filter_configuration(self):
        """Verify list_filter is configured correctly."""
        expected_filters = ["is_student", "is_instructor", "is_staff", "is_active"]

        self.assertEqual(self.admin.list_filter, expected_filters)

    def test_search_fields_configuration(self):
        """Verify search_fields is configured correctly."""
        expected_search = ["email", "username", "first_name", "last_name"]

        self.assertEqual(self.admin.search_fields, expected_search)

    def test_ordering_configuration(self):
        """Verify ordering is configured correctly."""
        self.assertEqual(self.admin.ordering, ["-created_at"])

    def test_fieldsets_no_type_error_on_instantiation(self):
        """Verify CustomUserAdmin can be instantiated without type errors."""
        try:
            admin_instance = CustomUserAdmin(User, self.site)
            self.assertIsNotNone(admin_instance.fieldsets)
        except TypeError as e:
            self.fail(f"CustomUserAdmin instantiation raised TypeError: {e}")


class AdminCoursesTests(TestCase):
    """Test courses admin configuration."""

    def setUp(self):
        """Set up test data."""
        self.superuser = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="adminpass123"
        )
        self.client = Client()
        self.client.login(username="admin", password="adminpass123")

    def test_category_admin_config(self):
        """Verify Category admin configuration."""
        from courses.admin import CategoryAdmin
        from courses.models import Category

        site = AdminSite()
        admin = CategoryAdmin(Category, site)

        self.assertEqual(admin.list_display, ["name", "slug", "order", "course_count"])
        self.assertEqual(admin.list_editable, ["order"])
        self.assertEqual(admin.search_fields, ["name"])
        self.assertIn("slug", admin.prepopulated_fields)

    def test_course_admin_config(self):
        """Verify Course admin configuration."""
        from courses.admin import CourseAdmin
        from courses.models import Course

        site = AdminSite()
        admin = CourseAdmin(Course, site)

        expected_display = [
            "title",
            "level",
            "price",
            "rating",
            "enrolled_count",
            "status",
            "is_featured",
            "created_at",
        ]
        self.assertEqual(admin.list_display, expected_display)

    def test_cohort_admin_config(self):
        """Verify Cohort admin configuration."""
        from courses.admin import CohortAdmin
        from courses.models import Cohort

        site = AdminSite()
        admin = CohortAdmin(Cohort, site)

        self.assertEqual(admin.list_filter, ["status", "format", "start_date"])
        self.assertIn("spots_remaining", admin.list_display)

    def test_enrollment_admin_config(self):
        """Verify Enrollment admin configuration."""
        from courses.admin import EnrollmentAdmin
        from courses.models import Enrollment

        site = AdminSite()
        admin = EnrollmentAdmin(Enrollment, site)

        expected_display = [
            "user",
            "course",
            "cohort",
            "amount_paid",
            "status",
            "created_at",
        ]
        self.assertEqual(admin.list_display, expected_display)
