import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import {
  getCurrentOffering,
  isUserCancelled,
  purchasePackage,
} from "@/src/features/purchases/purchases-service";
import { usePurchasesStore } from "@/src/features/purchases/purchases-store";
import { Button } from "@/src/ui/button";
import { Card } from "@/src/ui/card";
import { Screen } from "@/src/ui/screen";
import { useThemeColors } from "@/src/ui/theme-colors";

/**
 * Custom paywall over RevenueCat offerings. Variants, mock previews, and
 * per-feature copy plug in here — see the Paywall section in CLAUDE.md.
 */
export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const refresh = usePurchasesStore((s) => s.refresh);
  const restore = usePurchasesStore((s) => s.restore);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentOffering()
      .then(setOffering)
      .catch((err) => {
        console.error("[paywall] failed to load offering", err);
      })
      .finally(() => setLoading(false));
  }, []);

  async function onPurchase(pkg: PurchasesPackage) {
    setPurchasing(pkg.identifier);
    setError(null);
    try {
      await purchasePackage(pkg);
      await refresh();
      router.back();
    } catch (err) {
      if (!isUserCancelled(err)) {
        console.error("[paywall] purchase failed", err);
        setError(t("paywall.purchaseError"));
      }
    } finally {
      setPurchasing(null);
    }
  }

  async function onRestore() {
    const restored = await restore();
    if (restored) router.back();
  }

  return (
    <Screen>
      <Text className="mt-2 text-3xl font-bold text-text-primary">{t("paywall.title")}</Text>
      <Text className="mb-6 mt-1 text-base text-text-secondary">{t("paywall.subtitle")}</Text>

      <Card className="mb-6">
        {[t("paywall.featureOne"), t("paywall.featureTwo"), t("paywall.featureThree")].map(
          (feature) => (
            <View key={feature} className="flex-row items-center py-1.5">
              <Text className="mr-2 text-base font-bold text-accent-fg">✓</Text>
              <Text className="flex-1 text-base text-text-primary">{feature}</Text>
            </View>
          ),
        )}
      </Card>

      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator color={c.accentFg} />
          <Text className="mt-2 text-sm text-text-tertiary">{t("paywall.loading")}</Text>
        </View>
      ) : !offering || offering.availablePackages.length === 0 ? (
        <Text className="py-8 text-center text-base text-text-tertiary">
          {t("paywall.noOffers")}
        </Text>
      ) : (
        <View className="gap-3">
          {offering.availablePackages.map((pkg) => (
            <Button
              key={pkg.identifier}
              label={`${pkg.product.title} — ${pkg.product.priceString}`}
              onPress={() => void onPurchase(pkg)}
              loading={purchasing === pkg.identifier}
              disabled={purchasing !== null && purchasing !== pkg.identifier}
            />
          ))}
        </View>
      )}

      {error ? <Text className="mt-4 text-center text-sm text-danger-fg">{error}</Text> : null}

      <View className="mt-6">
        <Button label={t("paywall.restore")} variant="secondary" onPress={() => void onRestore()} />
      </View>

      <Text className="mt-6 text-center text-xs leading-4 text-text-tertiary">
        {t("paywall.terms")}
      </Text>
    </Screen>
  );
}
