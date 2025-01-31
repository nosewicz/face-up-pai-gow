// payouts.js

import { evaluateBest5of7, getCategoryName } from "./pokerEvaluator";

// Example paytable
const fortunePaytable = {
  threeOfAKind: 4,
  straight: 5,
  flush: 6,
  fullHouse: 9,
  fourOfAKind: 25,
  straightFlush: 50,
  royalFlush: 150
};

// Map the main bet outcome ("PLAYER WINS", "DEALER WINS", "PUSH")
// to a multiplier or direct logic. If you have a commission, handle it here.
export function settleMainBet(bankroll, mainBet, mainResult) {
  let newRoll = bankroll;
  if (mainResult === "PLAYER WINS") {
    // simple 1:1
    newRoll += mainBet;
  } else if (mainResult === "DEALER WINS") {
    newRoll -= mainBet;
  } else {
    // PUSH => no change
  }
  return newRoll;
}

// Fortune side bet
export function settleFortuneBet(bankroll, fortuneBet, player7Cards) {
  if (fortuneBet <= 0) return bankroll;

  // Evaluate best 5-of-7
  const bestEval = evaluateBest5of7(player7Cards);
  const categoryName = getCategoryName(bestEval.category);  // e.g. "straight"

  const multiplier = fortunePaytable[categoryName] || 0;
  if (multiplier > 0) {
    // net gain = (multiplier - 1)*fortuneBet
    return bankroll + fortuneBet * (multiplier - 1);
  } else {
    // lose bet
    return bankroll - fortuneBet;
  }
}

/** 
 * The main entry point to settle all bets:
 * 
 * param {object} params
 *   bankroll: number
 *   bets: { main: number, fortune: number, etc. }
 *   mainResult: "PLAYER WINS" | "DEALER WINS" | "PUSH"
 *   player7Cards: array of 7 card objects
 * return newBankroll: number
 */
export function settleAllBets({ bankroll, bets, mainResult, player7Cards }) {
  let newRoll = bankroll;
  
  // Main bet logic:
  let mainOutcome = "PUSH";
  let mainNet = 0;
  if (mainResult === "PLAYER WINS") {
    mainOutcome = "WIN";
    mainNet = bets.main; // or 2× if you remove upfront, etc.
    newRoll += mainNet;
  } else if (mainResult === "DEALER WINS") {
    mainOutcome = "LOSE";
    mainNet = -bets.main;
    newRoll += mainNet;
  }
  // if PUSH => mainNet=0, do nothing

  // Fortune logic:
  let fortuneOutcome = "LOSE";
  let fortuneNet = -bets.fortune; // default lose
  let fortuneNote = "";
  
  // Evaluate the player's best 5-of-7, see if they qualify for bonus
  // e.g. if 3-of-a-kind => pay 4×
  const bestEval = evaluateBest5of7(player7Cards);
  const categoryName = getCategoryName(bestEval.category);
  const multiplier = fortunePaytable[categoryName] || 0;
  if (multiplier > 0) {
    fortuneOutcome = "WIN";
    // net gain = (multiplier - 1)*bets.fortune if you remove the bet at the end 
    // or multiplier*bets.fortune if you remove up front. 
    // Here I'll assume approach A (only remove at final).
    fortuneNet = bets.fortune * (multiplier - 1);
    newRoll += fortuneNet;
    fortuneNote = `Hand: ${categoryName} pays ${multiplier}× on Fortune`;
  } else {
    fortuneNote = `Hand: ${categoryName} => no bonus`;
    newRoll += fortuneNet; // negative
  }

  // Return final plus a "breakdown" object
  return {
    newRoll,
    breakdown: {
      main: {
        outcome: mainOutcome,
        net: mainNet,
      },
      fortune: {
        outcome: fortuneOutcome,
        net: fortuneNet,
        note: fortuneNote
      }
    }
  };
}