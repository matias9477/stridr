import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

interface ExpandableListProps<T> {
  items: T[];
  /** How many items show before the "View more" toggle. */
  initialCount?: number;
  renderItem: (item: T, index: number) => ReactNode;
}

/**
 * Collapsed-by-default list section: screens must not scroll forever because
 * one section has 200 entries. Anything rendering a user-sized collection
 * inside a screen should go through this (or paginate).
 */
export function ExpandableList<T>({ items, initialCount = 5, renderItem }: ExpandableListProps<T>) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <View>
      {visible.map((item, index) => renderItem(item, index))}
      {hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          className="items-center py-3 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-accent-fg">
            {expanded
              ? t("common.viewLess")
              : t("common.viewMore", { count: items.length - initialCount })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
