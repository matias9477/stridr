import { Pressable, View } from "react-native";
import { haptics } from "@/src/features/haptics/haptics";
import { T } from "./typography";

interface SegmentedProps<V extends string> {
  options: readonly { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  /** fill = stretches (range toggle); compact = hugs content (unit switch). */
  layout?: "fill" | "compact";
  accessibilityLabel: string;
}

/** Inverted-selection segmented control (DESIGN.md → Segmented Controllers). */
export function Segmented<V extends string>({
  options,
  value,
  onChange,
  layout = "fill",
  accessibilityLabel,
}: SegmentedProps<V>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row rounded-lg bg-surface-sunken p-1 ${layout === "fill" ? "w-full" : "self-start"}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.tick();
              onChange(option.value);
            }}
            className={`items-center rounded py-1.5 ${layout === "fill" ? "flex-1" : "px-4"} ${
              selected ? "bg-accent-fg" : "active:opacity-60"
            }`}
          >
            <T variant="label" tone={selected ? "on-accent" : "tertiary"}>
              {option.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
