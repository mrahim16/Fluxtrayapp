import { test, expect } from "@playwright/test";
import { BillingPageObject } from "../models/BillingPageObject";

test.describe("FluxBooks Billing Domain POC End-to-End Workflow", () => {
  test("should walk smoothly through the core subscription upgrade pipeline", async ({ page }) => {
    const billingPo = new BillingPageObject(page);

    // Stub window.open BEFORE navigating, so we don't depend on whether
    // this OS/browser combo actually spawns a real second window for
    // window.open() — that behavior is environment-dependent (see
    // headless Chromium popup quirk) and not something app/test code
    // should rely on for a POC with no real backend to redirect to.
    await billingPo.stubWindowOpen();

    await billingPo.navigateToBillingFromLogin();
    await billingPo.verifyPricingMatrixRendered();

    await billingPo.clickUpgradeButton();
    await billingPo.waitForCheckoutOutcomeLog();

    expect(await billingPo.checkoutSucceeded()).toBe(true);

    const requestedUrl = await billingPo.getCapturedWindowOpenUrl();
    expect(requestedUrl).toContain("stripe.com");

    await billingPo.simulateStripeSuccessCallback();
    await billingPo.verifySubscriptionActiveState("Professional");
  });
});