# Desktop acceptance checks

Run `npm run tauri dev` on a machine with Rust and the Tauri OS prerequisites.
These checks cover native behavior that browser mocks cannot verify.

1. Create and rename a notebook. Create two notes, edit the title/body and wait for
   Saved. Type again and switch notes immediately; verify the draft is saved.
2. Close while typing. Reopen from the tray and verify the text. Repeat using tray
   Quit, then launch again. Simulate an IPC save failure and verify the window stays open.
3. Add tags, filter by tag, pin notes, trash/restore them, then empty trash.
   Delete a notebook and verify its notes move to Inbox.
4. Search a word from a different notebook. Check highlighted snippets and ranking;
   navigate with arrows and Enter and edit the selected result.
5. Test Ctrl+N, Ctrl+F, Ctrl+P and Ctrl+Backspace, plus their native menu actions.
   Confirm each shortcut executes once. Resize panes and collapse the sidebar.
6. Change the OS light/dark setting before using the manual theme toggle.
7. Press Ctrl+Shift+Space from another application. Enter saves once to Inbox and
   closes capture; Shift+Enter adds a newline and Escape cancels.
8. Import multiple `.md` files and inspect progress. Cancel a dialog. Export a note
   to a file and a notebook to a directory; verify each note has a distinct filename.
9. Start/stop the 25-minute focus and 5-minute break timers from the app and tray.
   Hide the window, verify the tray tooltip keeps updating, and wait for a completion
   notification and a persisted daily focus count. Breaks must not increase it.
10. Resize/move/maximize the window and restart; verify the window state and last note.
11. Paste `<script>alert(1)</script>` and a `javascript:` Markdown link into a note;
    verify neither executes. From capture, attempt `list_notes` or a file command
    in devtools; the capability must deny the request.

Record a short GIF/MP4 of the actual desktop app showing editing, search, capture,
tray behavior and import/export, then attach it to the PR. A browser preview is not
evidence of native integrations.
