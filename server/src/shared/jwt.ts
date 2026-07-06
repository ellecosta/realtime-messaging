import jwt from "jsonwebtoken"
import { env } from "@shared/env"
import { UnauthorizedError } from "./errors/errors";

export interface TokenPayload {
    sub: string;
}

export function signToken(userId: string): string {
    return jwt.sign({ sub: userId}, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        if (typeof decoded === "string" || !decoded.sub) {
            throw new UnauthorizedError("Token inválido");
        }
        return {
            sub: String(decoded.sub)
        }
    }   catch {
            throw new UnauthorizedError("Token inválido ou expirado");
    }
}