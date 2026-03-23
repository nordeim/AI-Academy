/**
 * API Types
 * 
 * TypeScript interfaces matching the backend API response structures
 * These types ensure frontend-backend contract alignment
 */

// Entity types that are core to API responses
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  course_count: number;
}

// API Response envelope (standardized across all endpoints)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: Record<string, string[]>;
  meta: {
    timestamp: string;
    request_id: string;
    pagination?: PaginationMeta;
  };
}

// Pagination metadata
export interface PaginationMeta {
  count: number;
  page: number;
  pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

// Paginated response data structure
export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Category list response (convenience type)
export type CategoryListResponse = ApiResponse<PaginatedData<Category>>;

// API Error structure
export interface ApiErrorData {
  message: string;
  errors: Record<string, string[]>;
  meta: {
    timestamp: string;
    request_id: string;
    error_code?: string;
  };
}
