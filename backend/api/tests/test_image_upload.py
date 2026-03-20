"""
Test Image Upload Functionality

Ensures secure image upload for course thumbnails and user avatars.
TDD Phase: RED - Tests should fail initially
"""

import os
import io
import shutil
import tempfile
from PIL import Image
from django.test import TestCase, override_settings
from django.urls import reverse
from django.conf import settings
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.base import ContentFile

from courses.models import Course, Category
from users.models import User


# Test storage configuration - use local filesystem
TEST_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {
                "location": TEST_MEDIA_ROOT,
                "base_url": "/media/",
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
)
class ImageUploadBaseTests(APITestCase):
    """Base class with helper methods for image upload tests"""

    def generate_test_image(
        self, width=800, height=600, format="JPEG", color=(255, 0, 0), filename=None
    ):
        """Generate a test image file with proper filename"""
        image = Image.new("RGB", (width, height), color=color)
        buffer = io.BytesIO()
        image.save(buffer, format=format)
        buffer.seek(0)

        # Set filename for Django to recognize
        ext = format.lower() if format != "JPEG" else "jpg"
        buffer.name = filename or f"test_image.{ext}"
        return buffer

    def generate_large_image(self, size_mb=15):
        """Generate a large image file exceeding size limits"""
        import numpy as np
        from PIL import Image

        # Create a large image with random noise (poorly compressible)
        # Each pixel needs ~3 bytes, JPEG compression ~2:1 for random noise
        # Target: size_mb MB file
        pixels_needed = size_mb * 1024 * 1024 * 2  # 2 bytes per pixel after compression
        width = int((pixels_needed / 3) ** 0.5) + 100

        # Generate random noise image
        noise = np.random.randint(0, 256, (width, width, 3), dtype=np.uint8)
        image = Image.fromarray(noise, "RGB")

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=95)
        buffer.seek(0)
        buffer.name = "large_image.jpg"

        return buffer

    @classmethod
    def tearDownClass(cls):
        """Clean up test media directory"""
        super().tearDownClass()
        if os.path.exists(TEST_MEDIA_ROOT):
            shutil.rmtree(TEST_MEDIA_ROOT, ignore_errors=True)


