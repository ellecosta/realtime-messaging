import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { authService } from "@modules/auth/auth.service";
import { registerSchema, loginSchema } from "@modules/auth/auth.schemas";
import { ValidationError } from "@shared/errors/errors";

// Envolve uma função async para que erros sejam capturados pelo Express.
// Sem isso, se a função async der throw, o erro some e o request fica pendurado.
function asyncHandler(fn: (req: Request, res: Response) => Promise<unknown>) {
    return function (req: Request, res: Response, next: NextFunction) {
        fn(req, res).catch(next);
    };
}

// Valida o body da requisição contra um schema Zod.
// Se inválido, lança um erro 400 com a mensagem do problema.
// Se válido, retorna os dados já tipados.
function parse<T>(schema: z.ZodType<T>, body: unknown): T {
    const result = schema.safeParse(body);

    if (!result.success) {
        const message = result.error.issues[0]?.message ?? "Dados inválidos";
        throw new ValidationError(message);
    }

    return result.data;
}

export const authRouter = Router();

// POST /auth/register — cria uma conta nova
authRouter.post(
    "/register",
    asyncHandler(async (req, res) => {
        const input = parse(registerSchema, req.body);
        const result = await authService.register(input);
        res.status(201).json(result);
    }),
);

// POST /auth/login — autentica e retorna um token JWT
authRouter.post(
    "/login",
    asyncHandler(async (req, res) => {
        const input = parse(loginSchema, req.body);
        const result = await authService.login(input);
        res.status(200).json(result);
    }),
);

// POST /auth/logout — por enquanto só retorna 204 (sem conteúdo)
authRouter.post("/logout", (_req, res) => {
    res.status(204).send();
});
