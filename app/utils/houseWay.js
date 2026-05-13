import { compare5CardHands, evaluate5CardHand } from './pokerEvaluator';
import { compare2CardHands } from './twoCardEvaluator';

export function arrangeHandHouseWay(cards) {
  const groups = getRankGroups(cards);
  const pairs = groups.filter((group) => group.cards.length >= 2);
  const trips = groups.filter((group) => group.cards.length >= 3);
  const quads = groups.filter((group) => group.cards.length >= 4);
  const fiveAces = groups.find((group) => group.value === 14 && group.cards.length === 5);

  if (fiveAces) return splitFiveAces(cards, fiveAces);
  if (quads.length) return splitFourOfAKind(cards, quads[0]);
  if (trips.length && pairs.length >= 2) return splitFullHouse(cards, trips, pairs);

  const straightOrFlush = splitBestStraightOrFlushFamily(cards);
  if (straightOrFlush && pairs.length === 0) return straightOrFlush;

  if (pairs.length >= 3) return splitThreePair(cards, pairs);
  if (trips.length) return splitTrips(cards, trips[0]);
  if (pairs.length >= 2) return splitTwoPair(cards, pairs);
  if (pairs.length === 1) return splitOnePair(cards, pairs[0]);

  return splitNoPair(cards);
}

function splitFiveAces(cards, aceGroup) {
  const kingPair = getRankGroups(cards).find((group) => group.value === 13 && group.cards.length >= 2);
  if (kingPair) return splitWithLow(cards, kingPair.cards.slice(0, 2));
  return splitWithLow(cards, aceGroup.cards.slice(0, 2));
}

function splitFourOfAKind(cards, quadGroup) {
  const sideCards = cards.filter((card) => !quadGroup.cards.includes(card));
  const sidePair = getRankGroups(sideCards).find((group) => group.cards.length >= 2);
  if (sidePair) return splitWithLow(cards, sidePair.cards.slice(0, 2));

  const hasAceOrJokerSide = sideCards.some((card) => card.value === 14 || card.rank === 'Joker');
  const shouldSplit =
    quadGroup.value >= 11 ||
    (quadGroup.value >= 7 && quadGroup.value <= 10 && !hasAceOrJokerSide);

  if (shouldSplit) {
    return splitWithLow(cards, quadGroup.cards.slice(0, 2));
  }

  return splitWithLow(cards, highestCards(sideCards, 2));
}

function splitFullHouse(cards, trips, pairs) {
  const sortedTrips = [...trips].sort((a, b) => b.value - a.value);
  const sortedPairs = [...pairs].sort((a, b) => b.value - a.value);

  if (sortedTrips.length >= 2) {
    return splitWithLow(cards, sortedTrips[0].cards.slice(0, 2));
  }

  const pair = sortedPairs.find((group) => group.value !== sortedTrips[0].value);
  if (pair) return splitWithLow(cards, pair.cards.slice(0, 2));

  return splitWithLow(cards, highestCards(cards.filter((card) => !sortedTrips[0].cards.includes(card)), 2));
}

function splitThreePair(cards, pairs) {
  const highestPair = [...pairs].sort((a, b) => b.value - a.value)[0];
  return splitWithLow(cards, highestPair.cards.slice(0, 2));
}

function splitTrips(cards, trips) {
  const sideCards = cards.filter((card) => !trips.cards.includes(card));

  if (trips.value === 14) {
    return splitWithLow(cards, [trips.cards[0], highestCards(sideCards, 1)[0]]);
  }

  return splitWithLow(cards, highestCards(sideCards, 2));
}

function splitTwoPair(cards, pairs) {
  const sortedPairs = [...pairs].sort((a, b) => b.value - a.value);
  const [higherPair, lowerPair] = sortedPairs;
  const sideCards = cards.filter(
    (card) => !higherPair.cards.includes(card) && !lowerPair.cards.includes(card)
  );

  const higherGroup = pairGroup(higherPair.value);
  const lowerGroup = pairGroup(lowerPair.value);
  const hasAce = sideCards.some((card) => card.value === 14 || card.rank === 'Joker');
  const hasAceOrKing = sideCards.some((card) => [13, 14].includes(card.value) || card.rank === 'Joker');

  const shouldKeepTogether =
    (lowerGroup === 'low' && higherGroup === 'low' && hasAceOrKing) ||
    (lowerGroup === 'low' && higherGroup === 'medium' && hasAceOrKing) ||
    (lowerGroup === 'low' && higherGroup === 'high' && hasAce) ||
    (lowerGroup === 'medium' && higherGroup === 'medium' && hasAce);

  if (shouldKeepTogether) {
    return splitWithLow(cards, highestCards(sideCards, 2));
  }

  return splitWithLow(cards, lowerPair.cards.slice(0, 2));
}

function splitOnePair(cards, pair) {
  const sideCards = cards.filter((card) => !pair.cards.includes(card));
  return splitWithLow(cards, highestCards(sideCards, 2));
}

function splitNoPair(cards) {
  const sorted = sortByPaiGowValue(cards);
  return splitWithLow(cards, [sorted[1], sorted[2]]);
}

function splitBestStraightOrFlushFamily(cards) {
  let best = null;

  for (const lowHand of getAll2CardCombos(cards)) {
    const highHand = cards.filter((card) => !lowHand.includes(card));
    const highEval = evaluate5CardHand(highHand);

    if (![5, 6, 9, 10].includes(highEval.category)) continue;

    if (
      !best ||
      compare5CardHands(highHand, best.highHand) > 0 ||
      (compare5CardHands(highHand, best.highHand) === 0 && compare2CardHands(lowHand, best.lowHand) > 0)
    ) {
      best = { lowHand, highHand };
    }
  }

  return best;
}

function splitWithLow(cards, lowHand) {
  return {
    lowHand,
    highHand: cards.filter((card) => !lowHand.includes(card)),
  };
}

function getRankGroups(cards) {
  const byValue = new Map();

  for (const card of cards) {
    const value = paiGowValue(card);
    if (!byValue.has(value)) byValue.set(value, []);
    byValue.get(value).push(card);
  }

  return [...byValue.entries()]
    .map(([value, groupCards]) => ({
      value,
      cards: sortByPaiGowValue(groupCards),
    }))
    .sort((a, b) => b.cards.length - a.cards.length || b.value - a.value);
}

function pairGroup(value) {
  if (value <= 6) return 'low';
  if (value <= 10) return 'medium';
  return 'high';
}

function highestCards(cards, count) {
  return sortByPaiGowValue(cards).slice(0, count);
}

function sortByPaiGowValue(cards) {
  return [...cards].sort((a, b) => paiGowValue(b) - paiGowValue(a));
}

function paiGowValue(card) {
  return card.rank === 'Joker' ? 14 : card.value;
}

function getAll2CardCombos(cards) {
  const results = [];
  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      results.push([cards[i], cards[j]]);
    }
  }
  return results;
}
