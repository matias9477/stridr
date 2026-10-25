import type { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  /** Inner p-4 (default). For lists of rows use ListSection instead. */
  padded?: boolean;
  className?: string;
}

// Padding is a prop, not a className override: NativeWind doesn't let a later
// `p-0` beat the built-in `p-4`, so overriding via className silently fails.
export function Card({ children, padded = true, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-surface-card ${padded ? "p-4" : "overflow-hidden"} ${className}`}
    >
      {children}
    </View>
  );
}
