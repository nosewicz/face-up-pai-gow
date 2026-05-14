import Link from "next/link";
import BlogArticle from "../../utils/BlogArticle";

export const metadata = {
  title: "How to Play Ultimate X Video Poker Free | Ten Play Rules",
  description:
    "Learn how to play Ultimate X video poker free. Understand Ten Play hands, holds, draws, paytables, and next-hand multipliers.",
  alternates: {
    canonical: "/blog/how-to-play-ultimate-x",
  },
};

export default function HowToPlayUltimateX() {
  return (
    <BlogArticle
      title="How to Play Ultimate X Video Poker"
      intro="Ultimate X is video poker with ten hands at once and multipliers that carry forward to the next deal. PaiGowLab lets you practice the flow for free."
    >
      <p>
        <strong>Ultimate X</strong> starts like normal video poker: you receive five cards, choose which cards to hold,
        and draw replacements. The difference is that you are playing ten hands at the same time. Your held cards are
        copied across all ten hands, and each hand draws its own replacements.
      </p>

      <h2>The Basic Ten Play Flow</h2>
      <ol>
        <li>Choose your bet per hand.</li>
        <li>Turn Ultimate X on if you want the multiplier feature.</li>
        <li>Deal one five-card starting hand.</li>
        <li>Hold the cards you want to keep.</li>
        <li>Draw to complete all ten hands.</li>
      </ol>

      <h2>How Multipliers Work</h2>
      <p>
        Winning hands can award a multiplier for the same line on the next game. For example, if hand five earns a
        next-hand multiplier, that multiplier applies to hand five on the next deal. This is what makes Ultimate X feel
        different from ordinary multi-hand video poker.
      </p>

      <h2>Ultimate X Costs More Per Deal</h2>
      <p>
        When the Ultimate X feature is enabled, the wager is higher because you are paying for both the base video
        poker hand and the multiplier feature. Existing multipliers can still pay on a later round, but new multipliers
        are only earned while the feature is active.
      </p>

      <h2>Practice Ultimate X Free</h2>
      <p>
        Use the <Link href="/">free Ultimate X trainer</Link> to practice holding cards across ten hands and watching
        how next-hand multipliers change the next deal.
      </p>
    </BlogArticle>
  );
}
