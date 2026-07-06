import { Router, type Response } from "express";
import { requireAuth } from "@shared/requireAuth";
import { userRepo } from "@modules/auth/user.repo";
import type { AuthedRequest } from "@shared/http";
import { UnauthorizedError } from "@shared/errors/errors";

export const meRouter = Router();

meRouter.get("/me", requireAuth, async (req: AuthedRequest, res: Response) => {
    const user = await userRepo.findById(req.userId!);
    if (!user) throw new UnauthorizedError("Usuário não encontrado");
    res.json({ id: user.id, email: user.email, username: user.username });
});

