import { z } from "zod";

export const CreateServerSchema = z.object({
    name: z.string().min(2).max(62),
});

export type CreateServerInput = z.infer<typeof CreateServerSchema>;