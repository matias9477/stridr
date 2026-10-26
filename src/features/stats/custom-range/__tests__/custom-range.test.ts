import type { TFunction } from "i18next";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { customChipLabel } from "../custom-range-label";
import { customRangeSchema } from "../schema";

const TODAY: DayKey = "2026-10-21";
const HISTORY: DayKey = "2026-01-01";
const schema = customRangeSchema(TODAY, HISTORY);
const base = { days: "", from: TODAY, to: TODAY };

describe("customRangeSchema", () => {
  it("parses last N days from text input", () => {
    expect(schema.parse({ ...base, kind: "last", days: "13" })).toEqual({ kind: "last", days: 13 });
  });

  it("rejects empty, zero and more than ten years", () => {
    for (const days of ["", "0", "3651"]) {
      expect(schema.safeParse({ ...base, kind: "last", days }).success).toBe(false);
    }
  });

  it("keeps only the chosen mode's fields", () => {
    expect(
      schema.parse({ kind: "between", days: "13", from: "2026-03-04", to: "2026-04-02" }),
    ).toEqual({ kind: "between", from: "2026-03-04", to: "2026-04-02" });
  });

  it("allows a single day", () => {
    expect(schema.safeParse({ ...base, kind: "between" }).success).toBe(true);
  });

  it("rejects reversed, future and pre-history dates", () => {
    const between = (from: DayKey, to: DayKey) =>
      schema.safeParse({ ...base, kind: "between", from, to }).success;
    expect(between("2026-04-02", "2026-03-04")).toBe(false);
    expect(between("2026-03-04", addDaysToKey(TODAY, 1))).toBe(false);
    expect(between("2025-12-31", "2026-03-04")).toBe(false);
  });
});

describe("customChipLabel", () => {
  const t = ((key: string, opts?: { count?: number }) =>
    key === "stats.custom.chipDays"
      ? `${opts?.count}D`
      : key === "stats.custom.chipDate"
        ? "M/d"
        : key) as unknown as TFunction;

  it("names an unsaved range Custom", () => {
    expect(customChipLabel(null, t)).toBe("stats.range.custom");
  });

  it("summarizes last N days and date spans", () => {
    expect(customChipLabel({ kind: "last", days: 13 }, t)).toBe("13D");
    expect(customChipLabel({ kind: "between", from: "2026-03-04", to: "2026-04-02" }, t)).toBe(
      "3/4–4/2",
    );
    expect(customChipLabel({ kind: "between", from: "2026-03-04", to: "2026-03-04" }, t)).toBe(
      "3/4",
    );
  });
});
