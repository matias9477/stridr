import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { snapGoal } from "@/src/features/goal/goal-rules";
import { GoalPicker } from "@/src/features/settings/goal-picker";
import { formatSteps } from "@/src/lib/format";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { T } from "@/src/ui/typography";

/**
 * Onboarding's daily-target step: the Settings goal picker over a draft the
 * route saves on "Confirm" (like the height step). When Health already gave
 * us a week, the 7-day median is one tap away — a target from real data.
 */
export function GoalStep({
  goal,
  onChange,
  median,
}: {
  goal: number;
  onChange: (steps: number) => void;
  median: number | null;
}) {
  const { t } = useTranslation();
  const suggestion = median === null ? null : snapGoal(median);

  return (
    <Panel className="gap-2">
      <PanelHeader label={t("onboarding.goal.label")} />
      {/* No save delay: the draft must be current the moment "Confirm" is tapped. */}
      <GoalPicker goal={goal} onSave={onChange} saveDelay={0} />
      {suggestion !== null && median !== null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint={t("settings.target.useMedianHint")}
          disabled={suggestion === goal}
          onPress={() => onChange(suggestion)}
          className="flex-row items-center justify-between rounded bg-surface-raised px-2 py-1 active:opacity-60"
        >
          <T variant="bodySm" tone="tertiary">
            {t("settings.target.median")}
          </T>
          <T variant="label" tone="body">
            {t("settings.target.medianValue", { steps: formatSteps(median) })}
          </T>
        </Pressable>
      ) : null}
    </Panel>
  );
}
