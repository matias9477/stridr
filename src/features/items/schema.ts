import { z } from "zod";
import i18n from "@/src/i18n";

/**
 * Zod input schema for items forms.
 * Error messages are lazy i18n thunks (Zod 4 `error` key) so they follow
 * language changes instead of freezing at module-load time.
 */
export const itemsInput = z.object({
  title: z
    .string({ error: () => i18n.t("validation.titleRequired") })
    .trim()
    .min(1, { error: () => i18n.t("validation.titleRequired") })
    .max(120, { error: () => i18n.t("validation.titleTooLong") }),
  notes: z.string().trim().optional(),
});

export type ItemsFormIn = z.input<typeof itemsInput>;
export type ItemsFormOut = z.output<typeof itemsInput>;
