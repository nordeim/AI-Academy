from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from django.db import transaction
from courses.models import Category, Course, Cohort, Enrollment
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CohortSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().annotate(course_count=Count("courses"))
    serializer_class = CategorySerializer
    lookup_field = "slug"


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
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

        # Filter by featured
        featured = self.request.query_params.get("featured")
        if featured:
            queryset = queryset.filter(is_featured=True)

        return queryset

    @action(detail=True, methods=["get"])
    def cohorts(self, request, slug=None):
        course = self.get_object()
        cohorts = course.cohorts.filter(
            status__in=["upcoming", "enrolling"], start_date__gte=timezone.now().date()
        ).select_related("instructor")
        serializer = CohortSerializer(cohorts, many=True)
        return Response(serializer.data)


class CohortViewSet(viewsets.ReadOnlyModelViewSet):
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


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return EnrollmentCreateSerializer
        return EnrollmentSerializer

    def get_queryset(self):
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
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Cancel enrollment and release spot"""
        enrollment = self.get_object()

        if enrollment.status == "cancelled":
            return Response(
                {"error": "Enrollment is already cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if enrollment.status not in ["pending", "confirmed"]:
            return Response(
                {"error": f"Cannot cancel enrollment with status: {enrollment.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Release spot
        cohort = enrollment.cohort
        cohort.spots_reserved = max(0, cohort.spots_reserved - 1)
        cohort.save()

        # Update enrollment
        enrollment.status = "cancelled"
        enrollment.save()

        return Response({"status": "enrollment cancelled"})
