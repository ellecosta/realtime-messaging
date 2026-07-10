export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly code: string, 
    ) {
        super(message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) { super(409, message, "CONFLICT"); }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Não autenticado") { super(401, message, "UNAUTHORIZED"); }
}

export class ValidationError extends AppError {
    constructor(message: string) { super(400, message, "VALIDATION"); }
}

export class ForbiddenError extends AppError {
    constructor(message = "Acesso negado") { super(403, message, "FORBIDDEN"); }
}

export class NotFoundError extends AppError {
    constructor(message = "Recurso não encontrado") { super(404, message, "NOT_FOUND");     }
}

