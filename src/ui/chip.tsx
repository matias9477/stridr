import type { ReactNode } from "react";
import { View } from "react-native";
import { PulseDot } from "./pulse-dot";
import { T } from "./typography";

interface ChipProps {
  label: string;
  /** Leading live dot (synced, active). */
  dot?: boolean | "pulse";
  icon?: ReactNode;
  /** inverse = solid accent (the "MAX" tag), raised = default tag, ghost = no fill. */
  variant?: "raised" | "high" | "inverse" | "ghost";
}

const FILL = {
  raised: "bg-surface-raised",
  high: "bg-surface-high",
  inverse: "bg-accent-fg",
  ghost: "",
} as const;

/** Compact status tag — typographic, never colored (DESIGN.md → Status indicators). */
export function Chip({ label, dot = false, icon, variant = "raised" }: ChipProps) {
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded px-2 py-1 ${FILL[variant]}`}>
      {dot ? <PulseDot pulse={dot === "pulse"} /> : null}
      {icon}
      <T variant="micro" tone={variant === "inverse" ? "on-accent" : "primary"}>
        {label}
      </T>
    </View>
  );
}
