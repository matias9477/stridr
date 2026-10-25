import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Switch, View } from "react-native";
import { useCsvExport } from "@/src/features/export/use-csv-export";
import { haptics } from "@/src/features/haptics/haptics";
import { useEnableNudges } from "@/src/features/notifications/use-enable-nudges";
import { useIsPro, usePurchasesStore } from "@/src/features/purchases/purchases-store";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { requestReviewExplicitly } from "@/src/lib/review-prompt";
import {
  type LanguagePreference,
  type ThemePreference,
  usePreferencesStore,
} from "@/src/stores/preferences";
import { Segmented } from "@/src/ui/segmented";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { ActionRow, SettingsCard, SettingsRow } from "./settings-row";

export const PRIVACY_POLICY_URL = "https://www.matiasturra.dev/privacy/stridr";

function openPrivacyPolicy() {
  WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch((error) =>
    console.error("[settings/openPrivacyPolicy] failed", error),
  );
}

/** Export CSV + privacy manifesto — the design's two bare action rows. */
export function DataActions({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const csv = useCsvExport(stats);
  return (
    <View className="gap-1">
      <ActionRow
        icon="file-download"
        title={csv.busy ? t("common.loading") : t("settings.data.export")}
        trailing="RAW .CSV"
        disabled={csv.disabled || csv.busy}
        onPress={() => void csv.run()}
      />
      <ActionRow icon="shield" title={t("settings.data.privacy")} onPress={openPrivacyPolicy} />
    </View>
  );
}

/** The standard sections every app keeps (CLAUDE.md → Settings), in the Cadence card style. */
export function PreferenceSections() {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const themePreference = usePreferencesStore((s) => s.themePreference);
  const setThemePreference = usePreferencesStore((s) => s.setThemePreference);
  const languagePreference = usePreferencesStore((s) => s.languagePreference);
  const setLanguagePreference = usePreferencesStore((s) => s.setLanguagePreference);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);
  const nudgesEnabled = usePreferencesStore((s) => s.paceNudgesEnabled);
  const setNudgesEnabled = usePreferencesStore((s) => s.setPaceNudgesEnabled);
  const nudges = useEnableNudges();
  const isPro = useIsPro();
  const restore = usePurchasesStore((s) => s.restore);
  const [restoring, setRestoring] = useState(false);
  const version = Constants.expoConfig?.version ?? "—";

  function onToggleHaptics(next: boolean) {
    setHapticsEnabled(next);
    // HapticsSync applies the toggle on the next effect — sample just after it.
    if (next) setTimeout(haptics.toggleOn, 80);
  }

  async function onRestore() {
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    Alert.alert(restored ? t("settings.restoreSuccess") : t("settings.restoreNone"));
  }

  return (
    <>
      <SettingsCard label={t("settings.display")}>
        <SettingsRow title={t("settings.appearance")} />
        <Segmented<ThemePreference>
          accessibilityLabel={t("settings.appearance")}
          value={themePreference}
          onChange={setThemePreference}
          options={[
            { value: "system", label: t("settings.themeSystem") },
            { value: "light", label: t("settings.themeLight") },
            { value: "dark", label: t("settings.themeDark") },
          ]}
        />
        <SettingsRow title={t("settings.language")} />
        <Segmented<LanguagePreference>
          accessibilityLabel={t("settings.language")}
          value={languagePreference}
          onChange={setLanguagePreference}
          options={[
            { value: "system", label: t("settings.languageSystem") },
            { value: "en", label: "EN" },
            { value: "es", label: "ES" },
          ]}
        />
        <SettingsRow
          title={t("settings.haptics")}
          subtitle={t("settings.hapticsCaption")}
          right={
            <Switch
              value={hapticsEnabled}
              onValueChange={onToggleHaptics}
              trackColor={{ true: c.accentFg, false: c.surfaceHigh }}
              thumbColor={hapticsEnabled ? c.accentOn : undefined}
              accessibilityLabel={t("settings.haptics")}
            />
          }
        />
        <SettingsRow
          title={t("settings.nudges")}
          subtitle={t("settings.nudgesCaption")}
          right={
            <Switch
              value={nudgesEnabled}
              disabled={nudges.busy}
              // Off is instant (NudgeSync cancels); on goes through the iOS permission.
              onValueChange={(next) => (next ? void nudges.enable() : setNudgesEnabled(false))}
              trackColor={{ true: c.accentFg, false: c.surfaceHigh }}
              thumbColor={nudgesEnabled ? c.accentOn : undefined}
              accessibilityLabel={t("settings.nudges")}
            />
          }
        />
      </SettingsCard>

      <SettingsCard label={t("settings.pro")}>
        <SettingsRow
          title={isPro ? t("settings.proActive") : t("settings.proInactive")}
          {...(!isPro && { subtitle: t("settings.goPro"), onPress: () => router.push("/paywall") })}
        />
        <SettingsRow
          title={restoring ? t("common.loading") : t("settings.restorePurchases")}
          onPress={() => void onRestore()}
        />
      </SettingsCard>

      <SettingsCard label={t("settings.about")}>
        <SettingsRow
          title={t("settings.leaveReview")}
          onPress={() => void requestReviewExplicitly()}
        />
        <SettingsRow title={t("settings.privacyPolicy")} onPress={openPrivacyPolicy} />
        <SettingsRow
          title={t("settings.viewOnboarding")}
          onPress={() => router.push("/onboarding")}
        />
      </SettingsCard>

      <View className="items-center">
        <T variant="micro" tone="tertiary">
          {t("settings.version")} {version}
        </T>
      </View>
    </>
  );
}
