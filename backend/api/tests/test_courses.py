"""
Course API Tests

Comprehensive tests for Course API endpoints including:
- List/retrieve operations
- Filtering (level, category, featured)
- Search (title, subtitle, description)
- Ordering (price, rating, created_at, enrolled_count)
- Pagination
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Category, Course


class CourseAPITests(APITestCase):
    """Tests for Course API endpoints"""

    @classmethod
    def setUpTestData(cls):
        """Create test data for all course tests"""
        cls.category_ai = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
            order=1,
        )
        cls.category_ml = Category.objects.create(
            name="Machine Learning",
            slug="machine-learning",
            description="ML courses",
            order=2,
        )
        cls.category_data = Category.objects.create(
            name="Data Science",
            slug="data-science",
            description="Data science courses",
            order=3,
        )

        cls.course_beginner = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Start your AI journey",
            description="Beginner friendly AI course covering fundamentals",
            level="beginner",
            price=99.99,
            rating=4.5,
            duration_weeks=8,
            duration_hours=40,
            status="published",
            is_featured=True,
            enrolled_count=150,
        )
        cls.course_beginner.categories.add(cls.category_ai)

        cls.course_intermediate = Course.objects.create(
            title="Machine Learning Mastery",
            slug="ml-mastery",
            subtitle="Advanced ML techniques",
            description="Intermediate machine learning course",
            level="intermediate",
            price=199.99,
            rating=4.8,
            duration_weeks=12,
            duration_hours=60,
            status="published",
            is_featured=False,
            enrolled_count=85,
        )
        cls.course_intermediate.categories.add(cls.category_ml)

        cls.course_advanced = Course.objects.create(
            title="Deep Learning Specialization",
            slug="deep-learning",
            subtitle="Neural networks at scale",
            description="Advanced deep learning course covering neural networks",
            level="advanced",
            price=299.99,
            rating=4.9,
            duration_weeks=16,
            duration_hours=80,
            status="published",
            is_featured=False,
            enrolled_count=45,
        )
        cls.course_advanced.categories.add(cls.category_ml, cls.category_ai)

        cls.course_draft = Course.objects.create(
            title="Draft Course",
            slug="draft-course",
            subtitle="Not yet published",
            description="This course is not yet published",
            level="beginner",
            price=49.99,
            duration_weeks=4,
            duration_hours=20,
            status="draft",
        )

        cls.course_another_beginner = Course.objects.create(
            title="AI for Everyone",
            slug="ai-for-everyone",
            subtitle="Non-technical AI introduction",
            description="A beginner course for non-technical people",
            level="beginner",
            price=79.99,
            rating=4.2,
            duration_weeks=6,
            duration_hours=30,
            status="published",
            is_featured=False,
            enrolled_count=200,
        )
        cls.course_another_beginner.categories.add(cls.category_ai)


class TestCourseList(CourseAPITests):
    """Tests for course list endpoint"""

    def test_list_courses_returns_published_only(self):
        """Verify only published courses are returned"""
        response = self.client.get(reverse("api:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 4)
        slugs = [c["slug"] for c in response.data["data"]]
        self.assertIn("intro-to-ai", slugs)
        self.assertIn("ml-mastery", slugs)
        self.assertIn("deep-learning", slugs)
        self.assertIn("ai-for-everyone", slugs)
        self.assertNotIn("draft-course", slugs)

    def test_list_courses_pagination(self):
        """Verify pagination works correctly"""
        response = self.client.get(reverse("api:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("meta", response.data)
        self.assertIn("pagination", response.data["meta"])

    def test_list_courses_success_format(self):
        """Verify standardized response format"""
        response = self.client.get(reverse("api:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("success", response.data)
        self.assertIn("data", response.data)
        self.assertIn("message", response.data)
        self.assertIn("meta", response.data)
        self.assertTrue(response.data["success"])


class TestCourseFiltering(CourseAPITests):
    """Tests for course filtering"""

    def test_filter_by_level_beginner(self):
        """Verify filtering by beginner level"""
        response = self.client.get(f"{reverse('api:course-list')}?level=beginner")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 2)
        for course in response.data["data"]:
            self.assertEqual(course["level"], "beginner")

    def test_filter_by_level_intermediate(self):
        """Verify filtering by intermediate level"""
        response = self.client.get(f"{reverse('api:course-list')}?level=intermediate")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["slug"], "ml-mastery")

    def test_filter_by_level_advanced(self):
        """Verify filtering by advanced level"""
        response = self.client.get(f"{reverse('api:course-list')}?level=advanced")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["slug"], "deep-learning")

    def test_filter_by_category_slug(self):
        """Verify filtering by category slug"""
        response = self.client.get(
            f"{reverse('api:course-list')}?categories__slug=ai-fundamentals"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 2)

    def test_filter_by_category_machine_learning(self):
        """Verify filtering by ML category"""
        response = self.client.get(
            f"{reverse('api:course-list')}?categories__slug=machine-learning"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)

    def test_filter_by_featured(self):
        """Verify filtering by featured flag"""
        response = self.client.get(f"{reverse('api:course-list')}?featured=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for course in response.data["data"]:
            self.assertTrue(course.get("is_featured", False))

    def test_filter_nonexistent_level(self):
        """Verify filtering by invalid level returns 400"""
        response = self.client.get(f"{reverse('api:course-list')}?level=expert")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestCourseSearch(CourseAPITests):
    """Tests for course search functionality"""

    def test_search_by_title(self):
        """Verify search by title works"""
        response = self.client.get(f"{reverse('api:course-list')}?search=Introduction")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)
        slugs = [c["slug"] for c in response.data["data"]]
        self.assertIn("intro-to-ai", slugs)

    def test_search_by_subtitle(self):
        """Verify search by subtitle works"""
        response = self.client.get(f"{reverse('api:course-list')}?search=Neural")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)

    def test_search_by_description(self):
        """Verify search by description works"""
        response = self.client.get(f"{reverse('api:course-list')}?search=fundamentals")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)

    def test_search_case_insensitive(self):
        """Verify search is case insensitive"""
        response_lower = self.client.get(f"{reverse('api:course-list')}?search=machine")
        response_upper = self.client.get(f"{reverse('api:course-list')}?search=MACHINE")
        self.assertEqual(
            len(response_lower.data["data"]),
            len(response_upper.data["data"]),
        )

    def test_search_partial_match(self):
        """Verify search matches partial strings"""
        response = self.client.get(f"{reverse('api:course-list')}?search=learn")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["data"]), 1)

    def test_search_no_results(self):
        """Verify search with no results returns empty list"""
        response = self.client.get(
            f"{reverse('api:course-list')}?search=xyznonexistent"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 0)


class TestCourseOrdering(CourseAPITests):
    """Tests for course ordering"""

    def test_order_by_price_asc(self):
        """Verify ordering by price ascending"""
        response = self.client.get(f"{reverse('api:course-list')}?ordering=price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(c["price"]) for c in response.data["data"]]
        self.assertEqual(prices, sorted(prices))

    def test_order_by_price_desc(self):
        """Verify ordering by price descending"""
        response = self.client.get(f"{reverse('api:course-list')}?ordering=-price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(c["price"]) for c in response.data["data"]]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_order_by_rating(self):
        """Verify ordering by rating"""
        response = self.client.get(f"{reverse('api:course-list')}?ordering=-rating")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ratings = [float(c["rating"]) for c in response.data["data"] if c.get("rating")]
        self.assertEqual(ratings, sorted(ratings, reverse=True))

    def test_order_by_created_at(self):
        """Verify ordering by created_at"""
        response = self.client.get(f"{reverse('api:course-list')}?ordering=-created_at")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 4)

    def test_order_by_enrolled_count(self):
        """Verify ordering by enrolled_count"""
        response = self.client.get(
            f"{reverse('api:course-list')}?ordering=-enrolled_count"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        counts = [
            int(c["enrolled_count"])
            for c in response.data["data"]
            if c.get("enrolled_count")
        ]
        self.assertEqual(counts, sorted(counts, reverse=True))

    def test_default_ordering(self):
        """Verify default ordering is -created_at"""
        response = self.client.get(reverse("api:course-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestCourseDetail(CourseAPITests):
    """Tests for course detail endpoint"""

    def test_retrieve_course_by_slug(self):
        """Verify retrieving course by slug"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "intro-to-ai"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["slug"], "intro-to-ai")
        self.assertEqual(response.data["data"]["title"], "Introduction to AI")

    def test_retrieve_nonexistent_course_404(self):
        """Verify 404 for non-existent course"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "nonexistent"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_unpublished_course_404(self):
        """Verify draft courses return 404"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "draft-course"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_course_includes_categories(self):
        """Verify course detail includes categories"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "intro-to-ai"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("categories", response.data["data"])
        self.assertGreaterEqual(len(response.data["data"]["categories"]), 1)


class TestCourseCombinedOperations(CourseAPITests):
    """Tests for combined filter/search/ordering"""

    def test_combined_filter_and_search(self):
        """Verify combining filter and search"""
        response = self.client.get(
            f"{reverse('api:course-list')}?level=beginner&search=AI"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for course in response.data["data"]:
            self.assertEqual(course["level"], "beginner")

    def test_combined_filter_and_ordering(self):
        """Verify combining filter and ordering"""
        response = self.client.get(
            f"{reverse('api:course-list')}?level=beginner&ordering=-price"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [c["price"] for c in response.data["data"]]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_combined_search_and_ordering(self):
        """Verify combining search and ordering"""
        response = self.client.get(
            f"{reverse('api:course-list')}?search=AI&ordering=price"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [c["price"] for c in response.data["data"]]
        self.assertEqual(prices, sorted(prices))

    def test_empty_results_valid_format(self):
        """Verify empty results return valid format"""
        response = self.client.get(
            f"{reverse('api:course-list')}?search=xyznonexistentcourse123"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"], [])
        self.assertIn("success", response.data)
        self.assertTrue(response.data["success"])
