/**
 * Category Types
 * 
 * TypeScript interfaces for Category entity from backend API
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  course_count: number;
}

export interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}
