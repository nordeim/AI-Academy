from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

router = DefaultRouter()
router.register(r"courses", views.CourseViewSet, basename="course")
router.register(r"cohorts", views.CohortViewSet, basename="cohort")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"enrollments", views.EnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path("", include(router.urls)),
    # JWT Authentication endpoints
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Session authentication (for admin/browsable API)
    path("auth/", include("rest_framework.urls")),
]
