import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { CardStateBody, type CardStatus, SkeletonText } from "./card-state";
import { Panel, PanelHeader } from "./panel";
import { RollingNumber } from "./rolling-number";
import { T } from "./typography";

interface StatTileProps {
  label: string;
  /** Header icon identifying the metric — shown in every state, unlike `accessory`. */
  icon?: ReactNode;
  /** Trailing data-derived header element, like a "+8.4%" delta — shown only when ready. */
  accessory?: ReactNode;
  value: string;
  unit?: string;
  caption?: string;
  status: CardStatus;
  /** "stat" = 26px value (Today, Trends totals); "headline" = 16px (streak, trend). */
  size?: "stat" | "headline";
  surface?: "card" | "sunken";
  /** Screen readers get one sentence instead of four fragments. */
  accessibilityLabel?: string;
}

/**
 * Metric tile: micro label on top, tabular value at the bottom, caption under
 * it (DESIGN.md → Stat Cards). Loading/empty/error render inside the same
 * footprint so a 2-column grid stays aligned.
 */
export function StatTile({
  label,
  icon,
  accessory,
  value,
  unit,
  caption,
  status,
  size = "stat",
  surface = "card",
  accessibilityLabel,
}: StatTileProps) {
  const { t } = useTranslation();
  const valueRole = size === "stat" ? "stat" : "headline";
  const captionGap = size === "stat" ? "mt-0.5" : "mt-3";
  return (
    <Panel surface={surface} className="flex-1 justify-between">
      <PanelHeader label={label} right={status.kind === "ready" && accessory ? accessory : icon} />
      <View
        className={size === "stat" ? "mt-4" : "mt-1"}
        accessible
        accessibilityLabel={
          status.kind === "ready"
            ? (accessibilityLabel ?? `${label} ${value} ${unit ?? ""} ${caption ?? ""}`)
            : status.kind === "loading"
              ? t("common.loading")
              : undefined
        }
      >
        {status.kind === "loading" ? (
          // Mirrors the ready layout line for line so the data lands without a jump —
          // bypassing CardStateBody's loading wrapper, whose min-height and gap add space.
          <>
            <View className="flex-row items-baseline gap-1">
              <SkeletonText variant={valueRole} ghost="0,000" />
              {unit ? (
                <T variant="labelPlain" tone="secondary">
                  {unit}
                </T>
              ) : null}
            </View>
            {/* Always reserved: tiles share a row, which sizes to its tallest (captioned) tile. */}
            <View className={captionGap}>
              <SkeletonText variant="micro" ghost="00,000 · 0000" />
            </View>
          </>
        ) : (
          <CardStateBody status={status} minHeightClass={size === "stat" ? "min-h-12" : "min-h-10"}>
            <View className="flex-row items-baseline gap-1">
              {/* The wrapper is already one accessible sentence; the digits stay silent. */}
              <RollingNumber variant={valueRole} value={value} accessibilityLabel="" />
              {unit ? (
                <T variant="labelPlain" tone="secondary">
                  {unit}
                </T>
              ) : null}
            </View>
            {caption ? (
              <T variant="micro" tone="tertiary" className={captionGap} numberOfLines={2}>
                {caption}
              </T>
            ) : null}
          </CardStateBody>
        )}
      </View>
    </Panel>
  );
}
