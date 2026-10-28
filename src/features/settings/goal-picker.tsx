import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, TextInput, type TextInputInstance } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { GOAL_LIMITS, snapGoal } from "@/src/features/goal/goal-rules";
import { haptics } from "@/src/features/haptics/haptics";
import { formatCompact, formatSteps } from "@/src/lib/format";
import { Chip } from "@/src/ui/chip";
import { DURATION } from "@/src/ui/motion";
import { ScrubRuler } from "@/src/ui/scrub-ruler";
import { T } from "@/src/ui/typography";

/** Steps per ruler tick — the ruler works in whole units. */
const UNIT = GOAL_LIMITS.grid;
/** A scrub reports every tick; only the value it settles on is worth a DB write. */
const SAVE_DELAY_MS = 400;

/**
 * The goal picker: drag the tape (one tick = 100 steps), or tap the number to
 * type an exact one. No ± row — a one-tick drag is the same nudge, and
 * VoiceOver adjusts the ruler directly. Holds a local draft so a scrub isn't fighting
 * live-query echoes of its own earlier writes.
 */
export function GoalPicker({ goal, onSave }: { goal: number; onSave: (steps: number) => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInputInstance>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState(goal);
  const [typing, setTyping] = useState<string | null>(null);

  // Follow outside changes (median chip) unless a save of our own is still queued.
  useEffect(() => {
    if (pending.current === null) setDraft(goal);
  }, [goal]);

  // Cancel, not flush: unmounting means the goal was just turned off.
  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current);
    },
    [],
  );

  function change(next: number, delay = SAVE_DELAY_MS) {
    const value = snapGoal(next);
    setDraft(value);
    if (pending.current !== null) clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      pending.current = null;
      onSave(value);
    }, delay);
  }

  function commitTyped() {
    const parsed = Number.parseInt((typing ?? "").replace(/\D/g, ""), 10);
    setTyping(null);
    if (!Number.isFinite(parsed)) return;
    // On the commit, not the Done press — tapping outside commits too.
    haptics.tick();
    change(parsed, 0);
  }

  return (
    <Animated.View exiting={FadeOut.duration(DURATION.exit)} className="gap-3 py-2">
      <Animated.View
        entering={FadeInDown.duration(DURATION.enter)}
        className="min-h-12 flex-row items-center justify-center gap-2"
      >
        {typing === null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings.target.a11y", { steps: formatSteps(draft) })}
            accessibilityHint={t("settings.target.typeHint")}
            onPressIn={() => haptics.press()}
            onPress={() => setTyping(String(draft))}
            hitSlop={8}
            className="flex-row items-baseline gap-1 active:opacity-60"
          >
            <T variant="stat">{formatSteps(draft)}</T>
            <T variant="label" tone="tertiary">
              {t("settings.target.steps")}
            </T>
          </Pressable>
        ) : (
          <>
            <TextInput
              ref={inputRef}
              autoFocus
              selectTextOnFocus
              value={typing}
              onChangeText={setTyping}
              onBlur={commitTyped}
              keyboardType="number-pad"
              maxLength={5}
              accessibilityLabel={t("settings.target.title")}
              maxFontSizeMultiplier={1.25}
              className="min-w-24 p-0 text-center font-mono-bold text-stat tracking-stat text-text-primary"
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => inputRef.current?.blur()}
              hitSlop={8}
              className="active:opacity-60"
            >
              <Chip label={t("settings.target.done")} />
            </Pressable>
          </>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.duration(DURATION.enter).delay(DURATION.stagger)}>
        <ScrubRuler
          min={GOAL_LIMITS.min / UNIT}
          max={GOAL_LIMITS.max / UNIT}
          value={draft / UNIT}
          onChange={(units) => change(units * UNIT)}
          labelEvery={1000 / UNIT}
          formatLabel={(units) => formatCompact(units * UNIT)}
          accessibilityLabel={t("settings.target.title")}
          accessibilityValue={t("settings.target.a11y", { steps: formatSteps(draft) })}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(DURATION.enter).delay(2 * DURATION.stagger)}>
        <T variant="micro" tone="tertiary" className="text-center">
          {t("settings.target.fine")}
        </T>
      </Animated.View>
    </Animated.View>
  );
}
