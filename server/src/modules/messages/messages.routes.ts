import { Router, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "@shared/requireAuth";
import { messageService } from "./messages.service";
import { ListMessagesQuerySchema } from "./messages.schemas";
import { ValidationError } from "@shared/errors/errors";
import type { AuthedRequest } from "@shared/http";

type ChannelParams = { channelId: string };

function asyncHandler<P>(fn: (req: AuthedRequest<P>, res: Response) => Promise<unknown>) {
    return (req: AuthedRequest<P>, res: Response, next: NextFunction) =>
        fn(req, res).catch(next);
}

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new ValidationError(result.error.issues[0]?.message ?? "Dados inválidos");
    }
    return result.data;
}

export const messagesRouter = Router({ mergeParams: true });

messagesRouter.use(requireAuth);

messagesRouter.get(
    "/",
    asyncHandler<ChannelParams>(async (req, res) => {
        const query = parse(ListMessagesQuerySchema, req.query);
        const result = await messageService.listHistory(
            req.userId!,
            req.params.channelId!,
            query,
        );
        res.status(200).json(result);
    }),
);