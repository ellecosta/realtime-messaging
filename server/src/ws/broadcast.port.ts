export type NewMessagePayload = {
    id: string;
    channelId: string;
    serverId: string;
    authorId: string;
    username: string;
    content: string;
    createdAt: Date;
    tempId?: string; 
};

export interface MessageBroadcaster {
    broadcastNewMessage(serverId: string, payload: NewMessagePayload): void;
}
