import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { haptics } from "@/src/features/haptics/haptics";
import { useThemeColors } from "./theme-colors";
import { T } from "./typography";
import { usePressScale } from "./use-press-scale";

type IconName = keyof typeof MaterialIcons.glyphMap;

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /** primary = solid inverse fill; secondary = raised fill; ghost = bare text (destructive links). */
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  destructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Stretch to the parent width. */
  block?: boolean;
}

/** Space Mono uppercase action (DESIGN.md → Buttons). */
export function ActionButton({
  label,
  onPress,
  icon,
  variant = "primary",
  size = "md",
  destructive = false,
  disabled = false,
  loading = false,
  block = false,
}: ActionButtonProps) {
  const c = useThemeColors();
  const press = usePressScale(0.97);
  const fill =
    variant === "primary" ? "bg-accent-fg" : variant === "secondary" ? "bg-surface-high" : "";
  const tone = destructive ? "danger" : variant === "primary" ? "on-accent" : "primary";
  const iconColor = destructive ? c.dangerFg : variant === "primary" ? c.accentOn : c.textPrimary;
  return (
    <Animated.View style={press.style} className={block ? "flex-1" : ""}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() => {
          press.handlers.onPressIn();
          // Destructive buttons open a confirm — the haptic belongs to the confirm.
          if (!destructive) haptics.press();
        }}
        onPressOut={press.handlers.onPressOut}
        className={`flex-row items-center justify-center gap-2 rounded ${fill} ${
          size === "md" ? "min-h-12 px-4 py-3.5" : "px-3 py-1.5"
        } ${disabled ? "opacity-40" : ""}`}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <>
            {icon ? (
              <MaterialIcons name={icon} size={size === "md" ? 16 : 14} color={iconColor} />
            ) : null}
            <T variant={size === "md" ? "label" : "micro"} tone={tone}>
              {label}
            </T>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /** square = raised 48pt block (share, steppers); round = inverse avatar circle. */
  shape?: "square" | "round";
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  shape = "square",
  disabled = false,
}: IconButtonProps) {
  const c = useThemeColors();
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          press.handlers.onPressIn();
          haptics.press();
        }}
        onPressOut={press.handlers.onPressOut}
        hitSlop={shape === "round" ? 8 : 0}
        className={`items-center justify-center ${
          shape === "round"
            ? "h-8 w-8 rounded-full bg-accent-fg"
            : "h-12 w-12 rounded bg-surface-raised"
        } ${disabled ? "opacity-40" : ""}`}
      >
        <MaterialIcons
          name={icon}
          size={shape === "round" ? 18 : 20}
          color={shape === "round" ? c.accentOn : c.textPrimary}
        />
      </Pressable>
    </Animated.View>
  );
}
