import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/** A settings group: card + micro header ("BIOMECHANICS & METRICS"). */
export function SettingsCard({
  label,
  right,
  children,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel surface="sunken" className="gap-2">
      <PanelHeader label={label} right={right} />
      {children}
    </Panel>
  );
}

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
}

/** Title + micro caption on the left, control on the right. */
export function SettingsRow({
  title,
  subtitle,
  right,
  onPress,
  accessibilityHint,
  disabled = false,
}: SettingsRowProps) {
  const content = (
    <View className="min-h-12 flex-row items-center justify-between gap-3 py-1">
      <View className="flex-1">
        <T variant="bodyMd" tone="body">
          {title}
        </T>
        {subtitle ? (
          <T variant="micro" tone="tertiary">
            {subtitle}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={disabled ? "opacity-40" : "active:opacity-60"}
    >
      {content}
    </Pressable>
  );
}

/** Raised mono value tag ("78 CM") — the tappable value of a row. */
export function ValueTag({ label }: { label: string }) {
  return (
    <View className="rounded bg-surface-raised px-2 py-1">
      <T variant="label">{label}</T>
    </View>
  );
}

/** Trailing affordance for a tappable row: chevron for in-app, open-in-new for the browser/App Store, restore for an in-place action. */
export function RowIcon({
  icon = "chevron-right",
}: {
  icon?: "chevron-right" | "open-in-new" | "restore" | "file-download" | "redeem";
}) {
  const c = useThemeColors();
  return <MaterialIcons name={icon} size={16} color={c.textTertiary} />;
}
