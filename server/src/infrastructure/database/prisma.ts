import { PrismaClient } from "@prisma/client/extension";

// Singleton: uma única instância de conexão em toda a aplicação.
// Reaproveitar a mesma instância evita esgotar o pool de conexões do Postgres.
// A URL vem do `env("DATABASE_URL")` declarado no datasource do schema.prisma.
export const prisma = new PrismaClient();