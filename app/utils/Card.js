"use client";
import Image from "next/image";

import clsx from "clsx"; // Optional if you want to conditionally join classes easily
// If you don't want to install `clsx`, you can manually concatenate strings.

export default function Card({ card, faceUp = true, selected = false }) {
  const cardFrameClass = "relative w-[clamp(3.25rem,12vw,5rem)] aspect-[2/3] rounded-md shadow-lg cursor-pointer select-none overflow-hidden ring-1 ring-black/20 bg-white";

  // Face-down scenario (you may not need it if your game is always face-up)
  if (!faceUp) {
    return (
      (<div
        className={`${cardFrameClass} bg-blue-900 text-white flex items-center justify-center`}
      >
        <Image
          src={'/cards/back.png'}
          alt="Card Back"
          fill
          sizes="80px"
          className="object-contain" />
      </div>)
    );
  }

  if (card.rank === "Joker") {
    return (
      (<div
        className={`${cardFrameClass} bg-blue-900 text-white flex items-center justify-center`}
      >
        <Image
          src={'/cards/joker.png'}
          alt="Joker"
          fill
          sizes="80px"
          className="object-contain" />
      </div>)
    );
  }

  
  const filename = `${card.rank}${card.suit}.png`; 

  return (
    (<div
      className={clsx(
        cardFrameClass,
        "flex flex-col items-center justify-center hover:-translate-y-1 transition"
      )}
    >
      <Image
        src={`/cards/${filename}`}
        alt={`${card.rank} of ${card.suit}`}
        fill
        sizes="80px"
        className="object-contain" />
    </div>)
  );
}
