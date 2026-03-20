from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from courses.models import Category, Course, Cohort, Enrollment
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CohortSerializer,
    EnrollmentSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(status='published')
    serializer_class = CourseListSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'categories__slug']
    search_fields = ['title', 'subtitle', 'description']
    ordering_fields = ['price', 'rating', 'created_at', 'enrolled_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(is_featured=True)

        return queryset

    @action(detail=True, methods=['get'])
    def cohorts(self, request, slug=None):
        course = self.get_object()
        cohorts = course.cohorts.filter(
            status__in=['upcoming', 'enrolling'],
            start_date__gte=timezone.now().date()
        )
        serializer = CohortSerializer(cohorts, many=True)
        return Response(serializer.data)


class CohortViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cohort.objects.filter(status__in=['upcoming', 'enrolling'])
    serializer_class = CohortSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'format', 'status']
    ordering_fields = ['start_date', 'price']
    ordering = ['start_date']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by upcoming
        queryset = queryset.filter(start_date__gte=timezone.now().date())

        return queryset


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        enrollment = self.get_object()
        if enrollment.status in ['confirmed', 'pending']:
            enrollment.status = 'cancelled'
            enrollment.save()
            return Response({'status': 'enrollment cancelled'})
        return Response(
            {'error': 'Cannot cancel this enrollment'},
            status=status.HTTP_400_BAD_REQUEST
        )
