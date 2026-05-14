import {
  createVideoPokerDeck,
  drawUltimateXHands,
  getUltimateXTotalBet,
  settleUltimateXDraw,
} from "./ultimateXLogic";

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

describe("Ultimate X logic", () => {
  it("uses a 52-card video poker deck without a Pai Gow joker", () => {
    const deck = createVideoPokerDeck();

    expect(deck).toHaveLength(52);
    expect(deck.some((deckCard) => deckCard.rank === "Joker")).toBe(false);
  });

  it("copies held cards into all ten drawn hands and excludes original discards from replacement cards", () => {
    const baseHand = [card("A", "S"), card("K", "S"), card("2", "C"), card("7", "D"), card("9", "H")];
    const hands = drawUltimateXHands({ baseHand, heldIndexes: [0, 1], handCount: 10 });
    const originalIds = new Set(baseHand.map((baseCard) => `${baseCard.rank}-${baseCard.suit}`));

    expect(hands).toHaveLength(10);
    hands.forEach((hand) => {
      expect(hand).toHaveLength(5);
      expect(hand[0]).toEqual(baseHand[0]);
      expect(hand[1]).toEqual(baseHand[1]);
      hand.slice(2).forEach((drawnCard) => {
        expect(originalIds.has(`${drawnCard.rank}-${drawnCard.suit}`)).toBe(false);
      });
    });
  });

  it("charges double the main wager only when Ultimate X is enabled", () => {
    expect(getUltimateXTotalBet({ betPerHand: 5, ultimateXEnabled: true, handCount: 10 })).toBe(100);
    expect(getUltimateXTotalBet({ betPerHand: 5, ultimateXEnabled: false, handCount: 10 })).toBe(50);
  });

  it("applies current multipliers and awards next multipliers when Ultimate X is enabled", () => {
    const baseHand = [card("A", "S"), card("K", "S"), card("Q", "S"), card("J", "S"), card("10", "S")];
    const currentMultipliers = [12, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    const settlement = settleUltimateXDraw({
      baseHand,
      heldIndexes: [0, 1, 2, 3, 4],
      currentMultipliers,
      ultimateXEnabled: true,
      betPerHand: 5,
    });

    expect(settlement.results[0]).toMatchObject({
      payUnits: 800,
      baseWin: 4000,
      multiplier: 12,
      lineWin: 48000,
      nextMultiplier: 7,
    });
    expect(settlement.totalWin).toBe(48000 + 4000 * 9);
    expect(settlement.nextMultipliers).toEqual(Array(10).fill(7));
  });

  it("pays existing multipliers but does not award new ones when Ultimate X is disabled", () => {
    const baseHand = [card("A", "S"), card("K", "S"), card("Q", "S"), card("J", "S"), card("10", "S")];

    const settlement = settleUltimateXDraw({
      baseHand,
      heldIndexes: [0, 1, 2, 3, 4],
      currentMultipliers: Array(10).fill(3),
      ultimateXEnabled: false,
      betPerHand: 5,
    });

    expect(settlement.totalWin).toBe(4000 * 3 * 10);
    expect(settlement.nextMultipliers).toEqual(Array(10).fill(1));
  });
});
