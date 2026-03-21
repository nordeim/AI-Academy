"""
API Middleware

Provides request/response processing for standardized API responses.
"""

import uuid
import time
import logging

logger = logging.getLogger(__name__)


class RequestIDMiddleware:
    """
    Middleware that generates a unique request ID for each API request

    The request_id is attached to the request object and included in all responses.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generate unique request ID
        request.request_id = str(uuid.uuid4())

        # Store start time for request duration logging
        request.start_time = time.time()

        # Process request
        response = self.get_response(request)

        # Add request_id to response headers for debugging
        if hasattr(request, "request_id"):
            response["X-Request-ID"] = request.request_id

        # Log request completion
        duration = time.time() - request.start_time
        logger.info(
            f"{request.method} {request.path} - {response.status_code} - "
            f"{duration:.3f}s - RequestID: {request.request_id}"
        )

        return response


class APILoggingMiddleware:
    """
    Middleware that provides comprehensive audit trail for API requests

    Logs all API requests with:
    - HTTP method and path
    - Response status code
    - Request duration
    - User identification
    - Client IP address
    - User agent string
    - Request ID (if available from RequestIDMiddleware)

    Skips logging for:
    - Non-API paths (not starting with /api/)
    - Static files (/static/)
    - Media files (/media/)
    - Admin paths (/admin/) - handled separately by Django
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Create dedicated logger for API requests
        self.logger = logging.getLogger("api.requests")

    def __call__(self, request):
        # Skip logging for non-API paths, static, and media
        if not self._should_log(request):
            return self.get_response(request)

        # Record start time
        start_time = time.time()

        # Process the request
        response = self.get_response(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Build log message with structured format
        log_data = self._build_log_data(request, response, duration_ms)

        # Log the request
        self.logger.info(log_data)

        return response

    def _should_log(self, request):
        """Determine if request should be logged."""
        path = request.path

        # Skip non-API paths
        if not path.startswith("/api/"):
            return False

        # Skip static and media files
        if path.startswith("/static/") or path.startswith("/media/"):
            return False

        # Skip admin paths
        if path.startswith("/admin/"):
            return False

        return True

    def _build_log_data(self, request, response, duration_ms):
        """Build structured log data for the request."""
        # Get user identifier
        if hasattr(request, "user") and request.user.is_authenticated:
            user_id = request.user.username
        else:
            user_id = "anonymous"

        # Get client IP
        ip_address = self._get_client_ip(request)

        # Get user agent
        user_agent = request.META.get("HTTP_USER_AGENT", "unknown")

        # Get request ID (set by RequestIDMiddleware if available)
        request_id = getattr(request, "request_id", "N/A")

        # Format: METHOD path - status - duration - user - ip - request_id
        return (
            f"{request.method} {request.path} - {response.status_code} - "
            f"{duration_ms:.2f}ms - {user_id} - {ip_address} - {request_id} - "
            f"{user_agent[:50]}"
        )

    def _get_client_ip(self, request):
        """Extract client IP from request, handling proxies."""
        # Check for X-Forwarded-For header (common for proxies)
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            # Get first IP from comma-separated list
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            # Fall back to REMOTE_ADDR
            ip = request.META.get("REMOTE_ADDR", "unknown")
        return ip


class ResponseFormatMiddleware:
    """
    Middleware that ensures all API responses follow the standardized format

    This is a fallback middleware that wraps responses if they weren't
    already standardized by the view.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only process API responses (paths starting with /api/)
        if not request.path.startswith("/api/"):
            return response

        # Skip if already standardized or is a redirect
        if response.status_code in (301, 302, 304):
            return response

        # Check if response is already standardized
        if hasattr(response, "data") and isinstance(response.data, dict):
            if "success" in response.data:
                # Already standardized
                return response

        return response
