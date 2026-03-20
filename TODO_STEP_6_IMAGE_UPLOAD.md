# Step 6: Image Upload Support - TDD Implementation Plan

**Status:** Planning Complete | **Priority:** P1 - High | **Estimated Effort:** 4-6 hours

---

## Executive Summary

Implement secure image upload functionality for course thumbnails and user avatars. This includes:
- MinIO/S3-compatible storage backend configuration
- Dedicated upload endpoints with validation
- Image resizing and optimization
- URL generation for frontend consumption

---

## Current State Analysis

### Existing Configuration
- **Course.thumbnail:** ImageField already exists in model
- **User model:** Has avatar field (check if exists)
- **Storage:** Currently using local filesystem (MEDIA_ROOT)
- **Docker Compose:** MinIO service already configured

### MinIO Configuration
```yaml
# From docker-compose.yml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"  # API
    - "9001:9001"  # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
```

### Required Dependencies
```
django-storages==1.14.2
boto3==1.34.0
Pillow==11.0.0  # Already installed
```

---

## TDD Implementation Phases

### Phase 1: RED - Write Failing Tests
**Objective:** Create comprehensive tests that define expected behavior before implementation

#### Test Cases:

1. **Test Image Upload Success**
   - Upload valid image (JPEG, PNG, WebP)
   - Verify 201 status code
   - Verify standardized response format
   - Verify image is saved to storage
   - Verify thumbnail URL returned

2. **Test Invalid Image Formats**
   - Upload GIF, BMP, TIFF (should fail)
   - Upload PDF as image (should fail)
   - Verify 400 Bad Request with error message

3. **Test Image Size Validation**
   - Upload image exceeding max size (10MB)
   - Verify validation error
   - Verify helpful error message

4. **Test Image Dimensions**
   - Verify minimum dimensions (e.g., 300x200)
   - Verify maximum dimensions if applicable
   - Test aspect ratio validation if required

5. **Test Course Thumbnail Upload Endpoint**
   - `POST /api/v1/courses/{slug}/thumbnail/`
   - Verify course thumbnail is updated
   - Verify old thumbnail is deleted/cleaned up

6. **Test User Avatar Upload Endpoint**
   - `POST /api/v1/users/me/avatar/`
   - Verify user avatar is updated
   - Verify only authenticated users can upload

7. **Test Image Resizing**
   - Verify large images are resized to max dimensions
   - Verify aspect ratio is preserved
   - Verify thumbnail variants are created

8. **Test Storage Backend Integration**
   - Verify files are stored in MinIO/S3
   - Verify correct bucket/prefix structure
   - Verify public URL generation

9. **Test Security**
   - Verify CSRF protection
   - Verify file extension validation
   - Verify content type validation
   - Test for path traversal attacks

10. **Test Concurrent Uploads**
    - Multiple simultaneous uploads
    - Verify no race conditions
    - Verify unique filenames

**Files to Create:**
- `/backend/api/tests/test_image_upload.py` - 10+ comprehensive tests

---

### Phase 2: GREEN - Make Tests Pass
**Objective:** Implement minimal code to satisfy all test requirements

#### Implementation Steps:

1. **Install Dependencies**
   ```bash
   pip install django-storages==1.14.2 boto3==1.34.0
   ```

2. **Configure Django Storages**
   - `/backend/academy/settings/base.py`
   - Add S3/MinIO configuration
   - Set up buckets (media, static)

3. **Create Storage Backend**
   - `/backend/api/storage.py`
   - Custom storage class for images
   - Image validation utilities

4. **Create Upload Views**
   - `/backend/api/views.py`
   - `CourseThumbnailUploadView`
   - `UserAvatarUploadView`
   - Image validation and processing

5. **Add URL Routes**
   - `/backend/api/urls.py`
   - Course thumbnail endpoint
   - User avatar endpoint

6. **Create Image Processing Utilities**
   - `/backend/api/utils/images.py`
   - Resize function
   - Format validation
   - EXIF data handling

7. **Configure MinIO Buckets**
   - Create buckets via MinIO console or script
   - Set up CORS policies
   - Configure public access policies

**Key Implementation Details:**

```python
# api/storage.py
from django.core.files.storage import default_storage
from PIL import Image
import io

class ImageStorage:
    """Custom storage for images with validation and resizing"""
    
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
    MAX_SIZE_MB = 10
    MAX_DIMENSIONS = (1920, 1080)
    THUMBNAIL_DIMENSIONS = (400, 300)
    
    @classmethod
    def validate_image(cls, image):
        """Validate image format, size, dimensions"""
        pass
    
    @classmethod
    def process_image(cls, image):
        """Resize and optimize image"""
        pass
```

