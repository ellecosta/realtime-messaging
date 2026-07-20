import type { Server } from "socket.io";
import type { MessageBroadcaster, NewMessagePayload } from "./broadcast.port";

export function createSocketIoBroadcaster(io: Server): MessageBroadcaster {
    return {
        broadcastNewMessage(serverId: string, payload: NewMessagePayload) {
            io.to(`server:${serverId}`).emit("message:new", payload);
        },
    };
}