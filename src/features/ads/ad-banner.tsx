import { useState } from "react";
import { View } from "react-native";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import { ADS_ENABLED, adsLib, BANNER_AD_UNIT_ID } from "./ads-service";

/**
 * Adaptive banner anchored at the bottom of a screen. Renders nothing for Pro
 * users and when ads are unconfigured, so callers can mount it unconditionally.
 * Requests are non-personalized only — keeps the app out of ATT territory,
 * consistent with the no-tracking store position.
 */
export function AdBanner() {
  const isPro = useIsPro();
  // The native ad view is zero-height until an ad loads, so gate the border
  // on load to avoid a stray hairline while the slot is empty.
  const [isLoaded, setIsLoaded] = useState(false);

  const ads = adsLib();
  if (!ADS_ENABLED || isPro || !ads) {
    return null;
  }
  const { BannerAd, BannerAdSize } = ads;

  return (
    <View className={isLoaded ? "items-center border-t border-border-hairline" : "items-center"}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setIsLoaded(true)}
        onAdFailedToLoad={() => setIsLoaded(false)}
      />
    </View>
  );
}
