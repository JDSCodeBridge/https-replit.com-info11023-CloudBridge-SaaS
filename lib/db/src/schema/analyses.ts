import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { repositoriesTable } from "./repositories";

export const repositoryAnalysesTable = pgTable("repository_analyses", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id").notNull().references(() => repositoriesTable.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull().default(0),
  infrastructureScore: integer("infrastructure_score").notNull().default(0),
  securityScore: integer("security_score").notNull().default(0),
  envVarsScore: integer("env_vars_score").notNull().default(0),
  databaseScore: integer("database_score").notNull().default(0),
  detectedFrameworks: jsonb("detected_frameworks").notNull().default([]),
  detectedBackend: jsonb("detected_backend").notNull().default([]),
  detectedDatabase: jsonb("detected_database").notNull().default([]),
  recommendations: jsonb("recommendations").notNull().default([]),
  deploymentOptions: jsonb("deployment_options").notNull().default([]),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export type RepositoryAnalysis = typeof repositoryAnalysesTable.$inferSelect;
