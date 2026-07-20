import { prisma } from "@shared/prisma";

export type MessageWithAuthor = {
    id: string,
    channelId: string, 
    authorId: string,
    content: string, 
    createdAt: Date, 
    author: { id: string; username: string };
};

export interface MessageRepository {
    listByChannel(channelId: string, opts: { before?: string; limit: number },): Promise<MessageWithAuthor[]>;
    save(data: { channelId: string; authorId: string; content: string; }): Promise<MessageWithAuthor>;
}

export const messageRepo: MessageRepository = {
    listByChannel(channelId, {before, limit}) {
        return prisma.message.findMany({
            where: { channelId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(before ? { cursor: { id: before }, skip: 1 } : {}),
            include: {
                author: { select: { id: true, username: true } },
            },
        });
    },

    save(data) {
        return prisma.message.create({
            data, 
            include: {
                author: { select: { id: true, username: true } },
            },
        });
    },
};