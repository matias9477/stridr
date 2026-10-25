import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { Button } from "./button";
import { useThemeColors } from "./theme-colors";

/**
 * The three data states every async-backed region renders (CLAUDE.md → Data
 * states). Use these instead of ad-hoc spinners/texts so they look the same
 * on every screen.
 */

export function LoadingState() {
  const c = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator color={c.accentFg} />
    </View>
  );
}

interface ErrorStateProps {
  /** Logged by the caller; only the generic message is shown to the user. */
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-center text-base text-danger-fg">{message ?? t("common.error")}</Text>
      {onRetry ? (
        <View className="mt-4">
          <Button label={t("common.retry")} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

/** Says what to do next, never just "No data". */
export function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-24">
      <Text className="text-center text-base text-text-tertiary">{message}</Text>
    </View>
  );
}
