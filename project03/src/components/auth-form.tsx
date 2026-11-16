"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction, signUpAction } from "@/actions/auth";
import type { FormState } from "@/lib/form-state";

function Submit({ mode }: { mode: "in" | "up" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
    </button>
  );
}

export function AuthForm({
  mode,
  callbackUrl,
}: {
  mode: "in" | "up";
  callbackUrl: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(
    mode === "up" ? signUpAction : signInAction,
    {},
  );
  const fields =
    mode === "up"
      ? [
          {
            name: "name",
            label: "Your name",
            type: "text",
            autoComplete: "name",
          },
          {
            name: "username",
            label: "Username",
            type: "text",
            autoComplete: "username",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "new-password",
          },
        ]
      : [
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
          },
        ];
  return (
    <form
      action={action}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="mb-2 block text-sm font-semibold"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            aria-describedby={
              state.errors?.[field.name] ? `${field.name}-error` : undefined
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
          />
          {state.errors?.[field.name]?.map((message) => (
            <p
              id={`${field.name}-error`}
              role="alert"
              key={message}
              className="mt-1 text-sm text-red-700"
            >
              {message}
            </p>
          ))}
        </div>
      ))}
      {state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <Submit mode={mode} />
      <p className="text-center text-sm text-slate-600">
        {mode === "up" ? "Already have an account? " : "New here? "}
        <Link
          href={mode === "up" ? "/sign-in" : "/sign-up"}
          className="font-semibold text-amber-700 underline"
        >
          {mode === "up" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
