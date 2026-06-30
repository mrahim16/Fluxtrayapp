<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { SubscriptionStatus } from "@/domains/billing/types/billing.types";

const props = defineProps({
  status: {
    type: String as () => SubscriptionStatus,
    required: true,
  },
  plansLoaded: {
    type: Boolean,
    required: true,
  },
});

const panelStatus = computed(() => ({
  ready: true,
  checkout: props.plansLoaded,
  configured: props.plansLoaded,
  active: props.status === "active",
}));
</script>

<template>
  <section class="rounded-3xl bg-[#FDFBF7] p-6 shadow-xl shadow-[#D4AF37]/10 border border-[#E9DFC9]">
    <div class="mb-5">
      <p class="text-xs uppercase tracking-[0.28em] text-[#8B7A65]">Monitoring panel</p>
      <h2 class="mt-2 text-xl font-semibold text-[#2C1A11]">Billing engine health</h2>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-[#F0E2C4]">
        <div>
          <p class="text-sm font-semibold text-[#2C1A11]">Billing Ready</p>
          <p class="text-xs text-[#8B7A65]">Configuration loaded</p>
        </div>
        <span class="rounded-full bg-[#D0E2FF]/40 px-3 py-1 text-xs text-[#2C1A11]">Online</span>
      </div>

      <div class="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-[#F0E2C4]">
        <div>
          <p class="text-sm font-semibold text-[#2C1A11]">Checkout Available</p>
          <p class="text-xs text-[#8B7A65]">External payment redirect</p>
        </div>
        <span class="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs text-[#7C5A22]">{{ panelStatus.checkout ? "Ready" : "Waiting" }}</span>
      </div>

      <div class="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-[#F0E2C4]">
        <div>
          <p class="text-sm font-semibold text-[#2C1A11]">Stripe Link Configured</p>
          <p class="text-xs text-[#8B7A65]">Plan targets mapped</p>
        </div>
        <span class="rounded-full bg-[#D0E2FF]/40 px-3 py-1 text-xs text-[#2C1A11]">Configured</span>
      </div>

      <div class="flex items-center justify-between rounded-3xl bg-white px-4 py-4 shadow-sm border border-[#F0E2C4]">
        <div>
          <p class="text-sm font-semibold text-[#2C1A11]">Dashboard Active</p>
          <p class="text-xs text-[#8B7A65]">Workspace sync enabled</p>
        </div>
        <span class="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs text-[#7C5A22]">{{ panelStatus.active ? "Live" : "Idle" }}</span>
      </div>
    </div>
  </section>
</template>
