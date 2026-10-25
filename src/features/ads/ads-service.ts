import { Platform } from "react-native";
import mobileAds, { TestIds } from "react-native-google-mobile-ads";

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
export const ADS_ENABLED = Boolean(PROD_BANNER_AD_UNIT_ID);

/**
 * Dev builds always serve Google's test unit — clicking real ads on a
 * development device risks an AdMob account ban.
 */
export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.ADAPTIVE_BANNER : (PROD_BANNER_AD_UNIT_ID ?? "");

let initialized = false;

export const initializeAds = async (): Promise<void> => {
  if (!ADS_ENABLED || initialized) return;
  initialized = true;
  try {
    await mobileAds().initialize();
  } catch (error) {
    console.error("[ads/initialize] failed", error);
  }
};
