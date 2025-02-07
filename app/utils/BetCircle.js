"use client";

import { useDrop } from "react-dnd";
import { ITEM_TYPES } from "./dndConstants";

export default function BetCircle({ betType, betAmount, onDropChip }) {
  // onDropChip is a callback that receives (betType, chipValue)
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPES.CHIP,
    drop: (item, monitor) => {
      // item = { chipValue: number }
      if (onDropChip) {
        onDropChip(betType, item.chipValue);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const backgroundColor = isOver ? "#ddd" : "transparent";

  return (
    <div>
      <div
      ref={dropRef}
      className="bet-circle w-16 h-16 rounded-full border-2 border-gray-600 flex flex-col items-center justify-center"
      style={{ backgroundColor }}
      >
      <p className="text-sm text-center">{betType} bet</p>
      <p className="text-sm">${betAmount}</p>
      </div>
      
    </div>

  );
}
