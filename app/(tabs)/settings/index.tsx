import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Switch, Text, View } from "react-native";
import { DeveloperSection } from "@/src/features/dev/developer-section";
import { haptics } from "@/src/features/haptics/haptics";
import { useIsPro, usePurchasesStore } from "@/src/features/purchases/purchases-store";
import { requestReviewExplicitly } from "@/src/lib/review-prompt";
import {
  type LanguagePreference,
  type ThemePreference,
  usePreferencesStore,
} from "@/src/stores/preferences";
import { ListRow } from "@/src/ui/list-row";
import { ListSection } from "@/src/ui/list-section";
import { Screen } from "@/src/ui/screen";
import { useThemeColors } from "@/src/ui/theme-colors";

const PRIVACY_POLICY_URL = "https://www.matiasturra.dev/privacy/stridr";

function Check({ visible }: { visible: boolean }) {
  return visible ? <Text className="text-base font-bold text-accent-fg">✓</Text> : null;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const themePreference = usePreferencesStore((s) => s.themePreference);
  const setThemePreference = usePreferencesStore((s) => s.setThemePreference);
  const languagePreference = usePreferencesStore((s) => s.languagePreference);
  const setLanguagePreference = usePreferencesStore((s) => s.setLanguagePreference);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);
  const c = useThemeColors();
  const isPro = useIsPro();
  const restore = usePurchasesStore((s) => s.restore);
  const [restoring, setRestoring] = useState(false);
  const version = Constants.expoConfig?.version ?? "—";

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("settings.themeLight") },
    { value: "dark", label: t("settings.themeDark") },
  ];
  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: "system", label: t("settings.languageSystem") },
    { value: "en", label: t("settings.languageEnglish") },
    { value: "es", label: t("settings.languageSpanish") },
  ];

  function onToggleHaptics(next: boolean) {
    setHapticsEnabled(next);
    // HapticsSync applies the toggle on the next effect — sample just after it,
    // so turning haptics on is felt immediately.
    if (next) setTimeout(haptics.toggleOn, 80);
  }

  async function onRestore() {
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    Alert.alert(restored ? t("settings.restoreSuccess") : t("settings.restoreNone"));
  }

  function openPrivacyPolicy() {
    void WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch((error) => {
      console.error("[settings/openPrivacyPolicy] failed", error);
    });
  }

  return (
    <Screen>
      <ListSection title={t("settings.appearance")}>
        {themeOptions.map((option) => (
          <ListRow
            key={option.value}
            title={option.label}
            onPress={() => {
              haptics.tick();
              setThemePreference(option.value);
            }}
            right={<Check visible={themePreference === option.value} />}
          />
        ))}
      </ListSection>

      <ListSection title={t("settings.language")}>
        {languageOptions.map((option) => (
          <ListRow
            key={option.value}
            title={option.label}
            onPress={() => {
              haptics.tick();
              setLanguagePreference(option.value);
            }}
            right={<Check visible={languagePreference === option.value} />}
          />
        ))}
      </ListSection>

      <ListSection title={t("settings.feel")}>
        <ListRow
          title={t("settings.haptics")}
          subtitle={t("settings.hapticsCaption")}
          right={
            <Switch
              value={hapticsEnabled}
              onValueChange={onToggleHaptics}
              trackColor={{ true: c.accentFg }}
              accessibilityLabel={t("settings.haptics")}
            />
          }
        />
      </ListSection>

      <ListSection title={t("settings.pro")}>
        <ListRow
          title={isPro ? t("settings.proActive") : t("settings.proInactive")}
          {...(!isPro && {
            subtitle: t("settings.goPro"),
            onPress: () => router.push("/paywall"),
          })}
        />
        <ListRow
          title={restoring ? t("common.loading") : t("settings.restorePurchases")}
          onPress={() => void onRestore()}
        />
      </ListSection>

      <ListSection title={t("settings.about")}>
        <ListRow title={t("settings.leaveReview")} onPress={() => void requestReviewExplicitly()} />
        <ListRow title={t("settings.privacyPolicy")} onPress={openPrivacyPolicy} />
        <ListRow title={t("settings.viewOnboarding")} onPress={() => router.push("/onboarding")} />
      </ListSection>

      <DeveloperSection />

      <View className="mt-2 items-center">
        <Text className="text-sm text-text-tertiary">
          {t("settings.version")} {version}
        </Text>
      </View>
    </Screen>
  );
}
