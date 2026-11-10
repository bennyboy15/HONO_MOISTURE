import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireApiKey } from "./middleware/auth.js";
import { plantRouter } from "./routes/plants.js";
import { readingsRouter } from "./routes/readings.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "http://localhost:5173" }));

// --- AUTH MIDDLEWARE ---
app.on(["POST", "PUT", "PATCH", "DELETE"], "/plants", requireApiKey);
app.on(["POST", "PUT", "PATCH", "DELETE"], "/plants/*", requireApiKey);

// --- ROUTES ---
app.route("/plants", plantRouter);
app.route("/plants", readingsRouter);

// --- ERROR HANDLING ---
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
});

serve(
    {
        fetch: app.fetch,
        port: Number(process.env.PORT) || 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
