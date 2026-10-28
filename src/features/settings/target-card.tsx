import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig } from "react-native-reanimated";
import { GOAL_LIMITS, snapGoal } from "@/src/features/goal/goal-rules";
import { setGoalFromToday } from "@/src/features/goal/queries";
import { haptics } from "@/src/features/haptics/haptics";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { formatCompact, formatSteps } from "@/src/lib/format";
import { CardStateBody, type CardStatus, READY, Skeleton } from "@/src/ui/card-state";
import { Chip } from "@/src/ui/chip";
import { DURATION } from "@/src/ui/motion";
import { T } from "@/src/ui/typography";
import { GoalPicker } from "./goal-picker";
import { NudgesRow } from "./nudges-row";
import { SettingsCard } from "./settings-row";

/**
 * Daily goal (spec §5): optional, a GoalPicker (ruler, ±100, typed entry), a toggle chip to turn it
 * off/on, and the 7-day median as a one-tap suggestion. Each change writes a
 * goal row effective from today (past days keep their goal).
 */
export function TargetCard({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const goal = stats.currentGoal;
  const suggestion = stats.sevenDayMedian === null ? null : snapGoal(stats.sevenDayMedian);

  const status: CardStatus = stats.isLoading
    ? { kind: "loading" }
    : stats.dbError
      ? { kind: "error" }
      : READY;

  // No tick here — the picker's ruler and buttons already buzz.
  function save(next: number | null) {
    setGoalFromToday(next).catch((error) => console.error("[settings/setGoal] failed", error));
  }

  const toggle = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: goal !== null }}
      accessibilityLabel={t("settings.target.toggleA11y")}
      onPress={() => {
        goal === null ? haptics.toggleOn() : haptics.toggleOff();
        save(goal === null ? (suggestion ?? GOAL_LIMITS.suggested) : null);
      }}
      hitSlop={8}
      className="active:opacity-60"
    >
      <Chip
        dot={goal !== null}
        variant="ghost"
        label={goal !== null ? t("settings.target.on") : t("settings.target.off")}
      />
    </Pressable>
  );

  return (
    <SettingsCard
      label={t("settings.target.title")}
      right={status.kind === "ready" ? toggle : null}
    >
      <CardStateBody
        status={status}
        minHeightClass="min-h-24"
        loading={<Skeleton className="h-12 w-full" />}
      >
        {/* Entrances mark the off↔on switch only — opening Settings on a set goal stays still. */}
        <LayoutAnimationConfig skipEntering>
          {goal === null ? (
            // "— STEPS" next to live ± buttons read as broken; one tap starts the goal instead.
            // min-h-12 keeps the empty state from collapsing so the card doesn't jump.
            <Animated.View
              entering={FadeIn.duration(DURATION.enter)}
              exiting={FadeOut.duration(DURATION.exit)}
              className="min-h-12 items-center justify-center py-2"
            >
              <Pressable
                accessibilityRole="button"
                onPressIn={() => haptics.press()}
                onPress={() => save(GOAL_LIMITS.suggested)}
                hitSlop={8}
                className="active:opacity-60"
              >
                <Chip
                  label={t("settings.target.startAt", {
                    steps: formatCompact(GOAL_LIMITS.suggested),
                  })}
                />
              </Pressable>
            </Animated.View>
          ) : (
            <GoalPicker goal={goal} onSave={save} />
          )}
        </LayoutAnimationConfig>
        <Pressable
          accessibilityRole="button"
          accessibilityHint={t("settings.target.useMedianHint")}
          disabled={suggestion === null || suggestion === goal}
          onPress={() => suggestion !== null && save(suggestion)}
          className="flex-row items-center justify-between rounded bg-surface-raised px-2 py-1 active:opacity-60"
        >
          <T variant="bodySm" tone="tertiary">
            {suggestion === null ? t("settings.target.medianEmpty") : t("settings.target.median")}
          </T>
          {stats.sevenDayMedian !== null ? (
            <T variant="label" tone="body">
              {t("settings.target.medianValue", { steps: formatSteps(stats.sevenDayMedian) })}
            </T>
          ) : null}
        </Pressable>
        <NudgesRow hasGoal={goal !== null} />
      </CardStateBody>
    </SettingsCard>
  );
}
