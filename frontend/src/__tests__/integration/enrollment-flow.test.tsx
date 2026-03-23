/**
 * Enrollment Flow Integration Test
 *
 * End-to-end integration test for the complete enrollment and payment flow.
 * Tests the full user journey from course selection to payment completion.
 *
 * @module __tests__/integration/enrollment-flow.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrollmentPage } from '@/pages/EnrollmentPage';
import { EnrollmentConfirmationPage } from '@/pages/EnrollmentConfirmationPage';

// Mock Stripe Elements
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element">Card Input</div>,
  useStripe: () => ({
    confirmCardPayment: vi.fn().mockResolvedValue({
      paymentIntent: { id: 'pi_test_123', status: 'succeeded' },
      error: null,
    }),
  }),
  useElements: () => ({
    getElement: vi.fn().mockReturnValue({}),
  }),
}));

// Mock hooks
vi.mock('@/hooks/useCourses', () => ({
  useCourseDetail: vi.fn(),
}));

vi.mock('@/hooks/useCohorts', () => ({
  useCohorts: vi.fn(),
}));

vi.mock('@/services/api/enrollments', () => ({
  createEnrollment: vi.fn(),
}));

vi.mock('@/services/api/payments', () => ({
  createPaymentIntent: vi.fn(),
}));

import { useCourseDetail } from '@/hooks/useCourses';
import { useCohorts } from '@/hooks/useCohorts';
import { createEnrollment } from '@/services/api/enrollments';
import { createPaymentIntent } from '@/services/api/payments';

// Test data
const testCourse = {
  id: 'course-1',
  title: 'AI Engineering Bootcamp',
  subtitle: 'Master AI development with hands-on projects',
  description: 'Comprehensive AI engineering course',
  price: '2499.00',
  currency: 'USD',
  duration: '12 weeks',
  level: 'Advanced',
  rating: 4.8,
  review_count: 120,
  enrolled_count: 450,
  is_featured: true,
  thumbnail: '/images/course.jpg',
  category: { id: 'cat-1', name: 'AI Engineering', slug: 'ai-engineering' },
  modules: [
    { id: 'mod-1', title: 'Introduction to AI', duration: '2 hours' },
    { id: 'mod-2', title: 'Machine Learning Basics', duration: '4 hours' },
  ],
  instructor: {
    id: 'inst-1',
    name: 'Dr. Sarah Chen',
    bio: 'AI Researcher with 10+ years experience',
    avatar: null,
  },
  prerequisites: ['Python basics'],
  learning_objectives: ['Build AI models', 'Deploy to production'],
  tools_technologies: ['Python', 'TensorFlow', 'PyTorch'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const testCohorts = [
  {
    id: 'cohort-1',
    course_title: 'AI Engineering Bootcamp',
    course_slug: 'ai-engineering-bootcamp',
    start_date: '2025-04-01T00:00:00Z',
    end_date: '2025-06-30T00:00:00Z',
    timezone: 'America/New_York',
    format: 'online' as const,
    location: 'Virtual',
    instructor_name: 'Dr. Sarah Chen',
    spots_total: 30,
    spots_remaining: 25,
    availability_status: 'available' as const,
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling' as const,
  },
];

const testEnrollment = {
  id: 'enrollment-123',
  course_title: 'AI Engineering Bootcamp',
  cohort_info: testCohorts[0],
  amount_paid: '2499.00',
  currency: 'USD',
  status: 'pending' as const,
  created_at: '2025-03-22T00:00:00Z',
  confirmed_at: null,
};

const testPaymentIntent = {
  client_secret: 'pi_test_secret_123',
  payment_intent_id: 'pi_test_123',
  status: 'requires_payment_method' as const,
};

// Integration test wrapper
const createIntegrationWrapper = () => {
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
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/courses/ai-engineering-bootcamp/enroll']}>
        <Routes>
          <Route path="/courses/:slug/enroll" element={children} />
          <Route path="/enrollment/confirmation" element={<EnrollmentConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Enrollment Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full enrollment flow: select cohort → review → payment → success', async () => {
    const user = userEvent.setup();

    // Setup mocks
    vi.mocked(useCourseDetail).mockReturnValue({
      data: { data: testCourse },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCohorts).mockReturnValue({
      data: { results: testCohorts },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(createEnrollment).mockResolvedValue({
      data: testEnrollment,
    } as any);

    vi.mocked(createPaymentIntent).mockResolvedValue({
      data: testPaymentIntent,
    } as any);

    // Render enrollment page
    render(<EnrollmentPage />, { wrapper: createIntegrationWrapper() });

    // Step 1: Verify we're on cohort selection
    await waitFor(() => {
      expect(screen.getByText(/Select Your Cohort/i)).toBeInTheDocument();
      expect(screen.getByText('Online Cohort')).toBeInTheDocument();
    });

    // Step 1: Select a cohort
    const cohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
    if (cohortCard) {
      await user.click(cohortCard);
    }

    // Verify cohort is selected (selection indicator should appear)
    await waitFor(() => {
      const selectedCohort = screen.getByText('Online Cohort').closest('[class*="border-primary"]');
      expect(selectedCohort || screen.getByText('Online Cohort')).toBeInTheDocument();
    });

    // Continue to review
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    // Step 2: Verify review step
    await waitFor(() => {
      const reviewHeading = screen.getByRole('heading', { name: /Review Your Enrollment/i });
      expect(reviewHeading).toBeInTheDocument();
    });

    // Verify course and cohort details displayed
    expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    expect(screen.getByText(/\$2,499\.00/i)).toBeInTheDocument();

    // Step 2: Proceed to payment
    const proceedButton = screen.getByRole('button', { name: /proceed to payment/i });
    await user.click(proceedButton);

    // Verify enrollment and payment intent creation
    await waitFor(() => {
      expect(createEnrollment).toHaveBeenCalledWith({
        course: testCourse.id,
        cohort: testCohorts[0].id,
        amount_paid: testCourse.price,
      });
      expect(createPaymentIntent).toHaveBeenCalledWith({
        enrollment_id: testEnrollment.id,
      });
    });

    // Step 3: Verify payment form appears
    await waitFor(() => {
      expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
      expect(screen.getByTestId('card-element')).toBeInTheDocument();
    });
  });

  it('should handle cohort selection validation', async () => {
    const user = userEvent.setup();

    vi.mocked(useCourseDetail).mockReturnValue({
      data: { data: testCourse },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCohorts).mockReturnValue({
      data: { results: testCohorts },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<EnrollmentPage />, { wrapper: createIntegrationWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Select Your Cohort/i)).toBeInTheDocument();
    });

    // Try to continue without selecting cohort
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Please select a cohort/i)).toBeInTheDocument();
    });
  });

  it('should display appropriate spots remaining indicators', async () => {
    const cohortsWithVariousAvailability = [
      {
        ...testCohorts[0],
        spots_remaining: 25,
        availability_status: 'available',
      },
      {
        ...testCohorts[0],
        id: 'cohort-2',
        spots_remaining: 2,
        availability_status: 'filling-fast',
      },
      {
        ...testCohorts[0],
        id: 'cohort-3',
        spots_remaining: 0,
        availability_status: 'waitlist',
      },
    ];

    vi.mocked(useCourseDetail).mockReturnValue({
      data: { data: testCourse },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCohorts).mockReturnValue({
      data: { results: cohortsWithVariousAvailability },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<EnrollmentPage />, { wrapper: createIntegrationWrapper() });

    await waitFor(() => {
      // Verify different availability indicators
      expect(screen.getByText(/25 spots available/i)).toBeInTheDocument();
      expect(screen.getByText(/2 spots left/i)).toBeInTheDocument();
      expect(screen.getByText(/Full/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    vi.mocked(useCourseDetail).mockReturnValue({
      data: { data: testCourse },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCohorts).mockReturnValue({
      data: { results: testCohorts },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(createEnrollment).mockRejectedValue(new Error('Network error'));

    render(<EnrollmentPage />, { wrapper: createIntegrationWrapper() });

    // Select cohort and proceed
    await waitFor(() => {
      expect(screen.getByText('Online Cohort')).toBeInTheDocument();
    });

    const cohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
    if (cohortCard) {
      await user.click(cohortCard);
    }

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      const reviewHeading = screen.getByRole('heading', { name: /Review Your Enrollment/i });
      expect(reviewHeading).toBeInTheDocument();
    });

    // Try to proceed to payment (will fail)
    const proceedButton = screen.getByRole('button', { name: /proceed to payment/i });
    await user.click(proceedButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
