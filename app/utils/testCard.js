import { Card as PlayingCard, redDeck } from "react-playing-cards";

export default function TestCard() {
  return (
    <div style={{ margin: 20 }}>
      <PlayingCard 
        card="AC"     // Ace of Clubs
        back={redDeck}
        height={150}
      />
    </div>
  );
}