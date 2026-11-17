mod native;
use native::{create_menu, create_tray, open_quick_capture};
mod commands;
mod db;
mod error;
mod models;
mod state;
mod timer;
mod timer_logic;

use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::commands::{import_export, notebooks, notes, timer as timer_commands};
use crate::db::connection::open_app_database;
use crate::error::AppResult;
use crate::state::AppState;

fn setup_state(app: &mut tauri::App) -> AppResult<()> {
    let connection = open_app_database(app.handle())?;
    let state = AppState::new(connection)?;
    app.manage(state);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        open_quick_capture(app);
                    }
                })
                .build(),
        )
        .setup(|app| {
            setup_state(app)?;
            create_tray(app.handle())?;
            app.set_menu(create_menu(app.handle())?)?;
            app.global_shortcut()
                .register("CommandOrControl+Shift+Space")?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let action = event.id().as_ref();
            if matches!(
                action,
                "new-note"
                    | "search"
                    | "trash"
                    | "preview"
                    | "import"
                    | "export"
                    | "export-notebook"
                    | "about"
            ) {
                let _ = app.emit_to("main", "menu://action", action);
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::quit_app,
            notebooks::list_notebooks,
            notebooks::create_notebook,
            notebooks::rename_notebook,
            notebooks::delete_notebook,
            notes::list_notes,
            notes::get_note,
            notes::create_note,
            notes::update_note,
            notes::trash_note,
            notes::restore_note,
            notes::empty_trash,
            notes::set_note_pinned,
            notes::set_note_tags,
            notes::list_tags,
            notes::search_notes,
            notes::quick_capture,
            import_export::import_markdown_files,
            import_export::export_markdown,
            timer_commands::get_timer_state,
            timer_commands::start_timer,
            timer_commands::stop_timer,
        ]);

    if let Err(error) = builder.run(tauri::generate_context!()) {
        eprintln!("FocusNotes failed to start: {error}");
    }
}
