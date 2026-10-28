import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { haptics } from "@/src/features/haptics/haptics";
import { T } from "@/src/ui/typography";
import type { ProVariant } from "./types";

type SlideId = "widgets" | "lockScreen" | "stats";

/** Display order. Copy lives under `paywall.slides.<id>`. */
const SLIDES: { id: SlideId; image: number }[] = [
  { id: "widgets", image: require("@/assets/images/paywall/home-widgets.jpg") },
  { id: "lockScreen", image: require("@/assets/images/paywall/lock-screen.jpg") },
  { id: "stats", image: require("@/assets/images/paywall/stats.jpg") },
];

/** The gate that opened the paywall picks the first card. */
const SLIDE_FOR_VARIANT: Record<ProVariant, SlideId> = { stats: "stats", widgets: "widgets" };

/**
 * Screenshots are device captures (945pt-wide @ 3×) cropped to their top
 * 1100px — recrop all three together so the cards keep one height.
 */
const SOURCE_ASPECT = 1100 / 945;
/** Must match the track's `px-8` / `gap-3`: neighbours peek by SIDE − GAP. */
const SIDE = 32;
const GAP = 12;
/** Device width relative to the card. */
const DEVICE_FRACTION = 0.62;

/**
 * Snapping carousel of real screenshots — what Pro looks like, not a list of
 * it (pattern from since's PaywallGallery). Widths are measured from the
 * window at runtime, like the onboarding pager; everything else is tokens.
 */
export function PaywallGallery({
  variant,
  bleedClass = "-mx-4",
}: {
  variant: ProVariant | null;
  /** Negative margin cancelling the host's side padding (Screen p-4; onboarding px-6). */
  bleedClass?: string;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = width - SIDE * 2;
  const stride = cardWidth + GAP;
  const deviceWidth = Math.round(cardWidth * DEVICE_FRACTION);
  const initial = Math.max(
    0,
    SLIDES.findIndex((s) => s.id === (variant ? SLIDE_FOR_VARIANT[variant] : "widgets")),
  );
  const [active, setActive] = useState(initial);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.min(
      SLIDES.length - 1,
      Math.max(0, Math.round(e.nativeEvent.contentOffset.x / stride)),
    );
    if (next === active) return;
    haptics.tick();
    setActive(next);
  };

  return (
    // Bleeds past the host's padding so cards can peek from the screen edges.
    <View className={`${bleedClass} gap-3`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={stride}
        snapToAlignment="start"
        decelerationRate="fast"
        contentOffset={{ x: initial * stride, y: 0 }}
        contentContainerClassName="gap-3 px-8"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={{ width: cardWidth }}
            className="items-center overflow-hidden rounded-lg bg-surface-sunken px-4 pt-5"
          >
            <T variant="micro" tone="tertiary">
              {t(`paywall.slides.${slide.id}.eyebrow`)}
            </T>
            <T variant="headline" className="mb-4 mt-1 text-center" numberOfLines={1}>
              {t(`paywall.slides.${slide.id}.title`)}
            </T>
            {/* Device bezel; no bottom edge — the screenshot bleeds off the card. */}
            <View className="overflow-hidden rounded-t-3xl border-4 border-b-0 border-surface-high">
              <Image
                source={slide.image}
                style={{ width: deviceWidth, height: Math.round(deviceWidth * SOURCE_ASPECT) }}
                contentFit="cover"
                accessibilityLabel={t(`paywall.slides.${slide.id}.a11y`)}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center gap-1.5" accessibilityElementsHidden>
        {SLIDES.map((slide, i) => (
          <View
            key={slide.id}
            className={`h-1.5 rounded-full ${i === active ? "w-4 bg-accent-fg" : "w-1.5 bg-border-hairline"}`}
          />
        ))}
      </View>
    </View>
  );
}
