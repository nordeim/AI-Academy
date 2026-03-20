from django.contrib import admin
from .models import Category, Course, Cohort, Enrollment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'course_count']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

    def course_count(self, obj):
        return obj.courses.count()


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'level', 'price', 'rating', 'enrolled_count', 'status', 'is_featured', 'created_at']
    list_filter = ['level', 'status', 'is_featured', 'categories']
    list_editable = ['status', 'is_featured']
    search_fields = ['title', 'subtitle', 'description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['categories']
    date_hierarchy = 'created_at'


@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ['course', 'start_date', 'end_date', 'format', 'spots_remaining', 'status']
    list_filter = ['status', 'format', 'start_date']
    search_fields = ['course__title']
    date_hierarchy = 'start_date'

    def spots_remaining(self, obj):
        return obj.spots_remaining
    spots_remaining.short_description = 'Spots Left'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'cohort', 'amount_paid', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'course__title']
    date_hierarchy = 'created_at'
