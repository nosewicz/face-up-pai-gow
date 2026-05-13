"use client";

import Image from "next/image";
import clsx from "clsx";

export default function Card({ card, faceUp = true }) {
  const baseClassName =
    "w-20 h-28 rounded shadow cursor-pointer select-none flex items-center justify-center";

  if (!faceUp) {
    return (
      <div className={`${baseClassName} bg-blue-900 text-white`}>
        <Image
          src="/cards/back.png"
          alt="Card Back"
          width={80}
          height={120}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }

  if (card.rank === "Joker") {
    return (
      <div className={`${baseClassName} bg-blue-900 text-white`}>
        <Image
          src="/cards/joker.png"
          alt="Joker"
          width={80}
          height={120}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }

  const filename = `${card.rank}${card.suit}.png`;

  return (
    <div
      className={clsx(
        baseClassName,
        "bg-white hover:shadow-md transition border-4 border-green-400",
      )}
    >
      <Image
        src={`/cards/${filename}`}
        alt={`${card.rank} of ${card.suit}`}
        width={80}
        height={120}
        sizes="80px"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
