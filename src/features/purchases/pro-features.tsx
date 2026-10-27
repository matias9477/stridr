import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Panel } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import type { ProVariant } from "./types";

const FEATURES: { variant: ProVariant; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { variant: "stats", icon: "insights" },
  { variant: "widgets", icon: "widgets" },
  { variant: "export", icon: "file-download" },
];

/**
 * What Pro unlocks (docs/spec-pro-split.md §0) — shared by the paywall and
 * onboarding step 4. The gate that opened the paywall gets the raised row.
 */
export function ProFeatures({ highlight }: { highlight?: ProVariant | null }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  return (
    <Panel surface="sunken" className="gap-1">
      {FEATURES.map(({ variant, icon }) => (
        <View
          key={variant}
          className={`flex-row items-center gap-3 rounded p-3 ${
            highlight === variant ? "bg-surface-raised" : ""
          }`}
        >
          <MaterialIcons name={icon} size={20} color={c.textPrimary} />
          <View className="flex-1">
            <T variant="bodyMdMedium" tone="primary">
              {t(`paywall.features.${variant}.title`)}
            </T>
            <T variant="bodySm" tone="secondary">
              {t(`paywall.features.${variant}.body`)}
            </T>
          </View>
        </View>
      ))}
    </Panel>
  );
}
