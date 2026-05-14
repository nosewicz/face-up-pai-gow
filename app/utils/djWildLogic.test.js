import {
  compareDjWildHands,
  evaluateDjWildHand,
  getBadBeatPayout,
  getTripsPayout,
  settleDjWildRound,
} from "./djWildLogic";

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

const joker = () => ({ rank: "Joker", suit: null, value: 15 });

describe("DJ Wild hand evaluation", () => {
  it("ranks all deuces plus joker as Five Wilds", () => {
    const hand = [card("2", "C"), card("2", "D"), card("2", "H"), card("2", "S"), joker()];

    expect(evaluateDjWildHand(hand)).toMatchObject({
      key: "fiveWilds",
      label: "Five Wilds",
    });
  });

  it("uses deuces and joker as fully wild cards for a royal flush", () => {
    const hand = [card("A", "S"), card("K", "S"), card("Q", "S"), card("2", "C"), joker()];

    expect(evaluateDjWildHand(hand)).toMatchObject({
      key: "royalFlush",
      usesWild: true,
    });
  });

  it("ranks a royal flush above five of a kind", () => {
    const royal = [card("A", "S"), card("K", "S"), card("Q", "S"), card("2", "C"), joker()];
    const fiveKind = [card("A", "S"), card("A", "H"), card("A", "D"), card("2", "C"), joker()];

    expect(compareDjWildHands(royal, fiveKind)).toBe(1);
  });
});

describe("DJ Wild payouts", () => {
  it("chooses the better natural Trips payout when a deuce is not needed as wild", () => {
    const hand = [card("2", "C"), card("2", "D"), card("2", "H"), card("9", "S"), card("K", "C")];

    expect(getTripsPayout(hand)).toBe(6);
  });

  it("pays the bad beat based on the losing qualifying hand", () => {
    const losingStraight = evaluateDjWildHand([
      card("9", "C"),
      card("8", "D"),
      card("7", "H"),
      card("6", "S"),
      card("5", "C"),
    ]);

    expect(getBadBeatPayout(losingStraight)).toBe(50);
  });

  it("settles ante, play, blind, trips, and bad beat on a player win", () => {
    const playerHand = [card("A", "S"), card("K", "S"), card("Q", "S"), card("J", "S"), card("10", "S")];
    const dealerHand = [card("9", "C"), card("8", "D"), card("7", "H"), card("6", "S"), card("5", "C")];

    const result = settleDjWildRound({
      bankroll: 1000,
      bets: { ante: 10, trips: 5, badBeat: 5 },
      playerHand,
      dealerHand,
      action: "play",
    });

    expect(result.result).toBe("PLAYER WINS");
    expect(result.newRoll).toBe(1000 + 30 + 500 + 5000 + 250);
    expect(result.breakdown.badBeat).toMatchObject({ outcome: "WIN", net: 250 });
  });
});
