import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { addDaysToKey, type DayKey, todayKey } from "@/src/lib/day";
import { dayLabel, formatSteps } from "@/src/lib/format";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { MetricInput } from "@/src/ui/metric-input";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { estimateSteps, toMeters } from "./estimate";
import {
  type AddStepsIn,
  type AddStepsOut,
  addStepsInput,
  type LogWalkIn,
  type LogWalkOut,
  logWalkInput,
} from "./schema";
import { useEstimationSettings } from "./use-estimation-settings";

/** Quick day picker: the last week, plus the entry's own day when editing something older. */
const PICKER_DAYS = 7;

function DayPicker({ value, onChange }: { value: DayKey; onChange: (day: DayKey) => void }) {
  const { t } = useTranslation();
  const today = todayKey();
  const days = useMemo(() => {
    const list = Array.from({ length: PICKER_DAYS }, (_, i) => addDaysToKey(today, -i));
    if (!list.includes(value)) list.push(value);
    return list;
  }, [today, value]);

  return (
    <View className="mb-4 gap-2">
      <PanelHeader label={t("activity.form.day")} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1.5"
      >
        {days.map((day) => {
          const selected = day === value;
          const label =
            day === today
              ? t("stats.log.today")
              : day === addDaysToKey(today, -1)
                ? t("stats.log.yesterday")
                : dayLabel(day, "EEE d");
          return (
            <Pressable
              key={day}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={dayLabel(day, "EEEE, MMMM d")}
              onPress={() => onChange(day)}
              className={`rounded px-3 py-2.5 ${selected ? "bg-accent-fg" : "bg-surface-card active:opacity-60"}`}
            >
              <T variant="label" tone={selected ? "on-accent" : "secondary"}>
                {label}
              </T>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** The double-count warning (spec §3.3), shown above every save. */
function SupplementalHint() {
  const { t } = useTranslation();
  const c = useThemeColors();
  return (
    <Panel surface="sunken" className="mb-4 flex-row gap-3">
      <MaterialCommunityIcons name="information-outline" size={16} color={c.textTertiary} />
      <T variant="bodySm" tone="secondary" className="flex-1">
        {t("activity.form.stepsHint")}
      </T>
    </Panel>
  );
}

/** Spec §3.3: manual steps must be activity HealthKit did NOT record. Asked on create only. */
function confirmSupplemental(t: (key: string) => string, onConfirm: () => void) {
  Alert.alert(t("activity.confirm.title"), t("activity.confirm.body"), [
    { text: t("common.cancel"), style: "cancel" },
    { text: t("activity.confirm.add"), onPress: onConfirm },
  ]);
}

interface StepsFormProps {
  defaultValues?: Partial<AddStepsIn>;
  submitLabel: string;
  confirm: boolean;
  onSubmit: (values: AddStepsOut) => Promise<void>;
}

export function StepsForm({ defaultValues, submitLabel, confirm, onSubmit }: StepsFormProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddStepsIn, unknown, AddStepsOut>({
    resolver: zodResolver(addStepsInput),
    defaultValues: { day: todayKey(), steps: "", ...defaultValues },
  });

  const submit = handleSubmit((values) =>
    confirm
      ? new Promise<void>((resolve) =>
          confirmSupplemental(t, () => void onSubmit(values).finally(resolve)),
        )
      : onSubmit(values),
  );

  return (
    <View>
      <Controller
        control={control}
        name="day"
        render={({ field }) => <DayPicker value={field.value} onChange={field.onChange} />}
      />
      <Controller
        control={control}
        name="steps"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4 flex-row">
            <MetricInput
              label={t("activity.form.steps")}
              unit={t("activity.form.stepsUnit")}
              placeholder="2500"
              keyboardType="number-pad"
              value={value === undefined ? "" : String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.steps?.message}
              autoFocus
            />
          </View>
        )}
      />
      <SupplementalHint />
      <ActionButton label={submitLabel} onPress={submit} loading={isSubmitting} />
    </View>
  );
}

interface WalkFormProps {
  defaultValues?: Partial<LogWalkIn>;
  submitLabel: string;
  confirm: boolean;
  onSubmit: (values: LogWalkOut, estimatedSteps: number | null) => Promise<void>;
}

/** Distance and/or duration → live estimate (spec §4) → adjustable final steps. */
export function WalkForm({ defaultValues, submitLabel, confirm, onSubmit }: WalkFormProps) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const settings = useEstimationSettings();
  // Editing an existing walk starts "touched" so its saved steps aren't overwritten.
  const [stepsTouched, setStepsTouched] = useState(defaultValues?.steps !== undefined);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LogWalkIn, unknown, LogWalkOut>({
    resolver: zodResolver(logWalkInput),
    defaultValues: {
      day: todayKey(),
      unit,
      distance: "",
      durationMinutes: "",
      steps: "",
      ...defaultValues,
    },
  });

  const [distance, durationMinutes] = useWatch({ control, name: ["distance", "durationMinutes"] });
  const estimate = useMemo(() => {
    const parse = (v: unknown) => {
      const n = Number(String(v ?? "").replace(",", "."));
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    const d = parse(distance);
    const m = parse(durationMinutes);
    return estimateSteps(
      {
        distanceMeters: d === null ? null : toMeters(d, unit),
        durationSeconds: m === null ? null : m * 60,
      },
      settings,
    );
  }, [distance, durationMinutes, unit, settings]);

  useEffect(() => {
    if (!stepsTouched) setValue("steps", estimate ? String(estimate.steps) : "");
  }, [estimate, stepsTouched, setValue]);

  const submit = handleSubmit((values) => {
    const save = () => onSubmit(values, estimate?.steps ?? null);
    return confirm
      ? new Promise<void>((resolve) => confirmSupplemental(t, () => void save().finally(resolve)))
      : save();
  });

  const unitLabel = unit === "km" ? "km" : "mi";

  return (
    <View>
      <Controller
        control={control}
        name="day"
        render={({ field }) => <DayPicker value={field.value} onChange={field.onChange} />}
      />
      <View className="mb-3 flex-row gap-3">
        <Controller
          control={control}
          name="distance"
          render={({ field: { onChange, onBlur, value } }) => (
            <MetricInput
              label={t("activity.form.distance")}
              unit={unitLabel}
              placeholder="2.5"
              keyboardType="decimal-pad"
              value={value === undefined ? "" : String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.distance?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="durationMinutes"
          render={({ field: { onChange, onBlur, value } }) => (
            <MetricInput
              label={t("activity.form.duration")}
              unit="min"
              placeholder="30"
              keyboardType="number-pad"
              value={value === undefined ? "" : String(value)}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.durationMinutes?.message}
            />
          )}
        />
      </View>

      <Panel surface="sunken" className="mb-3 gap-3">
        <PanelHeader
          label={t("activity.form.estimate")}
          right={<MaterialCommunityIcons name="shoe-print" size={16} color={c.textTertiary} />}
        />
        <View accessible className="flex-row items-baseline gap-1">
          <T variant="display" tone={estimate ? "primary" : "quiet"}>
            {estimate ? formatSteps(estimate.steps) : "—"}
          </T>
          {estimate ? (
            <T variant="labelPlain" tone="secondary">
              {t("activity.form.stepsUnit")}
            </T>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
          <T variant="micro" tone="quiet" className="flex-1">
            {estimate === null
              ? t("activity.form.estimateEmpty")
              : estimate.basis === "distance"
                ? t("activity.form.basisDistance", { cm: Math.round(settings.strideMeters * 100) })
                : t("activity.form.basisDuration", { spm: settings.cadenceSpm })}
          </T>
        </View>
      </Panel>

      <Controller
        control={control}
        name="steps"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-2 flex-row">
            <MetricInput
              label={t("activity.form.finalSteps")}
              unit={t("activity.form.stepsUnit")}
              keyboardType="number-pad"
              value={value === undefined ? "" : String(value)}
              onChangeText={(text) => {
                setStepsTouched(true);
                onChange(text);
              }}
              onBlur={onBlur}
              error={errors.steps?.message}
            />
          </View>
        )}
      />
      {stepsTouched && estimate ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setStepsTouched(false);
            setValue("steps", String(estimate.steps));
          }}
          hitSlop={8}
          className="mb-2 flex-row items-center gap-1.5 self-start rounded bg-surface-high px-2 py-1 active:opacity-60"
        >
          <MaterialCommunityIcons name="restore" size={12} color={c.textPrimary} />
          <T variant="micro">{t("activity.form.useEstimate")}</T>
        </Pressable>
      ) : null}
      <View className="mt-2">
        <SupplementalHint />
      </View>
      <ActionButton label={submitLabel} onPress={submit} loading={isSubmitting} />
    </View>
  );
}
