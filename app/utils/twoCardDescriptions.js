export function describe2CardHand(cards, evalResult) {
  // evalResult = { rank: 2 | 1, tiebreak: ? }
  // cards = the 2-card array so we can see which rank(s) if it's a pair

  if (evalResult.category === 2) {
    // It's a pair
    const cardRank = cards[0].value === cards[1].value
      ? cards[0].rank
      : /* if you handle Joker logic, might differ */
        cards[0].rank; // fallback

    return `Pair of ${cardRank}`;
  } else {
    // High card
    // The higher card might be evalResult.tiebreak or whichever is bigger
    const highestCard = cards[0].value > cards[1].value ? cards[0] : cards[1];
    return `High Card ${highestCard.rank}`;
  }
}