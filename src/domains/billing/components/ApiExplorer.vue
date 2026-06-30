<script setup lang="ts">
import type { PropType } from "vue";
import { defineProps } from "vue";

defineProps({
  logs: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});
</script>

<template>
  <section class="rounded-3xl bg-[#F5F2EB] p-6 shadow-xl shadow-[#D4AF37]/10">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.28em] text-[#8B7A65]">API Explorer</p>
        <h2 class="mt-2 text-xl font-semibold text-[#2C1A11]">Simulated request timeline</h2>
      </div>
      <span class="rounded-full bg-[#E2ECFF] px-3 py-1 text-xs font-semibold text-[#294D8C]">Status 200</span>
    </div>

    <div class="space-y-3 rounded-3xl bg-white p-4 text-sm text-[#4B3A2A] shadow-sm border border-[#E8D3A6]">
      <div class="mb-4 text-xs uppercase tracking-[0.28em] text-[#8B7A65]">Recent cycles</div>
      <div class="space-y-3">
        <div class="rounded-3xl bg-[#FBF7EE] p-4 text-[#5E4A3B]">
          <p class="font-semibold">GET /plans</p>
          <pre class="mt-2 whitespace-pre-wrap text-xs text-[#5E4A3B]">{
  "status": 200,
  "body": "pricing plans loaded"
}</pre>
        </div>

        <div class="rounded-3xl bg-[#FBF7EE] p-4 text-[#5E4A3B]">
          <p class="font-semibold">POST /open-payment-link</p>
          <pre class="mt-2 whitespace-pre-wrap text-xs text-[#5E4A3B]">{
  "status": 200,
  "body": "checkout redirection triggered"
}</pre>
        </div>
      </div>
    </div>
  </section>
</template>
