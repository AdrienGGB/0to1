import { describe, expect, it } from "vitest";

import { filterUnanswered, getCardKey } from "./answeredStore";

describe("filterUnanswered", () => {
  const cards = [
    { id: "a", version: 1 },
    { id: "b", version: 1 },
    { id: "c", version: 2 },
  ];

  it("drops card versions already answered on this device", () => {
    const answered = new Set([getCardKey({ id: "a", version: 1 })]);
    expect(filterUnanswered(cards, answered).map((card) => card.id)).toEqual(["b", "c"]);
  });

  it("shows a card again once it has a new version", () => {
    const answered = new Set([getCardKey({ id: "c", version: 1 })]);
    expect(filterUnanswered(cards, answered)).toHaveLength(3);
  });
});
