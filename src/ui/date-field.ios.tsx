import { DatePicker, Host } from "@expo/ui/swift-ui";
import {
  datePickerStyle,
  labelsHidden,
  preferredColorScheme,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useColorScheme } from "nativewind";
import { fromDayKey, toDayKey } from "@/src/lib/day";
import type { DateFieldProps } from "./date-field";
import { useThemeColors } from "./theme-colors";

/**
 * iOS: the native compact date button, which pops the system calendar. The app's
 * theme preference can differ from the system's, so the scheme is passed down.
 */
export function DateField({ value, min, max, onChange }: DateFieldProps) {
  const c = useThemeColors();
  const { colorScheme } = useColorScheme();
  return (
    <Host matchContents>
      <DatePicker
        selection={fromDayKey(value)}
        range={{ start: fromDayKey(min), end: fromDayKey(max) }}
        displayedComponents={["date"]}
        onDateChange={(date) => onChange(toDayKey(date))}
        modifiers={[
          labelsHidden(),
          datePickerStyle("compact"),
          tint(c.textPrimary),
          preferredColorScheme(colorScheme ?? null),
        ]}
      />
    </Host>
  );
}
