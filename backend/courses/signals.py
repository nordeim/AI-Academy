"""
Cache Invalidation Signals

Automatically invalidates cache when Course model changes.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from courses.models import Course
from api.utils.cache import (
    invalidate_course_cache,
    invalidate_course_detail_cache,
    invalidate_cohorts_cache,
)


@receiver(post_save, sender=Course)
def invalidate_cache_on_course_save(sender, instance, **kwargs):
    """Invalidate course list and detail cache when course is saved"""
    invalidate_course_cache()
    invalidate_course_detail_cache(instance.slug)


@receiver(post_delete, sender=Course)
def invalidate_cache_on_course_delete(sender, instance, **kwargs):
    """Invalidate course list and detail cache when course is deleted"""
    invalidate_course_cache()
    invalidate_course_detail_cache(instance.slug)
    invalidate_cohorts_cache(instance.slug)
