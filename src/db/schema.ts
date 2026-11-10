import { doublePrecision, foreignKey, index, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const plants = pgTable("plants", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    idealMin: doublePrecision("idealMin"),
    idealMax: doublePrecision("idealMax"),
});

export const readings = pgTable(
    "readings",
    {
        id: serial("id").primaryKey(),
        plantId: integer("plantId").notNull(),
        moisture: doublePrecision("moisture").notNull(),
        recordedAt: timestamp("recordedAt", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("ix_readings_plant_time").on(table.plantId, table.recordedAt),
        foreignKey({
            name: "readings_plantId_fkey",
            columns: [table.plantId],
            foreignColumns: [plants.id],
        }).onDelete("cascade"),
    ],
);
