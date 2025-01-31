/**
 * houseWay.js
 *
 * A simplified House Way arrangement for 7 cards in Pai Gow Poker.
 * Expects your existing evaluators:
 *   - evaluate5CardHand, compare5CardHands (from pokerEvaluator.js)
 *   - evaluate2CardHand, compare2CardHands (from twoCardEvaluator.js)
 */

import { evaluate5CardHand, compare5CardHands } from './pokerEvaluator';
import { evaluate2CardHand, compare2CardHands } from './twoCardEvaluator';

/**
 * arrangeHandHouseWay(cards: 7-card array)
 * Returns { lowHand: 2-card array, highHand: 5-card array }
 */
export function arrangeHandHouseWay(cards) {
  // 1) Check for special case: 5 Aces (possible only with Joker).
  const fiveAcesCheck = checkFiveAces(cards);
  if (fiveAcesCheck) {
    // fiveAcesCheck => e.g. { lowHand: [...], highHand: [...] }
    return fiveAcesCheck;
  }

  // 2) We’ll generate all possible ways to pick 2 cards for the front
  //    and 5 cards for the back. For each, we evaluate the 5-card combo,
  //    see if it’s a big combo, and then see if we can form a decent 2-card front,
  //    applying simplified rules for splitting pairs, etc.
  //
  //    A brute-force approach is to consider all combos of 2 from 7 => 21 ways.
  //    For each, evaluate if it follows the house guidelines well,
  //    then pick the “best” by house criteria.
  //
  //    However, for demonstration, we’ll use a more direct logic approach
  //    with if-else rules, trying to mimic a typical House Way.

  // We’ll gather data on 7 cards: e.g. how many pairs, 3-of-kind, straights, flush, fullhouse, etc.
  const combos = analyze7Cards(cards);

  // Then apply rule sets in descending order of strength.
  if (combos.isFourOfAKind) {
    return handleFourOfAKind(cards, combos);
  }

  if (combos.isFullHouse) {
    return handleFullHouse(cards, combos);
  }

  if (combos.isStraightFlush) {
    return handleStraightFlush(cards, combos);
  }

  if (combos.isThreeOfAKind) {
    return handleThreeOfAKind(cards, combos);
  }

  if (combos.isTwoPair) {
    return handleTwoPair(cards, combos);
  }

  if (combos.isOnePair) {
    return handleOnePair(cards, combos);
  }

  // If no pair or better, it’s a high-card situation
  return handleNoPair(cards, combos);
}

/** 
 * A function that detects if 7 cards contain five Aces 
 * (A-A-A-A + Joker). If yes, return {lowHand, highHand}. 
 * Otherwise return null.
 */
function checkFiveAces(cards) {
  // Count how many Aces + how many Jokers
  let aces = 0, joker = 0;
  const aceCards = [];
  const otherCards = [];
  for (let c of cards) {
    if (c.rank === 'Joker') {
      joker++;
      otherCards.push(c);
    } else if (c.value === 14) {
      aces++;
      aceCards.push(c);
    } else {
      otherCards.push(c);
    }
  }
  // 5 aces => 4 real aces + 1 Joker
  if (aces === 4 && joker === 1) {
    // House Way: 3 Aces in the high hand, 2 Aces in the low
    // The remaining 2 cards in the high hand can be any from the 'otherCards'
    // But we only have 1 "otherCard"? Actually, if we had 4 real Aces + 1 Joker, that’s 5, 
    // we have 2 more cards that are not Aces => in otherCards as well.
    // Let’s do a simple approach:
    const lowHand = []; 
    // pick 2 aces
    lowHand.push(aceCards[0], aceCards[1]);

    const highHand = [];
    // the remaining 2 aces + Joker + the other 2 cards
    highHand.push(...aceCards.slice(2), ...otherCards);

    return { lowHand, highHand };
  }
  return null; // not 5 aces
}

/**
 * Analyze the 7 cards to see if it’s four-of-a-kind, full house, etc.
 * We do a quick check for major combos using the best 5-card logic.
 *
 * Returns an object like:
 * {
 *   isFourOfAKind: boolean,
 *   isFullHouse: boolean,
 *   isStraightFlush: boolean,
 *   isThreeOfAKind: boolean,
 *   isTwoPair: boolean,
 *   isOnePair: boolean
 *   bestFiveEval: { category, tiebreaks }  // the best 5-card category
 * }
 */
function analyze7Cards(cards) {
  // We can attempt to find the single best 5-card combination among the 7 by brute-forcing all 21 subsets of 5 from 7.
  // Then see what the highest category is. A simpler approach is also possible if we do partial checks.

  const allFiveCombos = getAll5CardCombos(cards);
  let bestEval = null;
  let bestCategory = 0;

  for (let five of allFiveCombos) {
    const eval5 = evaluate5CardHand(five); // from pokerEvaluator
    if (eval5.category > bestCategory) {
      bestCategory = eval5.category;
      bestEval = eval5;
    } else if (eval5.category === bestCategory) {
      // if same category, compare tiebreak to see if it’s better
      const cmp = compare5CardHands(five, getBestFiveByEval(bestEval, allFiveCombos));
      if (cmp > 0) {
        bestEval = eval5;
      }
    }
  }

  // Now we know the best 5-card’s category
  const isFourOfAKind = bestCategory === 8;  // from the standard category mapping
  const isFullHouse   = bestCategory === 7;
  const isFlushOrStraight = (bestCategory === 9 || bestCategory === 10 || bestCategory === 6 || bestCategory === 5);
  // We'll define isStraightFlush below if needed
  const isStraightFlush = (bestCategory === 9 || bestCategory === 10);
  const isThreeOfAKind = bestCategory === 4;
  const isTwoPair      = bestCategory === 3;
  const isOnePair      = bestCategory === 2;

  return {
    isFourOfAKind,
    isFullHouse,
    isStraightFlush,
    isThreeOfAKind,
    isTwoPair,
    isOnePair,
    bestFiveEval: bestEval,
  };
}

