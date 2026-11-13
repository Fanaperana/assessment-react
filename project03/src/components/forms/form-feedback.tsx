"use client";

import type { FormState } from "@/lib/form-state";

export function FormFeedback({
  state,
  field,
}: {
  state: FormState;
  field?: string;
}) {
  const errors = field ? state.errors?.[field] : undefined;
  return (
    <>
      {errors?.map((message) => (
        <p role="alert" key={message} className="mt-1 text-sm text-red-700">
          {message}
        </p>
      ))}
      {state.message && (
        <p
          role="status"
          className={`mt-2 text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}
    </>
  );
}
