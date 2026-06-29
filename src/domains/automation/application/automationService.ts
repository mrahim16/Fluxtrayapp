import { invoke, isTauri } from "@tauri-apps/api/core";

import type { AutomationResult } from "../types/automation";

async function runViaBrowserFallback(): Promise<AutomationResult> {
  const response = await fetch("/api/automation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Browser automation failed.");
  }

  return (await response.json()) as AutomationResult;
}

export class AutomationService {
  /**
   * Triggers the Playwright automation flow. It prefers the Tauri backend when
   * running in the desktop app and falls back to a local automation server for
   * the web preview.
   */
  async runAutomation(): Promise<AutomationResult> {
    if (isTauri()) {
      try {
        return await invoke<AutomationResult>("run_automation");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("Falling back to browser automation because Tauri invoke failed:", message);
      }
    }

    try {
      return await runViaBrowserFallback();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Automation service error: ${message}`);
    }
  }
}

export const automationService = new AutomationService();
