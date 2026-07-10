import type { Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { AppError } from "./errors/errors";

export interface AuthedRequest<P = ParamsDictionary> extends Request<P> {
    userId?: string;
}

export function errorHandler(
    err: unknown,
    _req: Request, 
    res: Response, 
    _next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ code: err.code, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ code: "INTERNAL", message: "Erro interno" });
}