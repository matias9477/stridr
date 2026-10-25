import type { ReactNode } from "react";
import { View } from "react-native";
import { CardStateBody, type CardStatus, Skeleton } from "./card-state";
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
  const valueRole = size === "stat" ? "stat" : "headline";
  return (
    <Panel surface={surface} className="flex-1 justify-between">
      <PanelHeader label={label} right={status.kind === "ready" && accessory ? accessory : icon} />
      <View
        className={size === "stat" ? "mt-4" : "mt-1"}
        accessible
        accessibilityLabel={
          status.kind === "ready"
            ? (accessibilityLabel ?? `${label} ${value} ${unit ?? ""} ${caption ?? ""}`)
            : undefined
        }
      >
        <CardStateBody
          status={status}
          minHeightClass={size === "stat" ? "min-h-12" : "min-h-10"}
          loading={
            <>
              <Skeleton className={size === "stat" ? "h-7 w-3/4" : "h-4 w-1/2"} />
              <Skeleton className="h-2 w-1/2" />
            </>
          }
        >
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
            <T
              variant="micro"
              tone="tertiary"
              className={size === "stat" ? "mt-0.5" : "mt-3"}
              numberOfLines={2}
            >
              {caption}
            </T>
          ) : null}
        </CardStateBody>
      </View>
    </Panel>
  );
}
