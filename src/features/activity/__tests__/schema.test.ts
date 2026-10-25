import { addDaysToKey, todayKey } from "@/src/lib/day";
import { addStepsInput, logWalkInput } from "../schema";

const today = todayKey();

describe("addStepsInput", () => {
  it("accepts text input with separators", () => {
    expect(addStepsInput.parse({ day: today, steps: "2,500" })).toEqual({
      day: today,
      steps: 2500,
    });
  });

  it("rejects zero, empty, and absurd counts", () => {
    expect(addStepsInput.safeParse({ day: today, steps: "" }).success).toBe(false);
    expect(addStepsInput.safeParse({ day: today, steps: 0 }).success).toBe(false);
    expect(addStepsInput.safeParse({ day: today, steps: 100_001 }).success).toBe(false);
  });

  it("rejects future days", () => {
    expect(addStepsInput.safeParse({ day: addDaysToKey(today, 1), steps: 10 }).success).toBe(false);
  });
});

describe("logWalkInput", () => {
  it("converts to meters and seconds", () => {
    expect(
      logWalkInput.parse({
        day: today,
        unit: "mi",
        distance: "1",
        durationMinutes: "30",
        steps: "2000",
      }),
    ).toEqual({ day: today, steps: 2000, distanceMeters: 1609.344, durationSeconds: 1800 });
  });

  it("accepts a comma decimal and duration only", () => {
    expect(
      logWalkInput.parse({ day: today, unit: "km", distance: "2,5", steps: 3000 }).distanceMeters,
    ).toBe(2500);
    expect(
      logWalkInput.parse({ day: today, unit: "km", durationMinutes: "20", steps: 2000 })
        .distanceMeters,
    ).toBeNull();
  });

  it("needs distance or duration", () => {
    expect(logWalkInput.safeParse({ day: today, unit: "km", steps: 2000 }).success).toBe(false);
  });
});
