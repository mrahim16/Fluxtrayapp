import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  BillingPlan,
  BillingTransaction,
  PlanTier,
  SubscriptionStatus,
} from "@/domains/billing/types/billing.types";

const initialTransactions: BillingTransaction[] = [
  {
    id: "txn_001",
    title: "Starter Plan Activated",
    detail: "Manual billing workflow initialized",
    amount: "$49",
    date: "2026-06-01",
    status: "Completed",
  },
  {
    id: "txn_002",
    title: "Payment Link Opened",
    detail: "Professional checkout session created",
    amount: "$149",
    date: "2026-06-12",
    status: "Pending",
  },
];

export const useBillingStore = defineStore("billing", () => {
  const currentPlan = ref<PlanTier>("starter");
  const status = ref<SubscriptionStatus>("inactive");
  const renewalDate = ref<string>("2026-07-01");
  const logs = ref<string[]>([
    "INFO: Billing domain initialized",
    "INFO: Ready to load pricing plans",
  ]);
  const availablePlans = ref<BillingPlan[]>([]);
  const transactions = ref<BillingTransaction[]>(initialTransactions);

  function setAvailablePlans(plans: BillingPlan[]): void {
    availablePlans.value = plans;
  }

  function setSubscriptionStatus(newStatus: SubscriptionStatus): void {
    status.value = newStatus;
  }

  function setCurrentPlan(planId: PlanTier): void {
    currentPlan.value = planId;
  }

  function addLog(message: string): void {
    logs.value = [message, ...logs.value].slice(0, 20);
  }

  function activateSubscription(planId: PlanTier): void {
    currentPlan.value = planId;
    status.value = "active";
    renewalDate.value = "2026-08-01";
    addLog(`SUCCESS: Subscription activated for ${planId} plan`);
    transactions.value = [
      {
        id: `txn_${Date.now()}`,
        title: `${planId} plan purchase confirmed`,
        detail: "Stripe payment link flow completed",
        amount: planId === "enterprise" ? "$499" : planId === "professional" ? "$149" : "$49",
        date: new Date().toISOString().slice(0, 10),
        status: "Completed",
      },
      ...transactions.value,
    ];
  }

  return {
    currentPlan,
    status,
    renewalDate,
    logs,
    availablePlans,
    transactions,
    setAvailablePlans,
    setSubscriptionStatus,
    setCurrentPlan,
    addLog,
    activateSubscription,
  };
});
