"use client";

import { useDrag } from "react-dnd";
import { ITEM_TYPES } from "./dndConstants";

export default function DraggableChip({ value }) {
  // We'll pass the chipValue in the 'item' object
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPES.CHIP,             // we'll define "CHIP" in dndConstants
    item: { chipValue: value },        // data that goes to the drop zone
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={dragRef}
      style={{ opacity }}
      className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-grab"
    >
      ${value}
    </div>
  );
}
