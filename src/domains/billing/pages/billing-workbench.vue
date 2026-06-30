<script setup lang="ts">
import { onMounted, computed } from "vue";
import type { PlanTier } from "@/domains/billing/types/billing.types";
import { useBillingCore } from "@/domains/billing/composables/useBillingCore";
import PricingMatrix from "@/domains/billing/components/PricingMatrix.vue";
import BillingDashboard from "@/domains/billing/components/BillingDashboard.vue";
import ApiExplorer from "@/domains/billing/components/ApiExplorer.vue";
import TechTerminal from "@/domains/billing/components/TechTerminal.vue";
import MonitoringPanel from "@/domains/billing/components/MonitoringPanel.vue";

const {
  state,
  isExecuting,
  initializeBilling,
  initiateUpgrade,
  handleStripeMockReturn,
} = useBillingCore();

onMounted(() => {
  initializeBilling();
});

const selectedPlan = computed(() => state.currentPlan);

function handlePlanSelect(planId: PlanTier) {
  state.setCurrentPlan(planId);
}

const subscriptionLabel = computed(() => {
  if (state.status === "active") {
    return "Active";
  }
  if (state.status === "processing") {
    return "Processing";
  }

  return "Inactive";
});
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
    <div class="space-y-6">
      <section class="rounded-3xl bg-[#FDFBF7] p-8 shadow-2xl shadow-[#CCA56E]/10">
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.32em] text-[#8B7A65]">Billing Domain POC</p>
            <h1 class="mt-2 text-4xl font-semibold text-[#2C1A11]">Subscription workbench</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-[#5E4A3B]">
              Premium Stripe checkout simulation with payment link flow, operational telemetry, and a polished desktop layout.
            </p>
          </div>

          <div class="rounded-3xl bg-[#F5F2EB] p-5 shadow-inner shadow-[#DFD1A4]/20">
            <p class="text-xs uppercase tracking-[0.3em] text-[#8B7A65]">Current state</p>
            <p class="mt-3 text-3xl font-semibold text-[#2C1A11]">{{ subscriptionLabel }}</p>
            <p class="mt-2 text-sm text-[#5E4A3B]">Renewal on {{ state.renewalDate }}</p>
          </div>
        </div>

        <PricingMatrix
          :plans="state.availablePlans"
          :selectedPlanId="selectedPlan"
          :isProcessing="isExecuting"
          @select-plan="(planId) => handlePlanSelect(planId)"
          @checkout-plan="(plan) => initiateUpgrade(plan)"
        />
      </section>

      <BillingDashboard
        :currentPlan="state.currentPlan"
        :status="state.status"
        :renewalDate="state.renewalDate"
        :transactions="state.transactions"
      />
    </div>

    <aside class="space-y-6">
      <MonitoringPanel :status="state.status" :plansLoaded="state.availablePlans.length > 0" />
      <ApiExplorer :logs="state.logs" />
      <TechTerminal :logs="state.logs" />
      <section class="rounded-3xl bg-[#F5F2EB]/80 p-6 shadow-xl shadow-[#D4AF37]/10">
        <h2 class="mb-3 text-lg font-semibold text-[#2C1A11]">Stripe Success Simulation</h2>
        <p class="mb-4 text-sm text-[#5E4A3B]">Use this action to simulate return handling after the Stripe hosted link would complete.</p>
        <button
          class="rounded-2xl bg-[#2C1A11] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3f2a1f]"
          @click="handleStripeMockReturn"
        >
          Simulate Success Return
        </button>
      </section>
    </aside>
  </div>
</template>
