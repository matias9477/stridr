import Constants from "expo-constants";

type NotificationsModule = typeof import("expo-notifications");

let mod: NotificationsModule | null | undefined;

/** Fixed id: rescheduling replaces, cancelling is scoped (spec pace-nudges §Side effects). */
const PACE_NUDGE_ID = "pace-nudge";

export type NotificationPermission = "granted" | "denied" | "undetermined" | "unavailable";

/**
 * The only module importing expo-notifications. Lazy-required because its
 * native module throws at import in a dev client built before it was added;
 * Expo Go is skipped outright (CLAUDE.md → Notifications). Missing → no-ops.
 */
function lib(): NotificationsModule | null {
  if (mod !== undefined) return mod;
  if (Constants.appOwnership === "expo") {
    mod = null;
    return mod;
  }
  try {
    mod = require("expo-notifications") as NotificationsModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    if (__DEV__)
      console.warn("[notifications/lib] native module missing; rebuild (npm run ios).", error);
    mod = null;
  }
  return mod;
}

function toPermission(
  status: { granted: boolean; canAskAgain: boolean; status: string } | null,
): NotificationPermission {
  if (!status) return "unavailable";
  if (status.granted) return "granted";
  return status.status === "undetermined" ? "undetermined" : "denied";
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const n = lib();
  if (!n) return "unavailable";
  try {
    return toPermission(await n.getPermissionsAsync());
  } catch (error) {
    console.error("[notifications/getPermission] failed", error);
    return "unavailable";
  }
}

/** Asks iOS once; later calls just return the stored answer. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const n = lib();
  if (!n) return "unavailable";
  try {
    return toPermission(
      await n.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: false },
      }),
    );
  } catch (error) {
    console.error("[notifications/requestPermission] failed", error);
    return "unavailable";
  }
}

export async function schedulePaceNudge(input: {
  fireAt: Date;
  title: string;
  body: string;
  day: string;
}): Promise<void> {
  const n = lib();
  if (!n) return;
  try {
    await n.scheduleNotificationAsync({
      identifier: PACE_NUDGE_ID,
      content: {
        title: input.title,
        body: input.body,
        sound: false,
        data: { type: "paceNudge", day: input.day },
      },
      trigger: { type: n.SchedulableTriggerInputTypes.DATE, date: input.fireAt },
    });
  } catch (error) {
    console.error("[notifications/schedulePaceNudge] failed", error);
  }
}

export async function cancelPaceNudge(): Promise<void> {
  const n = lib();
  if (!n) return;
  try {
    await n.cancelScheduledNotificationAsync(PACE_NUDGE_ID);
  } catch (error) {
    console.error("[notifications/cancelPaceNudge] failed", error);
  }
}
