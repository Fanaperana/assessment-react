"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

function destination(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "/dashboard");
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function signUpAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    name: form.get("name"),
    username: form.get("username"),
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  try {
    await auth.api.signUpEmail({ body: parsed.data });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Could not create the account.",
    };
  }
  redirect(destination(form.get("callbackUrl")));
}

export async function signInAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  try {
    await auth.api.signInEmail({ body: parsed.data });
  } catch {
    return { message: "Email or password is incorrect." };
  }
  redirect(destination(form.get("callbackUrl")));
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
