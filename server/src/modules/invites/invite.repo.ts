import { prisma } from "@shared/prisma";
import type { Invite } from "generated/prisma";

export const inviteRepo = {
    create(data: {
        serverId: string; 
        code: string; 
        createdBy: string; 
        expiresAt: Date | null;
        maxUses: number | null;
    }): Promise<Invite> {
        return prisma.invite.create({ data });
    },

    findByCode(code: string) {
        return prisma.invite.findUnique({
            where: { code },
            include: { server: { select: { id: true, name: true } } },
        });
    },

    async incrementUsesIfAvailable(id: string, maxUses: number | null): Promise<number> {
        const result = await prisma.invite.updateMany({
            where: 
                maxUses === null 
                ? { id }
                : { id, uses: { lt: maxUses } },
            data: { uses: { increment: 1 } },
        });
        return result.count;
    },

};