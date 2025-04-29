import { expect, type Locator, type Page, test } from '@playwright/test';
import { clickWithRetry, waitForDashboardView } from '../utils/helpers';

export class Auth {

  readonly page: Page;
  private baseURL: string;
  oidcSignInButton: Locator;
  limeSurveyLoginButton: Locator;
  usernameInput: Locator;
  passwordInput: Locator;
  signInButton: Locator;
  logoutButton: Locator;
  contactUsButton: Locator;
  eSSOidcProviderLoginButton: Locator;




  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.ADMIN_BASE_URL;
    this.oidcSignInButton = page.getByRole('button', { name: 'Sign in' });
    this.limeSurveyLoginButton = page.getByRole('button', { name: 'Log in' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'submit' });
    this.logoutButton = page.getByRole('button', { name: 'LOG OUT' });
    this.contactUsButton = page.getByRole('button', { name: 'CONTACT US' });
    this.eSSOidcProviderLoginButton = page.getByRole('button', { name: 'ESSOidcProvider' });


  };

  // Logs into the survey platform using a provided URL.
  // Determines login flow based on environment (sandbox or others) using ADMIN_BASE_URL and UI visibility.
  async surveyPlatformLogin() {
    // Navigate to the specified URL—assumes 'url' is defined in scope (e.g., passed as param or global).
    await this.page.goto(this.baseURL);
    // Check if ADMIN_BASE_URL indicates the sandbox environment (https://sbx-sps).
    // ADMIN_BASE_URL must be set in env (e.g., .env or Docker -e).
    if (this.baseURL.includes('https://sbx-sps')) {
      console.log('CMS Sandbox environment detected');
      /**
       * 
       * sometimes the cms env will show a redirect page with the oidc button and once clicked then it redirects tot he dashboard.
       * we just check to see if the button is visible
       * */
      if (await this.eSSOidcProviderLoginButton.isVisible()) {
        console.log("clicking OIDC Button")
        await this.eSSOidcProviderLoginButton.click();
      };
      await this.oidcLogin();
    };
    // If not sandbox, check if OIDC login button is visible for alternative flow.
    if (!this.baseURL.includes('https://sbx-sps') && await this.eSSOidcProviderLoginButton.isVisible()) {
      console.log(`detected environment: ${this.baseURL}`);
      // Double-click with 500ms delay—delay ensures UI stability if needed.
      await this.eSSOidcProviderLoginButton.dblclick({ delay: 500 });
      // Use LimeSurvey login—assumes OIDC redirects to LS credentials page.
      await this.lsAdminLogin();
    };
    if (await this.limeSurveyLoginButton.isVisible()) {
      console.log(`detected environment: ${this.baseURL}`);
      await this.lsAdminLogin();
    }
  };

  async lsAdminLogin() {
    // Then, wait for the button to be enabled
    await expect(this.limeSurveyLoginButton).toBeVisible({ timeout: 8000 });
    await this.usernameInput.fill(`${process.env.QA_USERNAME}`);
    await this.passwordInput.fill(`${process.env.QA_PASSWORD}`);
    await this.limeSurveyLoginButton.click();
    await waitForDashboardView(this.page);
  };

  async oidcLogin() {
    await this.usernameInput.fill(`${process.env.OIDC_USERNAME}`);
    await this.passwordInput.fill(`${process.env.OIDC_PASSWORD}`);
    await clickWithRetry(this.page, this.oidcSignInButton);
    await waitForDashboardView(this.page);
  };

};
export default Auth;