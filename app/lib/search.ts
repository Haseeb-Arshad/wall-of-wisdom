import Fuse from "fuse.js";
import { getDB } from "./db";
import type { Deck, Card, ID } from "../types";

export type SearchHit =
  | { type: "deck"; id: ID; title: string }
  | { type: "card"; id: ID; deckId: ID; front: string; back: string };

export async function searchAll(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const db = await getDB();
  const decks = (await db.getAll("decks")) as Deck[];
  const cards = (await db.getAll("cards")) as Card[];

  const deckFuse = new Fuse(decks, { keys: ["title", "tags"], threshold: 0.4 });
  const cardFuse = new Fuse(cards, { keys: ["front", "back", "hint"], threshold: 0.35 });

  const deckHits = deckFuse.search(q).slice(0, 5).map((r) => ({ type: "deck", id: r.item.id, title: r.item.title }) as SearchHit);
  const cardHits = cardFuse.search(q).slice(0, 7).map((r) => ({ type: "card", id: r.item.id, deckId: r.item.deckId, front: r.item.front, back: r.item.back }) as SearchHit);
  return [...deckHits, ...cardHits];
}

