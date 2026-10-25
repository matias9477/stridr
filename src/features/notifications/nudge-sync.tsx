import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { formatSteps } from "@/src/lib/format";
import { usePreferencesStore } from "@/src/stores/preferences";
import {
  cancelPaceNudge,
  getNotificationPermission,
  schedulePaceNudge,
} from "./notifications-service";
import { planPaceNudge } from "./nudge";

/**
 * Invisible: keeps today's single pace nudge in step with the data. Re-runs
 * on every stats change (launch, foreground, HealthKit wakes incl. background
 * delivery, manual edits), on the toggle, and on language change — copy is
 * baked at schedule time, so a new language must reschedule. Mounted once in
 * app/_layout.tsx.
 */
export function NudgeSync(): null {
  const { t } = useTranslation();
  const stats = useStepStats();
  const enabled = usePreferencesStore((s) => s.paceNudgesEnabled);
  const total = stats.todayTotal?.total ?? null;
  const goal = stats.currentGoal;

  useEffect(() => {
    if (stats.isLoading) return;
    let stale = false;
    void (async () => {
      const plan = enabled ? planPaceNudge({ now: new Date(), total, goal }) : null;
      if (!plan || (await getNotificationPermission()) !== "granted") {
        await cancelPaceNudge();
        return;
      }
      if (stale) return;
      await schedulePaceNudge({
        fireAt: plan.fireAt,
        title: t("nudges.notification.title"),
        body: t("nudges.notification.body", { remaining: formatSteps(plan.remaining) }),
        day: stats.today,
      });
    })();
    return () => {
      stale = true;
    };
  }, [stats.isLoading, enabled, total, goal, stats.today, t]);

  return null;
}
