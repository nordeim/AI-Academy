/**
 * E2E Test Helpers
 *
 * Shared utilities for E2E tests
 *
 * @module tests/e2e/helpers/api.ts
 */

// API helper for authentication and data setup
export async function apiLogin(email: string, password: string): Promise<{ access: string; refresh: string }> {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
  
  const response = await fetch(`${API_URL}/api/v1/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function apiRegister(email: string, password: string, username: string): Promise<any> {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
  
  const response = await fetch(`${API_URL}/api/v1/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function getCourses(token?: string): Promise<any> {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/api/v1/courses/`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get courses: ${response.status}`);
  }
  
  return response.json();
}

export async function getCourseDetail(slug: string, token?: string): Promise<any> {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/api/v1/courses/${slug}/`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get course: ${response.status}`);
  }
  
  return response.json();
}

export async function createTestUser(): Promise<{ email: string; password: string; username: string }> {
  const timestamp = Date.now();
  const email = `test_${timestamp}@example.com`;
  const username = `testuser_${timestamp}`;
  const password = 'TestPass123!';
  
  await apiRegister(email, password, username);
  
  return { email, password, username };
}

export async function cleanupTestUser(userId: string): Promise<void> {
  // Cleanup logic - would need admin API or database access
  console.log(`Cleanup for user ${userId} - implement if needed`);
}

// Health check
export async function checkApiHealth(): Promise<boolean> {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/api/v1/courses/`, { 
      method: 'HEAD',
      timeout: 5000,
    } as any);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
