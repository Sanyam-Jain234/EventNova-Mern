import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name kam se kam 2 letters ka ho"),
  email: z.string().email("Valid email daalo"),
  password: z.string().min(6, "Password kam se kam 6 characters ka ho"),
  role: z.enum(["attendee", "organizer"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email daalo"),
  password: z.string().min(1, "Password daalo"),
});