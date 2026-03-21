"""
Payment Views for Stripe Integration

Handles:
- Payment Intent creation
- Payment confirmation
- Webhook handling for Stripe events

TDD Tests: api.tests.test_payments
"""

import stripe
from django.conf import settings
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle
from api.exceptions import PaymentError
from courses.models import Enrollment, Cohort
import logging

logger = logging.getLogger("api.payments")


class PaymentRateThrottle(UserRateThrottle):
    """Custom throttle for payment operations: 5/minute"""

    rate = "5/minute"
    scope = "payment"


class PaymentViewSet(viewsets.GenericViewSet):
    """
    Payment Intent creation and management.

    Endpoints:
    - POST /payments/create-intent/ - Create payment intent for enrollment
    - GET /payments/{enrollment_id}/status/ - Check payment status
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    @action(detail=False, methods=["post"], url_path="create-intent")
    def create_intent(self, request):
        """
        Create Stripe PaymentIntent for enrollment.

        Request Body:
        {
            "enrollment_id": "uuid-string",
            "amount": 249900,  # amount in cents
            "currency": "usd"
        }

        Returns:
        {
            "success": true,
            "data": {
                "client_secret": "pi_xxx_secret_xxx",
                "payment_intent_id": "pi_xxx",
                "status": "requires_payment_method"
            },
            "message": "Payment intent created successfully",
            "errors": {},
            "meta": {...}
        }

        TDD Test Cases:
        - test_create_payment_intent_success: Valid enrollment creates intent
        - test_create_payment_intent_unauthenticated: 401 for anonymous users
        - test_create_payment_intent_invalid_enrollment: 404 if enrollment not found
        - test_create_payment_intent_wrong_user: 403 if enrollment belongs to another user
        - test_create_payment_intent_already_confirmed: 400 if already paid
        """
        enrollment_id = request.data.get("enrollment_id")

        if not enrollment_id:
            raise PaymentError(
                "enrollment_id is required", code="missing_enrollment_id"
            )

        try:
            enrollment = Enrollment.objects.get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            raise PaymentError(
                f"Enrollment not found: {enrollment_id}",
                code="enrollment_not_found",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Validate ownership
        if enrollment.user != request.user:
            raise PaymentError(
                "You do not have permission to pay for this enrollment",
                code="permission_denied",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        # Check if already confirmed
        if enrollment.status == "confirmed":
            raise PaymentError(
                "This enrollment is already confirmed",
                code="already_confirmed",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Prepare Stripe PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(enrollment.amount_paid * 100),  # Convert to cents
                currency=enrollment.currency.lower(),
                metadata={
                    "enrollment_id": str(enrollment.id),
                    "user_id": str(request.user.id),
                    "course_id": str(enrollment.course.id),
                    "cohort_id": str(enrollment.cohort.id),
                },
                idempotency_key=f"enrollment_{enrollment.id}_{request.user.id}",
                automatic_payment_methods={"enabled": True},
            )

            # Update enrollment with payment intent ID
            enrollment.stripe_payment_intent_id = intent.id
            enrollment.save(update_fields=["stripe_payment_intent_id"])

            logger.info(
                f"PaymentIntent created: {intent.id} for enrollment {enrollment.id}",
                extra={
                    "enrollment_id": str(enrollment.id),
                    "user_id": str(request.user.id),
                    "amount": enrollment.amount_paid,
                    "payment_intent_id": intent.id,
                },
            )

            return Response(
                {
                    "success": True,
                    "data": {
                        "client_secret": intent.client_secret,
                        "payment_intent_id": intent.id,
                        "status": intent.status,
                    },
                    "message": "Payment intent created successfully",
                    "errors": {},
                    "meta": {
                        "timestamp": timezone.now().isoformat(),
                        "request_id": getattr(request, "request_id", "unknown"),
                    },
                }
            )

        except stripe.StripeError as e:
            logger.error(
                f"Stripe error creating PaymentIntent: {str(e)}",
                extra={
                    "enrollment_id": str(enrollment.id),
                    "stripe_error": str(e),
                },
            )
            raise PaymentError(
                f"Payment processing error: {e.user_message or 'Please try again'}",
                code="stripe_error",
                status_code=status.HTTP_502_BAD_GATEWAY,
            )

    @action(detail=True, methods=["get"], url_path="status")
    def payment_status(self, request, pk=None):
        """
        Get payment status for enrollment.

        Returns current payment intent status from Stripe.

        TDD Test Cases:
        - test_payment_status_success: Returns current status
        - test_payment_status_not_found: 404 for invalid enrollment
        - test_payment_status_no_intent: Returns pending if no intent created
        """
        try:
            enrollment = Enrollment.objects.get(id=pk)
        except Enrollment.DoesNotExist:
            raise PaymentError(
                f"Enrollment not found: {pk}",
                code="enrollment_not_found",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Check ownership
        if enrollment.user != request.user:
            raise PaymentError(
                "You do not have permission to view this enrollment",
                code="permission_denied",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        # If no payment intent, return pending status
        if not enrollment.stripe_payment_intent_id:
            return Response(
                {
                    "success": True,
                    "data": {
                        "enrollment_id": str(enrollment.id),
                        "status": enrollment.status,
                        "payment_intent_status": None,
                    },
                    "message": "Payment status retrieved",
                    "errors": {},
                    "meta": {
                        "timestamp": timezone.now().isoformat(),
                        "request_id": getattr(request, "request_id", "unknown"),
                    },
                }
            )

        # Retrieve from Stripe
        try:
            intent = stripe.PaymentIntent.retrieve(enrollment.stripe_payment_intent_id)

            return Response(
                {
                    "success": True,
                    "data": {
                        "enrollment_id": str(enrollment.id),
                        "status": enrollment.status,
                        "payment_intent_status": intent.status,
                        "amount_received": intent.amount_received / 100
                        if intent.amount_received
                        else 0,
                    },
                    "message": "Payment status retrieved",
                    "errors": {},
                    "meta": {
                        "timestamp": timezone.now().isoformat(),
                        "request_id": getattr(request, "request_id", "unknown"),
                    },
                }
            )

        except stripe.StripeError as e:
            logger.error(
                f"Stripe error retrieving PaymentIntent: {str(e)}",
                extra={
                    "enrollment_id": str(enrollment.id),
                    "stripe_error": str(e),
                },
            )
            raise PaymentError(
                "Unable to retrieve payment status",
                code="stripe_retrieval_error",
                status_code=status.HTTP_502_BAD_GATEWAY,
            )


class StripeWebhookView(APIView):
    """
    Handle Stripe webhook events for payment processing.

    Secured with Stripe signature verification.

    Events Handled:
    - payment_intent.succeeded: Confirm enrollment
    - payment_intent.payment_failed: Handle failure, release spot
    - payment_intent.canceled: Clean up enrollment

    TDD Test Cases:
    - test_webhook_payment_succeeded: Confirms enrollment
    - test_webhook_payment_failed: Updates status, releases spot
    - test_webhook_invalid_signature: 400 for bad signature
    - test_webhook_missing_signature: 400 if no signature
    - test_webhook_duplicate_event: Idempotent processing
    """

    permission_classes = []  # Webhooks don't use standard auth
    authentication_classes = []  # Disable session auth

    def post(self, request):
        """Process Stripe webhook payload."""
        payload = request.body
        sig_header = request.headers.get("Stripe-Signature")
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        # Validate webhook secret is configured
        if not webhook_secret:
            logger.error("Stripe webhook secret not configured")
            return Response(
                {"error": "Webhook not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Verify signature
        if not sig_header:
            logger.error("Stripe signature missing from webhook")
            return Response(
                {"error": "Signature missing"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError:
            logger.error("Invalid Stripe webhook payload")
            return Response(
                {"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.SignatureVerificationError:
            logger.error("Invalid Stripe webhook signature")
            return Response(
                {"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Handle event
        event_type = event["type"]
        payment_intent = event["data"]["object"]

        logger.info(
            f"Processing webhook: {event_type}",
            extra={
                "event_type": event_type,
                "payment_intent_id": payment_intent["id"],
            },
        )

        if event_type == "payment_intent.succeeded":
            return self._handle_payment_success(payment_intent)
        elif event_type == "payment_intent.payment_failed":
            return self._handle_payment_failure(payment_intent)
        elif event_type == "payment_intent.canceled":
            return self._handle_payment_canceled(payment_intent)
        else:
            logger.info(f"Unhandled webhook event: {event_type}")
            return Response({"status": "ignored"}, status=status.HTTP_200_OK)

    def _handle_payment_success(self, payment_intent):
        """Handle successful payment - confirm enrollment."""
        enrollment_id = payment_intent.get("metadata", {}).get("enrollment_id")

        if not enrollment_id:
            logger.error("Payment intent missing enrollment_id in metadata")
            return Response(
                {"error": "Missing enrollment reference"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                enrollment = Enrollment.objects.select_for_update().get(
                    id=enrollment_id
                )

                # Already confirmed - idempotency
                if enrollment.status == "confirmed":
                    logger.info(f"Enrollment {enrollment_id} already confirmed")
                    return Response({"status": "already_confirmed"})

                # Update enrollment
                enrollment.status = "confirmed"
                enrollment.confirmed_at = timezone.now()
                enrollment.save(update_fields=["status", "confirmed_at"])

                # Increment cohort spots_reserved
                cohort = enrollment.cohort
                cohort.spots_reserved = models.F("spots_reserved") + 1
                cohort.save(update_fields=["spots_reserved"])

                logger.info(
                    f"Enrollment confirmed: {enrollment_id}",
                    extra={
                        "enrollment_id": enrollment_id,
                        "payment_intent_id": payment_intent["id"],
                        "amount_paid": enrollment.amount_paid,
                    },
                )

                return Response({"status": "confirmed"})

        except Enrollment.DoesNotExist:
            logger.error(f"Enrollment not found for webhook: {enrollment_id}")
            return Response(
                {"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(
                f"Error confirming enrollment: {str(e)}",
                extra={
                    "enrollment_id": enrollment_id,
                    "error": str(e),
                },
            )
            return Response(
                {"error": "Internal error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _handle_payment_failure(self, payment_intent):
        """Handle failed payment - update status, release spot."""
        enrollment_id = payment_intent.get("metadata", {}).get("enrollment_id")

        if not enrollment_id:
            logger.error("Payment intent missing enrollment_id in metadata")
            return Response(
                {"error": "Missing enrollment reference"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                enrollment = Enrollment.objects.select_for_update().get(
                    id=enrollment_id
                )

                # Update enrollment status
                enrollment.status = "cancelled"
                enrollment.save(update_fields=["status"])

                # Release cohort spot
                cohort = enrollment.cohort
                if cohort.spots_reserved > 0:
                    cohort.spots_reserved = models.F("spots_reserved") - 1
                    cohort.save(update_fields=["spots_reserved"])

                logger.info(
                    f"Enrollment cancelled due to payment failure: {enrollment_id}",
                    extra={
                        "enrollment_id": enrollment_id,
                        "payment_intent_id": payment_intent["id"],
                    },
                )

                return Response({"status": "cancelled"})

        except Enrollment.DoesNotExist:
            logger.error(f"Enrollment not found for webhook: {enrollment_id}")
            return Response(
                {"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(
                f"Error handling payment failure: {str(e)}",
                extra={
                    "enrollment_id": enrollment_id,
                    "error": str(e),
                },
            )
            return Response(
                {"error": "Internal error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _handle_payment_canceled(self, payment_intent):
        """Handle canceled payment - similar to failure."""
        return self._handle_payment_failure(payment_intent)


# Import at end to avoid circular imports
from django.utils import timezone
from django.db import models


# Ensure stripe is configured
if not stripe.api_key:
    stripe.api_key = settings.STRIPE_SECRET_KEY
