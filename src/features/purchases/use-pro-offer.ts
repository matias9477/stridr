import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PurchasesPackage } from "react-native-purchases";
import { haptics } from "@/src/features/haptics/haptics";
import { getCurrentOffering, isUserCancelled, purchasePackage } from "./purchases-service";
import { usePurchasesStore } from "./purchases-store";

export type ProOfferStatus = "loading" | "error" | "empty" | "ready";

export interface ProOffer {
  status: ProOfferStatus;
  /** "$4.99" from the store — never hardcoded. */
  priceText: string | null;
  purchasing: boolean;
  restoring: boolean;
  /** One inline line under the actions (purchase failed, nothing to restore). */
  message: string | null;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
  retry: () => void;
}

/**
 * The lifetime unlock as a small state machine, shared by the paywall and
 * onboarding step 4 (docs/spec-pro-split.md §1). One package: the offering's
 * lifetime slot, else its first package.
 */
export function useProOffer({
  onUnlocked,
  enabled = true,
}: {
  onUnlocked: () => void;
  /** False while already Pro — no point fetching a price nobody sees. */
  enabled?: boolean;
}): ProOffer {
  const { t } = useTranslation();
  const refresh = usePurchasesStore((s) => s.refresh);
  const restorePurchases = usePurchasesStore((s) => s.restore);
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [status, setStatus] = useState<ProOfferStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is the retry trigger.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus("loading");
    getCurrentOffering()
      .then((offering) => {
        if (cancelled) return;
        const next = offering?.lifetime ?? offering?.availablePackages[0] ?? null;
        setPkg(next);
        setStatus(next ? "ready" : "empty");
      })
      .catch((error) => {
        // A network or store failure — "empty" would claim there is nothing to sell.
        console.error("[purchases/offer] failed to load offering", error);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, enabled]);

  const purchase = useCallback(async () => {
    if (!pkg || purchasing) return;
    setPurchasing(true);
    setMessage(null);
    try {
      await purchasePackage(pkg);
      await refresh();
      haptics.success();
      onUnlocked();
    } catch (error) {
      if (!isUserCancelled(error)) {
        console.error("[purchases/purchase] failed", error);
        setMessage(t("paywall.purchaseError"));
      }
    } finally {
      setPurchasing(false);
    }
  }, [pkg, purchasing, refresh, onUnlocked, t]);

  const restore = useCallback(async () => {
    if (restoring) return;
    setRestoring(true);
    setMessage(null);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored) {
      haptics.success();
      onUnlocked();
    } else {
      setMessage(t("paywall.restoreNone"));
    }
  }, [restoring, restorePurchases, onUnlocked, t]);

  return {
    status,
    priceText: pkg?.product.priceString ?? null,
    purchasing,
    restoring,
    message,
    purchase,
    restore,
    retry: () => setAttempt((n) => n + 1),
  };
}
