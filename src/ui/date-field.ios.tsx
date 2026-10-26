import { DatePicker, Host } from "@expo/ui/swift-ui";
import {
  datePickerStyle,
  labelsHidden,
  opacity,
  preferredColorScheme,
} from "@expo/ui/swift-ui/modifiers";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { fromDayKey, toDayKey } from "@/src/lib/day";
import { dayLabel } from "@/src/lib/format";
import type { DateFieldProps } from "./date-field";
import { T } from "./typography";

/**
 * iOS: our own Space Mono date chip with the native compact picker laid over it,
 * near-invisible — SwiftUI's compact button ignores custom fonts, but a tap on it
 * still opens the system calendar. Below 0.01 opacity iOS stops delivering touches,
 * hence 0.02. The app's theme can differ from the system's, so the scheme is passed down.
 */
export function DateField({ value, min, max, onChange, accessibilityLabel }: DateFieldProps) {
  const { colorScheme } = useColorScheme();
  return (
    <View accessibilityLabel={`${accessibilityLabel}: ${dayLabel(value, "MMMM d, yyyy")}`}>
      <View pointerEvents="none" className="rounded bg-surface-card px-3 py-2">
        <T variant="label">{dayLabel(value, "MMM d, yyyy")}</T>
      </View>
      <View className="absolute inset-0 items-center justify-center">
        <Host matchContents>
          <DatePicker
            selection={fromDayKey(value)}
            range={{ start: fromDayKey(min), end: fromDayKey(max) }}
            displayedComponents={["date"]}
            onDateChange={(date) => onChange(toDayKey(date))}
            modifiers={[
              labelsHidden(),
              datePickerStyle("compact"),
              opacity(0.02),
              preferredColorScheme(colorScheme ?? null),
            ]}
          />
        </Host>
      </View>
    </View>
  );
}
