import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { haptics } from "@/src/features/haptics/haptics";
import { usePreferencesStore } from "@/src/stores/preferences";
import { Button } from "@/src/ui/button";
import { DURATION } from "@/src/ui/motion";
import { useThemeColors } from "@/src/ui/theme-colors";

type SlideIcon = keyof typeof Ionicons.glyphMap;

// TODO: replace with slides that sell THIS app's value proposition.
const SLIDES: { key: string; icon: SlideIcon }[] = [
  { key: "welcome", icon: "sparkles-outline" },
  { key: "organize", icon: "list-outline" },
  { key: "ready", icon: "rocket-outline" },
];

/**
 * Skippable at all times (Skip stays visible on every slide). The last slide's
 * CTA drops the user straight into creating their first items — an
 * onboarding should end in the app's core action, not on a dead-end screen.
 * Revisits from Settings just dismiss.
 */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [page, setPage] = useState(0);
  const onboardingDone = usePreferencesStore((s) => s.onboardingDone);
  const setOnboardingDone = usePreferencesStore((s) => s.setOnboardingDone);
  const isLast = page === SLIDES.length - 1;

  const finish = (startCreating: boolean) => {
    if (onboardingDone) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }
    setOnboardingDone(true);
    router.replace("/");
    if (startCreating) router.push("/items/new");
  };

  const onNext = () => {
    if (isLast) {
      finish(true);
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) haptics.tick();
    setPage(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-page">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Text className="text-base font-semibold text-text-primary">Stridr</Text>
        <Pressable
          onPress={() => finish(false)}
          hitSlop={8}
          className="px-2 py-1 active:opacity-60"
        >
          <Text className="text-sm font-semibold text-text-tertiary">{t("onboarding.skip")}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={{ width }} className="items-center justify-center px-10">
            <View className="h-24 w-24 items-center justify-center rounded-3xl border border-border-hairline bg-surface-card">
              <Ionicons name={slide.icon} size={44} color={c.accentFg} />
            </View>
            <Text className="mt-6 text-center text-3xl font-bold text-text-primary">
              {t(`onboarding.${slide.key}Title`)}
            </Text>
            <Text className="mt-4 text-center text-base leading-6 text-text-secondary">
              {t(`onboarding.${slide.key}Body`)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="gap-6 px-8 pb-6">
        <View className="flex-row items-center justify-center gap-2.5">
          {SLIDES.map((slide, i) => (
            <Animated.View
              key={slide.key}
              layout={LinearTransition.duration(DURATION.layout)}
              className={`h-2.5 rounded-full ${i === page ? "w-6 bg-accent-fg" : "w-2.5 bg-border-hairline"}`}
            />
          ))}
        </View>
        <Button
          label={isLast ? t("onboarding.getStarted") : t("onboarding.next")}
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
}
