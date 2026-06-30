<script setup lang="ts">
import type { BillingPlan, PlanTier } from "@/domains/billing/types/billing.types";
import { defineProps, defineEmits } from "vue";
import AppCard from "@/components/shared/AppCard.vue";

defineProps({
  plans: {
    type: Array as () => BillingPlan[],
    default: () => [],
  },
  selectedPlanId: {
    type: String as () => PlanTier,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "select-plan", planId: PlanTier): void;
  (event: "checkout-plan", plan: BillingPlan): void;
}>();

function selectPlan(planId: PlanTier) {
  emit("select-plan", planId);
}

function checkout(plan: BillingPlan) {
  emit("checkout-plan", plan);
}
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-3">
    <AppCard
      v-for="plan in plans"
      :key="plan.id"
      :variant="plan.isRecommended ? 'premium-accent' : 'glass-panel'"
      :isActive="selectedPlanId === plan.id"
    >
      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-[#8B7A65]">{{ plan.name }}</p>
            <p class="mt-3 text-3xl font-semibold text-[#2C1A11]">{{ plan.price }}</p>
          </div>
          <span v-if="plan.isRecommended" class="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#7C5A22]">
            Recommended
          </span>
        </div>

        <ul class="space-y-3 text-sm text-[#5E4A3B]">
          <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3">
            <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#D0E2FF]/50 text-[#2C1A11]">✓</span>
            {{ feature }}
          </li>
        </ul>

        <div class="flex flex-col gap-3 pt-4">
          <button
            class="rounded-2xl bg-[#2C1A11] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3f2a1f] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isProcessing"
            @click="checkout(plan)"
          >
            {{ isProcessing ? "Processing..." : `Select ${plan.name}` }}
          </button>

          <button
            class="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-[#2C1A11] border border-[#E8D3A6] transition hover:bg-[#faf6ef]"
            @click="selectPlan(plan.id)"
          >
            Pick this plan
          </button>
        </div>
      </div>
    </AppCard>
  </div>
</template>
