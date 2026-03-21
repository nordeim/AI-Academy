/**
 * Payment Hooks
 *
 * React Query hooks for payment operations using Stripe
 * Includes payment intent creation and confirmation flows
 *
 * @module hooks/usePayment
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { createPaymentIntent, getPaymentStatus } from '@/services/api/payments';
import {
  PaymentIntentCreateRequest,
  PaymentIntentCreateResponse,
  PaymentStatus,
  PaymentFormState,
  PaymentError,
} from '@/types/payment';
import { ApiError } from '@/services/api/client';

// Query keys for payment operations
export const paymentKeys = {
  all: ['payments'] as const,
  status: (enrollmentId: string) =>
    [...paymentKeys.all, 'status', enrollmentId] as const,
};

/**
 * Hook for creating payment intent
 *
 * TDD Test Cases:
 * - Should create payment intent successfully
 * - Should handle creation errors
 * - Should cache result
 * - Should return client_secret
 */
export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentIntentCreateRequest) => {
      const response = await createPaymentIntent(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate payment status query for this enrollment
      if (data?.payment_intent_id) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.status(data.payment_intent_id),
        });
      }
    },
  });
}

/**
 * Hook for fetching payment status
 *
 * TDD Test Cases:
 * - Should fetch payment status
 * - Should return cached data
 * - Should refetch on window focus
 * - Should handle 404 errors
 */
export function usePaymentStatus(enrollmentId: string | null) {
  return useQuery({
    queryKey: paymentKeys.status(enrollmentId || ''),
    queryFn: async () => {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }
      const response = await getPaymentStatus(enrollmentId);
      return response.data;
    },
    enabled: !!enrollmentId,
    refetchInterval: 5000, // Poll every 5 seconds for status updates
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Hook for confirming payment with Stripe
 *
 * Uses Stripe Elements to confirm card payment
 * Handles success and error states
 *
 * TDD Test Cases:
 * - Should confirm payment successfully
 * - Should handle card validation errors
 * - Should handle network errors
 * - Should update form state
 */
export function useConfirmPayment() {
  const stripe = useStripe();
  const elements = useElements();
  const [formState, setFormState] = useState<PaymentFormState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const confirmPayment = async (clientSecret: string) => {
    if (!stripe || !elements) {
      setFormState({
        isLoading: false,
        error: 'Stripe has not been initialized',
        success: false,
      });
      return { success: false, error: 'Stripe not initialized' };
    }

    setFormState({
      isLoading: true,
      error: null,
      success: false,
    });

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setFormState({
          isLoading: false,
          error: 'Card element not found',
          success: false,
        });
        return { success: false, error: 'Card element not found' };
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Can add name/email here if needed
            },
          },
        });

      if (confirmError) {
        const errorMessage =
          confirmError.message || 'Payment failed. Please try again';
        setFormState({
          isLoading: false,
          error: errorMessage,
          success: false,
        });
        return { success: false, error: errorMessage };
      }

      if (paymentIntent?.status === 'succeeded') {
        setFormState({
          isLoading: false,
          error: null,
          success: true,
        });
        return { success: true, paymentIntent };
      }

      // Payment requires additional action
      setFormState({
        isLoading: false,
        error: null,
        success: false,
      });
      return {
        success: false,
        error: 'Payment requires additional authentication',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment failed';
      setFormState({
        isLoading: false,
        error: errorMessage,
        success: false,
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    confirmPayment,
    formState,
    setFormState,
  };
}

/**
 * Comprehensive checkout hook
 *
 * Orchestrates the entire checkout flow:
 * 1. Create enrollment (assumes already done)
 * 2. Create payment intent
 * 3. Confirm payment with Stripe
 * 4. Handle success/failure
 *
 * TDD Test Cases:
 * - Should complete full checkout flow
 * - Should handle payment intent creation failure
 * - Should handle payment confirmation failure
 * - Should reset state on error
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const { confirmPayment, formState, setFormState } = useConfirmPayment();

  const checkout = async (enrollmentId: string) => {
    setFormState({
      isLoading: true,
      error: null,
      success: false,
    });

    try {
      // Step 1: Create payment intent
      const paymentIntentData = await createPaymentIntentMutation.mutateAsync({
        enrollment_id: enrollmentId,
      });

      if (!paymentIntentData?.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe
      const result = await confirmPayment(paymentIntentData.client_secret);

      if (result.success) {
        // Invalidate enrollment data
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        return { success: true, paymentIntent: result.paymentIntent };
      }

      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Checkout failed';

      setFormState({
        isLoading: false,
        error: errorMessage,
        success: false,
      });

      return { success: false, error: errorMessage };
    }
  };

  return {
    checkout,
    formState,
    setFormState,
    isCreatingPaymentIntent: createPaymentIntentMutation.isPending,
  };
}

/**
 * Hook for formatting currency amounts
 */
export function useCurrencyFormatter() {
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return { formatAmount };
}

/**
 * Hook for payment error handling
 */
export function usePaymentErrorHandler() {
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      // Check for specific error codes
      const errorCode = Object.keys(error.errors)[0];
      if (errorCode) {
        switch (errorCode) {
          case 'card_declined':
            return 'Your card was declined. Please try a different payment method.';
          case 'insufficient_funds':
            return 'Your card has insufficient funds. Please try a different card.';
          case 'expired_card':
            return 'Your card has expired. Please check the expiry date.';
          case 'incorrect_cvc':
            return 'Your card security code is incorrect.';
          case 'processing_error':
            return 'An error occurred while processing your payment. Please try again.';
          case 'enrollment_not_found':
            return 'Enrollment not found. Please try again.';
          case 'already_confirmed':
            return 'This enrollment is already confirmed.';
          case 'permission_denied':
            return 'You do not have permission to pay for this enrollment.';
          default:
            return error.message;
        }
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  };

  return { getErrorMessage };
}
