import { serverRepo } from "@modules/servers/server.repo";
import { ForbiddenError, NotFoundError } from "@shared/errors/errors";
import type { ServerMember } from "generated/prisma";

export async function requireMembership(
    serverId: string,
    userId: string,
): Promise<ServerMember> {
    const server = await serverRepo.findById(serverId);
    if (!server) throw new NotFoundError("Servidor não encontrado");

    const membership = await serverRepo.findMembership(serverId, userId);
    if (!membership) throw new ForbiddenError("Você não é membro deste servidor");

    return membership;
}