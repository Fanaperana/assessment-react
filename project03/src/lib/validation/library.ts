import { z } from "zod";

export const bookIdSchema = z
  .string()
  .regex(/^OL\d+W$/, "Invalid Open Library work ID.");
export const shelfSchema = z.enum(["want", "reading", "read"]);
export const entryIdSchema = z.uuid();

export const addBookSchema = z.object({
  bookId: bookIdSchema,
  shelf: shelfSchema,
});
export const moveBookSchema = z.object({
  entryId: entryIdSchema,
  shelf: shelfSchema,
});
export const ratingSchema = z.object({
  entryId: entryIdSchema,
  rating: z.coerce.number().int().min(1).max(5),
});
export const reviewSchema = z.object({
  entryId: entryIdSchema,
  review: z
    .string()
    .trim()
    .max(1000, "Keep your review under 1,000 characters."),
});
export const progressSchema = z.object({
  entryId: entryIdSchema,
  pages: z.coerce.number().int().min(1).max(10000),
});
export const goalSchema = z.object({
  targetBooks: z.coerce.number().int().min(1).max(1000),
});
