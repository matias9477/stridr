import type { CustomerInfo } from "react-native-purchases";
import { create } from "zustand";
import {
  addCustomerInfoListener,
  configurePurchases,
  getCustomerInfo,
  hasProEntitlement,
  restorePurchases,
} from "./purchases-service";

interface PurchasesState {
  isReady: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  error: string | null;
  /** Configure the SDK and load entitlements. Called once from app/_layout.tsx. */
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  restore: () => Promise<boolean>;
}

export const usePurchasesStore = create<PurchasesState>()((set) => ({
  isReady: false,
  isPro: false,
  customerInfo: null,
  error: null,

  initialize: async () => {
    try {
      if (!configurePurchases()) {
        set({ isReady: true });
        return;
      }
      addCustomerInfoListener((info) => {
        set({ customerInfo: info, isPro: hasProEntitlement(info) });
      });
      const info = await getCustomerInfo();
      set({ isReady: true, customerInfo: info, isPro: hasProEntitlement(info) });
    } catch (error) {
      console.error("[purchases/initialize] failed", error);
      set({ isReady: true, error: error instanceof Error ? error.message : "init failed" });
    }
  },

  refresh: async () => {
    try {
      const info = await getCustomerInfo();
      set({ customerInfo: info, isPro: hasProEntitlement(info) });
    } catch (error) {
      console.error("[purchases/refresh] failed", error);
    }
  },

  restore: async () => {
    try {
      const info = await restorePurchases();
      const isPro = hasProEntitlement(info);
      set({ customerInfo: info, isPro });
      return isPro;
    } catch (error) {
      console.error("[purchases/restore] failed", error);
      return false;
    }
  },
}));

/**
 * Use this selector in components instead of the whole store —
 * it only re-renders on entitlement flips.
 */
export const useIsPro = (): boolean => usePurchasesStore((s) => s.isPro);
