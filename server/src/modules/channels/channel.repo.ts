import { prisma } from "@shared/prisma";
import type { Channel } from "generated/prisma";

export const channelRepo = {
    listByServer(serverId: string): Promise<Channel[]> {
        return prisma.channel.findMany({
            where: { serverId },
            orderBy: { createdAt: "asc" },
        });
    },

    create(data: { serverId: string, name: string }): Promise<Channel> {
        return prisma.channel.create({
            data: { serverId: data.serverId, name: data.name, isDefault: false },
        });
    },
};