import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";
import { PRO_ENTITLEMENT_ID } from "./types";

/**
 * Thin wrapper around the RevenueCat SDK — the only module that imports it.
 * State lives in purchasesStore; screens use useIsPro() / the store.
 */

let configured = false;

export function configurePurchases(): boolean {
  if (configured) return true;
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  });
  if (!apiKey) {
    console.warn("[purchases/configure] no RevenueCat key for this platform — purchases disabled");
    return false;
  }
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

export function hasProEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  // No key yet (or Expo Go): nothing to sell, and the SDK would throw "not configured".
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/**
 * Apple's offer-code sheet (iOS only — Play redeems codes in its own store app).
 * Resolves once the sheet is shown, not when a code is redeemed: the redemption
 * reaches us through the CustomerInfo listener, which flips isPro.
 */
export async function presentCodeRedemption(): Promise<void> {
  if (Platform.OS !== "ios" || !configured) return;
  await Purchases.presentCodeRedemptionSheet();
}

export function addCustomerInfoListener(listener: (info: CustomerInfo) => void): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}

/** RevenueCat marks user-cancelled purchases — never surface those as errors. */
export function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "userCancelled" in error &&
    (error as { userCancelled?: boolean }).userCancelled === true
  );
}
