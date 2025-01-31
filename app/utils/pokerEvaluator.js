/**
 * Full 5-card poker evaluator with Pai Gow Joker logic
 * 
 * Category ranks (higher is stronger):
 * 10 = Royal Flush (A-K-Q-J-10 all same suit)
 * 9  = Straight Flush
 * 8  = Four of a Kind
 * 7  = Full House
 * 6  = Flush
 * 5  = Straight
 * 4  = Three of a Kind
 * 3  = Two Pair
 * 2  = One Pair
 * 1  = High Card
 *
 * Tiebreaks: array of numbers in descending order to break ties
 * 
 * Example usage:
 *   const handRank = evaluate5CardHand(cards);
 *   // handRank = { category: 7, tiebreaks: [6, 6, 6, 9, 9], ... }
 *   // or compare with another 5-card hand
 * 
 *   const result = compare5CardHands(cardsA, cardsB);
 *   // returns 1 if A > B, -1 if A < B, 0 if tie
 */

/////////////////////////////
// 1. HELPER: SUIT & RANK COUNT, JOKER DETECTION
/////////////////////////////

function parseCards(cards) {
  /**
   * cards = [{ rank: 'A', value: 14, suit: 'S' }, { rank: 'Joker', value: 15, suit: null }, ...]
   * We assume "value" is 2..14 for normal ranks, 15 for Joker.
   * 
   * Returns an object with:
   *   - rankCounts: { 2:0, 3:1, 4:0, ..., 14:1 } etc.
   *   - suitCounts: { S:1, H:2, D:0, C:0 } etc.
   *   - jokers: number of Joker cards found
   *   - rawRanks: sorted array of ranks (excluding jokers)
   *   - rawSuits: array of suits in same order as ranks
   */
  const rankCounts = {};
  const suitCounts = { C: 0, D: 0, H: 0, S: 0 };
  let jokers = 0;
  const rawRanks = [];
  const rawSuits = [];

  for (let c of cards) {
    if (c.rank === "Joker") {
      jokers++;
      continue;
    }
    // Count suits
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;

    // Count ranks
    rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;

    rawRanks.push(c.value);
    rawSuits.push(c.suit);
  }

  // Sort rawRanks descending (e.g. [14, 13, 11, 5, 3] for A,K,J,5,3)
  rawRanks.sort((a, b) => b - a);

  return { rankCounts, suitCounts, jokers, rawRanks, rawSuits };
}


/////////////////////////////
// 2. HELPER: DETECT FLUSH, STRAIGHT
/////////////////////////////

function isFlush(suitCounts, totalCards = 5) {
  // If any suit count >= totalCards, it's a flush
  for (let suit in suitCounts) {
    if (suitCounts[suit] >= totalCards) {
      return true;
    }
  }
  return false;
}

function getFlushSuit(suitCounts, totalCards = 5) {
  // Return which suit forms the flush
  for (let suit in suitCounts) {
    if (suitCounts[suit] >= totalCards) {
      return suit;
    }
  }
  return null;
}

function checkStraight(ranks) {
  /**
   * ranks = array sorted descending (like [14, 13, 12, 11, 10])
   * Returns { isStraight: boolean, topValue: number }
   * Also handle A-2-3-4-5 as a special case => topValue = 5
   */
  if (ranks.length < 5) {
    return { isStraight: false, topValue: null };
  }

  // Example of normal top: A-K-Q-J-10 => topValue=14
  // Example of A-2-3-4-5 => topValue=5
  // Check descending sequence
  let distinct = [...new Set(ranks)]; // remove duplicates
  // if we have more than 5 distinct, only 5 matter for the check

  // Slide a window of size 5 over distinct array if needed
  // but typically for 5 cards, we just see if they are consecutive
  if (distinct.length === 5) {
    // Check if it's A-2-3-4-5
    if (JSON.stringify(distinct) === JSON.stringify([14, 5, 4, 3, 2])) {
      return { isStraight: true, topValue: 5 }; // 5-high straight
    }
    // Otherwise check normal consecutive
    if (isConsecutive(distinct)) {
      return { isStraight: true, topValue: distinct[0] };
    }
  }
  return { isStraight: false, topValue: null };
}

