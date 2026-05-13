"use client";

import { useDrag } from "react-dnd";
import Card from "./Card";
import { ITEM_TYPES } from "../utils/dndConstants";

export default function DraggableCard({ card, index, source }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPES.CARD,
    item: { card, index, source },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, index, source]);

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div ref={dragRef} style={{ opacity }}>
      <Card card={card} faceUp />
    </div>
  );
}
