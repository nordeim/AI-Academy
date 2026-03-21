"""
Test Payment Processing Integration
TDD Phase: RED - Tests should fail initially

This module tests the payment flow including:
- Payment intent creation
- Webhook handling
- Payment confirmation
- Error scenarios
"""

import json
import hmac
import hashlib
import time
import stripe
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.db import transaction
from rest_framework.test import APITestCase
from rest_framework import status
from courses.models import Course, Cohort, Enrollment, Category
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone

User = get_user_model()


class PaymentIntentTests(APITestCase):
    """Test PaymentIntent creation and management"""

    def setUp(self):
        """Create test data for payment tests"""
        # Create user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        # Create another user (for permission tests)
        self.other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpass123",
        )

        # Create category
        self.category = Category.objects.create(
            name="Test Category", slug="test-category", color="#4f46e5"
        )

        # Create course
        self.course = Course.objects.create(
            title="Test Course",
            slug="test-course-2",
            subtitle="Test Subtitle",
            description="Test Description",
            level="intermediate",
            price=100.00,
            status="published",
            modules_count=5,
            duration_weeks=4,
            duration_hours=20,
        )
        self.course.categories.add(self.category)

        # Create cohort
        self.cohort = Cohort.objects.create(
            course=self.course,
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=60),
            format="online",
            spots_total=10,
            spots_reserved=0,
            status="enrolling",
        )

        # Create pending enrollment
        self.enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            currency="USD",
            status="pending",
        )

        # Authenticate
        self.client.force_authenticate(user=self.user)

    @patch("stripe.PaymentIntent.create")
    def test_create_payment_intent_success(self, mock_stripe_create):
        """
        Test: Create payment intent for valid enrollment
        Expected: 200 OK with client_secret
        TDD: Should FAIL initially (view not implemented), PASS after implementation
        """
        # Mock Stripe response
        mock_stripe_create.return_value = MagicMock(
            id="pi_test_1234567890",
            client_secret="pi_test_1234567890_secret_abcdef",
            status="requires_payment_method",
        )

        response = self.client.post(
            "/api/v1/payments/create-intent/",
            {
                "enrollment_id": str(self.enrollment.id),
            },
            format="json",
        )

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("client_secret", response.data["data"])
        self.assertIn("payment_intent_id", response.data["data"])
        self.assertEqual(
            response.data["data"]["payment_intent_id"], "pi_test_1234567890"
        )

        # Verify enrollment updated
        self.enrollment.refresh_from_db()
        self.assertEqual(self.enrollment.stripe_payment_intent_id, "pi_test_1234567890")

        # Verify Stripe called with correct params
        mock_stripe_create.assert_called_once()
        call_kwargs = mock_stripe_create.call_args[1]
        self.assertEqual(call_kwargs["amount"], 10000)  # $100.00 in cents
        self.assertEqual(call_kwargs["currency"], "usd")
        self.assertEqual(
            call_kwargs["metadata"]["enrollment_id"], str(self.enrollment.id)
        )

    def test_create_payment_intent_unauthenticated(self):
        """
        Test: Anonymous user cannot create payment intent
        Expected: 401 Unauthorized
        TDD: Should FAIL initially, PASS after auth check
        """
        # Logout
        self.client.force_authenticate(user=None)

        response = self.client.post(
            "/api/v1/payments/create-intent/",
            {
                "enrollment_id": str(self.enrollment.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_payment_intent_invalid_enrollment(self):
        """
        Test: Non-existent enrollment returns 404
        Expected: 404 Not Found
        TDD: Should FAIL initially, PASS after validation
        """
        response = self.client.post(
            "/api/v1/payments/create-intent/",
            {
                "enrollment_id": "123e4567-e89b-12d3-a456-426614174000",  # Non-existent UUID
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("not found", response.data.get("message", "").lower())

    def test_create_payment_intent_wrong_user(self):
        """
        Test: User cannot pay for another user's enrollment
        Expected: 403 Forbidden
        TDD: Should FAIL initially, PASS after ownership check
        """
        # Create enrollment for other user
        other_enrollment = Enrollment.objects.create(
            user=self.other_user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            status="pending",
        )

        response = self.client.post(
            "/api/v1/payments/create-intent/",
            {
                "enrollment_id": str(other_enrollment.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_payment_intent_already_confirmed(self):
        """
        Test: Cannot create payment intent for confirmed enrollment
        Expected: 400 Bad Request
        TDD: Should FAIL initially, PASS after status check
        """
        # Update enrollment to confirmed
        self.enrollment.status = "confirmed"
        self.enrollment.save()

        response = self.client.post(
            "/api/v1/payments/create-intent/",
            {
                "enrollment_id": str(self.enrollment.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already confirmed", response.data.get("message", "").lower())

    @patch("stripe.PaymentIntent.retrieve")
    def test_get_payment_status_success(self, mock_stripe_retrieve):
        """
        Test: Get payment status for enrollment
        Expected: 200 OK with payment intent status
        """
        # Set up enrollment with payment intent
        self.enrollment.stripe_payment_intent_id = "pi_test_123"
        self.enrollment.save()

        # Mock Stripe response
        mock_stripe_retrieve.return_value = MagicMock(
            id="pi_test_123",
            status="succeeded",
            amount_received=10000,
        )

        response = self.client.get(f"/api/v1/payments/{self.enrollment.id}/status/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["payment_intent_status"], "succeeded")


class StripeWebhookTests(APITestCase):
    """Test Stripe webhook handling"""

    def setUp(self):
        """Create test data for webhook tests"""
        # Create user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )

        # Create category and course
        self.category = Category.objects.create(
            name="Test Category", slug="test-category", color="#4f46e5"
        )

        self.course = Course.objects.create(
            title="Test Course",
            slug="test-course-2",
            subtitle="Test Subtitle",
            description="Test Description",
            level="intermediate",
            price=100.00,
            status="published",
            modules_count=5,
            duration_weeks=4,
            duration_hours=20,
        )
        self.course.categories.add(self.category)

        # Create cohort
        self.cohort = Cohort.objects.create(
            course=self.course,
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=60),
            format="online",
            spots_total=10,
            spots_reserved=0,
            status="enrolling",
        )

        # Create enrollment with payment intent
        self.enrollment = Enrollment.objects.create(
            user=self.user,
            course=self.course,
            cohort=self.cohort,
            amount_paid=100.00,
            currency="USD",
            status="pending",
            stripe_payment_intent_id="pi_test_webhook_123",
        )

    def _generate_webhook_signature(self, payload, secret):
        """Generate Stripe webhook signature for testing"""
        timestamp = int(time.time())
        signed_payload = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode("utf-8"), signed_payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        return f"t={timestamp},v1={signature}"

    @patch("stripe.Webhook.construct_event")
    def test_webhook_payment_succeeded(self, mock_construct_event):
        """
        Test: Handle successful payment webhook
        Expected: Enrollment confirmed, spots_reserved incremented
        """
        # Mock webhook event
        mock_construct_event.return_value = {
            "id": "evt_test",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_webhook_123",
                    "status": "succeeded",
                    "metadata": {"enrollment_id": str(self.enrollment.id)},
                }
            },
        }

        # Initial state
        initial_spots = self.cohort.spots_reserved

        # Send webhook
        payload = json.dumps(mock_construct_event.return_value)
        response = self.client.post(
            "/api/v1/webhooks/stripe/",
            payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="t=1234567890,v1=abc123",
        )

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh from DB
        self.enrollment.refresh_from_db()
        self.cohort.refresh_from_db()

        # Verify enrollment confirmed
        self.assertEqual(self.enrollment.status, "confirmed")
        self.assertIsNotNone(self.enrollment.confirmed_at)

        # Verify spot reserved
        self.assertEqual(self.cohort.spots_reserved, initial_spots + 1)

    @patch("stripe.Webhook.construct_event")
    def test_webhook_payment_failed(self, mock_construct_event):
        """
        Test: Handle failed payment webhook
        Expected: Enrollment cancelled, spot released
        """
        # Pre-reserve a spot
        self.cohort.spots_reserved = 1
        self.cohort.save()

        # Mock webhook event
        mock_construct_event.return_value = {
            "id": "evt_test",
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_test_webhook_123",
                    "status": "requires_payment_method",
                    "metadata": {"enrollment_id": str(self.enrollment.id)},
                }
            },
        }

        # Send webhook
        payload = json.dumps(mock_construct_event.return_value)
        response = self.client.post(
            "/api/v1/webhooks/stripe/",
            payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="t=1234567890,v1=abc123",
        )

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh from DB
        self.enrollment.refresh_from_db()
        self.cohort.refresh_from_db()

        # Verify enrollment cancelled
        self.assertEqual(self.enrollment.status, "cancelled")

        # Verify spot released
        self.assertEqual(self.cohort.spots_reserved, 0)

    def test_webhook_invalid_signature(self):
        """
        Test: Webhook with invalid signature rejected
        Expected: 400 Bad Request
        """
        with patch("stripe.Webhook.construct_event") as mock_construct:
            mock_construct.side_effect = stripe.error.SignatureVerificationError(
                "Invalid signature", "test_sig"
            )

            response = self.client.post(
                "/api/v1/webhooks/stripe/",
                "{}",
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="invalid",
            )

            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_webhook_missing_signature(self):
        """
        Test: Webhook without signature rejected
        Expected: 400 Bad Request
        """
        response = self.client.post(
            "/api/v1/webhooks/stripe/", "{}", content_type="application/json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("stripe.Webhook.construct_event")
    def test_webhook_idempotent_processing(self, mock_construct_event):
        """
        Test: Processing same webhook twice is idempotent
        Expected: Second request returns 'already_confirmed'
        """
        # First event
        mock_construct_event.return_value = {
            "id": "evt_test",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_webhook_123",
                    "status": "succeeded",
                    "metadata": {"enrollment_id": str(self.enrollment.id)},
                }
            },
        }

        payload = json.dumps(mock_construct_event.return_value)

        # First webhook
        response1 = self.client.post(
            "/api/v1/webhooks/stripe/",
            payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="t=1234567890,v1=abc123",
        )

        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data.get("status"), "confirmed")

        # Second webhook (same event)
        response2 = self.client.post(
            "/api/v1/webhooks/stripe/",
            payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="t=1234567890,v1=abc123",
        )

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data.get("status"), "already_confirmed")


class PaymentRateLimitTests(APITestCase):
    """Test payment endpoint rate limiting"""

    def setUp(self):
        """Create test user"""
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)

    @patch("stripe.PaymentIntent.create")
    def test_payment_rate_limit(self, mock_stripe_create):
        """
        Test: Payment endpoint rate limited to 5/minute
        Expected: 429 Too Many Requests after 6 requests
        """
        mock_stripe_create.return_value = MagicMock(
            id="pi_test",
            client_secret="test_secret",
            status="requires_payment_method",
        )

        # Make 6 rapid requests
        responses = []
        for i in range(6):
            response = self.client.post(
                "/api/v1/payments/create-intent/",
                {"enrollment_id": "test-id"},
                format="json",
            )
            responses.append(response.status_code)

        # First 5 should succeed (or get 404 for missing enrollment)
        # 6th should be rate limited
        self.assertIn(status.HTTP_429_TOO_MANY_REQUESTS, responses)


# Test Summary
# ------------
# Total Tests: 11
# - PaymentIntentTests: 6 tests
# - StripeWebhookTests: 5 tests
# - PaymentRateLimitTests: 1 test
#
# Coverage Areas:
# 1. Payment intent creation (success, auth, validation)
# 2. Webhook handling (success, failure, security)
# 3. Rate limiting
# 4. Idempotency
# 5. Error scenarios
