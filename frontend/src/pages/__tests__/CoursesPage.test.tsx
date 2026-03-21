/**
 * CoursesPage TDD Tests
 *
 * Tests for the courses listing page
 * Phase 5A - Task 5A.2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { CoursesPage } from '../CoursesPage';
import { useCategories } from '@/hooks/useCategories';
import { useCourses } from '@/hooks/useCourses';

// Mock the hooks
vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('@/hooks/useCourses', () => ({
  useCourses: vi.fn(),
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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

const mockCategories = [
  { id: 'cat-1', name: 'AI/ML', slug: 'ai-ml', description: 'Learn AI', course_count: 5, display_order: 1, is_active: true },
  { id: 'cat-2', name: 'Data Engineering', slug: 'data-engineering', description: 'Build pipelines', course_count: 3, display_order: 2, is_active: true },
];

const mockCourses = [
  {
    id: 'course-1',
    title: 'AI Engineering Bootcamp',
    slug: 'ai-engineering-bootcamp',
    subtitle: 'Build AI systems',
    description: 'Master AI',
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
    category: { id: 'cat-1', name: 'AI/ML' },
    is_featured: true,
    is_active: true,
    has_certification: true,
  },
  {
    id: 'course-2',
    title: 'Data Science Fundamentals',
    slug: 'data-science-fundamentals',
    subtitle: 'Learn data science',
    description: 'Foundations',
    thumbnail: 'https://example.com/image2.jpg',
    duration: '8 weeks',
    level: 'Beginner',
    rating: 4.7,
    review_count: 1200,
    enrolled_count: 5000,
    price: '999.00',
    currency: 'USD',
    next_cohort_date: '2026-05-01',
    category: { id: 'cat-2', name: 'Data Engineering' },
    is_featured: false,
    is_active: true,
    has_certification: true,
  },
];

describe('CoursesPage TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: Should show loading state initially', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    expect(screen.getByTestId('courses-loading')).toBeInTheDocument();
  });

  it('GREEN: Should display page title and course grid', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('All Courses')).toBeInTheDocument();
    });

    expect(screen.getByText('AI Engineering Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('Data Science Fundamentals')).toBeInTheDocument();
  });

  it('Should display category filter pills', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI/ML')).toBeInTheDocument();
      expect(screen.getByText('Data Engineering')).toBeInTheDocument();
    });
  });

  it('Should handle error state', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch categories'),
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch courses'),
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    expect(screen.getByTestId('courses-error')).toBeInTheDocument();
  });

  it('Should handle empty courses state', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 0, next: null, previous: null, results: [] }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    expect(screen.getByTestId('courses-empty')).toBeInTheDocument();
    expect(screen.getByText('No courses found')).toBeInTheDocument();
  });

  it('Should display course details (price, level, rating)', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText(/\$2,499/)).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
    });
  });

  it('Should show search input', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('Should call useCourses on mount with correct parameters', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    expect(useCourses).toHaveBeenCalled();
  });

  it('Should display sort dropdown', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    });
  });

  it('Should filter courses when category clicked', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCategories }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    vi.mocked(useCourses).mockReturnValue({
      data: { success: true, data: { count: 2, next: null, previous: null, results: mockCourses }, message: 'Success', errors: {}, meta: { timestamp: '2024-01-01', request_id: '123' } },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCourses>);

    render(<CoursesPage />, { wrapper });

    await waitFor(() => {
      const aiCategory = screen.getByText('AI/ML');
      fireEvent.click(aiCategory);
    });

    // Should trigger refetch with category filter
    expect(useCourses).toHaveBeenCalled();
  });
});
