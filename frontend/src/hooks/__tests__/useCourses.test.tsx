/**
 * useCourses Hook TDD Tests
 * 
 * Test-Driven Development for course data fetching hooks
 * 
 * Tests cover:
 * - Data fetching
 * - Loading states
 * - Error handling
 * - Caching behavior
 * - Filter updates
 * - Refetching
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCourses, useCourseDetail, useCourseCohorts } from '../useCourses';

// Mock API service
vi.mock('@/services/api/courses', () => ({
  getCourses: vi.fn(),
  getCourseDetail: vi.fn(),
  getCourseCohorts: vi.fn(),
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

describe('useCourses Hook TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCourses - List', () => {
    it('should fetch courses on mount', async () => {
      const { getCourses } = await import('@/services/api/courses');
      const mockResponse = {
        success: true,
        data: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { id: '1', title: 'Course 1', slug: 'course-1' },
            { id: '2', title: 'Course 2', slug: 'course-2' },
          ],
        },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCourses).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCourses(), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.results).toHaveLength(2);
      expect(getCourses).toHaveBeenCalledWith(undefined);
    });

    it('should apply filters correctly', async () => {
      const { getCourses } = await import('@/services/api/courses');
      const mockResponse = {
        success: true,
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [{ id: '1', title: 'AI Course', slug: 'ai-course' }],
        },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCourses).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(
        () => useCourses({ level: 'intermediate', search: 'AI' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getCourses).toHaveBeenCalledWith({
        level: 'intermediate',
        search: 'AI',
      });
    });

    it('should handle error states', async () => {
      const { getCourses } = await import('@/services/api/courses');
      const mockError = new Error('Network error');

      vi.mocked(getCourses).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCourses(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should cache data', async () => {
      const { getCourses } = await import('@/services/api/courses');
      const mockResponse = {
        success: true,
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [{ id: '1', title: 'Course', slug: 'course' }],
        },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCourses).mockResolvedValue(mockResponse);

      // First render
      const { result, rerender } = renderHook(() => useCourses(), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Rerender
      rerender();

      // Should not refetch (cache hit)
      expect(getCourses).toHaveBeenCalledTimes(1);
    });

    it('should refetch when filters change', async () => {
      const { getCourses } = await import('@/services/api/courses');
      
      vi.mocked(getCourses).mockResolvedValue({
        success: true,
        data: { count: 0, next: null, previous: null, results: [] },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      });

      const { result, rerender } = renderHook(
        ({ level }) => useCourses({ level }),
        {
          wrapper,
          initialProps: { level: 'beginner' },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Change filters
      rerender({ level: 'advanced' });

      await waitFor(() => 
        expect(getCourses).toHaveBeenLastCalledWith({ level: 'advanced' })
      );

      expect(getCourses).toHaveBeenCalledTimes(2);
    });
  });

  describe('useCourseDetail', () => {
    it('should fetch course detail', async () => {
      const { getCourseDetail } = await import('@/services/api/courses');
      const mockResponse = {
        success: true,
        data: { id: '1', title: 'Detailed Course', slug: 'detailed-course' },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCourseDetail).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCourseDetail('detailed-course'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.title).toBe('Detailed Course');
      expect(getCourseDetail).toHaveBeenCalledWith('detailed-course');
    });

    it('should not fetch when slug is empty', async () => {
      const { getCourseDetail } = await import('@/services/api/courses');

      renderHook(() => useCourseDetail(''), { wrapper });

      // Should not be called
      expect(getCourseDetail).not.toHaveBeenCalled();
    });
  });

  describe('useCourseCohorts', () => {
    it('should fetch cohorts for a course', async () => {
      const { getCourseCohorts } = await import('@/services/api/courses');
      const mockResponse = {
        success: true,
        data: [{ id: 'c1', course_title: 'Course', status: 'enrolling' }],
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCourseCohorts).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCourseCohorts('course-slug'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(1);
      expect(getCourseCohorts).toHaveBeenCalledWith('course-slug');
    });
  });
});
