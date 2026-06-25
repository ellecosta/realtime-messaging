import { PrismaClient } from "../../generated/prisma";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, CreateUserData } from "../../domain/entities/User";

export class PrismaUserRepository implements IUserRepository {
    constructor (private readonly prisma: PrismaClient) {}

    async create(data: CreateUserData): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where : { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where : { id } });
    }
}

// Quando necessário, é nesse arquivo que se utiliza o Mapper.