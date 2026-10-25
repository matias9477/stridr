import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { T } from "@/src/ui/typography";

/**
 * Page-width, vertically scrollable onboarding slide: "Step n of N" eyebrow,
 * mono title, body, then the slide's panels. Scrolls so tall slides still fit
 * small phones.
 */
export function OnboardingSlide({
  width,
  step,
  total,
  title,
  body,
  children,
}: {
  width: number;
  step: number;
  total: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      style={{ width }}
      contentContainerClassName="flex-grow justify-center px-6 py-4"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-3 flex-row items-center gap-1.5">
        <View className="h-1.5 w-1.5 rounded-full bg-text-primary" />
        <T variant="micro" tone="tertiary">
          {t("onboarding.step", { step, total })}
        </T>
      </View>
      <T variant="stat" accessibilityRole="header">
        {title}
      </T>
      <T variant="bodyMd" tone="secondary" className="mb-6 mt-2">
        {body}
      </T>
      {children}
    </ScrollView>
  );
}
