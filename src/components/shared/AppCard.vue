<script setup lang="ts">
import { computed } from "vue";
import { defineProps } from "vue";

const props = defineProps({
  variant: {
    type: String as () => "default" | "premium-accent" | "glass-panel" | "terminal-shell",
    default: "default",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const panelClasses = computed(() => {
  const base = "rounded-3xl border p-6 shadow-xl transition duration-200 ease-out";
  const variants = {
    default: "bg-[#FDFBF7] border-[#E9DFC9] text-[#2C1A11]",
    "premium-accent": "bg-[#F5F2EB] border-[#D4AF37] shadow-[#D4AF37]/10",
    "glass-panel": "bg-white/50 backdrop-blur-md border border-white/40 shadow-lg shadow-slate-200/30",
    "terminal-shell": "bg-[#0f172a] border border-slate-700 text-slate-100 font-mono",
  } as const;

  return `${base} ${variants[props.variant]} ${props.isActive ? "scale-[1.01] border-[#D4AF37] shadow-[#D4AF37]/20" : ""}`;
});
</script>

<template>
  <section :class="panelClasses">
    <slot />
  </section>
</template>
