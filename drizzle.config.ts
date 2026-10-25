import { defineConfig } from "drizzle-kit";

/**
 * Migration workflow (the only supported one for expo-sqlite):
 *   1. Edit src/db/schema.ts
 *   2. npm run db:generate   -> writes SQL + migrations.js barrel into ./drizzle
 *   3. Reload the app        -> useMigrations() in app/_layout.tsx applies them
 *
 * `drizzle-kit studio` / `push` do NOT work against expo-sqlite — don't use them.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
  verbose: true,
  strict: true,
});
