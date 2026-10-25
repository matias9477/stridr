import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { CadenceCard } from "@/src/features/today/cadence-card";
import { HeroSteps } from "@/src/features/today/hero-steps";
import { StrideCard } from "@/src/features/today/stride-card";
import { SyncStrip } from "@/src/features/today/sync-strip";
import { TodayActions } from "@/src/features/today/today-actions";
import { TodayMetrics } from "@/src/features/today/today-metrics";
import { useNow } from "@/src/lib/use-now";
import { AppHeader } from "@/src/ui/app-header";
import { Screen } from "@/src/ui/screen";

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const stats = useStepStats();
  const now = useNow();

  return (
    <Screen>
      <AppHeader
        section={t("tabs.today")}
        action={{
          icon: "person",
          label: t("tabs.settings"),
          onPress: () => router.navigate("/settings"),
        }}
      />
      <View className="gap-6">
        <SyncStrip stats={stats} now={now} />
        <HeroSteps stats={stats} now={now} />
        <TodayMetrics stats={stats} />
        <CadenceCard stats={stats} now={now} />
        <StrideCard />
        <TodayActions stats={stats} now={now} />
      </View>
    </Screen>
  );
}
