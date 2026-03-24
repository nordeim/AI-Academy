/**
 * Command Palette Test Case
 * 
 * Test case to verify the Command Palette search functionality
 * This test verifies that the search returns results when typing
 * 
 * @module __tests__/CommandPalette.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchDialog } from '@/components/SearchDialog';

// Mock courses data
const mockCourses = [
  {
    id: '1',
    slug: 'ai-engineering-bootcamp',
    title: 'AI Engineering Bootcamp',
    subtitle: 'Master production-grade AI development',
    thumbnail: null,
    thumbnail_alt: '',
    categories: [{ id: 1, name: 'AI Engineering', slug: 'ai-engineering', description: '', color: '#4f46e5', icon: 'Cpu', course_count: 1 }],
    level: 'intermediate',
    modules_count: 12,
    duration_weeks: 8,
    price: '2499.00',
    original_price: null,
    discount_percentage: 0,
    currency: 'USD',
    rating: '4.8',
    review_count: 127,
    is_featured: true,
  },
];

// Mock useCourses hook
vi.mock('@/hooks/useCourses', () => ({
  useCourses: vi.fn((filters) => {
    if (filters?.search && filters.search.length >= 2) {
      const searchTerm = filters.search.toLowerCase();
      const results = mockCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.subtitle.toLowerCase().includes(searchTerm)
      );
      return {
        data: { data: results },
        isLoading: false,
        error: null,
      };
    }
    return {
      data: { data: [] },
      isLoading: false,
      error: null,
    };
  }),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Command Palette Search', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('should show "Type at least 2 characters" when query is less than 2', async () => {
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Type at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should show "No courses found" when search returns no results', async () => {
      const user = userEvent.setup();
      
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/Search courses/i);
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
      });
    });

    it('should show search results when query matches courses', async () => {
      const user = userEvent.setup();
      
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/Search courses/i);
      await user.type(input, 'ai');

      await waitFor(() => {
        expect(screen.getByText(/AI Engineering Bootcamp/i)).toBeInTheDocument();
      });
    });

    it('should show course count in results heading', async () => {
      const user = userEvent.setup();
      
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/Search courses/i);
      await user.type(input, 'engineering');

      await waitFor(() => {
        expect(screen.getByText(/1 courses found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Handling', () => {
    it('should update query when typing in input', async () => {
      const user = userEvent.setup();
      
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/Search courses/i);
      await user.type(input, 'ai');

      await waitFor(() => {
        expect(input).toHaveValue('ai');
      });
    });

    it('should trigger search after typing 2 characters', async () => {
      const user = userEvent.setup();
      
      render(<SearchDialog {...defaultProps} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/Search courses/i);
      await user.type(input, 'ai');

      await waitFor(() => {
        expect(screen.getByText(/courses found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Behavior', () => {
    it('should call onOpenChange when close button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      
      render(<SearchDialog {...defaultProps} onOpenChange={onOpenChange} />, { 
        wrapper: createWrapper() 
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
