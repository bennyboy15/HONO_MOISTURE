import { timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { auth, type AuthSession } from "../auth.js";

const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY is not set");

// The only route the sensor device (API key) may call: POST /plants/:id/readings
const DEVICE_ROUTE = /^\/plants\/\d+\/readings\/?$/;

function hasValidApiKey(c: Context) {
    const header = c.req.header("Authorization");
    if (!header?.startsWith("Bearer ")) return false;
    const given = Buffer.from(header.slice(7));
    const expected = Buffer.from(apiKey!);
    return given.length === expected.length && timingSafeEqual(given, expected);
}

export type AuthEnv = {
    Variables: {
        user: AuthSession["user"] | null;
        session: AuthSession["session"] | null;
    };
};

/**
 * Requires a logged-in Better Auth session.
 * Exception: the sensor device may POST readings using the API_KEY bearer token.
 */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
    if (c.req.method === "POST" && DEVICE_ROUTE.test(c.req.path) && hasValidApiKey(c)) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }

    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!result) return c.json({ error: "Unauthorized" }, 401);

    c.set("user", result.user);
    c.set("session", result.session);
    return next();
});
