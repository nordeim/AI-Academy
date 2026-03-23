/**
 * Payments API Service
 *
 * API methods for Stripe payment processing endpoints
 * Requires authentication - JWT token must be set
 *
 * @module services/api/payments
 */

import { apiClient, extractApiError } from './client';
import type { ApiResponse } from './client';
import type {
  PaymentIntentCreateRequest,
  PaymentIntentCreateResponse,
  PaymentStatus,
} from '@/types/payment';

const PAYMENTS_ENDPOINT = '/payments/';

/**
 * Create Stripe PaymentIntent for enrollment
 * Requires authentication
 *
 * Creates a PaymentIntent on the server which returns a client_secret
 * for confirming payment with Stripe Elements on the frontend.
 *
 * @param data - Payment intent creation data (enrollment_id)
 * @returns Promise with PaymentIntent data including client_secret
 *
 * TDD Test Cases:
 * - Should create payment intent with valid enrollment
 * - Should return client_secret and payment_intent_id
 * - Should throw 401 when not authenticated
 * - Should throw 404 if enrollment not found
 * - Should throw 403 if enrollment belongs to another user
 * - Should throw 400 if enrollment already confirmed
 */
export async function createPaymentIntent(
  data: PaymentIntentCreateRequest
): Promise<ApiResponse<PaymentIntentCreateResponse>> {
  try {
    const response = await apiClient.post<
      ApiResponse<PaymentIntentCreateResponse>
    >(`${PAYMENTS_ENDPOINT}create-intent/`, data);

    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Get payment status for enrollment
 * Requires authentication
 *
 * Checks the current status of a payment intent associated with
 * an enrollment. Useful for polling payment status after confirmation.
 *
 * @param enrollmentId - Enrollment UUID
 * @returns Promise with payment status information
 *
 * TDD Test Cases:
 * - Should return payment status for valid enrollment
 * - Should include payment_intent_status if available
 * - Should throw 401 when not authenticated
 * - Should throw 404 if enrollment not found
 * - Should throw 403 if enrollment belongs to another user
 */
export async function getPaymentStatus(
  enrollmentId: string
): Promise<ApiResponse<PaymentStatus>> {
  try {
    const response = await apiClient.get<ApiResponse<PaymentStatus>>(
      `${PAYMENTS_ENDPOINT}${enrollmentId}/status/`
    );

    return response.data;
  } catch (error) {
    throw extractApiError(error);
  }
}

/**
 * Payment error codes and messages
 * Maps backend error codes to user-friendly messages
 */
export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  missing_enrollment_id: 'Enrollment ID is required',
  enrollment_not_found: 'Enrollment not found',
  permission_denied: 'You do not have permission to pay for this enrollment',
  already_confirmed: 'This enrollment is already confirmed',
  stripe_error: 'Payment processing error. Please try again',
  stripe_retrieval_error: 'Unable to retrieve payment status',
  card_declined: 'Your card was declined. Please try a different payment method',
  insufficient_funds:
    'Your card has insufficient funds. Please try a different card',
  expired_card: 'Your card has expired. Please check the expiry date',
  incorrect_cvc: 'Your card security code is incorrect',
  processing_error: 'An error occurred while processing your payment',
  network_error: 'Connection error. Please check your internet and try again',
};

/**
 * Get user-friendly error message from payment error
 *
 * @param errorCode - Error code from backend or Stripe
 * @returns User-friendly error message
 */
export function getPaymentErrorMessage(errorCode: string): string {
  return (
    PAYMENT_ERROR_MESSAGES[errorCode] ||
    'An unexpected error occurred. Please try again'
  );
}

/**
 * Validate enrollment data before payment
 *
 * @param enrollmentId - Enrollment UUID to validate
 * @returns Object with validation result and error message
 */
export function validateEnrollmentForPayment(
  enrollmentId: string | null
): { isValid: boolean; error?: string } {
  if (!enrollmentId) {
    return { isValid: false, error: 'Please select a cohort first' };
  }

  // UUID validation regex
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(enrollmentId)) {
    return { isValid: false, error: 'Invalid enrollment ID' };
  }

  return { isValid: true };
}

export default {
  createPaymentIntent,
  getPaymentStatus,
  getPaymentErrorMessage,
  validateEnrollmentForPayment,
};
