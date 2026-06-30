import type { Page } from "@playwright/test";

export class BillingPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Stubs window.open before any page script runs, so the test doesn't
   * depend on whether this specific browser/OS combo actually spawns a
   * real second window for window.open() (headless Chromium is known to
   * sometimes return a non-null handle without ever creating a real
   * popup target, which makes `page.waitForEvent("popup")` unreliable).
   *
   * Calls are recorded on `window.__capturedWindowOpenCalls` and a
   * truthy fake window-like object is returned, so app code that checks
   * "did window.open give me something back" still behaves the same way
   * it would against a real browser.
   */
  async stubWindowOpen() {
    await this.page.addInitScript(() => {
      const g = globalThis as any;
      g.__capturedWindowOpenCalls = [];
      g.__originalWindowOpen = g.open;
      g.open = (...args: any[]) => {
        g.__capturedWindowOpenCalls.push(args[0]);
        // Return a minimal object so app code's `popup !== null` check
        // sees the same truthy result a real window.open() would give.
        return { closed: false };
      };
    });
  }

  async getCapturedWindowOpenUrl(): Promise<string | undefined> {
    return this.page.evaluate(() => {
      const calls = (globalThis as any).__capturedWindowOpenCalls as string[];
      return calls?.[calls.length - 1];
    });
  }

  async navigateToBillingFromLogin() {
    await this.page.goto("/");
    await this.page.waitForSelector('input[type="email"]');

    await this.page.fill('input[type="email"]', "admin@fluxbooks.com");
    await this.page.fill('input[type="password"]', "Password@123");
    await this.page.click("button:has-text('Sign In')");

    await this.page.waitForURL("**/#/dashboard");
    await this.page.getByRole("link", { name: /billing/i }).click();
    await this.page.waitForURL("**/#/billing");
    await this.page.waitForSelector("text=Billing Domain POC");
  }

  async verifyPricingMatrixRendered() {
    await this.page.waitForSelector("text=Starter");
    await this.page.waitForSelector("text=Professional");
    await this.page.waitForSelector("text=Enterprise");
  }

  async selectPlan(planId: "starter" | "professional" | "enterprise") {
    await this.page.click(`text=${planId.charAt(0).toUpperCase() + planId.slice(1)}`);
  }

  async clickUpgradeButton() {
    await this.page.click("button:has-text('Select Professional')");
  }

  /**
   * After clicking checkout, the app logs either a SUCCESS or ERROR line
   * to the Tech Terminal depending on whether window.open() actually
   * returned a live window. Tests should check this instead of assuming
   * the popup event is the only signal of outcome.
   */
  async waitForCheckoutOutcomeLog() {
    return this.page
      .locator("text=/SUCCESS: Redirected Client to Stripe payment link engine|ERROR: Unable to open checkout context/")
      .first()
      .waitFor({ state: "visible", timeout: 10_000 });
  }

  async checkoutSucceeded(): Promise<boolean> {
    return this.page
      .locator("text=SUCCESS: Redirected Client to Stripe payment link engine")
      .first()
      .isVisible();
  }

  async simulateStripeSuccessCallback() {
    await this.page.click("button:has-text('Simulate Success Return')");
  }

  async verifySubscriptionActiveState(planName: string) {
    await this.page.waitForSelector(`text=${planName}`);
    await this.page.waitForSelector("text=Active");
  }
}