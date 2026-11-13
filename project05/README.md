# Project 05 — FocusNotes

Tauri v2 + Rust + React 19 + TypeScript + Vite.

👉 **Read [ASSIGNMENT.md](ASSIGNMENT.md) first.** It has the requirements and the grading.

## Get started

```bash
npm install
npm run tauri dev   # opens the desktop window
```

## Checks (CI runs these on every pull request)

```bash
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo clippy --all-targets -- -D warnings
cd src-tauri && cargo test
```

## Notes

- Install the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) first (Rust, and WebView2 on Windows / `webkit2gtk` on Linux).
- The first `tauri dev` compiles many Rust crates and can take a few minutes.
- Recommended Node.js version for all projects: **24 LTS**.

The starter was created with the official CLI. Everything else is your job. 💪
