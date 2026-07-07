import express from "express";
import { authRouter } from "@modules/auth/auth.routes";
import { meRouter } from "@modules/me/me.routes";
import { errorHandler } from "@shared/http";
import { serversRouter } from "@modules/servers/servers.routes";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.get("/health", (_req, res) => res.json({ ok: true })); 

    app.use("/auth", authRouter);

    app.use("/servers", serversRouter);

    app.use(meRouter);

    app.use(errorHandler);

    return app;
}

