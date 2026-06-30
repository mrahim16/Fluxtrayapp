<script setup lang="ts">
import type { BillingTransaction, PlanTier, SubscriptionStatus } from "@/domains/billing/types/billing.types";
import AppCard from "@/components/shared/AppCard.vue";
import AppTable from "@/components/shared/AppTable.vue";
import { computed, defineProps } from "vue";

const props = defineProps({
  currentPlan: {
    type: String as () => PlanTier,
    required: true,
  },
  status: {
    type: String as () => SubscriptionStatus,
    required: true,
  },
  renewalDate: {
    type: String,
    required: true,
  },
  transactions: {
    type: Array as () => BillingTransaction[],
    default: () => [],
  },
});

const tableRows = computed(() =>
  props.transactions.map((transaction) => ({
    id: transaction.id,
    Title: transaction.title,
    Detail: transaction.detail,
    Amount: transaction.amount,
    Date: transaction.date,
    Status: transaction.status,
  }))
);
</script>

<template>
  <AppCard variant="glass-panel" :isActive="false">
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.25em] text-[#8B7A65]">Billing insights</p>
          <h2 class="mt-2 text-2xl font-semibold text-[#2C1A11]">Subscription dashboard</h2>
        </div>
        <span class="rounded-full bg-[#D0E2FF]/40 px-3 py-1 text-sm font-semibold text-[#2C1A11]">
          {{ props.status.toUpperCase() }}
        </span>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-3xl bg-white p-4 shadow-sm border border-[#F0E2C4]">
          <p class="text-xs uppercase tracking-[0.25em] text-[#8B7A65]">Plan</p>
          <p class="mt-3 text-lg font-semibold text-[#2C1A11]">{{ props.currentPlan }}</p>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm border border-[#F0E2C4]">
          <p class="text-xs uppercase tracking-[0.25em] text-[#8B7A65]">Renewal</p>
          <p class="mt-3 text-lg font-semibold text-[#2C1A11]">{{ props.renewalDate }}</p>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm border border-[#F0E2C4]">
          <p class="text-xs uppercase tracking-[0.25em] text-[#8B7A65]">Payment ledger</p>
          <p class="mt-3 text-lg font-semibold text-[#2C1A11]">{{ props.transactions.length }} events</p>
        </div>
      </div>

      <div>
        <AppTable
          :columns="['Title', 'Detail', 'Amount', 'Date', 'Status']"
          :rows="tableRows"
        />
      </div>
    </div>
  </AppCard>
</template>
