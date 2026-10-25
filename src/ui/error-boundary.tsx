import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import i18n from "@/src/i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort boundary above the navigator: without it an unexpected render
 * throw (corrupt DB row, bad migration state) blanks the whole tree.
 * Uses i18n.t directly (class component, no hooks).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ui/error-boundary] render crash", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-surface-page p-6">
          <Text className="text-center text-lg font-semibold text-text-primary">
            {i18n.t("common.error")}
          </Text>
          <Text className="mt-2 text-center text-sm text-text-secondary">
            {this.state.error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            className="mt-6 rounded-xl bg-accent-fg px-6 py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-accent-on">{i18n.t("common.retry")}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
