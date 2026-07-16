import { messageRepo, type MessageWithAuthor } from "./message.repo";
import { channelRepo } from "@modules/channels/channel.repo";
import { requireMembership } from "@shared/membership";
import { NotFoundError } from "@shared/errors/errors";
import type { ListMessagesQuery } from "./messages.schemas";

function toPublicMessage(m: MessageWithAuthor) {
    return {
        id: m.id,
        channelId: m.channelId,
        authorId: m.authorId,
        username: m.author.username,
        content: m.content,
        createdAt: m.createdAt,
    };
}

export const messageService = {
    async listHistory(userId: string, channelId: string, query: ListMessagesQuery) {
        const channel = await channelRepo.findById(channelId);
        if (!channel) throw new NotFoundError("Canal não encontrado");

        await requireMembership(channel.serverId, userId);

        const rows = await messageRepo.listByChannel(channelId, {
            before: query.before,
            limit: query.limit,
        });

        const hasMore = rows.length > query.limit;
        const page = hasMore ? rows.slice(0, query.limit) : rows;

        const ascending = [...page].reverse();

        const nextCursor = hasMore ? ascending[0]!.id : null;

        return {
            messages: ascending.map(toPublicMessage),
            nextCursor, 
            hasMore,
        };
    },
};