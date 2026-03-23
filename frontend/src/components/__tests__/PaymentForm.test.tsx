/**
 * PaymentForm Tests
 *
 * TDD Test Suite for PaymentForm component
 * Tests cover rendering, validation, payment flow, and error handling
 *
 * @module components/__tests__/PaymentForm.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '../PaymentForm';
import {
  mockStripe,
  mockElements,
  mockCardElement,
  createMockConfirmSuccess,
  createMockConfirmError,
} from '@/test/mocks/stripe';

// Mock Stripe hooks
vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  CardElement: ({ onChange }: { onChange?: (event: any) => void }) => {
    // Simulate card element
    return (
      <div data-testid="card-element">
        <input
          data-testid="card-input"
          onChange={(e) => onChange?.({
            complete: e.target.value.length > 0,
            error: e.target.value === 'error' ? { message: 'Invalid card' } : undefined,
          })}
        />
      </div>
    );
  },
}));

// Mock currency formatter
vi.mock('@/hooks/usePayment', () => ({
  useCurrencyFormatter: () => ({
    formatAmount: (amount: number, currency: string) => `$${(amount).toFixed(2)} ${currency}`,
  }),
}));

describe('PaymentForm', () => {
  const defaultProps = {
    clientSecret: 'pi_test_secret_123',
    amount: 249900,
    currency: 'USD',
    courseTitle: 'AI Engineering Bootcamp',
    cohortName: 'March 2025 Cohort',
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockElements.getElement.mockReturnValue(mockCardElement);
  });

  describe('Rendering', () => {
    it('should render CardElement and order summary', () => {
      render(<PaymentForm {...defaultProps} />);

      // Check order summary
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
      expect(screen.getByText('March 2025 Cohort')).toBeInTheDocument();

      // Check payment form
      expect(screen.getByText('Payment Information')).toBeInTheDocument();
      expect(screen.getByTestId('card-element')).toBeInTheDocument();

      // Check submit button
      expect(screen.getByRole('button', { name: /pay \$2499.00/i })).toBeInTheDocument();
    });

    it('should format currency correctly', () => {
      render(<PaymentForm {...defaultProps} amount={100000} currency="EUR" />);

      expect(screen.getByText('$1000.00 EUR')).toBeInTheDocument();
    });
  });

  describe('Card Validation', () => {
    it('should show card validation error', async () => {
      const user = userEvent.setup();
      render(<PaymentForm {...defaultProps} />);

      const cardInput = screen.getByTestId('card-input');
      await user.type(cardInput, 'error');

      expect(screen.getByText('Invalid card')).toBeInTheDocument();
    });
  });

  describe('Payment Success', () => {
    it('should process successful payment', async () => {
      const user = userEvent.setup();
      mockStripe.confirmCardPayment.mockResolvedValue(createMockConfirmSuccess());

      render(<PaymentForm {...defaultProps} />);

      // Fill card input
      const cardInput = screen.getByTestId('card-input');
      await user.type(cardInput, '4242424242424242');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
          defaultProps.clientSecret,
          expect.objectContaining({
            payment_method: expect.objectContaining({
              card: mockCardElement,
            }),
          })
        );
      });

      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  describe('Payment Failure', () => {
    it('should handle declined cards', async () => {
      const user = userEvent.setup();
      mockStripe.confirmCardPayment.mockResolvedValue(createMockConfirmError());

      render(<PaymentForm {...defaultProps} />);

      // Fill card input
      const cardInput = screen.getByTestId('card-input');
      await user.type(cardInput, '4242424242424242');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/card was declined/i)).toBeInTheDocument();
      });

      expect(defaultProps.onError).toHaveBeenCalledWith(
        expect.stringContaining('declined')
      );
    });

    it('should handle insufficient funds error', async () => {
      const user = userEvent.setup();
      mockStripe.confirmCardPayment.mockResolvedValue(
        createMockConfirmError('insufficient_funds')
      );

      render(<PaymentForm {...defaultProps} />);

      const cardInput = screen.getByTestId('card-input');
      await user.type(cardInput, '4242424242424242');

      const submitButton = screen.getByRole('button', { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during processing', async () => {
      const user = userEvent.setup();
      
      // Delay resolution to show loading state
      mockStripe.confirmCardPayment.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockConfirmSuccess()), 100))
      );

      render(<PaymentForm {...defaultProps} />);

      const cardInput = screen.getByTestId('card-input');
      await user.type(cardInput, '4242424242424242');

      const submitButton = screen.getByRole('button', { name: /pay/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Order Summary', () => {
    it('should display course and cohort details', () => {
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByText('Course:')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.courseTitle)).toBeInTheDocument();

      expect(screen.getByText('Cohort:')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.cohortName)).toBeInTheDocument();

      expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('should format large amounts correctly', () => {
      render(<PaymentForm {...defaultProps} amount={999900} />);

      expect(screen.getByText('$9999.00 USD')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable form when disabled prop is true', () => {
      render(<PaymentForm {...defaultProps} disabled={true} />);

      expect(screen.getByRole('button', { name: /pay/i })).toBeDisabled();
    });

    it('should disable form when stripe is not loaded', () => {
      // Override mock to return null
      vi.mocked(mockStripe).confirmCardPayment = vi.fn();
      
      render(<PaymentForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /pay/i })).toBeDisabled();
    });
  });
});
