import { createDeck, shuffleDeck } from "./deck";
import { evaluateJacksOrBetterHand } from "./videoPokerEvaluator";
import { JacksOrBetter86TenPlay } from "./videoPokerPaytables";

function cardId(card) {
  return `${card.rank}-${card.suit}`;
}

export function createVideoPokerDeck() {
  return createDeck().filter((card) => card.rank !== "Joker");
}

export function dealUltimateXBaseHand() {
  return shuffleDeck(createVideoPokerDeck()).slice(0, 5);
}

export function drawUltimateXHands({ baseHand, heldIndexes, handCount = 10 }) {
  const held = baseHand.filter((_, index) => heldIndexes.includes(index));
  const excludedCards = new Set(baseHand.map(cardId));

  return Array.from({ length: handCount }).map(() => {
    const drawDeck = shuffleDeck(createVideoPokerDeck()).filter((card) => !excludedCards.has(cardId(card)));
    return [...held, ...drawDeck.slice(0, 5 - held.length)];
  });
}

export function settleUltimateXDraw({
  baseHand,
  heldIndexes,
  currentMultipliers,
  ultimateXEnabled,
  betPerHand = JacksOrBetter86TenPlay.defaultBetPerHand,
  paytable = JacksOrBetter86TenPlay,
}) {
  const hands = drawUltimateXHands({
    baseHand,
    heldIndexes,
    handCount: paytable.hands,
  });

  const nextMultipliers = Array(paytable.hands).fill(1);
  let totalWin = 0;

  const results = hands.map((hand, index) => {
    const evaluation = evaluateJacksOrBetterHand(hand);
    const payUnits = paytable.pays[evaluation.key] || 0;
    const multiplier = currentMultipliers[index] || 1;
    const baseWin = payUnits * betPerHand;
    const lineWin = baseWin * multiplier;
    const nextMultiplier = ultimateXEnabled ? paytable.multipliers[evaluation.key] || 1 : 1;

    totalWin += lineWin;
    nextMultipliers[index] = nextMultiplier;

    return {
      hand,
      evaluation,
      payUnits,
      baseWin,
      multiplier,
      lineWin,
      nextMultiplier,
    };
  });

  return {
    hands,
    results,
    nextMultipliers,
    totalWin,
  };
}

export function getUltimateXTotalBet({ betPerHand, ultimateXEnabled, handCount = 10 }) {
  return betPerHand * handCount * (ultimateXEnabled ? 2 : 1);
}
