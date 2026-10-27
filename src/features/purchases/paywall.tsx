import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ActionButton } from "@/src/ui/action-button";
import { Screen } from "@/src/ui/screen";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { ProFeatures } from "./pro-features";
import { ProOfferActions } from "./pro-offer-actions";
import { useIsPro } from "./purchases-store";
import { parseProVariant } from "./types";
import { useProOffer } from "./use-pro-offer";

/**
 * Lifetime-unlock paywall (docs/spec-pro-split.md §1). `variant` names the
 * gate that opened it and picks the headline; unknown or missing → generic.
 * Dismissed by the modal swipe, like every other sheet in the app.
 */
export function Paywall() {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const isPro = useIsPro();
  const variant = parseProVariant(useLocalSearchParams().variant);
  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    // Opened cold from a widget deep link: nothing underneath to go back to.
    else router.replace("/");
  }, [router]);
  const offer = useProOffer({ onUnlocked: close, enabled: !isPro });
  const copy = variant ? `paywall.variants.${variant}` : "paywall";

  return (
    <Screen>
      <View className="gap-6 pt-2">
        <View className="gap-2">
          <T variant="stat" accessibilityRole="header">
            {t(`${copy}.title`)}
          </T>
          <T variant="bodyMd" tone="secondary">
            {t(`${copy}.subtitle`)}
          </T>
        </View>

        <ProFeatures highlight={variant} />

        {isPro ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-center gap-2">
              <MaterialIcons name="check-circle" size={16} color={c.textPrimary} />
              <T variant="label">{t("paywall.active")}</T>
            </View>
            <ActionButton label={t("paywall.done")} onPress={close} />
          </View>
        ) : (
          <ProOfferActions offer={offer} />
        )}
      </View>
    </Screen>
  );
}
