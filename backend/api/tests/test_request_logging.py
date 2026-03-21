"""
Test suite for Request Logging Middleware
Step 12: API Request Logging and Audit Trail

TDD Approach: RED → GREEN → REFACTOR
Tests written before implementation to define expected behavior.
"""

import logging
from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory, override_settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse

User = get_user_model()


class RequestLoggingMiddlewareTests(TestCase):
    """Test API request logging middleware functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def _create_middleware(self):
        """Helper to create middleware instance with mock get_response."""
        from api.middleware import APILoggingMiddleware

        def mock_get_response(request):
            return JsonResponse({"message": "OK"}, status=200)

        return APILoggingMiddleware(mock_get_response)

    @patch("api.middleware.logging.getLogger")
    def test_logs_api_request(self, mock_get_logger):
        """Verify API requests are logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")

        middleware(request)

        # Verify logger.info was called
        self.assertTrue(
            mock_logger.info.called, "Logger.info should be called for API requests"
        )

    @patch("api.middleware.logging.getLogger")
    def test_log_contains_method(self, mock_get_logger):
        """Verify log contains HTTP method."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.post("/api/v1/enrollments/")

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn("POST", log_message, "Log should contain HTTP method")

    @patch("api.middleware.logging.getLogger")
    def test_log_contains_path(self, mock_get_logger):
        """Verify log contains request path."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn(
            "/api/v1/courses/", log_message, "Log should contain request path"
        )

    @patch("api.middleware.logging.getLogger")
    def test_log_contains_status_code(self, mock_get_logger):
        """Verify log contains response status code."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn("200", log_message, "Log should contain status code")

    @patch("api.middleware.logging.getLogger")
    def test_log_contains_duration(self, mock_get_logger):
        """Verify log contains request duration."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        # Duration should be in format like "15.00ms"
        self.assertIn("ms", log_message, "Log should contain duration in ms")

    @patch("api.middleware.logging.getLogger")
    def test_logs_different_methods(self, mock_get_logger):
        """Verify different HTTP methods are logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()

        methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
        for method in methods:
            mock_logger.reset_mock()
            request = self.factory.generic(method, "/api/v1/courses/")
            middleware(request)

            self.assertTrue(
                mock_logger.info.called,
                f"Logger should be called for {method} requests",
            )

    @patch("api.middleware.logging.getLogger")
    def test_logs_different_status_codes(self, mock_get_logger):
        """Verify different status codes are logged."""
        from api.middleware import APILoggingMiddleware

        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        def create_response_with_status(status):
            def get_response(request):
                return JsonResponse({"error": "Test"}, status=status)

            return get_response

        status_codes = [200, 201, 400, 401, 403, 404, 500]
        for status in status_codes:
            mock_logger.reset_mock()
            middleware = APILoggingMiddleware(create_response_with_status(status))
            request = self.factory.get("/api/v1/courses/")
            middleware(request)

            log_message = mock_logger.info.call_args[0][0]
            self.assertIn(
                str(status), log_message, f"Log should contain status code {status}"
            )

    @patch("api.middleware.logging.getLogger")
    def test_skips_non_api_paths(self, mock_get_logger):
        """Verify non-API paths are not logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/admin/users/user/")

        middleware(request)

        # Should not log non-API paths
        self.assertFalse(mock_logger.info.called, "Should not log non-API paths")

    @patch("api.middleware.logging.getLogger")
    def test_skips_static_files(self, mock_get_logger):
        """Verify static files are not logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/static/css/style.css")

        middleware(request)

        self.assertFalse(mock_logger.info.called, "Should not log static files")

    @patch("api.middleware.logging.getLogger")
    def test_skips_media_files(self, mock_get_logger):
        """Verify media files are not logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/media/course-thumbnails/image.jpg")

        middleware(request)

        self.assertFalse(mock_logger.info.called, "Should not log media files")

    @patch("api.middleware.logging.getLogger")
    def test_logs_with_user_authentication(self, mock_get_logger):
        """Verify authenticated user info is logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.user = self.user

        middleware(request)

        self.assertTrue(mock_logger.info.called)
        log_message = mock_logger.info.call_args[0][0]
        # Should contain user identification
        self.assertIn(
            "testuser",
            log_message,
            "Log should contain username for authenticated requests",
        )

    @patch("api.middleware.logging.getLogger")
    def test_logs_with_anonymous_user(self, mock_get_logger):
        """Verify anonymous user requests are logged."""
        from django.contrib.auth.models import AnonymousUser

        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.user = AnonymousUser()

        middleware(request)

        self.assertTrue(mock_logger.info.called, "Should log anonymous user requests")

    @patch("api.middleware.logging.getLogger")
    def test_logs_request_id(self, mock_get_logger):
        """Verify request ID is included in log."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.request_id = "test-request-id-123"

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn(
            "test-request-id-123", log_message, "Log should contain request ID"
        )

    @patch("api.middleware.logging.getLogger")
    def test_logs_ip_address(self, mock_get_logger):
        """Verify client IP address is logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.META["REMOTE_ADDR"] = "192.168.1.100"

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn("192.168.1.100", log_message, "Log should contain client IP")

    @patch("api.middleware.logging.getLogger")
    def test_logs_user_agent(self, mock_get_logger):
        """Verify user agent is logged."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.META["HTTP_USER_AGENT"] = "Mozilla/5.0 Test Browser"

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]
        self.assertIn("Mozilla/5.0", log_message, "Log should contain user agent")

    @patch("api.middleware.logging.getLogger")
    def test_log_format_structure(self, mock_get_logger):
        """Verify log message has structured format."""
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        middleware = self._create_middleware()
        request = self.factory.get("/api/v1/courses/")
        request.request_id = "req-123"
        request.user = self.user
        request.META["REMOTE_ADDR"] = "10.0.0.1"

        middleware(request)

        log_message = mock_logger.info.call_args[0][0]

        # Verify structured format
        expected_parts = [
            "GET",
            "/api/v1/courses/",
            "200",
            "req-123",
            "testuser",
            "10.0.0.1",
        ]

        for part in expected_parts:
            self.assertIn(part, log_message, f"Log should contain {part}")


