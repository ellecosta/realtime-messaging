import { prisma } from "@shared/prisma";
import type { User } from "generated/prisma";

export type CreateUserData = Pick<User, "email" |  "username" | "passwordHash">;

export const userRepo = {
    create(data: CreateUserData): Promise<User> {
        return prisma.user.create({ data });
    },

    findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique( { where:  { email } });
    },

    findById(id: string): Promise<User | null> {
        return prisma.user.findUnique( { where: { id }});
    },
};