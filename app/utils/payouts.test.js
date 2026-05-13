import { settleAllBets, settleFortuneBet, settleMainBet } from "./payouts";

const card = (rank, suit) => ({
  rank,
  suit,
  value: rank === "A" ? 14 : rank === "K" ? 13 : rank === "Q" ? 12 : rank === "J" ? 11 : Number(rank),
});

describe("Main bet settlement", () => {
  it("pays 1:1 on a player win", () => {
    expect(settleMainBet(1000, 100, "PLAYER WINS")).toBe(1100);
  });

  it("subtracts the main bet on a dealer win", () => {
    expect(settleMainBet(1000, 50, "DEALER WINS")).toBe(950);
  });

  it("leaves bankroll unchanged on a push", () => {
    expect(settleMainBet(1000, 200, "PUSH")).toBe(1000);
  });
});

describe("Fortune bet settlement", () => {
  it("pays the three-of-a-kind multiplier", () => {
    const player7Cards = [
      card("10", "C"),
      card("10", "D"),
      card("10", "H"),
      card("2", "C"),
      card("5", "D"),
      card("7", "H"),
      card("K", "S"),
    ];

    expect(settleFortuneBet(1000, 10, player7Cards)).toBe(1030);
  });

  it("loses the fortune bet when the best hand is only high card", () => {
    const player7Cards = [
      card("2", "C"),
      card("5", "D"),
      card("7", "H"),
      card("9", "S"),
      card("J", "C"),
      card("Q", "D"),
      card("A", "H"),
    ];

    expect(settleFortuneBet(1000, 50, player7Cards)).toBe(950);
  });

  it("does not evaluate or change bankroll when no fortune bet is placed", () => {
    expect(settleFortuneBet(1000, 0, [])).toBe(1000);
  });
});

describe("settleAllBets combined", () => {
  it("settles a player main win and straight fortune bonus", () => {
    const player7Cards = [
      card("9", "C"),
      card("10", "D"),
      card("J", "H"),
      card("Q", "S"),
      card("K", "C"),
      card("2", "D"),
      card("5", "H"),
    ];

    const result = settleAllBets({
      bankroll: 1000,
      bets: { main: 100, fortune: 10 },
      mainResult: "PLAYER WINS",
      player7Cards,
    });

    expect(result.newRoll).toBe(1140);
    expect(result.breakdown.main).toEqual({ outcome: "WIN", net: 100 });
    expect(result.breakdown.fortune).toMatchObject({ outcome: "WIN", net: 40 });
  });

  it("skips fortune evaluation when there is no fortune bet", () => {
    const result = settleAllBets({
      bankroll: 1000,
      bets: { main: 25, fortune: 0 },
      mainResult: "PUSH",
      player7Cards: [],
    });

    expect(result.newRoll).toBe(1000);
    expect(result.breakdown.fortune).toMatchObject({ outcome: "PUSH", net: 0 });
  });
});
