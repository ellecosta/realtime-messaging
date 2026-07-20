import "dotenv/config";

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
    return value;
}

export const env = {
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    port: Number(process.env.PORT ?? 3000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173", 
};