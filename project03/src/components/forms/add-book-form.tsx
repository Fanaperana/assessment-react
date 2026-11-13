"use client";

import { useActionState } from "react";
import { addBookAction } from "@/actions/library";
import type { FormState } from "@/lib/form-state";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

export function AddBookForm({ bookId }: { bookId: string }) {
  const [state, action] = useActionState<FormState, FormData>(
    addBookAction,
    {},
  );
  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="bookId" value={bookId} />
      <label htmlFor="add-shelf" className="block text-sm font-semibold">
        Add to shelf
      </label>
      <select
        id="add-shelf"
        name="shelf"
        defaultValue="want"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-2 focus:outline-amber-600"
      >
        <option value="want">Want to read</option>
        <option value="reading">Reading</option>
        <option value="read">Read</option>
      </select>
      <FormFeedback state={state} field="shelf" />
      <SubmitButton>Add book</SubmitButton>
    </form>
  );
}
