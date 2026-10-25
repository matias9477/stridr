jest.mock("expo-file-system", () => ({}));
jest.mock("expo-sharing", () => ({}));

import type { ManualActivityRow } from "@/src/db/schema";
import { buildCsv } from "../csv-export";

describe("buildCsv", () => {
  it("writes one row per day with data and lists manual entries", () => {
    const csv = buildCsv(
      [
        {
          day: "2026-10-20",
          healthSteps: 5000,
          manualSteps: 1000,
          total: 6000,
          goal: 5000,
          goalMet: true,
        },
        {
          day: "2026-10-21",
          healthSteps: null,
          manualSteps: 0,
          total: null,
          goal: 5000,
          goalMet: null,
        },
      ],
      [
        {
          id: 1,
          uuid: "u",
          kind: "walk",
          day: "2026-10-20",
          steps: 1000,
          estimatedSteps: 1100,
          distanceMeters: 800,
          durationSeconds: null,
          strideMeters: 0.75,
          cadenceSpm: 100,
          createdAt: "2026-10-20 10:00:00",
          updatedAt: "2026-10-20 10:00:00",
        } satisfies ManualActivityRow,
      ],
    );
    const lines = csv.trim().split("\n");
    expect(lines[1]).toBe("2026-10-20,5000,1000,6000,5000,1");
    expect(lines).not.toContain(expect.stringContaining("2026-10-21,"));
    expect(lines.at(-1)).toBe("2026-10-20,walk,1000,1100,800,,2026-10-20 10:00:00");
  });
});
