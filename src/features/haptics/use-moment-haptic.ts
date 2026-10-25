import { useEffect, useRef } from "react";

/**
 * Plays `play` once each time `active` flips false -> true. Never fires on
 * mount, and while `active` is null (data still loading) it only records the
 * baseline — opening the app on an already-reached goal stays silent.
 * `delay` lets the buzz land on the visual beat of an animation.
 *
 * Moment haptics are derived from STATE in one place (a null-rendering
 * component mounted once), not from whichever screens visualize the moment —
 * tab screens stay mounted, so per-screen firing would double-buzz.
 */
export function useMomentHaptic(active: boolean | null, play: () => void, delay = 0): void {
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (active === null) return;
    if (prev.current === null) {
      prev.current = active;
      return;
    }
    const fired = active && !prev.current;
    prev.current = active;
    if (!fired) return;
    const timer = setTimeout(play, delay);
    return () => clearTimeout(timer);
  }, [active, play, delay]);
}
