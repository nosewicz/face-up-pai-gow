"use client"; 
// If you're on Next.js App Router, ensure client-side rendering for drag/drop

import { useCallback } from "react"; // or useState if storing child-specific states
import Chip from "./Chip";

export default function WagerPanel({
  bankroll,
  setBankroll,
  bets,
  setBets,
  lastRoundBets,
  payoutBreakdown,
}) {
  // For drag-and-drop
  const allowDrop = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e, chipValue) => {
    e.dataTransfer.setData("chipValue", String(chipValue));
  }, []);

  const handleDropBet = useCallback(
    (betType) => (e) => {
      e.preventDefault();
      const chipValueStr = e.dataTransfer.getData("chipValue");
      if (!chipValueStr) return;

      const chipValue = parseInt(chipValueStr, 10);

      // Check bankroll
      if (bankroll - chipValue < 0) {
        alert("Not enough bankroll!");
        return;
      }

      console.log("Placing chip:", chipValue, "on", betType);
    console.log("Bankroll before dropBet:", bankroll);

      // Deduct from bankroll
      //setBankroll((prev) => {
       // console.log("prev bankroll was", prev, "deducting", chipValue);
        //return prev - chipValue;
      //});

      // Add to the appropriate bet
      setBets((prev) => {
        console.log("prev bets:", prev);
        return { ...prev, [betType]: prev[betType] + chipValue };
      });
    },
    [bankroll, setBankroll, setBets]
  );

   // The "Repeat Bet" button logic:
   function handleRepeatBet() {
    if (!lastRoundBets) {
      alert("No previous bets to repeat!");
      return;
    }
    // If you want to do a bankroll check, you could sum the 
    // lastRoundBets and compare to bankroll. 
    // But if you're only removing from bankroll at settlement, 
    // that might not be necessary here.

    // Just set current bets to last round's bets:
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
     
      {/* Chip Row */}
      <div className="flex gap-2 mb-4">
        {chipDenominations.map((val) => (
          <Chip key={val} value={val} onDragStart={handleDragStart} />
        ))}
      </div>

      {/* Bet Circles */}
      <div className="flex gap-4">
        {/* Main Bet */}
        <div
          className="bet-circle w-16 h-16 rounded-full border-2 border-gray-600 flex flex-col items-center justify-center"
          onDragOver={allowDrop}
          onDrop={handleDropBet("main")}
        >
          <p className="text-sm">Main Bet</p>
          <p className="text-sm">${bets.main}</p>
        </div>

        {/* Fortune Bet */}
        <div
          className="bet-circle w-16 h-16 rounded-full border-2 border-gray-600 flex flex-col items-center justify-center"
          onDragOver={allowDrop}
          onDrop={handleDropBet("fortune")}
        >
          <p className="text-sm">Fortune</p>
          <p className="text-sm">${bets.fortune}</p>
        </div>

        {/* Insurance Bet 
        <div
          className="bet-circle w-16 h-16 rounded-full border-2 border-gray-600 flex flex-col items-center justify-center"
          onDragOver={allowDrop}
          onDrop={handleDropBet("insurance")}
        >
          <p className="text-sm">Insurance</p>
          <p className="text-sm">${bets.insurance}</p>
        </div>*/}
      </div>
      
      {payoutBreakdown && (
        <div className="mt-4 p-2 border border-gray-400 bg-gray-100">
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
      <div className="mt-4 p-2 bg-gray-100">
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
