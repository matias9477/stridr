import { haptics } from "@/src/features/haptics/haptics";
import { useMomentHaptic } from "@/src/features/haptics/use-moment-haptic";
import { useStepStats } from "./use-step-stats";

/**
 * Invisible: a warm buzz the moment today's total crosses the goal while the
 * app is open. Derived from state in one place (tab screens stay mounted, so
 * firing from a screen would double-buzz); silent on launch over an
 * already-met goal. Mounted once in app/_layout.tsx.
 */
export function GoalMomentSync(): null {
  const stats = useStepStats();
  const met = stats.isLoading ? null : stats.todayTotal?.goalMet === true;
  useMomentHaptic(met, haptics.celebrate);
  return null;
}
