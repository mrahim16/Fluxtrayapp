<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

import { useAutomationStore } from "@/domains/automation/stores/automationStore";
import { themeClasses } from "@/shared/theme/themeClasses";

type StepState = "pending" | "active" | "done" | "failed";

const { t } = useI18n();
const automationStore = useAutomationStore();

const { status, result, errorMessage, completedCount } = storeToRefs(automationStore);

const steps = [
  { key: "app", label: "automation.steps.app" },
  { key: "playwright", label: "automation.steps.playwright" },
  { key: "chrome", label: "automation.steps.chrome" },
  { key: "visit", label: "automation.steps.visit" },
  { key: "download", label: "automation.steps.download" },
  { key: "returnSuccess", label: "automation.steps.returnSuccess" },
];

function stepState(index: number): StepState {
  if (status.value === "idle") return "pending";

  if (status.value === "error") {
    if (index < completedCount.value) return "done";
    if (index === completedCount.value) return "failed";
    return "pending";
  }

  // running or success
  if (index < completedCount.value) return "done";
  if (index === completedCount.value && status.value === "running") return "active";
  return "pending";
}

async function handleRun(): Promise<void> {
  await automationStore.runAutomation();
}
</script>

<template>
  <div class="space-y-6">
    <div :class="themeClasses.card" class="rounded-2xl p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-lg font-semibold">
            {{ t("automation.title") }}
          </h3>

          <p class="mt-1 text-sm text-slate-500">
            {{ t("automation.subtitle") }}
          </p>
        </div>

        <button
          :class="themeClasses.primaryButton"
          class="rounded-xl px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="status === 'running'"
          @click="handleRun"
        >
          {{ status === "running" ? t("automation.running") : t("automation.run") }}
        </button>
      </div>

      <!-- Flow diagram -->
      <div class="mt-8 flex flex-col gap-3">
        <div v-for="(step, index) in steps" :key="step.key" class="flex items-center gap-4">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all"
            :class="{
              'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500':
                stepState(index) === 'pending',
              'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-500':
                stepState(index) === 'active',
              'bg-emerald-600 text-white': stepState(index) === 'done',
              'bg-red-500 text-white': stepState(index) === 'failed',
            }"
          >
            <span v-if="stepState(index) === 'done'">✓</span>
            <span v-else-if="stepState(index) === 'failed'">✕</span>
            <span v-else-if="stepState(index) === 'active'" class="inline-block animate-spin">⟳</span>
            <span v-else>{{ index + 1 }}</span>
          </div>

          <div
            class="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all"
            :class="{
              'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400':
                stepState(index) !== 'active',
              'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 ring-1 ring-emerald-200 dark:ring-emerald-800':
                stepState(index) === 'active',
            }"
          >
            {{ t(step.label) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Success result -->
    <div v-if="status === 'success' && result" :class="themeClasses.card" class="rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-medium text-emerald-600">
        {{ t("automation.successTitle") }}
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        {{ result.message }}
      </p>

      <dl class="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt class="font-semibold text-slate-500">
            {{ t("automation.downloadedFile") }}
          </dt>

          <dd class="mt-1 break-all font-mono text-slate-700 dark:text-slate-200">
            {{ result.filePath }}
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-slate-500">
            {{ t("automation.duration") }}
          </dt>

          <dd class="mt-1 text-slate-700 dark:text-slate-200">{{ result.durationMs }} ms</dd>
        </div>
      </dl>
    </div>

    <!-- Error result -->
    <div v-if="status === 'error'" :class="themeClasses.card" class="rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-medium text-red-500">
        {{ t("automation.errorTitle") }}
      </h3>

      <p class="mt-2 text-sm text-slate-500">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}
</style>