import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, TextInput, type TextInputInstance, View } from "react-native";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { ActionButton } from "@/src/ui/action-button";
import { DateField } from "@/src/ui/date-field";
import { Panel } from "@/src/ui/panel";
import { Segmented } from "@/src/ui/segmented";
import { useThemeColors } from "@/src/ui/theme-colors";
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
            <DaysRow
              label={t("stats.custom.last")}
              unit={t("stats.custom.daysUnit")}
              placeholder={String(DEFAULT_LAST_DAYS)}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => void save()}
              error={errors.days?.message}
            />
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
        <ActionButton
          block
          variant="secondary"
          label={t("common.cancel")}
          onPress={() => {
            Keyboard.dismiss();
            onCancel();
          }}
        />
        <ActionButton
          block
          label={t("common.save")}
          disabled={!isValid}
          onPress={() => void save()}
        />
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

/**
 * One row, the height of a date row: label left, the number and its unit right.
 * A full MetricInput tile left most of its width empty for a two-to-four digit count.
 */
function DaysRow({
  label,
  unit,
  error,
  value,
  ...input
}: {
  label: string;
  unit: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  onSubmitEditing: () => void;
  error: string | undefined;
}) {
  const c = useThemeColors();
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const border = error
    ? "border-danger-fg"
    : focused
      ? "border-text-secondary"
      : "border-transparent";
  return (
    <View>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        className={`min-h-12 flex-row items-center justify-between gap-3 rounded-lg border bg-surface-raised px-4 py-2 ${border}`}
      >
        <T variant="label" tone={error ? "danger" : "secondary"}>
          {label}
        </T>
        <View className="flex-row items-baseline gap-1.5">
          <TextInput
            ref={inputRef}
            accessibilityLabel={`${label} (${unit})`}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={4}
            selectTextOnFocus
            placeholderTextColor={c.textQuiet}
            maxFontSizeMultiplier={1.25}
            className="min-w-8 p-0 text-right font-mono-bold text-headline-sm tracking-stat text-text-primary"
            value={value}
            onFocus={() => setFocused(true)}
            {...input}
            onBlur={() => {
              setFocused(false);
              input.onBlur();
            }}
          />
          <T variant="labelPlain" tone="secondary">
            {unit}
          </T>
        </View>
      </Pressable>
      {error ? (
        <T variant="bodySm" tone="danger" className="mt-1 px-1">
          {error}
        </T>
      ) : null}
    </View>
  );
}