function isConsecutive(arr) {
  // arr is sorted descending, so arr[i] - arr[i+1] should be 1
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - arr[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}


/////////////////////////////
// 3. HELPER: DUPLICATES (4-of-kind, full house, etc.)
/////////////////////////////

function analyzeRankCounts(rankCounts) {
  /**
   * rankCounts = {14:1, 13:2, 11:1, 5:1} => example
   * Return an object with:
   *   maxOfAKind: the largest count (4,3,2,1)
   *   pairsCount: how many pairs
   *   threeCount: how many triplets
   *   quadrupleCount: 0 or 1
   *   distinctRanks: sorted array of rank keys in descending order
   */
  let maxOfAKind = 1;
  let pairsCount = 0;
  let threeCount = 0;
  let fourCount = 0;
  const distinctRanks = Object.keys(rankCounts).map(Number).sort((a, b) => b - a);

  for (let r of distinctRanks) {
    const c = rankCounts[r];
    if (c > maxOfAKind) maxOfAKind = c;
    if (c === 2) pairsCount++;
    if (c === 3) threeCount++;
    if (c === 4) fourCount++;
  }

  return { maxOfAKind, pairsCount, threeCount, fourCount, distinctRanks };
}


/////////////////////////////
// 4. HELPER: TIEBREAK ARRAYS
/////////////////////////////

function getFourOfAKindTiebreak(rankCounts) {
  // find rank with count=4, that is primary tiebreak
  // next is the kicker
  let fourRank = null;
  let kickerRank = null;
  for (let r in rankCounts) {
    if (rankCounts[r] === 4) {
      fourRank = parseInt(r);
    } else if (rankCounts[r] === 1) {
      kickerRank = parseInt(r);
    }
  }
  return [fourRank, kickerRank];
}

function getFullHouseTiebreak(rankCounts) {
  // rank with 3-of-kind, then rank with 2-of-kind
  let threeRank = null;
  let pairRank = null;
  for (let r in rankCounts) {
    const count = rankCounts[r];
    if (count === 3) {
      threeRank = parseInt(r);
    } else if (count === 2) {
      pairRank = parseInt(r);
    }
  }
  return [threeRank, pairRank];
}

function getFlushTiebreak(rankCounts) {
  // just sort all ranks desc
  let all = [];
  for (let r in rankCounts) {
    for (let i = 0; i < rankCounts[r]; i++) {
      all.push(parseInt(r));
    }
  }
  all.sort((a, b) => b - a);
  return all;
}

function getThreeOfAKindTiebreak(rankCounts) {
  // rank with 3, then the other 2 in desc
  let threeRank = null;
  let others = [];
  for (let r in rankCounts) {
    const count = rankCounts[r];
    if (count === 3) {
      threeRank = parseInt(r);
    } else {
      for (let i = 0; i < count; i++) {
        others.push(parseInt(r));
      }
    }
  }
  others.sort((a, b) => b - a);
  return [threeRank, ...others];
}

function getTwoPairTiebreak(rankCounts) {
  // find the two pairs, then kicker
  let pairs = [];
  let kicker = null;
  for (let r in rankCounts) {
    const count = rankCounts[r];
    if (count === 2) {
      pairs.push(parseInt(r));
    } else if (count === 1) {
      kicker = parseInt(r);
    }
  }
  pairs.sort((a, b) => b - a); // highest pair first
  return [...pairs, kicker];
}

function getOnePairTiebreak(rankCounts) {
  // find the pair, then the kickers in desc
  let pairRank = null;
  let kickers = [];
  for (let r in rankCounts) {
    const count = rankCounts[r];
    if (count === 2) {
      pairRank = parseInt(r);
    } else {
      for (let i = 0; i < count; i++) {
        kickers.push(parseInt(r));
      }
    }
  }
  kickers.sort((a, b) => b - a);
  return [pairRank, ...kickers];
}

function getHighCardTiebreak(rankCounts) {
  // just all in descending
  let arr = [];
  for (let r in rankCounts) {
    for (let i = 0; i < rankCounts[r]; i++) {
      arr.push(parseInt(r));
    }
  }
  arr.sort((a, b) => b - a);
  return arr;
}


/////////////////////////////
// 5. HANDLING THE JOKER
/////////////////////////////

/**
 * In Pai Gow, the Joker can:
 * 1) act as an Ace, OR
 * 2) fill in to complete a straight,
 * 3) fill in to complete a flush,
 * (still effectively an Ace if not forming flush/straight).
 *
 * We can brute-force all possible "assignments" of the Joker
 * (for rank and suit) and see which yields the highest category.
 *
 * For 5-card, we only have up to 1 Joker typically.
 */

function evaluateWithPossibleJoker(cards, jokersCount) {
  // If no Joker, do normal evaluation
  if (jokersCount === 0) {
    return evaluateNoJoker(cards);
  }

  // We have 1 Joker. Let's gather the non-Joker cards.
  const realCards = cards.filter(c => c.rank !== "Joker");
  // We'll try all suits C,D,H,S and all ranks [2..14], but 
  // we specifically emphasize the Joker as an Ace or as a bridging rank for straights,
  // or as a suit for flushes. A thorough approach = brute force every combination:
  let best = null;

  for (let rank = 2; rank <= 14; rank++) {
    for (let suit of ['C','D','H','S']) {
      // Construct a possible 5-card set using that rank/suit for the Joker
      const attempt = [...realCards, { rank: 'X', value: rank, suit }];
      const res = evaluateNoJoker(attempt);
      if (!best || compareEvaluation(res, best) > 0) {
        best = res;
      }
    }
  }
  return best;
}

function evaluateNoJoker(cards) {
  // cards = exactly 5 normal cards
  // parse suits & ranks
  const { rankCounts, suitCounts } = parseCards(cards);

  const { maxOfAKind, pairsCount, threeCount, fourCount, distinctRanks } = analyzeRankCounts(rankCounts);
  const flush = isFlush(suitCounts, 5);
  const flushSuit = getFlushSuit(suitCounts, 5);
  const straightData = checkStraight(distinctRanks);
  const isStr = straightData.isStraight;
  const topStrVal = straightData.topValue;

  let category = 1; // high card
  let tiebreaks = getHighCardTiebreak(rankCounts);

  // Check for Royal/Straight flush
  if (flush && isStr) {
    // Check if topStrVal===14 => A-K-Q-J-10 => Royal
    if (topStrVal === 14) {
      // confirm that ranks are [14,13,12,11,10]
      // We'll assume it's Royal
      category = 10; // Royal Flush
      tiebreaks = [14]; // not that it matters, it's the highest
    } else {
      category = 9; // Straight Flush
      tiebreaks = [topStrVal];
    }
  } 
  else if (fourCount === 1) {
    category = 8; // Four of a Kind
    tiebreaks = getFourOfAKindTiebreak(rankCounts);
  }
  else if (maxOfAKind === 3 && pairsCount === 1) {
    category = 7; // Full House
    tiebreaks = getFullHouseTiebreak(rankCounts);
  }
  else if (flush) {
    category = 6; // Flush
    tiebreaks = getFlushTiebreak(rankCounts);
  }
  else if (isStr) {
    category = 5; // Straight
    tiebreaks = [topStrVal];
  }
  else if (maxOfAKind === 3) {
    category = 4; // Three of a Kind
    tiebreaks = getThreeOfAKindTiebreak(rankCounts);
  }
  else if (pairsCount === 2) {
    category = 3; // Two Pair
    tiebreaks = getTwoPairTiebreak(rankCounts);
  }
  else if (pairsCount === 1) {
    category = 2; // One Pair
    tiebreaks = getOnePairTiebreak(rankCounts);
  } else {
    category = 1; // High Card
    tiebreaks = getHighCardTiebreak(rankCounts);
  }

  return { category, tiebreaks };
}

/**
 * Compare the results of two evaluations (category + tiebreaks).
 * returns positive if evalA > evalB, negative if evalA < evalB, 0 if tie
 */
function compareEvaluation(evalA, evalB) {
  if (evalA.category !== evalB.category) {
    return evalA.category - evalB.category;
  }
  // same category => compare tiebreak arrays
  const len = Math.max(evalA.tiebreaks.length, evalB.tiebreaks.length);
  for (let i = 0; i < len; i++) {
    const aVal = evalA.tiebreaks[i] || 0;
    const bVal = evalB.tiebreaks[i] || 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
  }
  return 0; // complete tie
}


/////////////////////////////
// 6. MAIN EXPORTS
/////////////////////////////

/**
 * evaluate5CardHand(cards):
 * - cards: array of 5 objects: { rank, value, suit }
 * - returns { category, tiebreaks }
 */
export function evaluate5CardHand(cards) {
  // parse to see how many Jokers
  const { jokers } = parseCards(cards);
  // evaluate with possible Joker usage
  return evaluateWithPossibleJoker(cards, jokers);
}

/**
 * compare5CardHands(handA, handB):
 * - Each hand is an array of 5 card objects
 * - returns 1 if A > B, -1 if A < B, 0 if tie
 */
export function compare5CardHands(handA, handB) {
  const evalA = evaluate5CardHand(handA);
  const evalB = evaluate5CardHand(handB);

  const cmp = compareEvaluation(evalA, evalB);
  if (cmp > 0) return 1;
  if (cmp < 0) return -1;
  return 0;
}


/**
 * Enumerates all 5-card combos from a 7-card array,
 * calls evaluate5CardHand() on each, and returns
 * the highest category (and tiebreak, if you want it).
 *
 * Returns something like:
 *   { category: 7, tiebreaks: [...] }
 * 
 * If you want just the category, you can omit the tiebreak detail.
 */

const categoryToString = {
  10: "royalFlush",
  9:  "straightFlush",
  8:  "fourOfAKind",
  7:  "fullHouse",
  6:  "flush",
  5:  "straight",
  4:  "threeOfAKind",
  3:  "twoPair",
  2:  "onePair",
  1:  "highCard"
};

export function getCategoryName(categoryNum) {
  return categoryToString[categoryNum] || "unknown";
}

export function evaluateBest5of7(sevenCards) {
  // Generate all 21 combos of 7 choose 5
  const all5Combos = getAll5CardCombos(sevenCards);
  let bestEval = null;

  for (let combo of all5Combos) {
    const eval5 = evaluate5CardHand(combo); 
    if (!bestEval) {
      bestEval = eval5;
    } else {
      // compare
      const cmp = compareEvalObjects(eval5, bestEval);
      if (cmp > 0) {
        bestEval = eval5;
      }
    }
  }
  return bestEval;
}

/** Helper: build all 5-card combos from an array of 7 cards */
function getAll5CardCombos(cards) {
  const results = [];
  function recurse(start, chosen) {
    if (chosen.length === 5) {
      results.push([...chosen]);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      chosen.push(cards[i]);
      recurse(i + 1, chosen);
      chosen.pop();
    }
  }
  recurse(0, []);
  return results;
}

/** Compare two {category, tiebreaks} objects, returns positive if A>B, negative if A<B, 0 tie */
function compareEvalObjects(a, b) {
  // same logic as compareEvaluation but we want a direct function
  if (a.category !== b.category) {
    return a.category - b.category;
  }
  // same category => compare tiebreak arrays
  const len = Math.max(a.tiebreaks.length, b.tiebreaks.length);
  for (let i = 0; i < len; i++) {
    const aVal = a.tiebreaks[i] ?? 0;
    const bVal = b.tiebreaks[i] ?? 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
  }
  return 0; // complete tie
}