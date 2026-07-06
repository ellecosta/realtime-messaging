import { createApp } from "app";
import { env } from "@shared/env";

const app = createApp();

app.listen(env.port, () => {
    console.log(`Servidor em http://localhost:${env.port}`)
});