import { z } from "zod";

export const ListMessagesQuerySchema = z.object({
    before: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;