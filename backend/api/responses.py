"""
Response Standardization Module

Provides standardized response formats for all API endpoints.
All responses follow a consistent envelope structure.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination


class StandardizedResponse(Response):
    """
    Standardized API Response wrapper

    Format:
    {
        "success": bool,
        "data": Any,
        "message": str,
        "errors": Dict,
        "meta": {
            "timestamp": "ISO8601",
            "request_id": "uuid",
            ...
        }
    }
    """

    def __init__(
        self,
        data: Any = None,
        status: int = 200,
        message: Optional[str] = None,
        errors: Optional[Dict] = None,
        request=None,
        **kwargs,
    ):
        # Determine success based on status code
        success = status < 400

        # Build response envelope
        response_data = {
            "success": success,
            "data": data if data is not None else {},
            "message": message or self._get_default_message(status, success),
            "errors": errors or {},
            "meta": self._build_meta(request),
        }

        super().__init__(response_data, status=status, **kwargs)

    def _get_default_message(self, status_code: int, success: bool) -> str:
        """Get default message based on status code"""
        if success:
            messages = {
                200: "Request completed successfully",
                201: "Resource created successfully",
                202: "Request accepted for processing",
                204: "Resource deleted successfully",
            }
            return messages.get(status_code, "Success")
        else:
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
            return messages.get(status_code, "An error occurred")

    def _build_meta(self, request) -> Dict:
        """Build meta section with request metadata"""
        meta = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "request_id": getattr(request, "request_id", str(uuid.uuid4())),
        }

        # Add pagination info if data is paginated
        if hasattr(self, "_paginator_info"):
            meta["pagination"] = self._paginator_info

        return meta


class SuccessResponse(StandardizedResponse):
    """Helper for success responses"""

    def __init__(
        self,
        data: Any = None,
        message: str = "Success",
        status: int = 200,
        request=None,
        **kwargs,
    ):
        super().__init__(
            data=data, status=status, message=message, request=request, **kwargs
        )


class ErrorResponse(StandardizedResponse):
    """Helper for error responses"""

    def __init__(
        self,
        message: str = "An error occurred",
        errors: Optional[Dict] = None,
        status: int = 400,
        request=None,
        **kwargs,
    ):
        super().__init__(
            data=None,
            status=status,
            message=message,
            errors=errors or {},
            request=request,
            **kwargs,
        )


class ResponseFormatterMixin:
    """
    Mixin for ViewSets to provide standardized response formatting

    Usage:
    class MyViewSet(ResponseFormatterMixin, viewsets.ModelViewSet):
        ...
    """

    def get_response_serializer(self, *args, **kwargs):
        """Get serializer with request context"""
        kwargs.setdefault("context", self.get_serializer_context())
        return self.get_serializer(*args, **kwargs)

    def standardized_response(self, data, status=200, message=None):
        """Create standardized response"""
        return StandardizedResponse(
            data=data, status=status, message=message, request=self.request
        )

    def list(self, request, *args, **kwargs):
        """Override list to return standardized format"""
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return self.standardized_response(
            data=serializer.data, message="Records retrieved successfully"
        )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return standardized format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.standardized_response(
            data=serializer.data, message="Record retrieved successfully"
        )

    def create(self, request, *args, **kwargs):
        """Override create to return standardized format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return self.standardized_response(
            data=serializer.data, status=201, message="Resource created successfully"
        )

    def update(self, request, *args, **kwargs):
        """Override update to return standardized format"""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        return self.standardized_response(
            data=serializer.data, message="Resource updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return standardized format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return self.standardized_response(
            data=None, status=204, message="Resource deleted successfully"
        )

    def list(self, request, *args, **kwargs) -> Union[StandardizedResponse, Response]:
        """Override list to return standardized format"""
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return self.standardized_response(
            data=serializer.data, message="Records retrieved successfully"
        )

    def retrieve(
        self, request, *args, **kwargs
    ) -> Union[StandardizedResponse, Response]:
        """Override retrieve to return standardized format"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.standardized_response(
            data=serializer.data, message="Record retrieved successfully"
        )

    def create(self, request, *args, **kwargs) -> Union[StandardizedResponse, Response]:
        """Override create to return standardized format"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return self.standardized_response(
            data=serializer.data, status=201, message="Resource created successfully"
        )

    def update(self, request, *args, **kwargs) -> Union[StandardizedResponse, Response]:
        """Override update to return standardized format"""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        return self.standardized_response(
            data=serializer.data, message="Resource updated successfully"
        )

    def destroy(
        self, request, *args, **kwargs
    ) -> Union[StandardizedResponse, Response]:
        """Override destroy to return standardized format"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return self.standardized_response(
            data=None, status=204, message="Resource deleted successfully"
        )

    def get_paginated_response(self, data):
        """Override pagination to include metadata in standardized format"""
        assert self.paginator is not None

        paginator = self.paginator
        pagination_meta = {
            "count": paginator.page.paginator.count,
            "page": paginator.page.number,
            "pages": paginator.page.paginator.num_pages,
            "page_size": paginator.get_page_size(self.request),
            "has_next": paginator.page.has_next(),
            "has_previous": paginator.page.has_previous(),
        }

        response = StandardizedResponse(
            data=data, message="Records retrieved successfully", request=self.request
        )
        response.data["meta"]["pagination"] = pagination_meta
        return response


def build_pagination_meta(paginator, page):
    """Build pagination metadata dict"""
    return {
        "count": paginator.count,
        "page": page.number,
        "pages": paginator.num_pages,
        "page_size": paginator.per_page,
        "has_next": page.has_next(),
        "has_previous": page.has_previous(),
    }
