import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { api } from "../lib/api";
import { useTheme } from "../hooks/useTheme";

export function QuickCapture() {
  useTheme();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await api.quickCapture(body);
      await getCurrentWindow().close();
    } catch (reason) {
      setError(String(reason));
      setBusy(false);
    }
  }
  return (
    <main className="quick-capture">
      <header>
        <span className="brand-icon">✦</span>
        <strong>Quick capture</strong>
        <kbd>ESC</kbd>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <textarea
          autoFocus
          aria-label="Quick note"
          placeholder="Capture a thought…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") void getCurrentWindow().close();
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <footer>
          <span role="status">
            {error || "Enter to save · Shift+Enter for a new line"}
          </span>
          <button disabled={!body.trim() || busy}>Save to Inbox ↵</button>
        </footer>
      </form>
    </main>
  );
}
