import { evaluateJacksOrBetterHand } from "./videoPokerEvaluator";

const values = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
};

const card = (rank, suit) => ({
  rank,
  suit,
  value: values[rank] || Number(rank),
});

describe("Jacks or Better video poker evaluation", () => {
  it("detects a royal flush", () => {
    const hand = [card("10", "S"), card("J", "S"), card("Q", "S"), card("K", "S"), card("A", "S")];

    expect(evaluateJacksOrBetterHand(hand)).toMatchObject({
      key: "royalFlush",
      label: "Royal Flush",
    });
  });

  it("detects an ace-low straight flush below a royal", () => {
    const hand = [card("A", "C"), card("2", "C"), card("3", "C"), card("4", "C"), card("5", "C")];

    expect(evaluateJacksOrBetterHand(hand)).toMatchObject({
      key: "straightFlush",
    });
  });

  it("pays only high pairs as Jacks or Better", () => {
    const lowPair = [card("10", "C"), card("10", "D"), card("3", "S"), card("7", "H"), card("A", "C")];
    const highPair = [card("J", "C"), card("J", "D"), card("3", "S"), card("7", "H"), card("A", "C")];

    expect(evaluateJacksOrBetterHand(lowPair).key).toBe("nothing");
    expect(evaluateJacksOrBetterHand(highPair).key).toBe("jacksOrBetter");
  });
});
