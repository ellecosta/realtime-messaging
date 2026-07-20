import { createServer } from "node:http";
import { createApp } from "app";
import { createSocketServer } from "@ws/index";
import { env } from "@shared/env";

const app = createApp();

const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.port, () => {
    console.log(`Servidor em http://localhost:${env.port}`)
});