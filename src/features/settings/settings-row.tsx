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
    <Panel className="gap-2">
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
}

/** Title + micro caption on the left, control on the right. */
export function SettingsRow({
  title,
  subtitle,
  right,
  onPress,
  accessibilityHint,
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
      onPress={onPress}
      className="active:opacity-60"
    >
      {content}
    </Pressable>
  );
}

/** Raised mono value tag ("78 CM") — the tappable value of a row. */
export function ValueTag({ label }: { label: string }) {
  return (
    <View className="rounded bg-surface-high px-2 py-1">
      <T variant="label">{label}</T>
    </View>
  );
}

/** Full-width action row ("Export Steps as CSV … RAW .CSV"). */
export function ActionRow({
  icon,
  title,
  trailing,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  /** Mono tag text; omit for a chevron. */
  trailing?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-lg bg-surface-card p-4 active:bg-surface-raised ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <View className="flex-1 flex-row items-center gap-2">
        <MaterialIcons name={icon} size={20} color={c.textPrimary} />
        <T variant="bodyMdMedium" tone="primary" className="flex-1">
          {title}
        </T>
      </View>
      {trailing ? (
        <T variant="label" tone="tertiary">
          {trailing}
        </T>
      ) : (
        <MaterialIcons name="chevron-right" size={16} color={c.textTertiary} />
      )}
    </Pressable>
  );
}
