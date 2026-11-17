import { act, renderHook, waitFor } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import { beforeEach, expect, it, vi } from "vitest";
import { useNotes } from "./useNotes";
import type { Note } from "../types";

const first: Note = {
  id: "one",
  notebookId: "inbox",
  notebookName: "Inbox",
  title: "First",
  body: "one separated two",
  tags: ["work"],
  pinned: false,
  trashed: false,
  createdAt: "",
  updatedAt: "",
};
const second: Note = {
  ...first,
  id: "two",
  notebookId: "work",
  notebookName: "Work",
  title: "Other notebook",
};
const onError = vi.fn();
let rows: Note[];
let ipc: ReturnType<typeof vi.fn>;
beforeEach(() => {
  localStorage.clear();
  onError.mockClear();
  rows = [{ ...first }, { ...second }];
  ipc = vi.fn((command: string, args?: Record<string, unknown>) => {
    if (command === "list_notebooks")
      return [
        { id: "inbox", name: "Inbox", noteCount: 1 },
        { id: "work", name: "Work", noteCount: 1 },
      ];
    if (command === "get_note") return rows.find((row) => row.id === args?.id);
    if (command === "list_notes")
      return rows.filter(
        (row) =>
          (!args?.notebookId || row.notebookId === args.notebookId) &&
          row.trashed === args?.trashed,
      );
    if (command === "search_notes")
      return [
        {
          note: rows[1],
          snippet: "<mark>one</mark> separated <mark>two</mark>",
        },
      ];
    if (command === "update_note") {
      rows = rows.map((row) =>
        row.id === args?.id
          ? { ...row, title: String(args.title), body: String(args.body) }
          : row,
      );
      return rows.find((row) => row.id === args?.id);
    }
    return undefined;
  });
  mockIPC(ipc);
});

it("loads the initial notebook without refetching on each selection render", async () => {
  const { result } = renderHook(() => useNotes(onError));
  await waitFor(() => expect(result.current.selectedId).toBe("one"));
  expect(
    ipc.mock.calls.filter(([command]) => command === "list_notes"),
  ).toHaveLength(1);
  expect(onError).not.toHaveBeenCalled();
});
it("restores the last note from a different notebook", async () => {
  localStorage.setItem("focusnotes:lastNote", "two");
  const { result } = renderHook(() => useNotes(onError));
  await waitFor(() => expect(result.current.selectedId).toBe("two"));
  expect(result.current.notebookId).toBe("work");
  expect(result.current.selected?.title).toBe("Other notebook");
});
it("uses ranked FTS results across notebooks without substring filtering", async () => {
  const { result } = renderHook(() => useNotes(onError));
  await waitFor(() => expect(result.current.selectedId).toBe("one"));
  act(() => result.current.setQuery("one two"));
  await waitFor(() => expect(result.current.notes[0]?.id).toBe("two"));
  await act(() => result.current.select("two"));
  expect(result.current.selected?.notebookId).toBe("work");
});
it("saves dirty text before changing notebooks", async () => {
  const { result } = renderHook(() => useNotes(onError));
  await waitFor(() => expect(result.current.selectedId).toBe("one"));
  act(() => result.current.change("Changed", "unsaved text"));
  await act(() => result.current.navigate("work"));
  expect(rows[0].body).toBe("unsaved text");
  expect(result.current.selectedId).toBe("two");
  expect(result.current.saving).toBe(false);
});
it("keeps the trash view during refresh and filters by tag", async () => {
  rows[1] = { ...rows[1], trashed: true, tags: ["old"] };
  const { result } = renderHook(() => useNotes(onError));
  await waitFor(() => expect(result.current.selectedId).toBe("one"));
  await act(() => result.current.navigate("inbox", true));
  await act(() => result.current.refresh());
  expect(result.current.trash).toBe(true);
  expect(result.current.notes.map((row) => row.id)).toEqual(["two"]);
  act(() => result.current.setTag("work"));
  expect(result.current.notes).toEqual([]);
});
