import { VIDEO_POKER_HAND_LABELS } from "./videoPokerPaytables";

function countBy(cards, getValue) {
  return cards.reduce((counts, card) => {
    const key = getValue(card);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function isConsecutive(values) {
  for (let index = 0; index < values.length - 1; index++) {
    if (values[index] - values[index + 1] !== 1) return false;
  }
  return true;
}

function getStraightTopValue(values) {
  const distinct = [...new Set(values)].sort((a, b) => b - a);
  if (distinct.length !== 5) return null;
  if (distinct.join(",") === "14,5,4,3,2") return 5;
  return isConsecutive(distinct) ? distinct[0] : null;
}

export function evaluateJacksOrBetterHand(cards) {
  if (cards.length !== 5) {
    throw new Error("Video poker hands must contain exactly five cards.");
  }

  const values = cards.map((card) => card.value).sort((a, b) => b - a);
  const rankCounts = countBy(cards, (card) => card.value);
  const countGroups = Object.values(rankCounts).sort((a, b) => b - a);
  const flush = new Set(cards.map((card) => card.suit)).size === 1;
  const straightTopValue = getStraightTopValue(values);
  const straight = straightTopValue !== null;

  let key = "nothing";
  if (flush && straight && straightTopValue === 14) key = "royalFlush";
  else if (flush && straight) key = "straightFlush";
  else if (countGroups[0] === 4) key = "fourOfAKind";
  else if (countGroups[0] === 3 && countGroups[1] === 2) key = "fullHouse";
  else if (flush) key = "flush";
  else if (straight) key = "straight";
  else if (countGroups[0] === 3) key = "threeOfAKind";
  else if (countGroups[0] === 2 && countGroups[1] === 2) key = "twoPair";
  else if (countGroups[0] === 2) {
    const pairRank = Number(Object.keys(rankCounts).find((rank) => rankCounts[rank] === 2));
    key = pairRank >= 11 ? "jacksOrBetter" : "nothing";
  }

  return {
    key,
    label: VIDEO_POKER_HAND_LABELS[key],
  };
}
