/**
 * 2-Card Evaluator for Pai Gow Poker
 *
 * Categories (higher = stronger):
 * 2 => Pair
 * 1 => High card
 *
 * Tiebreak approach:
 * - If both are pairs, compare the rank of the pair (pair of Aces > pair of Kings > ...).
 * - If both are high card, compare the highest card; if tied, compare the second card.
 * - Return:
 *    { category, tiebreaks }
 *   where "tiebreaks" is an array in descending order for easy comparison.
 *
 * Joker rules (Pai Gow):
 * - If exactly 1 Joker is present and the other card is rank X, 
 *   the Joker can become that rank => forms a pair (X, X).
 * - If 2 Jokers are present (rare in standard single-Joker Pai Gow, but let's handle it),
 *   treat it as a pair of Aces (strongest possible pair in 2-card).
 * - Otherwise, the Joker is treated as an Ace (rank=14) in a high-card scenario.
 */

/** Evaluate a 2-card hand, returns { category, tiebreaks } */
export function evaluate2CardHand(cards) {
  // cards is an array of 2 objects: { rank, value, suit }
  // value: 2..14 (A=14), 15 for Joker in your deck model

  // 1) Count how many Jokers
  let jokers = 0;
  let normalCards = [];
  for (let c of cards) {
    if (c.rank === "Joker") {
      jokers++;
    } else {
      normalCards.push(c);
    }
  }

  // 2) Handle different Joker scenarios

  // Case A: 0 Jokers
  if (jokers === 0) {
    // Check if it's a pair
    if (normalCards[0].value === normalCards[1].value) {
      // Pair
      const pairValue = normalCards[0].value; 
      return {
        category: 2,            // 2 = Pair
        tiebreaks: [pairValue], // e.g. [14] for pair of Aces
      };
    } else {
      // High card
      // Sort in descending order for tie-break
      const sorted = normalCards.map(c => c.value).sort((a, b) => b - a);
      return {
        category: 1,       // 1 = High card
        tiebreaks: sorted, // e.g. [14, 9] for A-9
      };
    }
  }

  // Case B: 1 Joker
  if (jokers === 1 && normalCards.length === 1) {
    // We have 1 normal card + 1 Joker
    // The Joker can become the same rank => form a pair
    // OR we might treat it as Ace if that rank is also Ace, still a pair of Aces
    // So effectively, it's always a pair matching the normal card (best outcome).
    const cardVal = normalCards[0].value;
    // That forms a pair
    return {
      category: 2,
      tiebreaks: [cardVal], // e.g. if normal card is 10 => pair of 10s
    };
  }

  // Case C: 2 Jokers
  if (jokers === 2) {
    // Treat as pair of Aces
    return {
      category: 2,
      tiebreaks: [14], // pair of Aces
    };
  }

  // If we somehow ended up here with an unexpected distribution,
  // e.g. 1 Joker but 2 normal cards -> that implies we had 3 cards,
  // which shouldn't happen in a 2-card hand scenario, but let's handle it gracefully.

  // If there's 1 Joker but we have 2 normal cards => one extra card?? Just fallback:
  // We'll do a best attempt: the Joker can't form a pair with BOTH cards,
  // so let's just treat the Joker as an Ace. 
  // Then pick the top 2 cards as the "hand." (Tricky edge case, theoretically not in real 2-card logic.)

  // Let's unify the approach: if there's 1 Joker and 2+ normal cards, 
  // that means we're only looking at the first 2 for the "hand" or it's an error.
  // We'll just take the highest 2 "cards" from the normal plus Joker as Ace.

  const allVals = normalCards.map(c => c.value);
  // Add the Joker as Ace=14
  allVals.push(14);
  // Sort descending
  allVals.sort((a, b) => b - a);

  // Check if top 2 form a pair
  if (allVals[0] === allVals[1]) {
    return {
      category: 2,
      tiebreaks: [allVals[0]],
    };
  } else {
    return {
      category: 1,
      tiebreaks: [allVals[0], allVals[1]],
    };
  }
}

/**
 * Compare two 2-card hands. 
 * Returns:
 *  1  if handA > handB,
 * -1  if handA < handB,
 *  0  if tie
 */
export function compare2CardHands(handA, handB) {
  const evalA = evaluate2CardHand(handA);
  const evalB = evaluate2CardHand(handB);

  // Compare category first
  if (evalA.category !== evalB.category) {
    return evalA.category > evalB.category ? 1 : -1;
  }
  // Same category => compare tiebreak arrays
  const tA = evalA.tiebreaks;
  const tB = evalB.tiebreaks;
  const len = Math.max(tA.length, tB.length);
  for (let i = 0; i < len; i++) {
    const valA = tA[i] || 0;
    const valB = tB[i] || 0;
    if (valA > valB) return 1;
    if (valA < valB) return -1;
  }
  return 0; // complete tie
}
