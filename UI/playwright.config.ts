import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env with explicit path and error handling
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Failed to load .env:', result.error);
}

import { getBaseUrl } from './utils/helpers';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: require.resolve('./global-auth'),
  testDir: './e2e',
  testMatch: [
    /user\/regression\/[^\/]+\.spec\.ts$/, // All .spec.ts in ./e2e/user/regression/
    /admin\/regression.*\.spec\.ts$/,
  ],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 3 : 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  // 60 second timeout by default
  timeout: 60000,
  reportSlowTests: null,
  maxFailures: process.env.CI ? 5 : 5,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    viewport: { width: 1920, height: 1080 },
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: getBaseUrl(),
    // /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    storageState: 'auth.json',
    actionTimeout: 15000, // 15 seconds timeout for individual actions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'sp-cms',
      testIgnore: [
        /user\/regression\/chirp\//,
      ],
      use: {
        ...devices['Desktop Chrome'], channel: 'chrome',
        headless: true,
        contextOptions: {
          ignoreHTTPSErrors: true
        },
        // baseURL: ADMIN_BASE_URL
      },
    },
    {
      name: 'sp-documenting-hope',
      testIgnore: [
        /user\/regression\/cms\//,
      ],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        contextOptions: {
          ignoreHTTPSErrors: true
        },
        // baseURL: baseURL
      },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