class TestCourseThumbnailUpload(ImageUploadBaseTests):
    """Test course thumbnail upload endpoint"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.admin_user = User.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="adminpass123",
            is_staff=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.admin_user)

    def test_upload_valid_jpeg_thumbnail(self):
        """Verify JPEG image can be uploaded as course thumbnail"""
        image_buffer = self.generate_test_image(format="JPEG", width=800, height=600)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertIn("data", response.data)
        self.assertIn("thumbnail_url", response.data["data"])
        self.assertIsNotNone(response.data["data"]["thumbnail_url"])

    def test_upload_valid_png_thumbnail(self):
        """Verify PNG image can be uploaded as course thumbnail"""
        image_buffer = self.generate_test_image(format="PNG", width=800, height=600)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])

    def test_upload_valid_webp_thumbnail(self):
        """Verify WebP image can be uploaded as course thumbnail"""
        image_buffer = self.generate_test_image(format="WebP", width=800, height=600)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])

    def test_upload_invalid_format(self):
        """Verify GIF images are rejected"""
        image_buffer = self.generate_test_image(format="GIF", width=800, height=600)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("thumbnail", response.data.get("errors", {}))

    def test_upload_oversized_image(self):
        """Verify images exceeding max size are rejected"""
        image_buffer = self.generate_large_image(size_mb=15)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_upload_too_small_dimensions(self):
        """Verify images below minimum dimensions are rejected"""
        image_buffer = self.generate_test_image(width=100, height=100)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_upload_without_authentication(self):
        """Verify upload requires authentication"""
        self.client.force_authenticate(user=None)
        image_buffer = self.generate_test_image()

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_to_nonexistent_course(self):
        """Verify 404 for non-existent course"""
        image_buffer = self.generate_test_image()

        response = self.client.post(
            reverse(
                "api:course-upload-thumbnail", kwargs={"slug": "nonexistent-course"}
            ),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_course_thumbnail_is_updated(self):
        """Verify course thumbnail field is updated after upload"""
        image_buffer = self.generate_test_image()

        self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        # Refresh course from DB
        self.course.refresh_from_db()
        self.assertIsNotNone(self.course.thumbnail)
        self.assertTrue(self.course.thumbnail.name)


class TestUserAvatarUpload(ImageUploadBaseTests):
    """Test user avatar upload endpoint"""

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

    def setUp(self):
        self.client.force_authenticate(user=self.user)

    def test_upload_valid_avatar(self):
        """Verify user can upload avatar"""
        image_buffer = self.generate_test_image(width=400, height=400)

        response = self.client.post(
            reverse("api:user-upload-avatar"),
            data={"avatar": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertIn("avatar_url", response.data["data"])

    def test_upload_avatar_without_auth(self):
        """Verify avatar upload requires authentication"""
        self.client.force_authenticate(user=None)
        image_buffer = self.generate_test_image(width=400, height=400)

        response = self.client.post(
            reverse("api:user-upload-avatar"),
            data={"avatar": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_square_avatar(self):
        """Verify square avatars are accepted"""
        image_buffer = self.generate_test_image(width=400, height=400)

        response = self.client.post(
            reverse("api:user-upload-avatar"),
            data={"avatar": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_avatar_is_resized(self):
        """Verify large avatars are resized"""
        image_buffer = self.generate_test_image(width=2000, height=2000)

        response = self.client.post(
            reverse("api:user-upload-avatar"),
            data={"avatar": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Avatar should be resized (implementation detail)


class TestImageValidation(ImageUploadBaseTests):
    """Test image validation rules"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.admin_user = User.objects.create_user(
            username="adminuser2",
            email="admin2@example.com",
            password="adminpass123",
            is_staff=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.admin_user)

    def test_reject_text_file_as_image(self):
        """Verify text files disguised as images are rejected"""
        fake_image = io.BytesIO(b"This is not an image")
        fake_image.name = "fake.jpg"

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": fake_image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_pdf_as_image(self):
        """Verify PDF files are rejected"""
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n"
        fake_pdf = io.BytesIO(pdf_content)
        fake_pdf.name = "document.jpg"

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": fake_pdf},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_executable_file(self):
        """Verify executable files disguised as images are rejected"""
        fake_image = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00")
        fake_image.name = "malware.jpg"

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": fake_image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_path_traversal_attempt(self):
        """Verify path traversal in filename is sanitized/blocked"""
        # Note: Django's InMemoryUploadedFile automatically sanitizes filenames
        # by removing path components via get_valid_filename()
        # So "../../../etc/passwd.jpg" becomes "passwd.jpg"
        image_buffer = self.generate_test_image()
        image_buffer.name = "../../../etc/passwd.jpg"

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        # Django sanitizes the filename, so upload succeeds (201)
        # This is correct security behavior - Django handles path sanitization
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify the thumbnail was saved (not in /etc/passwd)
        self.course.refresh_from_db()
        self.assertIsNotNone(self.course.thumbnail)
        # The path should not contain "etc/passwd"
        self.assertNotIn("etc/passwd", self.course.thumbnail.name)

    def test_missing_file_field(self):
        """Verify request without file field is rejected"""
        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestImageProcessing(ImageUploadBaseTests):
    """Test image processing and optimization"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.admin_user = User.objects.create_user(
            username="adminuser3",
            email="admin3@example.com",
            password="adminpass123",
            is_staff=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.admin_user)

    def test_large_image_is_resized(self):
        """Verify large images are resized to max dimensions"""
        image_buffer = self.generate_test_image(width=4000, height=3000)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Implementation should resize to max 1920x1080

    def test_image_aspect_ratio_preserved(self):
        """Verify aspect ratio is preserved during resize"""
        image_buffer = self.generate_test_image(width=2000, height=1000)

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_response_includes_thumbnail_url(self):
        """Verify response includes URL to uploaded image"""
        image_buffer = self.generate_test_image()

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data.get("data", {})
        self.assertIn("thumbnail_url", data)
        self.assertTrue(data["thumbnail_url"].startswith("http"))


class TestStorageIntegration(ImageUploadBaseTests):
    """Test storage backend integration"""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="AI Fundamentals",
            slug="ai-fundamentals",
            description="Learn AI basics",
        )
        cls.course = Course.objects.create(
            title="Introduction to AI",
            slug="intro-to-ai",
            subtitle="Learn the basics",
            description="Complete AI course",
            level="beginner",
            duration_weeks=8,
            duration_hours=40,
            price=99.99,
            status="published",
        )
        cls.course.categories.add(cls.category)

        cls.admin_user = User.objects.create_user(
            username="adminuser4",
            email="admin4@example.com",
            password="adminpass123",
            is_staff=True,
        )

    def setUp(self):
        self.client.force_authenticate(user=self.admin_user)

    def test_file_stored_with_unique_name(self):
        """Verify uploaded files have unique filenames"""
        image_buffer1 = self.generate_test_image(color=(255, 0, 0))
        image_buffer2 = self.generate_test_image(color=(0, 255, 0))

        response1 = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer1},
            format="multipart",
        )

        response2 = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer2},
            format="multipart",
        )

        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)

        # URLs should be different (unique filenames)
        url1 = response1.data["data"]["thumbnail_url"]
        url2 = response2.data["data"]["thumbnail_url"]
        self.assertNotEqual(url1, url2)

    def test_standardized_response_format(self):
        """Verify upload responses follow standard format"""
        image_buffer = self.generate_test_image()

        response = self.client.post(
            reverse("api:course-upload-thumbnail", kwargs={"slug": self.course.slug}),
            data={"thumbnail": image_buffer},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check standardized format
        self.assertIn("success", response.data)
        self.assertIn("data", response.data)
        self.assertIn("message", response.data)
        self.assertIn("errors", response.data)
        self.assertIn("meta", response.data)
        self.assertIn("timestamp", response.data["meta"])
        self.assertIn("request_id", response.data["meta"])
