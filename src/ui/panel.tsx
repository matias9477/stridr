import type { ReactNode } from "react";
import { View } from "react-native";
import { T } from "./typography";

type Surface = "card" | "sunken";

const SURFACE: Record<Surface, string> = {
  card: "bg-surface-card",
  sunken: "bg-surface-sunken",
};

interface PanelProps {
  children: ReactNode;
  /** card = Level 1 tiles (Today, Settings); sunken = the deeper Trends cards. */
  surface?: Surface;
  className?: string;
}

/** Monochrome Cadence container: flat fill, tight corners, no shadow (DESIGN.md → Elevation). */
export function Panel({ children, surface = "card", className = "" }: PanelProps) {
  return <View className={`rounded-lg p-4 ${SURFACE[surface]} ${className}`}>{children}</View>;
}

/** Micro-label row heading a panel, with an optional trailing element (icon, chip). */
export function PanelHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between" accessibilityRole="header">
      <T variant="micro" tone="tertiary" className="flex-shrink">
        {label}
      </T>
      {right}
    </View>
  );
}

/** Section caption outside a panel ("METRIC MILESTONES … ALL-TIME LOG"). */
export function SectionLabel({ label, right }: { label: string; right?: string }) {
  return (
    <View className="flex-row items-center justify-between px-1" accessibilityRole="header">
      <T variant="micro" tone="tertiary">
        {label}
      </T>
      {right ? (
        <T variant="micro" tone="tertiary">
          {right}
        </T>
      ) : null}
    </View>
  );
}
