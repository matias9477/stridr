import { useState } from "react";
import { Alert, Switch } from "react-native";
import { deleteAllManualEntries, seedManualEntries } from "@/src/features/activity/queries";
import { deleteGoalHistory } from "@/src/features/goal/queries";
import {
  haptics,
  hapticsAvailable,
  setHapticSoundSimulation,
} from "@/src/features/haptics/haptics";
import { useHealthStore } from "@/src/features/health/health-store";
import {
  requestNotificationPermission,
  schedulePaceNudge,
} from "@/src/features/notifications/notifications-service";
import { addDaysToKey, todayKey } from "@/src/lib/day";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ListRow } from "@/src/ui/list-row";
import { ListSection } from "@/src/ui/list-section";
import { LONG_HISTORY_DAYS, mockHealthData } from "./mock-health";

/**
 * __DEV__-only tools for staging UI states (App Store screenshots, empty
 * states, onboarding re-runs) and exercising flows without hand-editing data.
 * Copy is intentionally English-only — it never ships to users. Rendered at
 * the bottom of Settings, gated on __DEV__ in one place (here).
 */
export function DeveloperSection() {
  const setOnboardingDone = usePreferencesStore((s) => s.setOnboardingDone);
  const [hapticSound, setHapticSound] = useState(false);
  const setMockData = useHealthStore((s) => s.setMockData);
  const [healthMock, setHealthMock] = useState<"off" | "recent" | "years">("off");

  if (!__DEV__) return null;

  // The two mocks are exclusive: turning one on replaces the other.
  function toggleHealthMock(kind: "recent" | "years", on: boolean) {
    setHealthMock(on ? kind : "off");
    if (!on) setMockData(null);
    else
      setMockData(
        kind === "years" ? mockHealthData(new Date(), LONG_HISTORY_DAYS) : mockHealthData(),
      );
  }

  function toggleHapticSound(next: boolean) {
    setHapticSound(next);
    setHapticSoundSimulation(next);
  }

  function resetOnboarding() {
    setOnboardingDone(false);
    Alert.alert("Onboarding reset", "Relaunch or navigate to see it again.");
  }

  function run(label: string, action: () => Promise<void>) {
    action()
      .then(() => Alert.alert("Done", label))
      .catch((error) => console.error(`[dev/${label}] failed`, error));
  }

  async function sendTestNudge() {
    if ((await requestNotificationPermission()) !== "granted") {
      Alert.alert(
        "Notifications not granted",
        "Allow them in iOS Settings, or rebuild (npm run ios).",
      );
      return;
    }
    // Replaces today's real nudge until NudgeSync's next reconcile.
    await schedulePaceNudge({
      fireAt: new Date(Date.now() + 5000),
      title: "Behind today's pace",
      body: "About 2,400 steps to your target. (test)",
      day: todayKey(),
    });
    Alert.alert("Test nudge in 5 s", "Lock the device or background the app to see the banner.");
  }

  function seed() {
    // Simulators have no step data — 60 days of manual steps stage every chart and stat.
    const today = todayKey();
    const days = Array.from({ length: 60 }, (_, i) => addDaysToKey(today, -i)).filter(
      // Leave a few holes so "no data" bars and streak gaps are visible too.
      (_, i) => i % 11 !== 5,
    );
    run("Seeded 60 days of manual steps", () => seedManualEntries(days));
  }

  function deleteAll() {
    Alert.alert("Delete ALL manual activity + goal history?", "Dev-only: stages empty states.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          run("Deleted manual activity and goals", async () => {
            await deleteAllManualEntries();
            await deleteGoalHistory();
          }),
      },
    ]);
  }

  return (
    <>
      <ListSection title="Developer (dev builds only)">
        <ListRow title="Reset onboarding flag" onPress={resetOnboarding} />
        <ListRow
          title="Mock HealthKit data"
          subtitle="120 days + per-minute data for the last 8 — not persisted"
          right={
            <Switch
              value={healthMock === "recent"}
              onValueChange={(on) => toggleHealthMock("recent", on)}
            />
          }
        />
        <ListRow
          title="Mock HealthKit data — 10 years"
          subtitle="Daily back to 2017, seasonal — stresses the ALL chart"
          right={
            <Switch
              value={healthMock === "years"}
              onValueChange={(on) => toggleHealthMock("years", on)}
            />
          }
        />
        <ListRow title="Send test pace nudge (5 s)" onPress={() => void sendTestNudge()} />
        <ListRow
          title="Reset daily target"
          subtitle="Clears goal history — the target card goes back to off"
          onPress={() => run("Daily target reset", deleteGoalHistory)}
        />
        <ListRow title="Seed 60 days of manual steps" onPress={seed} />
        <ListRow title="Delete manual activity + goals (empty states)" onPress={deleteAll} />
      </ListSection>

      <ListSection
        title={`Haptics${hapticsAvailable() ? "" : " (native module missing — rebuild)"}`}
      >
        <ListRow
          title="Audible simulation"
          subtitle="Plays a tone per haptic — for the iOS simulator"
          right={<Switch value={hapticSound} onValueChange={toggleHapticSound} />}
        />
        {Object.entries(haptics).map(([name, play]) => (
          <ListRow key={name} title={`Play: ${name}`} onPress={play} />
        ))}
      </ListSection>
    </>
  );
}
