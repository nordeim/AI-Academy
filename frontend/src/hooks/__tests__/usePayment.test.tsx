/**
 * usePayment Hook Tests
 *
 * TDD Test Suite for payment-related hooks
 * Tests cover payment intent creation, confirmation, and error handling
 *
 * @module hooks/__tests__/usePayment.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreatePaymentIntent, useCurrencyFormatter, usePaymentErrorHandler } from '../usePayment';

// Mock payment API
vi.mock('@/services/api/payments', () => ({
  createPaymentIntent: vi.fn(),
  getPaymentStatus: vi.fn(),
}));

import { createPaymentIntent } from '@/services/api/payments';

// Mock Stripe hooks
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({
    confirmCardPayment: vi.fn(),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
  CardElement: vi.fn(),
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePayment Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCreatePaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockResponse = {
        data: {
          client_secret: 'pi_test_secret_123',
          payment_intent_id: 'pi_test_123',
          status: 'requires_payment_method',
        },
      };

      vi.mocked(createPaymentIntent).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useCreatePaymentIntent(), {
        wrapper: createWrapper(),
      });

      // Trigger mutation
      const mutationResult = await result.current.mutateAsync({
        enrollment_id: 'enrollment-1',
      });

      await waitFor(() => {
        expect(createPaymentIntent).toHaveBeenCalledWith({
          enrollment_id: 'enrollment-1',
        });
        expect(mutationResult).toEqual(mockResponse.data);
      });
    });

    it('should handle creation error', async () => {
      vi.mocked(createPaymentIntent).mockRejectedValue(new Error('Enrollment not found'));

      const { result } = renderHook(() => useCreatePaymentIntent(), {
        wrapper: createWrapper(),
      });

      // Trigger mutation and expect error
      await expect(
        result.current.mutateAsync({ enrollment_id: 'invalid-id' })
      ).rejects.toThrow('Enrollment not found');
    });
  });

  describe('useCurrencyFormatter', () => {
    it('should format USD amounts correctly', () => {
      const { result } = renderHook(() => useCurrencyFormatter());

      const formatted = result.current.formatAmount(2499.0, 'USD');

      expect(formatted).toContain('2,499');
      expect(formatted).toContain('$');
    });

    it('should format EUR amounts correctly', () => {
      const { result } = renderHook(() => useCurrencyFormatter());

      const formatted = result.current.formatAmount(1000.0, 'EUR');

      expect(formatted).toContain('1,000');
      expect(formatted).toContain('€');
    });

    it('should handle zero amounts', () => {
      const { result } = renderHook(() => useCurrencyFormatter());

      const formatted = result.current.formatAmount(0, 'USD');

      expect(formatted).toContain('0.00');
    });
  });

  describe('usePaymentErrorHandler', () => {
    it('should return card declined message', () => {
      const { result } = renderHook(() => usePaymentErrorHandler());

      const apiError = {
        message: 'Payment failed',
        errors: { card_declined: ['Your card was declined'] },
      };

      const message = result.current.getErrorMessage(apiError);

      expect(message).toContain('declined');
    });

    it('should return insufficient funds message', () => {
      const { result } = renderHook(() => usePaymentErrorHandler());

      const apiError = {
        message: 'Payment failed',
        errors: { insufficient_funds: ['Insufficient funds'] },
      };

      const message = result.current.getErrorMessage(apiError);

      expect(message).toContain('insufficient funds');
    });

    it('should handle generic errors', () => {
      const { result } = renderHook(() => usePaymentErrorHandler());

      const message = result.current.getErrorMessage(new Error('Network error'));

      expect(message).toBe('Network error');
    });

    it('should handle unknown errors', () => {
      const { result } = renderHook(() => usePaymentErrorHandler());

      const message = result.current.getErrorMessage('Unknown');

      expect(message).toContain('unexpected error');
    });
  });
});
