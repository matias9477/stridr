import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/src/ui/button";
import { Field } from "@/src/ui/field";
import { type ItemsFormIn, type ItemsFormOut, itemsInput } from "./schema";

interface ItemsFormProps {
  defaultValues?: Partial<ItemsFormIn>;
  submitLabel: string;
  onSubmit: (values: ItemsFormOut) => Promise<void>;
}

export function ItemsForm({ defaultValues, submitLabel, onSubmit }: ItemsFormProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemsFormIn, unknown, ItemsFormOut>({
    resolver: zodResolver(itemsInput),
    defaultValues: { title: "", notes: "", ...defaultValues },
  });

  return (
    <View>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label={t("form.titleLabel")}
            placeholder={t("form.titlePlaceholder")}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.title?.message}
            autoFocus
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label={t("form.notesLabel")}
            placeholder={t("form.notesPlaceholder")}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.notes?.message}
            multiline
            numberOfLines={3}
          />
        )}
      />
      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </View>
  );
}
