import { goalForDay, snapGoal } from "../goal-rules";

describe("goalForDay", () => {
  const changes = [
    { effectiveFrom: "2026-05-01", steps: 8000 },
    { effectiveFrom: "2026-06-01", steps: 10000 },
    { effectiveFrom: "2026-07-01", steps: null },
  ];

  it("applies the first goal to every earlier day", () => {
    expect(goalForDay(changes, "2020-01-01")).toBe(8000);
  });

  it("uses the latest change on or before the day", () => {
    expect(goalForDay(changes, "2026-05-31")).toBe(8000);
    expect(goalForDay(changes, "2026-06-01")).toBe(10000);
  });

  it("supports turning the goal off", () => {
    expect(goalForDay(changes, "2026-08-01")).toBeNull();
  });

  it("has no goal without history", () => {
    expect(goalForDay([], "2026-08-01")).toBeNull();
  });
});

describe("snapGoal", () => {
  it("clamps and snaps to the 100-step grid", () => {
    expect(snapGoal(10_240)).toBe(10_200);
    expect(snapGoal(7_350)).toBe(7_400);
    expect(snapGoal(10)).toBe(1000);
    expect(snapGoal(99_999)).toBe(50_000);
  });
});
