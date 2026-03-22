/**
 * EnrollmentPage Tests
 *
 * TDD Test Suite for EnrollmentPage component
 * Tests cover multi-step wizard, cohort selection, payment flow, and error handling
 *
 * @module pages/__tests__/EnrollmentPage.test
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrollmentPage } from '../EnrollmentPage';

// Mock Stripe Elements completely
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element">Card Input</div>,
  useStripe: () => ({ confirmCardPayment: vi.fn() }),
  useElements: () => ({ getElement: vi.fn() }),
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

// Mock data
const mockCourse = {
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

const mockCohorts = [
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
  {
    id: 'cohort-2',
    course_title: 'AI Engineering Bootcamp',
    course_slug: 'ai-engineering-bootcamp',
    start_date: '2025-05-01T00:00:00Z',
    end_date: '2025-07-31T00:00:00Z',
    timezone: 'America/New_York',
    format: 'in_person' as const,
    location: 'New York, NY',
    instructor_name: 'Prof. James Wilson',
    spots_total: 20,
    spots_remaining: 2,
    availability_status: 'filling-fast' as const,
    early_bird_price: null,
    early_bird_deadline: null,
    status: 'enrolling' as const,
  },
];

const mockEnrollment = {
  id: 'enrollment-1',
  course_title: 'AI Engineering Bootcamp',
  cohort_info: mockCohorts[0],
  amount_paid: '2499.00',
  currency: 'USD',
  status: 'pending' as const,
  created_at: '2025-03-22T00:00:00Z',
  confirmed_at: null,
};

const mockPaymentIntent = {
  client_secret: 'pi_test_secret_123',
  payment_intent_id: 'pi_test_123',
  status: 'requires_payment_method' as const,
};

// Test wrapper
const createWrapper = (initialRoute = '/courses/ai-engineering-bootcamp/enroll') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/courses/:slug/enroll" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('EnrollmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-step Wizard', () => {
    it('should render 3-step wizard with progress indicators', async () => {
      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show step indicators
        expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
      });

      // Should show step labels
      expect(screen.getByText(/Select Cohort/i)).toBeInTheDocument();
      expect(screen.getByText(/Review/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment/i)).toBeInTheDocument();
    });

    it('should start on step 1 (cohort selection)', async () => {
      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show cohort selection UI
        expect(screen.getByText(/Select Your Cohort/i)).toBeInTheDocument();
        expect(screen.getByText(/Online Cohort/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cohort Selection Step', () => {
    it('should display available cohorts', async () => {
      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
        expect(screen.getByText('In-Person Cohort')).toBeInTheDocument();
      });

      // Should show spots remaining
      expect(screen.getByText(/25 spots available/i)).toBeInTheDocument();
      expect(screen.getByText(/2 spots left/i)).toBeInTheDocument();
    });

    it('should select cohort and proceed to review step', async () => {
      const user = userEvent.setup();

      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      // Select first cohort by clicking on the cohort card
      const onlineCohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      if (onlineCohortCard) {
        await user.click(onlineCohortCard);
      }

      // Click continue button
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      // Should advance to review step - look for specific CardTitle element
      await waitFor(() => {
        const reviewTitle = screen.getByRole('heading', { name: /Review Your Enrollment/i });
        expect(reviewTitle).toBeInTheDocument();
      });
    });
  });

  describe('Review Step', () => {
    it('should display course and cohort details', async () => {
      const user = userEvent.setup();

      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(createEnrollment).mockResolvedValue({
        data: mockEnrollment,
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      // Select cohort
      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      const onlineCohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      if (onlineCohortCard) {
        await user.click(onlineCohortCard);
      }

      // Continue to review
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      // Should show review details
      await waitFor(() => {
        const reviewTitle = screen.getByRole('heading', { name: /Review Your Enrollment/i });
        expect(reviewTitle).toBeInTheDocument();
        expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
        expect(screen.getByText(/\$2,499\.00/i)).toBeInTheDocument();
      });
    });

    it('should create enrollment when proceeding to payment', async () => {
      const user = userEvent.setup();

      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(createEnrollment).mockResolvedValue({
        data: mockEnrollment,
      } as any);

      vi.mocked(createPaymentIntent).mockResolvedValue({
        data: mockPaymentIntent,
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      // Select cohort
      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      const onlineCohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      if (onlineCohortCard) {
        await user.click(onlineCohortCard);
      }

      // Continue to review
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      // Wait for review step
      await waitFor(() => {
        const reviewTitle = screen.getByRole('heading', { name: /Review Your Enrollment/i });
        expect(reviewTitle).toBeInTheDocument();
      });

      const payButton = screen.getByRole('button', { name: /proceed to payment/i });
      await user.click(payButton);

      // Should create enrollment
      await waitFor(() => {
        expect(createEnrollment).toHaveBeenCalledWith(expect.objectContaining({
          course: mockCourse.id,
          cohort: mockCohorts[0].id,
        }));
      });
    });
  });

  describe('Payment Step', () => {
    it('should display payment form with Stripe Elements', async () => {
      const user = userEvent.setup();

      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(createEnrollment).mockResolvedValue({
        data: mockEnrollment,
      } as any);

      vi.mocked(createPaymentIntent).mockResolvedValue({
        data: mockPaymentIntent,
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      // Select cohort
      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      const onlineCohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      if (onlineCohortCard) {
        await user.click(onlineCohortCard);
      }

      // Continue through review
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      await waitFor(() => {
        const reviewTitle = screen.getByRole('heading', { name: /Review Your Enrollment/i });
        expect(reviewTitle).toBeInTheDocument();
      });

      const payButton = screen.getByRole('button', { name: /proceed to payment/i });
      await user.click(payButton);

      // Should show payment form
      await waitFor(() => {
        expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
        expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle course loading error', async () => {
      vi.mocked(useCourseDetail).mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load course' },
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show alert with error message
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(screen.getByText(/Failed to load course/i)).toBeInTheDocument();
      });
    });

    it('should handle enrollment creation error', async () => {
      const user = userEvent.setup();

      vi.mocked(useCourseDetail).mockReturnValue({
        data: { data: mockCourse },
        isLoading: false,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: { results: mockCohorts },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      vi.mocked(createEnrollment).mockRejectedValue(new Error('Cohort is full'));

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      // Select cohort
      await waitFor(() => {
        expect(screen.getByText('Online Cohort')).toBeInTheDocument();
      });

      const onlineCohortCard = screen.getByText('Online Cohort').closest('div[class*="cursor-pointer"]');
      if (onlineCohortCard) {
        await user.click(onlineCohortCard);
      }

      // Continue to review
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      await waitFor(() => {
        const reviewTitle = screen.getByRole('heading', { name: /Review Your Enrollment/i });
        expect(reviewTitle).toBeInTheDocument();
      });

      const payButton = screen.getByRole('button', { name: /proceed to payment/i });
      await user.click(payButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Cohort is full/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching course', () => {
      vi.mocked(useCourseDetail).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      vi.mocked(useCohorts).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<EnrollmentPage />, { wrapper: createWrapper() });

      // Component shows skeleton loaders when loading
      const skeletons = screen.getAllByRole('generic').filter(
        el => el.getAttribute('data-slot') === 'skeleton' || el.className?.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
