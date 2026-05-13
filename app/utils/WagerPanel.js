"use client"; 
// If you're on Next.js App Router, ensure client-side rendering for drag/drop

import DraggableChip from "./DraggableChip";
import BetCircle from "./BetCircle";

export default function WagerPanel({
  bankroll,
  setBankroll,
  bets,
  setBets,
  lastRoundBets,
  payoutBreakdown,
}) {
  const activeBetTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  // For drag-and-drop
  function handleDropChip(betType, chipValue) {
    if (activeBetTotal + chipValue > bankroll) {
      alert("Not enough bankroll!");
      return;
    }

    // Bets remain visible in the betting circles and are settled at round end.
    setBets((prev) => ({
      ...prev,
      [betType]: prev[betType] + chipValue,
    }));
  }

  // The "Repeat Bet" button logic:
  function handleRepeatBet() {
    if (!lastRoundBets) {
      alert("No previous bets to repeat!");
      return;
    }

    const repeatTotal = Object.values(lastRoundBets).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    if (repeatTotal > bankroll) {
      alert("Not enough bankroll to repeat the last bet!");
      return;
    }

    setBets({ ...lastRoundBets });
  }

  // Example chip denominations
  const chipDenominations = [1, 5, 25, 100];

  return (
    <div className="mt-4 p-4 border border-gray-300">
      <h2 className="text-xl font-semibold mb-2">Place Your Bets</h2>

      {/* Display Bankroll */}
      <p className="mb-2">Bankroll: ${bankroll}</p>
      <p className="mb-2 text-sm">Committed this round: ${activeBetTotal}</p>
      {/* The "Repeat Bet" button */}
      <div className="mt-4 mb-4">
        <button
          onClick={handleRepeatBet}
          className="px-3 py-1 bg-purple-600 text-white rounded"
        >
          Repeat Last Bet
        </button>
      </div>
     
      {/* Row of draggable chips */}
       <div className="flex gap-2 mb-4">
        {chipDenominations.map((val) => (
          <DraggableChip key={val} value={val} />
        ))}
      </div>

      {/* Bet Circles */}
      <div className="flex gap-4">
        <BetCircle
          betType="main"
          betAmount={bets.main}
          onDropChip={handleDropChip}
        />
        <BetCircle
          betType="fortune"
          betAmount={bets.fortune}
          onDropChip={handleDropChip}
        />
      </div>

      {payoutBreakdown && (
        <div className="mt-4 p-2 border border-gray-400">
          <h3 className="font-bold">Last Round Payouts</h3>
          
          {/* Main bet result */}
          {payoutBreakdown.main && (
            <p>
              Main Bet: {payoutBreakdown.main.outcome}
              {payoutBreakdown.main.net > 0 ? ` +$${payoutBreakdown.main.net}` : payoutBreakdown.main.net < 0 ? ` -$${Math.abs(payoutBreakdown.main.net)}` : ""}
            </p>
          )}

          {/* Fortune bet result */}
          {payoutBreakdown.fortune && (
            <p>
              Fortune Bet: {payoutBreakdown.fortune.outcome}
              {payoutBreakdown.fortune.net > 0 ? ` +$${payoutBreakdown.fortune.net}` : payoutBreakdown.fortune.net < 0 ? ` -$${Math.abs(payoutBreakdown.fortune.net)}` : ""}
            </p>
          )}
          {payoutBreakdown.fortune?.note && (
            <p className="text-sm">{payoutBreakdown.fortune.note}</p>
          )}
        </div>
      )}
      <div className="mt-4 p-2">
        <h3 className="font-bold">Fortune Paytable:</h3>
        <p> Three Of A Kind: 4x<br></br>
  Straight: 5x<br></br>
  Flush: 6x<br></br>
  Full House: 9x<br></br>
  Four Of A Kind: 25x<br></br>
  Straight Flush: 50x<br></br>
  Royal Flush: 150x</p>
      </div>
    </div>
  );
}
