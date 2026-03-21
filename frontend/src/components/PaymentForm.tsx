/**
 * PaymentForm Component
 *
 * Stripe payment form with CardElement integration.
 * Handles secure card input, payment confirmation, and error display.
 *
 * Features:
 * - Stripe CardElement for PCI-compliant card input
 * - Order summary display
 * - Loading states
 * - Error handling
 * - Responsive design
 *
 * @module components/PaymentForm
 */

import { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrencyFormatter } from '@/hooks/usePayment';

interface PaymentFormProps {
  /** Stripe PaymentIntent client_secret */
  clientSecret: string;
  /** Amount in cents (e.g., 249900 = $2,499.00) */
  amount: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Course title for summary */
  courseTitle: string;
  /** Cohort name for summary */
  cohortName: string;
  /** Callback on successful payment */
  onSuccess: () => void;
  /** Callback on payment error */
  onError: (error: string) => void;
  /** Disable form submission */
  disabled?: boolean;
}

/**
 * PaymentForm - Secure payment form with Stripe Elements
 *
 * TDD Test Cases:
 * - Should render CardElement and order summary
 * - Should handle card validation errors
 * - Should process successful payment
 * - Should handle declined cards
 * - Should show loading state during processing
 * - Should format currency correctly
 */
export function PaymentForm({
  clientSecret,
  amount,
  currency,
  courseTitle,
  cohortName,
  onSuccess,
  onError,
  disabled = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { formatAmount } = useCurrencyFormatter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const formattedAmount = formatAmount(amount / 100, currency);

  /**
   * Handle card element changes
   * Update card error state based on validation
   */
  const handleCardChange = (event: { error?: { message: string } }) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  /**
   * Handle form submission
   * Process payment with Stripe
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure Stripe is loaded
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    // Get CardElement
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card input not found. Please refresh the page.');
      return;
    }

    // Clear previous errors
    setError(null);
    setIsLoading(true);

    try {
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        // Handle specific Stripe errors
        const errorMessage = getStripeErrorMessage(confirmError);
        setError(errorMessage);
        onError(errorMessage);
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment successful
        onSuccess();
      } else {
        // Payment requires additional action
        setError('Payment requires additional verification. Please try again.');
        onError('Payment requires additional verification');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Convert Stripe error to user-friendly message
   */
  const getStripeErrorMessage = (
    error: { type: string; code?: string; message?: string }
  ): string => {
    // Map common Stripe error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      card_declined:
        'Your card was declined. Please try a different payment method.',
      insufficient_funds:
        'Your card has insufficient funds. Please try a different card.',
      expired_card: 'Your card has expired. Please check the expiry date.',
      incorrect_cvc: 'Your card security code is incorrect.',
      processing_error:
        'An error occurred while processing your payment. Please try again.',
      incorrect_number: 'Your card number is incorrect.',
      invalid_number: 'Your card number is invalid.',
      invalid_expiry_month: 'Your card expiry month is invalid.',
      invalid_expiry_year: 'Your card expiry year is invalid.',
      invalid_cvc: 'Your card security code is invalid.',
      payment_intent_unexpected_state:
        'This payment has already been processed.',
    };

    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    if (error.message) {
      return error.message;
    }

    return 'Payment failed. Please try again.';
  };

  /**
   * CardElement styling options
   */
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const isSubmitDisabled =
    !stripe || !elements || isLoading || disabled || !!cardError;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Order Summary */}
      <Card className="border-t-4 border-t-primary-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Course:</span>
            <span className="font-medium text-right">{courseTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cohort:</span>
            <span className="font-medium">{cohortName}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formattedAmount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Details</label>
              <div
                className={`p-3 border rounded-md bg-white transition-colors ${
                  cardError
                    ? 'border-red-500 focus-within:border-red-500'
                    : 'border-gray-300 focus-within:border-primary-500'
                }`}
              >
                <CardElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                />
              </div>
              {cardError && (
                <p className="text-sm text-red-500">{cardError}</p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formattedAmount}`
              )}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              <span className="inline-flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Secure payment powered by Stripe
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentForm;
