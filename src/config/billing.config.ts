import type { BillingPlan, PlanTier } from "@/domains/billing/types/billing.types";

export const billingConfig: Record<PlanTier, BillingPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: "$49/mo",
    features: ["Up to 5 Clients", "Core Bookkeeping", "Manual Imports"],
    paymentLink: "https://buy.stripe.com/mock_starter_link",
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: "$149/mo",
    features: ["Unlimited Clients", "Exception Engine Workspace", "Priority Syncing"],
    paymentLink: "https://buy.stripe.com/mock_professional_link",
    isRecommended: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "$499/mo",
    features: ["Custom CPA Routing", "Multi-firm Permissions", "SLA Timers"],
    paymentLink: "https://buy.stripe.com/mock_enterprise_link",
  },
};
