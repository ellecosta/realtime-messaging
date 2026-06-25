import { User, CreateUserData } from "../entities/User";

export interface IUserRepository {
    create(data: CreateUserData): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}