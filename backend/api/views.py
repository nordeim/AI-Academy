from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    AllowAny,
)
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiResponse,
)
import json
import uuid
from courses.models import Category, Course, Cohort, Enrollment
from users.models import User
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CohortSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .throttles import EnrollmentThrottle
from .responses import ResponseFormatterMixin, SuccessResponse
from .utils.images import ImageUploadHandler
from .utils.cache import (
    get_course_list_cache_key,
    get_course_detail_cache_key,
    get_category_list_cache_key,
    get_cohorts_cache_key,
    get_cache_ttl,
)


@extend_schema_view(
    list=extend_schema(
        tags=["Categories"],
        summary="List all categories",
        description="Retrieve a list of all course categories with course counts.",
    ),
    retrieve=extend_schema(
        tags=["Categories"],
        summary="Get category details",
        description="Retrieve details for a specific category by slug.",
    ),
)
class CategoryViewSet(ResponseFormatterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        Category.objects.all()
        .annotate(course_count=Count("courses"))
        .order_by("order", "name")
    )
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def list(self, request, *args, **kwargs):
        cache_key = get_category_list_cache_key()
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, get_cache_ttl("category_list"))
        return response


@extend_schema_view(
    list=extend_schema(
        tags=["Courses"],
        summary="List all courses",
        description="Retrieve a paginated list of published courses with filtering, search, and ordering support.",
        parameters=[
            OpenApiParameter(
                name="level",
                description="Filter by course level (beginner, intermediate, advanced)",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="categories__slug",
                description="Filter by category slug",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="search",
                description="Search in title, subtitle, and description",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                description="Order results (price, -price, rating, -rating, created_at, -created_at)",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="featured",
                description="Filter to featured courses only",
                type=bool,
                required=False,
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=["Courses"],
        summary="Get course details",
        description="Retrieve detailed information about a specific course by slug.",
    ),
    cohorts=extend_schema(
        tags=["Courses"],
        summary="Get course cohorts",
        description="Retrieve upcoming and enrolling cohorts for a specific course.",
    ),
)
class CourseViewSet(ResponseFormatterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(status="published").prefetch_related("categories")
    serializer_class = CourseListSerializer
    lookup_field = "slug"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["level", "categories__slug"]
    search_fields = ["title", "subtitle", "description"]
    ordering_fields = ["price", "rating", "created_at", "enrolled_count"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        featured = self.request.query_params.get("featured")
        if featured:
            queryset = queryset.filter(is_featured=True)

        return queryset

    def list(self, request, *args, **kwargs):
        cache_key = get_course_list_cache_key(request)
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, get_cache_ttl("course_list"))
        return response

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get("slug")
        cache_key = get_course_detail_cache_key(slug)
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, get_cache_ttl("course_detail"))
        return response

    @action(detail=True, methods=["get"])
    def cohorts(self, request, slug=None):
        cache_key = get_cohorts_cache_key(slug)
        cached_data = cache.get(cache_key)

        if cached_data is not None:
            return Response(cached_data)

        course = self.get_object()
        cohorts = course.cohorts.filter(
            status__in=["upcoming", "enrolling"], start_date__gte=timezone.now().date()
        ).select_related("instructor")
        serializer = CohortSerializer(cohorts, many=True)
        response = SuccessResponse(
            data=serializer.data,
            message="Cohorts retrieved successfully",
            request=request,
        )
        cache.set(cache_key, response.data, get_cache_ttl("cohorts"))
        return response


@extend_schema_view(
    list=extend_schema(
        tags=["Cohorts"],
        summary="List all cohorts",
        description="Retrieve upcoming cohorts with filtering support.",
        parameters=[
            OpenApiParameter(
                name="course",
                description="Filter by course UUID",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="status",
                description="Filter by cohort status (upcoming, enrolling)",
                type=str,
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                description="Order results (start_date, -start_date)",
                type=str,
                required=False,
            ),
        ],
    ),
    retrieve=extend_schema(
        tags=["Cohorts"],
        summary="Get cohort details",
        description="Retrieve details for a specific cohort by ID.",
    ),
)
class CohortViewSet(ResponseFormatterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Cohort.objects.filter(
        status__in=["upcoming", "enrolling"]
    ).select_related("course", "instructor")
    serializer_class = CohortSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["course", "format", "status"]
    ordering_fields = ["start_date", "price"]
    ordering = ["start_date"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by upcoming
        queryset = queryset.filter(start_date__gte=timezone.now().date())

        return queryset


@extend_schema_view(
    list=extend_schema(
        tags=["Enrollments"],
        summary="List user enrollments",
        description="Retrieve the authenticated user's enrollments.",
    ),
    retrieve=extend_schema(
        tags=["Enrollments"],
        summary="Get enrollment details",
        description="Retrieve details for a specific enrollment.",
    ),
    create=extend_schema(
        tags=["Enrollments"],
        summary="Create enrollment",
        description="Enroll the authenticated user in a course cohort.",
        request=EnrollmentCreateSerializer,
        responses={
            201: OpenApiResponse(description="Enrollment created successfully"),
            400: OpenApiResponse(description="Validation error"),
        },
    ),
)
class EnrollmentViewSet(ResponseFormatterMixin, viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [EnrollmentThrottle]

    def get_serializer_class(self):
        if self.action == "create":
            return EnrollmentCreateSerializer
        return EnrollmentSerializer

    def get_queryset(self):
        # Handle swagger schema generation
        if getattr(self, "swagger_fake_view", False):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create enrollment with validation and spot reservation"""
        # Use create serializer for validation
        create_serializer = self.get_serializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)

        cohort = create_serializer.validated_data["cohort"]

        # Increment spots_reserved
        cohort.spots_reserved += 1
        cohort.save()

        # Create enrollment
        enrollment = Enrollment.objects.create(
            user=request.user,
            course=create_serializer.validated_data["course"],
            cohort=cohort,
            amount_paid=create_serializer.validated_data["amount_paid"],
            status="pending",
        )

        # Return with full serializer
        read_serializer = EnrollmentSerializer(enrollment)
        return SuccessResponse(
            data=read_serializer.data,
            status=201,
            message="Enrollment created successfully",
            request=request,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Cancel enrollment and release spot"""
        enrollment = self.get_object()

        if enrollment.status == "cancelled":
            return SuccessResponse(
                data=None,
                status=400,
                message="Enrollment is already cancelled",
                request=request,
            )

        if enrollment.status not in ["pending", "confirmed"]:
            return SuccessResponse(
                data=None,
                status=400,
                message=f"Cannot cancel enrollment with status: {enrollment.status}",
                request=request,
            )

        # Release spot
        cohort = enrollment.cohort
        cohort.spots_reserved = max(0, cohort.spots_reserved - 1)
        cohort.save()

        # Update enrollment
        enrollment.status = "cancelled"
        enrollment.save()

        return SuccessResponse(
            data={"status": "enrollment cancelled"},
            message="Enrollment cancelled successfully",
            request=request,
        )


class CourseThumbnailUploadView(APIView):
    """Handle course thumbnail uploads"""

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        tags=["Image Upload"],
        summary="Upload course thumbnail",
        description="Upload a thumbnail image for a specific course.",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "thumbnail": {
                        "type": "string",
                        "format": "binary",
                        "description": "Thumbnail image file (JPEG, PNG, WebP, max 10MB)",
                    }
                },
                "required": ["thumbnail"],
            }
        },
        responses={
            201: OpenApiResponse(description="Thumbnail uploaded successfully"),
            400: OpenApiResponse(description="Invalid file or validation error"),
            404: OpenApiResponse(description="Course not found"),
        },
    )
    def post(self, request, slug):
        """Upload thumbnail for a course"""
        # Get course
        course = get_object_or_404(Course, slug=slug)

        # Check if file provided
        if "thumbnail" not in request.FILES:
            return SuccessResponse(
                data=None,
                status=400,
                message="No thumbnail file provided",
                errors={"thumbnail": ["This field is required"]},
                request=request,
            )

        thumbnail_file = request.FILES["thumbnail"]

        try:
            # Generate unique filename
            unique_filename = f"{course.slug}_{uuid.uuid4().hex[:8]}.jpg"

            # Validate and process image
            processed_file = ImageUploadHandler.handle_thumbnail_upload(
                thumbnail_file, thumbnail_file.name
            )

            # Delete old thumbnail if exists
            if course.thumbnail:
                try:
                    course.thumbnail.delete(save=False)
                except Exception:
                    pass

            # Save new thumbnail
            course.thumbnail.save(
                f"thumbnails/{unique_filename}",
                processed_file,
                save=True,
            )

            # Return standardized response
            return SuccessResponse(
                data={
                    "thumbnail_url": request.build_absolute_uri(course.thumbnail.url),
                },
                status=201,
                message="Thumbnail uploaded successfully",
                request=request,
            )

        except ValidationError as e:
            return SuccessResponse(
                data=None,
                status=400,
                message=str(e),
                errors={"thumbnail": [str(e)]},
                request=request,
            )


class UserAvatarUploadView(APIView):
    """Handle user avatar uploads"""

    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        tags=["Image Upload"],
        summary="Upload user avatar",
        description="Upload an avatar image for the authenticated user.",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "avatar": {
                        "type": "string",
                        "format": "binary",
                        "description": "Avatar image file (JPEG, PNG, WebP, max 10MB)",
                    }
                },
                "required": ["avatar"],
            }
        },
        responses={
            201: OpenApiResponse(description="Avatar uploaded successfully"),
            400: OpenApiResponse(description="Invalid file or validation error"),
            401: OpenApiResponse(description="Authentication required"),
        },
    )
    def post(self, request):
        """Upload avatar for current user"""
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return SuccessResponse(
                data=None,
                status=401,
                message="Authentication required",
                request=request,
            )

        # Check if file provided
        if "avatar" not in request.FILES:
            return SuccessResponse(
                data=None,
                status=400,
                message="No avatar file provided",
                errors={"avatar": ["This field is required"]},
                request=request,
            )

        avatar_file = request.FILES["avatar"]

        try:
            # Generate unique filename
            unique_filename = f"{request.user.username}_{uuid.uuid4().hex[:8]}.jpg"

            # Validate and process image
            processed_file = ImageUploadHandler.handle_avatar_upload(
                avatar_file, avatar_file.name
            )

            # Delete old avatar if exists
            if hasattr(request.user, "avatar") and request.user.avatar:
                try:
                    request.user.avatar.delete(save=False)
                except Exception:
                    pass

            # Save new avatar
            request.user.avatar.save(
                f"avatars/{unique_filename}", processed_file, save=True
            )

            # Return standardized response
            return SuccessResponse(
                data={
                    "avatar_url": request.build_absolute_uri(request.user.avatar.url),
                },
                status=201,
                message="Avatar uploaded successfully",
                request=request,
            )

        except ValidationError as e:
            return SuccessResponse(
                data=None,
                status=400,
                message=str(e),
                errors={"avatar": [str(e)]},
                request=request,
            )


