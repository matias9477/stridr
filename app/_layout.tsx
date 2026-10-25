import "@/global.css";
import "@/src/i18n";

import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import migrations from "@/drizzle/migrations";
import { db } from "@/src/db/client";
import { initializeAds } from "@/src/features/ads/ads-service";
import { HapticsSync } from "@/src/features/haptics/haptics-sync";
import { LanguageSync } from "@/src/features/i18n/language-sync";
import { usePurchasesStore } from "@/src/features/purchases/purchases-store";
import { ThemeSync } from "@/src/features/theme/theme-sync";
import { WidgetSync } from "@/src/features/widgets/widget-sync";
import { usePreferencesHydrated } from "@/src/stores/preferences";
import { ErrorBoundary } from "@/src/ui/error-boundary";
import { useThemeColors } from "@/src/ui/theme-colors";
import { ThemeRoot } from "@/src/ui/theme-root";

function RootStack() {
  const { t } = useTranslation();
  // expo-router no longer ships React Navigation's ThemeProvider —
  // theme the navigator through screenOptions instead.
  const c = useThemeColors();

  return (
    <Stack
      screenOptions={{
        // iOS: no fill, so the header is the native liquid-glass bar.
        ...(Platform.OS === "ios" ? {} : { headerStyle: { backgroundColor: c.surfaceCard } }),
        headerTintColor: c.textPrimary,
        contentStyle: { backgroundColor: c.surfacePage },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="items/new" options={{ presentation: "modal", title: t("home.new") }} />
      <Stack.Screen name="items/[id]" options={{ title: "" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal", title: t("paywall.title") }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { t } = useTranslation();

  // Boot gates: nothing renders until the DB is migrated and prefs rehydrated.
  const { success: migrated, error: migrationError } = useMigrations(db, migrations);
  const hydrated = usePreferencesHydrated();

  useEffect(() => {
    usePurchasesStore.getState().initialize();
    initializeAds();
  }, []);

  if (migrationError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-page p-6">
        <Text className="text-center text-base text-danger-fg">
          {t("common.error")}: {migrationError.message}
        </Text>
      </View>
    );
  }

  if (!migrated || !hydrated) {
    return <View className="flex-1 bg-surface-page" />;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeRoot>
        <ErrorBoundary>
          <ThemeSync />
          <LanguageSync />
          <HapticsSync />
          <WidgetSync />
          <RootStack />
          <StatusBar style="auto" />
        </ErrorBoundary>
      </ThemeRoot>
    </GestureHandlerRootView>
  );
}
