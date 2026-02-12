import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  notes: text("notes").default(""),
  archived: boolean("archived").notNull().default(false),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  gapDays: integer("gap_days").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
});

export const holidaySchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export type Holiday = z.infer<typeof holidaySchema>;

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hoursPerDay: integer("hours_per_day").notNull().default(8),
  daysPerWeek: integer("days_per_week").notNull().default(5),
  holidays: jsonb("holidays").$type<Holiday[]>().notNull().default(sql`'[]'::jsonb`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
