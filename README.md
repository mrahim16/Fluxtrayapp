# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
# fluxTray

## Automation domain

The `automation` domain adds a "Run Automation" page that drives a real
Chrome browser through Playwright:

```
Vue + Tauri
  -> Click "Run Automation"
  -> Playwright starts
  -> Chrome opens
  -> Visit website
  -> Download sample PDF
  -> Return Success
  -> Show Success in UI
```

How it works end to end:

- The Vue button calls `automationStore.runAutomation()`, which calls
  `automationService.runAutomation()`, which invokes the Tauri command
  `run_automation` (`src-tauri/src/automation.rs`).
- That Rust command shells out to `node playwright/automation.js`, since
  Playwright is a Node.js library and there's no equivalent way to drive a
  real Chrome browser from pure Rust.
- The Node script (`playwright/automation.js`) launches Chrome, visits a
  small public sample PDF, saves it to `playwright/downloads/sample.pdf`,
  and prints the result as JSON on stdout.
- Rust reads that JSON, returns an `AutomationResult` back to the frontend,
  and the UI shows the success (or error) state.

### One-time setup

```bash
npm install
npm run playwright:install   # downloads the Chromium browser Playwright drives
```

Node.js must also be installed and on your `PATH`, since the Tauri command
launches the automation script with `node`.

### Run it

```bash
npm run tauri dev
```

Sign in, open the **Automation** tab in the sidebar, and click **Run
Automation**. A Chrome window will open, visit the sample PDF, download it,
and close again, while the UI shows each step completing.

## Docker

The project includes a Dockerfile to build and serve the frontend as a
static container. This does not build the Tauri desktop bundle.

Build the container:

```bash
docker build -t fluxbooks-frontend .
```

Run the container:

```bash
docker run --rm -p 8080:80 fluxbooks-frontend
```

Then open `http://localhost:8080` in your browser.

### Notes

- The Docker container only serves the compiled frontend.
- The Tauri desktop app must still be run locally with `npm run tauri dev` or
  a separate native build.
- If you want a containerized Playwright test environment, add a second
  service with Node, Playwright, and a browser-capable image instead of the
  frontend-only Dockerfile.

# Fluxtrayapp
