"""
Test settings for running Django tests
"""

from .development import *

# Indicate we're in test mode
TESTING = True

# Disable throttling for tests by default
# Tests that need throttling can use override_settings
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {}

# Override for views that explicitly use throttle_classes
# These need the rates defined even if DEFAULT_THROTTLE_CLASSES is empty
# because the view explicitly instantiates the throttle class
THROTTLE_RATES_FOR_EXPLICIT_VIEWS = {
    "anon": "1000/minute",  # High limit for user management tests
    "user": "10000/minute",
    "enrollment": "100/minute",
}

# Ensure explicit throttle classes have their rates available
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = THROTTLE_RATES_FOR_EXPLICIT_VIEWS

# Use local file storage for tests
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS": {
            "location": "/tmp/test-media",
            "base_url": "/media/",
        },
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Disable email sending in tests
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]
