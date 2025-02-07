"use client"; 
// If you're on Next.js App Router, ensure client-side rendering for drag/drop

import { useCallback } from "react"; // or useState if storing child-specific states
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
  // For drag-and-drop
  function handleDropChip(betType, chipValue) {
    console.log("Dropping chipValue:", chipValue, "on betType:", betType);

    // Check bankroll
    if (bankroll - chipValue < 0) {
      alert("Not enough bankroll!");
      return;
    }

    // We only remove the bet from bankroll at final settlement (Approach A),
    // unless you prefer subtracting up-front. For the "Approach A" way:
    // Just add to bets
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
    setBets({ ...lastRoundBets });
  }

  // Example chip denominations
  const chipDenominations = [1, 5, 25, 100];

  return (
    <div className="mt-4 p-4 border border-gray-300">
      <h2 className="text-xl font-semibold mb-2">Place Your Bets</h2>

      {/* Display Bankroll */}
      <p className="mb-2">Bankroll: ${bankroll}</p>
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
