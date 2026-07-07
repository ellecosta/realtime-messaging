import { Router, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "@shared/requireAuth";
import { serverService } from "./servers.service";
import { CreateServerSchema } from "./servers.schemas";
import { ValidationError } from "@shared/errors/errors";
import type { AuthedRequest } from "@shared/http";

function asyncHandler(fn: (req: AuthedRequest, res: Response) => Promise<unknown>) {
    return function (req: AuthedRequest, res: Response, next: NextFunction) {
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

export const serversRouter = Router();

serversRouter.use(requireAuth);

serversRouter.post(
    "/",
    asyncHandler(async (req, res) => {
        const input = parse(CreateServerSchema, req.body);
        const server = await serverService.create(req.userId!, input);
        res.status(201).json(server);
    }),
);

serversRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const servers = await serverService.listMine(req.userId!);
        res.status(200).json(servers);
    }),
);