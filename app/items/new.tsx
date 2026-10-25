import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { haptics } from "@/src/features/haptics/haptics";
import { ItemsForm } from "@/src/features/items/items-form";
import { createItems } from "@/src/features/items/queries";
import { Screen } from "@/src/ui/screen";

export default function NewItemsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen>
      <ItemsForm
        submitLabel={t("form.create")}
        onSubmit={async (values) => {
          await createItems(values);
          haptics.success();
          router.back();
        }}
      />
    </Screen>
  );
}
