import { serverRepo } from "./server.repo";
import type { CreateServerInput } from "./servers.schemas";

function toPublicServer(s: {id: string; name: string, ownerId: string; createdAt: Date }) {
    return { id: s.id, name: s.name, createdAt: s.createdAt };
}

export const serverService = {
    async create(userId: string, input: CreateServerInput) {
        const server = await serverRepo.createWithDefaults({
            name: input.name,
            ownerId: userId,
        });
        return toPublicServer(server);
    },

    async listMine(userId: string) {
        const servers = await serverRepo.listForUser(userId);
        return servers.map(toPublicServer);
    },
};