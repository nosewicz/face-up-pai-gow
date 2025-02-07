"use client";

import { useDrop } from "react-dnd";
import { ITEM_TYPES } from "../utils/dndConstants";

export default function DropZone({
  children,
  onDropCard,
  canDropItem,
  className,
}) {
  // onDropCard is a callback we call when a card is dropped
  // canDropItem is optional if you want to filter
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPES.CARD,
    drop: (item, monitor) => {
      // item = { index, source } from DraggableCard
      console.log("DropZone drop fired with:", item);
      if (onDropCard) {
        console.log("Calling onDropCard now...");
        onDropCard(item);
      }
    },
    canDrop: (item, monitor) => {
      if (canDropItem) {
        return canDropItem(item);
      }
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const backgroundColor = isOver ? "#f0f0f0" : "transparent";

  return (
    <div ref={dropRef} className={className} style={{ backgroundColor }}>
      {children}
    </div>
  );
}
