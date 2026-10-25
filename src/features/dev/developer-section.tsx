import { useState } from "react";
import { Alert, Switch } from "react-native";
import { db } from "@/src/db/client";
import { items } from "@/src/db/schema";
import {
  haptics,
  hapticsAvailable,
  setHapticSoundSimulation,
} from "@/src/features/haptics/haptics";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ListRow } from "@/src/ui/list-row";
import { ListSection } from "@/src/ui/list-section";

/**
 * __DEV__-only tools for staging UI states (App Store screenshots, empty
 * states, onboarding re-runs) and exercising flows without hand-editing data.
 * Copy is intentionally English-only — it never ships to users. Rendered at
 * the bottom of Settings, gated on __DEV__ in one place (here).
 */
export function DeveloperSection() {
  const setOnboardingDone = usePreferencesStore((s) => s.setOnboardingDone);
  const [hapticSound, setHapticSound] = useState(false);

  if (!__DEV__) return null;

  function toggleHapticSound(next: boolean) {
    setHapticSound(next);
    setHapticSoundSimulation(next);
  }

  function resetOnboarding() {
    setOnboardingDone(false);
    Alert.alert("Onboarding reset", "Relaunch or navigate to see it again.");
  }

  function deleteAll() {
    Alert.alert("Delete ALL items?", "Dev-only: empties the table to stage empty states.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          db.delete(items)
            .then(() => Alert.alert("Done", "All rows deleted."))
            .catch((error) => console.error("[dev/deleteAll] failed", error));
        },
      },
    ]);
  }

  return (
    <>
      <ListSection title="Developer (dev builds only)">
        <ListRow title="Reset onboarding flag" onPress={resetOnboarding} />
        <ListRow title="Delete all items (stage empty states)" onPress={deleteAll} />
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
