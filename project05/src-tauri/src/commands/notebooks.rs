use tauri::{State, WebviewWindow};

use super::require_main_window;
use crate::db::repositories::notebooks as repository;
use crate::error::{AppError, AppResult};
use crate::models::Notebook;
use crate::state::AppState;

#[tauri::command]
pub fn list_notebooks(
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Vec<Notebook>> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::list(&connection)
}

#[tauri::command]
pub fn create_notebook(
    name: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Notebook> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::create(&connection, &name)
}

#[tauri::command]
pub fn rename_notebook(
    id: String,
    name: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Notebook> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::rename(&connection, &id, &name)
}

#[tauri::command]
pub fn delete_notebook(
    id: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<()> {
    require_main_window(&window)?;
    let mut connection = state.database.lock().map_err(lock_error)?;
    repository::delete(&mut connection, &id)
}

fn lock_error(
    _: std::sync::PoisonError<std::sync::MutexGuard<'_, rusqlite::Connection>>,
) -> AppError {
    AppError::Setup("The local database lock is unavailable".into())
}
