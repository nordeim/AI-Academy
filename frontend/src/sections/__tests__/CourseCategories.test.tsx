/**
 * CourseCategories Section TDD Tests
 *
 * Tests for CourseCategories section with API integration
 * Phase 4A - Task 4A.2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { CourseCategories } from '../CourseCategories';
import { useCategories } from '@/hooks/useCategories';

// Mock the hook
vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(),
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

const mockCategories = [
  {
    id: 'cat-1',
    name: 'AI/ML',
    slug: 'ai-ml',
    description: 'Learn AI and machine learning',
    course_count: 5,
    display_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Data Engineering',
    slug: 'data-engineering',
    description: 'Build data pipelines',
    course_count: 3,
    display_order: 2,
    is_active: true,
  },
];

describe('CourseCategories Component TDD', () => {
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

    render(<CourseCategories />, { wrapper });

    // Should show loading skeletons
    expect(screen.getByTestId('categories-loading')).toBeInTheDocument();
    expect(screen.queryByText('AI/ML')).not.toBeInTheDocument();
  });

  it('GREEN: Should display categories after loading', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 2,
        next: null,
        previous: null,
        results: mockCategories,
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useCategories).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    render(<CourseCategories />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('AI/ML')).toBeInTheDocument();
      expect(screen.getByText('Data Engineering')).toBeInTheDocument();
    });

    // Should show course counts
    expect(screen.getByText('5 courses')).toBeInTheDocument();
    expect(screen.getByText('3 courses')).toBeInTheDocument();
  });

  it('Should handle error state', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch categories'),
    } as ReturnType<typeof useCategories>);

    render(<CourseCategories />, { wrapper });

    expect(screen.getByTestId('categories-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
  });

  it('Should handle empty categories', () => {
    const mockResponse = {
      success: true,
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useCategories).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    render(<CourseCategories />, { wrapper });

    expect(screen.getByTestId('categories-empty')).toBeInTheDocument();
    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('Should call useCategories on mount', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    render(<CourseCategories />, { wrapper });

    expect(useCategories).toHaveBeenCalled();
  });

  it('Should display category descriptions', async () => {
    const mockResponse = {
      success: true,
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [mockCategories[0]],
      },
      message: 'Success',
      errors: {},
      meta: { timestamp: '2024-01-01', request_id: '123' },
    };

    vi.mocked(useCategories).mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useCategories>);

    render(<CourseCategories />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Learn AI and machine learning')).toBeInTheDocument();
    });
  });
});
