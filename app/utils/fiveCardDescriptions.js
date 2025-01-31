const categoryMap = {
  10: "Royal Flush",
  9: "Straight Flush",
  8: "Four of a Kind",
  7: "Full House",
  6: "Flush",
  5: "Straight",
  4: "Three of a Kind",
  3: "Two Pair",
  2: "One Pair",
  1: "High Card"
};

export function describe5CardHand(evalResult) {
  const { category } = evalResult; 
  return categoryMap[category] || "Unknown";
}