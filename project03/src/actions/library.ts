"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data/session";
import {
  addBookForUser,
  logProgress,
  moveEntry,
  rateEntry,
  reviewEntry,
  setReadingGoal,
} from "@/lib/data/mutations";
import type { FormState } from "@/lib/form-state";
import {
  addBookSchema,
  goalSchema,
  moveBookSchema,
  progressSchema,
  ratingSchema,
  reviewSchema,
} from "@/lib/validation/library";
import type { ZodError } from "zod";

function invalid(error: ZodError): FormState {
  return { errors: error.flatten().fieldErrors };
}

function failed(error: unknown): FormState {
  return {
    message: error instanceof Error ? error.message : "Please try again.",
  };
}

function refresh(username: string, bookId?: string) {
  revalidatePath("/dashboard");
  for (const shelf of ["want", "reading", "read"])
    revalidatePath(`/shelves/${shelf}`);
  revalidatePath(`/u/${username}`);
  revalidatePath(`/u/${username}/feed.xml`);
  if (bookId) revalidatePath(`/books/${bookId}`);
}

export async function addBookAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = addBookSchema.safeParse({
    bookId: form.get("bookId"),
    shelf: form.get("shelf"),
  });
  if (!parsed.success) return invalid(parsed.error);
  try {
    await addBookForUser(user.id, parsed.data.bookId, parsed.data.shelf);
    refresh(user.username, parsed.data.bookId);
    return { success: true, message: "Book added to your shelf." };
  } catch (error) {
    return failed(error);
  }
}

export async function moveBookAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = moveBookSchema.safeParse({
    entryId: form.get("entryId"),
    shelf: form.get("shelf"),
  });
  if (!parsed.success) return invalid(parsed.error);
  try {
    const entry = await moveEntry(
      user.id,
      parsed.data.entryId,
      parsed.data.shelf,
    );
    refresh(user.username, entry.bookId);
    return { success: true, message: "Shelf updated." };
  } catch (error) {
    return failed(error);
  }
}

export async function rateBookAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = ratingSchema.safeParse({
    entryId: form.get("entryId"),
    rating: form.get("rating"),
  });
  if (!parsed.success) return invalid(parsed.error);
  try {
    refresh(
      user.username,
      await rateEntry(user.id, parsed.data.entryId, parsed.data.rating),
    );
    return { success: true, message: "Rating saved." };
  } catch (error) {
    return failed(error);
  }
}

export async function reviewBookAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    entryId: form.get("entryId"),
    review: form.get("review"),
  });
  if (!parsed.success) return invalid(parsed.error);
  try {
    refresh(
      user.username,
      await reviewEntry(user.id, parsed.data.entryId, parsed.data.review),
    );
    return { success: true, message: "Review saved." };
  } catch (error) {
    return failed(error);
  }
}

export async function logProgressAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = progressSchema.safeParse({
    entryId: form.get("entryId"),
    pages: form.get("pages"),
  });
  if (!parsed.success) return invalid(parsed.error);
  try {
    refresh(
      user.username,
      await logProgress(user.id, parsed.data.entryId, parsed.data.pages),
    );
    return { success: true, message: "Pages logged." };
  } catch (error) {
    return failed(error);
  }
}

export async function setGoalAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse({ targetBooks: form.get("targetBooks") });
  if (!parsed.success) return invalid(parsed.error);
  try {
    await setReadingGoal(user.id, parsed.data.targetBooks);
    revalidatePath("/dashboard");
    return { success: true, message: "Goal saved." };
  } catch (error) {
    return failed(error);
  }
}
