import { parseProVariant } from "../types";

describe("parseProVariant", () => {
  it("accepts the known variants", () => {
    expect(parseProVariant("stats")).toBe("stats");
    expect(parseProVariant("widgets")).toBe("widgets");
    expect(parseProVariant("export")).toBe("export");
  });

  it("takes the first value of a repeated search param", () => {
    expect(parseProVariant(["export", "stats"])).toBe("export");
  });

  it("falls back to generic for anything else", () => {
    expect(parseProVariant(undefined)).toBeNull();
    expect(parseProVariant("")).toBeNull();
    expect(parseProVariant("STATS")).toBeNull();
    expect(parseProVariant([])).toBeNull();
  });
});