---

### Phase 3: REFACTOR - Optimize & Polish
**Objective:** Improve code quality, performance, and maintainability

#### Refactoring Tasks:

1. **Code Organization**
   - Extract image processing to service layer
   - Create constants for dimensions/sizes
   - Add type hints

2. **Performance Optimization**
   - Implement async image processing (Celery)
   - Add image caching headers
   - Optimize thumbnail generation

3. **Security Hardening**
   - Add file type verification (magic numbers)
   - Implement virus scanning (optional)
   - Add upload rate limiting

4. **Error Handling**
   - Handle storage backend failures
   - Handle network timeouts
   - Provide helpful error messages

5. **Documentation**
   - Update API_Usage_Guide.md with upload examples
   - Document image requirements
   - Add curl examples

---

## Success Criteria

✅ All 10+ tests pass  
✅ Images can be uploaded via API endpoints  
✅ Invalid formats are rejected with clear errors  
✅ Large images are automatically resized  
✅ Files are stored in MinIO/S3, not local filesystem  
✅ Public URLs are generated for frontend access  
✅ Security validations prevent malicious uploads  
✅ Documentation updated with upload examples  

---

## Implementation Checklist

### Phase 1: Tests
- [ ] Create `/backend/api/tests/test_image_upload.py`
- [ ] Write test for valid image upload (JPEG)
- [ ] Write test for valid image upload (PNG)
- [ ] Write test for invalid format rejection
- [ ] Write test for size validation
- [ ] Write test for dimension validation
- [ ] Write test for course thumbnail endpoint
- [ ] Write test for user avatar endpoint
- [ ] Write test for image resizing
- [ ] Write test for storage backend integration
- [ ] Write test for security (path traversal)
- [ ] Run tests to confirm they all FAIL (RED phase complete)

### Phase 2: Dependencies & Configuration
- [ ] Install django-storages and boto3
- [ ] Update `/backend/requirements/base.txt`
- [ ] Configure S3/MinIO settings in `base.py`
- [ ] Create storage backend configuration
- [ ] Set up MinIO buckets

### Phase 3: Implementation
- [ ] Create `/backend/api/storage.py` with image validation
- [ ] Create `/backend/api/utils/images.py` with processing functions
- [ ] Create `CourseThumbnailUploadView` in `views.py`
- [ ] Create `UserAvatarUploadView` in `views.py`
- [ ] Update `/backend/api/urls.py` with upload endpoints
- [ ] Run tests to confirm they all PASS (GREEN phase complete)

### Phase 4: Refactoring
- [ ] Extract image processing to service layer
- [ ] Add comprehensive error handling
- [ ] Add type hints throughout
- [ ] Optimize thumbnail generation
- [ ] Run full test suite to ensure no regressions
- [ ] Run lint/typecheck (RED phase complete)

### Phase 5: Documentation
- [ ] Update `/home/project/AI-Academy/API_Usage_Guide.md`
- [ ] Update `/home/project/AI-Academy/ACCOMPLISHMENTS.md`
- [ ] Update `/home/project/AI-Academy/TODO.md`
- [ ] Update `/home/project/AI-Academy/AGENTS.md`

---

## Files Modified/Created

### New Files:
1. `/backend/api/storage.py` - Custom storage backend
2. `/backend/api/utils/images.py` - Image processing utilities
3. `/backend/api/tests/test_image_upload.py` - Test suite

### Modified Files:
1. `/backend/requirements/base.txt` - Add django-storages, boto3
2. `/backend/academy/settings/base.py` - Storage configuration
3. `/backend/api/views.py` - Add upload views
4. `/backend/api/urls.py` - Add upload routes
5. `/home/project/AI-Academy/API_Usage_Guide.md` - Document uploads
6. `/home/project/AI-Academy/ACCOMPLISHMENTS.md` - Add milestone
7. `/home/project/AI-Academy/TODO.md` - Mark complete
8. `/home/project/AI-Academy/AGENTS.md` - Update current state

---

## Dependencies

**New Packages:**
- `django-storages==1.14.2` - Django storage backends
- `boto3==1.34.0` - AWS/MinIO SDK

**Existing:**
- `Pillow==11.0.0` - Image processing (already installed)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Storage backend failure | Low | High | Fallback to local filesystem |
| Image processing performance | Medium | Medium | Async processing with Celery |
| Malicious uploads | Low | Critical | Strict validation + content checking |
| Breaking existing image fields | Medium | High | Migration to update paths |

---

**Ready to proceed with Phase 1: RED - Writing Failing Tests**
