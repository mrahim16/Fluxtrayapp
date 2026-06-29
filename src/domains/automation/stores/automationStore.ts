import { defineStore } from "pinia";
import { ref } from "vue";

import { automationService } from "../application/automationService";
import type { AutomationResult, AutomationStatus } from "../types/automation";

const TOTAL_STEPS = 7;
const STEP_REVEAL_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useAutomationStore = defineStore("automation", () => {
  const status = ref<AutomationStatus>("idle");
  const result = ref<AutomationResult | null>(null);
  const errorMessage = ref<string>("");
  const completedCount = ref<number>(0);

  async function runAutomation(): Promise<void> {
    status.value = "running";
    errorMessage.value = "";
    result.value = null;
    completedCount.value = 1;

    let invokeSettled = false;
    let invokeError: unknown = null;
    let invokeResult: AutomationResult | null = null;

    const invokePromise = automationService
      .runAutomation()
      .then((value) => {
        invokeResult = value;
      })
      .catch((error) => {
        invokeError = error;
      })
      .finally(() => {
        invokeSettled = true;
      });

    for (let index = completedCount.value; index < TOTAL_STEPS - 1; index += 1) {
      await delay(STEP_REVEAL_DELAY_MS);
      if (invokeSettled && invokeError) break;
      completedCount.value = index + 1;
    }

    await invokePromise;

    if (invokeError) {
      status.value = "error";
      errorMessage.value = invokeError instanceof Error ? invokeError.message : String(invokeError);
      return;
    }

    result.value = invokeResult;
    completedCount.value = TOTAL_STEPS;
    status.value = "success";
  }

  function reset(): void {
    status.value = "idle";
    result.value = null;
    errorMessage.value = "";
    completedCount.value = 0;
  }

  return {
    status,
    result,
    errorMessage,
    completedCount,
    runAutomation,
    reset,
  };
});
