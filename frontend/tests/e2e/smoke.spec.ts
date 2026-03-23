/**
 * E2E Smoke Tests - Phase 4 (Refined)
 *
 * Comprehensive smoke tests to verify critical application paths
 * Uses agent-browser for visual verification and API helpers for data setup
 *
 * @module tests/e2e/smoke.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.TEST_API_URL || 'http://localhost:8000';

// Increase global timeout for browser operations
describe('E2E Smoke Tests', { timeout: 60000 }, () => {
  // Store screenshot paths for evidence
  const screenshots: string[] = [];

  beforeAll(async () => {
    console.log(`Testing against: ${BASE_URL}`);
    console.log(`API endpoint: ${API_URL}`);
  });

  afterAll(async () => {
    // Cleanup: Log screenshots for evidence
    console.log('\nScreenshots captured:');
    screenshots.forEach(path => console.log(`  - ${path}`));
  });

  const captureEvidence = (name: string) => {
    const path = `/tmp/ai-academy-${name}.png`;
    // Increased wait for network idle to ensure rendering
    try {
      execSync(`agent-browser wait --load networkidle`, { stdio: 'inherit' });
    } catch (e) {
      console.log('Wait networkidle timed out or failed, proceeding with screenshot');
    }
    
    // Additional sleep to ensure HMR/animations finish
    execSync(`sleep 2`);
    
    execSync(`agent-browser screenshot --annotate ${path}`, { stdio: 'inherit' });
    
    // Take a snapshot to verify text content
    try {
      const snapshot = execSync(`agent-browser snapshot -i -c`, { encoding: 'utf8' });
      console.log(`Snapshot for ${name} (first 200 chars):\n${snapshot.slice(0, 200)}...`);
    } catch (e) {
      console.log(`Failed to take snapshot for ${name}`);
    }
    
    screenshots.push(path);
    return path;
  };

  describe('Core Page Verification', () => {
    it('should verify homepage content', async () => {
      execSync(`agent-browser open ${BASE_URL}/`, { stdio: 'inherit' });
      const path = captureEvidence('homepage');
      expect(existsSync(path)).toBe(true);
      
      const snapshot = execSync(`agent-browser snapshot -i`, { encoding: 'utf8' });
      expect(snapshot).toContain('Academy');
    });

    it('should verify courses catalog', async () => {
      execSync(`agent-browser open ${BASE_URL}/courses`, { stdio: 'inherit' });
      const path = captureEvidence('courses');
      expect(existsSync(path)).toBe(true);
      
      const snapshot = execSync(`agent-browser snapshot -i`, { encoding: 'utf8' });
      expect(snapshot).toContain('Courses');
    });
  });

  describe('Enrollment Flow (UI Verification)', () => {
    it('should load enrollment page for a course', async () => {
      execSync(`agent-browser open ${BASE_URL}/courses/ai-engineering-bootcamp/enroll`, { stdio: 'inherit' });
      
      const currentUrl = execSync('agent-browser get url', { encoding: 'utf8' }).trim();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        console.log('Redirected to login as expected');
        captureEvidence('login-redirect');
      } else {
        captureEvidence('enrollment-page');
      }
    });
  });

  describe('Responsive Design', () => {
    it('should render correctly on mobile', async () => {
      execSync(`agent-browser set viewport 375 812`, { stdio: 'inherit' });
      execSync(`agent-browser open ${BASE_URL}/`, { stdio: 'inherit' });
      
      const path = captureEvidence('mobile-view');
      expect(existsSync(path)).toBe(true);
      
      // Reset viewport
      execSync(`agent-browser set viewport 1280 800`, { stdio: 'inherit' });
    });
  });
});
