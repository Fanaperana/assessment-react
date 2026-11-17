import { act, renderHook } from "@testing-library/react";
import { mockIPC } from "@tauri-apps/api/mocks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./useAutosave";
import type { Note } from "../types";

const note: Note = {
  id: "a",
  notebookId: "inbox",
  notebookName: "Inbox",
  title: "Draft",
  body: "first",
  tags: [],
  pinned: false,
  trashed: false,
  createdAt: "",
  updatedAt: "",
};
afterEach(() => vi.useRealTimers());

describe("autosave with real typed IPC", () => {
  it("debounces edits for 500ms and persists only the latest draft", async () => {
    vi.useFakeTimers();
    const ipc = vi.fn(() => note);
    mockIPC(ipc);
    const { result } = renderHook(() => useAutosave(vi.fn()));
    act(() => result.current.change(note));
    await act(() => vi.advanceTimersByTimeAsync(400));
    act(() => result.current.change({ ...note, body: "latest" }));
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(ipc).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(ipc).toHaveBeenCalledWith("update_note", {
      id: "a",
      title: "Draft",
      body: "latest",
    });
    expect(result.current.saving).toBe(false);
  });
  it("flushes all dirty notes before navigation or close", async () => {
    const ipc = vi.fn(() => note);
    mockIPC(ipc);
    const { result } = renderHook(() => useAutosave(vi.fn()));
    act(() => {
      result.current.change(note);
      result.current.change({ ...note, id: "b" });
    });
    await act(() => result.current.flush());
    expect(ipc).toHaveBeenCalledTimes(2);
    expect(result.current.saving).toBe(false);
  });
  it("retains failed writes and retries on the next flush", async () => {
    const ipc = vi
      .fn()
      .mockRejectedValueOnce("disk full")
      .mockResolvedValue(note);
    mockIPC(ipc);
    const { result } = renderHook(() => useAutosave(vi.fn()));
    act(() => result.current.change(note));
    await act(async () => {
      await expect(result.current.flush()).rejects.toBe("disk full");
    });
    expect(result.current.saving).toBe(true);
    await act(() => result.current.flush());
    expect(ipc).toHaveBeenCalledTimes(2);
    expect(result.current.saving).toBe(false);
  });
  it("serializes in-flight writes and preserves edits made during a save", async () => {
    let resolve: (value: Note) => void = () => {};
    const ipc = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Note>((done) => {
            resolve = done;
          }),
      )
      .mockResolvedValue(note);
    mockIPC(ipc);
    const { result } = renderHook(() => useAutosave(vi.fn()));
    act(() => result.current.change(note));
    let first: Promise<void>;
    await act(async () => {
      first = result.current.flush();
      await Promise.resolve();
    });
    act(() => result.current.change({ ...note, body: "newer" }));
    let second: Promise<void>;
    act(() => {
      second = result.current.flush();
    });
    expect(ipc).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve(note);
      await first;
      await second;
    });
    expect(ipc).toHaveBeenLastCalledWith("update_note", {
      id: "a",
      title: "Draft",
      body: "newer",
    });
  });
  it("cleans up the debounce timer on unmount", async () => {
    vi.useFakeTimers();
    const ipc = vi.fn();
    mockIPC(ipc);
    const { result, unmount } = renderHook(() => useAutosave(vi.fn()));
    act(() => result.current.change(note));
    unmount();
    await vi.advanceTimersByTimeAsync(1000);
    expect(ipc).not.toHaveBeenCalled();
  });
});
