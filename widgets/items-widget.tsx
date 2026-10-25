import { Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  lineLimit,
  padding,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type ItemsWidgetProps = {
  title: string;
  subtitle: string;
  emptyText: string;
  hasData: boolean;
};

const ItemsWidgetComponent = (props: ItemsWidgetProps, env: WidgetEnvironment) => {
  "widget";

  // The "widget" directive serializes only this function body to run in the
  // widget process — nothing outside it exists there, so all constants live
  // inside. THEME mirrors src/ui/theme-colors.ts; keep both in sync.
  const THEME = {
    light: {
      card: "#ffffff",
      primary: "#171717",
      secondary: "#525252",
      accent: "#fcba03",
    },
    dark: {
      card: "#1e1e1e",
      primary: "#f5f5f5",
      secondary: "#a3a3a3",
      accent: "#fcba03",
    },
  };
  const theme = env.colorScheme === "dark" ? THEME.dark : THEME.light;

  if (!props.hasData) {
    return (
      <VStack
        spacing={6}
        modifiers={[widgetURL("stridr://"), containerBackground(theme.card, "widget")]}
      >
        <Text modifiers={[font({ size: 24 })]}>✨</Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(theme.secondary)]}>
          {props.emptyText}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack
      spacing={0}
      alignment="leading"
      modifiers={[widgetURL("stridr://"), containerBackground(theme.card, "widget")]}
    >
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle(theme.accent),
          lineLimit(1),
        ]}
      >
        {props.subtitle}
      </Text>
      <Text
        modifiers={[
          font({ size: 17, weight: "bold" }),
          foregroundStyle(theme.primary),
          lineLimit(2),
          padding({ top: 4 }),
        ]}
      >
        {props.title}
      </Text>
      <Spacer />
    </VStack>
  );
};

export default createWidget<ItemsWidgetProps>("Items", ItemsWidgetComponent);
