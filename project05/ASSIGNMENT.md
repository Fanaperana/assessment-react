# Project 05 — FocusNotes 🗒️ (Tauri v2 + React)

Build **FocusNotes**, a fast, offline **desktop** notes app with a focus timer, using **Tauri v2**, **Rust** and **React**.

This project teaches desktop development: a Rust back end that talks to the React UI through commands and events, a local SQLite database, native menus, a system tray, global shortcuts, file dialogs, and Tauri's **security model** (capabilities and permissions).

- **Level:** Advanced (new language: Rust)
- **Suggested time:** 4 weeks
- **Before you start:** install the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS (Rust, WebView2 on Windows, `webkit2gtk` on Linux). Read the Rust Book chapters 1–9 if Rust is new for you.

---

## 1. What you are building

A user can:

1. Create notebooks and notes (Markdown). The note list and the editor are side by side.
2. Edit a note with a live Markdown preview. Changes **auto-save**.
3. Add tags to notes and filter by tag.
4. Search all notes instantly (full-text search).
5. Pin notes, move them to the trash, restore them, and empty the trash.
6. Press a **global shortcut** (for example `Ctrl+Shift+Space`) anywhere in the OS to open a small **quick-capture** window.
7. Start a **focus timer** (25 / 5 minutes) from the app or from the **system tray**. The tray icon shows the remaining time. A native notification appears when a session ends.
8. Export a note or a notebook as `.md` files, and import `.md` files, with native file dialogs.
9. Reopen the app with the same window size, position and last open note.

---

## 2. Rules

- ✅ Tauri **v2**, Rust (stable), React 19 + TypeScript + Vite (already set up).
- ✅ The **database lives in Rust**: use `rusqlite` (with the `bundled` feature) or `sqlx` with SQLite. The React side never runs SQL.
- ✅ Official Tauri plugins are allowed: `dialog`, `fs`, `global-shortcut`, `notification`, `window-state`, `store`, `opener`, `updater`, `log`.
- ✅ Any React UI library is allowed (shadcn/ui recommended). A Markdown renderer is allowed (`react-markdown` + `remark-gfm`).
- ❌ No `tauri-plugin-sql` (you must write the Rust data layer yourself).
- ❌ No `unwrap()` / `expect()` in command code paths. Return `Result<T, AppError>`.
- ❌ Do not enable permissions you do not use. Do not allow the whole file system (`fs:default` with scoped paths only).

---

## 3. Requirements

### Part A — Rust back end

- **A1** Organise the Rust code in modules: `commands/`, `db/` (connection, migrations, repositories), `models.rs`, `error.rs`, `timer.rs`.
- **A2** One `AppError` enum (`thiserror`) that implements `serde::Serialize`, so the UI receives clear error messages.
- **A3** Shared state with `tauri::State` (for example `Mutex<Connection>` or a connection pool). Explain your choice in the PR.
- **A4** Database migrations run at start-up and are versioned (a `schema_version` table or `PRAGMA user_version`).
- **A5** The database file lives in the app data directory (`app.path().app_data_dir()`), never next to the executable.

### Part B — Commands and the IPC layer

- **B1** Commands: `list_notebooks`, `create_notebook`, `rename_notebook`, `delete_notebook`, `list_notes`, `get_note`, `create_note`, `update_note`, `trash_note`, `restore_note`, `empty_trash`, `search_notes`, `list_tags`, `set_note_tags`.
- **B2** On the React side, wrap every command in a typed function in `src/lib/api.ts`. Components never call `invoke` directly.
- **B3** Use `serde` with `#[serde(rename_all = "camelCase")]` so Rust and TypeScript types match. Keep the TS types in one file.
- **B4** Long work (import of many files) runs in an async command and reports progress with **events** (`app.emit` / `listen`).

### Part C — Search

- **C1** Full-text search with SQLite **FTS5** (title + body), with ranking and highlighted snippets.
- **C2** The search box is debounced, and the result list is keyboard-navigable (↑ ↓ Enter).

### Part D — Editor and UI

- **D1** Note list + editor + preview layout, resizable panes, collapsible sidebar.
- **D2** Auto-save 500 ms after the last keystroke. Show "Saving… / Saved". Never lose text when the app closes (save on window close too).
- **D3** Keyboard shortcuts inside the app: `Ctrl+N` new note, `Ctrl+F` search, `Ctrl+P` toggle preview, `Ctrl+Backspace` trash.
- **D4** Light / dark theme that follows the OS.

### Part E — Native features

- **E1** Native **menu** (File, Edit, View, Help) with accelerators. Menu actions call the same code as the buttons.
- **E2** **System tray** icon with a menu: Show/Hide window, Start/Stop focus timer, Quit. Closing the main window hides it to the tray.
- **E3** **Global shortcut** opens a second, small **quick-capture window** (always on top). Enter saves the note to an "Inbox" notebook and closes the window.
- **E4** Native **file dialogs** for import / export.
- **E5** **Window state** is restored (size, position, maximized).

### Part F — Focus timer

- **F1** The timer runs in **Rust** (a background task with `tokio`), not in a React `setInterval`, so it keeps running when the window is hidden.
- **F2** Rust sends a `timer://tick` event every second. The UI and the tray title update from it.
- **F3** A native notification when a focus or break session ends. A daily count of finished sessions is stored in the database.

### Part G — Security

- **G1** Capabilities in `src-tauri/capabilities/` give each window only the permissions it needs (the quick-capture window cannot read files, for example).
- **G2** A strict **CSP** in `tauri.conf.json`. Markdown preview never renders raw HTML (no XSS from a note).
- **G3** File system access is scoped to the paths the user picks.

### Part H — Testing and CI

- **H1** Rust unit tests for the repositories (use an in-memory SQLite database) and for the timer logic.
- **H2** Front-end tests with Vitest and **`mockIPC`** from `@tauri-apps/api/mocks` for at least three components.
- **H3** `cargo fmt --check`, `cargo clippy -- -D warnings` and `cargo test` pass (CI runs them).
- **H4** At least **20** Rust tests and **15** front-end tests.

---

## 4. Bonus (up to +15)

- **X1** Build installers for Windows / macOS / Linux in GitHub Actions (`tauri-apps/tauri-action`) and attach them to a GitHub Release.
- **X2** Auto-update with the `updater` plugin (signed updates).
- **X3** Sync a notebook to a folder of `.md` files and watch the folder for changes (`notify` crate).
- **X4** Encrypt a notebook with a password (`argon2` + `chacha20poly1305`).
- **X5** Mobile: run the app on Android or iOS with Tauri v2 mobile.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Rust architecture, errors, state, migrations | 15 |
| B — Commands, typed IPC, events | 15 |
| C — FTS5 search | 10 |
| D — Editor, auto-save, shortcuts | 10 |
| E — Menu, tray, global shortcut, dialogs, window state | 15 |
| F — Rust focus timer with events | 10 |
| G — Security (capabilities, CSP, scopes) | 10 |
| H — Tests and CI | 10 |
| Code quality (clippy, fmt, Q1–Q5) | 5 |

Passing grade: 70. Add a short screen recording (GIF or MP4) of the app to the PR. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
