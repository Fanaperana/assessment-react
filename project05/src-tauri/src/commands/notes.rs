use tauri::{State, WebviewWindow};

use super::require_main_window;
use crate::db::repositories::{notes as repository, search};
use crate::error::{AppError, AppResult};
use crate::models::{Note, SearchResult};
use crate::state::AppState;

#[tauri::command]
pub fn list_notes(
    notebook_id: Option<String>,
    trashed: bool,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Vec<Note>> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::list(&connection, notebook_id.as_deref(), trashed)
}

#[tauri::command]
pub fn get_note(id: String, window: WebviewWindow, state: State<'_, AppState>) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::get(&connection, &id)
}

#[tauri::command]
pub fn create_note(
    notebook_id: String,
    title: String,
    body: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::create(&connection, &notebook_id, &title, &body)
}

#[tauri::command]
pub fn update_note(
    id: String,
    title: String,
    body: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::update(&connection, &id, &title, &body)
}

#[tauri::command]
pub fn trash_note(
    id: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::set_trashed(&connection, &id, true)
}

#[tauri::command]
pub fn restore_note(
    id: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::set_trashed(&connection, &id, false)
}

#[tauri::command]
pub fn empty_trash(window: WebviewWindow, state: State<'_, AppState>) -> AppResult<usize> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::empty_trash(&connection)
}

#[tauri::command]
pub fn set_note_pinned(
    id: String,
    pinned: bool,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    repository::set_pinned(&connection, &id, pinned)
}

#[tauri::command]
pub fn set_note_tags(
    id: String,
    tags: Vec<String>,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    require_main_window(&window)?;
    let mut connection = state.database.lock().map_err(lock_error)?;
    repository::set_tags(&mut connection, &id, &tags)
}

#[tauri::command]
pub fn list_tags(
    notebook_id: Option<String>,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Vec<String>> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    let mut statement = connection.prepare(
        "SELECT DISTINCT t.name FROM tags t
         JOIN note_tags nt ON nt.tag_id = t.id
         JOIN notes n ON n.id = nt.note_id
         WHERE n.trashed = 0 AND (?1 IS NULL OR n.notebook_id = ?1)
         ORDER BY t.name COLLATE NOCASE",
    )?;
    let rows = statement.query_map([notebook_id.as_deref()], |row| row.get(0))?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

#[tauri::command]
pub fn search_notes(
    query: String,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Vec<SearchResult>> {
    require_main_window(&window)?;
    let connection = state.database.lock().map_err(lock_error)?;
    search::search(&connection, &query)
}

#[tauri::command]
pub fn quick_capture(
    body: String,
    app: tauri::AppHandle,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Note> {
    if window.label() != "quick-capture" {
        return Err(AppError::Validation(
            "Only the capture window can save quick notes".into(),
        ));
    }
    if body.trim().is_empty() {
        return Err(AppError::Validation("Enter a note first".into()));
    }
    let mut lines = body.lines();
    let first_line = match lines.next() {
        Some(line) => line.trim(),
        None => "",
    };
    let title = first_line.trim_start_matches('#').trim();
    let title = if title.is_empty() {
        "Quick note"
    } else {
        title
    };
    let title: String = title.chars().take(200).collect();
    let connection = state.database.lock().map_err(lock_error)?;
    let note = repository::create(&connection, "inbox", &title, &body)?;
    drop(connection);
    use tauri::Emitter;
    let _ = app.emit_to("main", "notes://changed", ());
    Ok(note)
}

fn lock_error(
    _: std::sync::PoisonError<std::sync::MutexGuard<'_, rusqlite::Connection>>,
) -> AppError {
    AppError::Setup("The local database lock is unavailable".into())
}
