import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { Switch, View } from "react-native";
import { useCsvExport } from "@/src/features/export/use-csv-export";
import { haptics } from "@/src/features/haptics/haptics";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import type { WeekView } from "@/src/lib/day";
import { requestReviewExplicitly } from "@/src/lib/review-prompt";
import {
  type LanguagePreference,
  type ThemePreference,
  usePreferencesStore,
} from "@/src/stores/preferences";
import { Segmented } from "@/src/ui/segmented";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { RowIcon, SettingsCard, SettingsRow } from "./settings-row";

export const PRIVACY_POLICY_URL = "https://www.matiasturra.dev/privacy/stridr";

function openPrivacyPolicy() {
  WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch((error) =>
    console.error("[settings/openPrivacyPolicy] failed", error),
  );
}

/** Your data out, as a CSV (never paywalled). The privacy policy lives once, in About. */
export function DataActions({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const csv = useCsvExport(stats);
  return (
    <SettingsCard label={t("settings.data.title")}>
      <SettingsRow
        title={csv.busy ? t("common.loading") : t("settings.data.export")}
        subtitle={t("settings.data.exportCaption")}
        right={<RowIcon icon="file-download" />}
        disabled={csv.disabled || csv.busy}
        onPress={() => void csv.run()}
      />
    </SettingsCard>
  );
}

/** Display & feel: theme, language, week view, haptics (CLAUDE.md → Settings). */
export function DisplaySection() {
  const { t } = useTranslation();
  const c = useThemeColors();
  const themePreference = usePreferencesStore((s) => s.themePreference);
  const setThemePreference = usePreferencesStore((s) => s.setThemePreference);
  const languagePreference = usePreferencesStore((s) => s.languagePreference);
  const setLanguagePreference = usePreferencesStore((s) => s.setLanguagePreference);
  const weekView = usePreferencesStore((s) => s.weekView);
  const setWeekView = usePreferencesStore((s) => s.setWeekView);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);

  function onToggleHaptics(next: boolean) {
    setHapticsEnabled(next);
    // HapticsSync applies the toggle on the next effect — sample just after it.
    if (next) setTimeout(haptics.toggleOn, 80);
  }

  return (
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
      <SettingsRow title={t("settings.weekView")} />
      <Segmented<WeekView>
        accessibilityLabel={t("settings.weekView")}
        value={weekView}
        onChange={setWeekView}
        options={[
          { value: "monday", label: t("settings.weekViewMonday") },
          { value: "sunday", label: t("settings.weekViewSunday") },
          { value: "rolling", label: t("settings.weekViewRolling") },
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
    </SettingsCard>
  );
}

/** About + the app version, always last (CLAUDE.md → Settings). */
export function AboutSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "—";

  return (
    <>
      <SettingsCard label={t("settings.about")}>
        <SettingsRow
          title={t("settings.leaveReview")}
          subtitle={t("settings.leaveReviewCaption")}
          right={<RowIcon icon="open-in-new" />}
          onPress={() => void requestReviewExplicitly()}
        />
        <SettingsRow
          title={t("settings.privacyPolicy")}
          subtitle={t("settings.privacyPolicyCaption")}
          right={<RowIcon icon="open-in-new" />}
          onPress={openPrivacyPolicy}
        />
        <SettingsRow
          title={t("settings.viewOnboarding")}
          subtitle={t("settings.viewOnboardingCaption")}
          right={<RowIcon />}
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
