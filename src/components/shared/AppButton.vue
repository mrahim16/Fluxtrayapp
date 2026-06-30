<script setup lang="ts">
import { computed } from "vue";
import { defineProps } from "vue";

const props = defineProps({
  variant: {
    type: String as () => "primary" | "secondary" | "ghost" | "glass",
    default: "primary",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as () => "button" | "submit" | "reset",
    default: "button",
  },
});

const buttonClass = computed(() => {
  const base = "inline-flex h-12 items-center justify-center rounded-2xl px-5 font-semibold transition duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40";
  const variants = {
    primary: "bg-[#2C1A11] text-white shadow-md shadow-[#2C1A11]/10 hover:bg-[#3f2a1f]",
    secondary: "bg-[#F5F2EB] text-[#2C1A11] border border-[#D4AF37]/30 hover:bg-[#faf6ef]",
    ghost: "bg-transparent text-[#2C1A11] hover:bg-[#F5F2EB]",
    glass: "bg-white/70 text-[#2C1A11] backdrop-blur-md border border-white/60 shadow-sm hover:bg-white",
  } as const;

  return `${base} ${variants[props.variant]}`;
});
</script>

<template>
  <button :class="buttonClass" :disabled="isLoading" :type="type">
    <span v-if="isLoading" class="mr-2">⏳</span>
    <slot />
  </button>
</template>
