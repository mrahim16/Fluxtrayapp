<script setup lang="ts">
import { onMounted } from "vue";

import { useThemeStore } from "@/shared/stores/themeStore";

const themeStore = useThemeStore();

onMounted((): void => {
  themeStore.initializeTheme();
});
</script>

<template>
  <RouterView />
</template>