import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useIsPro, usePurchasesStore } from "@/src/features/purchases/purchases-store";
import { Chip } from "@/src/ui/chip";
import { RowIcon, SettingsCard, SettingsRow } from "./settings-row";

/**
 * Pro: right under the target for free users, so they see what it unlocks
 * without scrolling; just above About once owned. Same row shape as the rest:
 * title + caption + trailing icon. Restore only shows while there's nothing
 * to restore into — a Pro user has no use for it.
 */
export function ProCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const isPro = useIsPro();
  const restore = usePurchasesStore((s) => s.restore);
  const [restoring, setRestoring] = useState(false);

  async function onRestore() {
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    Alert.alert(restored ? t("settings.restoreSuccess") : t("settings.restoreNone"));
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
        </>
      )}
    </SettingsCard>
  );
}
