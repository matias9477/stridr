import { useTranslation } from "react-i18next";
import { TabStack } from "@/src/ui/tab-stack";

export default function StatsLayout() {
  const { t } = useTranslation();
  return <TabStack title={t("tabs.stats")} headerShown={false} />;
}
