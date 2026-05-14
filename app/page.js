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
import DjWildGame from "./utils/DjWildGame";

const getCardKey = (card) => `${card.rank}-${card.suit ?? "joker"}`;

function EmptyCardSlots({ count = 2 }) {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className="h-[clamp(4.875rem,18vw,7.5rem)] w-[clamp(3.25rem,12vw,5rem)] rounded-md border border-dashed border-amber-100/30 bg-black/10"
    />
  ));
}

function TableHand({ title, subtitle, description, children, className = "" }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">{title}</h2>
          {subtitle && <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100/65">{subtitle}</p>}
        </div>
        {description && (
          <p className="max-w-[12rem] truncate text-right text-xs font-semibold text-amber-50/80">{description}</p>
        )}
      </div>
      <div className="min-h-[clamp(5.75rem,22vw,9rem)] rounded-md border border-white/10 bg-emerald-950/45 p-2 shadow-inner">
        <div className="flex min-h-[clamp(4.875rem,18vw,7.5rem)] flex-wrap items-center gap-2">
          {children}
        </div>
      </div>
    </section>
  );
}

function PaiGowGame() {
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

    const { newRoll, breakdown } = settleAllBets({
      bankroll,
      bets,
      mainResult,
      player7Cards: originalPlayerHand
    });

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
    if (item.source !== "pool" || playerLow.length >= 2) return;

    const card = playerPool[item.index];
    if (!card || getCardKey(card) !== getCardKey(item.card)) return;

    setPlayerPool((prev) => prev.filter((_, i) => i !== item.index));
    setPlayerLow((prev) => [...prev, card]);
  }, [playerLow, playerPool]);

  const handleDropToPool = useCallback((item) => {
    if (item.source !== "low") return;

    const card = playerLow[item.index];
    if (!card || getCardKey(card) !== getCardKey(item.card)) return;

    setPlayerLow((prev) => prev.filter((_, i) => i !== item.index));
    setPlayerPool((prev) => [...prev, card]);
  }, [playerLow]);

  const canDropToLow = useCallback((item) => (
    item.source === "pool" && playerLow.length < 2
  ), [playerLow.length]);

  const canDropToPool = useCallback((item) => item.source === "low", []);

  return (
    <main className="min-h-screen bg-[#10100d] px-3 pb-4 pt-20 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="relative overflow-hidden rounded-[2rem] border-[10px] border-[#5a3218] bg-[#07563c] p-3 shadow-2xl ring-4 ring-[#2b170d] md:p-6">
          <div className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-amber-200/25" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200/80">PaiGowLab</p>
                <h1 className="text-2xl font-black tracking-wide text-amber-50 md:text-4xl">Face-Up Pai Gow Poker</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeal}
                  className="rounded bg-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-950 shadow-lg transition hover:bg-amber-200"
                >
                  Deal
                </button>
                <button
                  onClick={handleCompare}
                  disabled={!canCompare}
                  className={`rounded px-5 py-3 text-sm font-black uppercase tracking-[0.14em] shadow-lg transition ${
                    canCompare
                      ? "bg-white text-emerald-950 hover:bg-amber-100"
                      : "bg-white/20 text-white/45"
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-md border border-amber-200/25 bg-black/18 px-3 py-2 text-center text-xs font-semibold text-amber-50/80 sm:hidden">
              Rotate horizontally for the full table view.
            </div>

            {result && (
              <div
                className={`mb-4 rounded-md border px-4 py-3 text-center text-xl font-black uppercase tracking-[0.16em] ${
                  result.includes("PLAYER")
                    ? "border-emerald-200/40 bg-emerald-300/20 text-emerald-50"
                    : result.includes("DEALER")
                    ? "border-red-200/40 bg-red-500/20 text-red-50"
                    : "border-amber-200/50 bg-amber-300/20 text-amber-50"
                }`}
              >
                {result}
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(12rem,0.6fr)_minmax(0,1fr)]">
              <TableHand title="Dealer Low" subtitle="2-card hand" description={dealer2Description}>
                {dealerLow.length ? dealerLow.map((card) => (
                  <Card key={getCardKey(card)} card={card} faceUp />
                )) : <EmptyCardSlots count={2} />}
              </TableHand>

              <TableHand title="Dealer High" subtitle="5-card hand" description={dealer5Description}>
                {dealerHigh.length ? dealerHigh.map((card) => (
                  <Card key={getCardKey(card)} card={card} faceUp />
                )) : <EmptyCardSlots count={5} />}
              </TableHand>
            </div>

            <div className="my-4 flex items-center gap-3 text-amber-100/50">
              <div className="h-px flex-1 bg-amber-100/20" />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.28em]">Player</span>
              <div className="h-px flex-1 bg-amber-100/20" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(12rem,0.6fr)_minmax(0,1fr)]">
              <section className="min-w-0">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Your Low</h2>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100/65">Drop 2 cards</p>
                  </div>
                  {player2Description && <p className="truncate text-right text-xs font-semibold text-amber-50/80">{player2Description}</p>}
                </div>
                <DropZone
                  className="min-h-[clamp(5.75rem,22vw,9rem)] rounded-md border border-dashed border-amber-100/45 bg-emerald-950/60 p-2 shadow-inner"
                  onDropCard={handleDropToLow}
                  canDropItem={canDropToLow}
                >
                  <div className="flex min-h-[clamp(4.875rem,18vw,7.5rem)] flex-wrap items-center gap-2">
                    {playerLow.length ? playerLow.map((card, i) => (
                      <DraggableCard key={getCardKey(card)} card={card} index={i} source="low" />
                    )) : <EmptyCardSlots count={2} />}
                  </div>
                </DropZone>
              </section>

              <section className="min-w-0">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Your High</h2>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100/65">Remaining cards</p>
                  </div>
                  {player5Description && <p className="truncate text-right text-xs font-semibold text-amber-50/80">{player5Description}</p>}
                </div>
                <DropZone
                  className="min-h-[clamp(5.75rem,22vw,9rem)] rounded-md border border-white/10 bg-emerald-950/45 p-2 shadow-inner"
                  onDropCard={handleDropToPool}
                  canDropItem={canDropToPool}
                >
                  <div className="flex min-h-[clamp(4.875rem,18vw,7.5rem)] flex-wrap items-center gap-2">
                    {playerPool.length ? playerPool.map((card, index) => (
                      <DraggableCard key={getCardKey(card)} card={card} index={index} source="pool" />
                    )) : <EmptyCardSlots count={7} />}
                  </div>
                </DropZone>
              </section>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <WagerPanel
            bankroll={bankroll}
            bets={bets}
            setBets={setBets}
            lastRoundBets={lastRoundBets}
            payoutBreakdown={payoutBreakdown}
          />
          <div className="rounded-lg bg-white text-slate-950 shadow-xl">
            <BlogIndex />
          </div>
        </div>
      </div>
    </main>
  );
}

function GameModeButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
        active
          ? "bg-amber-300 text-emerald-950"
          : "border border-amber-300/45 bg-black/20 text-amber-100 hover:bg-amber-300/15"
      }`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [activeGame, setActiveGame] = useState("paiGow");

  return (
    <>
      <div className="fixed left-3 top-3 z-50 flex gap-2 rounded-lg border border-white/10 bg-zinc-950/90 p-2 shadow-xl">
        <GameModeButton active={activeGame === "paiGow"} onClick={() => setActiveGame("paiGow")}>
          Pai Gow
        </GameModeButton>
        <GameModeButton active={activeGame === "djWild"} onClick={() => setActiveGame("djWild")}>
          DJ Wild
        </GameModeButton>
      </div>
      {activeGame === "paiGow" ? <PaiGowGame /> : <DjWildGame />}
    </>
  );
}
