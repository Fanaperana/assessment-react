import { fireEvent, render, screen } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import { describe, expect, it, vi } from "vitest";
import { api } from "../lib/api";
import type { Note } from "../types";
import { NoteList } from "./NoteList";

const note: Note = {
  id: "n1",
  notebookId: "inbox",
  notebookName: "Inbox",
  title: "Plan",
  body: "## Today",
  pinned: false,
  trashed: false,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-02",
  tags: ["work"],
};
const other: Note = {
  ...note,
  id: "n2",
  title: "Ideas",
  body: "A thought",
  tags: [],
};
const noteListProps = {
  title: "Notes",
  notes: [note, other],
  selected: "n1",
  onSelect: vi.fn(),
  onCreate: vi.fn(),
  query: "",
  onQuery: vi.fn(),
  onSearchKeyDown: vi.fn(),
};
describe("NoteList", () => {
  it("loads note rows through mockIPC", async () => {
    mockIPC((command) =>
      command === "list_notes" ? [note, other] : undefined,
    );
    expect(await api.listNotes("inbox")).toHaveLength(2);
  });
  it("renders note titles and snippets", () => {
    render(<NoteList {...noteListProps} />);
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
  it("marks selected note", () => {
    render(<NoteList {...noteListProps} />);
    expect(screen.getByRole("option", { name: /Plan/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
  it("selects a note on click", () => {
    const select = vi.fn();
    render(<NoteList {...noteListProps} onSelect={select} />);
    fireEvent.click(screen.getByRole("option", { name: /Ideas/ }));
    expect(select).toHaveBeenCalledWith("n2");
  });
  it("shows empty state and creates a note", () => {
    const create = vi.fn();
    render(<NoteList {...noteListProps} notes={[]} onCreate={create} />);
    fireEvent.click(screen.getByText("Create your first note"));
    expect(create).toHaveBeenCalledOnce();
  });
});
