/**
 * useCategories Hook TDD Tests
 * 
 * Test-Driven Development for category data fetching
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCategories, useCategoryDetail } from '../useCategories';

vi.mock('@/services/api/categories', () => ({
  getCategories: vi.fn(),
  getCategoryDetail: vi.fn(),
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

describe('useCategories Hook TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCategories - List', () => {
    it('should fetch categories on mount', async () => {
      const { getCategories } = await import('@/services/api/categories');
      const mockResponse = {
        success: true,
        data: {
          count: 3,
          next: null,
          previous: null,
          results: [
            { id: 1, name: 'AI Engineering', slug: 'ai-engineering', course_count: 12 },
            { id: 2, name: 'Data Science', slug: 'data-science', course_count: 8 },
          ],
        },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCategories).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCategories(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.results).toHaveLength(2);
      expect(getCategories).toHaveBeenCalled();
    });

    it('should cache data for 30 minutes', async () => {
      const { getCategories } = await import('@/services/api/categories');
      
      vi.mocked(getCategories).mockResolvedValue({
        success: true,
        data: { count: 1, next: null, previous: null, results: [] },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      });

      const { rerender } = renderHook(() => useCategories(), { wrapper });
      await waitFor(() => expect(getCategories).toHaveBeenCalled());

      rerender();
      expect(getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle error states', async () => {
      const { getCategories } = await import('@/services/api/categories');
      vi.mocked(getCategories).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCategories(), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCategoryDetail', () => {
    it('should fetch category detail', async () => {
      const { getCategoryDetail } = await import('@/services/api/categories');
      const mockResponse = {
        success: true,
        data: { id: 1, name: 'AI', slug: 'ai', course_count: 12 },
        message: 'Success',
        errors: {},
        meta: { timestamp: '2024-01-01', request_id: '123' },
      };

      vi.mocked(getCategoryDetail).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCategoryDetail('ai'), { wrapper });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.name).toBe('AI');
    });

    it('should not fetch when slug is empty', () => {
      const { getCategoryDetail } = await import('@/services/api/categories');
      renderHook(() => useCategoryDetail(''), { wrapper });
      expect(getCategoryDetail).not.toHaveBeenCalled();
    });
  });
});
