"""
Cache Utility Functions

Provides centralized cache key generation and invalidation helpers.
"""

from django.core.cache import cache
from django.conf import settings


def get_course_list_cache_key(request):
    """Generate cache key for course list based on query params"""
    params = request.GET.urlencode()
    return f"course:list:{params}" if params else "course:list"


def get_course_detail_cache_key(slug):
    """Generate cache key for course detail"""
    return f"course:detail:{slug}"


def get_category_list_cache_key():
    """Generate cache key for category list"""
    return "category:list"


def get_cohorts_cache_key(course_slug):
    """Generate cache key for course cohorts"""
    return f"course:{course_slug}:cohorts"


def invalidate_course_cache():
    """Invalidate all course list cache entries"""
    cache.delete("course:list")


def invalidate_course_detail_cache(slug):
    """Invalidate cache for specific course detail"""
    key = get_course_detail_cache_key(slug)
    cache.delete(key)
    return key


def invalidate_cohorts_cache(course_slug):
    """Invalidate cache for course cohorts"""
    key = get_cohorts_cache_key(course_slug)
    cache.delete(key)
    return key


def get_cache_ttl(key_name):
    """Get TTL for cache key from settings"""
    return getattr(settings, "CACHE_TTL", {}).get(key_name, 300)
