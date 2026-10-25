import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db/client";
import { isLiveQueryLoading, useLiveQuery } from "@/src/db/live";
import { type ItemsRow, items } from "@/src/db/schema";
import { newUuid } from "@/src/db/uuid";
import type { ItemsFormOut } from "./schema";

/**
 * The only module allowed to touch the items table.
 * Reads are live-query hooks; mutations are plain async functions
 * (live queries re-run automatically after writes).
 */

export function useAllItems() {
  const result = useLiveQuery(db.select().from(items).orderBy(desc(items.createdAt)));
  return { ...result, isLoading: isLiveQueryLoading(result) };
}

export function useItemsById(id: number) {
  const result = useLiveQuery(db.select().from(items).where(eq(items.id, id)), [id]);
  return {
    ...result,
    row: result.data[0] as ItemsRow | undefined,
    isLoading: isLiveQueryLoading(result),
  };
}

export async function createItems(input: ItemsFormOut): Promise<void> {
  await db.insert(items).values({
    uuid: newUuid(),
    title: input.title,
    notes: input.notes ?? null,
  });
}

export async function updateItems(id: number, input: ItemsFormOut): Promise<void> {
  await db
    .update(items)
    .set({ title: input.title, notes: input.notes ?? null, updatedAt: new Date().toISOString() })
    .where(eq(items.id, id));
}

export async function deleteItems(id: number): Promise<void> {
  await db.delete(items).where(eq(items.id, id));
}
