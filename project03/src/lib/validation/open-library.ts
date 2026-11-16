import { z } from "zod";

export const searchResponseSchema = z.object({
  docs: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      author_name: z.array(z.string()).nullable().optional(),
      cover_i: z.number().int().nullable().optional(),
      number_of_pages_median: z.number().int().nullable().optional(),
    }),
  ),
});

export const workResponseSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z
    .union([z.string(), z.object({ value: z.string() })])
    .nullable()
    .optional(),
  covers: z.array(z.number().int()).nullable().optional(),
  authors: z
    .array(z.object({ author: z.object({ key: z.string() }) }))
    .optional(),
});

export const authorResponseSchema = z.object({ name: z.string() });
