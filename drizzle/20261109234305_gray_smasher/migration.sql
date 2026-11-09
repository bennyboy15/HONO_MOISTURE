CREATE TABLE "plants" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "readings" (
	"id" serial PRIMARY KEY,
	"plantId" integer NOT NULL,
	"moisture" double precision NOT NULL,
	"recordedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ix_readings_plant_time" ON "readings" ("plantId","recordedAt");--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plants"("id") ON DELETE CASCADE;