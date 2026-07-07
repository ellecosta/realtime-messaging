import { prisma } from "shared/prisma";
import type { Server } from "generated/prisma";

export const serverRepo = {
    createWithDefaults(data: { name: string; ownerId: string}): Promise<Server> {
        return prisma.$transaction(async (tx) => {
            const server = await tx.server.create({
                data: { name: data.name, ownerId: data.ownerId },
            });

            await tx.channel.create({
                data: { serverId: server.id, name: "general", isDefault: true },
            });

            await tx.serverMember.create({
                data: { serverId: server.id, userId: data.ownerId, role: "OWNER" },
            });

            return server;
        });
    },

    listForUser(userId: string): Promise<Server[]> {
        return prisma.server.findMany({
            where: { members: { some: { userId } } },
            orderBy: { createdAt: "asc" },
        });
    },
};