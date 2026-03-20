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
