/**
 * FeaturedCourse Section TDD Tests
 *
 * Tests for FeaturedCourse section with API integration
 * Phase 4A - Task 4A.2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { FeaturedCourse } from '../FeaturedCourse';
import { useCourseDetail } from '@/hooks/useCourses';

// Mock the hook
vi.mock('@/hooks/useCourses', () => ({
  useCourseDetail: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCourse = {
  id: 'course-1',
  slug: 'ai-engineering-bootcamp',
  title: 'AI Engineering Bootcamp',
  subtitle: 'Build production-grade AI systems',
  description: 'Master the complete AI engineering stack',
  thumbnail: 'https://example.com/image.jpg',
  duration: '12 weeks',
  level: 'Advanced',
  rating: 4.9,
  review_count: 2847,
  enrolled_count: 15234,
  modules: [
    { id: 'm1', title: 'Module 1', duration: '1 week', order: 1 },
  ],
  price: '2499.00',
  compare_at_price: '3499.00',
  currency: 'USD',
  next_cohort_date: '2026-04-14',
  is_featured: true,
  is_active: true,
  has_certification: true,
  category: {
    id: 'cat-1',
    name: 'AI/ML',
    slug: 'ai-ml',
  },
  instructor: {
    id: 'inst-1',
    name: 'Dr. Sarah Chen',
    bio: 'AI researcher',
    avatar: null,
  },
  cohorts: [],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('FeaturedCourse Component TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: Should show loading state initially', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourseDetail>);

    render(<FeaturedCourse />, { wrapper });

    // Should show loading skeleton
    expect(screen.getByTestId('featured-course-loading')).toBeInTheDocument();
  });

  it('GREEN: Should display course details after loading', async () => {
    const mockResponse = {
      success: true,
      data: mockCourse,
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useCourseDetail).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourseDetail>);

    render(<FeaturedCourse />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
    });

    // Should show course details
    expect(screen.getByText('Build production-grade AI systems')).toBeInTheDocument();
    expect(screen.getByText('12 weeks')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('Enroll Now')).toBeInTheDocument();
  });

  it('Should handle error state', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch course'),
    } as ReturnType<typeof useCourseDetail>);

    render(<FeaturedCourse />, { wrapper });

    expect(screen.getByTestId('featured-course-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load featured course')).toBeInTheDocument();
  });

  it('Should call useCourseDetail with featured slug', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourseDetail>);

    render(<FeaturedCourse />, { wrapper });

    expect(useCourseDetail).toHaveBeenCalledWith('ai-engineering-bootcamp');
  });

  it('Should display course price', async () => {
    const mockResponse = {
      success: true,
      data: mockCourse,
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useCourseDetail).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourseDetail>);

    render(<FeaturedCourse />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/\$2,499/)).toBeInTheDocument();
    });
  });
});
