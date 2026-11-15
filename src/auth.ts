import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

if (!process.env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET is not set");

const frontendOrigin = process.env.NODE_ENV === "development" ? "http://localhost:5173" : process.env.FRONTEND_URL;
if (!frontendOrigin) throw new Error("FRONTEND_URL is not set");

export const auth = betterAuth({
    // BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from env automatically
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    basePath: "/api/auth",
    trustedOrigins: [frontendOrigin],
    emailAndPassword: {
        enabled: true,
        // Invite-only: accounts are created with `pnpm user:create`, never via the API.
        disableSignUp: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // refresh expiry once a day while in use
    },
    // Sessions travel as `Authorization: Bearer <token>` instead of cookies: the frontend is a
    // different site (separate *.onrender.com subdomain) and Safari blocks cross-site cookies.
    // Sign-in returns the signed token in the `set-auth-token` header (exposed via CORS in index.ts).
    plugins: [bearer({ requireSignature: true })],
});

export type AuthSession = typeof auth.$Infer.Session;
