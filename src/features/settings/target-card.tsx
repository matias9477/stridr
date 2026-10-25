import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { GOAL_LIMITS, snapGoal } from "@/src/features/goal/goal-rules";
import { setGoalFromToday } from "@/src/features/goal/queries";
import { haptics } from "@/src/features/haptics/haptics";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { formatSteps } from "@/src/lib/format";
import { IconButton } from "@/src/ui/action-button";
import { CardStateBody, type CardStatus, READY, Skeleton } from "@/src/ui/card-state";
import { Chip } from "@/src/ui/chip";
import { T } from "@/src/ui/typography";
import { SettingsCard } from "./settings-row";

/**
 * Daily goal (spec §5): optional, ±500 steppers, a toggle chip to turn it
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

  function save(next: number | null) {
    haptics.tick();
    setGoalFromToday(next).catch((error) => console.error("[settings/setGoal] failed", error));
  }

  const toggle = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: goal !== null }}
      accessibilityLabel={t("settings.target.toggleA11y")}
      onPress={() => save(goal === null ? (suggestion ?? GOAL_LIMITS.suggested) : null)}
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
        <View className="flex-row items-center justify-between py-2">
          <IconButton
            icon="remove"
            accessibilityLabel={t("settings.target.decrease")}
            disabled={goal === null || goal <= GOAL_LIMITS.min}
            onPress={() => goal !== null && save(goal - GOAL_LIMITS.step)}
          />
          <View
            className="flex-row items-baseline gap-1"
            accessible
            accessibilityLabel={
              goal === null
                ? t("settings.target.offA11y")
                : t("settings.target.a11y", { steps: formatSteps(goal) })
            }
          >
            <T variant="stat" tone={goal === null ? "quiet" : "primary"}>
              {goal === null ? "—" : formatSteps(goal)}
            </T>
            <T variant="label" tone="tertiary">
              {t("settings.target.steps")}
            </T>
          </View>
          <IconButton
            icon="add"
            accessibilityLabel={t("settings.target.increase")}
            disabled={goal !== null && goal >= GOAL_LIMITS.max}
            onPress={() => save(goal === null ? GOAL_LIMITS.suggested : goal + GOAL_LIMITS.step)}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityHint={t("settings.target.useMedianHint")}
          disabled={suggestion === null || suggestion === goal}
          onPress={() => suggestion !== null && save(suggestion)}
          className="flex-row items-center justify-between rounded bg-surface-sunken px-2 py-1 active:opacity-60"
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
      </CardStateBody>
    </SettingsCard>
  );
}
