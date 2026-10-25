import { useLiveQuery } from "drizzle-orm/expo-sqlite";

/**
 * drizzle's useLiveQuery exposes no isLoading flag; before the first run
 * `data` is an empty array and `updatedAt` is undefined. Treat that as loading
 * so screens can show a spinner instead of flashing an empty state.
 */
export function isLiveQueryLoading(result: { updatedAt?: Date | undefined }): boolean {
  return result.updatedAt === undefined;
}

export { useLiveQuery };
