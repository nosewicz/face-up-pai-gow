"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  dealUltimateXBaseHand,
  getUltimateXTotalBet,
  settleUltimateXDraw,
} from "./ultimateXLogic";
import {
  JacksOrBetter86TenPlay,
  VIDEO_POKER_HAND_ORDER,
  VIDEO_POKER_HAND_LABELS,
} from "./videoPokerPaytables";

const STARTING_BANKROLL = 1000;

function getCardKey(card) {
  return `${card.rank}-${card.suit}`;
}

function CardFace({ card, held = false, onClick, small = false }) {
  const filename = `${card.rank}${card.suit}.png`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/30 transition ${
        small ? "h-12 w-8 sm:h-14 sm:w-[2.35rem] lg:h-16 lg:w-11" : "h-20 w-[3.35rem] sm:h-24 sm:w-16 lg:h-28 lg:w-[4.65rem]"
      } ${onClick ? "hover:-translate-y-1" : ""} ${held ? "ring-4 ring-amber-300" : ""}`}
      aria-pressed={held}
    >
      <Image
        src={`/cards/${filename}`}
        alt={`${card.rank} of ${card.suit}`}
        fill
        sizes={small ? "54px" : "85px"}
        className="object-contain"
      />
      {held && (
        <span className="absolute bottom-0 left-0 right-0 bg-amber-300 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.12em] text-zinc-950">
          Held
        </span>
      )}
    </button>
  );
}

function EmptyCard({ small = false }) {
  return (
    <div
      className={`shrink-0 rounded-md border border-dashed border-cyan-100/25 bg-black/20 ${
        small ? "h-12 w-8 sm:h-14 sm:w-[2.35rem] lg:h-16 lg:w-11" : "h-20 w-[3.35rem] sm:h-24 sm:w-16 lg:h-28 lg:w-[4.65rem]"
      }`}
    />
  );
}

function MultiplierBadge({ value, label = "Multiplier", muted = false }) {
  return (
    <div
      className={`flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded border text-center shadow-inner sm:h-11 sm:w-14 ${
        muted
          ? "border-white/10 bg-white/8 text-white/45"
          : "border-cyan-200/50 bg-cyan-300/18 text-cyan-50"
      }`}
    >
      <span className="text-[0.55rem] font-bold uppercase leading-none tracking-[0.12em]">{label}</span>
      <span className="text-base font-black leading-none sm:text-lg">{value}X</span>
    </div>
  );
}

function PaytablePanel({ betPerHand }) {
  return (
    <aside className="rounded-lg border border-cyan-200/30 bg-zinc-950/90 p-3 text-cyan-50 shadow-2xl lg:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Credits</p>
          <p className="text-2xl font-black lg:text-3xl">{betPerHand}</p>
        </div>
        <div className="rounded border border-amber-300/35 px-3 py-2 text-right">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-amber-100/70">Game</p>
          <p className="text-sm font-black text-amber-100">Ten Play</p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded border border-white/10 lg:mt-5">
        <div className="grid grid-cols-[1fr_4rem_4rem] bg-cyan-300/16 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-cyan-100">
          <span>Hand</span>
          <span className="text-right">Pays</span>
          <span className="text-right">Next</span>
        </div>
        {VIDEO_POKER_HAND_ORDER.map((key) => (
          <div key={key} className="grid grid-cols-[1fr_4rem_4rem] border-t border-white/10 px-3 py-1.5 text-xs lg:py-2 lg:text-sm">
            <span>{VIDEO_POKER_HAND_LABELS[key]}</span>
            <span className="text-right font-bold text-amber-100">{JacksOrBetter86TenPlay.pays[key]}</span>
            <span className="text-right font-bold text-cyan-100">{JacksOrBetter86TenPlay.multipliers[key]}X</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Controls({
  bankroll,
  betPerHand,
  setBetPerHand,
  totalBet,
  ultimateXEnabled,
  setUltimateXEnabled,
  phase,
  onDeal,
  onDraw,
}) {
  const canChangeBet = phase !== "dealt";
  return (
    <div className="rounded-lg border border-cyan-200/30 bg-zinc-950/90 p-3 text-cyan-50 shadow-2xl lg:p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Bankroll</p>
          <p className="text-2xl font-black lg:text-3xl">${bankroll}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Total Bet</p>
          <p className="text-2xl font-black lg:text-3xl">${totalBet}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 lg:mt-5">
        <button
          onClick={() => setBetPerHand((value) => Math.max(1, value - 1))}
          disabled={!canChangeBet || betPerHand <= 1}
          className="rounded border border-cyan-200/45 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-cyan-300/15 disabled:opacity-40 lg:px-3 lg:py-3 lg:text-sm"
        >
          Bet Down
        </button>
        <div className="rounded border border-white/10 bg-white/8 px-3 py-2 text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-cyan-100/70">Per Hand</p>
          <p className="text-2xl font-black">{betPerHand}</p>
        </div>
        <button
          onClick={() => setBetPerHand((value) => Math.min(5, value + 1))}
          disabled={!canChangeBet || betPerHand >= 5}
          className="rounded border border-cyan-200/45 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-cyan-300/15 disabled:opacity-40 lg:px-3 lg:py-3 lg:text-sm"
        >
          Bet Up
        </button>
      </div>

      <button
        onClick={() => setUltimateXEnabled((enabled) => !enabled)}
        disabled={!canChangeBet}
        className={`mt-3 w-full rounded px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition disabled:opacity-40 lg:py-3 ${
          ultimateXEnabled
            ? "bg-cyan-300 text-zinc-950 hover:bg-cyan-200"
            : "border border-cyan-200/45 bg-black/25 text-cyan-50 hover:bg-cyan-300/15"
        }`}
      >
        Ultimate X {ultimateXEnabled ? "On" : "Off"}
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onDeal}
          disabled={phase === "dealt"}
          className="rounded bg-amber-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-zinc-950 shadow-lg transition hover:bg-amber-200 disabled:opacity-40 lg:py-4"
        >
          Deal
        </button>
        <button
          onClick={onDraw}
          disabled={phase !== "dealt"}
          className="rounded bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-zinc-950 shadow-lg transition hover:bg-cyan-100 disabled:opacity-40 lg:py-4"
        >
          Draw
        </button>
      </div>
    </div>
  );
}

export default function UltimateXGame() {
  const [bankroll, setBankroll] = useState(STARTING_BANKROLL);
  const [betPerHand, setBetPerHand] = useState(JacksOrBetter86TenPlay.defaultBetPerHand);
  const [ultimateXEnabled, setUltimateXEnabled] = useState(true);
  const [phase, setPhase] = useState("ready");
  const [baseHand, setBaseHand] = useState([]);
  const [heldIndexes, setHeldIndexes] = useState([]);
  const [drawResults, setDrawResults] = useState([]);
  const [currentMultipliers, setCurrentMultipliers] = useState(Array(10).fill(1));
  const [nextMultipliers, setNextMultipliers] = useState(Array(10).fill(1));
  const [message, setMessage] = useState("");

  const totalBet = useMemo(
    () => getUltimateXTotalBet({ betPerHand, ultimateXEnabled, handCount: 10 }),
    [betPerHand, ultimateXEnabled]
  );

  function handleDeal() {
    if (totalBet > bankroll) {
      setMessage("Not enough bankroll for that wager.");
      return;
    }

    setBankroll((value) => value - totalBet);
    setBaseHand(dealUltimateXBaseHand());
    setHeldIndexes([]);
    setDrawResults([]);
    setCurrentMultipliers(nextMultipliers);
    setMessage("");
    setPhase("dealt");
  }

  function handleDraw() {
    if (phase !== "dealt") return;
    const settlement = settleUltimateXDraw({
      baseHand,
      heldIndexes,
      currentMultipliers,
      ultimateXEnabled,
      betPerHand,
      paytable: JacksOrBetter86TenPlay,
    });

    setDrawResults(settlement.results);
    setNextMultipliers(settlement.nextMultipliers);
    setBankroll((value) => value + settlement.totalWin);
    setMessage(`Win $${settlement.totalWin}`);
    setPhase("drawn");
  }

  function toggleHold(index) {
    if (phase !== "dealt") return;
    setHeldIndexes((prev) => (
      prev.includes(index) ? prev.filter((heldIndex) => heldIndex !== index) : [...prev, index]
    ));
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key >= "1" && event.key <= "5") {
        toggleHold(Number(event.key) - 1);
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (phase === "dealt") handleDraw();
        else handleDeal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <main className="min-h-screen bg-[#090d10] px-2 pb-3 pt-16 text-white md:px-4 lg:px-5">
      <div className="mx-auto max-w-[96rem]">
        <section className="relative overflow-hidden rounded-[1.4rem] border-[8px] border-[#262f3a] bg-[#063b45] p-2 shadow-2xl ring-4 ring-black md:p-4">
          <div className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-cyan-100/20" />
          <div className="relative z-10">
            <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200/75">PaiGowLab</p>
                <h1 className="text-2xl font-black tracking-wide text-cyan-50 md:text-4xl">Ultimate X Poker</h1>
                <p className="mt-1 text-sm font-semibold text-cyan-100/75">
                  Ten Play Jacks or Better with same-line next-hand multipliers.
                </p>
              </div>
              {message && (
                <div className="rounded border border-amber-200/45 bg-amber-300/18 px-4 py-2 text-lg font-black uppercase tracking-[0.14em] text-amber-50">
                  {message}
                </div>
              )}
            </div>

            <div className="mb-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
              <div className="rounded-lg border border-cyan-200/35 bg-black/30 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Deal Hand</p>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cyan-100/60">
                      Tap cards or press 1-5 to hold
                    </p>
                  </div>
                  <p className="text-right text-xs font-bold uppercase tracking-[0.14em] text-amber-100/80">
                    {JacksOrBetter86TenPlay.label}
                  </p>
                </div>
                <div className="flex min-h-20 flex-wrap items-center justify-center gap-2 lg:min-h-28">
                  {baseHand.length
                    ? baseHand.map((card, index) => (
                        <CardFace
                          key={getCardKey(card)}
                          card={card}
                          held={heldIndexes.includes(index)}
                          onClick={() => toggleHold(index)}
                        />
                      ))
                    : Array.from({ length: 5 }).map((_, index) => <EmptyCard key={index} />)}
                </div>
              </div>

              <Controls
                bankroll={bankroll}
                betPerHand={betPerHand}
                setBetPerHand={setBetPerHand}
                totalBet={totalBet}
                ultimateXEnabled={ultimateXEnabled}
                setUltimateXEnabled={setUltimateXEnabled}
                phase={phase}
                onDeal={handleDeal}
                onDraw={handleDraw}
              />
            </div>

            <div className="grid gap-2 xl:grid-cols-2">
              {Array.from({ length: 10 }).map((_, index) => {
                const result = drawResults[index];
                const hand = result?.hand || [];
                const activeMultiplier = phase === "dealt" || phase === "drawn" ? currentMultipliers[index] : nextMultipliers[index];
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[3rem_minmax(10rem,1fr)_6.4rem] items-center gap-2 rounded-md border border-white/10 bg-black/18 p-1.5 sm:grid-cols-[3.4rem_minmax(12rem,1fr)_7.2rem]"
                  >
                    <MultiplierBadge value={activeMultiplier} muted={activeMultiplier === 1} />
                    <div className="flex min-h-12 items-center gap-1 overflow-x-auto sm:min-h-14 sm:gap-1.5 lg:min-h-16">
                      {hand.length
                        ? hand.map((card) => <CardFace key={getCardKey(card)} card={card} small />)
                        : Array.from({ length: 5 }).map((__, slot) => <EmptyCard key={slot} small />)}
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
                        {result?.evaluation.label || `Hand ${index + 1}`}
                      </p>
                      <p className="text-sm font-black text-amber-100">${result?.lineWin || 0}</p>
                      {phase === "drawn" && (
                        <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-cyan-100/70">
                          Next {result.nextMultiplier}X
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <PaytablePanel betPerHand={betPerHand} />
          <div className="rounded-lg border border-white/10 bg-zinc-950/90 p-3 text-xs leading-5 text-cyan-50/80">
            Winning lines earn next-hand multipliers only when Ultimate X is on. Existing multipliers are still paid
            when the feature is off.
          </div>
        </div>
      </div>
    </main>
  );
}
