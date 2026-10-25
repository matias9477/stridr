import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useHealthStore } from "@/src/features/health/health-store";
import { baseCardStatus } from "@/src/features/stats/card-status";
import { todayProgress } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { formatPercent, formatSteps } from "@/src/lib/format";
import { ActionButton } from "@/src/ui/action-button";
import { CardStateMessage, Skeleton } from "@/src/ui/card-state";
import { DURATION } from "@/src/ui/motion";
import { RollingNumber } from "@/src/ui/rolling-number";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/** The colossal today number, goal percentage, stark progress line and pace. */
export function HeroSteps({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const requestAccess = useHealthStore((s) => s.requestAccess);
  const progress = todayProgress(stats.todayTotal, now);
  const base = baseCardStatus(stats);

  const needsConnect = stats.access === "notRequested" && progress.total === null;
  const value = progress.total === null ? "—" : formatSteps(progress.total);

  return (
    <View className="py-2">
      <View className="mb-1 flex-row items-baseline justify-between">
        <T variant="micro" tone="tertiary">
          {t("today.hero.label")}
        </T>
        {progress.percent !== null && !base ? (
          <RollingNumber variant="label" value={formatPercent(progress.percent)} />
        ) : null}
      </View>

      {base?.kind === "loading" ? (
        <View className="gap-3 py-2">
          <Skeleton className="h-14 w-3/5" />
          <Skeleton className="h-3 w-full" />
        </View>
      ) : (
        <>
          <RollingNumber
            variant="display"
            value={value}
            accessibilityLabel={
              progress.total === null
                ? t("today.hero.noDataA11y")
                : t("today.hero.a11y", { steps: value })
            }
          />
          <View className="mb-4 mt-1 flex-row items-center justify-between">
            <T variant="label" tone="secondary">
              {t("today.hero.stepsToday")}
            </T>
            {progress.goal !== null ? (
              <T variant="label" tone="tertiary">
                {t("today.hero.target", { goal: formatSteps(progress.goal) })}
              </T>
            ) : null}
          </View>

          {base ? (
            <CardStateMessage status={base} />
          ) : needsConnect ? (
            <View className="gap-2">
              <T variant="bodySm" tone="tertiary">
                {t("today.hero.connectBody")}
              </T>
              <ActionButton
                label={t("today.hero.connect")}
                icon="favorite"
                variant="secondary"
                onPress={() => void requestAccess()}
              />
            </View>
          ) : progress.goal === null ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/settings")}
              className="self-start active:opacity-60"
            >
              <View className="flex-row items-center gap-1.5 rounded bg-surface-card px-2 py-1">
                <MaterialIcons name="flag" size={13} color={c.textPrimary} />
                <T variant="micro" tone="primary">
                  {t("today.hero.setTarget")}
                </T>
              </View>
            </Pressable>
          ) : (
            <>
              <ProgressLine fill={progress.fill} marker={progress.goalMarker} />
              <View className="mt-2.5 flex-row items-center justify-between">
                <PaceChip delta={progress.paceDelta} goalMet={progress.goalMet} />
                <T variant="micro" tone="tertiary">
                  {progress.goalMet
                    ? progress.percent !== null && progress.percent > 100
                      ? t("today.hero.goalExceeded")
                      : t("today.hero.goalReached")
                    : t("today.hero.toGo", { steps: formatSteps(progress.remaining ?? 0) })}
                </T>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

/** 3pt track, fill scaled to max(goal, steps), 1pt tick at the 100% mark. */
function ProgressLine({ fill, marker }: { fill: number; marker: number | null }) {
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(0);

  useEffect(() => {
    width.set(withTiming(fill, { duration: reduceMotion ? 0 : DURATION.fill }));
  }, [fill, reduceMotion, width]);

  // Animate scaleX, not width (CLAUDE.md → Motion): transform-only, anchored left.
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: width.get() }] }));

  return (
    <View className="h-[3px] w-full overflow-hidden bg-surface-high" accessible={false}>
      <Animated.View
        className="h-full w-full bg-accent-fg"
        style={[{ transformOrigin: "left center" }, style]}
      />
      {marker !== null && marker < 1 ? (
        <View
          className="absolute bottom-0 top-0 w-px bg-text-tertiary"
          style={{ left: `${marker * 100}%` }}
        />
      ) : null}
    </View>
  );
}

function PaceChip({ delta, goalMet }: { delta: number | null; goalMet: boolean }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  if (delta === null && !goalMet) return <View />;
  const ahead = goalMet || (delta ?? 0) >= 0;
  const label =
    delta === null
      ? t("today.hero.onPace")
      : ahead
        ? t("today.hero.ahead", { steps: formatSteps(Math.abs(delta)) })
        : t("today.hero.behind", { steps: formatSteps(Math.abs(delta)) });
  return (
    <View className="flex-row items-center gap-1.5 rounded bg-surface-card px-2 py-1">
      <MaterialIcons name={ahead ? "north-east" : "south-east"} size={13} color={c.textPrimary} />
      <T variant="micro" tone="primary">
        {label}
      </T>
    </View>
  );
}
