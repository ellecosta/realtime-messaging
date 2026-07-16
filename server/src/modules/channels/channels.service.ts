import { channelRepo } from "./channel.repo";
import { serverRepo } from "@modules/servers/server.repo";
import { CreateChannelInput } from "./channels.schemas";
import { ForbiddenError, NotFoundError } from "@shared/errors/errors";
import type { Channel } from "generated/prisma";
import { requireMembership } from "@shared/membership";

function toPublicServer(c: Channel) {
    return {
        id: c.id,
        serverId: c.serverId,
        name: c.name,
        isDefault: c.isDefault,
        createdAt: c.createdAt,
    };
}
export const channelService = {
    async list(userId: string, serverId: string) {
        await requireMembership(serverId, userId);
        const channels = await channelRepo.listByServer(serverId);
        return channels.map(toPublicServer);
    },

    async create(userId: string, serverId: string, input: CreateChannelInput) {
        const membership = await requireMembership(serverId, userId);
        if (membership.role !== "OWNER") {
            throw new ForbiddenError("Apenas o dono pode criar canais");
        }

        const channel = await channelRepo.create({ serverId, name: input.name });
        return toPublicServer(channel);
    },
}