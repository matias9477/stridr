import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";
import { usePreferencesStore } from "@/src/stores/preferences";
import { requestNotificationPermission } from "./notifications-service";

/**
 * Shared "turn pace nudges on" flow (onboarding step 3, Settings switch): ask
 * iOS, and only flip the preference on a grant. A refusal points at iOS
 * Settings, since the app can't ask twice.
 */
export function useEnableNudges() {
  const { t } = useTranslation();
  const setEnabled = usePreferencesStore((s) => s.setPaceNudgesEnabled);
  const [busy, setBusy] = useState(false);

  async function enable(): Promise<boolean> {
    setBusy(true);
    const permission = await requestNotificationPermission();
    setBusy(false);
    if (permission === "granted") {
      setEnabled(true);
      return true;
    }
    if (permission === "denied") {
      Alert.alert(t("nudges.deniedTitle"), t("nudges.deniedBody"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("nudges.openSettings"), onPress: () => void Linking.openSettings() },
      ]);
    }
    return false;
  }

  return { enable, busy };
}
