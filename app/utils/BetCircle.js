"use client";

import { useDrop } from "react-dnd";
import { ITEM_TYPES } from "./dndConstants";

export default function BetCircle({ betType, betAmount, onDropChip }) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPES.CHIP,
    drop: (item) => {
      if (onDropChip) {
        onDropChip(betType, item.chipValue);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [betType, onDropChip]);

  const label = betType === "main" ? "Play" : "Fortune";

  return (
    <div
      ref={dropRef}
      className={`flex aspect-square min-h-24 flex-1 flex-col items-center justify-center rounded-full border-4 border-double text-center shadow-inner transition md:min-h-28 ${
        isOver
          ? "border-amber-200 bg-amber-300/25 text-white"
          : "border-amber-300/75 bg-emerald-950/55 text-amber-50"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em]">{label}</p>
      <p className="mt-1 text-2xl font-black">${betAmount}</p>
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-amber-100/75">Drop chips</p>
    </div>
  );
}
