"use client";

import { useState, useCallback } from "react";
import { dealHands, compareHands } from "./utils/gameLogic";
import { evaluate2CardHand } from "./utils/twoCardEvaluator";
import { evaluate5CardHand } from "./utils/pokerEvaluator";
import { arrangeHandHouseWay } from "./utils/houseWay";
import Card from "./utils/Card";
import WagerPanel from "./utils/WagerPanel";
import { settleAllBets } from "./utils/payouts";
import { describe2CardHand } from "./utils/twoCardDescriptions";
import { describe5CardHand } from "./utils/fiveCardDescriptions";
import BlogIndex from "./utils/BlogIndex";
import DropZone from "./utils/DropZone";
import DraggableCard from "./utils/DraggableCard";


export default function Home() {
  // Dealer states
  const [dealerLow, setDealerLow] = useState([]);
  const [dealerHigh, setDealerHigh] = useState([]);

  // Player states
  const [playerPool, setPlayerPool] = useState([]); // up to 7 cards
  const [playerLow, setPlayerLow] = useState([]);   // up to 2 cards
  const [originalPlayerHand, setOriginalPlayerHand] = useState([]) // copy of original dealt cards

  // Game result
  const [result, setResult] = useState(null);
  const [roundInProgress, setRoundInProgress] = useState(false);

   // Add bankroll & bets:
   const [bankroll, setBankroll] = useState(1000);
   const [bets, setBets] = useState({
     main: 0,
     fortune: 0,
     insurance: 0,
   });
   const [lastRoundBets, setLastRoundBets] = useState(null);
   const [payoutBreakdown, setPayoutBreakdown] = useState(null);

   const [dealer2Description, setDealer2Description] = useState("");
  const [dealer5Description, setDealer5Description] = useState("");
  const [player2Description, setPlayer2Description] = useState("");
  const [player5Description, setPlayer5Description] = useState("");

  // --- DEAL LOGIC ---
  function handleDeal() {
    const { playerHand, dealerHand } = dealHands();
    setResult(null);

    // Player starts with all 7 cards in the "pool"
    setPlayerPool(playerHand);
    setOriginalPlayerHand(playerHand);
    setPlayerLow([]); // empty 2-card hand

    // Dealer uses House Way
    const { lowHand, highHand } = arrangeHandHouseWay(dealerHand);
    setDealerLow(lowHand);
    setDealerHigh(highHand);

    setDealer2Description("")
    setDealer5Description("")
    setPlayer2Description("")
    setPlayer5Description("")
    setRoundInProgress(true); 
  }

  // --- FOUL CHECK ---
  function isFoul(player2Eval, player5Eval) {
    if (player2Eval.category > player5Eval.category) {
      return true;
    } else if (player2Eval.category < player5Eval.category) {
      return false;
    }
    // tie-breakers
    const tLen = Math.max(player2Eval.tiebreaks.length, player5Eval.tiebreaks.length);
    for (let i = 0; i < tLen; i++) {
      const twoVal = player2Eval.tiebreaks[i] ?? 0;
      const fiveVal = player5Eval.tiebreaks[i] ?? 0;
      if (twoVal > fiveVal) return true; 
      if (twoVal < fiveVal) return false; 
    }
    // exact tie => also foul (in many rules)
    return true;
  }

  // --- COMPARE ---
  function handleCompare() {
    // Must have exactly 2 in playerLow
    if (playerLow.length !== 2) {
      return;
    }
    // The rest (5) is playerPool
    if (playerPool.length !== 5) {
      return;
    }


      // Evaluate dealer's & player's hands for descriptions
    const d2Eval = evaluate2CardHand(dealerLow);
    const d5Eval = evaluate5CardHand(dealerHigh);
    const dealer2Desc = describe2CardHand(dealerLow, d2Eval);
    const dealer5Desc = describe5CardHand(d5Eval);

    setDealer2Description(dealer2Desc);
    setDealer5Description(dealer5Desc);

    // Evaluate the player's 2-card and 5-card

    const p2Eval = evaluate2CardHand(playerLow);
    const p5Eval = evaluate5CardHand(playerPool);
    const player2Desc = describe2CardHand(playerLow, p2Eval);
    const player5Desc = describe5CardHand(p5Eval);

    setPlayer2Description(player2Desc);
    setPlayer5Description(player5Desc);
    
    if (isFoul(p2Eval, p5Eval)) {
      setResult("FOUL - Your low hand cannot outrank your high hand!");
      return;
    }

    // Compare vs. dealer
    const finalResult = compareHands(playerLow, playerPool, dealerLow, dealerHigh);
    setResult(finalResult);

    let mainResult;
    if (finalResult === "PLAYER WINS" || finalResult.includes("PLAYER WINS")) {
      mainResult = "PLAYER WINS";
    } else if (finalResult === "DEALER WINS" || finalResult.includes("DEALER WINS")) {
      mainResult = "DEALER WINS";
    } else {
      mainResult = "PUSH";
    }

    let player7Cards = originalPlayerHand

    console.log("Compare: old bankroll=", bankroll, "bets=", bets);
    const { newRoll, breakdown } = settleAllBets({
      bankroll,
      bets,
      mainResult,
      player7Cards: originalPlayerHand
    });
    console.log("Compare: newRoll=", newRoll);

    setBankroll(newRoll);

    // Once the round ends, remember these bets as "last round bets"
    setLastRoundBets({ ...bets });
    
    // reset bets
    setBets({ main: 0, fortune: 0, insurance: 0 });

    // Store the breakdown so we can show it
    setPayoutBreakdown(breakdown);
    
    // round ends
    setRoundInProgress(false);
  }

  const canCompare = roundInProgress && playerLow.length === 2 && playerPool.length === 5;


  // --- DRAG & DROP HANDLERS ---

  const handleDropToLow = useCallback((item) => {
    console.log("IN handleDropToLow => item:", item);
    console.log("playerPool:", playerPool);
    console.log("playerPool length:", playerPool.length);
console.log("index:", item.index);
    // item = { index, source }
    if (item.source === "pool") {
      // move card from playerPool -> playerLow
      if (playerLow.length >= 2) return;
      const card = playerPool[item.index];
      console.log("card: ", card)
      if (!card) return;
      setPlayerPool((prev) => prev.filter((_, i) => i !== item.index));
      setPlayerLow((prev) => [...prev, card]);
      console.log("player low hand is:", playerLow)
    }
  }, [playerLow, playerPool]);
  
  function handleDropToPool(item) {
    if (item.source === "low") {
      // move card from playerLow -> playerPool
      const card = playerLow[item.index];
      if (!card) return;
      setPlayerLow((prev) => prev.filter((_, i) => i !== item.index));
      setPlayerPool((prev) => [...prev, card]);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 flex flex-col-reverse gap-4 md:flex-row">


      <div className="flex-auto md:basis-1/4">
      <WagerPanel
        bankroll={bankroll}
        setBankroll={setBankroll}
        bets={bets}
        setBets={setBets}
        lastRoundBets={lastRoundBets}
        payoutBreakdown={payoutBreakdown} 
      />

      <BlogIndex />
      </div>

      <div className="flex-auto md:basis-3/4">
      
      <h1 className="text-2xl font-bold text-center mb-4">
        Face-Up Pai Gow Poker
      </h1>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={handleDeal}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Deal
        </button>
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className={`px-4 py-2 font-semibold rounded transition
            ${canCompare
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
        >
          Compare
        </button>
      </div>

      {/* Dealer's Arranged Hands */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dealer’s 2-Card Hand</h2>
        <p className="text-sm mb-2">{dealer2Description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {dealerLow.map((card, i) => (
            <Card key={i} card={card} faceUp />
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-2">Dealer’s 5-Card Hand</h2>
        <p className="text-sm mb-2">{dealer5Description}</p>
        <div className="flex flex-wrap gap-2">
          {dealerHigh.map((card, i) => (
            <Card key={i} card={card} faceUp />
          ))}
        </div>
      </section>

      {/* Player's 2-card hand (drop zone) */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your 2-Card Hand</h2>
        <p className="text-sm mb-2">
          Drag cards here to form your 2-card low hand. Once you have 2, the rest 
          automatically forms your 5-card high hand.
        </p>
        <p className="text-sm mb-2">{player2Description}</p>

        <DropZone
          className="flex flex-wrap gap-2 p-4 border border-dashed border-gray-500 bg-gray-100 min-h-[120px]"
          onDropCard={(item) => {
            let selectedCard;
            setPlayerPool((prevPool) => {
              selectedCard = prevPool[item.index];
              if (!selectedCard) return prevPool;
              return prevPool.filter((_, i) => i !== item.index);
            });
            if (selectedCard) {
              setPlayerLow((prevLow) => [...prevLow, selectedCard]);
            }
          }}
        >
          {playerLow.map((card, i) => (
            <DraggableCard key={i} card={card} index={i} source="low" />
          ))}
        </DropZone>
      </section>

      {/* Player's "pool" - the 7 (or fewer) cards you haven't placed yet */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Remaining Cards</h2>
        <p className="text-sm mb-2">{player5Description}</p>
        <p className="text-sm mb-2">
          Drag from here into your 2-card hand above.
        </p>
        <DropZone
          className="flex flex-wrap gap-2"
          onDropCard={(item) => {
            let selectedCard;
            setPlayerLow((prevLow) => {
              selectedCard = prevLow[item.index];
              if (!selectedCard) return prevLow;
              return prevLow.filter((_, i) => i !== item.index);
            });
            if (selectedCard) {
              setPlayerPool((prevPool) => [...prevPool, selectedCard]);
            }
          }}
        >
          {playerPool.map((card, index) => (
            <DraggableCard key={index} card={card} index={index} source="pool" />
          ))}
        </DropZone>
      </section>

      {/* Result */}
      {result && (
        <div className="text-center mt-4">
          <h2
            className={`text-2xl font-bold 
            ${
              result.includes("PLAYER")
                ? "text-green-600"
                : result.includes("DEALER")
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {result}
          </h2>
        </div>
        
      )}

    </div>
      
      
    </main>
    
  );
}
