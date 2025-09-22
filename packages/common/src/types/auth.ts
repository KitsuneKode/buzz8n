import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

export const name = z.string().min(3).max(123);

export const signUpSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string(),
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: z.email().toLowerCase().trim(),
  password: passwordSchema,
});

export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
