import { userRepo } from "@modules/auth/user.repo";
import { hashPassword, verifyPassword } from "@shared/password";
import { signToken } from "@shared/jwt";
import { ConflictError, UnauthorizedError } from "@shared/errors/errors";
import type { RegisterInput, LoginInput } from "@modules/auth/auth.schemas" ;

function toPublicUser(u: {
    id: string; email: string, username: string
}) {
    return { id: u.id, email: u.email, username: u.username};
}

export const authService = {
    async register(input: RegisterInput) {
        const existing = await userRepo.findByEmail(input.email);

        if (existing) throw new ConflictError("Email já cadastrado");
        
        const passwordHash = await hashPassword(input.password);
        const user = await userRepo.create({
            email: input.email, 
            username: input.username,
            passwordHash,
        });

        const token = signToken(user.id);
        return {
            user: toPublicUser(user), token
        };
    },

    async login(input: LoginInput) {
        const user = await userRepo.findByEmail(input.email);
        if (!user) throw new UnauthorizedError("Credenciais inválidas");

        const ok = await verifyPassword(input.password, user.passwordHash);
        if (!ok) throw new UnauthorizedError("Credenciais inválidas");

        const token = signToken(user.id);
        return { user: toPublicUser(user), token };
    },
};