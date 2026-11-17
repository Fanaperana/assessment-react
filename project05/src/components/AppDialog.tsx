import { useEffect, useRef } from "react";
import type { DialogRequest } from "../hooks/useDialog";

export function AppDialog({
  request,
  finish,
}: {
  request: DialogRequest | null;
  finish: (value: string | null) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (request) dialog.current?.showModal();
    else dialog.current?.close();
  }, [request]);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="dialog-label"
      onCancel={(event) => {
        event.preventDefault();
        finish(null);
      }}
    >
      {request && (
        <form
          key={`${request.label}:${request.initial}`}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            finish(request.confirm ? "yes" : String(data.get("name") ?? ""));
          }}
        >
          <h2 id="dialog-label">{request.label}</h2>
          {!request.confirm && (
            <input
              autoFocus
              aria-label="Notebook name"
              name="name"
              defaultValue={request.initial}
              required
              maxLength={80}
            />
          )}
          <footer>
            <button type="button" onClick={() => finish(null)}>
              Cancel
            </button>
            <button autoFocus={request.confirm} type="submit">
              {request.confirm ? "Confirm" : "Save"}
            </button>
          </footer>
        </form>
      )}
    </dialog>
  );
}
