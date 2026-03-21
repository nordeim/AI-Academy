"""
Custom Exception Handler

Provides standardized error responses for all API exceptions.
Integrates with DRF's exception handling system.
"""

import uuid
from datetime import datetime, timezone

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ValidationError,
    Throttled,
)
from django.core.exceptions import ObjectDoesNotExist
from api.exceptions.payment import PaymentError


ERROR_CODES = {
    400: "BAD_REQUEST",
    401: "AUTHENTICATION_ERROR",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    429: "RATE_LIMIT_EXCEEDED",
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
}


__all__ = [
    "PaymentError",
]


def get_error_code(status_code):
    """Get error code constant for status code"""
    return ERROR_CODES.get(status_code, "UNKNOWN_ERROR")


def format_validation_errors(detail):
    """
    Format validation errors into standardized structure

    Input: DRF validation error detail
    Output: {field_name: ["error message"], non_field_errors: [...]}
    """
    errors = {}

    if isinstance(detail, dict):
        for field, error_list in detail.items():
            if isinstance(error_list, list):
                errors[field] = [str(e) for e in error_list]
            elif isinstance(error_list, dict):
                # Nested errors (e.g., for nested serializers)
                errors[field] = format_validation_errors(error_list)
            else:
                errors[field] = [str(error_list)]
    elif isinstance(detail, list):
        # Non-field errors
        errors["non_field_errors"] = [str(e) for e in detail]
    else:
        # Single error
        errors["non_field_errors"] = [str(detail)]

    return errors


def standardized_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses

    Usage: Set as REST_FRAMEWORK['EXCEPTION_HANDLER'] in settings
    """
    # Get the standard DRF response first
    response = exception_handler(exc, context)

    # Get request from context
    request = context.get("request")

    if response is not None:
        # Format the response into standardized structure
        status_code = response.status_code

        # Build standardized error response
        error_data = {
            "success": False,
            "data": None,
            "message": _get_error_message(exc, status_code),
            "errors": {},
            "meta": _build_meta(request, status_code),
        }

        # Handle validation errors specially
        if isinstance(exc, ValidationError):
            error_data["errors"] = format_validation_errors(exc.detail)
        elif hasattr(exc, "detail"):
            # Other exceptions with detail
            if isinstance(exc.detail, dict):
                error_data["errors"] = format_validation_errors(exc.detail)
            else:
                error_data["errors"]["non_field_errors"] = [str(exc.detail)]
        elif hasattr(exc, "default_detail"):
            error_data["errors"]["non_field_errors"] = [str(exc.default_detail)]

        return Response(error_data, status=status_code)

    # Handle non-DRF exceptions (e.g., Django's ObjectDoesNotExist)
    if isinstance(exc, ObjectDoesNotExist):
        error_data = {
            "success": False,
            "data": None,
            "message": "Resource not found",
            "errors": {"non_field_errors": [str(exc)]},
            "meta": _build_meta(request, 404),
        }
        return Response(error_data, status=404)

    # Handle custom PaymentError
    if isinstance(exc, PaymentError):
        error_data = {
            "success": False,
            "data": None,
            "message": exc.message,
            "errors": {exc.code: [exc.message]},
            "meta": _build_meta(request, exc.status_code),
        }
        return Response(error_data, status=exc.status_code)

    # Unhandled exception - return generic 500
    error_data = {
        "success": False,
        "data": None,
        "message": "Internal server error",
        "errors": {"non_field_errors": ["An unexpected error occurred"]},
        "meta": _build_meta(request, 500),
    }

    return Response(error_data, status=500)


def _get_error_message(exc, status_code):
    """Get human-readable error message"""
    messages = {
        400: "Bad request - please check your input",
        401: "Authentication required - please log in",
        403: "Access forbidden - insufficient permissions",
        404: "Resource not found",
        405: "Method not allowed",
        409: "Conflict - resource already exists",
        422: "Validation failed - please check your input",
        429: "Too many requests - please slow down",
        500: "Internal server error",
        502: "Bad gateway",
        503: "Service temporarily unavailable",
    }

    # Try to get message from exception
    if hasattr(exc, "detail") and isinstance(exc.detail, str):
        return exc.detail

    return messages.get(status_code, "An error occurred")


def _build_meta(request, status_code):
    """Build meta section for error responses"""
    # Get or generate request_id
    request_id = getattr(request, "request_id", str(uuid.uuid4()))

    return {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "request_id": request_id,
        "error_code": get_error_code(status_code),
    }
