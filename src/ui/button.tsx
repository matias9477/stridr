import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated from "react-native-reanimated";
import { haptics } from "@/src/features/haptics/haptics";
import { useThemeColors } from "./theme-colors";
import { usePressScale } from "./use-press-scale";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
}

const containerClasses: Record<Variant, string> = {
  primary: "bg-accent-fg",
  secondary: "bg-surface-sunken border border-border-hairline",
  danger: "bg-transparent",
};

const labelClasses: Record<Variant, string> = {
  primary: "text-accent-on",
  secondary: "text-text-primary",
  danger: "text-danger-fg",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const c = useThemeColors();
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() => {
          press.handlers.onPressIn();
          // Danger buttons open a confirm — the destructive haptic fires on confirm, not here.
          if (variant !== "danger") haptics.press();
        }}
        onPressOut={press.handlers.onPressOut}
        className={`min-h-12 items-center justify-center rounded-xl px-4 py-3 active:opacity-80 ${
          containerClasses[variant]
        } ${disabled ? "opacity-40" : ""}`}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? c.accentOn : c.textPrimary} />
        ) : (
          <Text className={`text-base font-semibold ${labelClasses[variant]}`}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
