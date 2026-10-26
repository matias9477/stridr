import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { View, type ViewInstance } from "react-native";
import {
  dayLabel,
  formatDistance,
  formatGoalPercent,
  formatMinutes,
  formatSteps,
} from "@/src/lib/format";
import type { DistanceUnit } from "@/src/stores/preferences";
import { RollingNumber } from "@/src/ui/rolling-number";
import { T } from "@/src/ui/typography";
import { BrandLockup } from "./brand-lockup";
import { ShareCardBars } from "./share-card-bars";
import type { ShareCardModel, ShareStat } from "./share-card-model";

/**
 * Logical canvas, 9:16. Captured at exactly 3× → 1080×1920 (Instagram Story).
 * A DESIGN.md-listed exception to "no raw pixels": the card is a fixed poster.
 */
export const CARD_SIZE = { width: 360, height: 640 } as const;
export const CAPTURE_SIZE = { width: 1080, height: 1920 } as const;

/** Past this many characters the hero drops a size so "104,281" never clips. */
const POSTER_MAX_CHARS = 6;

interface ShareCardProps {
  model: ShareCardModel;
  unit: DistanceUnit;
  ref?: Ref<ViewInstance>;
}

/**
 * The share image. Every text opts out of Dynamic Type so the PNG is the same
 * on every device. Vertical padding keeps content out of the ~13% bands
 * Instagram covers with its own UI.
 */
export function ShareCard({ model, unit, ref }: ShareCardProps) {
  const { t } = useTranslation();
  const steps = formatSteps(model.total);

  return (
    <View
      ref={ref}
      // Android drops views it considers layout-only, which breaks the capture.
      collapsable={false}
      className="bg-surface-page px-8 pb-24 pt-24"
      style={CARD_SIZE}
    >
      <View pointerEvents="none" className="absolute inset-3 border border-text-quiet" />

      <T variant="micro" tone="secondary" allowFontScaling={false}>
        {dayLabel(model.day, "EEE · d MMM")}
      </T>

      <View className="mt-3">
        <RollingNumber
          value={steps}
          variant={steps.length > POSTER_MAX_CHARS ? "display" : "poster"}
          allowFontScaling={false}
        />
        <T variant="label" tone="tertiary" allowFontScaling={false}>
          {t("shareCard.steps")}
        </T>
        {model.percent !== null && model.goal !== null ? (
          <T variant="label" tone="secondary" className="mt-2" allowFontScaling={false}>
            {model.goalMet
              ? t("shareCard.goalMet", { percent: formatGoalPercent(model.percent, true, 0) })
              : t("shareCard.goal", {
                  percent: formatGoalPercent(model.percent, false, 0),
                  goal: formatSteps(model.goal),
                })}
          </T>
        ) : null}
      </View>

      <View className="flex-1 justify-center">
        <ShareCardBars layer={model.second} />
      </View>

      <View className="flex-row gap-4">
        {model.stats.map((stat) => (
          <StatCell key={stat.kind} stat={stat} unit={unit} />
        ))}
      </View>

      <View className="mt-8 items-center">
        <BrandLockup allowFontScaling={false} />
      </View>
    </View>
  );
}

function StatCell({ stat, unit }: { stat: ShareStat; unit: DistanceUnit }) {
  const { t } = useTranslation();
  const [label, value] =
    stat.kind === "distance"
      ? [
          t("shareCard.distance"),
          `${formatDistance(stat.meters, unit)} ${unit === "km" ? "km" : "mi"}`,
        ]
      : stat.kind === "active"
        ? [t("shareCard.active"), formatMinutes(stat.minutes)]
        : [t("shareCard.streak"), t("shareCard.streakDays", { count: stat.days })];
  return (
    <View className="flex-1 gap-1 border-t border-text-quiet pt-2">
      <T variant="micro" allowFontScaling={false}>
        {label}
      </T>
      <T variant="headline" allowFontScaling={false}>
        {value}
      </T>
    </View>
  );
}
