import { billingConfig } from "@/config/billing.config";
import type { BillingPlan } from "@/domains/billing/types/billing.types";

export const billingService = {
  async getPlans(): Promise<BillingPlan[]> {
    return Promise.resolve(Object.values(billingConfig));
  },

  async launchCheckout(plan: BillingPlan): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    const popup = window.open(plan.paymentLink, "_blank");

    // window.open returns null (or a closed/undefined-location window) when
    // blocked by a popup blocker. Don't report success unless we actually
    // got a live window handle back.
    return popup !== null && popup !== undefined;
  },
};