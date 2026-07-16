import { Router, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "@shared/requireAuth";
import { inviteService } from "./invites.service";
import { CreateInviteSchema } from "./invites.schemas";
import { ValidationError } from "@shared/errors/errors";
import type { AuthedRequest } from "@shared/http";

type ServerParams = { serverId: string };
type CodeParams = { code: string };

function asyncHandler<P>(fn: (req: AuthedRequest<P>, res: Response) => Promise<unknown>) {
    return (req: AuthedRequest<P>, res: Response, next: NextFunction) =>
        fn(req, res).catch(next);
}

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const result = schema.safeParse(body);
    if (!result.success) {
        throw new ValidationError(result.error.issues[0]?.message ?? "Dados inválidos");
    }
    return result.data;
}

export const serverInvitesRouter = Router({ mergeParams: true });
serverInvitesRouter.use(requireAuth);

serverInvitesRouter.post(
    "/",
    asyncHandler<ServerParams>(async (req, res) => {
        const input = parse(CreateInviteSchema, req.body);
        const invite = await inviteService.create(req.userId!, req.params.serverId!, input);
        res.status(201).json(invite);
    }),
);

export const invitesRouter = Router();
invitesRouter.use(requireAuth);

invitesRouter.get(
    "/:code",
    asyncHandler<CodeParams>(async (req, res) => {
        const preview = await inviteService.preview(req.params.code!);
        res.status(200).json(preview);
    }),
);

invitesRouter.post(
    "/:code/accept",
    asyncHandler<CodeParams>(async (req, res) => {
        const result = await inviteService.accept(req.userId!, req.params.code!);
        res.status(200).json(result);
    }),
);
