"use client"; 

import DraggableChip from "./DraggableChip";
import BetCircle from "./BetCircle";

export default function WagerPanel({
  bankroll,
  bets,
  setBets,
  lastRoundBets,
  payoutBreakdown,
}) {
  function handleDropChip(betType, chipValue) {
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
          className="rounded border border-amber-300/55 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-300/15"
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
        <div className="mt-5 rounded-md border border-white/10 bg-white/8 p-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Last Payout</h3>
          {payoutBreakdown.main && (
            <p className="mt-2 text-sm">
              Play: {payoutBreakdown.main.outcome}
              {payoutBreakdown.main.net > 0 ? ` +$${payoutBreakdown.main.net}` : payoutBreakdown.main.net < 0 ? ` -$${Math.abs(payoutBreakdown.main.net)}` : ""}
            </p>
          )}

          {payoutBreakdown.fortune && (
            <p className="text-sm">
              Fortune: {payoutBreakdown.fortune.outcome}
              {payoutBreakdown.fortune.net > 0 ? ` +$${payoutBreakdown.fortune.net}` : payoutBreakdown.fortune.net < 0 ? ` -$${Math.abs(payoutBreakdown.fortune.net)}` : ""}
            </p>
          )}
          {payoutBreakdown.fortune?.note && (
            <p className="mt-1 text-xs text-amber-100/75">{payoutBreakdown.fortune.note}</p>
          )}
        </div>
      )}
      <div className="mt-5 rounded-md border border-amber-300/25 p-3 text-xs leading-5 text-amber-50/85">
        <h3 className="font-bold uppercase tracking-[0.18em] text-amber-200">Fortune Pays</h3>
        <p className="mt-2">3 Kind 4x · Straight 5x · Flush 6x · Full House 9x · Quads 25x · Straight Flush 50x · Royal 150x</p>
      </div>
    </aside>
  );
}
