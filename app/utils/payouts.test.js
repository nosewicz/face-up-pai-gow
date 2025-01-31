/**
 * payouts.test.js
 *
 * Testing settleMainBet, settleFortuneBet, and settleAllBets.
 */

import { settleAllBets } from './payouts';

// If you have separate named exports:
import { settleMainBet, settleFortuneBet } from './payouts';

// If your code needs "evaluateBest5of7", "getCategoryName" from 'pokerEvaluator.js',
// you can import them or mock them if you want an isolated test.

describe("Main bet settlement", () => {
  it("should pay 1:1 on a player win (no commission)", () => {
    const initialBankroll = 1000;
    const mainBet = 100;
    const mainResult = "PLAYER WINS";

    // We'll do a direct call to settleMainBet if you have it exported
    const finalBankroll = settleMainBet(initialBankroll, mainBet, mainResult);

    expect(finalBankroll).toBe(1100); // 1000 + 100
  });

  it("should subtract main bet on a dealer win", () => {
    const initialBankroll = 1000;
    const mainBet = 50;
    const mainResult = "DEALER WINS";

    const finalBankroll = settleMainBet(initialBankroll, mainBet, mainResult);

    expect(finalBankroll).toBe(950); // 1000 - 50
  });

  it("should leave bankroll unchanged on a push", () => {
    const initialBankroll = 1000;
    const mainBet = 200;
    const mainResult = "PUSH";

    const finalBankroll = settleMainBet(initialBankroll, mainBet, mainResult);

    expect(finalBankroll).toBe(1000); // no change
  });
});

describe("Fortune bet settlement", () => {
  // Suppose we want to test "3-of-a-kind" pay => 4:1 total. 
  // We'll either:
  // 1) Provide real 7 cards that form at least 3-of-a-kind in the best 5.
  // 2) Or mock the evaluateBest5of7 function to force a certain category.

  it("should pay 3-of-a-kind multiplier if best5 is 3-of-a-kind", () => {
    // approach: mock the evaluateBest5of7 if your code is set up to import it.
    // But let's assume we pass real cards for a 7 card that has 3-of-a-kind guaranteed.

    // For a simpler approach, let's assume we have a mock function or we do a manual override.
    // For demonstration, let's do a quick jest.mock approach:
    // (If you prefer real card data, see next test.)

    // We'll do a manual mock:
   // jest.mock('./pokerEvaluator', () => ({
      // Force evaluateBest5of7 => { category: 4 } => "threeOfAKind"
      //evaluateBest5of7: jest.fn(() => ({ category: 4, tiebreaks: [] })),
      //getCategoryName: jest.fn(() => "threeOfAKind"),
    //}));

    // Re-require payouts after mocking
    //const { settleFortuneBet } = require('./payouts');

    const initialBankroll = 1000;
    const fortuneBet = 10;
    const player7Cards = [{ rank: "10", value: 10, suit: "C" },
      { rank: "10", value: 10, suit: "D" },
      { rank: "10", value: 10, suit: "H" },
      { rank: "2", value: 2, suit: "C" },
      { rank: "5", value: 5, suit: "D" },
      { rank: "7", value: 7, suit: "H" },
      { rank: "K", value: 13, suit: "S" },]; // doesn't matter, because we're mocking

    const finalBankroll = settleFortuneBet(initialBankroll, fortuneBet, player7Cards);

    // 3-of-a-kind = 4 => total 4 x original => net +3
    expect(finalBankroll).toBe(1000 + (10 * 3)); // 1000 + 30 => 1030

    jest.resetModules(); 
  });

  it("should lose fortune bet if best is only high card", () => {
    // Another mock scenario or real 7-cards. We'll do a real mock again:
    jest.mock('./pokerEvaluator', () => ({
      evaluateBest5of7: jest.fn(() => ({ category: 1, tiebreaks: [] })),
      getCategoryName: jest.fn(() => "highCard"),
    }));
    const { settleFortuneBet } = require('./payouts');

    const initialBankroll = 1000;
    const fortuneBet = 50;
    const player7Cards = []; // doesn't matter, because mocked

    const finalBankroll = settleFortuneBet(initialBankroll, fortuneBet, player7Cards);
    // no 3-of-a-kind or better => lose bet
    expect(finalBankroll).toBe(950);

    jest.resetModules(); 
  });
});

describe("settleAllBets combined", () => {
  // Example scenario: main bet = 100, fortune = 10, result= "PLAYER WINS", best5=straight => 5 => net +4 on fortune.
  it("player wins main, also hits straight on fortune", () => {
    // We'll do a partial mock, or provide real data. Let's do a partial mock for simplicity:
    jest.mock('./pokerEvaluator', () => ({
      evaluateBest5of7: jest.fn(() => ({ category: 5, tiebreaks: [] })), // numeric 5 => "straight"
      getCategoryName: jest.fn(() => "straight"),
    }));
    const { settleAllBets } = require('./payouts');

    const bankroll = 1000;
    const bets = { main: 100, fortune: 10 };
    const mainResult = "PLAYER WINS";
    const player7Cards = [];

    const newRoll = settleAllBets({ bankroll, bets, mainResult, player7Cards });
    // main bet: +100
    // fortune 'straight': multiplier=5 => net +4 * fortuneBet => +40
    // total +140 => 1140
    expect(newRoll).toBe(1140);

    jest.resetModules();
  });
});
