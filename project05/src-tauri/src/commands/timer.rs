use tauri::{AppHandle, State, WebviewWindow};

use super::require_main_window;
use crate::error::AppResult;
use crate::models::{TimerMode, TimerSnapshot};
use crate::state::AppState;

#[tauri::command]
pub async fn get_timer_state(
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<TimerSnapshot> {
    require_main_window(&window)?;
    Ok(state.timer.snapshot().await)
}

#[tauri::command]
pub async fn start_timer(
    mode: TimerMode,
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<TimerSnapshot> {
    require_main_window(&window)?;
    Ok(state.timer.start(app, mode).await)
}

#[tauri::command]
pub async fn stop_timer(
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<TimerSnapshot> {
    require_main_window(&window)?;
    Ok(state.timer.stop(&app).await)
}
