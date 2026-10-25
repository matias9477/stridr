import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { usePreferencesStore } from "@/src/stores/preferences";
import { useThemeColors } from "@/src/ui/theme-colors";

/**
 * Native tab bar (UITabBarController / Material bottom nav) — on iOS 26 this is
 * the floating liquid-glass bar. Don't set backgroundColor: it kills the glass.
 * Each tab is a folder with its own TabStack so it gets a native header.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const c = useThemeColors();
  const onboardingDone = usePreferencesStore((s) => s.onboardingDone);

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <NativeTabs
      tintColor={c.accentFg}
      labelStyle={{ default: { color: c.textTertiary }, selected: { color: c.accentFg } }}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>{t("tabs.home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
          selectedColor={c.accentFg}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
          selectedColor={c.accentFg}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
