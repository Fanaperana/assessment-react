import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import { beforeEach, expect, it, vi } from "vitest";
import { QuickCapture } from "./QuickCapture";

beforeEach(() => mockWindows("quick-capture"));

it("saves to Inbox with Enter and closes only after success", async () => {
  const ipc = vi.fn(() => undefined);
  mockIPC(ipc);
  render(<QuickCapture />);
  fireEvent.change(screen.getByLabelText("Quick note"), {
    target: { value: "New thought" },
  });
  fireEvent.keyDown(screen.getByLabelText("Quick note"), { key: "Enter" });
  await waitFor(() =>
    expect(ipc).toHaveBeenCalledWith("plugin:window|close", {
      label: "quick-capture",
    }),
  );
  expect(ipc).toHaveBeenCalledWith("quick_capture", { body: "New thought" });
});
it("keeps the text and window open when capture fails", async () => {
  const ipc = vi.fn().mockRejectedValue("database unavailable");
  mockIPC(ipc);
  render(<QuickCapture />);
  fireEvent.change(screen.getByLabelText("Quick note"), {
    target: { value: "Keep this" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Save to Inbox/ }));
  await screen.findByText("database unavailable");
  expect(screen.getByLabelText("Quick note")).toHaveValue("Keep this");
  expect(ipc).not.toHaveBeenCalledWith(
    "plugin:window|close",
    expect.anything(),
  );
});
it("does not save on Shift+Enter or during IME composition", () => {
  const ipc = vi.fn();
  mockIPC(ipc);
  render(<QuickCapture />);
  const input = screen.getByLabelText("Quick note");
  fireEvent.change(input, { target: { value: "Multiline" } });
  fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(ipc).not.toHaveBeenCalled();
});
