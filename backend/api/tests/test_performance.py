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
                name=f"Category {i}", slug=f"category-{i}", color="#4f46e5"
            )
            self.categories.append(cat)

        # Create courses with categories
        self.courses = []
        for i in range(5):
            course = Course.objects.create(
                title=f"Course {i}",
                slug=f"course-{i}",
                subtitle=f"Subtitle {i}",
                description=f"Description {i}",
                level="intermediate",
                price=100.00,
                status="published",
                modules_count=5,
                duration_weeks=4,
                duration_hours=20,
            )
            # Add categories (ManyToMany)
            course.categories.add(*self.categories[:2])
            self.courses.append(course)

    def test_course_list_query_count(self):
        """
        Test: Course list should use prefetch_related to avoid N+1
        Expected: < 5 queries for 5 courses
        Before optimization: 17 queries (N+1 from categories)
        After optimization: 3 queries (count + courses + categories prefetch)
        """
        with self.assertNumQueries(3):  # count + courses + categories prefetch
            response = self.client.get("/api/v1/courses/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data["data"]), 5)

    def test_course_detail_query_count(self):
        """
        Test: Course detail should use prefetch_related
        Expected: < 3 queries for single course
        """
        course = self.courses[0]

        with self.assertNumQueries(2):  # Course + categories
            response = self.client.get(f"/api/v1/courses/{course.slug}/")
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
            username="instructor",
            email="instructor@example.com",
            password="testpass123",
            first_name="Test",
            last_name="Instructor",
            is_instructor=True,
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
                format="online",
                spots_total=30,
                status="enrolling",
                instructor=instructor,
            )

        with self.assertNumQueries(2):  # count + cohorts with JOINs
            response = self.client.get("/api/v1/cohorts/")
            self.assertEqual(response.status_code, 200)

    def test_course_cohorts_action_query_count(self):
        """
        Test: Course cohorts action should be optimized
        Expected: < 3 queries
        """
        # Create instructor and cohorts
        instructor = User.objects.create_user(
            username="instructor2",
            email="instructor2@example.com",
            password="testpass123",
            first_name="Test",
            last_name="Instructor",
            is_instructor=True,
        )

        from datetime import timedelta
        from django.utils import timezone
        from courses.models import Cohort

        for i in range(3):
            Cohort.objects.create(
                course=self.courses[0],
                start_date=timezone.now().date() + timedelta(days=30 + i * 10),
                end_date=timezone.now().date() + timedelta(days=60 + i * 10),
                format="online",
                spots_total=30,
                status="enrolling",
                instructor=instructor,
            )

        # This endpoint returns array directly (not paginated)
        with self.assertNumQueries(3):  # Course + cohorts + instructor
            response = self.client.get(
                f"/api/v1/courses/{self.courses[0].slug}/cohorts/"
            )
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data["data"], list)
