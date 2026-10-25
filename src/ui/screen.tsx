import type { ReactNode } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  /**
   * Scrollable content (default). Set false for screens that manage their own
   * list — that list must set contentInsetAdjustmentBehavior="automatic" too.
   */
  scroll?: boolean;
  className?: string;
}

/**
 * Page wrapper: themed background + insets. Native headers and the native tab
 * bar float over content (liquid glass on iOS 26), so on iOS the scroll view's
 * automatic inset adjustment clears them instead of hardcoded padding.
 */
export function Screen({ children, scroll = true, className = "" }: ScreenProps) {
  const insets = useSafeAreaInsets();
  if (!scroll) {
    // Native SafeAreaView reads this view's own safe area, which includes the
    // tab bar — so bottom-pinned content (AdBanner) sits above it, not under it.
    return (
      <View className={`flex-1 bg-surface-page ${className}`}>
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
          {children}
        </SafeAreaView>
      </View>
    );
  }
  return (
    <ScrollView
      className={`flex-1 bg-surface-page ${className}`}
      contentContainerClassName="p-4"
      contentInsetAdjustmentBehavior="automatic"
      // Runtime safe-area value — the one allowed numeric style (DESIGN.md).
      // iOS already adds the bottom inset via contentInsetAdjustmentBehavior.
      contentContainerStyle={{ paddingBottom: (Platform.OS === "ios" ? 0 : insets.bottom) + 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
