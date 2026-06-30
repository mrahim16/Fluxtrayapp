<script setup lang="ts">
import type { PropType } from "vue";
import { defineProps, computed } from "vue";

const props = defineProps({
  logs: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const recentLogs = computed(() => props.logs.slice(0, 6));
</script>

<template>
  <section class="rounded-3xl bg-[#0F172A] p-6 shadow-xl shadow-slate-900/20 text-slate-100">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Tech terminal</p>
        <h2 class="mt-2 text-xl font-semibold text-white">Developer output</h2>
      </div>
      <span class="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Live</span>
    </div>

    <div class="space-y-2 font-mono text-sm leading-6">
      <p class="text-[#A8B8D6]">$ fluxbooks billing engine</p>
      <p class="text-[#A8B8D6]">$ npm run billing:status</p>
      <div class="space-y-2">
        <p v-for="log in recentLogs" :key="log" class="text-[#E2E8F0]">
          {{ log }}
        </p>
      </div>
    </div>
  </section>
</template>
