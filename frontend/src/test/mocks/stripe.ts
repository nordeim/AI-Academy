/**
 * Stripe Mock
 *
 * Mock implementation of Stripe SDK for testing
 * Includes mocks for Stripe instance, Elements, and CardElement
 */

import { vi } from 'vitest';

// Mock Stripe instance
export const mockStripe = {
  confirmCardPayment: vi.fn(),
  createPaymentMethod: vi.fn(),
  elements: vi.fn(),
};

// Mock CardElement
export const mockCardElement = {
  mount: vi.fn(),
  unmount: vi.fn(),
  on: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
};

// Mock Elements instance
export const mockElements = {
  getElement: vi.fn().mockReturnValue(mockCardElement),
  create: vi.fn().mockReturnValue(mockCardElement),
};

// Mock loadStripe
export const mockLoadStripe = vi.fn().mockResolvedValue(mockStripe);

// Mock useStripe hook
export const mockUseStripe = vi.fn().mockReturnValue(mockStripe);

// Mock useElements hook
export const mockUseElements = vi.fn().mockReturnValue(mockElements);

// Mock CardElement component
export const MockCardElement = vi.fn(({ onChange }: { onChange?: (event: any) => void }) => {
  // Simulate card element with test data
  return {
    type: 'card',
    props: {
      onChange,
    },
  };
});

// Export mock utilities
export const createMockPaymentIntent = (overrides = {}) => ({
  id: 'pi_test_123',
  client_secret: 'pi_test_123_secret_456',
  status: 'requires_payment_method',
  amount: 249900,
  currency: 'usd',
  ...overrides,
});

export const createMockConfirmSuccess = () => ({
  paymentIntent: {
    id: 'pi_test_123',
    status: 'succeeded',
  },
  error: null,
});

export const createMockConfirmError = (code = 'card_declined') => ({
  paymentIntent: null,
  error: {
    type: 'card_error',
    code,
    message: 'Your card was declined.',
    decline_code: 'generic_decline',
  },
});
