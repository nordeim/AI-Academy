from rest_framework import serializers
from django.contrib.auth import get_user_model
from courses.models import Category, Course, Cohort, Enrollment

User = get_user_model()


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


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating enrollments with validation"""

    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    cohort = serializers.PrimaryKeyRelatedField(queryset=Cohort.objects.all())

    class Meta:
        model = Enrollment
        fields = ["course", "cohort", "amount_paid"]

    def validate_cohort(self, cohort):
        """Validate cohort has available spots"""
        if cohort.spots_remaining <= 0:
            raise serializers.ValidationError(
                "This cohort is full. Please join the waitlist."
            )
        return cohort

    def validate(self, data):
        """Validate user not already enrolled"""
        user = self.context["request"].user
        cohort = data["cohort"]

        if Enrollment.objects.filter(user=user, cohort=cohort).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this cohort."
            )

        return data


# User Management Serializers


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "first_name", "last_name"]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        """Ensure username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value

    def create(self, validated_data):
        """Create user with hashed password"""
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile get/update"""

    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "bio",
            "phone",
            "avatar_url",
            "company",
            "title",
            "linkedin_url",
            "github_url",
            "is_student",
            "is_instructor",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "username",
            "created_at",
            "updated_at",
            "is_student",
            "is_instructor",
        ]

    def get_avatar_url(self, obj):
        """Get avatar URL if exists"""
        if obj.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def update(self, instance, validated_data):
        """Update user profile - exclude read-only fields"""
        # Remove any read-only fields that might have been passed
        read_only_fields = [
            "id",
            "email",
            "username",
            "created_at",
            "updated_at",
            "is_student",
            "is_instructor",
        ]
        for field in read_only_fields:
            validated_data.pop(field, None)

        return super().update(instance, validated_data)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Validate email format"""
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""

    token = serializers.CharField(required=True)
    uid = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)

    def validate_new_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value
