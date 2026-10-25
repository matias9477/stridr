import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { haptics } from "@/src/features/haptics/haptics";
import { ItemsForm } from "@/src/features/items/items-form";
import { deleteItems, updateItems, useItemsById } from "@/src/features/items/queries";
import { Button } from "@/src/ui/button";
import { Screen } from "@/src/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/src/ui/state-views";

export default function ItemsDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const { row, isLoading, error } = useItemsById(id);

  function confirmDelete() {
    Alert.alert(t("detail.deleteConfirmTitle"), t("detail.deleteConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          haptics.destructive();
          void deleteItems(id).then(() => router.back());
        },
      },
    ]);
  }

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
        <EmptyState message={t("detail.notFound")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: row.title }} />
      <ItemsForm
        defaultValues={{ title: row.title, notes: row.notes ?? "" }}
        submitLabel={t("form.update")}
        onSubmit={async (values) => {
          await updateItems(id, values);
          haptics.success();
          router.back();
        }}
      />
      <View className="mt-4">
        <Button label={t("common.delete")} variant="danger" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}
