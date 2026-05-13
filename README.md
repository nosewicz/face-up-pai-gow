# Face-Up Pai Gow Poker Trainer

Face-Up Pai Gow Poker Trainer is a free-play Next.js application for learning and practicing Face-Up Pai Gow Poker without risking real money. The app deals a seven-card Pai Gow hand, reveals and arranges the dealer hand with the project’s house-way logic, and asks the player to split their seven cards into a two-card low hand and a five-card high hand.

## Main objective

The project’s main objective is to help Pai Gow Poker players practice hand-setting decisions in the Face-Up variant:

- **Learn the split.** Drag two cards into the low hand and leave the remaining five cards as the high hand.
- **Compare against a visible dealer.** The dealer hand is face up and automatically arranged, making the trainer useful for understanding how dealer pressure changes player decisions.
- **Catch fouls.** The app checks that the two-card low hand does not outrank the five-card high hand before settlement.
- **Practice payouts.** A play-money bankroll, main bet, and Fortune side bet show how outcomes affect a round.
- **Support study content.** Blog pages explain beginner rules, Face-Up Pai Gow, Joker usage, and strategy concepts.

## Tech stack

- Next.js App Router
- React
- Tailwind CSS
- React DnD with HTML5 and touch backends
- Jest for payout and settlement logic tests

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the trainer.

## Quality checks

```bash
npm test -- --runInBand
npm run lint
npm run build
```

## Notes for maintainers

The app intentionally avoids remote font fetching so production builds are not blocked in restricted network environments. Package update attempts may still be limited by registry access policies in locked-down environments.
