"""
Image Processing Utilities

Provides image validation, resizing, and optimization for uploads.
"""

import io
import os
from PIL import Image
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError


class ImageValidator:
    """Image validation utilities"""

    # Allowed formats
    ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
    ALLOWED_FORMATS = ["JPEG", "JPG", "PNG", "WEBP"]

    # Size limits
    MAX_SIZE_MB = 10
    MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

    # Dimension limits for course thumbnails
    THUMBNAIL_MIN_WIDTH = 300
    THUMBNAIL_MIN_HEIGHT = 200
    THUMBNAIL_MAX_WIDTH = 1920
    THUMBNAIL_MAX_HEIGHT = 1080

    # Dimension limits for avatars
    AVATAR_MIN_SIZE = 100
    AVATAR_MAX_SIZE = 1024
    AVATAR_TARGET_SIZE = 400

    @classmethod
    def validate_extension(cls, filename):
        """Validate file extension"""
        ext = os.path.splitext(filename.lower())[1]
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValidationError(
                f"File extension '{ext}' not allowed. "
                f"Allowed: {', '.join(cls.ALLOWED_EXTENSIONS)}"
            )
        return True

    @classmethod
    def validate_size(cls, file_size):
        """Validate file size"""
        if file_size > cls.MAX_SIZE_BYTES:
            raise ValidationError(f"File too large. Max size: {cls.MAX_SIZE_MB}MB")
        return True

    @classmethod
    def validate_image_content(cls, file_obj):
        """Validate file is actually an image"""
        try:
            # Try to open as image
            image = Image.open(file_obj)
            image.verify()
            file_obj.seek(0)

            # Check format
            if image.format not in cls.ALLOWED_FORMATS:
                raise ValidationError(
                    f"Image format '{image.format}' not supported. "
                    f"Allowed: {', '.join(cls.ALLOWED_FORMATS)}"
                )

            return True
        except Exception as e:
            raise ValidationError(f"Invalid image file: {str(e)}")

    @classmethod
    def validate_thumbnail_dimensions(cls, width, height):
        """Validate thumbnail dimensions"""
        if width < cls.THUMBNAIL_MIN_WIDTH:
            raise ValidationError(
                f"Image width must be at least {cls.THUMBNAIL_MIN_WIDTH}px"
            )
        if height < cls.THUMBNAIL_MIN_HEIGHT:
            raise ValidationError(
                f"Image height must be at least {cls.THUMBNAIL_MIN_HEIGHT}px"
            )
        return True

    @classmethod
    def validate_avatar_dimensions(cls, width, height):
        """Validate avatar dimensions"""
        min_size = min(width, height)
        if min_size < cls.AVATAR_MIN_SIZE:
            raise ValidationError(
                f"Avatar must be at least {cls.AVATAR_MIN_SIZE}x{cls.AVATAR_MIN_SIZE}px"
            )
        return True

    @classmethod
    def sanitize_filename(cls, filename):
        """Sanitize filename to prevent path traversal"""
        # Check for path traversal attempts
        if ".." in filename or "/" in filename or "\\" in filename:
            raise ValidationError(
                "Invalid filename. Path traversal characters not allowed."
            )

        # Remove any suspicious characters (keep only safe ones)
        filename = "".join(c for c in filename if c.isalnum() or c in "._-")

        # Ensure it has an extension
        if "." not in filename:
            raise ValidationError("Filename must have an extension")

        return filename


class ImageProcessor:
    """Image processing utilities"""

    @staticmethod
    def resize_image(image, max_width, max_height, maintain_aspect=True):
        """Resize image to fit within max dimensions"""
        if maintain_aspect:
            image.thumbnail((max_width, max_height), Image.LANCZOS)
        else:
            image = image.resize((max_width, max_height), Image.LANCZOS)
        return image

    @staticmethod
    def process_thumbnail(image_file, max_width=1920, max_height=1080, quality=85):
        """
        Process thumbnail image:
        - Resize if too large
        - Optimize JPEG quality
        - Maintain aspect ratio
        """
        try:
            # Open image
            image = Image.open(image_file)

            # Convert to RGB if necessary (for PNG with transparency)
            if image.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(
                    image,
                    mask=image.split()[-1] if image.mode in ("RGBA", "LA") else None,
                )
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            # Resize if larger than max dimensions
            if image.width > max_width or image.height > max_height:
                image = ImageProcessor.resize_image(image, max_width, max_height)

            # Save to buffer
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=quality, optimize=True)
            output.seek(0)

            return output

        except Exception as e:
            raise ValidationError(f"Image processing failed: {str(e)}")

    @staticmethod
    def process_avatar(image_file, target_size=400, quality=90):
        """
        Process avatar image:
        - Resize to square
        - Center crop if not square
        - Optimize quality
        """
        try:
            # Open image
            image = Image.open(image_file)

            # Convert to RGB if necessary
            if image.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(
                    image,
                    mask=image.split()[-1] if image.mode in ("RGBA", "LA") else None,
                )
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            # Calculate crop dimensions for square
            min_side = min(image.width, image.height)
            left = (image.width - min_side) // 2
            top = (image.height - min_side) // 2
            right = left + min_side
            bottom = top + min_side

            # Crop to square
            image = image.crop((left, top, right, bottom))

            # Resize to target size
            image = image.resize((target_size, target_size), Image.LANCZOS)

            # Save to buffer
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=quality, optimize=True)
            output.seek(0)

            return output

        except Exception as e:
            raise ValidationError(f"Avatar processing failed: {str(e)}")


class ImageUploadHandler:
    """Handle image upload workflow"""

    @staticmethod
    def handle_thumbnail_upload(image_file, filename):
        """
        Handle thumbnail upload:
        1. Validate extension
        2. Validate content
        3. Validate dimensions
        4. Process/resize
        5. Return processed file
        """
        # Validate extension
        ImageValidator.validate_extension(filename)
        ImageValidator.sanitize_filename(filename)

        # Validate size - use .size attribute if available (Django UploadedFile)
        if hasattr(image_file, "size") and image_file.size is not None:
            file_size = image_file.size
        else:
            image_file.seek(0, 2)  # Seek to end
            file_size = image_file.tell()
            image_file.seek(0)  # Reset to beginning

        ImageValidator.validate_size(file_size)

        # Validate content
        ImageValidator.validate_image_content(image_file)

        # Get dimensions
        image = Image.open(image_file)
        ImageValidator.validate_thumbnail_dimensions(image.width, image.height)
        image_file.seek(0)

        # Process image
        processed = ImageProcessor.process_thumbnail(image_file)

        # Create ContentFile
        return ContentFile(processed.read(), name=filename)

    @staticmethod
    def handle_avatar_upload(image_file, filename):
        """
        Handle avatar upload:
        1. Validate extension
        2. Validate content
        3. Validate dimensions
        4. Process (crop to square, resize)
        5. Return processed file
        """
        # Validate extension
        ImageValidator.validate_extension(filename)
        ImageValidator.sanitize_filename(filename)

        # Validate size
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        ImageValidator.validate_size(file_size)

        # Validate content
        ImageValidator.validate_image_content(image_file)

        # Get dimensions
        image = Image.open(image_file)
        ImageValidator.validate_avatar_dimensions(image.width, image.height)
        image_file.seek(0)

        # Process image
        processed = ImageProcessor.process_avatar(image_file)

        # Create ContentFile
        return ContentFile(processed.read(), name=filename)
