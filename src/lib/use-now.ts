import { useEffect, useState } from "react";

/**
 * Current time, re-rendered every `intervalMs` — for relative labels
 * ("synced 2m ago", "18:42 current", pace) that must tick while the screen
 * stays open. Aligned to the interval boundary so labels flip on the minute.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        setNow(new Date());
        interval = setInterval(() => setNow(new Date()), intervalMs);
      },
      intervalMs - (Date.now() % intervalMs),
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalMs]);
  return now;
}
