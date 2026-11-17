# FocusNotes — Project 05

Offline Markdown notebooks built with Tauri v2, Rust, SQLite FTS5 and React 19.

## Run

Install Node 24 LTS, stable Rust and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).
On Windows this includes WebView2 and Visual Studio Build Tools with **Desktop
development with C++**, MSVC and a Windows SDK. Installing Rust alone is insufficient.

```sh
npm ci
npm run tauri dev
```

Use `npm run tauri build` to build a native installer. `npm run dev` starts only the
frontend; database and native features require the Tauri desktop runtime.

## Use

- Create notebooks with **+**; rename/delete controls appear next to custom notebooks.
  Inbox is permanent. Deleting a notebook moves its notes to Inbox.
- Notes save after 500ms without typing. Navigation, close and Quit await pending
  saves. Closing hides the app to the tray; **Quit** exits after saving.
- Search across notebooks, use arrows/Enter to select results, and filter by tag.
  Tags are comma separated and saved when the field loses focus.
- Resize panes using their lower-right resize handles; toggle the sidebar in the toolbar.
- Use the toolbar for pin/trash/restore, preview, theme, Markdown import/export,
  and the focus/break timer. Export notebook selects an output directory.
- Ctrl+N creates a note, Ctrl+F focuses search, Ctrl+P toggles preview and
  Ctrl+Backspace trashes the selected note (Command on macOS).
- Ctrl+Shift+Space opens capture globally. Enter saves to Inbox, Shift+Enter adds a
  newline and Escape cancels. Capture stays above other windows.
- The timer continues while hidden. Its tray tooltip shows remaining time; session
  completion sends a native notification. Only focus sessions increase the daily count.

Data stays in the OS application-data directory under the app identifier
`com.fanap.focusnotes`, in `focusnotes.sqlite`. The last note/theme are stored locally;
native window state is managed by the official window-state plugin.

## Checks

```sh
npm test                     # ESLint, Prettier and Vitest
npm run build
cd src-tauri
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

If Windows cannot find `link.exe`, use a Visual Studio Developer PowerShell after
completing the C++ workload and SDK installation. The root repository already has
`.github/workflows/ci-project05.yml` for frontend and Rust checks.

See [architecture and design choices](docs/ARCHITECTURE.md),
[desktop acceptance checks](docs/MANUAL-CHECKS.md), and
[the assignment](ASSIGNMENT.md). Optional bonuses are not claimed.
