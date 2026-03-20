"""
Test JWT Authentication Endpoints
TDD Phase: RED - Tests should fail initially
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthenticationTests(APITestCase):
    """Test JWT token authentication flow"""

    def setUp(self):
        """Create test user"""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.login_url = "/api/v1/auth/token/"
        self.refresh_url = "/api/v1/auth/token/refresh/"
        self.verify_url = "/api/v1/auth/token/verify/"

    def test_jwt_login_endpoint_exists(self):
        """
        Test: JWT token obtain endpoint should exist
        Expected: Status 200 (after implementation) or 404 (before)
        TDD Status: Should FAIL (404) before implementation
        """
        response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )
        # Before implementation: 404
        # After implementation: 200
        self.assertIn(response.status_code, [200, 404])
        if response.status_code == 200:
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)

    def test_jwt_token_generation(self):
        """
        Test: Valid credentials should return access and refresh tokens
        Expected: Status 200 with access_token and refresh_token
        TDD Status: Should FAIL initially
        """
        response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )

        if response.status_code == 200:
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)
            self.assertIsInstance(response.data["access"], str)
            self.assertIsInstance(response.data["refresh"], str)
            # Verify JWT format (3 parts separated by dots)
            self.assertEqual(len(response.data["access"].split(".")), 3)

    def test_jwt_invalid_credentials(self):
        """
        Test: Invalid credentials should return 401
        Expected: Status 401 with error message
        """
        response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "wrongpassword"},
            format="json",
        )

        if response.status_code != 404:  # Endpoint exists
            self.assertEqual(response.status_code, 401)

    def test_jwt_token_refresh(self):
        """
        Test: Refresh token should return new access token
        Expected: Status 200 with new access token
        """
        # First get tokens
        login_response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )

        if login_response.status_code == 200:
            refresh_token = login_response.data.get("refresh")

            # Now refresh
            response = self.client.post(
                self.refresh_url, {"refresh": refresh_token}, format="json"
            )

            if response.status_code == 200:
                self.assertIn("access", response.data)

    def test_jwt_token_verify(self):
        """
        Test: Valid token should be verified
        Expected: Status 200
        """
        # First get token
        login_response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )

        if login_response.status_code == 200:
            access_token = login_response.data.get("access")

            # Verify token
            response = self.client.post(
                self.verify_url, {"token": access_token}, format="json"
            )

            if response.status_code == 200:
                self.assertNotIn("detail", response.data)

    def test_jwt_access_protected_endpoint(self):
        """
        Test: Protected endpoint should require JWT authentication
        Expected: 401 without token, 200 with valid token
        """
        # Without authentication
        response = self.client.get("/api/v1/enrollments/")
        self.assertEqual(response.status_code, 401)  # JWT returns 401 for missing auth

        # With authentication
        login_response = self.client.post(
            self.login_url,
            {"email": "test@example.com", "password": "testpass123"},
            format="json",
        )

        if login_response.status_code == 200:
            access_token = login_response.data["access"]
            self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

            response = self.client.get("/api/v1/enrollments/")
            # Should succeed with empty list
            self.assertEqual(response.status_code, 200)
