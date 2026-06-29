import { invoke, isTauri } from "@tauri-apps/api/core";

import type { AutomationResult } from "../types/automation";

export class AutomationService {
  /**
   * Triggers the Playwright automation flow in the Tauri desktop app.
   * Desktop automation is not available from a plain browser or static preview.
   */
  async runAutomation(): Promise<AutomationResult> {
    if (!isTauri()) {
      throw new Error(
        "Desktop automation is only supported in the Tauri app. Run the app with `npm run tauri dev` or use the packaged desktop executable."
      );
    }

    try {
      return await invoke<AutomationResult>("run_automation");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Tauri automation invoke failed: ${message}`);
    }
  }
}

export const automationService = new AutomationService();
