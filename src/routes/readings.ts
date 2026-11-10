import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { plants, readings } from "../db/schema.js";
import { idParam, readingCreate, readingQuery } from "../schema.js";

export const readingsRouter = new Hono();

async function plantExists(id: number) {
    const [s] = await db.select({ id: plants.id }).from(plants).where(eq(plants.id, id));
    return !!s; // !! coerces a boolean value
}

// GET /plants/:id/readings
readingsRouter.get("/:id/readings", zValidator("query", readingQuery), zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const { limit } = c.req.valid("query");
    if (!(await plantExists(id))) {
        return c.json({ error: "Plant not found" }, 404);
    }
    const rows = await db.select().from(readings).where(eq(readings.plantId, id)).orderBy(desc(readings.recordedAt)).limit(limit);
    return c.json(rows);
});

// GET /plants/:id/readings/latest
readingsRouter.get("/:id/readings/latest", zValidator("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    if (!(await plantExists(id))) {
        return c.json({ error: "Plant not found" }, 404);
    }
    const [latest] = await db.select().from(readings).where(eq(readings.plantId, id)).orderBy(desc(readings.recordedAt)).limit(1);
    return latest ? c.json(latest) : c.json({ error: "No readings yet" }, 404);
});

// POST /plants/:id/readings
readingsRouter.post("/:id/readings", zValidator("param", idParam), zValidator("json", readingCreate), async (c) => {
    const { id } = c.req.valid("param");
    if (!(await plantExists(id))) return c.json({ error: "Plant not found" }, 404);

    const [created] = await db
        .insert(readings)
        .values({ ...c.req.valid("json"), plantId: id })
        .returning();
    return c.json(created, 201);
});
