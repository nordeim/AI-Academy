"""
Custom Payment Exceptions
"""

from rest_framework import status


class PaymentError(Exception):
    """
    Custom exception for payment-related errors.

    Attributes:
        message: Human-readable error message
        code: Machine-readable error code
        status_code: HTTP status code
    """

    def __init__(
        self, message, code="payment_error", status_code=status.HTTP_400_BAD_REQUEST
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)

    def to_dict(self):
        return {
            "message": self.message,
            "code": self.code,
        }
