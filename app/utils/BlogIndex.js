"use client";

import Link from "next/link";

export default function BlogIndex() {
  return (
    <section className="max-w-4xl mx-auto p-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Latest Blog Posts</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <Link href="/blog/beginner-pai-gow" className="text-blue-600 hover:underline">
            Beginner's Guide to Pai Gow Poker
          </Link>
        </li>
        <li>
          <Link href="/blog/face-up-pai-gow" className="text-blue-600 hover:underline">
            Face-Up Pai Gow Poker: Everything You Need to Know
          </Link>
        </li>
        <li>
          <Link href="/blog/pai-gow-strategies" className="text-blue-600 hover:underline">
            5 Strategies to Improve Your Pai Gow Poker Skills
          </Link>
        </li>
        <li>
          <Link href="/blog/joker-card" className="text-blue-600 hover:underline">
            The Joker Card in Pai Gow Poker: How It Works & Why It Matters
          </Link>
        </li>
      </ul>
    </section>
  );
}
