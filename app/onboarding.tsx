import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GOAL_LIMITS } from "@/src/features/goal/goal-rules";
import { setGoalFromToday } from "@/src/features/goal/queries";
import { haptics } from "@/src/features/haptics/haptics";
import { useHealthStore } from "@/src/features/health/health-store";
import { NudgePreview } from "@/src/features/notifications/nudge-preview";
import { useEnableNudges } from "@/src/features/notifications/use-enable-nudges";
import { GoalStep } from "@/src/features/onboarding/goal-step";
import { HealthContract } from "@/src/features/onboarding/health-contract";
import { OnboardingSlide } from "@/src/features/onboarding/onboarding-slide";
import { DEFAULT_HEIGHT_CM, StrideCalibration } from "@/src/features/onboarding/stride-calibration";
import { PaywallGallery } from "@/src/features/purchases/paywall-gallery";
import { ProOfferActions } from "@/src/features/purchases/pro-offer-actions";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import { useProOffer } from "@/src/features/purchases/use-pro-offer";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { DURATION } from "@/src/ui/motion";
import { PulseDot } from "@/src/ui/pulse-dot";
import { T } from "@/src/ui/typography";

const SLIDES = ["health", "calibrate", "goal", "nudges", "pro"] as const;

/**
 * Skippable at all times (Skip stays visible on every slide). Step 1 explains
 * the read-only Health contract and its CTA asks for access right there — the
 * moment the user understands why it's needed (spec §3.1, §11). The last
 * slide is Pro (docs/spec-pro-split.md §3): buying or continuing free both
 * finish, and finishing asks for Health again only if step 1 was swiped past. Skipping leaves the
 * connect CTA on Today. Revisits from Settings just dismiss. The calibrate
 * slide only saves the height on "Confirm" — swiping past it keeps the default
 * stride (spec decision 4). The goal slide works the same way: only "Set
 * target" writes it, so swiping past leaves the goal as it was. The Pro slide
 * shows the paywall's own copy and screenshot gallery, so the two never drift.
 */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [page, setPage] = useState(0);
  const onboardingDone = usePreferencesStore((s) => s.onboardingDone);
  const setOnboardingDone = usePreferencesStore((s) => s.setOnboardingDone);
  const requestHealthAccess = useHealthStore((s) => s.requestAccess);
  const healthAccess = useHealthStore((s) => s.access);
  const nudgesEnabled = usePreferencesStore((s) => s.paceNudgesEnabled);
  const nudges = useEnableNudges();
  const [connecting, setConnecting] = useState(false);
  const storedHeightCm = usePreferencesStore((s) => s.heightCm);
  const setHeightCm = usePreferencesStore((s) => s.setHeightCm);
  const setStrideCm = usePreferencesStore((s) => s.setStrideCm);
  const [heightCm, setDraftHeightCm] = useState(storedHeightCm ?? DEFAULT_HEIGHT_CM);
  const stats = useStepStats();
  const [goal, setDraftGoal] = useState<number | null>(null);
  // Until touched, the draft follows what's saved (a revisit from Settings) or the default.
  const goalDraft = goal ?? stats.currentGoal ?? GOAL_LIMITS.suggested;
  const isPro = useIsPro();
  const isLast = page === SLIDES.length - 1;
  const slideKey = SLIDES[page];
  // Already asked (or no HealthKit at all): connecting again would be a no-op.
  const canConnect = healthAccess === "notRequested";

  const finish = (connectHealth: boolean) => {
    if (onboardingDone) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }
    setOnboardingDone(true);
    router.replace("/");
    if (connectHealth) void requestHealthAccess();
  };

  const offer = useProOffer({ onUnlocked: () => finish(canConnect), enabled: !isPro });

  const onNext = () => {
    if (isLast) {
      finish(canConnect);
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  const onConnect = async () => {
    if (canConnect) {
      setConnecting(true);
      await requestHealthAccess();
      setConnecting(false);
    }
    onNext();
  };

  const onEnableNudges = async () => {
    if (!nudgesEnabled) await nudges.enable();
    onNext();
  };

  const onConfirmHeight = () => {
    setHeightCm(heightCm);
    // Same as Settings → stride → height: height only drives stride with no manual override.
    setStrideCm(null);
    onNext();
  };

  const onConfirmGoal = () => {
    setGoalFromToday(goalDraft).catch((error) =>
      console.error("[onboarding/setGoal] failed", error),
    );
    onNext();
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) haptics.tick();
    setPage(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-page">
      <View className="flex-row items-center justify-between px-6 pt-2">
        {/* Same brand mark as AppHeader; the dot holds still — nothing is live yet. */}
        <View className="flex-row items-center gap-2" accessibilityRole="header">
          <PulseDot size="md" />
          <T variant="label">STRIDR</T>
        </View>
        <Pressable
          onPress={() => finish(false)}
          hitSlop={8}
          accessibilityRole="button"
          className="px-2 py-1 active:opacity-60"
        >
          <T variant="label" tone="tertiary">
            {t("onboarding.skip")}
          </T>
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
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={slide}
            width={width}
            step={i + 1}
            total={SLIDES.length}
            // The Pro slide speaks with the paywall's voice — one source for both.
            title={slide === "pro" ? t("paywall.title") : t(`onboarding.${slide}.title`)}
            body={slide === "pro" ? t("paywall.subtitle") : t(`onboarding.${slide}.body`)}
          >
            {slide === "health" ? (
              <HealthContract />
            ) : slide === "calibrate" ? (
              <StrideCalibration heightCm={heightCm} onChange={setDraftHeightCm} />
            ) : slide === "goal" ? (
              <GoalStep goal={goalDraft} onChange={setDraftGoal} median={stats.sevenDayMedian} />
            ) : slide === "nudges" ? (
              <NudgePreview />
            ) : (
              <PaywallGallery variant={null} bleedClass="-mx-6" />
            )}
          </OnboardingSlide>
        ))}
      </ScrollView>

      {/* Fixed-height footer, top-aligned: dots and the primary button land on the same
          spot on every step; what's under the button (hint, "Maybe later", restore +
          terms) fills the reserved space instead of pushing them up. Sized to the Pro step. */}
      <View className="min-h-40 gap-5 px-8">
        <View className="flex-row items-center justify-center gap-2.5">
          {SLIDES.map((slide, i) => (
            <Animated.View
              key={slide}
              layout={LinearTransition.duration(DURATION.layout)}
              className={`h-2.5 rounded-full ${i === page ? "w-6 bg-accent-fg" : "w-2.5 bg-border-hairline"}`}
            />
          ))}
        </View>
        {slideKey === "health" ? (
          <ActionButton
            label={canConnect ? t("onboarding.health.connect") : t("onboarding.next")}
            onPress={() => void onConnect()}
            loading={connecting}
          />
        ) : slideKey === "calibrate" ? (
          <View className="gap-3">
            <ActionButton label={t("onboarding.calibrate.confirm")} onPress={onConfirmHeight} />
            <T variant="bodySm" tone="secondary" className="text-center">
              {t("onboarding.calibrate.later")}
            </T>
          </View>
        ) : slideKey === "goal" ? (
          <View className="gap-3">
            <ActionButton label={t("onboarding.goal.confirm")} onPress={onConfirmGoal} />
            <T variant="bodySm" tone="secondary" className="text-center">
              {t("onboarding.goal.later")}
            </T>
          </View>
        ) : slideKey === "nudges" ? (
          <View className="gap-3">
            <ActionButton
              label={nudgesEnabled ? t("onboarding.next") : t("onboarding.nudges.enable")}
              onPress={() => void onEnableNudges()}
              loading={nudges.busy}
            />
            {nudgesEnabled ? null : (
              <Pressable
                onPress={onNext}
                hitSlop={8}
                accessibilityRole="button"
                className="items-center py-1 active:opacity-60"
              >
                <T variant="label" tone="secondary">
                  {t("onboarding.nudges.later")}
                </T>
              </Pressable>
            )}
          </View>
        ) : isPro ? (
          <ActionButton
            label={canConnect ? t("onboarding.getStarted") : t("onboarding.finish")}
            onPress={onNext}
          />
        ) : (
          <ProOfferActions offer={offer} onContinueFree={onNext} />
        )}
      </View>
    </SafeAreaView>
  );
}
