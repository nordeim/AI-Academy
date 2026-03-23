/**
 * API Helpers for E2E Testing
 * 
 * Provides utility functions for interacting with the backend API
 * during E2E tests (authentication, data setup, etc.)
 */

const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';

/**
 * Perform login via API to get tokens
 */
export async function apiLogin(email = 'testuser@example.com', password = 'password123') {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Login error:', error);
    throw error;
  }
}

/**
 * Register a new user via API
 */
export async function apiRegister(userData: any) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('API Registration error:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/api/v1/courses/`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}
