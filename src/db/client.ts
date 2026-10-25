import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// enableChangeListener powers drizzle live queries (useLiveQuery / useLiveTablesQuery).
const sqlite = openDatabaseSync("stridr.db", { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
