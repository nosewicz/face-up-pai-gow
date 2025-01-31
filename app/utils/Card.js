"use client";
import Image from "next/legacy/image";

import clsx from "clsx"; // Optional if you want to conditionally join classes easily
// If you don't want to install `clsx`, you can manually concatenate strings.

export default function Card({ card, faceUp = true, selected = false }) {
  // Face-down scenario (you may not need it if your game is always face-up)
  if (!faceUp) {
    return (
      <div
        className="w-20 h-28 bg-blue-900 text-white flex items-center justify-center 
                   rounded shadow cursor-pointer select-none"
      >
        <Image src={'/cards/back.png'} alt="Card Back" width={80} height={120} />
      </div>
    );
  }

  if (card.rank === "Joker") {
    return (
      <div
        className="w-20 h-28 bg-blue-900 text-white flex items-center justify-center 
                   rounded shadow cursor-pointer select-none"
      >
        <Image src={'/cards/joker.png'} alt="Joker" width={80} height={120} />
      </div>
    );
  }

  // For face-up, highlight if `selected`
  const borderClass = selected
    ? "border-4 border-green-400"
    : "border border-gray-300";

    

  const filename = `${card.rank}${card.suit}.png`; 

  return (
    <div
      className={clsx(
        "w-20 h-28 bg-white rounded shadow flex flex-col items-center justify-center cursor-pointer select-none hover:shadow-md transition",
        borderClass
      )}
    >
       <Image
      src={`/cards/${filename}`}
      alt={`${card.rank} of ${card.suit}`}
      width={80}
      height={120}
      layout="responsive"
    />
    </div>
  );
}