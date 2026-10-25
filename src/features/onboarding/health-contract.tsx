import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Chip } from "@/src/ui/chip";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Kept in sync with healthkit-service's `toRead` — the slide must never promise less than we read. */
const READ = [{ key: "steps", identifier: "HKStepCount" }] as const;
const NEVER = ["heart", "location", "sleep", "workouts"] as const;

/** inverse = solid accent fill, marking the app's own end of the flow (as in the design). */
function IconBox({ icon, inverse = false }: { icon: IconName; inverse?: boolean }) {
  const c = useThemeColors();
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded ${inverse ? "bg-accent-fg" : "bg-surface-high"}`}
    >
      <MaterialCommunityIcons name={icon} size={20} color={inverse ? c.accentOn : c.textPrimary} />
    </View>
  );
}

/**
 * Onboarding step 1: what the Apple Health connection is — a one-way,
 * read-only flow of step counts into the phone-local app — before iOS shows
 * its permission sheet (spec §3.1, §11).
 */
export function HealthContract() {
  const { t } = useTranslation();
  const c = useThemeColors();
  return (
    <View className="gap-3">
      <View accessible accessibilityLabel={t("onboarding.health.flowA11y")}>
        <Panel className="flex-row items-center justify-between gap-2">
          {/* Ends share the width and wrap; the middle stays narrow so the row never overflows. */}
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <IconBox icon="heart-outline" />
            <View className="min-w-0 flex-1">
              <T variant="label">{t("onboarding.health.source")}</T>
              <T variant="micro" tone="tertiary">
                HealthKit
              </T>
            </View>
          </View>
          <View className="w-16 items-center">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="arrow-right" size={14} color={c.textPrimary} />
              <MaterialCommunityIcons name="lock-outline" size={12} color={c.textPrimary} />
            </View>
            <T variant="micro" className="text-center">
              {t("onboarding.health.oneWay")}
            </T>
          </View>
          <View className="min-w-0 flex-1 flex-row items-center justify-end gap-2">
            <View className="min-w-0 flex-1 items-end">
              <T variant="label" className="text-right">
                Stridr
              </T>
              <T variant="micro" tone="tertiary" className="text-right">
                {t("onboarding.health.local")}
              </T>
            </View>
            <IconBox icon="shoe-print" inverse />
          </View>
        </Panel>
      </View>

      <Panel className="gap-3">
        <PanelHeader
          label={t("onboarding.health.contract")}
          right={
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={c.textTertiary} />
          }
        />
        <View className="gap-3 rounded bg-surface-sunken p-3">
          <View className="flex-row items-center justify-between">
            <T variant="micro" tone="tertiary">
              {t("onboarding.health.reads")}
            </T>
            <T variant="micro" tone="tertiary">
              {t("onboarding.health.metrics", { count: READ.length })}
            </T>
          </View>
          {READ.map((item) => (
            <View key={item.key} className="flex-row items-start gap-2">
              <MaterialCommunityIcons
                name="checkbox-marked-outline"
                size={18}
                color={c.textPrimary}
              />
              <View className="flex-1">
                <T variant="bodyMdMedium" tone="primary">
                  {t(`onboarding.health.read.${item.key}`)}
                </T>
                <T variant="micro" tone="tertiary">
                  {t(`onboarding.health.read.${item.key}Caption`)}
                </T>
              </View>
              <Chip label={item.identifier} variant="high" />
            </View>
          ))}
        </View>
        <View className="gap-3 rounded bg-surface-sunken p-3">
          <T variant="micro" tone="tertiary">
            {t("onboarding.health.never")}
          </T>
          <View className="flex-row flex-wrap gap-y-2">
            {NEVER.map((key) => (
              <View key={key} className="w-1/2 flex-row items-center gap-2">
                <MaterialCommunityIcons name="cancel" size={14} color={c.textTertiary} />
                <T variant="bodySm" tone="secondary">
                  {t(`onboarding.health.blocked.${key}`)}
                </T>
              </View>
            ))}
          </View>
        </View>
      </Panel>

      <Panel className="flex-row gap-3">
        <MaterialCommunityIcons name="cellphone-lock" size={18} color={c.textPrimary} />
        <View className="flex-1 gap-1">
          <T variant="label">{t("onboarding.health.privacyTitle")}</T>
          <T variant="bodySm" tone="secondary">
            {t("onboarding.health.privacyBody")}
          </T>
        </View>
      </Panel>
    </View>
  );
}
