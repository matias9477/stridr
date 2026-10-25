import { formatCompact, formatGoalPercent, formatSignedPercent } from "../format";

describe("formatCompact", () => {
  it("truncates so it never reaches a round number early", () => {
    expect(formatCompact(9_960)).toBe("9.9K");
    expect(formatCompact(10_049)).toBe("10K");
    expect(formatCompact(14_832)).toBe("14.8K");
    expect(formatCompact(1_999_999)).toBe("1.9M");
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(-2_480)).toBe("-2.4K");
  });
});

describe("formatGoalPercent", () => {
  it("floors until the goal is met", () => {
    expect(formatGoalPercent(99.96, false)).toBe("99.9%");
    expect(formatGoalPercent(99.6, false, 0)).toBe("99%");
    expect(formatGoalPercent(100, true, 0)).toBe("100%");
    expect(formatGoalPercent(148.36, true)).toBe("148.4%");
  });
});

describe("formatSignedPercent", () => {
  it("drops the sign when the value rounds to zero", () => {
    expect(formatSignedPercent(-0.04)).toBe("0.0%");
    expect(formatSignedPercent(8.44)).toBe("+8.4%");
    expect(formatSignedPercent(-3)).toBe("−3.0%");
  });
});
