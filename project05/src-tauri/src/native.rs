use crate::state::AppState;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager};

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Show / Hide FocusNotes", true, None::<&str>)?;
    let timer = MenuItem::with_id(app, "timer", "Start / Stop timer", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&show, &timer, &PredefinedMenuItem::separator(app)?, &quit],
    )?;
    TrayIconBuilder::with_id("focusnotes")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.close();
                    } else {
                        show_main(app);
                    }
                }
            }
            "timer" => toggle_timer(app),
            "quit" => {
                show_main(app);
                let _ = app.emit_to("main", "lifecycle://quit", ());
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main(tray.app_handle());
            }
        })
        .icon(tauri::include_image!("icons/32x32.png"))
        .build(app)?;
    Ok(())
}

pub fn create_menu(app: &AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let new_note = MenuItem::with_id(app, "new-note", "New note", true, Some("CmdOrCtrl+N"))?;
    let import = MenuItem::with_id(app, "import", "Import Markdown…", true, None::<&str>)?;
    let export = MenuItem::with_id(app, "export", "Export Markdown…", true, None::<&str>)?;
    let export_notebook = MenuItem::with_id(
        app,
        "export-notebook",
        "Export notebook…",
        true,
        None::<&str>,
    )?;
    let file = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &new_note,
            &import,
            &export,
            &export_notebook,
            &PredefinedMenuItem::separator(app)?,
        ],
    )?;
    let find = MenuItem::with_id(app, "search", "Search notes", true, Some("CmdOrCtrl+F"))?;
    let trash = MenuItem::with_id(
        app,
        "trash",
        "Move note to Trash",
        true,
        Some("CmdOrCtrl+Backspace"),
    )?;
    let edit = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, None)?,
            &PredefinedMenuItem::redo(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &find,
            &trash,
        ],
    )?;
    let preview = MenuItem::with_id(app, "preview", "Toggle Preview", true, Some("CmdOrCtrl+P"))?;
    let view = Submenu::with_items(
        app,
        "View",
        true,
        &[&preview, &PredefinedMenuItem::fullscreen(app, None)?],
    )?;
    let about = MenuItem::with_id(app, "about", "About FocusNotes", true, None::<&str>)?;
    let help = Submenu::with_items(app, "Help", true, &[&about])?;
    Menu::with_items(app, &[&file, &edit, &view, &help])
}

fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn toggle_timer(app: &AppHandle) {
    if let Some(state) = app.try_state::<AppState>() {
        let timer = state.timer.clone();
        let handle = app.clone();
        tauri::async_runtime::spawn(async move {
            timer.toggle(handle).await;
        });
    }
}

pub fn open_quick_capture(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("quick-capture") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }
    let _ = tauri::WebviewWindowBuilder::new(
        app,
        "quick-capture",
        tauri::WebviewUrl::App("index.html?quickCapture=1".into()),
    )
    .title("Quick capture")
    .inner_size(520.0, 360.0)
    .resizable(false)
    .always_on_top(true)
    .center()
    .build();
}
