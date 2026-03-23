/**
 * Payment Types
 *
 * TypeScript type definitions for Stripe payment processing.
 * These types mirror the backend API responses and Stripe SDK types.
 *
 * @module types/payment
 */

import type { ApiResponse } from './api';

/**
 * Stripe Payment Intent status
 */
export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'succeeded'
  | 'canceled'
  | 'requires_action'
  | 'processing';

/**
 * Payment Intent data from Stripe
 */
export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  created_at?: string;
}

/**
 * Request body for creating payment intent
 */
export interface PaymentIntentCreateRequest {
  enrollment_id: string;
}

/**
 * Response data from payment intent creation
 */
export interface PaymentIntentCreateResponse {
  client_secret: string;
  payment_intent_id: string;
  status: PaymentIntentStatus;
}

/**
 * Payment status information
 */
export interface PaymentStatus {
  enrollment_id: string;
  status: string;
  payment_intent_status: PaymentIntentStatus | null;
  amount_received?: number;
}

/**
 * Payment intent creation API response
 */
export type PaymentIntentCreateApiResponse = ApiResponse<PaymentIntentCreateResponse>;

/**
 * Payment status API response
 */
export type PaymentStatusApiResponse = ApiResponse<PaymentStatus>;

/**
 * Checkout session data
 */
export interface CheckoutSession {
  enrollmentId: string;
  courseId: string;
  cohortId: string;
  amount: number;
  currency: string;
  clientSecret: string;
}

/**
 * Payment form state
 */
export interface PaymentFormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Payment error types
 */
export type PaymentErrorCode =
  | 'card_declined'
  | 'insufficient_funds'
  | 'expired_card'
  | 'incorrect_cvc'
  | 'processing_error'
  | 'network_error'
  | 'unknown_error';

/**
 * Payment error with code
 */
export interface PaymentError {
  message: string;
  code: PaymentErrorCode;
  decline_code?: string;
}

/**
 * Enrollment step in checkout flow
 */
export type EnrollmentStep = 1 | 2 | 3;

/**
 * Enrollment state for checkout flow
 */
export interface EnrollmentState {
  step: EnrollmentStep;
  selectedCohort: string | null;
  enrollmentId: string | null;
  clientSecret: string | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';
  error: string | null;
}
