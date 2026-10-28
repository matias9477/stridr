import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { DeveloperSection } from "@/src/features/dev/developer-section";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import { HealthCard } from "@/src/features/settings/health-card";
import { MetricsCard } from "@/src/features/settings/metrics-card";
import {
  AboutSection,
  DataActions,
  DisplaySection,
} from "@/src/features/settings/preference-sections";
import { ProCard } from "@/src/features/settings/pro-card";
import { TargetCard } from "@/src/features/settings/target-card";
import { WidgetPreviews } from "@/src/features/settings/widget-previews";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { AppHeader } from "@/src/ui/app-header";
import { DURATION } from "@/src/ui/motion";
import { Screen } from "@/src/ui/screen";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const stats = useStepStats();
  const isPro = useIsPro();

  return (
    <Screen>
      <AppHeader section={t("tabs.settings")} />
      <View className="gap-6">
        <TargetCard stats={stats} />
        {/* Glides down instead of jumping when the target card opens its ruler. */}
        <Animated.View layout={LinearTransition.duration(DURATION.layout)} className="gap-6">
          {/* Pro sits high only while there's something to buy; owners find it above About. */}
          {isPro ? null : <ProCard />}
          <WidgetPreviews stats={stats} />
          <HealthCard stats={stats} />
          <DisplaySection />
          <MetricsCard />
          <DataActions stats={stats} />
          {isPro ? <ProCard /> : null}
          <AboutSection />
          <DeveloperSection />
        </Animated.View>
      </View>
    </Screen>
  );
}
