import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ActionButton } from "@/src/ui/action-button";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import type { ProOffer } from "./use-pro-offer";

/**
 * Buy button + restore + footnote for the lifetime unlock, with the offer's
 * loading / error / empty states in the button's slot so the layout never jumps.
 */
export function ProOfferActions({
  offer,
  onContinueFree,
}: {
  offer: ProOffer;
  /** Onboarding: a "Continue free" link beside restore — the paywall is dismissed by swipe instead. */
  onContinueFree?: () => void;
}) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const busy = offer.purchasing || offer.restoring;

  return (
    <View className="gap-3">
      {offer.status === "loading" ? (
        <View className="min-h-12 flex-row items-center justify-center gap-2">
          <ActivityIndicator color={c.textPrimary} />
          <T variant="label" tone="tertiary">
            {t("paywall.loading")}
          </T>
        </View>
      ) : offer.status === "error" ? (
        <ActionButton
          label={t("paywall.loadError")}
          icon="refresh"
          variant="secondary"
          onPress={offer.retry}
        />
      ) : offer.status === "empty" ? (
        <View className="min-h-12 justify-center">
          <T variant="bodySm" tone="tertiary" className="text-center">
            {t("paywall.noOffers")}
          </T>
        </View>
      ) : (
        <ActionButton
          label={t("paywall.unlock", { price: offer.priceText ?? "" })}
          onPress={() => void offer.purchase()}
          loading={offer.purchasing}
          disabled={offer.restoring}
        />
      )}

      {offer.message ? (
        <T variant="bodySm" tone="danger" className="text-center">
          {offer.message}
        </T>
      ) : null}

      <View className={`flex-row ${onContinueFree ? "justify-between" : "justify-center"}`}>
        <Pressable
          onPress={() => void offer.restore()}
          disabled={busy}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy: offer.restoring }}
          className="py-1 active:opacity-60"
        >
          <T variant="label" tone="secondary">
            {offer.restoring ? t("common.loading") : t("paywall.restore")}
          </T>
        </Pressable>
        {onContinueFree ? (
          <Pressable
            onPress={onContinueFree}
            disabled={busy}
            hitSlop={8}
            accessibilityRole="button"
            className="py-1 active:opacity-60"
          >
            <T variant="label" tone="primary">
              {t("paywall.continueFree")}
            </T>
          </Pressable>
        ) : null}
      </View>

      <T variant="micro" tone="tertiary" className="text-center normal-case">
        {t("paywall.terms")}
      </T>
    </View>
  );
}
