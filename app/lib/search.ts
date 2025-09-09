import Fuse from "fuse.js";
import { getDB } from "./db";
import { supabase } from "./supabase";
import type { Deck, Card, ID } from "../types";

export type SearchHit =
  | { type: "deck"; id: ID; title: string }
  | { type: "card"; id: ID; deckId: ID; front: string; back: string };

export async function searchAll(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  let decks: Deck[] = [];
  let cards: Card[] = [];
  if (supabase) {
    const [dres, cres] = await Promise.all([
      supabase.from("app_decks").select("*"),
      supabase.from("app_cards").select("id, deck_id, front, back"),
    ]);
    if (dres.error) throw dres.error; if (cres.error) throw cres.error;
    decks = (dres.data || []).map((d: any) => ({ id: String(d.id), title: d.title, createdAt: Date.parse(d.created_at), updatedAt: Date.parse(d.updated_at) } as Deck));
    cards = (cres.data || []).map((c: any) => ({ id: String(c.id), deckId: String(c.deck_id), front: c.front, back: c.back } as any));
  } else {
    const db = await getDB();
    decks = (await db.getAll("decks")) as Deck[];
    cards = (await db.getAll("cards")) as Card[];
  }

  const deckFuse = new Fuse(decks, { keys: ["title", "tags"], threshold: 0.4 });
  const cardFuse = new Fuse(cards, { keys: ["front", "back", "hint"], threshold: 0.35 });

  const deckHits = deckFuse.search(q).slice(0, 5).map((r) => ({ type: "deck", id: r.item.id, title: r.item.title }) as SearchHit);
  const cardHits = cardFuse.search(q).slice(0, 7).map((r) => ({ type: "card", id: (r.item as any).id, deckId: (r.item as any).deckId, front: (r.item as any).front, back: (r.item as any).back }) as SearchHit);
  return [...deckHits, ...cardHits];
}
