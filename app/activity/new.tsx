import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepsForm, WalkForm } from "@/src/features/activity/activity-form";
import { createManualSteps, createWalk } from "@/src/features/activity/queries";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { haptics } from "@/src/features/haptics/haptics";
import { Screen } from "@/src/ui/screen";
import { Segmented } from "@/src/ui/segmented";

type Mode = "walk" | "steps";

/** Add Activity (spec §3.2): log a walk (estimated) or add a raw step count. Modal — swipe down cancels. */
export default function NewActivityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useEstimationSettings();
  const [mode, setMode] = useState<Mode>("walk");

  const done = () => {
    haptics.success();
    router.back();
  };

  return (
    <Screen>
      <View className="mb-4">
        <Segmented<Mode>
          accessibilityLabel={t("activity.mode.a11y")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "walk", label: t("activity.mode.walk") },
            { value: "steps", label: t("activity.mode.steps") },
          ]}
        />
      </View>
      {mode === "walk" ? (
        <WalkForm
          confirm
          submitLabel={t("activity.form.save")}
          onSubmit={async (values, estimated) => {
            await createWalk(values, estimated, settings);
            done();
          }}
        />
      ) : (
        <StepsForm
          confirm
          submitLabel={t("activity.form.save")}
          onSubmit={async (values) => {
            await createManualSteps(values);
            done();
          }}
        />
      )}
    </Screen>
  );
}
