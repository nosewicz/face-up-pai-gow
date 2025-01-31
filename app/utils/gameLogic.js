// gameLogic.js

import { createDeck, shuffleDeck } from './deck';

// Import the new evaluator functions:
import { evaluate2CardHand, compare2CardHands } from './twoCardEvaluator';
import { evaluate5CardHand, compare5CardHands } from './pokerEvaluator';

/**
 * Deals 7 cards to player and dealer, returns the rest of the deck.
 */
export function dealHands() {
  let deck = createDeck();
  deck = shuffleDeck(deck);

  const playerHand = deck.slice(0, 7);
  const dealerHand = deck.slice(7, 14);
  const remainingDeck = deck.slice(14);

  return { playerHand, dealerHand, remainingDeck };
}

/**
 * Naive "arrangeHand" – just picks the lowest 2 for the low hand, rest for high hand.
 * (You could replace this with a real House Way or allow the player to choose.)
 */
export function arrangeHand(cards) {
  const sorted = [...cards].sort((a, b) => a.value - b.value);
  const lowHand = sorted.slice(0, 2);
  const highHand = sorted.slice(2);
  return { lowHand, highHand };
}

/**
 * Compare the player's 2-card vs. dealer's 2-card AND
 * compare the player's 5-card vs. dealer's 5-card,
 * then combine those results for a final outcome.
 */
export function compareHands(playerLow, playerHigh, dealerLow, dealerHigh) {
  // Compare 2-card hands:
  const twoCardResult = compare2CardHands(playerLow, dealerLow);
  let lowResult;
  if (twoCardResult > 0) {
    lowResult = 'WIN';
  } else if (twoCardResult < 0) {
    lowResult = 'LOSE';
  } else {
    lowResult = 'TIE';
  }

  // Compare 5-card hands:
  const fiveCardResult = compare5CardHands(playerHigh, dealerHigh);
  let highResult;
  if (fiveCardResult > 0) {
    highResult = 'WIN';
  } else if (fiveCardResult < 0) {
    highResult = 'LOSE';
  } else {
    highResult = 'TIE';
  }

  // Combine results:
  if (lowResult === 'WIN' && highResult === 'WIN') {
    return 'PLAYER WINS';
  } else if (lowResult === 'LOSE' && highResult === 'LOSE') {
    return 'DEALER WINS';
  } else {
    return 'PUSH';
  }
}
