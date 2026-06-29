use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

use serde::Serialize;
use tauri::Manager;

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

fn find_first_existing_path(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|path| path.exists()).cloned()
}

fn find_working_directory(script_path: &Path) -> Option<PathBuf> {
    let mut current_dir = script_path.parent()?;

    loop {
        if current_dir.join("package.json").exists() || current_dir.join("node_modules").exists() {
            return Some(current_dir.to_path_buf());
        }

        if let Some(parent) = current_dir.parent() {
            current_dir = parent;
        } else {
            break;
        }
    }

    None
}

fn resolve_automation_script_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();

    if let Ok(script_path) = std::env::var("PLAYWRIGHT_AUTOMATION_SCRIPT") {
        candidates.push(PathBuf::from(script_path));
    }

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("playwright").join("automation.ts"));
        candidates.push(resource_dir.join("automation.ts"));
    }

    candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("playwright")
        .join("automation.ts"));
    candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("playwright")
        .join("automation.ts"));
    candidates.push(PathBuf::from(".").join("playwright").join("automation.ts"));

    find_first_existing_path(&candidates).ok_or_else(|| {
        format!(
            "Playwright automation script not found. Checked: {}",
            candidates
                .iter()
                .map(|path| path.display().to_string())
                .collect::<Vec<_>>()
                .join(", ")
        )
    })
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
pub fn run_automation(app: tauri::AppHandle) -> Result<AutomationResult, String> {
    let started_at = Instant::now();

    let script_path = resolve_automation_script_path(&app)?;
    let mut command = Command::new("npx");

    command.arg("tsx").arg(&script_path);

    if let Some(working_dir) = find_working_directory(&script_path) {
        command.current_dir(working_dir);
    }

    let output = command.output().map_err(|error| {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_existing_path_from_candidates() {
        let temp_dir = std::env::temp_dir().join(format!(
            "fluxbooks-automation-test-{}",
            std::process::id()
        ));
        let script_path = temp_dir.join("playwright").join("automation.ts");
        std::fs::create_dir_all(script_path.parent().unwrap()).unwrap();
        std::fs::write(&script_path, "test").unwrap();

        let candidate = find_first_existing_path(&[script_path.clone(), PathBuf::from("/does/not/exist")])
            .expect("expected existing candidate to be found");

        assert_eq!(candidate, script_path);

        let _ = std::fs::remove_dir_all(temp_dir);
    }
}
