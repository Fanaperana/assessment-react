import { fireEvent, render, screen } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import { describe, expect, it, vi } from "vitest";
import { api } from "../lib/api";
import type { Note } from "../types";
import { NoteEditor } from "./NoteEditor";

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
const editorProps = {
  note,
  onChange: vi.fn(),
  onTags: vi.fn(),
  onTrash: vi.fn(),
  onPin: vi.fn(),
  onRestore: vi.fn(),
  saving: false,
};

describe("NoteEditor", () => {
  it("does not interpret raw HTML or executable Markdown links", () => {
    const { container } = render(
      <NoteEditor
        {...editorProps}
        note={{
          ...note,
          body: "<script>alert(1)</script>\n\n[bad](javascript:alert(1))",
        }}
      />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
  it("loads a note via mockIPC", async () => {
    mockIPC((command) => (command === "get_note" ? note : undefined));
    expect(await api.getNote("n1")).toEqual(note);
  });
  it("shows title and Markdown preview", () => {
    render(<NoteEditor {...editorProps} />);
    expect(screen.getByRole("textbox", { name: "Note title" })).toHaveValue(
      "Plan",
    );
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
  });
  it("sends title changes to autosave handler", () => {
    const change = vi.fn();
    render(<NoteEditor {...editorProps} onChange={change} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Note title" }), {
      target: { value: "Updated" },
    });
    expect(change).toHaveBeenCalledWith("Updated", "## Today");
  });
  it("toggles preview", () => {
    render(<NoteEditor {...editorProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Hide preview" }));
    expect(screen.queryByLabelText("Markdown preview")).not.toBeInTheDocument();
  });
  it("sends a pin action", () => {
    const pin = vi.fn();
    render(<NoteEditor {...editorProps} onPin={pin} />);
    fireEvent.click(screen.getByRole("button", { name: "Pin note" }));
    expect(pin).toHaveBeenCalledOnce();
  });
});
