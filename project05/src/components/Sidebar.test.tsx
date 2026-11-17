import { fireEvent, render, screen } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import { describe, expect, it, vi } from "vitest";
import { api } from "../lib/api";
import type { Notebook } from "../types";
import { Sidebar } from "./Sidebar";

const notebook: Notebook = {
  id: "inbox",
  name: "Inbox",
  position: 0,
  createdAt: "2026-01-01",
  noteCount: 2,
};
describe("Sidebar", () => {
  it("loads notebook data through mockIPC", async () => {
    mockIPC((command) =>
      command === "list_notebooks" ? [notebook] : undefined,
    );
    expect(await api.listNotebooks()).toEqual([notebook]);
  });
  it("renders notebook names", () => {
    render(
      <Sidebar
        notebooks={[notebook]}
        selected="inbox"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onSearch={vi.fn()}
        onTrash={vi.fn()}
      />,
    );
    expect(screen.getByText("Inbox")).toBeInTheDocument();
  });
  it("shows the active notebook state", () => {
    render(
      <Sidebar
        notebooks={[notebook]}
        selected="inbox"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onSearch={vi.fn()}
        onTrash={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Inbox/ })).toHaveClass("active");
  });
  it("calls create notebook", () => {
    const create = vi.fn();
    render(
      <Sidebar
        notebooks={[]}
        selected=""
        onSelect={vi.fn()}
        onCreate={create}
        onSearch={vi.fn()}
        onTrash={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "New notebook" }));
    expect(create).toHaveBeenCalledOnce();
  });
  it("opens search and trash actions", () => {
    const search = vi.fn();
    const trash = vi.fn();
    render(
      <Sidebar
        notebooks={[]}
        selected=""
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onSearch={search}
        onTrash={trash}
      />,
    );
    fireEvent.click(screen.getByText("Search"));
    fireEvent.click(screen.getByText("Trash"));
    expect(search).toHaveBeenCalledOnce();
    expect(trash).toHaveBeenCalledOnce();
  });
});
