import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { Button } from "@/src/ui/button";
import { DateField } from "@/src/ui/date-field";
import { MetricInput } from "@/src/ui/metric-input";
import { Panel } from "@/src/ui/panel";
import { Segmented } from "@/src/ui/segmented";
import { T } from "@/src/ui/typography";
import type { CustomRange } from "../stats";
import { type CustomRangeIn, customRangeSchema } from "./schema";

/** What a first-time editor offers: two weeks, or the last 30 days as dates. */
const DEFAULT_LAST_DAYS = 14;
const DEFAULT_BETWEEN_DAYS = 30;

interface CustomRangeEditorProps {
  initial: CustomRange | null;
  today: DayKey;
  historyFrom: DayKey;
  onSave: (range: CustomRange) => void;
  onCancel: () => void;
}

/**
 * The panel the Custom chip expands (docs/spec-custom-range.md): last N days or
 * two dates, applied only on Save — the chart never redraws while editing.
 */
export function CustomRangeEditor({
  initial,
  today,
  historyFrom,
  onSave,
  onCancel,
}: CustomRangeEditorProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => customRangeSchema(today, historyFrom), [today, historyFrom]);
  const defaultFrom = addDaysToKey(today, -(DEFAULT_BETWEEN_DAYS - 1));
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomRangeIn, unknown, CustomRange>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      kind: initial?.kind ?? "last",
      days: String(initial?.kind === "last" ? initial.days : DEFAULT_LAST_DAYS),
      from:
        initial?.kind === "between"
          ? initial.from
          : defaultFrom < historyFrom
            ? historyFrom
            : defaultFrom,
      to: initial?.kind === "between" ? initial.to : today,
    },
  });
  const kind = useWatch({ control, name: "kind" });
  const from = useWatch({ control, name: "from" });
  const to = useWatch({ control, name: "to" });

  const save = handleSubmit((range) => {
    Keyboard.dismiss();
    onSave(range);
  });

  return (
    <Panel surface="sunken" className="gap-4">
      <Controller
        control={control}
        name="kind"
        render={({ field }) => (
          <Segmented<CustomRangeIn["kind"]>
            accessibilityLabel={t("stats.custom.modeA11y")}
            value={field.value}
            onChange={(value) => {
              Keyboard.dismiss();
              field.onChange(value);
            }}
            options={[
              { value: "last", label: t("stats.custom.modeLast") },
              { value: "between", label: t("stats.custom.modeBetween") },
            ]}
          />
        )}
      />

      {kind === "last" ? (
        <Controller
          control={control}
          name="days"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-row">
              <MetricInput
                label={t("stats.custom.last")}
                unit={t("stats.custom.daysUnit")}
                placeholder={String(DEFAULT_LAST_DAYS)}
                keyboardType="number-pad"
                returnKeyType="done"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={() => void save()}
                error={errors.days?.message}
              />
            </View>
          )}
        />
      ) : (
        <View className="gap-2">
          <Controller
            control={control}
            name="from"
            render={({ field }) => (
              <DateRow
                label={t("stats.custom.from")}
                value={field.value}
                min={historyFrom}
                max={to < today ? to : today}
                onChange={field.onChange}
                error={errors.from?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="to"
            render={({ field }) => (
              <DateRow
                label={t("stats.custom.to")}
                value={field.value}
                min={from > historyFrom ? from : historyFrom}
                max={today}
                onChange={field.onChange}
                error={errors.to?.message}
              />
            )}
          />
        </View>
      )}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="secondary"
            label={t("common.cancel")}
            onPress={() => {
              Keyboard.dismiss();
              onCancel();
            }}
          />
        </View>
        <View className="flex-1">
          <Button label={t("common.save")} disabled={!isValid} onPress={() => void save()} />
        </View>
      </View>
    </Panel>
  );
}

function DateRow({
  label,
  error,
  ...field
}: {
  label: string;
  value: DayKey;
  min: DayKey;
  max: DayKey;
  onChange: (day: DayKey) => void;
  error: string | undefined;
}) {
  return (
    <View>
      <View className="min-h-12 flex-row items-center justify-between gap-3 rounded-lg bg-surface-raised px-4 py-2">
        <T variant="label" tone={error ? "danger" : "secondary"}>
          {label}
        </T>
        <DateField accessibilityLabel={label} {...field} />
      </View>
      {error ? (
        <T variant="bodySm" tone="danger" className="mt-1 px-1">
          {error}
        </T>
      ) : null}
    </View>
  );
}
