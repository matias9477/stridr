import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import type { ManualActivityRow } from "@/src/db/schema";
import { baseCardStatus } from "@/src/features/stats/card-status";
import type { DailyTotal } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { dayLabel, formatDistance, formatSteps } from "@/src/lib/format";
import { usePreferencesStore } from "@/src/stores/preferences";
import { CardStateBody, type CardStatus, READY, Skeleton } from "@/src/ui/card-state";
import { DURATION } from "@/src/ui/motion";
import { SectionLabel } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { distanceForSteps } from "./estimate";
import { useManualEntries } from "./queries";
import { useEstimationSettings } from "./use-estimation-settings";

/** Days always shown (recent), plus any older day holding a manual entry so it stays editable. */
const RECENT_DAYS = 30;
const INITIAL_ROWS = 4;
/** Rows past this enter together (CLAUDE.md → Motion: cap list staggers). */
const MAX_STAGGERED = 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Recent activity (spec §6.9): one row per day for recorded steps — never
 * one per raw HealthKit sample — with that day's manual entries nested under
 * it, labelled MANUAL and tappable to edit/delete.
 */
export function ActivityLog({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const manual = useManualEntries();
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    const byDay = new Map<DayKey, ManualActivityRow[]>();
    for (const entry of manual.data) {
      const list = byDay.get(entry.day);
      if (list) list.push(entry);
      else byDay.set(entry.day, [entry]);
    }
    const cutoff = addDaysToKey(stats.today, -(RECENT_DAYS - 1));
    return [...stats.days]
      .reverse()
      .filter((d) => (d.day >= cutoff && d.total !== null) || byDay.has(d.day))
      .map((day) => ({ day, entries: byDay.get(day.day) ?? [] }));
  }, [manual.data, stats.days, stats.today]);

  const base = baseCardStatus(stats);
  const status: CardStatus =
    base ??
    (manual.isLoading
      ? { kind: "loading" }
      : manual.error
        ? { kind: "error" }
        : rows.length === 0
          ? { kind: "empty", message: t("stats.log.empty") }
          : READY);

  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);

  return (
    <View className="gap-2">
      <SectionLabel
        label={t("stats.log.title")}
        right={t("stats.log.recent", { count: RECENT_DAYS })}
      />
      <View className="overflow-hidden rounded-lg bg-surface-sunken">
        <CardStateBody
          status={status}
          minHeightClass="min-h-20 px-4"
          loading={
            <View className="gap-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </View>
          }
        >
          {visible.map(({ day, entries }, i) => (
            <Animated.View
              key={day.day}
              // Stagger within each batch (first rows, then the "view more" batch), capped.
              entering={FadeInDown.duration(DURATION.enter).delay(
                Math.min(i < INITIAL_ROWS ? i : i - INITIAL_ROWS, MAX_STAGGERED) * DURATION.stagger,
              )}
              exiting={FadeOut.duration(DURATION.exit)}
              layout={LinearTransition.duration(DURATION.layout)}
            >
              {i > 0 ? <View className="h-px bg-surface-raised" /> : null}
              <DayRow day={day} stats={stats} />
              {entries.map((entry) => (
                <ManualRow key={entry.id} entry={entry} />
              ))}
            </Animated.View>
          ))}
          {rows.length > INITIAL_ROWS ? (
            <AnimatedPressable
              layout={LinearTransition.duration(DURATION.layout)}
              accessibilityRole="button"
              onPress={() => setExpanded((v) => !v)}
              className="items-center border-t border-surface-raised py-3 active:opacity-60"
            >
              <T variant="micro" tone="primary">
                {expanded
                  ? t("common.viewLess")
                  : t("common.viewMore", { count: rows.length - INITIAL_ROWS })}
              </T>
            </AnimatedPressable>
          ) : null}
        </CardStateBody>
      </View>
    </View>
  );
}

function DayRow({ day, stats }: { day: DailyTotal; stats: StepStats }) {
  const { t } = useTranslation();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const { strideMeters } = useEstimationSettings();
  const activity = stats.activity[day.day];
  const relative =
    day.day === stats.today
      ? t("stats.log.today")
      : day.day === addDaysToKey(stats.today, -1)
        ? t("stats.log.yesterday")
        : null;

  const details: string[] = [];
  if (day.total !== null) {
    details.push(
      `${formatDistance(distanceForSteps(day.total, strideMeters), unit, 2)} ${unit === "km" ? "km" : "mi"}`,
    );
  }
  if (activity) details.push(t("stats.log.activeMins", { count: activity.activeMinutes }));
  if (day.manualSteps > 0)
    details.push(t("stats.log.inclManual", { steps: formatSteps(day.manualSteps) }));

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3.5"
      accessible
      accessibilityLabel={`${dayLabel(day.day, "EEEE, MMMM d")}. ${
        day.total === null
          ? t("stats.log.noData")
          : t("stats.log.stepsA11y", { steps: formatSteps(day.total) })
      }. ${details.join(", ")}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <T variant="bodyMdMedium" tone="body">
            {dayLabel(day.day, "EEE, MMM d")}
          </T>
          {relative ? (
            <View className="rounded-sm bg-surface-raised px-1">
              <T variant="micro" tone="tertiary">
                {relative}
              </T>
            </View>
          ) : null}
        </View>
        {details.length > 0 ? (
          <T variant="micro" tone="tertiary" className="normal-case">
            {details.join(" · ")}
          </T>
        ) : null}
      </View>
      <View className="items-end">
        <T variant="label">{day.total === null ? "—" : formatSteps(day.total)}</T>
        <T variant="micro" tone="tertiary">
          {day.total === null ? t("stats.log.noData") : t("stats.log.steps")}
        </T>
      </View>
    </View>
  );
}

function ManualRow({ entry }: { entry: ManualActivityRow }) {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const unit = usePreferencesStore((s) => s.distanceUnit);

  const parts: string[] = [];
  if (entry.kind === "walk") {
    if (entry.distanceMeters !== null) {
      parts.push(`${formatDistance(entry.distanceMeters, unit, 2)} ${unit === "km" ? "km" : "mi"}`);
    }
    if (entry.durationSeconds !== null) {
      parts.push(t("stats.log.minutes", { count: Math.round(entry.durationSeconds / 60) }));
    }
  }
  const title = entry.kind === "walk" ? t("stats.log.manualWalk") : t("stats.log.manualSteps");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formatSteps(entry.steps)} ${t("stats.log.steps")}. ${t("stats.log.editHint")}`}
      onPress={() => router.push({ pathname: "/activity/[id]", params: { id: String(entry.id) } })}
      className="flex-row items-center justify-between bg-surface-card px-4 py-2.5 active:opacity-70"
    >
      <View className="flex-1 flex-row items-center gap-2">
        <MaterialIcons name="subdirectory-arrow-right" size={14} color={c.textTertiary} />
        <View className="rounded-sm border border-text-quiet px-1">
          <T variant="micro" tone="secondary">
            {t("stats.log.manual")}
          </T>
        </View>
        <T variant="bodySm" tone="secondary" numberOfLines={1} className="flex-1">
          {[title, ...parts].join(" · ")}
        </T>
      </View>
      <View className="flex-row items-center gap-1">
        <T variant="label" tone="secondary">
          +{formatSteps(entry.steps)}
        </T>
        <MaterialIcons name="chevron-right" size={16} color={c.textTertiary} />
      </View>
    </Pressable>
  );
}
