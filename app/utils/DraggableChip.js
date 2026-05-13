"use client";

import Image from "next/image";
import { useDrag } from "react-dnd";
import { ITEM_TYPES } from "./dndConstants";

const chipImages = {
  1: "/chips/chip_white_top.png",
  5: "/chips/chip_red_top.png",
  25: "/chips/chip_green_top.png",
  100: "/chips/chip_black_top.png",
};

export default function DraggableChip({ value }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPES.CHIP,
    item: { chipValue: value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [value]);

  const opacity = isDragging ? 0.4 : 1;

  return (
    <button
      type="button"
      ref={dragRef}
      style={{ opacity }}
      className="relative h-14 w-14 cursor-grab rounded-full drop-shadow-lg active:cursor-grabbing active:scale-95 md:h-16 md:w-16"
      aria-label={`$${value} chip`}
    >
      <Image
        src={chipImages[value] || "/chips/chip_blue_top.png"}
        alt=""
        fill
        sizes="64px"
        className="object-contain"
      />
      <span className="absolute inset-0 flex items-center justify-center text-[0.68rem] font-black text-slate-950">
        ${value}
      </span>
    </button>
  );
}
