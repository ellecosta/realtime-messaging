import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2).max(32),
    password: z.string().min(6).max(72),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;