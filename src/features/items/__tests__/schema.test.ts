import { itemsInput } from "../schema";

describe("itemsInput", () => {
  it("accepts a valid input and trims whitespace", () => {
    const result = itemsInput.parse({ title: "  Hello  ", notes: " note " });
    expect(result.title).toBe("Hello");
    expect(result.notes).toBe("note");
  });

  it("rejects an empty title", () => {
    expect(itemsInput.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects a title over 120 characters", () => {
    expect(itemsInput.safeParse({ title: "x".repeat(121) }).success).toBe(false);
  });

  it("allows notes to be omitted", () => {
    expect(itemsInput.safeParse({ title: "ok" }).success).toBe(true);
  });
});
