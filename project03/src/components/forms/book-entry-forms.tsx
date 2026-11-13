"use client";

import { useActionState } from "react";
import {
  logProgressAction,
  rateBookAction,
  reviewBookAction,
} from "@/actions/library";
import type { FormState } from "@/lib/form-state";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

export function ProgressForm({ entryId }: { entryId: string }) {
  const [state, action] = useActionState<FormState, FormData>(
    logProgressAction,
    {},
  );
  return (
    <form
      action={action}
      className="space-y-2 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="entryId" value={entryId} />
      <label htmlFor="pages" className="block text-sm font-semibold">
        Pages read since your last update
      </label>
      <div className="flex items-center gap-3">
        <input
          id="pages"
          name="pages"
          type="number"
          min="1"
          max="10000"
          required
          className="w-28 rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-2 focus:outline-amber-600"
        />
        <SubmitButton>Log pages</SubmitButton>
      </div>
      <FormFeedback state={state} field="pages" />
    </form>
  );
}

export function RatingForm({
  entryId,
  rating,
}: {
  entryId: string;
  rating: number | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    rateBookAction,
    {},
  );
  return (
    <form
      action={action}
      className="space-y-2 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="entryId" value={entryId} />
      <label htmlFor="rating" className="block text-sm font-semibold">
        Your rating
      </label>
      <div className="flex items-center gap-3">
        <select
          id="rating"
          name="rating"
          defaultValue={rating ?? ""}
          required
          className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-2 focus:outline-amber-600"
        >
          <option value="" disabled>
            Choose a rating
          </option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} / 5
            </option>
          ))}
        </select>
        <SubmitButton>Save rating</SubmitButton>
      </div>
      <FormFeedback state={state} field="rating" />
    </form>
  );
}

export function ReviewForm({
  entryId,
  review,
}: {
  entryId: string;
  review: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    reviewBookAction,
    {},
  );
  return (
    <form
      action={action}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="entryId" value={entryId} />
      <label htmlFor="review" className="block text-sm font-semibold">
        Your short review
      </label>
      <textarea
        id="review"
        name="review"
        rows={4}
        maxLength={1000}
        defaultValue={review ?? ""}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-2 focus:outline-amber-600"
      />
      <FormFeedback state={state} field="review" />
      <SubmitButton>Save review</SubmitButton>
    </form>
  );
}
