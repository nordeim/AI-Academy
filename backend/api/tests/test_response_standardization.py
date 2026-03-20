"""
Test suite for API Response Standardization

Ensures all API responses follow a consistent format:
- Success responses: {success: true, data: {...}, message: "...", meta: {...}}
- Error responses: {success: false, data: null, message: "...", errors: {...}, meta: {...}}
"""

import json
import re
from datetime import datetime
from uuid import UUID

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from courses.models import Category, Course, Cohort
from users.models import User


class ResponseFormatBaseTests(APITestCase):
    """Base class with helper methods for response format validation"""

    def assertResponseStructure(self, response, expected_status):
        """Verify response has standard structure"""
        self.assertIn("success", response.data)
        self.assertIsInstance(response.data["success"], bool)
        self.assertIn("message", response.data)
        self.assertIsInstance(response.data["message"], str)
        self.assertIn("meta", response.data)
        self.assertIsInstance(response.data["meta"], dict)

    def assertSuccessResponse(self, response):
        """Verify success response format"""
        self.assertResponseStructure(response, 200)
        self.assertTrue(response.data["success"])
        self.assertIn("data", response.data)
        self.assertIsNotNone(response.data["data"])

    def assertErrorResponse(self, response, expected_status):
        """Verify error response format"""
        self.assertResponseStructure(response, expected_status)
        self.assertFalse(response.data["success"])
        self.assertIn("errors", response.data)
        self.assertIsInstance(response.data["errors"], dict)

    def assertMetaStructure(self, response):
        """Verify meta section has required fields"""
        meta = response.data.get("meta", {})
        self.assertIn("timestamp", meta)
        # Verify timestamp is ISO 8601 format
        try:
            datetime.fromisoformat(meta["timestamp"].replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            self.fail(f"Timestamp '{meta.get('timestamp')}' is not valid ISO 8601")
        self.assertIn("request_id", meta)
        # Verify request_id is a valid UUID
        try:
            UUID(meta["request_id"])
        except (ValueError, AttributeError):
            self.fail(f"request_id '{meta.get('request_id')}' is not a valid UUID")


class TestSuccessResponseFormat(ResponseFormatBaseTests):
    """Test standard success response format"""

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

    def test_course_list_success_response(self):
        """Verify course list returns standardized success response"""
        response = self.client.get(reverse("api:course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)
        self.assertMetaStructure(response)

        # Verify data is present
        self.assertIsInstance(response.data["data"], list)
        self.assertGreater(len(response.data["data"]), 0)

        # Verify message
        self.assertIsInstance(response.data["message"], str)
        self.assertGreater(len(response.data["message"]), 0)

    def test_course_detail_success_response(self):
        """Verify course detail returns standardized success response"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": self.course.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)
        self.assertMetaStructure(response)

        # Verify data contains course details
        self.assertIsInstance(response.data["data"], dict)
        self.assertIn("title", response.data["data"])
        self.assertEqual(response.data["data"]["title"], self.course.title)

    def test_category_list_success_response(self):
        """Verify category list returns standardized success response"""
        response = self.client.get(reverse("api:category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)
        self.assertMetaStructure(response)

        # Verify data is list
        self.assertIsInstance(response.data["data"], list)

    def test_cohort_list_success_response(self):
        """Verify cohort list returns standardized success response"""
        Cohort.objects.create(
            course=self.course,
            start_date="2026-06-01",
            end_date="2026-08-01",
            timezone="UTC",
            format="live",
            spots_total=20,
            status="upcoming",
        )

        response = self.client.get(reverse("api:cohort-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)
        self.assertMetaStructure(response)


class TestErrorResponseFormat(ResponseFormatBaseTests):
    """Test standardized error response formats"""

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
        cls.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_404_not_found_error(self):
        """Verify 404 errors have standardized format"""
        response = self.client.get(
            reverse("api:course-detail", kwargs={"slug": "non-existent-course"})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertErrorResponse(response, 404)
        self.assertMetaStructure(response)

        # Verify error message
        self.assertIsInstance(response.data["message"], str)
        self.assertGreater(len(response.data["message"]), 0)

    def test_401_unauthorized_error(self):
        """Verify 401 errors have standardized format"""
        # Try to access protected enrollment endpoint without auth
        response = self.client.get(reverse("api:enrollment-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertErrorResponse(response, 401)
        self.assertMetaStructure(response)

    def test_400_validation_error_format(self):
        """Verify validation errors have standardized format with field errors"""
        self.client.force_authenticate(user=self.user)

        # Try to create enrollment with invalid data
        response = self.client.post(
            reverse("api:enrollment-list"), data={}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertErrorResponse(response, 400)
        self.assertMetaStructure(response)

        # Verify errors object exists
        errors = response.data.get("errors", {})
        self.assertIsInstance(errors, dict)

    def test_field_level_validation_errors(self):
        """Verify field-level errors are in errors object"""
        self.client.force_authenticate(user=self.user)

        # Try to create enrollment missing required fields
        response = self.client.post(
            reverse("api:enrollment-list"),
            data={"course": 99999, "cohort": 99999},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertErrorResponse(response, 400)

        # Check that errors contains field-specific errors
        errors = response.data.get("errors", {})
        # Fields should have error arrays
        for field_name, error_list in errors.items():
            self.assertIsInstance(error_list, list)
            self.assertGreater(len(error_list), 0)

    def test_non_field_errors_format(self):
        """Verify non-field errors are in errors.non_field_errors"""
        self.client.force_authenticate(user=self.user)

        cohort = Cohort.objects.create(
            course=self.course,
            start_date="2026-06-01",
            end_date="2026-08-01",
            timezone="UTC",
            format="live",
            spots_total=1,
            spots_reserved=1,  # Full cohort
            status="enrolling",
        )

        # Try to enroll in full cohort
        response = self.client.post(
            reverse("api:enrollment-list"),
            data={"course": self.course.id, "cohort": cohort.id, "amount_paid": 99.99},
            format="json",
        )

        if response.status_code == 400:
            self.assertErrorResponse(response, 400)
            errors = response.data.get("errors", {})
            # Should have either field-level or non_field_errors
            self.assertTrue(
                any(field in errors for field in ["cohort", "non_field_errors"]),
                "Expected cohort or non_field_errors in errors",
            )


class TestCustomActionResponseFormat(ResponseFormatBaseTests):
    """Test that custom actions return standardized responses"""

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

        cls.cohort = Cohort.objects.create(
            course=cls.course,
            start_date="2026-06-01",
            end_date="2026-08-01",
            timezone="UTC",
            format="live",
            spots_total=20,
            status="upcoming",
        )

    def test_course_cohorts_action_response(self):
        """Verify /courses/{slug}/cohorts/ returns standardized response"""
        response = self.client.get(
            reverse("api:course-cohorts", kwargs={"slug": self.course.slug})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # CRITICAL: Should return wrapped response, NOT raw array
        self.assertIn("success", response.data)
        self.assertTrue(response.data["success"])
        self.assertIn("data", response.data)
        self.assertIsInstance(response.data["data"], list)
        self.assertMetaStructure(response)

        # Verify message
        self.assertIn("message", response.data)
        self.assertIsInstance(response.data["message"], str)


class TestPaginationMetadata(ResponseFormatBaseTests):
    """Test that list responses include pagination metadata"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )

        # Create multiple courses for pagination
        for i in range(15):
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

    def test_pagination_metadata_structure(self):
        """Verify paginated responses include pagination metadata"""
        response = self.client.get(reverse("api:course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)

        # Check meta.pagination exists
        meta = response.data.get("meta", {})
        self.assertIn("pagination", meta)
        pagination = meta["pagination"]

        # Verify pagination fields
        expected_fields = [
            "count",
            "page",
            "pages",
            "page_size",
            "has_next",
            "has_previous",
        ]
        for field in expected_fields:
            self.assertIn(field, pagination, f"Missing pagination field: {field}")

        # Verify types
        self.assertIsInstance(pagination["count"], int)
        self.assertIsInstance(pagination["page"], int)
        self.assertIsInstance(pagination["pages"], int)
        self.assertIsInstance(pagination["page_size"], int)
        self.assertIsInstance(pagination["has_next"], bool)
        self.assertIsInstance(pagination["has_previous"], bool)

    def test_pagination_values(self):
        """Verify pagination values are correct"""
        response = self.client.get(f"{reverse('api:course-list')}?page=1&page_size=10")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        meta = response.data.get("meta", {})
        pagination = meta.get("pagination", {})

        # We created 15 courses, page_size=10
        self.assertEqual(pagination["count"], 15)
        self.assertEqual(pagination["page"], 1)
        self.assertEqual(pagination["page_size"], 10)
        self.assertEqual(pagination["pages"], 2)  # 15 items / 10 per page = 2 pages
        self.assertTrue(pagination["has_next"])
        self.assertFalse(pagination["has_previous"])


class TestRequestIdGeneration(ResponseFormatBaseTests):
    """Test that each response has a unique request_id"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        Course.objects.create(
            title="Test Course",
            slug="test-course",
            subtitle="Test",
            description="Test",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )

    def test_request_id_is_unique(self):
        """Verify each request gets a unique request_id"""
        response1 = self.client.get(reverse("api:course-list"))
        response2 = self.client.get(reverse("api:course-list"))

        request_id_1 = response1.data.get("meta", {}).get("request_id")
        request_id_2 = response2.data.get("meta", {}).get("request_id")

        self.assertIsNotNone(request_id_1)
        self.assertIsNotNone(request_id_2)
        self.assertNotEqual(
            request_id_1,
            request_id_2,
            "Request IDs should be unique for different requests",
        )


class TestTimestampConsistency(ResponseFormatBaseTests):
    """Test timestamp format consistency"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        Course.objects.create(
            title="Test Course",
            slug="test-course",
            subtitle="Test",
            description="Test",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )

    def test_timestamp_iso_format(self):
        """Verify timestamps are in ISO 8601 format with timezone"""
        response = self.client.get(reverse("api:course-list"))

        timestamp = response.data.get("meta", {}).get("timestamp")
        self.assertIsNotNone(timestamp)

        # Should be valid ISO 8601
        try:
            parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            self.assertIsNotNone(parsed.tzinfo)  # Should be timezone-aware
        except ValueError:
            self.fail(f"Timestamp '{timestamp}' is not valid ISO 8601 format")


class TestEdgeCases(ResponseFormatBaseTests):
    """Test edge cases and special scenarios"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Test Course",
            slug="test-course",
            subtitle="Test",
            description="Test",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )

    def test_empty_list_response(self):
        """Verify empty lists still follow standard format"""
        # Filter to get no results
        response = self.client.get(
            f"{reverse('api:course-list')}?search=xyznonexistent"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertSuccessResponse(response)
        self.assertIsInstance(response.data["data"], list)
        self.assertEqual(len(response.data["data"]), 0)

    def test_success_message_varies_by_endpoint(self):
        """Verify success messages are context-appropriate"""
        # List endpoint
        list_response = self.client.get(reverse("api:course-list"))
        self.assertIn("retrieved", list_response.data["message"].lower())


class TestBackwardCompatibility(ResponseFormatBaseTests):
    """Ensure changes don't break existing functionality"""

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

    def test_data_content_preserved(self):
        """Verify data content is preserved in standardized response"""
        response = self.client.get(reverse("api:course-list"))

        data = response.data["data"]
        self.assertIsInstance(data, list)

        if len(data) > 0:
            course = data[0]
            # Verify essential fields exist
            expected_fields = ["id", "slug", "title", "price", "level"]
            for field in expected_fields:
                self.assertIn(field, course)
