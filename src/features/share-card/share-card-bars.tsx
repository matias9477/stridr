import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { dayLabel, formatSteps } from "@/src/lib/format";
import { type Bar, BarChart, type BarTone } from "@/src/ui/bar-chart";
import { T } from "@/src/ui/typography";
import type { HourSlot, SecondLayer, WeekSlot } from "./share-card-model";

/** Hours that get a long tick and a label on the ruler. */
const MAJOR_HOURS = [0, 6, 12, 18] as const;

/**
 * The card's second layer: the day by hour on a ruler, or — without hourly
 * data — the last 7 days. Echoes the logo: pill bars, a baseline, a dot.
 */
export function ShareCardBars({ layer }: { layer: SecondLayer }) {
  const { t } = useTranslation();
  const isHourly = layer.kind === "hourly";
  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <T variant="micro" allowFontScaling={false}>
          {isHourly ? t("shareCard.byHour") : t("shareCard.lastWeek")}
        </T>
        {isHourly && layer.loggedExtra !== null ? (
          <T variant="micro" tone="secondary" allowFontScaling={false}>
            {t("shareCard.logged", { steps: formatSteps(layer.loggedExtra) })}
          </T>
        ) : null}
      </View>
      {isHourly ? (
        <HourlyRuler slots={layer.slots} nowHour={layer.nowHour} />
      ) : (
        <WeekRuler slots={layer.slots} />
      )}
    </View>
  );
}

/** Taller bars read brighter, like the logo's peak. */
function heightTone(height: number): BarTone {
  if (height >= 0.75) return "peak";
  if (height >= 0.35) return "strong";
  return "base";
}

function hourBar(slot: HourSlot, hour: number): Bar {
  const key = String(hour);
  const label = `${String(hour).padStart(2, "0")}:00`;
  if (slot.kind === "bar") {
    return { key, value: slot.height, tone: heightTone(slot.height), accessibilityLabel: label };
  }
  // Both are stubs; the future is dimmer than a quiet past hour.
  return {
    key,
    value: null,
    tone: slot.kind === "future" ? "none" : "muted",
    accessibilityLabel: label,
  };
}

function HourlyRuler({ slots, nowHour }: { slots: HourSlot[]; nowHour: number }) {
  return (
    <View>
      <BarChart bars={slots.map(hourBar)} max={1} heightClass="h-36" />
      <View className="mt-1.5 flex-row border-t border-text-quiet pt-1">
        {slots.map((_, hour) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the 24 hours are fixed positions.
          <View key={hour} className="flex-1 items-center">
            {hour === nowHour ? (
              <View className="h-1 w-1 rounded-full bg-accent-fg" />
            ) : (
              <View
                className={`w-px bg-text-quiet ${
                  (MAJOR_HOURS as readonly number[]).includes(hour) ? "h-2" : "h-1"
                }`}
              />
            )}
          </View>
        ))}
      </View>
      <View className="mt-1 flex-row">
        {MAJOR_HOURS.map((hour) => (
          <View key={hour} className="flex-1">
            <T variant="micro" tone="quiet" allowFontScaling={false}>
              {String(hour).padStart(2, "0")}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

function WeekRuler({ slots }: { slots: WeekSlot[] }) {
  const bars: Bar[] = slots.map((s) => ({
    key: s.day,
    value: s.height,
    tone: s.height === null ? "none" : s.isToday ? "peak" : "strong",
    accessibilityLabel: dayLabel(s.day, "EEEE"),
  }));
  return (
    <View>
      <BarChart bars={bars} max={1} heightClass="h-36" gapClass="gap-3" />
      <View className="mt-1.5 flex-row gap-3 border-t border-text-quiet pt-1">
        {slots.map((s) => (
          <View key={s.day} className="flex-1 items-center gap-1">
            {s.isToday ? (
              <View className="h-1 w-1 rounded-full bg-accent-fg" />
            ) : (
              <View className="h-2 w-px bg-text-quiet" />
            )}
            <T variant="micro" tone={s.isToday ? "primary" : "quiet"} allowFontScaling={false}>
              {dayLabel(s.day, "EEEEE")}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}
