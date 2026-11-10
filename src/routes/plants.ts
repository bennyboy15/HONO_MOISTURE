import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { plants } from "../db/schema.js";
import { idParam, plantCreate, plantUpdate } from "../schema.js";

export const plantRouter = new Hono();

// GET /plants
plantRouter.get("/", async (c) => {
    return c.json(await db.select().from(plants));
});

// GET /plants/:id
plantRouter.get("/:id", zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant ? c.json(plant) : c.json({ error: "Plant not found" }, 404);
});

// POST /plants
plantRouter.post("/", zValidator("json", plantCreate), async (c) => {
    const [created] = await db.insert(plants).values(c.req.valid("json")).returning();
    return c.json(created, 201);
});

// PATCH /plants/:id
plantRouter.patch("/:id", zValidator("param", idParam), zValidator("json", plantUpdate), async (c) => {
    const { id } = c.req.valid("param");
    const [updated] = await db.update(plants).set(c.req.valid("json")).where(eq(plants.id, id)).returning();
    return updated ? c.json(updated) : c.json({ error: "Plant not found" }, 404);
});

// DELETE /plants/:id
plantRouter.delete("/:id", zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [deleted] = await db.delete(plants).where(eq(plants.id, id)).returning();
    return deleted ? c.body(null, 204) : c.json({ error: "Plant not found" }, 404);
});
