/**
 * CourseDetailPage TDD Tests
 *
 * Tests for the course detail page
 * Phase 5B - Task 5B.1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CourseDetailPage } from '../CourseDetailPage';
import { useCourseDetail, useCourseCohorts } from '@/hooks/useCourses';

// Mock the hooks
vi.mock('@/hooks/useCourses', () => ({
  useCourseDetail: vi.fn(),
  useCourseCohorts: vi.fn(),
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
    <MemoryRouter initialEntries={['/courses/ai-engineering-bootcamp']}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

const mockCourse = {
  id: 'course-1',
  title: 'AI Engineering Bootcamp',
  slug: 'ai-engineering-bootcamp',
  subtitle: 'Build production-grade AI systems',
  description: 'Master the complete AI engineering stack from prompt engineering to deploying scalable AI applications.',
  thumbnail: 'https://example.com/image.jpg',
  duration: '12 weeks',
  level: 'Advanced',
  rating: 4.9,
  review_count: 2847,
  enrolled_count: 15234,
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
    bio: 'AI researcher with 10+ years of experience',
    avatar: null,
  },
  modules: [
    { id: 'm1', title: 'Introduction to AI', duration: '1 week', order: 1 },
    { id: 'm2', title: 'Machine Learning Fundamentals', duration: '2 weeks', order: 2 },
  ],
  cohorts: [],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockCohorts = [
  {
    id: 'cohort-1',
    course_title: 'AI Engineering Bootcamp',
    course_slug: 'ai-engineering-bootcamp',
    start_date: '2026-04-14',
    end_date: '2026-07-14',
    timezone: 'America/New_York',
    format: 'online',
    location: null,
    instructor_name: 'Dr. Sarah Chen',
    spots_total: 50,
    spots_remaining: 8,
    availability_status: 'filling-fast',
    early_bird_price: '1999.00',
    early_bird_deadline: '2026-03-15',
    status: 'enrolling',
  },
];

describe('CourseDetailPage TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: Should show loading state initially', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    expect(screen.getByTestId('course-detail-loading')).toBeInTheDocument();
  });

  it('GREEN: Should display course details after loading', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
    });

    expect(screen.getByText('Build production-grade AI systems')).toBeInTheDocument();
    expect(screen.getByText(/Master the complete AI engineering stack/i)).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText(/Dr. Sarah Chen/i)).toBeInTheDocument();
  });

  it('Should display course price', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/\$2,499/)).toBeInTheDocument();
    });
  });

  it('Should display course modules', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Introduction to AI')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning Fundamentals')).toBeInTheDocument();
    });
  });

  it('Should display available cohorts', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Upcoming Cohorts/i)).toBeInTheDocument();
      expect(screen.getByText(/8 spots remaining/i)).toBeInTheDocument();
    });
  });

  it('Should handle error state', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch course'),
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch cohorts'),
    } as any);

    render(<CourseDetailPage />, { wrapper });

    expect(screen.getByTestId('course-detail-error')).toBeInTheDocument();
  });

  it('Should handle course not found (404)', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } } as any,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    expect(screen.getByText(/Course not found/i)).toBeInTheDocument();
  });

  it('Should show enroll button', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Enroll Now/i)).toBeInTheDocument();
    });
  });

  it('Should display instructor bio', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/About the Instructor/i)).toBeInTheDocument();
      expect(screen.getByText(/AI researcher with 10+ years of experience/i)).toBeInTheDocument();
    });
  });

  it('Should call useCourseDetail with slug from URL', () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    expect(useCourseDetail).toHaveBeenCalledWith('ai-engineering-bootcamp');
  });

  it('Should display breadcrumb navigation', async () => {
    vi.mocked(useCourseDetail).mockReturnValue({
      data: {
        success: true,
        data: mockCourse,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useCourseCohorts).mockReturnValue({
      data: {
        success: true,
        data: mockCohorts,
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseDetailPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Courses/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Engineering Bootcamp/i)).toBeInTheDocument();
    });
  });
});
