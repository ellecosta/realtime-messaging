import type { Response, NextFunction } from "express";
import { verifyToken } from "@shared/jwt";
import { UnauthorizedError } from "@shared/errors/errors";
import type { AuthedRequest } from "@shared/http";

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7): null;

    if (!token) return next(new UnauthorizedError("Token ausente"));

    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
}

