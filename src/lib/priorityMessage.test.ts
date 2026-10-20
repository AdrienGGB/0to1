import { describe, expect, it } from "vitest";

import { priorityMessageRecordSchema, priorityMessageSchema } from "./priorityMessage";

describe("priorityMessageSchema", () => {
  it("accepts one to three distinct themes", () => {
    expect(priorityMessageSchema.safeParse({ choice: "themes", themeIds: ["logement"] }).success).toBe(true);
    expect(
      priorityMessageSchema.safeParse({ choice: "themes", themeIds: ["logement", "sante", "emploi"] }).success,
    ).toBe(true);
  });

  it("rejects no theme, four themes or a repeated theme", () => {
    for (const themeIds of [[], ["a", "b", "c", "d"], ["a", "a"]]) {
      expect(priorityMessageSchema.safeParse({ choice: "themes", themeIds }).success).toBe(false);
    }
  });

  it("accepts the two non-answers without themes only", () => {
    expect(priorityMessageSchema.safeParse({ choice: "dont_know" }).success).toBe(true);
    expect(priorityMessageSchema.safeParse({ choice: "prefer_not", themeIds: [] }).success).toBe(true);
    expect(priorityMessageSchema.safeParse({ choice: "prefer_not", themeIds: ["a"] }).success).toBe(false);
  });

  it("requires a session on the record sent to the server", () => {
    const message = { choice: "themes", themeIds: ["logement"] };
    expect(priorityMessageRecordSchema.safeParse(message).success).toBe(false);
    expect(
      priorityMessageRecordSchema.safeParse({
        ...message,
        sessionId: "3f2b8c1e-6d4a-4c8e-9b1a-2e7f5d9c0a11",
        sessionToken: "1792430000000.signature",
        displaySeed: 42,
      }).success,
    ).toBe(true);
  });
});
