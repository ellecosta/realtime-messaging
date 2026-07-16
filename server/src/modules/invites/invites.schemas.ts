import { z } from "zod";

export const CreateInviteSchema = z.object({
    expiresInHours: z.number().int().positive().max(24 * 30).optional(),
    maxUses: z.number().int().positive().max(1000).optional(),
});

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;