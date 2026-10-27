import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { getAllManualEntries } from "@/src/features/activity/queries";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { shareCsv } from "./csv-export";

/** Export action with its own busy flag and error alert, shared by Stats and Settings. */
export function useCsvExport(stats: StepStats) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (busy) return;
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

  return { run, busy, disabled: !stats.hasAnyData };
}
