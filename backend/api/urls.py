from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views
from api.views.payments import PaymentViewSet, StripeWebhookView

app_name = "api"

router = DefaultRouter()
router.register(r"courses", views.CourseViewSet, basename="course")
router.register(r"cohorts", views.CohortViewSet, basename="cohort")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"enrollments", views.EnrollmentViewSet, basename="enrollment")
router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("", include(router.urls)),
    # Image upload endpoints
    path(
        "courses/<slug:slug>/thumbnail/",
        views.CourseThumbnailUploadView.as_view(),
        name="course-upload-thumbnail",
    ),
    path(
        "users/me/avatar/",
        views.UserAvatarUploadView.as_view(),
        name="user-upload-avatar",
    ),
    # User management endpoints
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("users/me/", views.UserMeView.as_view(), name="user-me"),
    path(
        "auth/password-reset/",
        views.PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "auth/password-reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    # JWT Authentication endpoints
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Session authentication (for admin/browsable API)
    path("auth/", include("rest_framework.urls")),
    # Stripe webhook endpoint
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
