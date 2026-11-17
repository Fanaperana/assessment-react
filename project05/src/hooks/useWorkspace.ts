import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { api } from "../lib/api";
import { importFiles, exportFiles } from "../lib/files";
import { useNotes } from "./useNotes";
import { useTheme } from "./useTheme";
import { useNativeEvents } from "./useNativeEvents";
import { useDialog } from "./useDialog";
import type { TimerSnapshot } from "../types";
export function useWorkspace() {
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState<TimerSnapshot | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const notes = useNotes(setMessage);
  const theme = useTheme();
  const dialog = useDialog();
  const run = (action: () => Promise<unknown>) => {
    void action().catch((error) => setMessage(String(error)));
  };
  useEffect(() => {
    void api
      .timerState()
      .then(setTimer)
      .catch((error) => setMessage(String(error)));
  }, []);
  const focusSearch = () =>
    document.querySelector<HTMLInputElement>(".search-field input")?.focus();
  const preview = () =>
    document
      .querySelector<HTMLButtonElement>(
        "[aria-label='Hide preview'], [aria-label='Show preview']",
      )
      ?.click();
  const trashNote = () => notes.mutate((note) => api.trashNote(note.id));
  async function createNotebook() {
    const name = await dialog.prompt("Notebook name");
    if (!name?.trim()) return;
    const book = await api.createNotebook(name);
    await notes.navigate(book.id);
    await notes.refresh();
  }
  async function renameNotebook(id: string) {
    const name = await dialog.prompt(
      "New notebook name",
      notes.notebooks.find((book) => book.id === id)?.name,
    );
    if (name?.trim()) {
      await api.renameNotebook(id, name);
      await notes.refresh();
    }
  }
  async function deleteNotebook(id: string) {
    if (
      !(await dialog.confirm(
        "Delete this notebook? Its notes will move to Inbox.",
      ))
    )
      return;
    await notes.flush();
    await api.deleteNotebook(id);
    await notes.navigate("inbox");
    await notes.refresh();
  }
  async function importMarkdown() {
    await notes.flush();
    if (await importFiles()) await notes.refresh();
  }
  async function emptyTrash() {
    if (await dialog.confirm("Permanently delete all trashed notes?")) {
      await api.emptyTrash();
      await notes.refresh();
    }
  }
  async function exportMarkdown(notebook = false) {
    await notes.flush();
    await exportFiles(notebook ? null : notes.selectedId, notes.notebookId);
  }
  const actions = {
    "new-note": () => run(notes.create),
    search: focusSearch,
    preview,
    trash: () => run(trashNote),
    import: () => run(importMarkdown),
    export: () => run(() => exportMarkdown()),
    "export-notebook": () => run(() => exportMarkdown(true)),
    about: () =>
      setMessage(
        "FocusNotes 0.1 · Offline Markdown notes and a 25/5 focus timer",
      ),
    "quit-ready": () => run(api.quit),
  };
  useNativeEvents(actions, notes.flush, setTimer, setMessage, notes.refresh);
  function shortcuts(event: KeyboardEvent) {
    if ("__TAURI_INTERNALS__" in window || !(event.ctrlKey || event.metaKey))
      return;
    const action = (
      {
        n: actions["new-note"],
        f: focusSearch,
        p: preview,
        Backspace: actions.trash,
      } as Record<string, () => void>
    )[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }
  function searchKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      notes.setSearchIndex((index) =>
        Math.max(
          0,
          Math.min(
            notes.notes.length - 1,
            index + (event.key === "ArrowDown" ? 1 : -1),
          ),
        ),
      );
    }
    if (event.key === "Enter" && notes.notes[notes.searchIndex])
      run(() => notes.select(notes.notes[notes.searchIndex].id));
  }
  return {
    message,
    setMessage,
    timer,
    setTimer,
    collapsed,
    setCollapsed,
    notes,
    theme,
    run,
    focusSearch,
    actions,
    createNotebook,
    renameNotebook,
    deleteNotebook,
    shortcuts,
    searchKeys,
    dialog,
    emptyTrash,
  };
}
