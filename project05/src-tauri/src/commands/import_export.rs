use std::path::Path;
use tauri::{AppHandle, Emitter, State, WebviewWindow};

use super::require_main_window;
use crate::db::repositories::{notebooks, notes};
use crate::error::{AppError, AppResult};
use crate::models::{ExportedMarkdown, ImportProgress, ImportedMarkdown};
use crate::state::AppState;

const MAX_IMPORT_FILES: usize = 200;
const MAX_NOTE_BYTES: usize = 100_000;

#[tauri::command]
pub async fn import_markdown_files(
    files: Vec<ImportedMarkdown>,
    app: AppHandle,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<usize> {
    require_main_window(&window)?;
    if files.len() > MAX_IMPORT_FILES {
        return Err(AppError::Validation(
            "Import at most 200 Markdown files at a time".into(),
        ));
    }
    for file in &files {
        if !file.filename.to_lowercase().ends_with(".md") {
            return Err(AppError::Validation(
                "Only .md files can be imported".into(),
            ));
        }
        if file.content.len() > MAX_NOTE_BYTES {
            return Err(AppError::Validation(format!(
                "{} is larger than 100 KB",
                file.filename
            )));
        }
    }

    let database = std::sync::Arc::clone(&state.database);
    tauri::async_runtime::spawn_blocking(move || {
        let total = files.len();
        let mut connection = database
            .lock()
            .map_err(|_| AppError::Setup("The local database lock is unavailable".into()))?;
        let transaction = connection.transaction()?;
        for (index, file) in files.into_iter().enumerate() {
            let title = match Path::new(&file.filename)
                .file_stem()
                .and_then(|stem| stem.to_str())
            {
                Some(stem) if !stem.trim().is_empty() => stem,
                _ => "Untitled",
            };
            let title: String = title.chars().take(200).collect();
            notes::create(&transaction, "inbox", &title, &file.content)?;
            let progress = ImportProgress {
                completed: index + 1,
                total,
                filename: file.filename,
            };
            let _ = app.emit_to("main", "import://progress", progress);
        }
        transaction.commit()?;
        Ok(total)
    })
    .await
    .map_err(|error| AppError::Setup(error.to_string()))?
}

#[tauri::command]
pub fn export_markdown(
    note_id: Option<String>,
    notebook_id: Option<String>,
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> AppResult<Vec<ExportedMarkdown>> {
    require_main_window(&window)?;
    let connection = state
        .database
        .lock()
        .map_err(|_| AppError::Setup("The local database lock is unavailable".into()))?;
    let selected = if let Some(id) = note_id {
        let note = notes::get(&connection, &id)?;
        if note.trashed {
            return Err(AppError::Validation(
                "Restore the note before exporting it".into(),
            ));
        }
        vec![note]
    } else if let Some(id) = notebook_id.as_deref() {
        if !notebooks::list(&connection)?
            .iter()
            .any(|notebook| notebook.id == id)
        {
            return Err(AppError::NotFound("Notebook".into()));
        }
        notes::list(&connection, Some(id), false)?
    } else {
        return Err(AppError::Validation(
            "Choose a note or notebook to export".into(),
        ));
    };

    Ok(selected
        .into_iter()
        .map(|note| {
            let stem = safe_filename(&note.title, &note.id);
            ExportedMarkdown {
                filename: format!("{stem}.md"),
                content: format!("# {}\n\n{}\n", note.title, note.body),
            }
        })
        .collect())
}

fn safe_filename(title: &str, id: &str) -> String {
    let stem = title
        .chars()
        .filter(|character| character.is_alphanumeric() || *character == ' ' || *character == '-')
        .collect::<String>()
        .trim()
        .replace(' ', "-")
        .to_lowercase();
    let suffix = id.chars().take(8).collect::<String>();
    if stem.is_empty() {
        format!("note-{suffix}")
    } else {
        format!("{stem}-{suffix}")
    }
}
