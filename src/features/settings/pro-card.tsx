import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform } from "react-native";
import { presentCodeRedemption } from "@/src/features/purchases/purchases-service";
import { useIsPro, usePurchasesStore } from "@/src/features/purchases/purchases-store";
import { Chip } from "@/src/ui/chip";
import { RowIcon, SettingsCard, SettingsRow } from "./settings-row";

/**
 * Pro: right under the target for free users, so they see what it unlocks
 * without scrolling; just above About once owned. Same row shape as the rest:
 * title + caption + trailing icon. Restore only shows while there's nothing
 * to restore into — a Pro user has no use for it; same for redeeming a code
 * (iOS only: Apple's offer-code sheet, as in since).
 */
export function ProCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const isPro = useIsPro();
  const restore = usePurchasesStore((s) => s.restore);
  const refresh = usePurchasesStore((s) => s.refresh);
  const [restoring, setRestoring] = useState(false);

  async function onRestore() {
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    Alert.alert(restored ? t("settings.restoreSuccess") : t("settings.restoreNone"));
  }

  async function onRedeem() {
    try {
      await presentCodeRedemption();
      // The listener catches the redemption too; this covers a sheet that returns already redeemed.
      await refresh();
    } catch (error) {
      console.error("[settings/redeem] failed", error);
      Alert.alert(t("settings.redeemCodeError"));
    }
  }

  return (
    <SettingsCard
      label={t("settings.pro")}
      right={
        <Chip
          dot={isPro}
          variant="ghost"
          label={isPro ? t("settings.proOn") : t("settings.proFree")}
        />
      }
    >
      {isPro ? (
        <SettingsRow title={t("settings.proActive")} subtitle={t("settings.proActiveCaption")} />
      ) : (
        <>
          <SettingsRow
            title={t("settings.goPro")}
            subtitle={t("settings.goProCaption")}
            right={<RowIcon />}
            onPress={() => router.push("/paywall")}
          />
          <SettingsRow
            title={restoring ? t("common.loading") : t("settings.restorePurchases")}
            subtitle={t("settings.restoreCaption")}
            right={<RowIcon icon="restore" />}
            onPress={() => void onRestore()}
          />
          {Platform.OS === "ios" ? (
            <SettingsRow
              title={t("settings.redeemCode")}
              subtitle={t("settings.redeemCodeCaption")}
              right={<RowIcon icon="redeem" />}
              onPress={() => void onRedeem()}
            />
          ) : null}
        </>
      )}
    </SettingsCard>
  );
}
