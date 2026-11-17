import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Note, Notebook, SearchResult } from "../types";
import { useAutosave } from "./useAutosave";

export function useNotes(onError: (message: string) => void) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notebookId, setNotebookId] = useState("inbox");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [trash, setTrash] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searchIndex, setSearchIndex] = useState(0);
  const request = useRef(0);
  const { flush, change: saveDraft, saving } = useAutosave(onError);
  const selection = useRef({ notebookId, trash, selectedId });
  selection.current = { notebookId, trash, selectedId };
  const refresh = useCallback(async () => {
    const generation = ++request.current;
    await flush();
    const current = selection.current;
    const [books, rows] = await Promise.all([
      api.listNotebooks(),
      api.listNotes(current.trash ? null : current.notebookId, current.trash),
    ]);
    if (generation !== request.current) return;
    setNotebooks(books);
    setNotes(rows);
    setSelectedId(
      rows.some((note) => note.id === current.selectedId)
        ? current.selectedId
        : (rows[0]?.id ?? null),
    );
  }, [flush]);
  useEffect(() => {
    let active = true;
    void (async () => {
      const remembered = localStorage.getItem("focusnotes:lastNote");
      if (remembered) {
        try {
          const note = await api.getNote(remembered);
          if (active && !note.trashed) {
            selection.current = {
              notebookId: note.notebookId,
              trash: false,
              selectedId: note.id,
            };
            setNotebookId(note.notebookId);
            setSelectedId(note.id);
          }
        } catch {
          /* Deleted notes fall back to Inbox. */
        }
      }
      if (active) await refresh();
    })().catch((error) => onError(String(error)));
    return () => {
      active = false;
    };
  }, [refresh, onError]);
  useEffect(() => {
    if (!query.trim() || trash) {
      setResults(null);
      return;
    }
    let active = true;
    const timeout = setTimeout(() => {
      void api
        .search(query)
        .then((rows) => {
          if (active) {
            setResults(rows);
            setSearchIndex(0);
          }
        })
        .catch((error) => {
          if (active) onError(String(error));
        });
    }, 180);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, trash, onError]);
  useEffect(() => {
    if (selectedId) localStorage.setItem("focusnotes:lastNote", selectedId);
  }, [selectedId]);
  const source = results?.map((result) => result.note) ?? notes;
  const visible = source.filter(
    (note) =>
      (!tag || note.tags.includes(tag)) &&
      (!trash ||
        `${note.title} ${note.body}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const selected =
    source.find((note) => note.id === selectedId) ??
    notes.find((note) => note.id === selectedId) ??
    null;
  async function select(id: string) {
    await flush();
    selection.current.selectedId = id;
    setSelectedId(id);
  }
  async function navigate(id: string, showTrash = false) {
    await flush();
    const generation = ++request.current;
    const rows = await api.listNotes(showTrash ? null : id, showTrash);
    if (generation !== request.current) return;
    selection.current = {
      notebookId: id,
      trash: showTrash,
      selectedId: rows[0]?.id ?? null,
    };
    setNotebookId(id);
    setTrash(showTrash);
    setTag("");
    setQuery("");
    setResults(null);
    setNotes(rows);
    setSelectedId(rows[0]?.id ?? null);
  }
  function change(title: string, body: string) {
    if (!selected || selected.trashed) return;
    const draft = { ...selected, title, body };
    setNotes((rows) =>
      rows.some((row) => row.id === draft.id)
        ? rows.map((row) => (row.id === draft.id ? draft : row))
        : [...rows, draft],
    );
    setResults(
      (rows) =>
        rows?.map((row) =>
          row.note.id === draft.id ? { ...row, note: draft } : row,
        ) ?? null,
    );
    saveDraft(draft);
  }
  async function create() {
    await flush();
    const note = await api.createNote(notebookId);
    await navigate(notebookId);
    setSelectedId(note.id);
    selection.current.selectedId = note.id;
    await refresh();
  }
  async function mutate(action: (note: Note) => Promise<unknown>) {
    if (!selected) return;
    await flush();
    await action(selected);
    await refresh();
    setQuery("");
    setResults(null);
  }
  return {
    notebooks,
    notebookId,
    notes: visible,
    selected,
    selectedId,
    query,
    setQuery,
    tag,
    setTag,
    trash,
    results,
    tags: [...new Set(source.flatMap((note) => note.tags))].sort(),
    searchIndex,
    setSearchIndex,
    refresh,
    navigate,
    select,
    change,
    create,
    mutate,
    flush,
    saving,
  };
}
