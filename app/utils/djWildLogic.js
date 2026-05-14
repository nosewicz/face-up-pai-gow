import { createDeck, shuffleDeck } from "./deck";

export const DJ_WILD_CATEGORY = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  FIVE_OF_A_KIND: 10,
  ROYAL_FLUSH: 11,
  FIVE_WILDS: 12,
};

const CATEGORY_LABELS = {
  [DJ_WILD_CATEGORY.FIVE_WILDS]: "Five Wilds",
  [DJ_WILD_CATEGORY.ROYAL_FLUSH]: "Royal Flush",
  [DJ_WILD_CATEGORY.FIVE_OF_A_KIND]: "Five of a Kind",
  [DJ_WILD_CATEGORY.STRAIGHT_FLUSH]: "Straight Flush",
  [DJ_WILD_CATEGORY.FOUR_OF_A_KIND]: "Four of a Kind",
  [DJ_WILD_CATEGORY.FULL_HOUSE]: "Full House",
  [DJ_WILD_CATEGORY.FLUSH]: "Flush",
  [DJ_WILD_CATEGORY.STRAIGHT]: "Straight",
  [DJ_WILD_CATEGORY.THREE_OF_A_KIND]: "Three of a Kind",
  [DJ_WILD_CATEGORY.TWO_PAIR]: "Two Pair",
  [DJ_WILD_CATEGORY.PAIR]: "Pair",
  [DJ_WILD_CATEGORY.HIGH_CARD]: "High Card",
};

const RANKS_DESC = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const STRAIGHTS = [
  { ranks: [14, 13, 12, 11, 10], top: 14, royal: true },
  { ranks: [13, 12, 11, 10, 9], top: 13 },
  { ranks: [12, 11, 10, 9, 8], top: 12 },
  { ranks: [11, 10, 9, 8, 7], top: 11 },
  { ranks: [10, 9, 8, 7, 6], top: 10 },
  { ranks: [9, 8, 7, 6, 5], top: 9 },
  { ranks: [8, 7, 6, 5, 4], top: 8 },
  { ranks: [7, 6, 5, 4, 3], top: 7 },
  { ranks: [6, 5, 4, 3, 2], top: 6 },
  { ranks: [14, 5, 4, 3, 2], top: 5 },
];

export const DJ_WILD_BLIND_PAYTABLE = {
  fiveWilds: 1000,
  royalFlush: 50,
  fiveOfAKind: 10,
  straightFlush: 9,
  fourOfAKind: 4,
  fullHouse: 3,
  flush: 2,
  straight: 1,
};

export const DJ_WILD_TRIPS_PAYTABLE = {
  fiveWilds: 2000,
  fiveOfAKind: 70,
  royalFlushNatural: 1000,
  royalFlushWild: 90,
  straightFlushNatural: 200,
  straightFlushWild: 25,
  fourOfAKindNatural: 60,
  fourOfAKindWild: 6,
  fullHouseNatural: 30,
  fullHouseWild: 5,
  flushNatural: 25,
  flushWild: 4,
  straightNatural: 20,
  straightWild: 3,
  threeOfAKindNatural: 6,
  threeOfAKindWild: 1,
};

export const DJ_WILD_BAD_BEAT_PAYTABLE = {
  royalFlush: 500,
  fiveOfAKind: 500,
  straightFlush: 500,
  fourOfAKind: 300,
  fullHouse: 200,
  flush: 100,
  straight: 50,
  threeOfAKind: 15,
};

