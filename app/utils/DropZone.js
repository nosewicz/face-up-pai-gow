"use client";

import { useDrop } from "react-dnd";
import { ITEM_TYPES } from "../utils/dndConstants";

export default function DropZone({
  children,
  onDropCard,
  canDropItem,
  className,
}) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPES.CARD,
    drop: (item) => {
      // item = { index, source } from DraggableCard
      if (onDropCard) {
        onDropCard(item);
      }
    },
    canDrop: (item) => {
      if (canDropItem) {
        return canDropItem(item);
      }
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDropCard, canDropItem]);

  const backgroundColor = isOver ? "#f0f0f0" : "transparent";

  return (
    <div ref={dropRef} className={className} style={{ backgroundColor }}>
      {children}
    </div>
  );
}
