/**
 * Create a user account, or reset an existing user's password.
 *
 *   pnpm user:create --email mum@example.com --name "Mum"
 *   pnpm user:create --email mum@example.com --reset
 *
 * The password is prompted for (or pass --password, but it will land in shell history).
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { auth } from "../auth.js";

const { values } = parseArgs({
    options: {
        email: { type: "string" },
        name: { type: "string" },
        password: { type: "string" },
        reset: { type: "boolean", default: false },
    },
});

const email = values.email?.trim().toLowerCase();
if (!email) {
    console.error('Usage: pnpm user:create --email <email> --name "<name>" [--reset]');
    process.exit(1);
}

let password = values.password;
if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password: ");
    rl.close();
}

const ctx = await auth.$context;
const { minPasswordLength, maxPasswordLength } = ctx.password.config;
if (password.length < minPasswordLength || password.length > maxPasswordLength) {
    console.error(`Password must be ${minPasswordLength}-${maxPasswordLength} characters.`);
    process.exit(1);
}

const hash = await ctx.password.hash(password);
const existing = await ctx.internalAdapter.findUserByEmail(email);

if (values.reset) {
    if (!existing) {
        console.error(`No user with email ${email}.`);
        process.exit(1);
    }
    const userId = existing.user.id;
    if (await ctx.internalAdapter.findCredentialAccount(userId)) {
        await ctx.internalAdapter.updatePassword(userId, hash);
    } else {
        await ctx.internalAdapter.linkAccount({ userId, providerId: "credential", accountId: userId, password: hash });
    }
    await ctx.internalAdapter.deleteUserSessions(userId); // sign out everywhere
    console.log(`Password reset for ${email}.`);
} else {
    if (existing) {
        console.error(`User ${email} already exists. Use --reset to change their password.`);
        process.exit(1);
    }
    if (!values.name) {
        console.error("--name is required when creating a user.");
        process.exit(1);
    }
    const user = await ctx.internalAdapter.createUser({ email, name: values.name, emailVerified: true }, { method: "email-password" });
    await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hash });
    console.log(`Created ${values.name} <${email}> (id ${user.id}).`);
}

process.exit(0);
