import type { ReactNode } from "react";
import { Text, type TextProps } from "react-native";

/**
 * The Monochrome Cadence type roles (DESIGN.md → Typography). Screens use
 * these instead of composing font/size/tracking classes, so a role changes in
 * one place:
 * - numbers, labels, timestamps → Space Mono (tabular, no layout shift)
 * - reading text → Geist
 * Color is a className token passed by the caller (defaults below).
 */

/**
 * Font family names for native chrome (header titles, tab labels) that
 * NativeWind classes can't reach. Must match tailwind.config.js `fontFamily`.
 */
export const FONT = {
  mono: "SpaceMono_400Regular",
  monoBold: "SpaceMono_700Bold",
} as const;

type Tone = "primary" | "body" | "secondary" | "tertiary" | "quiet" | "on-accent" | "danger";

const TONE: Record<Tone, string> = {
  primary: "text-text-primary",
  body: "text-text-body",
  secondary: "text-text-secondary",
  tertiary: "text-text-tertiary",
  quiet: "text-text-quiet",
  "on-accent": "text-accent-on",
  danger: "text-danger-fg",
};

const ROLE = {
  /** 9px uppercase micro-label: tile titles, axis legends, captions. */
  micro: "font-mono-bold text-micro tracking-micro uppercase",
  /** 11px uppercase label: section heads, button text, chips, tabular values. */
  label: "font-mono-bold text-label tracking-label uppercase",
  /** 11px label without uppercase (units like "km"). */
  labelPlain: "font-mono text-label tracking-label",
  /** 26px tile values. */
  stat: "font-mono-bold text-stat tracking-stat",
  /** 56px hero number. */
  display: "font-mono-bold text-display tracking-display",
  /** 76px share-card hero (fixed-size poster only). */
  poster: "font-mono-bold text-poster tracking-poster",
  /** 16px emphasised value in compact tiles. */
  headline: "font-mono-bold text-headline-sm tracking-stat",
  bodySm: "font-sans text-body-sm",
  bodyMd: "font-sans text-body-md",
  bodyMdMedium: "font-sans-medium text-body-md",
  bodyLg: "font-sans text-body-lg",
} as const;

export type TypeRole = keyof typeof ROLE;

/** Big numbers must not scale with Dynamic Type past the point where the layout breaks. */
const MAX_SCALE: Partial<Record<TypeRole, number>> = { display: 1.15, stat: 1.25, headline: 1.4 };

interface TProps extends TextProps {
  variant: TypeRole;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}

export function T({ variant, tone, className = "", children, ...rest }: TProps) {
  const defaultTone: Tone = variant.startsWith("body")
    ? "body"
    : variant === "micro"
      ? "tertiary"
      : "primary";
  return (
    <Text
      maxFontSizeMultiplier={MAX_SCALE[variant]}
      className={`${ROLE[variant]} ${TONE[tone ?? defaultTone]} ${className}`}
      {...rest}
    >
      {children}
    </Text>
  );
}
