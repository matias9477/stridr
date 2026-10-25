import { Platform, TurboModuleRegistry } from "react-native";

type AdsModule = typeof import("react-native-google-mobile-ads");

/**
 * The SDK calls TurboModuleRegistry.getEnforcing at import time, which throws
 * in Expo Go (and dev clients built without it). Probe first, then
 * lazy-require — no native module means ads are off, not a boot crash.
 * Resolved once at module load; ad-banner.tsx reads it through `adsLib()`.
 */
const lib: AdsModule | null = TurboModuleRegistry.get("RNGoogleMobileAdsModule")
  ? (require("react-native-google-mobile-ads") as AdsModule)
  : null;

export const adsLib = (): AdsModule | null => lib;

/**
 * Thin wrapper around the Google Mobile Ads SDK — the only module that imports
 * its initialization API. Ad unit ids come from EXPO_PUBLIC_ADMOB_BANNER_* in
 * .env; a platform without one has ads silently disabled (same pattern as
 * purchases), so the scaffold builds and runs before AdMob is set up.
 */
const PROD_BANNER_AD_UNIT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
  android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
});

/** The env key is the on-switch per platform — no key, no ads. */
export const ADS_ENABLED = Boolean(PROD_BANNER_AD_UNIT_ID) && lib !== null;

/**
 * Dev builds always serve Google's test unit — clicking real ads on a
 * development device risks an AdMob account ban.
 */
export const BANNER_AD_UNIT_ID =
  __DEV__ && lib ? lib.TestIds.ADAPTIVE_BANNER : (PROD_BANNER_AD_UNIT_ID ?? "");

let initialized = false;

export const initializeAds = async (): Promise<void> => {
  if (!ADS_ENABLED || !lib || initialized) return;
  initialized = true;
  try {
    await lib.default().initialize();
  } catch (error) {
    console.error("[ads/initialize] failed", error);
  }
};
