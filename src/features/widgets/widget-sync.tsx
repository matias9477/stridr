import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useAllItems } from "@/src/features/items/queries";
import ItemsWidget from "@/widgets/items-widget";

/**
 * Invisible provider: pushes the latest items into the home-screen
 * widget snapshot. Strings are pre-translated on the JS side — the widget
 * receives display text, never i18n keys. Widget sync must never break the
 * app, hence the catch-all. Mounted once in app/_layout.tsx.
 */
export function WidgetSync(): null {
  const { t } = useTranslation();
  const { data } = useAllItems();

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    try {
      const latest = data[0];
      ItemsWidget.updateSnapshot({
        title: latest?.title ?? "",
        subtitle: t("home.title").toUpperCase(),
        emptyText: t("widget.empty"),
        hasData: latest !== undefined,
      });
    } catch (error) {
      console.error("[widgets/widget-sync] snapshot update failed", error);
    }
  }, [data, t]);

  return null;
}
