"""
Test API Documentation (drf-spectacular)

Tests verify that API documentation endpoints are accessible and valid.
"""

from django.test import TestCase
from rest_framework.test import APIClient


class APIDocumentationTests(TestCase):
    """Test API documentation endpoints"""

    def setUp(self):
        self.client = APIClient()

    def test_schema_endpoint_accessible(self):
        """Test that the OpenAPI schema endpoint is accessible"""
        response = self.client.get("/api/schema/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("application/vnd.oai.openapi", response["Content-Type"])

    def test_schema_has_required_sections(self):
        """Test that the schema includes required API sections"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        # Check for OpenAPI version (YAML format)
        self.assertIn("openapi:", content)

        # Check for info section (YAML format)
        self.assertIn("info:", content)
        self.assertIn("title:", content)

        # Check for paths (YAML format)
        self.assertIn("paths:", content)

    def test_schema_has_courses_endpoints(self):
        """Test that the schema includes courses endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("courses", content)

    def test_schema_has_categories_endpoints(self):
        """Test that the schema includes categories endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("categories", content)

    def test_schema_has_cohorts_endpoints(self):
        """Test that the schema includes cohorts endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("cohorts", content)

    def test_schema_has_enrollments_endpoints(self):
        """Test that the schema includes enrollments endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("enrollments", content)

    def test_schema_has_auth_endpoints(self):
        """Test that the schema includes authentication endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        # JWT endpoints
        self.assertIn("token", content)

        # Registration endpoint
        self.assertIn("register", content)

    def test_schema_has_user_endpoints(self):
        """Test that the schema includes user endpoints"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("users", content)

    def test_schema_has_security_schemes(self):
        """Test that the schema includes JWT security scheme"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("securitySchemes:", content)
        self.assertIn("bearerAuth:", content)

    def test_schema_has_components(self):
        """Test that the schema includes components/schemas"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("components:", content)
        self.assertIn("schemas:", content)

    def test_schema_has_tags(self):
        """Test that the schema includes tags"""
        response = self.client.get("/api/schema/")
        content = response.content.decode("utf-8")

        self.assertIn("tags:", content)


class SwaggerUITests(TestCase):
    """Test Swagger UI endpoint"""

    def setUp(self):
        self.client = APIClient()

    def test_swagger_ui_accessible(self):
        """Test that Swagger UI is accessible"""
        response = self.client.get("/api/docs/")
        self.assertEqual(response.status_code, 200)

    def test_swagger_ui_returns_html(self):
        """Test that Swagger UI returns HTML content"""
        response = self.client.get("/api/docs/")
        self.assertIn("text/html", response.get("Content-Type", ""))


class RedocTests(TestCase):
    """Test ReDoc endpoint"""

    def setUp(self):
        self.client = APIClient()

    def test_redoc_accessible(self):
        """Test that ReDoc is accessible"""
        response = self.client.get("/api/redoc/")
        self.assertEqual(response.status_code, 200)

    def test_redoc_returns_html(self):
        """Test that ReDoc returns HTML content"""
        response = self.client.get("/api/redoc/")
        self.assertIn("text/html", response.get("Content-Type", ""))
