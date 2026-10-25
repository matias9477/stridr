import { View } from "react-native";
import { IconButton } from "./action-button";
import { PulseDot } from "./pulse-dot";
import { T } from "./typography";

interface AppHeaderProps {
  /** Current section ("TODAY", "STATS"). */
  section: string;
  /** Trailing round action (the avatar button in the design). Omit on the screen it points to. */
  action?: { icon: "person" | "tune"; label: string; onPress: () => void };
}

/**
 * In-content brand bar: "● STRIDR / TODAY". Tabs hide the native stack header
 * (the design's own header replaces it); the native tab bar stays for the
 * liquid-glass navigation.
 */
export function AppHeader({ section, action }: AppHeaderProps) {
  return (
    <View className="h-14 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2" accessibilityRole="header">
        <PulseDot pulse size="md" />
        <T variant="label">STRIDR</T>
        <T variant="label" tone="quiet">
          /
        </T>
        <T variant="micro" tone="tertiary">
          {section}
        </T>
      </View>
      {action ? (
        <IconButton
          icon={action.icon}
          shape="round"
          accessibilityLabel={action.label}
          onPress={action.onPress}
        />
      ) : null}
    </View>
  );
}
