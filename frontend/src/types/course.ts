/**
 * Course Types
 * 
 * TypeScript interfaces for Course entity from backend API
 * Based on API_Usage_Guide.md specifications
 */

import { Category } from './api';

// Course difficulty level
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

// Course publication status
export type CourseStatus = 'draft' | 'published' | 'archived';

// Base course fields (from CourseListSerializer)
export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  thumbnail_alt: string;
  categories: Category[];
  level: CourseLevel;
  modules_count: number;
  duration_weeks: number;
  price: string; // Backend returns as string
  original_price: string | null;
  discount_percentage: number;
  currency: string;
  rating: string; // Backend returns as string
  review_count: number;
  enrolled_count?: number; // Only for authenticated users
  is_featured: boolean;
}

// Extended course fields (from CourseDetailSerializer)
// These additional fields are only available for authenticated users
export interface CourseDetail extends Course {
  description: string;
  duration_hours?: number; // Only for authenticated users
  enrolled_count?: number; // Hidden for anonymous users
  meta_title: string;
  meta_description: string;
  created_at?: string; // Only for authenticated users
  updated_at?: string; // Only for authenticated users
}

// Course list response
export interface CourseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

// Course filters for API requests
export interface CourseFilters {
  level?: CourseLevel;
  categories__slug?: string;
  search?: string;
  ordering?: string; // e.g., '-price', 'rating', '-created_at'
  featured?: boolean;
  page?: number;
}

// Course detail response wrapper
export type CourseDetailResponse = CourseDetail;
