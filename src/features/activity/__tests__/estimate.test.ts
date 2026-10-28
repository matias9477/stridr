import {
  ESTIMATION_DEFAULTS,
  estimateSteps,
  fromMeters,
  resolveEstimationSettings,
  strideFromHeightCm,
  toMeters,
} from "../estimate";

const defaults = { strideMeters: ESTIMATION_DEFAULTS.strideMeters, cadenceSpm: 100 };

describe("estimateSteps", () => {
  it("uses distance / stride", () => {
    expect(estimateSteps({ distanceMeters: 1400 }, defaults)).toEqual({
      steps: 2000,
      basis: "distance",
    });
  });

  it("uses duration × cadence when only duration is given", () => {
    expect(estimateSteps({ durationSeconds: 30 * 60 }, defaults)).toEqual({
      steps: 3000,
      basis: "duration",
    });
  });

  it("prefers distance when both are given", () => {
    expect(estimateSteps({ distanceMeters: 750, durationSeconds: 3600 }, defaults)?.basis).toBe(
      "distance",
    );
  });

  it("returns null without usable input", () => {
    expect(estimateSteps({}, defaults)).toBeNull();
    expect(estimateSteps({ distanceMeters: 0, durationSeconds: null }, defaults)).toBeNull();
  });
});

describe("resolveEstimationSettings", () => {
  it("prefers manual stride, then height, then the default", () => {
    expect(
      resolveEstimationSettings({ strideCm: 80, heightCm: 190, cadenceSpm: null }),
    ).toMatchObject({
      strideMeters: 0.8,
      strideSource: "manual",
      cadenceSpm: 100,
    });
    expect(
      resolveEstimationSettings({ strideCm: null, heightCm: 180, cadenceSpm: 110 }),
    ).toMatchObject({
      strideMeters: strideFromHeightCm(180),
      strideSource: "height",
      cadenceSpm: 110,
    });
    expect(
      resolveEstimationSettings({ strideCm: null, heightCm: null, cadenceSpm: null }).strideSource,
    ).toBe("default");
  });

  it("derives stride from height", () => {
    expect(strideFromHeightCm(176)).toBe(0.73);
  });
});

describe("unit conversion", () => {
  it("round-trips miles", () => {
    expect(fromMeters(toMeters(3, "mi"), "mi")).toBeCloseTo(3);
    expect(toMeters(1.5, "km")).toBe(1500);
  });
});
