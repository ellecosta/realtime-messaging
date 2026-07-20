import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "@shared/env";
import { serverRepo } from "@modules/servers/server.repo";
import { socketAuth } from "./socket.auth";
import { createSocketIoBroadcaster } from "./broadcast.socketio";
import { registerMessageHandlers } from "./message.handlers";

export function createSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: { origin: env.clientOrigin, credentials: true },
    });

    const broadcaster = createSocketIoBroadcaster(io);

    io.use(socketAuth);

    io.on("connection", async (socket) => {
        const userId: string = socket.data.userId;

        const servers = await serverRepo.listForUser(userId);
        for (const s of servers) {
            socket.join(`server:${s.id}`);
        }

        socket.on("server:join", async (data: { serverId?: string }) => {
            if (!data?.serverId) return;
            const membership = await serverRepo.findMembership(data.serverId, userId);
            if (membership) socket.join(`server:${data.serverId}`);
        });

        registerMessageHandlers(socket, broadcaster);
    });

    return io;
}