import { usePreferencesStore } from "@/src/stores/preferences";

type AudioModule = typeof import("expo-audio");
type Player = ReturnType<AudioModule["createAudioPlayer"]>;

let audio: AudioModule | null | undefined;
let players: { minor: Player; major: Player } | null = null;

/**
 * The only module importing expo-audio. Like Pulsar, its entry throws when the
 * native module isn't in the running binary (a dev client built before it was
 * added), so it's lazy-required and a miss degrades to silence.
 */
function load(): typeof players {
  if (players) return players;
  if (audio === undefined) {
    try {
      audio = require("expo-audio") as AudioModule;
      // Respect the ringer switch and never pause the user's music for a click.
      audio
        .setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" })
        .catch((error) => console.error("[haptics/tickSound] audio mode failed", error));
    } catch {
      audio = null;
      if (__DEV__) console.warn("[haptics/tickSound] expo-audio not in this build; rebuild.");
    }
  }
  if (!audio) return null;
  players = {
    minor: audio.createAudioPlayer(require("@/assets/sounds/tick.wav")),
    major: audio.createAudioPlayer(require("@/assets/sounds/tick-major.wav")),
  };
  players.minor.volume = 0.35;
  players.major.volume = 0.6;
  return players;
}

/**
 * Detent click for scrub controls, paired with the haptic tick. Follows the
 * Settings → Feel switch: one toggle silences touch feedback, buzz and click.
 */
export function playTick(major: boolean): void {
  if (!usePreferencesStore.getState().hapticsEnabled) return;
  const p = load();
  if (!p) return;
  const player = major ? p.major : p.minor;
  // Restart rather than queue: a fast scrub should click on every mark, not lag behind.
  player.seekTo(0).catch(() => {});
  player.play();
}
