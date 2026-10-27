import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useCsvExport } from "@/src/features/export/use-csv-export";
import { syncedAgo } from "@/src/lib/format";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import type { StepStats } from "./use-step-stats";

/** "☁ SYNCED 2M AGO ··· RAW EXPORT ↓" */
export function StatsFooter({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const csv = useCsvExport(stats);
  // Locked stays tappable even with no data: the tap is the upsell.
  const disabled = csv.disabled && !csv.locked;

  const syncLabel =
    stats.access !== "requested"
      ? t("stats.footer.manualOnly")
      : stats.lastSyncedAt === null
        ? t("common.loading")
        : t("stats.footer.synced", { ago: syncedAgo(stats.lastSyncedAt, now.getTime()) });

  return (
    <View className="flex-row items-center justify-between px-1">
      <View className="flex-row items-center gap-1.5">
        <MaterialIcons name="cloud-done" size={14} color={c.textTertiary} />
        <T variant="micro" tone="tertiary">
          {syncLabel}
        </T>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: csv.busy }}
        disabled={disabled || csv.busy}
        onPress={() => void csv.run()}
        hitSlop={8}
        className={`flex-row items-center gap-1 active:opacity-60 ${disabled ? "opacity-40" : ""}`}
      >
        <T variant="micro" tone="primary">
          {csv.busy ? t("common.loading") : t("stats.footer.export")}
        </T>
        <MaterialIcons
          name={csv.locked ? "lock-outline" : "file-download"}
          size={14}
          color={c.textPrimary}
        />
      </Pressable>
    </View>
  );
}
