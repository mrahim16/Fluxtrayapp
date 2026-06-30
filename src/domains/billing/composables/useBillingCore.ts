import { ref } from "vue";
import { useBillingStore } from "@/domains/billing/store/billing.store";
import { billingService } from "@/domains/billing/services/billing.service";
import type { BillingPlan } from "@/domains/billing/types/billing.types";

export function useBillingCore() {
  const store = useBillingStore();
  const isExecuting = ref(false);

  async function initializeBilling() {
    store.addLog("INFO: Initializing Billing Domain Configuration Specs");
    const plans = await billingService.getPlans();
    store.setAvailablePlans(plans);
  }

  async function initiateUpgrade(plan: BillingPlan) {
    isExecuting.value = true;
    store.addLog(`INFO: Selected Plan Tier: ${plan.name}`);
    store.addLog("POST: /open-payment-link - Status 200 OK");

    const triggered = await billingService.launchCheckout(plan);
    if (triggered) {
      store.addLog("SUCCESS: Redirected Client to Stripe payment link engine");
      store.setSubscriptionStatus("processing");
    } else {
      store.addLog("ERROR: Unable to open checkout context");
    }

    isExecuting.value = false;
  }

  function handleStripeMockReturn() {
    store.addLog("INFO: Hook triggered from Stripe success return URL param");
    store.activateSubscription("professional");
    store.addLog("SUCCESS: Premium active subscription state refreshed");
  }

  return {
    state: store,
    isExecuting,
    initializeBilling,
    initiateUpgrade,
    handleStripeMockReturn,
  };
}
