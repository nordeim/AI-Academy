from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "email",
        "username",
        "first_name",
        "last_name",
        "is_student",
        "is_instructor",
        "created_at",
    ]
    list_filter = ["is_student", "is_instructor", "is_staff", "is_active"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering = ["-created_at"]

    # Convert to list for proper type safety and LSP compatibility
    fieldsets = list(UserAdmin.fieldsets) + [
        (
            "Profile",
            {
                "fields": (
                    "phone",
                    "bio",
                    "avatar",
                    "company",
                    "title",
                    "linkedin_url",
                    "github_url",
                )
            },
        ),
        ("Roles", {"fields": ("is_student", "is_instructor")}),
    ]
