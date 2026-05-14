"use client";

import { useState } from "react";
import Card from "./Card";
import DraggableChip from "./DraggableChip";
import BetCircle from "./BetCircle";
import {
  dealDjWildHands,
  describeDjWildHand,
  settleDjWildRound,
  DJ_WILD_BLIND_PAYTABLE,
  DJ_WILD_TRIPS_PAYTABLE,
  DJ_WILD_BAD_BEAT_PAYTABLE,
} from "./djWildLogic";

function EmptyCardSlots({ count = 5 }) {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className="h-[clamp(4.875rem,18vw,7.5rem)] w-[clamp(3.25rem,12vw,5rem)] rounded-md border border-dashed border-amber-100/30 bg-black/10"
    />
  ));
}

function getCardKey(card) {
  return `${card.rank}-${card.suit ?? "joker"}`;
}

function formatNet(net) {
  if (net > 0) return ` +$${net}`;
  if (net < 0) return ` -$${Math.abs(net)}`;
  return "";
}

function DjWildWagerPanel({ bankroll, bets, setBets, lastRoundBets, payoutBreakdown, roundInProgress }) {
  function handleDropChip(betType, chipValue) {
    if (roundInProgress) return;
    if (bankroll - chipValue < 0) {
      alert("Not enough bankroll!");
      return;
    }
    setBets((prev) => ({
      ...prev,
      [betType]: prev[betType] + chipValue,
    }));
  }

  function handleRepeatBet() {
    if (!lastRoundBets) {
      alert("No previous bets to repeat!");
      return;
    }
    const repeatTotal = lastRoundBets.ante * 2 + lastRoundBets.trips + lastRoundBets.badBeat;
    if (repeatTotal > bankroll) {
      alert("Not enough bankroll to repeat the last bet!");
      return;
    }
    setBets({ ...lastRoundBets });
  }

  const chipDenominations = [1, 5, 25, 100];

  return (
    <aside className="rounded-lg border border-amber-300/45 bg-zinc-950/88 p-4 text-amber-50 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200/80">Bankroll</p>
          <p className="text-3xl font-black">${bankroll}</p>
        </div>
        <button
          onClick={handleRepeatBet}
          disabled={roundInProgress}
          className="rounded border border-amber-300/55 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-300/15 disabled:opacity-40"
        >
          Repeat
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 rounded-md bg-emerald-950/70 p-3 ring-1 ring-white/10">
        {chipDenominations.map((val) => (
          <DraggableChip key={val} value={val} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <BetCircle betType="ante" betAmount={bets.ante} label="Ante" onDropChip={handleDropChip} />
        <div className="flex aspect-square min-h-24 flex-1 flex-col items-center justify-center rounded-full border-4 border-double border-amber-300/75 bg-emerald-950/55 text-center text-amber-50 shadow-inner md:min-h-28">
          <p className="text-xs font-bold uppercase tracking-[0.24em]">Blind</p>
          <p className="mt-1 text-2xl font-black">${bets.ante}</p>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-amber-100/75">Matches ante</p>
        </div>
        <BetCircle betType="trips" betAmount={bets.trips} label="Trips" onDropChip={handleDropChip} />
        <BetCircle betType="badBeat" betAmount={bets.badBeat} label="Bad Beat" onDropChip={handleDropChip} />
      </div>

      {payoutBreakdown && (
        <div className="mt-5 rounded-md border border-white/10 bg-white/8 p-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Last Payout</h3>
          {["ante", "play", "blind", "trips", "badBeat"].map((key) => {
            const item = payoutBreakdown[key];
            if (!item) return null;
            return (
              <div key={key} className="mt-2 text-sm">
                <p className="capitalize">
                  {key === "badBeat" ? "Bad Beat" : key}: {item.outcome}
                  {formatNet(item.net)}
                </p>
                {item.note && <p className="text-xs text-amber-100/75">{item.note}</p>}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-md border border-amber-300/25 p-3 text-xs leading-5 text-amber-50/85">
        <h3 className="font-bold uppercase tracking-[0.18em] text-amber-200">DJ Wild Pays</h3>
        <p className="mt-2">Blind: Five Wilds {DJ_WILD_BLIND_PAYTABLE.fiveWilds}:1 · Royal {DJ_WILD_BLIND_PAYTABLE.royalFlush}:1 · 5 Kind {DJ_WILD_BLIND_PAYTABLE.fiveOfAKind}:1 · Straight+ pays.</p>
        <p className="mt-2">Trips: Five Wilds {DJ_WILD_TRIPS_PAYTABLE.fiveWilds}:1 · natural Royal {DJ_WILD_TRIPS_PAYTABLE.royalFlushNatural}:1 · wild Royal {DJ_WILD_TRIPS_PAYTABLE.royalFlushWild}:1 · 3 Kind+ pays.</p>
        <p className="mt-2">Bad Beat: beaten Royal/5 Kind/Straight Flush {DJ_WILD_BAD_BEAT_PAYTABLE.royalFlush}:1 · Quads {DJ_WILD_BAD_BEAT_PAYTABLE.fourOfAKind}:1 · 3 Kind+ qualifies.</p>
      </div>
    </aside>
  );
}

export default function DjWildGame() {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const [bankroll, setBankroll] = useState(1000);
  const [bets, setBets] = useState({ ante: 0, trips: 0, badBeat: 0 });
  const [lastRoundBets, setLastRoundBets] = useState(null);
  const [payoutBreakdown, setPayoutBreakdown] = useState(null);
  const [roundInProgress, setRoundInProgress] = useState(false);

  function handleDeal() {
    if (bets.ante <= 0) {
      alert("Place an Ante bet first. The Blind will match it.");
      return;
    }
    if (bets.ante * 2 + bets.trips + bets.badBeat > bankroll) {
      alert("Not enough bankroll for Ante, matching Blind, and side bets.");
      return;
    }
    const hands = dealDjWildHands();
    setPlayerHand(hands.playerHand);
    setDealerHand(hands.dealerHand);
    setDealerRevealed(false);
    setResult(null);
    setPayoutBreakdown(null);
    setRoundInProgress(true);
  }

  function finishRound(action) {
    if (action === "play" && bets.ante * 4 + bets.trips + bets.badBeat > bankroll) {
      alert("Not enough bankroll to add the 2x Play wager.");
      return;
    }

    const settlement = settleDjWildRound({
      bankroll,
      bets,
      playerHand,
      dealerHand,
      action,
    });
    setDealerRevealed(true);
    setResult(settlement.result);
    setBankroll(settlement.newRoll);
    setLastRoundBets({ ...bets });
    setBets({ ante: 0, trips: 0, badBeat: 0 });
    setPayoutBreakdown(settlement.breakdown);
    setRoundInProgress(false);
  }

  const playerDescription = playerHand.length === 5 ? describeDjWildHand(playerHand) : "";
  const dealerDescription = dealerRevealed && dealerHand.length === 5 ? describeDjWildHand(dealerHand) : "";

  return (
    <main className="min-h-screen bg-[#10100d] px-3 pb-4 pt-20 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="relative overflow-hidden rounded-[2rem] border-[10px] border-[#5a3218] bg-[#07563c] p-3 shadow-2xl ring-4 ring-[#2b170d] md:p-6">
          <div className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-amber-200/25" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200/80">PaiGowLab</p>
                <h1 className="text-2xl font-black tracking-wide text-amber-50 md:text-4xl">DJ Wild Stud Poker</h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold text-emerald-100/75">Deuces and the joker are wild. Bet Ante and Blind, then fold or play for 2x Ante.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDeal}
                  disabled={roundInProgress}
                  className="rounded bg-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-950 shadow-lg transition hover:bg-amber-200 disabled:opacity-40"
                >
                  Deal
                </button>
                <button
                  onClick={() => finishRound("fold")}
                  disabled={!roundInProgress}
                  className="rounded bg-white/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg transition hover:bg-white/30 disabled:opacity-40"
                >
                  Fold
                </button>
                <button
                  onClick={() => finishRound("play")}
                  disabled={!roundInProgress}
                  className="rounded bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-950 shadow-lg transition hover:bg-amber-100 disabled:opacity-40"
                >
                  Play 2x
                </button>
              </div>
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

            <div className="grid gap-4">
              <section className="min-w-0">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Dealer</h2>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100/65">5-card hand</p>
                  </div>
                  {dealerDescription && <p className="truncate text-right text-xs font-semibold text-amber-50/80">{dealerDescription}</p>}
                </div>
                <div className="min-h-[clamp(5.75rem,22vw,9rem)] rounded-md border border-white/10 bg-emerald-950/45 p-2 shadow-inner">
                  <div className="flex min-h-[clamp(4.875rem,18vw,7.5rem)] flex-wrap items-center gap-2">
                    {dealerHand.length ? dealerHand.map((card) => (
                      <Card key={getCardKey(card)} card={card} faceUp={dealerRevealed} />
                    )) : <EmptyCardSlots />}
                  </div>
                </div>
              </section>

              <div className="my-1 flex items-center gap-3 text-amber-100/50">
                <div className="h-px flex-1 bg-amber-100/20" />
                <span className="text-[0.65rem] font-black uppercase tracking-[0.28em]">Player</span>
                <div className="h-px flex-1 bg-amber-100/20" />
              </div>

              <section className="min-w-0">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Your Hand</h2>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-emerald-100/65">Decide fold or play</p>
                  </div>
                  {playerDescription && <p className="truncate text-right text-xs font-semibold text-amber-50/80">{playerDescription}</p>}
                </div>
                <div className="min-h-[clamp(5.75rem,22vw,9rem)] rounded-md border border-white/10 bg-emerald-950/45 p-2 shadow-inner">
                  <div className="flex min-h-[clamp(4.875rem,18vw,7.5rem)] flex-wrap items-center gap-2">
                    {playerHand.length ? playerHand.map((card) => (
                      <Card key={getCardKey(card)} card={card} faceUp />
                    )) : <EmptyCardSlots />}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <DjWildWagerPanel
          bankroll={bankroll}
          bets={bets}
          setBets={setBets}
          lastRoundBets={lastRoundBets}
          payoutBreakdown={payoutBreakdown}
          roundInProgress={roundInProgress}
        />
      </div>
    </main>
  );
}
