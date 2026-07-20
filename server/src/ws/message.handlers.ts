import type { Socket } from "socket.io";
import { messageService } from "@modules/messages/messages.service";
import { SendMessageSchema } from "./ws.schemas";
import type { MessageBroadcaster } from "./broadcast.port";
import { AppError, ValidationError } from "@shared/errors/errors";

export function registerMessageHandlers(
    socket: Socket,
    broadcaster: MessageBroadcaster,
) {
    socket.on("message:send", async (raw: unknown, ack?: (res: unknown) => void) => {
        try {
            const parsed = SendMessageSchema.safeParse(raw);
            if (!parsed.success) {
                throw new ValidationError(
                    parsed.error.issues[0]?.message ?? "Dados inválidos",
                );
            }

            const payload = await messageService.send(
                {
                    userId: socket.data.userId, 
                    channelId: parsed.data.channelId,
                    content: parsed.data.content,
                    tempId: parsed.data.tempId,
                },
                broadcaster,
            );

            ack?.({ ok: true, tempId: parsed.data.tempId, message: payload });
        } catch (err) {
            const body =
                err instanceof AppError
                    ? { code: err.code, message: err.message }
                    : { code: "INTERNAL", message: "Erro interno" };

            socket.emit("error", body);
            ack?.({ ok: false, ...body });

            if (!(err instanceof AppError)) console.error(err);
        }
    });
}