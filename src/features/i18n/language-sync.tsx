import { useEffect } from "react";
import i18n, { systemLanguage } from "@/src/i18n";
import { usePreferencesStore } from "@/src/stores/preferences";

/**
 * Invisible provider: reconciles the persisted language preference with
 * i18next. Mounted once in app/_layout.tsx.
 */
export function LanguageSync(): null {
  const languagePreference = usePreferencesStore((s) => s.languagePreference);

  useEffect(() => {
    const target = languagePreference === "system" ? systemLanguage() : languagePreference;
    if (i18n.language !== target) {
      i18n.changeLanguage(target).catch((error) => {
        console.error("[i18n/language-sync] changeLanguage failed", error);
      });
    }
  }, [languagePreference]);

  return null;
}
