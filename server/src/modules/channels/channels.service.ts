import { channelRepo } from "./channel.repo";
import { serverRepo } from "@modules/servers/server.repo";
import { CreateChannelInput } from "./channels.schemas";
import { ForbiddenError, NotFoundError } from "@shared/errors/errors";
import type { Channel } from "generated/prisma";

function toPublicServer(c: Channel) {
    return {
        id: c.id,
        serverId: c.serverId,
        name: c.name,
        isDefault: c.isDefault,
        createdAt: c.createdAt,
    };
}

async function requireMembership(serverId: string, userId: string) {
    const server = await serverRepo.findById(serverId);
    if (!server) throw new NotFoundError("Servidor não encontrado"); 

    const membership = await serverRepo.findMembership(serverId, userId);
    if (!membership) throw new NotFoundError("Você não é membro deste servidor");

    return membership;
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