const categoryKeys = {
  [DJ_WILD_CATEGORY.FIVE_WILDS]: "fiveWilds",
  [DJ_WILD_CATEGORY.ROYAL_FLUSH]: "royalFlush",
  [DJ_WILD_CATEGORY.FIVE_OF_A_KIND]: "fiveOfAKind",
  [DJ_WILD_CATEGORY.STRAIGHT_FLUSH]: "straightFlush",
  [DJ_WILD_CATEGORY.FOUR_OF_A_KIND]: "fourOfAKind",
  [DJ_WILD_CATEGORY.FULL_HOUSE]: "fullHouse",
  [DJ_WILD_CATEGORY.FLUSH]: "flush",
  [DJ_WILD_CATEGORY.STRAIGHT]: "straight",
  [DJ_WILD_CATEGORY.THREE_OF_A_KIND]: "threeOfAKind",
  [DJ_WILD_CATEGORY.TWO_PAIR]: "twoPair",
  [DJ_WILD_CATEGORY.PAIR]: "pair",
  [DJ_WILD_CATEGORY.HIGH_CARD]: "highCard",
};

function isWild(card) {
  return card.rank === "Joker" || card.value === 2;
}

function countByRank(cards) {
  return cards.reduce((counts, card) => {
    counts[card.value] = (counts[card.value] || 0) + 1;
    return counts;
  }, {});
}

function naturalCardsBySuit(cards, suit) {
  return cards.filter((card) => card.suit === suit);
}

function uniqueRanks(cards) {
  return [...new Set(cards.map((card) => card.value))];
}

function missingRanks(targetRanks, availableRanks) {
  return targetRanks.filter((rank) => !availableRanks.includes(rank)).length;
}

function highestFlushRanks(suitedCards, wildCount) {
  const ranks = uniqueRanks(suitedCards).sort((a, b) => b - a);
  const assignedWildRanks = RANKS_DESC.filter((rank) => !ranks.includes(rank)).slice(0, wildCount);
  return [...ranks, ...assignedWildRanks].sort((a, b) => b - a).slice(0, 5);
}

function highestKickers(rankCounts, excludedRanks, count) {
  const kickers = [];
  for (const rank of RANKS_DESC) {
    if (excludedRanks.includes(rank)) continue;
    const rankCount = rankCounts[rank] || 0;
    for (let i = 0; i < rankCount && kickers.length < count; i++) {
      kickers.push(rank);
    }
    if (kickers.length === count) break;
  }
  return kickers;
}

