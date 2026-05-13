export function describe2CardHand(_cards, evalResult) {
  if (evalResult.category === 2) {
    return `Pair of ${rankName(evalResult.tiebreaks[0])}`;
  } else {
    return `High Card ${rankName(evalResult.tiebreaks[0])}`;
  }
}

function rankName(value) {
  const names = {
    14: "A",
    13: "K",
    12: "Q",
    11: "J",
  };

  return names[value] || String(value);
}
