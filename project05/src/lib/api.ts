import { invoke } from "@tauri-apps/api/core";
import type {
  ExportedMarkdown,
  Note,
  Notebook,
  SearchResult,
  TimerMode,
  TimerSnapshot,
} from "../types";

export const api = {
  quit: () => invoke<void>("quit_app"),
  listNotebooks: () => invoke<Notebook[]>("list_notebooks"),
  createNotebook: (name: string) =>
    invoke<Notebook>("create_notebook", { name }),
  renameNotebook: (id: string, name: string) =>
    invoke<Notebook>("rename_notebook", { id, name }),
  deleteNotebook: (id: string) => invoke<void>("delete_notebook", { id }),
  listNotes: (notebookId: string | null, trashed = false) =>
    invoke<Note[]>("list_notes", { notebookId, trashed }),
  getNote: (id: string) => invoke<Note>("get_note", { id }),
  createNote: (notebookId: string, title = "Untitled", body = "") =>
    invoke<Note>("create_note", { notebookId, title, body }),
  updateNote: (id: string, title: string, body: string) =>
    invoke<Note>("update_note", { id, title, body }),
  trashNote: (id: string) => invoke<Note>("trash_note", { id }),
  restoreNote: (id: string) => invoke<Note>("restore_note", { id }),
  emptyTrash: () => invoke<number>("empty_trash"),
  setPinned: (id: string, pinned: boolean) =>
    invoke<Note>("set_note_pinned", { id, pinned }),
  setTags: (id: string, tags: string[]) =>
    invoke<Note>("set_note_tags", { id, tags }),
  listTags: (notebookId: string | null) =>
    invoke<string[]>("list_tags", { notebookId }),
  search: (query: string) => invoke<SearchResult[]>("search_notes", { query }),
  quickCapture: (body: string) => invoke<Note>("quick_capture", { body }),
  importMarkdown: (files: { filename: string; content: string }[]) =>
    invoke<number>("import_markdown_files", { files }),
  exportMarkdown: (noteId: string | null, notebookId: string | null) =>
    invoke<ExportedMarkdown[]>("export_markdown", { noteId, notebookId }),
  timerState: () => invoke<TimerSnapshot>("get_timer_state"),
  startTimer: (mode: TimerMode) =>
    invoke<TimerSnapshot>("start_timer", { mode }),
  stopTimer: () => invoke<TimerSnapshot>("stop_timer"),
};
