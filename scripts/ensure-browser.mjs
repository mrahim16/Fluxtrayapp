#!/usr/bin/env node
/**
 * Ensures the browsers needed for Playwright are available before tests
 * run, without ever silently downloading anything.
 *
 * For Chromium-family browsers (chrome/edge), a system install can be used
 * directly via Playwright's `channel` option — no Playwright-managed
 * download needed.
 *
 * Firefox is different: Playwright always drives its own patched Firefox
 * build, so a system Firefox install can't be reused. If it's missing from
 * the Playwright cache, it has to be downloaded via `playwright install`.
 *
 * Order of checks, per browser:
 *   1. Already cached by Playwright? -> use it.
 *   2. (chromium only) System Chrome/Edge installed? -> use via `channel`.
 *   3. Nothing found -> ask the user for explicit confirmation before
 *      running `npx playwright install <browser>`. If they decline, exit
 *      with an explanation instead of failing silently.
 */
import { existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import readline from "node:readline";

// Which browsers this project's playwright.config.ts is set up to use.
const REQUIRED_BROWSERS = ["chromium", "firefox"];

function playwrightCacheDir() {
  const home = homedir();
  switch (platform()) {
    case "darwin":
      return join(home, "Library", "Caches", "ms-playwright");
    case "win32":
      return join(home, "AppData", "Local", "ms-playwright");
    default:
      return join(home, ".cache", "ms-playwright");
  }
}

function hasCachedPlaywrightBrowser(browserName) {
  const dir = playwrightCacheDir();
  if (!existsSync(dir)) return false;
  try {
    const entries = execSync(`ls "${dir}"`).toString();
    return entries.includes(browserName);
  } catch {
    return false;
  }
}

function findSystemChromiumFamilyBrowser() {
  const candidates =
    platform() === "win32"
      ? [
          { name: "chrome", cmd: "where google-chrome" },
          { name: "msedge", cmd: "where msedge" },
        ]
      : platform() === "darwin"
        ? [
            { name: "chrome", path: "/Applications/Google Chrome.app" },
            { name: "msedge", path: "/Applications/Microsoft Edge.app" },
          ]
        : [
            { name: "chrome", cmd: "which google-chrome || which google-chrome-stable" },
            { name: "chromium", cmd: "which chromium || which chromium-browser" },
            { name: "msedge", cmd: "which microsoft-edge" },
          ];

  for (const candidate of candidates) {
    if (candidate.path && existsSync(candidate.path)) return candidate.name;
    if (candidate.cmd) {
      const result = spawnSync(candidate.cmd, { shell: true });
      if (result.status === 0) return candidate.name;
    }
  }
  return null;
}

async function askToInstall(browserName, extraNote = "") {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `No ${browserName} build found for running automated tests.${extraNote}\n` +
        `Install Playwright's bundled ${browserName} now? [y/N] `,
      resolve
    );
  });
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function ensureChromium() {
  if (hasCachedPlaywrightBrowser("chromium")) {
    console.log("[ensure-browser] chromium: using existing Playwright-managed build.");
    return true;
  }

  const systemBrowser = findSystemChromiumFamilyBrowser();
  if (systemBrowser) {
    console.log(
      `[ensure-browser] chromium: found system browser "${systemBrowser}". Set channel: "${systemBrowser}" on the chromium project in playwright.config.ts to use it instead of downloading one.`
    );
    return true;
  }

  const confirmed = await askToInstall("chromium", " (no Playwright cache entry, no system Chrome/Edge detected, ~150MB download)");
  if (!confirmed) {
    console.log("[ensure-browser] chromium: skipped install. Run `npx playwright install chromium` manually when ready.");
    return false;
  }

  console.log("[ensure-browser] Installing Playwright's chromium (user-confirmed)...");
  const result = spawnSync("npx", ["playwright", "install", "chromium"], { stdio: "inherit" });
  return result.status === 0;
}

async function ensureFirefox() {
  if (hasCachedPlaywrightBrowser("firefox")) {
    console.log("[ensure-browser] firefox: using existing Playwright-managed build.");
    return true;
  }

  // Playwright always needs its own Firefox build — a system Firefox
  // install (even if present) cannot be substituted via `channel`.
  const confirmed = await askToInstall(
    "firefox",
    " (Playwright requires its own patched Firefox build; a system Firefox install can't be reused, ~80MB download)"
  );
  if (!confirmed) {
    console.log("[ensure-browser] firefox: skipped install. Run `npx playwright install firefox` manually when ready.");
    return false;
  }

  console.log("[ensure-browser] Installing Playwright's firefox (user-confirmed)...");
  const result = spawnSync("npx", ["playwright", "install", "firefox"], { stdio: "inherit" });
  return result.status === 0;
}

const ENSURE_FN = {
  chromium: ensureChromium,
  firefox: ensureFirefox,
};

async function main() {
  let allOk = true;
  for (const browser of REQUIRED_BROWSERS) {
    const fn = ENSURE_FN[browser];
    if (!fn) continue;
    const ok = await fn();
    allOk = allOk && ok;
  }

  if (!allOk) {
    console.log("[ensure-browser] One or more required browsers are unavailable. Tests using them will fail until installed.");
    process.exit(1);
  }
}

main();
