import { Ref } from "vue";

export type AutomationStatus = "idle" | "running" | "success" | "error";

export interface AutomationResult {
  success: boolean;
  message: string;
  filePath: string;
  durationMs: number;
  completedCount: number;
}

export interface AutomationStore {
  status: Ref<AutomationStatus>;
  result: Ref<AutomationResult | null>;
  errorMessage: string;
  completedCount: number;
}