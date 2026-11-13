"use client";

import { useActionState } from "react";
import { setGoalAction } from "@/actions/library";
import type { FormState } from "@/lib/form-state";
import { FormFeedback } from "./form-feedback";
import { SubmitButton } from "./submit-button";

export function GoalForm({ target }: { target: number }) {
  const [state, action] = useActionState<FormState, FormData>(
    setGoalAction,
    {},
  );
  return (
    <form action={action} className="mt-5 flex flex-wrap items-end gap-3">
      <div>
        <label
          htmlFor="targetBooks"
          className="mb-1 block text-sm font-semibold"
        >
          Books to read this year
        </label>
        <input
          id="targetBooks"
          name="targetBooks"
          type="number"
          min="1"
          max="1000"
          defaultValue={target}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-2 focus:outline-amber-600"
        />
      </div>
      <SubmitButton>Set goal</SubmitButton>
      <FormFeedback state={state} field="targetBooks" />
    </form>
  );
}
