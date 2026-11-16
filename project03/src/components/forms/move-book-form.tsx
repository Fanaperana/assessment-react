"use client";

import { useActionState, useOptimistic } from "react";
import { moveBookAction } from "@/actions/library";
import type { Shelf } from "@/lib/db/schema";
import type { FormState } from "@/lib/form-state";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

export function MoveBookForm({
  entryId,
  shelf,
}: {
  entryId: string;
  shelf: Shelf;
}) {
  const [optimisticShelf, setOptimisticShelf] = useOptimistic(shelf);
  const [state, action] = useActionState<FormState, FormData>(
    async (previous, form) => {
      setOptimisticShelf(String(form.get("shelf")) as Shelf);
      return moveBookAction(previous, form);
    },
    {},
  );
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="entryId" value={entryId} />
      <div>
        <label
          htmlFor={`shelf-${entryId}`}
          className="mb-1 block text-sm font-semibold"
        >
          Shelf
        </label>
        <select
          id={`shelf-${entryId}`}
          name="shelf"
          key={optimisticShelf}
          defaultValue={optimisticShelf}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-2 focus:outline-amber-600"
        >
          <option value="want">Want to read</option>
          <option value="reading">Reading</option>
          <option value="read">Read</option>
        </select>
      </div>
      <SubmitButton>Move</SubmitButton>
      <FormFeedback state={state} field="shelf" />
    </form>
  );
}
