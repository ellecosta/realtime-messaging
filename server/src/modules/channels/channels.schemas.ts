import { z } from "zod";

export const CreateChannelSchema = z.object({
    name: z.string().trim().min(2).max(62),
});

export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;