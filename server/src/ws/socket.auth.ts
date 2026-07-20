import type { Socket, ExtendedError } from "socket.io";
import { verifyToken } from "@shared/jwt";

export function socketAuth(
    socket: Socket,
    next: (err?:  ExtendedError) => void,
) {
    try {
        const token = socket.handshake.auth?.token as string | undefined;
        if (!token) return next(new Error("Token ausente"));

        const payload = verifyToken(token);

        socket.data.userId = payload.sub;

        next();
    } catch {
        next(new Error("Token inválido ou expirado"));
    }
}