import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, type LayoutChangeEvent, View, type ViewInstance } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { usePreferencesStore } from "@/src/stores/preferences";
import { Button } from "@/src/ui/button";
import { DURATION } from "@/src/ui/motion";
import { Screen } from "@/src/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/src/ui/state-views";
import { CARD_SIZE, ShareCard } from "./share-card";
import { shareCardImage } from "./share-card-capture";
import { buildShareCard } from "./share-card-model";

/**
 * When the entrance has landed: the hero's digits (up to "104,281") finish
 * rolling last; the bars (sweep + fill) are done before that. Share waits for
 * it so the capture never grabs a half-drawn frame.
 */
const SETTLE_MS = DURATION.roll + 8 * DURATION.rollStagger;

/** Preview modal (docs/spec-share-card.md): the card scaled to fit, one Share button. */
export function ShareCardPreview() {
  const { t } = useTranslation();
  const router = useRouter();
  const stats = useStepStats();
  const { strideMeters } = useEstimationSettings();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<ViewInstance>(null);
  const [settled, setSettled] = useState(reduceMotion);
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState<number | null>(null);

  const model = useMemo(
    () =>
      buildShareCard({
        day: stats.today,
        index: stats.index,
        hourly: stats.hourly,
        nowHour: new Date().getHours(),
        activity: stats.activity[stats.today],
        streaks: stats.streaks,
        strideMeters,
      }),
    [stats.today, stats.index, stats.hourly, stats.activity, stats.streaks, strideMeters],
  );

  const ready = model !== null && scale !== null;
  useEffect(() => {
    if (!ready || reduceMotion) return;
    const id = setTimeout(() => setSettled(true), SETTLE_MS);
    return () => clearTimeout(id);
  }, [ready, reduceMotion]);

  function fit(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setScale(Math.min(1, width / CARD_SIZE.width, height / CARD_SIZE.height));
  }

  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      await shareCardImage(cardRef);
    } catch (error) {
      console.error("[share-card/capture] failed", error);
      Alert.alert(t("shareCard.failedTitle"), t("shareCard.failedBody"));
    } finally {
      setBusy(false);
    }
  }

  if (stats.isLoading) return <LoadingState />;
  if (model === null) {
    if (stats.dbError || stats.healthError) {
      return <ErrorState onRetry={stats.retry} />;
    }
    return <EmptyState message={t("shareCard.empty")} />;
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1 gap-4 p-4">
        <View className="flex-1 items-center justify-center" onLayout={fit}>
          {scale !== null ? (
            // The wrapper takes the scaled footprint; the card keeps its 360×640
            // layout (what gets captured) and is only scaled visually.
            <View
              className="overflow-hidden rounded-2xl border border-border-hairline"
              style={{ width: CARD_SIZE.width * scale, height: CARD_SIZE.height * scale }}
            >
              <View style={{ transform: [{ scale }], transformOrigin: "top left" }}>
                <ShareCard ref={cardRef} model={model} unit={unit} />
              </View>
            </View>
          ) : null}
        </View>
        <Button
          label={t("shareCard.share")}
          onPress={() => void share()}
          disabled={!settled}
          loading={busy}
        />
        {/* Swipe-down dismisses; the explicit exit is for one-handed reach. */}
        <Button label={t("common.cancel")} variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
