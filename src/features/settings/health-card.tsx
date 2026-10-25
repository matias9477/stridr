import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useHealthStore } from "@/src/features/health/health-store";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { ActionButton } from "@/src/ui/action-button";
import { Chip } from "@/src/ui/chip";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { SettingsCard } from "./settings-row";

/**
 * Apple Health connection status + how to manage it (spec §8, §11). iOS never
 * tells an app whether READ access was granted, so "connected but no steps"
 * gets an explicit hint instead of pretending everything is fine.
 */
export function HealthCard({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const requestAccess = useHealthStore((s) => s.requestAccess);
  const access = stats.access;
  const noHealthData = access === "requested" && !stats.days.some((d) => d.healthSteps !== null);

  const chip =
    access === "requested"
      ? { label: t("settings.health.active"), dot: "pulse" as const }
      : access === "notRequested"
        ? { label: t("settings.health.off"), dot: false }
        : access === "unavailable"
          ? { label: t("settings.health.unavailable"), dot: false }
          : { label: t("common.loading"), dot: false };

  return (
    <SettingsCard label={t("settings.health.title")} right={<Chip variant="raised" {...chip} />}>
      <View className="flex-row items-center justify-between py-1">
        <View className="flex-1 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded bg-surface-high">
            <MaterialIcons name="favorite" size={20} color={c.textPrimary} />
          </View>
          <View>
            <T variant="bodyMdMedium" tone="primary">
              {t("settings.health.name")}
            </T>
            <T variant="micro" tone="tertiary">
              {t("settings.health.readOnly")}
            </T>
          </View>
        </View>
        {access === "notRequested" ? (
          <ActionButton
            size="sm"
            label={t("settings.health.connect")}
            onPress={() => void requestAccess()}
          />
        ) : (
          <T variant="label" tone="tertiary">
            {access === "requested"
              ? stats.healthError
                ? t("settings.health.syncFailed")
                : t("settings.health.synced")
              : "—"}
          </T>
        )}
      </View>

      {access === "unavailable" ? (
        <Note icon="info-outline" text={t("settings.health.unavailableBody")} />
      ) : noHealthData && !stats.isLoading ? (
        <View className="gap-2">
          <Note icon="help-outline" text={t("settings.health.noDataBody")} />
          <ActionButton
            size="sm"
            variant="secondary"
            label={t("settings.health.openHealth")}
            onPress={() =>
              Linking.openURL("x-apple-health://").catch((error) =>
                console.error("[settings/openHealth] failed", error),
              )
            }
          />
        </View>
      ) : null}
      <Note icon="verified-user" text={t("settings.health.privacy")} />
    </SettingsCard>
  );
}

function Note({ icon, text }: { icon: keyof typeof MaterialIcons.glyphMap; text: string }) {
  const c = useThemeColors();
  return (
    <View className="flex-row items-start gap-2 rounded-lg bg-surface-sunken p-2">
      <MaterialIcons name={icon} size={18} color={c.textTertiary} />
      <T variant="bodySm" tone="tertiary" className="flex-1 leading-5">
        {text}
      </T>
    </View>
  );
}
