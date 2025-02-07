"use client";

import { useDrag } from "react-dnd";
import Card from "./Card";
import { ITEM_TYPES } from "../utils/dndConstants"; // we'll define a type constant

export default function DraggableCard({ card, index, source }) {
  // "source" can be "pool" or "low" - let's pass it so we know where it came from
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPES.CARD,  // a string for item type, e.g. 'card'
    item: { index, source }, // data we pass to drop
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // if isDragging is true, we can style the card or hide it
  const opacity = isDragging ? 0.4 : 1;

  return (
    <div ref={dragRef} style={{ opacity }}>
      <Card card={card} faceUp />
    </div>
  );
}
