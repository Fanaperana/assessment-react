import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { Note } from "../types";

// Serialize writes so an older response can never overwrite a newer draft.
export function useAutosave(onError: (message: string) => void) {
  const pending = useRef(new Map<string, Note>());
  const queue = useRef(Promise.resolve());
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const flush = useCallback(() => {
    clearTimeout(timeout.current);
    const run = async () => {
      for (const [id, draft] of pending.current) {
        await api.updateNote(id, draft.title, draft.body);
        if (pending.current.get(id) === draft) pending.current.delete(id);
      }
      setSaving(pending.current.size > 0);
    };
    const work = queue.current.then(run);
    queue.current = work.catch(() => undefined);
    return work;
  }, []);
  const change = useCallback(
    (note: Note) => {
      pending.current.set(note.id, note);
      setSaving(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        void flush().catch((error) => onError(`Save failed: ${String(error)}`));
      }, 500);
    },
    [flush, onError],
  );
  useEffect(
    () => () => {
      clearTimeout(timeout.current);
    },
    [],
  );
  return { change, flush, saving };
}
