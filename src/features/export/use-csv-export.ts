import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { getAllManualEntries } from "@/src/features/activity/queries";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { shareCsv } from "./csv-export";

/**
 * Export action with its own busy flag and error alert, shared by Stats and Settings.
 * Pro (docs/spec-pro-split.md §2): when `locked`, `run()` opens the paywall instead.
 */
export function useCsvExport(stats: StepStats) {
  const { t } = useTranslation();
  const router = useRouter();
  const isPro = useIsPro();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (busy) return;
    if (!isPro) {
      router.push("/paywall?variant=export");
      return;
    }
    setBusy(true);
    try {
      await shareCsv(stats.days, await getAllManualEntries());
    } catch (error) {
      console.error("[export/csv] failed", error);
      Alert.alert(t("export.failedTitle"), t("export.failedBody"));
    } finally {
      setBusy(false);
    }
  }

  return { run, busy, disabled: !stats.hasAnyData, locked: !isPro };
}
