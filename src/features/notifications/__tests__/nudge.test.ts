import { planPaceNudge } from "../nudge";

const at = (h: number, m = 0) => new Date(2026, 9, 25, h, m);

describe("planPaceNudge", () => {
  it("schedules 18:00 today when behind the 18:00 pace mark", () => {
    const plan = planPaceNudge({ now: at(12), total: 3000, goal: 10000 });
    expect(plan?.fireAt).toEqual(at(18));
    expect(plan?.remaining).toBe(7000);
  });

  it("skips when already at the pace mark (11/15 of the goal)", () => {
    expect(planPaceNudge({ now: at(12), total: 7334, goal: 10000 })).toBeNull();
    expect(planPaceNudge({ now: at(12), total: 7333, goal: 10000 })).not.toBeNull();
  });

  it("skips without a goal or without data", () => {
    expect(planPaceNudge({ now: at(12), total: 100, goal: null })).toBeNull();
    expect(planPaceNudge({ now: at(12), total: null, goal: 10000 })).toBeNull();
  });

  it("skips at or after the nudge time", () => {
    expect(planPaceNudge({ now: at(18), total: 0, goal: 10000 })).toBeNull();
    expect(planPaceNudge({ now: at(20, 30), total: 0, goal: 10000 })).toBeNull();
  });

  it("schedules for a real zero", () => {
    expect(planPaceNudge({ now: at(8), total: 0, goal: 8000 })?.remaining).toBe(8000);
  });
});
