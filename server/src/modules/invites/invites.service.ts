import { inviteRepo } from "./invite.repo";
import { serverRepo } from "@modules/servers/server.repo";
import { requireMembership } from "@shared/membership";
import { generateInviteCode } from "./invite.code";
import { CreateInviteInput } from "./invites.schemas";
import { ForbiddenError, NotFoundError, ConflictError } from "@shared/errors/errors";
import { isUniqueViolation } from "@shared/errors/prisma-errors";

function toPublicInvite(inv: {
    code: string, 
    serverId: string, 
    expiresAt: Date | null;
    maxUses: number | null;
    uses: number;
}) {
    return {
        code: inv.code,
        serverId: inv.serverId,
        expiresAt: inv.expiresAt,
        maxUses: inv.maxUses,
        uses: inv.uses,
    };
}

function assertUsable(invite: {
    expiresAt: Date | null;
    maxUses: number | null;
    uses: number;
}) {
    if (invite.expiresAt !== null && invite.expiresAt.getTime() < Date.now()) {
        throw new ConflictError("Convite expirado");
    }

    if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
        throw new ConflictError("Convite esgotado");
    }
}

export const inviteService = {
    async create(userId: string, serverId: string, input: CreateInviteInput) {
        const membership = await requireMembership(serverId, userId);
        if (membership.role !== "OWNER") {
            throw new ForbiddenError("Apenas o dono pode gerar convites");
        }

        const expiresAt = input.expiresInHours
            ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
            : null;

        const invite = await inviteRepo.create({
            serverId,
            code: generateInviteCode(),
            createdBy: userId,
            expiresAt,
            maxUses: input.maxUses ?? null,
        });

        return toPublicInvite(invite);
    },

    async preview(code: string) {
        const invite = await inviteRepo.findByCode(code);
        if (!invite) throw new NotFoundError("Convite não encontrado");
        assertUsable(invite); 

        return {
            code: invite.code,
            server: { id: invite.server.id, name: invite.server.name },
            expiresAt: invite.expiresAt,
            maxUses: invite.maxUses,
            uses: invite.uses,
        };
    },

    async accept(userId: string, code: string) {
        const invite = await inviteRepo.findByCode(code);
        if (!invite) throw new NotFoundError("Convite não encontrado");
        assertUsable(invite);

        const existing = await serverRepo.findMembership(invite.serverId, userId);
        if (existing) {
            return { serverId: invite.serverId, alreadyMember: true };
        }

        const claimed = await inviteRepo.incrementUsesIfAvailable(
            invite.id,
            invite.maxUses,
        );

        if (claimed === 0) {
            throw new ConflictError("Convite esgotado");
        }

        try {
            await serverRepo.addMember({
                serverId: invite.serverId,
                userId,
                role: "MEMBER",
            });
        } catch (err) {
            if (isUniqueViolation(err)) {
                return { serverId: invite.serverId, alreadyMember: true };
            }
            throw err;
        }

        return { serverId: invite.serverId, alreadyMember: false };
    },
};

