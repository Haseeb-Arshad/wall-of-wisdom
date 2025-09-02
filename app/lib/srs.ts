import type { Difficulty, Card } from "../types";

// SM-2 algorithm baseline
// Maps rating to quality (0..5)
const qualityMap: Record<Difficulty, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function review(card: Card, rating: Difficulty, now = Date.now()): Card {
  const q = qualityMap[rating];
  let { easeFactor: ef, repetitions: rep, interval: ivl } = card;

  if (q < 3) {
    rep = 0;
    ivl = 0;
  } else {
    if (rep === 0) ivl = 1;
    else if (rep === 1) ivl = 6;
    else ivl = Math.round(ivl * ef);
    rep += 1;
  }

  // EF':= EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const next = now + ivl * 24 * 60 * 60 * 1000;

  return {
    ...card,
    easeFactor: ef,
    repetitions: rep,
    interval: ivl,
    nextReviewAt: next,
    reviewCount: (card.reviewCount || 0) + 1,
    difficulty: rating,
    updatedAt: now,
  };
}

