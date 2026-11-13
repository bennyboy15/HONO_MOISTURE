import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth.js";
import { requireAuth } from "./middleware/auth.js";
import { plantRouter } from "./routes/plants.js";
import { readingsRouter } from "./routes/readings.js";

const app = new Hono();

const origin = process.env.NODE_ENV === "development" ? "http://localhost:5173" : process.env.FRONTEND_URL;
if (!origin) throw new Error("FRONTEND_URL is not set");

app.use("*", logger());
app.use("*", cors({ origin: origin, credentials: true }));

// --- BETTER AUTH (sign-in, sign-out, get-session, change-password, ...) ---
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// --- AUTH MIDDLEWARE (everything under /plants requires login) ---
app.use("/plants", requireAuth);
app.use("/plants/*", requireAuth);

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
