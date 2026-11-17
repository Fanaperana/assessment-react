# Project 05 — FocusNotes

## Requirement checklist

- [x] A — Rust modules, serializable errors, shared connection, versioned migrations,
      database in the application-data directory.
- [x] B — Required commands, typed frontend API, camelCase models, blocking import
      worker and progress events.
- [x] C — FTS5 ranking and highlighted snippets, debounced global search and keyboard navigation.
- [x] D — Markdown editor/preview, resizable panes, collapsible sidebar, 500ms autosave,
      shortcuts and OS theme support.
- [x] E — Native menus, tray, capture shortcut, scoped file dialogs and window-state restoration implemented.
- [x] F — Rust focus/break timer, tick events, notifications and daily persisted counts implemented.
- [x] G — Per-window command capabilities, strict CSP, safe Markdown, user-selected file scopes.
- [ ] H — Tests written and CI configured; Rust execution awaits a working native toolchain or CI result.
- [ ] Actual desktop GIF/MP4 and native acceptance checks.
- [ ] Optional bonuses X1–X5 (not claimed).

## Checks

- [x] `npm run build`
- [x] `npm test`: ESLint, Prettier and **25 frontend tests** pass.
- [x] `cargo fmt --check`
- [ ] `cargo clippy --all-targets -- -D warnings`
- [ ] `cargo test`: **33 Rust tests** written; execution pending.
- [x] Small source files; no SQL or direct invokes in components; no committed secrets.
- [ ] No errors in the running native app console (requires desktop verification).

Local Rust compilation currently stops in the Windows toolchain before compiling
application code: the incomplete Windows SDK is missing `kernel32.lib`. The C++
workload/SDK installation is in progress. The draft PR must remain a draft until
Rust checks and native acceptance checks have completed.

## Architecture and decision

See [ARCHITECTURE.md](ARCHITECTURE.md). One `Arc<Mutex<Connection>>` serializes the
small offline SQLite workload and supports transactional imports in a blocking
worker. This keeps state and transactions simpler than introducing a connection
pool for a single-user notes database.

Drafts are saved through a serialized queue so delayed IPC responses cannot replace
newer edits. Navigation, close and Quit flush the queue, and save errors keep drafts
available for retry. FTS snippets are rendered as text plus mark elements, avoiding
HTML injection. Capture has a separate, minimal ACL.

## Desktop demo

Follow [MANUAL-CHECKS.md](MANUAL-CHECKS.md) and attach a recording of the actual
desktop app. Native functionality cannot be demonstrated by a browser mock.