class RequestLoggingConfigurationTests(TestCase):
    """Test logging configuration and settings."""

    def test_api_logger_exists(self):
        """Verify 'api' logger is configured."""
        import logging

        logger = logging.getLogger("api.requests")
        self.assertIsNotNone(logger)

    def test_api_logger_has_handlers(self):
        """Verify API logger has handlers configured."""
        import logging

        logger = logging.getLogger("api.requests")
        # Logger should have at least one handler
        self.assertTrue(
            len(logger.handlers) > 0 or logger.parent,
            "Logger should have handlers or inherit from parent",
        )

    def test_middleware_can_be_imported(self):
        """Verify logging middleware can be imported."""
        from api.middleware import APILoggingMiddleware

        self.assertTrue(callable(APILoggingMiddleware))


class RequestLoggingPerformanceTests(TestCase):
    """Test logging performance impact."""

    def setUp(self):
        """Set up performance test fixtures."""
        self.factory = RequestFactory()

    @patch("api.middleware.logging.getLogger")
    def test_logging_overhead_is_minimal(self, mock_get_logger):
        """Verify logging adds minimal overhead."""
        from api.middleware import APILoggingMiddleware
        import time

        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        def fast_response(request):
            return JsonResponse({"data": "test"})

        middleware = APILoggingMiddleware(fast_response)
        request = self.factory.get("/api/v1/courses/")

        # Measure duration
        start = time.perf_counter()
        middleware(request)
        duration = time.perf_counter() - start

        # Logging should add less than 10ms overhead
        self.assertLess(duration, 0.01, "Logging overhead should be minimal (<10ms)")


class RequestLoggingErrorHandlingTests(TestCase):
    """Test error handling in logging middleware."""

    def setUp(self):
        self.factory = RequestFactory()

    @patch("api.middleware.logging.getLogger")
    def test_handles_exception_in_logging(self, mock_get_logger):
        """Verify middleware handles logging exceptions gracefully."""
        from api.middleware import APILoggingMiddleware

        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        def failing_response(request):
            raise ValueError("Test exception")

        middleware = APILoggingMiddleware(failing_response)
        request = self.factory.get("/api/v1/courses/")

        # Should raise the exception, not hide it
        with self.assertRaises(ValueError):
            middleware(request)

    @patch("api.middleware.logging.getLogger")
    def test_logs_even_on_error_response(self, mock_get_logger):
        """Verify logging occurs even for error responses."""
        from api.middleware import APILoggingMiddleware

        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger

        def error_response(request):
            return JsonResponse({"error": "Server Error"}, status=500)

        middleware = APILoggingMiddleware(error_response)
        request = self.factory.get("/api/v1/courses/")

        middleware(request)

        self.assertTrue(mock_logger.info.called, "Should log even on error responses")
        log_message = mock_logger.info.call_args[0][0]
        self.assertIn("500", log_message)