/** Helper: returns the actual 5-card array that corresponds to the given eval, from among combos. */
function getBestFiveByEval(evalObj, allCombos) {
  // This is a bit tricky because we only have the category/tiebreaks, not the exact subset. 
  // For demonstration, we won't do a perfect matching—just assume we found the best 5. 
  // A robust approach might store them together. For now, let's do a naive approach:

  // We'll just do the first combo that matches the same category/tiebreak. 
  for (let five of allCombos) {
    const e = evaluate5CardHand(five);
    if (compareEvalObjects(e, evalObj) === 0) {
      return five;
    }
  }
  // fallback
  return allCombos[0];
}

/** Compare two {category, tiebreaks} objects. Return 1, 0, or -1. */
function compareEvalObjects(a, b) {
  if (a.category !== b.category) {
    return a.category > b.category ? 1 : -1;
  }
  // compare tiebreaks
  const len = Math.max(a.tiebreaks.length, b.tiebreaks.length);
  for (let i = 0; i < len; i++) {
    const aa = a.tiebreaks[i] || 0;
    const bb = b.tiebreaks[i] || 0;
    if (aa > bb) return 1;
    if (aa < bb) return -1;
  }
  return 0;
}

/** Returns all 5-card combinations from 7 cards (21 combos). */
function getAll5CardCombos(cards) {
  const results = [];
  const n = cards.length;
  function recurse(start, chosen) {
    if (chosen.length === 5) {
      results.push([...chosen]);
      return;
    }
    for (let i = start; i < n; i++) {
      chosen.push(cards[i]);
      recurse(i + 1, chosen);
      chosen.pop();
    }
  }
  recurse(0, []);
  return results;
}

// Region: Handling specific combos with simple logic

function handleFourOfAKind(cards, combos) {
  // House Way for 4-of-a-kind:
  // - If 4-of-a-kind is 2..6, split into 2 and 2 (if possible) 
  // - If 4-of-a-kind is 7..Ace, only split if you can keep a decent front
  //   (like if you can put a pair up front).
  //
  // Because we’re short on space, we'll do a minimal approach:
  return naiveBestSplit(cards);
}

function handleFullHouse(cards, combos) {
  // House Way for Full House: Typically split the full house into (3 of a kind) in back and (pair) in front
  // if it doesn't break a bigger combo (like a straight flush).
  return naiveBestSplit(cards);
}

function handleStraightFlush(cards, combos) {
  // Typically keep the straight flush in back unless you can improve the front significantly.
  return naiveBestSplit(cards);
}

function handleThreeOfAKind(cards, combos) {
  // If it's 3 Aces, often house splits them to make a pair in front. 
  // Otherwise keep the 3-of-a-kind in back.
  return naiveBestSplit(cards);
}

function handleTwoPair(cards, combos) {
  // Usually put the smaller pair in front unless you break a bigger combo in the back.
  // We'll just do a naive approach for demonstration.
  return naiveBestSplit(cards);
}

function handleOnePair(cards, combos) {
  // Usually keep it in back, unless it's Aces and you can put a smaller pair in front, etc.
  return naiveBestSplit(cards);
}

function handleNoPair(cards, combos) {
  // High card situation. Typically put the highest card in front, next highest in back, etc.
  return naiveBestSplit(cards);
}


/**
 * For demonstration, we define a fallback "naiveBestSplit" that:
 *  1) tries each possible 2-card front
 *  2) picks the best 5-card arrangement for the back
 *  3) picks the 2-card front that leads to the "strongest overall" or follows a simple house metric
 *
 * Real House Way can be extremely elaborate; this is a simplified fallback.
 */
function naiveBestSplit(cards) {
  const allTwoCardCombos = getAll2CardCombos(cards);
  let bestSplit = null;
  let bestScore = -Infinity;

  for (let two of allTwoCardCombos) {
    // the 5 in the back = the rest
    const five = cards.filter((c) => !two.includes(c));

    // Evaluate the 2-card hand & the 5-card hand
    const twoEval = evaluate2CardHand(two);
    const fiveEval = evaluate5CardHand(five);

    // House typically wants the best 5-card in the back while not ignoring the front too badly.
    // We'll do a simple scoring approach:
    //   totalScore =  (5-card category rank * 1000) +  2-card category rank * 10
    //   Then break ties by highest tiebreak sum or something similar.
    // (In reality, it’s more nuanced.)

    const score = (fiveEval.category * 1000) + (twoEval.category * 10) 
                  + sumOfTiebreaks(fiveEval.tiebreaks) / 100 // slight tie-break detail
                  + sumOfTiebreaks(twoEval.tiebreaks) / 10000;

    if (score > bestScore) {
      bestScore = score;
      bestSplit = { lowHand: two, highHand: five };
    }
  }

  return bestSplit;
}

function sumOfTiebreaks(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function getAll2CardCombos(cards) {
  const results = [];
  const n = cards.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      results.push([cards[i], cards[j]]);
    }
  }
  return results;
}
