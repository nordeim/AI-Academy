"""
API Views Package

Contains all API view classes organized by domain.
"""

from api.views.all_views import (
    CategoryViewSet,
    CourseViewSet,
    CohortViewSet,
    EnrollmentViewSet,
    CourseThumbnailUploadView,
    UserAvatarUploadView,
    RegisterView,
    UserMeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)
from api.views.payments import PaymentViewSet, StripeWebhookView

__all__ = [
    # Main views
    "CategoryViewSet",
    "CourseViewSet",
    "CohortViewSet",
    "EnrollmentViewSet",
    "CourseThumbnailUploadView",
    "UserAvatarUploadView",
    "RegisterView",
    "UserMeView",
    "PasswordResetRequestView",
    "PasswordResetConfirmView",
    # Payment views
    "PaymentViewSet",
    "StripeWebhookView",
]
