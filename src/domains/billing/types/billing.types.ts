export type PlanTier = "starter" | "professional" | "enterprise";
export type SubscriptionStatus = "inactive" | "active" | "processing";

export interface BillingPlan {
  id: PlanTier;
  name: string;
  price: string;
  features: string[];
  paymentLink: string;
  isRecommended?: boolean;
}

export interface BillingTransaction {
  id: string;
  title: string;
  detail: string;
  amount: string;
  date: string;
  status: string;
}

export interface BillingState {
  currentPlan: PlanTier;
  status: SubscriptionStatus;
  renewalDate: string;
  logs: string[];
  availablePlans: BillingPlan[];
  transactions: BillingTransaction[];
}