@extend_schema(
    tags=["Authentication"],
    summary="Register new user",
    description="Create a new user account with email and password.",
    request=UserCreateSerializer,
    responses={
        201: OpenApiResponse(description="User registered successfully"),
        400: OpenApiResponse(description="Validation error"),
    },
)
class RegisterView(APIView):
    """Handle user registration"""

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        """Register a new user"""
        serializer = UserCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return SuccessResponse(
                data=None,
                status=400,
                message="Registration failed. Please check your input.",
                errors=serializer.errors,
                request=request,
            )

        try:
            user = serializer.save()
            return SuccessResponse(
                data={"user_id": str(user.id)},
                status=201,
                message="User registered successfully",
                request=request,
            )
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Registration error: {e}")
            import traceback

            logger.error(traceback.format_exc())
            return SuccessResponse(
                data=None,
                status=500,
                message=f"Registration failed: {str(e)}",
                errors={"non_field_errors": [str(e)]},
                request=request,
            )


@extend_schema(
    tags=["User Profile"],
    summary="Get/Update current user profile",
    description="Retrieve or update the authenticated user's profile information.",
    methods=["GET", "PATCH"],
    responses={
        200: UserProfileSerializer,
        400: OpenApiResponse(description="Validation error"),
        401: OpenApiResponse(description="Authentication required"),
    },
)
@extend_schema(methods=["PATCH"], request=UserProfileSerializer)
class UserMeView(APIView):
    """Handle current user profile operations"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(
            request.user,
            context={"request": request},
        )
        return SuccessResponse(
            data=serializer.data,
            message="Profile retrieved successfully",
            request=request,
        )

    def patch(self, request):
        """Update current user profile"""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if not serializer.is_valid():
            return SuccessResponse(
                data=None,
                status=400,
                message="Update failed. Please check your input.",
                errors=serializer.errors,
                request=request,
            )

        try:
            serializer.save()
            return SuccessResponse(
                data=serializer.data,
                message="Profile updated successfully",
                request=request,
            )
        except Exception as e:
            return SuccessResponse(
                data=None,
                status=400,
                message="Update failed.",
                errors={"non_field_errors": [str(e)]},
                request=request,
            )


@extend_schema(
    tags=["Authentication"],
    summary="Request password reset",
    description="Request a password reset email for a given email address.",
    request=PasswordResetRequestSerializer,
    responses={
        200: OpenApiResponse(
            description="Password reset email sent (if account exists)"
        ),
        400: OpenApiResponse(description="Invalid email format"),
    },
)
class PasswordResetRequestView(APIView):
    """Handle password reset requests"""

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        """Request password reset"""
        serializer = PasswordResetRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return SuccessResponse(
                data=None,
                status=400,
                message="Invalid email address.",
                errors=serializer.errors,
                request=request,
            )

        email = serializer.validated_data["email"]

        # Find user by email (case-insensitive)
        user = User.objects.filter(email__iexact=email).first()

        if user:
            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            return SuccessResponse(
                data={
                    "message": "Password reset email sent.",
                    "token": token,
                    "uid": uid,
                },
                message="Password reset email sent if account exists.",
                request=request,
            )

        # Don't reveal whether email exists
        return SuccessResponse(
            data={"message": "Password reset email sent."},
            message="Password reset email sent if account exists.",
            request=request,
        )


@extend_schema(
    tags=["Authentication"],
    summary="Confirm password reset",
    description="Confirm a password reset with token and UID from email.",
    request=PasswordResetConfirmSerializer,
    responses={
        200: OpenApiResponse(description="Password reset successful"),
        400: OpenApiResponse(description="Invalid or expired token"),
    },
)
class PasswordResetConfirmView(APIView):
    """Handle password reset confirmation"""

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        """Confirm password reset with token"""
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if not serializer.is_valid():
            return SuccessResponse(
                data=None,
                status=400,
                message="Invalid input.",
                errors=serializer.errors,
                request=request,
            )

        token = serializer.validated_data["token"]
        uid = serializer.validated_data["uid"]
        new_password = serializer.validated_data["new_password"]

        try:
            # Decode user ID
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return SuccessResponse(
                data=None,
                status=400,
                message="Invalid reset token.",
                errors={"token": ["Invalid or expired token."]},
                request=request,
            )

        # Verify token
        if not default_token_generator.check_token(user, token):
            return SuccessResponse(
                data=None,
                status=400,
                message="Invalid reset token.",
                errors={"token": ["Invalid or expired token."]},
                request=request,
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return SuccessResponse(
            data={"message": "Password reset successful."},
            message="Password has been reset successfully.",
            request=request,
        )
