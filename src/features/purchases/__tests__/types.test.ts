import { parseProVariant } from "../types";

describe("parseProVariant", () => {
  it("accepts the known variants", () => {
    expect(parseProVariant("stats")).toBe("stats");
    expect(parseProVariant("widgets")).toBe("widgets");
  });

  it("takes the first value of a repeated search param", () => {
    expect(parseProVariant(["widgets", "stats"])).toBe("widgets");
  });

  it("falls back to generic for anything else", () => {
    expect(parseProVariant(undefined)).toBeNull();
    expect(parseProVariant("")).toBeNull();
    expect(parseProVariant("STATS")).toBeNull();
    // CSV export was Pro in the first draft; old links fall back to generic.
    expect(parseProVariant("export")).toBeNull();
    expect(parseProVariant([])).toBeNull();
  });
});
