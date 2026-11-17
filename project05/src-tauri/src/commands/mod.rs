pub mod import_export;
pub mod notebooks;
pub mod notes;
pub mod timer;

use tauri::WebviewWindow;

use crate::error::{AppError, AppResult};

#[tauri::command]
pub fn quit_app(window: WebviewWindow, app: tauri::AppHandle) -> AppResult<()> {
    require_main_window(&window)?;
    app.exit(0);
    Ok(())
}

pub fn require_main_window(window: &WebviewWindow) -> AppResult<()> {
    if window.label() == "main" {
        return Ok(());
    }
    Err(AppError::Validation(
        "This command is only available in the main window".into(),
    ))
}
