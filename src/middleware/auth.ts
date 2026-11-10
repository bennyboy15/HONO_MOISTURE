import { bearerAuth } from "hono/bearer-auth";

const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY is not set");

export const requireApiKey = bearerAuth({ token: apiKey });
