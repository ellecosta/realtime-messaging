import express from "express";
import { authRouter } from "@modules/auth/auth.routes";
import { meRouter } from "@modules/me/me.routes";
import { errorHandler } from "@shared/http";
import { serversRouter } from "@modules/servers/servers.routes";
import { channelsRouter } from "@modules/channels/channels.routes";
import { invitesRouter, serverInvitesRouter } from "@modules/invites/invites.routes";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.get("/health", (_req, res) => res.json({ ok: true })); 

    app.use("/auth", authRouter);

    app.use("/servers/:serverId/invites", serverInvitesRouter); 

    app.use("/servers/:serverId/channels", channelsRouter);
    
    app.use("/servers", serversRouter);

    app.use("/invites", invitesRouter); 

    app.use(meRouter);

    app.use(errorHandler);

    return app;
}

