"""
ASGI config for Academy project.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academy.settings.production')

application = get_asgi_application()
