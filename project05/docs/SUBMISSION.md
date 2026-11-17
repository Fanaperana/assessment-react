## Project

Project 05 — FocusNotes (Tauri v2, Rust, React 19).

## Live demo or video (optional)

Desktop recording is pending. The browser preview below uses mocked IPC and does
not demonstrate the native integrations.

## Requirement checklist

- [x] Part A — Rust back end: modules, serializable errors, shared connection, versioned migrations,
      database in the application-data directory.
- [x] Part B — Commands and the IPC layer: required commands, typed frontend API, camelCase models, blocking import
      worker and progress events.
- [x] Part C — Search: FTS5 ranking and highlighted snippets, debounced global search and keyboard navigation.
- [x] Part D — Editor and UI: Markdown editor/preview, resizable panes, collapsible sidebar, 500ms autosave,
      shortcuts and OS theme support.
- [ ] Part E — Native features: menus, tray, capture shortcut, scoped file dialogs and window-state restoration implemented; desktop verification pending.
- [ ] Part F — Focus timer: Rust timer, tick events, notifications and daily persisted counts implemented; Rust/desktop verification pending.
- [x] Part G — Security: per-window command capabilities, strict CSP, safe Markdown, user-selected file scopes.
- [x] Part H — Testing and CI: 29 frontend tests, 33 Rust tests, and CI checks all pass.
- [ ] Actual desktop GIF/MP4 and native acceptance checks.
- [ ] Bonus: X1–X5 not claimed.

## Checks

- [x] `npm run build`
- [x] `npm test`: ESLint, Prettier and **29 frontend tests** pass.
- [x] `cargo fmt --check`
- [x] CI `cargo clippy --all-targets -- -D warnings`
- [x] CI `cargo test`: **33 Rust tests** pass.
- [x] Small source files; no SQL or direct invokes in components; no committed secrets.
- [ ] No errors in the running native app console (requires desktop verification).
- [x] All README checks pass in CI; local Windows compilation needs the missing Visual C++ runtime library.
- [ ] General rules Q1–Q5 (source formatting and small commits pass; native Windows checks and recording pending).
- [x] Number of tests: **29 frontend tests** and **33 Rust tests** pass.

Local Rust compilation currently stops in the Windows toolchain before compiling
application code: this machine's Visual C++ installation does not provide
`msvcrt.lib`. CI verifies Rust on Linux successfully. Native Windows acceptance
checks and the recording remain to complete before marking the PR ready.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the Rust modules, typed IPC, editor state,
security capabilities and timer. React calls a typed API, commands validate the
calling window, and repositories own all SQL.

## Explain one decision

One `Arc<Mutex<Connection>>` serializes the
small offline SQLite workload and supports transactional imports in a blocking
worker. This keeps state and transactions simpler than introducing a connection
pool for a single-user notes database.

Drafts are saved through a serialized queue so delayed IPC responses cannot replace
newer edits. Navigation, close and Quit flush the queue, and save errors keep drafts
available for retry. FTS snippets are rendered as text plus mark elements, avoiding
HTML injection. Capture has a separate, minimal ACL.

## What was hard? What did you learn?

Autosave needs explicit ordering across IPC requests: debounce alone cannot protect
edits made while an older save is in flight. The implementation retains newer dirty
drafts and flushes writes before navigation, close or Quit. Tests cover those races.
Native behavior and ACL enforcement also need desktop checks beyond browser mocks.

## Screenshots

Browser UI preview with mocked IPC (not a desktop recording):

![FocusNotes browser preview](https://raw.githubusercontent.com/tojobosco12/assessment-react/project05/tojobosco12/project05/docs/browser-preview.png)

Follow [MANUAL-CHECKS.md](MANUAL-CHECKS.md) and attach a recording of the actual
desktop app. Native functionality cannot be demonstrated by a browser mock.
