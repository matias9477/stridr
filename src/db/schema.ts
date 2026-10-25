import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Single source of truth for the local database.
 * After editing: `npm run db:generate`, then reload the app — migrations
 * are applied at boot by useMigrations() in app/_layout.tsx.
 */

/** Shared columns mixed into every table. */
const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Stable cross-device key (expo-crypto UUID) — never reuse the int id outside the device. */
  uuid: text("uuid").notNull().unique(),
  title: text("title").notNull(),
  notes: text("notes"),
  ...timestamps,
});

export type ItemsRow = typeof items.$inferSelect;
export type NewItems = typeof items.$inferInsert;
