use std::path::PathBuf;
use std::process::Command;
use std::time::Instant;

use serde::Serialize;

/// Result returned to the frontend once the Playwright automation run finishes.
///
/// `#[serde(rename_all = "camelCase")]` keeps the JSON shape aligned with the
/// TypeScript `AutomationResult` type on the frontend (filePath, durationMs).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AutomationResult {
    pub success: bool,
    pub message: String,
    pub file_path: String,
    pub duration_ms: u128,
}

/// Runs the bundled Playwright script:
///
/// Playwright starts -> Chrome opens -> Visit website -> Download sample PDF -> Return Success
///
/// Playwright is a Node.js library, so there is no way to drive a real Chrome
/// browser the same way from pure Rust. Instead, this command shells out to a
/// short-lived `node` child process that runs `playwright/automation.js`.
/// Tauri stays in charge of the desktop window/UI; the child process only
/// handles the browser automation step and reports back over stdout.
#[tauri::command]
pub fn run_automation() -> Result<AutomationResult, String> {
    let started_at = Instant::now();

    // The Playwright script lives at the project root, one level above
    // `src-tauri`. `CARGO_MANIFEST_DIR` is resolved at compile time, so this
    // works regardless of the directory the binary happens to be launched
    // from during development.
    let script_path: PathBuf = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("playwright")
        .join("automation.ts");

    if !script_path.exists() {
        return Err(format!(
            "Playwright automation script not found at {}. Run `npm install` from the project root first.",
            script_path.display()
        ));
    }

    let output = Command::new("npx")
        .arg("tsx")
        .arg(&script_path)
        .output()
        .map_err(|error| {
            format!(
                "Failed to start the automation process. Is Node.js installed and on your PATH? ({error})"
            )
        })?;

    let duration_ms = started_at.elapsed().as_millis();

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Automation script exited with an error: {}",
            stderr.trim()
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // The Node script prints a single line of JSON on success: { "filePath": "..." }
    let parsed: serde_json::Value = serde_json::from_str(stdout.trim()).map_err(|error| {
        format!("Could not read automation result ({error}). Raw output: {stdout}")
    })?;

    let file_path = parsed
        .get("filePath")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(AutomationResult {
        success: true,
        message: "Chrome opened the website and the sample PDF was downloaded successfully."
            .to_string(),
        file_path,
        duration_ms,
    })
}
