import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const cloudAccountsTable = pgTable("cloud_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  credentialsEncrypted: text("credentials_encrypted").notNull(),
  status: text("status").notNull().default("pending"),
  accountLabel: text("account_label"),
  lastValidatedAt: timestamp("last_validated_at"),
  validationError: text("validation_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCloudAccountSchema = createInsertSchema(cloudAccountsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertCloudAccount = z.infer<typeof insertCloudAccountSchema>;
export type CloudAccount = typeof cloudAccountsTable.$inferSelect;
