import { requireOptionalNativeModule } from "expo";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { nextMidnight } from "@/src/lib/day";
import { usePreferencesStore } from "@/src/stores/preferences";
import { buildWidgetTimeline } from "./widget-snapshot";

type Widgets = {
  steps: typeof import("@/widgets/steps-widget").default;
  ring: typeof import("@/widgets/ring-widget").default;
  bar: typeof import("@/widgets/bar-widget").default;
};

let widgets: Widgets | null | undefined;

/**
 * expo-widgets requires its native module at import time, which throws in
 * Expo Go and in dev clients built before it was added. Probe first and
 * lazy-require so a missing module just means no widget updates.
 */
function loadWidgets(): Widgets | null {
  if (widgets !== undefined) return widgets;
  widgets = requireOptionalNativeModule("ExpoWidgets")
    ? {
        steps: (require("@/widgets/steps-widget") as { default: Widgets["steps"] }).default,
        ring: (require("@/widgets/ring-widget") as { default: Widgets["ring"] }).default,
        bar: (require("@/widgets/bar-widget") as { default: Widgets["bar"] }).default,
      }
    : null;
  return widgets;
}

/**
 * Invisible provider: pushes today's numbers into the widget timeline
 * whenever they change — on launch, foreground, HealthKit observer wakes
 * (incl. background delivery), and manual edits (spec §7). iOS decides when
 * the widget actually redraws, so nothing here promises real time.
 *
 * One payload feeds every family (home 2×2 / 4×2 / 4×4 and the three lock
 * screen slots); the widget picks what its size shows. Widget sync must never
 * break the app, hence the catch-all.
 */
export function WidgetSync(): null {
  const { t } = useTranslation();
  const stats = useStepStats();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const { strideMeters } = useEstimationSettings();

  const { isLoading, todayTotal, currentGoal, days, today, weekView, access, hourly, activity } =
    stats;

  // Explicit fields, not `stats`: the hook returns a fresh object every render,
  // and unrelated health-store updates (lastSyncedAt) shouldn't re-push the timeline.
  useEffect(() => {
    if (Platform.OS !== "ios" || isLoading) return;
    const native = loadWidgets();
    if (!native) return;
    try {
      const { now, midnight } = buildWidgetTimeline({
        stats: {
          todayTotal,
          currentGoal,
          days,
          today,
          weekView,
          access,
          hourly,
          activity,
        },
        unit,
        strideMeters,
        // Pace is judged at push time; the widget shows "Updated HH:mm" so a stale one reads honestly.
        now: new Date(),
        t,
      });
      const entries = [
        { date: new Date(), props: now },
        { date: nextMidnight(), props: midnight },
      ];
      native.steps.updateTimeline(entries);
      // Same payload; the ring and bar read only their slices.
      native.ring.updateTimeline(entries);
      native.bar.updateTimeline(entries);
    } catch (error) {
      console.error("[widgets/widget-sync] timeline update failed", error);
    }
  }, [
    isLoading,
    todayTotal,
    currentGoal,
    days,
    today,
    weekView,
    access,
    hourly,
    activity,
    unit,
    strideMeters,
    t,
  ]);

  return null;
}
