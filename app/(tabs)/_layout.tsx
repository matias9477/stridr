import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { usePreferencesStore } from "@/src/stores/preferences";
import { useThemeColors } from "@/src/ui/theme-colors";
import { FONT } from "@/src/ui/typography";

/**
 * Native tab bar (UITabBarController) — on iOS 26 the floating liquid-glass
 * bar. Don't set backgroundColor: it kills the glass. Each tab is a folder
 * with its own TabStack; tab roots hide the native header and draw the
 * Cadence AppHeader in content.
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
      labelStyle={{
        default: { color: c.textTertiary, fontFamily: FONT.monoBold },
        selected: { color: c.accentFg, fontFamily: FONT.monoBold },
      }}
    >
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Label>{t("tabs.today")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.walk" md="directions_walk" selectedColor={c.accentFg} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>{t("tabs.stats")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" selectedColor={c.accentFg} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" selectedColor={c.accentFg} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
