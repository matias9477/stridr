import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Skeleton, SkeletonText } from "@/src/ui/card-state";
import { T } from "@/src/ui/typography";

/**
 * Loading state of HeroSteps, built from the same rows, spacing and type roles
 * as its ready "goal set" layout (the common case), so the numbers land in
 * place. Static copy ("STEPS TODAY") renders for real; only data pulses.
 * Ghosts are translated strings with placeholder digits, so widths follow the
 * language. Keep in sync with hero-steps.tsx.
 */
export function HeroSkeleton() {
  const { t } = useTranslation();
  return (
    <View accessible accessibilityLabel={t("common.loading")}>
      <SkeletonText variant="display" ghost="0,000" />
      <View className="mb-4 mt-1 flex-row items-center justify-between">
        <T variant="label" tone="secondary">
          {t("today.hero.stepsToday")}
        </T>
        <SkeletonText variant="label" ghost={t("today.hero.target", { goal: "00,000" })} />
      </View>
      <Skeleton className="h-[3px] w-full" />
      <View className="mt-2.5 flex-row items-center justify-between">
        {/* PaceChip's exact box: same padding, a 13pt icon slot and a micro line. */}
        <Skeleton className="flex-row items-center gap-1.5 rounded px-2 py-1">
          <View className="h-[13px] w-[13px]" />
          <T variant="micro" className="opacity-0">
            {t("today.hero.ahead", { steps: "0,000" })}
          </T>
        </Skeleton>
        <SkeletonText variant="micro" ghost={t("today.hero.toGo", { steps: "0,000" })} />
      </View>
    </View>
  );
}
