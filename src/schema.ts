import { z } from "zod";

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const plantCreate = z.object({
    name: z.string().min(1, { error: "Plant name required" }),
});

export const plantUpdate = plantCreate;

export const readingCreate = z.object({
    plantId: z.coerce.number().int().positive(),
    moisture: z.coerce.number(),
});

export const readingQuery = z.object({
    limit: z.coerce.number().int().min(1).max(500).default(50),
});
