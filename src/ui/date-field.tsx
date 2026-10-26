import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { DayKey } from "@/src/lib/day";
import { dayLabel } from "@/src/lib/format";
import { useThemeColors } from "./theme-colors";
import { T } from "./typography";

export interface DateFieldProps {
  value: DayKey;
  /** Inclusive bounds; days outside can't be picked. */
  min: DayKey;
  max: DayKey;
  onChange: (day: DayKey) => void;
  accessibilityLabel: string;
}

// Material's picker speaks UTC midnights; local conversions would shift the day west of UTC.
const toUtc = (day: DayKey) => new Date(`${day}T00:00:00.000Z`);
const fromUtc = (date: Date): DayKey => date.toISOString().slice(0, 10);

/**
 * Android (iOS has date-field.ios.tsx): a date chip that expands the Material
 * calendar inline beneath it; picking a day collapses it again.
 */
export function DateField({ value, min, max, onChange, accessibilityLabel }: DateFieldProps) {
  const c = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <View className="items-end">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${dayLabel(value, "MMMM d, yyyy")}`}
        onPress={() => setOpen((o) => !o)}
        className="rounded bg-surface-card px-3 py-1.5 active:opacity-60"
      >
        <T variant="label">{dayLabel(value, "MMM d, yyyy")}</T>
      </Pressable>
      {open ? (
        <Host matchContents>
          <DateTimePicker
            initialDate={toUtc(value).toISOString()}
            selectableDates={{ start: toUtc(min), end: toUtc(max) }}
            variant="picker"
            displayedComponents="date"
            color={c.textPrimary}
            onDateSelected={(date) => {
              onChange(fromUtc(date));
              setOpen(false);
            }}
          />
        </Host>
      ) : null}
    </View>
  );
}
