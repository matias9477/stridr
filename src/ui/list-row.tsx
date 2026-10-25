import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "./theme-colors";

interface ListRowProps {
  title: string;
  subtitle?: string | undefined;
  onPress?: () => void;
  /** Trailing control (switch, checkmark). Tappable rows without one get a chevron. */
  right?: ReactNode;
}

/**
 * One row of a ListSection (or a grouped list). No border or background of
 * its own — the section draws the card and the separators. Fixed 56pt height
 * with or without a subtitle, so lists stay even: title and subtitle are one
 * line each — keep subtitles short (longer explanations go in the section footer).
 */
export function ListRow({ title, subtitle, onPress, right }: ListRowProps) {
  const c = useThemeColors();
  const trailing =
    right ??
    (onPress ? <Ionicons name="chevron-forward" size={18} color={c.textTertiary} /> : null);
  const content = (
    <View className="h-14 flex-row items-center justify-between px-4">
      <View className="mr-3 flex-1">
        <Text numberOfLines={1} className="text-base text-text-primary">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-sm text-text-tertiary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:bg-surface-sunken">
      {content}
    </Pressable>
  );
}
