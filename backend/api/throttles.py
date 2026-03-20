from rest_framework.throttling import UserRateThrottle


class EnrollmentThrottle(UserRateThrottle):
    """
    Custom throttle for enrollment operations.
    Prevents abuse of enrollment endpoints.
    """

    scope = "enrollment"
    rate = "10/minute"
