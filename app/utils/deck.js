export function createDeck() {
  const suits = ['C', 'D', 'H', 'S'];
  const ranks = [
    { rank: '2', value: 2 },
    { rank: '3', value: 3 },
    { rank: '4', value: 4 },
    { rank: '5', value: 5 },
    { rank: '6', value: 6 },
    { rank: '7', value: 7 },
    { rank: '8', value: 8 },
    { rank: '9', value: 9 },
    { rank: '10', value: 10 },
    { rank: 'J', value: 11 },
    { rank: 'Q', value: 12 },
    { rank: 'K', value: 13 },
    { rank: 'A', value: 14 },
  ];
  let deck = [];
  for (let suit of suits) {
    for (let r of ranks) {
      deck.push({ suit, rank: r.rank, value: r.value });
    }
  }
  // Add joker
  deck.push({ suit: null, rank: 'Joker', value: 15 });
  return deck;
}

export function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}