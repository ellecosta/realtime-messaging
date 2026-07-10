import { Router, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "@shared/requireAuth";
import { channelService } from "./channels.service";
import { CreateChannelSchema } from "./channels.schemas";
import { ValidationError } from "@shared/errors/errors";
import type { AuthedRequest } from "@shared/http";

type ServerParams = { serverId: string };

function asyncHandler(fn: (req: AuthedRequest<ServerParams>, res: Response) => Promise<unknown>) {
    return function (req: AuthedRequest<ServerParams>, res: Response, next: NextFunction) {
        fn(req, res).catch(next);
    };
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const result = schema.safeParse(body);
    if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Dados inválidos";
        throw new ValidationError(message);
    }
    return result.data;
}

export const channelsRouter = Router({ mergeParams: true });

channelsRouter.use(requireAuth);

channelsRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const channels = await channelService.list(req.userId!, req.params.serverId!);
        res.status(200).json(channels);
    }),
);

channelsRouter.post(
    "/",
    asyncHandler(async (req, res) => {
        const input = parse(CreateChannelSchema, req.body);
        const channel = await channelService.create(req.userId!, req.params.serverId!, input);
        res.status(201).json(channel);
    }),
);