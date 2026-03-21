/**
 * Auth Types
 * 
 * TypeScript interfaces for Authentication and User entities
 * Based on API_Usage_Guide.md specifications
 */

// User entity
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  phone: string;
  avatar_url: string | null;
  company: string;
  title: string;
  linkedin_url: string;
  github_url: string;
  is_student: boolean;
  is_instructor: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// JWT Tokens
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset confirmation
export interface PasswordResetConfirm {
  token: string;
  uid: string;
  new_password: string;
}

// Profile update payload (partial User)
export type UpdateProfilePayload = Partial<Omit<User, 'id' | 'email' | 'username' | 'is_student' | 'is_instructor' | 'created_at' | 'updated_at'>>;

// Registration response
export interface RegisterResponse {
  user_id: string;
}
