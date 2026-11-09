import { Hono } from "hono";
import { db } from "../db/index.js";
import { plants } from "../db/schema.js";

export const plantRouter = new Hono();

plantRouter.get("/", async (c) => {
    return c.json(await db.select().from(plants));
});
