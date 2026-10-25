import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Text, View } from "react-native";

interface ListSectionProps {
  title?: string;
  /** Small print under the group (explanations, version). */
  footer?: string;
  children: ReactNode;
}

/**
 * iOS inset-grouped list: caption, then rows on one rounded card with inset
 * hairlines *between* rows (never after the last). Rows go edge to edge —
 * the card adds no padding of its own; ListRow owns the gutter.
 */
export function ListSection({ title, footer, children }: ListSectionProps) {
  const rows = Children.toArray(children);
  return (
    <View className="mb-6">
      {title ? (
        <Text className="mb-1.5 px-4 text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl bg-surface-card">
        {rows.map((row, i) => (
          // Children.toArray gives every row a stable key (".0", ".1", or the row's own).
          <Fragment key={isValidElement(row) ? row.key : String(row)}>
            {i > 0 ? <View className="ml-4 h-px bg-border-hairline" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? <Text className="mt-1.5 px-4 text-xs text-text-tertiary">{footer}</Text> : null}
    </View>
  );
}
