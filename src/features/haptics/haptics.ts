import { TurboModuleRegistry } from "react-native";

type PulsarModule = typeof import("react-native-pulsar");

let pulsar: PulsarModule | null | undefined;

/**
 * Pulsar's entry calls TurboModuleRegistry.getEnforcing at import time, which
 * throws when the native module isn't in the running binary (a dev client built
 * before Pulsar was added, Expo Go, web). Probe first and lazy-require so a
 * missing module degrades to silence instead of crashing whichever screen
 * happened to import this file first.
 */
function lib(): PulsarModule | null {
  if (pulsar !== undefined) return pulsar;
  pulsar = TurboModuleRegistry.get("RNPulsar")
    ? (require("react-native-pulsar") as PulsarModule)
    : null;
  if (!pulsar && __DEV__) {
    console.warn("[haptics/lib] RNPulsar native module not found; rebuild (npm run ios).");
  }
  return pulsar;
}

/** True when the native haptic engine is in this build. */
export function hapticsAvailable(): boolean {
  return lib() != null;
}

/**
 * Every haptic goes through a named INTENT here — components never call a
 * Pulsar preset directly. Keeps the "feel vocabulary" small and swappable,
 * and the Settings toggle silences everything with one call.
 *
 * Tone: light on touches, rich presets only for real moments, never a
 * punishing buzz on failure. Rename/extend the moments for THIS app's domain
 * (e.g. `streakKept`, `goalReached`) — keep the touch intents as they are.
 * Browse presets in the free "Pulsar" app (App Store / Play) on a real device.
 */
export const haptics = {
  // --- touches (next to the touch) -------------------------------------------
  /** Press-in on a primary button. */
  press: () => lib()?.Presets.System.impactLight(),
  /** Selection tick: picker choice, pager page change, segmented control. */
  tick: () => lib()?.Presets.System.selection(),
  /** Toggle/checkbox turned on. */
  toggleOn: () => lib()?.Presets.System.impactMedium(),
  /** Toggle/checkbox turned off. */
  toggleOff: () => lib()?.Presets.System.impactSoft(),
  /** Irreversible action confirmed (delete). */
  destructive: () => lib()?.Presets.cleave(),

  // --- outcomes ---------------------------------------------------------------
  /** A save/create landed. */
  success: () => lib()?.Presets.System.notificationSuccess(),
  /** Validation failed / action refused. One soft signal, not an alarm. */
  warning: () => lib()?.Presets.System.notificationWarning(),

  // --- moments (fired once, from state — see use-moment-haptic.ts) -----------
  /** The app's big payoff moment (first item, goal reached, purchase). */
  celebrate: () => lib()?.Presets.bloom(),
} as const;

/** Rich (non-System) presets used above; preloaded so the first play lands on the beat. */
const PRELOAD = ["Cleave", "Bloom"];

let engineReady = false;

/** Apply the user's toggle and, once per launch, warm up the engine. Called by HapticsSync. */
export function configureHaptics(enabled: boolean): void {
  const p = lib();
  if (!p) return;
  p.Settings.enableHaptics(enabled);
  if (engineReady) return;
  engineReady = true;
  // Pulsar plays an audible tone per haptic in debug builds (for simulators).
  // Off by default; the DeveloperSection can turn it on for simulator testing.
  p.Settings.enableSound(false);
  p.Settings.preloadPresets(PRELOAD);
}

/** Dev-only: audible simulation of haptics, for the iOS simulator. */
export function setHapticSoundSimulation(on: boolean): void {
  lib()?.Settings.enableSound(on);
}