function compareEvaluations(a, b) {
  if (a.category !== b.category) return a.category - b.category;
  const length = Math.max(a.tiebreaks.length, b.tiebreaks.length);
  for (let i = 0; i < length; i++) {
    const av = a.tiebreaks[i] || 0;
    const bv = b.tiebreaks[i] || 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function bestOf(candidates) {
  return candidates.reduce((best, candidate) => (
    !best || compareEvaluations(candidate, best) > 0 ? candidate : best
  ), null);
}

function evaluateNatural(cards) {
  if (cards.some((card) => card.rank === "Joker")) return null;

  const rankCounts = countByRank(cards);
  const groups = Object.entries(rankCounts)
    .map(([rank, count]) => ({ rank: Number(rank), count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  const flushSuit = ["C", "D", "H", "S"].find((suit) => cards.every((card) => card.suit === suit));
  const ranks = uniqueRanks(cards);
  const straight = STRAIGHTS.find((sequence) => missingRanks(sequence.ranks, ranks) === 0);

  if (flushSuit && straight?.royal) return makeEval(DJ_WILD_CATEGORY.ROYAL_FLUSH, [14], false);
  if (flushSuit && straight) return makeEval(DJ_WILD_CATEGORY.STRAIGHT_FLUSH, [straight.top], false);
  if (groups[0].count === 4) {
    return makeEval(DJ_WILD_CATEGORY.FOUR_OF_A_KIND, [groups[0].rank, groups[1].rank], false);
  }
  if (groups[0].count === 3 && groups[1]?.count === 2) {
    return makeEval(DJ_WILD_CATEGORY.FULL_HOUSE, [groups[0].rank, groups[1].rank], false);
  }
  if (flushSuit) return makeEval(DJ_WILD_CATEGORY.FLUSH, [...cards].map((card) => card.value).sort((a, b) => b - a), false);
  if (straight) return makeEval(DJ_WILD_CATEGORY.STRAIGHT, [straight.top], false);
  if (groups[0].count === 3) {
    return makeEval(DJ_WILD_CATEGORY.THREE_OF_A_KIND, [groups[0].rank, ...highestKickers(rankCounts, [groups[0].rank], 2)], false);
  }
  if (groups[0].count === 2 && groups[1]?.count === 2) {
    const pairs = [groups[0].rank, groups[1].rank].sort((a, b) => b - a);
    return makeEval(DJ_WILD_CATEGORY.TWO_PAIR, [...pairs, ...highestKickers(rankCounts, pairs, 1)], false);
  }
  if (groups[0].count === 2) {
    return makeEval(DJ_WILD_CATEGORY.PAIR, [groups[0].rank, ...highestKickers(rankCounts, [groups[0].rank], 3)], false);
  }
  return makeEval(DJ_WILD_CATEGORY.HIGH_CARD, [...cards].map((card) => card.value).sort((a, b) => b - a), false);
}

function makeEval(category, tiebreaks, usesWild) {
  return {
    category,
    key: categoryKeys[category],
    label: CATEGORY_LABELS[category],
    tiebreaks,
    usesWild,
  };
}

export function evaluateDjWildHand(cards, { allowNaturalDeuces = false } = {}) {
  const wildCards = cards.filter(isWild);
  const naturalCards = cards.filter((card) => !isWild(card));
  const wildCount = wildCards.length;
  const rankCounts = countByRank(naturalCards);
  const candidates = [];

  if (wildCount === 5) {
    candidates.push(makeEval(DJ_WILD_CATEGORY.FIVE_WILDS, [15], true));
  }

  for (const suit of ["C", "D", "H", "S"]) {
    const suitedCards = naturalCardsBySuit(naturalCards, suit);
    const suitedRanks = uniqueRanks(suitedCards);
    for (const sequence of STRAIGHTS) {
      const missing = missingRanks(sequence.ranks, suitedRanks);
      if (missing <= wildCount) {
        candidates.push(makeEval(
          sequence.royal ? DJ_WILD_CATEGORY.ROYAL_FLUSH : DJ_WILD_CATEGORY.STRAIGHT_FLUSH,
          [sequence.top],
          missing > 0,
        ));
      }
    }
  }

  for (const rank of RANKS_DESC) {
    const needed = 5 - (rankCounts[rank] || 0);
    if (needed <= wildCount) {
      candidates.push(makeEval(DJ_WILD_CATEGORY.FIVE_OF_A_KIND, [rank], needed > 0));
    }
  }

  for (const rank of RANKS_DESC) {
    const needed = 4 - (rankCounts[rank] || 0);
    if (needed <= wildCount) {
      candidates.push(makeEval(
        DJ_WILD_CATEGORY.FOUR_OF_A_KIND,
        [rank, ...highestKickers(rankCounts, [rank], 1)],
        needed > 0,
      ));
    }
  }

  for (const tripRank of RANKS_DESC) {
    for (const pairRank of RANKS_DESC) {
      if (tripRank === pairRank) continue;
      const needed = Math.max(0, 3 - (rankCounts[tripRank] || 0)) + Math.max(0, 2 - (rankCounts[pairRank] || 0));
      if (needed <= wildCount) {
        candidates.push(makeEval(DJ_WILD_CATEGORY.FULL_HOUSE, [tripRank, pairRank], needed > 0));
      }
    }
  }

  for (const suit of ["C", "D", "H", "S"]) {
    const suitedCards = naturalCardsBySuit(naturalCards, suit);
    if (suitedCards.length + wildCount >= 5) {
      candidates.push(makeEval(DJ_WILD_CATEGORY.FLUSH, highestFlushRanks(suitedCards, wildCount), wildCount > 0));
    }
  }

  const ranks = uniqueRanks(naturalCards);
  for (const sequence of STRAIGHTS) {
    const missing = missingRanks(sequence.ranks, ranks);
    if (missing <= wildCount) {
      candidates.push(makeEval(DJ_WILD_CATEGORY.STRAIGHT, [sequence.top], missing > 0));
    }
  }

  for (const rank of RANKS_DESC) {
    const needed = 3 - (rankCounts[rank] || 0);
    if (needed <= wildCount) {
      candidates.push(makeEval(
        DJ_WILD_CATEGORY.THREE_OF_A_KIND,
        [rank, ...highestKickers(rankCounts, [rank], 2)],
        needed > 0,
      ));
    }
  }

  for (const highPair of RANKS_DESC) {
    for (const lowPair of RANKS_DESC) {
      if (highPair <= lowPair) continue;
      const needed = Math.max(0, 2 - (rankCounts[highPair] || 0)) + Math.max(0, 2 - (rankCounts[lowPair] || 0));
      if (needed <= wildCount) {
        candidates.push(makeEval(
          DJ_WILD_CATEGORY.TWO_PAIR,
          [highPair, lowPair, ...highestKickers(rankCounts, [highPair, lowPair], 1)],
          needed > 0,
        ));
      }
    }
  }

  for (const rank of RANKS_DESC) {
    const needed = 2 - (rankCounts[rank] || 0);
    if (needed <= wildCount) {
      candidates.push(makeEval(
        DJ_WILD_CATEGORY.PAIR,
        [rank, ...highestKickers(rankCounts, [rank], 3)],
        needed > 0,
      ));
    }
  }

  const highCardRanks = [...naturalCards.map((card) => card.value), ...RANKS_DESC.slice(0, wildCount)]
    .sort((a, b) => b - a)
    .slice(0, 5);
  const bestWild = bestOf(candidates) || makeEval(DJ_WILD_CATEGORY.HIGH_CARD, highCardRanks, wildCount > 0);
  if (!allowNaturalDeuces) return bestWild;

  const naturalEval = evaluateNatural(cards);
  if (!naturalEval) return bestWild;

  return compareEvaluations(bestWild, naturalEval) >= 0 ? bestWild : naturalEval;
}

export function compareDjWildHands(handA, handB) {
  const evalA = evaluateDjWildHand(handA);
  const evalB = evaluateDjWildHand(handB);
  const comparison = compareEvaluations(evalA, evalB);
  if (comparison > 0) return 1;
  if (comparison < 0) return -1;
  return 0;
}

export function describeDjWildHand(cards) {
  const evaluation = evaluateDjWildHand(cards);
  return evaluation.label;
}

export function dealDjWildHands() {
  const deck = shuffleDeck(createDeck());
  return {
    playerHand: deck.slice(0, 5),
    dealerHand: deck.slice(5, 10),
  };
}

function tripsPayoutForEval(evaluation) {
  if (!evaluation || evaluation.category < DJ_WILD_CATEGORY.THREE_OF_A_KIND) return 0;
  if (evaluation.category === DJ_WILD_CATEGORY.FIVE_WILDS) return DJ_WILD_TRIPS_PAYTABLE.fiveWilds;
  if (evaluation.category === DJ_WILD_CATEGORY.FIVE_OF_A_KIND) return DJ_WILD_TRIPS_PAYTABLE.fiveOfAKind;
  return DJ_WILD_TRIPS_PAYTABLE[`${evaluation.key}${evaluation.usesWild ? "Wild" : "Natural"}`] || 0;
}

export function getTripsPayout(hand) {
  const wildEval = evaluateDjWildHand(hand);
  const naturalEval = evaluateNatural(hand);
  return Math.max(tripsPayoutForEval(wildEval), tripsPayoutForEval(naturalEval));
}

export function getBlindPayout(evaluation) {
  return DJ_WILD_BLIND_PAYTABLE[evaluation.key] || 0;
}

export function getBadBeatPayout(losingEvaluation) {
  if (losingEvaluation.category < DJ_WILD_CATEGORY.THREE_OF_A_KIND) return 0;
  return DJ_WILD_BAD_BEAT_PAYTABLE[losingEvaluation.key] || 0;
}

export function settleDjWildRound({ bankroll, bets, playerHand, dealerHand, action }) {
  const ante = bets.ante || 0;
  const blind = ante;
  const trips = bets.trips || 0;
  const badBeat = bets.badBeat || 0;
  const playerEval = evaluateDjWildHand(playerHand);
  const dealerEval = evaluateDjWildHand(dealerHand);
  const tripsPayout = getTripsPayout(playerHand);
  const tripsNet = trips > 0 ? (tripsPayout > 0 ? trips * tripsPayout : -trips) : 0;

  if (action === "fold") {
    return {
      newRoll: bankroll - ante - blind + tripsNet - badBeat,
      result: "FOLDED",
      breakdown: {
        ante: { outcome: "LOSE", net: -ante },
        blind: { outcome: "LOSE", net: -blind },
        play: { outcome: "NONE", net: 0 },
        trips: { outcome: tripsPayout > 0 ? "WIN" : trips > 0 ? "LOSE" : "PUSH", net: tripsNet, note: tripsPayout > 0 ? `${playerEval.label} pays ${tripsPayout} to 1` : "No Trips qualifier" },
        badBeat: { outcome: badBeat > 0 ? "LOSE" : "PUSH", net: badBeat > 0 ? -badBeat : 0, note: "Bad Beat needs a completed dealer comparison" },
      },
    };
  }

  const comparison = compareDjWildHands(playerHand, dealerHand);
  const play = ante * 2;
  let mainNet = 0;
  let result = "PUSH";
  let blindNet = 0;
  let badBeatNet = 0;
  let badBeatNote = "No Bad Beat qualifier";

  if (comparison > 0) {
    result = "PLAYER WINS";
    mainNet = ante + play;
    const blindPayout = getBlindPayout(playerEval);
    blindNet = blindPayout > 0 ? blind * blindPayout : 0;
  } else if (comparison < 0) {
    result = "DEALER WINS";
    mainNet = -ante - play - blind;
  }

  if (badBeat > 0 && comparison !== 0) {
    const losingEval = comparison > 0 ? dealerEval : playerEval;
    const badBeatPayout = getBadBeatPayout(losingEval);
    if (badBeatPayout > 0) {
      badBeatNet = badBeat * badBeatPayout;
      badBeatNote = `${losingEval.label} was beaten and pays ${badBeatPayout} to 1`;
    } else {
      badBeatNet = -badBeat;
    }
  }

  return {
    newRoll: bankroll + mainNet + blindNet + tripsNet + badBeatNet,
    result,
    breakdown: {
      ante: { outcome: comparison > 0 ? "WIN" : comparison < 0 ? "LOSE" : "PUSH", net: comparison > 0 ? ante : comparison < 0 ? -ante : 0 },
      play: { outcome: comparison > 0 ? "WIN" : comparison < 0 ? "LOSE" : "PUSH", net: comparison > 0 ? play : comparison < 0 ? -play : 0 },
      blind: { outcome: blindNet > 0 ? "WIN" : comparison < 0 ? "LOSE" : "PUSH", net: comparison < 0 ? -blind : blindNet, note: comparison > 0 && blindNet === 0 ? "Blind pushes below Straight" : undefined },
      trips: { outcome: tripsPayout > 0 ? "WIN" : trips > 0 ? "LOSE" : "PUSH", net: tripsNet, note: tripsPayout > 0 ? `${playerEval.label} pays ${tripsPayout} to 1` : "No Trips qualifier" },
      badBeat: { outcome: badBeatNet > 0 ? "WIN" : badBeat > 0 ? "LOSE" : "PUSH", net: badBeatNet, note: badBeatNote },
    },
  };
}
