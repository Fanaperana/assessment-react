# FocusNotes architecture

## Data and IPC (A, B)

React renders the workspace; it never executes SQL. `src/types.ts` defines the IPC
models and `src/lib/api.ts` is the only module importing `invoke`. Commands validate
the calling window and delegate to repositories. Errors cross IPC as readable strings
through one serializable `AppError` enum.

`AppState` shares one `Arc<Mutex<rusqlite::Connection>>`. For a local notes app,
serialized database operations are simpler than a pool and keep transactions predictable.
The `Arc` lets imports move into `spawn_blocking` without borrowing Tauri state across
an await. Imports validate every file first, then commit all notes in one transaction;
`import://progress` events report processing progress. A failed import rolls back.

The database is `app.path().app_data_dir()/focusnotes.sqlite`. Foreign keys are enabled.
Startup migrations and `PRAGMA user_version` changes share one transaction; newer
unsupported versions fail safely. Notebook deletion moves notes to Inbox. Emptying
trash removes associated tags and FTS entries through cascades and triggers.

## Editing and search (C, D)

SQLite FTS5 indexes title and body, maintained by insert/update/delete triggers.
Search tokenizes user input into quoted prefix terms, uses `bm25` ranking and excludes
trash. Snippets use `<mark>` delimiters; React parses these as text and explicit mark
elements, never as HTML. Search spans all notebooks, with a 180ms debounce, tag
filtering and arrow/Enter navigation.

`useAutosave` keeps dirty drafts by note ID and serializes writes. After 500ms without
typing it saves the latest text. A draft edited during a save remains dirty. Failed
writes remain pending and are retried before navigation. Selecting notes, changing
notebooks, importing, exporting, closing and quitting all await pending writes.
The close handler hides the window only after a successful save. Tray Quit requests
the same flush before `quit_app` exits. Listeners and debounce timers have cleanup.
As with any process, forced termination or an OS crash cannot run a close handler.

The last selected note is persisted locally; its notebook is recovered on startup.
The official window-state plugin restores native size, position and maximized state.
CSS resize handles resize the sidebar, list and editor panes. The sidebar can collapse.
The theme follows OS changes until the user chooses an explicit override.

## Desktop and timer (E, F)

Native File/Edit/View/Help menus emit actions to the main window, reusing button
handlers. Native accelerators avoid duplicate web keyboard handling. The global
Ctrl+Shift+Space shortcut creates or focuses an always-on-top quick-capture window.
Enter saves to Inbox; Shift+Enter inserts a line; Escape cancels. Captures notify
the main window to refresh.

Rust owns the timer, using a Tokio background task and a monotonic deadline instead
of subtracting one second per callback. A generation counter invalidates old tasks
after stop/restart. `timer://tick` events update the UI, tray title and tooltip.
The tooltip provides the remaining time on platforms that do not display tray titles.
Focus and break completions are recorded in SQLite; daily counts use the local date.
The notification plugin sends a native notification when a session finishes.

## Permissions (G)

`build.rs` declares application commands for Tauri's ACL. Main and capture capabilities
grant disjoint command sets. Capture can only create an Inbox note and close itself:
it has no library read, file, dialog or timer permission. Rust also checks window labels.
Main has only event subscriptions, hide, file dialogs, and text-file read/write.
No wildcard file scope is configured: native dialogs dynamically authorize selected
paths, including the explicitly selected recursive export directory.

The production CSP has no external network access or remote fonts. Development adds
only the local Vite connection. Markdown skips raw HTML and uses the renderer's safe
URL handling. Unused opener and frontend shortcut/notification permissions are absent.

## Verification (H, Q)

Repository tests use fresh in-memory SQLite databases. Timer tests advance an injected
`Instant`, without real delays. Vitest tests use Tauri `mockIPC` and exercise three
components plus autosave races, failure retry, debounce and cleanup. The existing
repository CI installs Linux Tauri dependencies and runs build, tests, fmt, Clippy
and Rust tests. `npm test` also runs lint and Prettier before Vitest.

Optional bonuses X1–X5 are outside the required implementation. Signed updates need
release signing keys; no dummy keys or passwords are included.
