import { z } from "zod";

export const SendMessageSchema = z.object({
    channelId: z.string().uuid(),
    content: z.string().trim().min(1, "Mensagem vazia").max(2000, "Mensagem muito longa"),
    tempId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;