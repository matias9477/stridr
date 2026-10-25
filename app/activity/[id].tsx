import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { StepsForm, WalkForm } from "@/src/features/activity/activity-form";
import { fromMeters } from "@/src/features/activity/estimate";
import {
  deleteManualEntry,
  updateManualSteps,
  updateWalk,
  useManualEntry,
} from "@/src/features/activity/queries";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { haptics } from "@/src/features/haptics/haptics";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { Screen } from "@/src/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/src/ui/state-views";

/** Edit / delete a manual entry (spec §6.9). Totals update live on save. */
export default function EditActivityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const { row, isLoading, error } = useManualEntry(id);
  const settings = useEstimationSettings();
  const unit = usePreferencesStore((s) => s.distanceUnit);

  function confirmDelete() {
    Alert.alert(t("activity.delete.title"), t("activity.delete.body"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          haptics.destructive();
          deleteManualEntry(id)
            .then(() => router.back())
            .catch((e) => console.error("[activity/delete] failed", e));
        },
      },
    ]);
  }

  const done = () => {
    haptics.success();
    router.back();
  };

  if (error) {
    return (
      <Screen scroll={false}>
        <ErrorState />
      </Screen>
    );
  }
  if (isLoading) {
    return (
      <Screen scroll={false}>
        <LoadingState />
      </Screen>
    );
  }
  if (!row) {
    return (
      <Screen scroll={false}>
        <EmptyState message={t("activity.notFound")} />
      </Screen>
    );
  }

  return (
    <Screen>
      {row.kind === "walk" ? (
        <WalkForm
          confirm={false}
          submitLabel={t("activity.form.update")}
          defaultValues={{
            day: row.day,
            unit,
            distance:
              row.distanceMeters === null
                ? ""
                : String(Number(fromMeters(row.distanceMeters, unit).toFixed(2))),
            durationMinutes:
              row.durationSeconds === null ? "" : String(Math.round(row.durationSeconds / 60)),
            steps: String(row.steps),
          }}
          onSubmit={async (values, estimated) => {
            await updateWalk(id, values, estimated, settings);
            done();
          }}
        />
      ) : (
        <StepsForm
          confirm={false}
          submitLabel={t("activity.form.update")}
          defaultValues={{ day: row.day, steps: String(row.steps) }}
          onSubmit={async (values) => {
            await updateManualSteps(id, values);
            done();
          }}
        />
      )}
      <View className="mt-4">
        <ActionButton
          label={t("common.delete")}
          variant="ghost"
          destructive
          icon="delete-outline"
          onPress={confirmDelete}
        />
      </View>
    </Screen>
  );
}
