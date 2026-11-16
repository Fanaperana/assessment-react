import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(24, "Use at most 24 characters.")
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers or underscores.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  username: usernameSchema,
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
