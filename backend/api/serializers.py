from rest_framework import serializers
from courses.models import Category, Course, Cohort, Enrollment


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "color", "icon", "course_count"]


class CourseListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "slug",
            "title",
            "subtitle",
            "thumbnail",
            "thumbnail_alt",
            "categories",
            "level",
            "modules_count",
            "duration_weeks",
            "price",
            "original_price",
            "discount_percentage",
            "currency",
            "rating",
            "review_count",
            "enrolled_count",
            "is_featured",
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "slug",
            "title",
            "subtitle",
            "description",
            "thumbnail",
            "thumbnail_alt",
            "categories",
            "level",
            "modules_count",
            "duration_weeks",
            "duration_hours",
            "price",
            "original_price",
            "discount_percentage",
            "currency",
            "rating",
            "review_count",
            "enrolled_count",
            "meta_title",
            "meta_description",
            "created_at",
            "updated_at",
        ]


class CohortSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.CharField(source="course.slug", read_only=True)
    instructor_name = serializers.CharField(
        source="instructor.get_full_name", read_only=True
    )
    spots_remaining = serializers.IntegerField(read_only=True)
    availability_status = serializers.CharField(read_only=True)

    class Meta:
        model = Cohort
        fields = [
            "id",
            "course_title",
            "course_slug",
            "start_date",
            "end_date",
            "timezone",
            "format",
            "location",
            "instructor_name",
            "spots_total",
            "spots_remaining",
            "availability_status",
            "early_bird_price",
            "early_bird_deadline",
            "status",
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    cohort_info = CohortSerializer(source="cohort", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "course_title",
            "cohort_info",
            "amount_paid",
            "currency",
            "status",
            "created_at",
            "confirmed_at",
        ]
        read_only_fields = ["status", "confirmed_at"]
