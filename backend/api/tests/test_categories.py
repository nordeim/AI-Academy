"""
Category API Tests

Tests for Category API endpoints including:
- List operations
- Retrieve by slug
- Ordering
- Course count annotation
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Category, Course


class CategoryAPITests(APITestCase):
    """Tests for Category API endpoints"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for all category tests"""
        cls.category_ai = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
            color="#4F46E5",
            icon="brain",
            order=1,
        )
        cls.category_ml = Category.objects.create(
            name="Machine Learning",
            slug="machine-learning",
            description="ML courses",
            color="#10B981",
            icon="cpu",
            order=2,
        )
        cls.category_data = Category.objects.create(
            name="Data Science",
            slug="data-science",
            description="Data science courses",
            color="#F59E0B",
            icon="chart",
            order=3,
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
        cls.course1.categories.add(cls.category_ai)

        cls.course2 = Course.objects.create(
            title="ML Basics",
            slug="ml-basics",
            subtitle="Learn ML",
            description="ML course",
            level="beginner",
            price=149.99,
            duration_weeks=10,
            duration_hours=50,
            status="published",
        )
        cls.course2.categories.add(cls.category_ai)

        cls.course3 = Course.objects.create(
            title="Advanced ML",
            slug="advanced-ml",
            subtitle="Advanced ML techniques",
            description="Advanced course",
            level="advanced",
            price=299.99,
            duration_weeks=16,
            duration_hours=80,
            status="published",
        )
        cls.course3.categories.add(cls.category_ml)


class TestCategoryList(CategoryAPITests):
    """Tests for category list endpoint"""

    def test_list_categories(self):
        """Verify category list returns all categories"""
        response = self.client.get(reverse("api:category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 3)

    def test_list_categories_ordered(self):
        """Verify categories are ordered by order field then name"""
        response = self.client.get(reverse("api:category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [c["slug"] for c in response.data["data"]]
        self.assertEqual(slugs, ["ai-fundamentals", "machine-learning", "data-science"])

    def test_list_categories_success_format(self):
        """Verify standardized response format"""
        response = self.client.get(reverse("api:category-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("success", response.data)
        self.assertIn("data", response.data)
        self.assertIn("message", response.data)
        self.assertIn("meta", response.data)
        self.assertTrue(response.data["success"])


class TestCategoryDetail(CategoryAPITests):
    """Tests for category detail endpoint"""

    def test_retrieve_category_by_slug(self):
        """Verify retrieving category by slug"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "ai-fundamentals"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["slug"], "ai-fundamentals")
        self.assertEqual(response.data["data"]["name"], "AI Fundamentals")

    def test_retrieve_nonexistent_category_404(self):
        """Verify 404 for non-existent category"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "nonexistent"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_category_includes_course_count(self):
        """Verify category includes course_count annotation"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "ai-fundamentals"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("course_count", response.data["data"])
        self.assertEqual(response.data["data"]["course_count"], 2)

    def test_category_ml_course_count(self):
        """Verify ML category has correct course count"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "machine-learning"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["course_count"], 1)

    def test_category_empty_course_count(self):
        """Verify category with no courses shows 0 count"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "data-science"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["course_count"], 0)


class TestCategoryFields(CategoryAPITests):
    """Tests for category field responses"""

    def test_category_includes_all_fields(self):
        """Verify category includes all expected fields"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "ai-fundamentals"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertIn("id", data)
        self.assertIn("name", data)
        self.assertIn("slug", data)
        self.assertIn("description", data)
        self.assertIn("color", data)
        self.assertIn("icon", data)
        self.assertIn("course_count", data)

    def test_category_color_format(self):
        """Verify color field format"""
        response = self.client.get(
            reverse("api:category-detail", kwargs={"slug": "ai-fundamentals"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["color"], "#4F46E5")
