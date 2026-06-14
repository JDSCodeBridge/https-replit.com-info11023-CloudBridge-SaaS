import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const repositoriesTable = pgTable("repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  githubUrl: text("github_url").notNull(),
  description: text("description"),
  framework: text("framework"),
  language: text("language"),
  lastCommitAt: timestamp("last_commit_at"),
  deploymentStatus: text("deployment_status").notNull().default("not_deployed"),
  readinessScore: integer("readiness_score"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRepositorySchema = createInsertSchema(repositoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositoriesTable.$inferSelect;
