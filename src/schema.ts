import { z } from "zod";

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const plantCreate = z.object({
    name: z.string().min(1, { error: "Plant name required" }),
});

export const plantUpdate = plantCreate;
