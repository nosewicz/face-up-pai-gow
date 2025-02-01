"use client";

import Head from "next/head";
import Link from "next/link";

export default function BeginnerPaiGow() {
  return (
    <>
      <Head>
        <title>Beginner's Guide to Pai Gow Poker | Free Online Trainer</title>
        <meta
          name="description"
          content="Learn Pai Gow Poker with our free online trainer. Discover the rules, find tips, and start playing Face-Up Pai Gow for free."
        />
      </Head>

      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">
          Beginner's Guide to Pai Gow Poker
        </h1>

        <p className="mb-4">
          Welcome to our <strong>free online Pai Gow Poker</strong> trainer!
          This guide will walk you through the basic rules of <strong>Pai Gow Poker</strong>, explain
          why <strong>Face-Up Pai Gow</strong> is unique, and show you how to
          start practicing without risking real money.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          What Is Pai Gow Poker?
        </h2>
        <p className="mb-4">
          Pai Gow Poker is a casino card game that combines elements of
          traditional Chinese Pai Gow tiles with standard poker. Each player
          receives seven cards and splits them into two hands: a five-card high
          hand and a two-card low hand. The goal is to beat the dealer with both
          hands. <Link href="/" className="text-blue-600 hover:underline">Our trainer</Link> <em>lets you practice</em> setting your hands
          optimally, so you can learn the game at your own pace.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Key Benefits of Our Free Pai Gow Trainer
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Completely free – no deposit or sign-up required.</li>
          <li>Face-Up Pai Gow mode to help you see the dealer’s strategy.</li>
          <li>Practice side bets like the Fortune bonus without real-money risk.</li>
          <li>User-friendly interface to learn at your own speed.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          How to Get Started
        </h2>
        <ol className="list-decimal list-inside mb-4">
          <li><strong>Deal the cards</strong> using our app.</li>
          <li><strong>Arrange</strong> your 7 cards into a 5-card high hand and a 2-card low hand.</li>
          <li>Click <strong>“Compare”</strong> to see if you beat the dealer.</li>
          <li>Adjust your <strong>strategy</strong> as you learn.</li>
        </ol>

        <p className="mb-4">
          That’s it! You’ll quickly pick up on how <strong>Face-Up Pai Gow</strong> differs
          from standard Pai Gow, and you’ll be ready for real tables in no time.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Tips for Improving Quickly
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Focus on securing a strong two-card low hand without weakening your five-card high hand.</li>
          <li>Use the <strong>Joker</strong> carefully to form straights or flushes.</li>
          <li>Keep an eye on <strong>Fortune bonus</strong> payouts to maximize side-bet returns.</li>
        </ul>

        <p className="mb-4">
          Explore our trainer, hone your skills, and master <strong><Link href="/" className="text-blue-600 hover:underline">Face-Up Pai Gow Poker</Link></strong> for free.
          Good luck at the tables!
        </p>
      </main>
    </>
  );
}
