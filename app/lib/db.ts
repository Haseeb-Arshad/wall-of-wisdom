import { openDB, type IDBPDatabase } from "idb";
import type { Card, Deck, Event, Session, UploadSource, ID } from "../types";
import { supabase } from "./supabase";

type DB = IDBPDatabase<unknown>;

let dbPromise: Promise<DB> | null = null;

function createId(prefix = "id"): ID {
  // Simple local ID generator
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getId(prefix?: string) {
  return createId(prefix);
}

export async function getDB(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = openDB("wisdomwall", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("decks")) {
          const store = db.createObjectStore("decks", { keyPath: "id" });
          store.createIndex("by_updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("cards")) {
          const store = db.createObjectStore("cards", { keyPath: "id" });
          store.createIndex("by_deckId", "deckId");
          store.createIndex("by_nextReviewAt", "nextReviewAt");
        }
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("events")) {
          db.createObjectStore("events", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("uploads")) {
          db.createObjectStore("uploads", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// Decks
export async function createDeck(title: string, tags: string[] = []) {
  if (supabase) {
    const { data, error } = await supabase
      .from("app_decks")
      .insert({ title, updated_at: new Date() })
      .select("*")
      .single();
    if (error) throw error;
    const deck: Deck = {
      id: String((data as any).id),
      title: (data as any).title,
      tags,
      visibility: "private",
      createdAt: Date.parse((data as any).created_at),
      updatedAt: Date.parse((data as any).updated_at),
    };
    return deck;
  } else {
    const db = await getDB();
    const deck: Deck = {
      id: createId("deck"),
      title,
      tags,
      visibility: "private",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.put("decks", deck);
    return deck;
  }
}

export async function listDecks(): Promise<Deck[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("app_decks")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((d: any) => ({
      id: String(d.id),
      title: d.title,
      createdAt: Date.parse(d.created_at),
      updatedAt: Date.parse(d.updated_at),
      visibility: "private",
      tags: [],
    } as Deck));
  } else {
    const db = await getDB();
    const tx = db.transaction("decks");
    return await tx.store.getAll();
  }
}

// Cards
export async function addCards(deckId: ID, cards: Omit<Card, "id" | "deckId" | "createdAt" | "updatedAt">[]) {
  if (supabase) {
    const now = new Date();
    const payload = cards.map((c) => ({
      deck_id: deckId as string,
      front: (c as any).front,
      back: (c as any).back,
      hint: (c as any).hint ?? null,
      difficulty: (c as any).difficulty ?? "good",
      ease_factor: (c as any).easeFactor ?? 2.5,
      interval: (c as any).interval ?? 0,
      repetitions: (c as any).repetitions ?? 0,
      next_review_at: new Date((c as any).nextReviewAt ?? now.getTime()),
      review_count: (c as any).reviewCount ?? 0,
      created_at: now,
      updated_at: now,
    }));
    const { error } = await supabase.from("app_cards").insert(payload);
    if (error) throw error;
  } else {
    const db = await getDB();
    const tx = db.transaction("cards", "readwrite");
    const now = Date.now();
    for (const c of cards) {
      const card: Card = {
        id: createId("card"),
        deckId,
        createdAt: now,
        updatedAt: now,
        reviewCount: (c as any).reviewCount ?? 0,
        easeFactor: (c as any).easeFactor ?? 2.5,
        interval: (c as any).interval ?? 0,
        repetitions: (c as any).repetitions ?? 0,
        nextReviewAt: (c as any).nextReviewAt ?? now,
        front: (c as any).front,
        back: (c as any).back,
        hint: (c as any).hint,
        difficulty: (c as any).difficulty,
        type: (c as any).type,
        attachments: (c as any).attachments,
        sourceId: (c as any).sourceId,
      } as Card;
      await tx.store.put(card);
    }
    await tx.done;
  }
}

export async function getCardsByDeck(deckId: ID): Promise<Card[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("app_cards")
      .select("*")
      .eq("deck_id", deckId as string)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(toClientCard);
  } else {
    const db = await getDB();
    const idx = (await db).transaction("cards").store.index("by_deckId");
    const all = await idx.getAll(deckId as any);
    return (all as Card[]) ?? [];
  }
}

export async function getDueCards(deckId: ID, now = Date.now()): Promise<Card[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("app_cards")
      .select("*")
      .eq("deck_id", deckId as string)
      .lte("next_review_at", new Date(now).toISOString());
    if (error) throw error;
    return (data || []).map(toClientCard).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  } else {
    const cards = await getCardsByDeck(deckId);
    return cards.filter((c) => c.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }
}

export async function updateCard(card: Card) {
  if (supabase) {
    const { error } = await supabase
      .from("app_cards")
      .update({
        front: card.front,
        back: card.back,
        hint: card.hint ?? null,
        difficulty: card.difficulty ?? "good",
        ease_factor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        next_review_at: new Date(card.nextReviewAt),
        review_count: card.reviewCount,
        updated_at: new Date(),
      })
      .eq("id", card.id as string);
    if (error) throw error;
  } else {
    const db = await getDB();
    card.updatedAt = Date.now();
    await db.put("cards", card);
  }
}

// Sessions
export async function startSession(deckId: ID): Promise<Session> {
  const db = await getDB();
  const s: Session = {
    id: createId("sess"),
    deckId,
    sessionStart: Date.now(),
    cardsReviewed: [],
    correctCount: 0,
  };
  await db.put("sessions", s);
  return s;
}

export async function finishSession(session: Session) {
  const db = await getDB();
  session.sessionEnd = Date.now();
  await db.put("sessions", session);
}

// Events (telemetry)
export async function putEvent(e: Omit<Event, "id" | "at"> & { id?: string; at?: number }) {
  const db = await getDB();
  const event: Event = { id: e.id || createId("evt"), at: e.at || Date.now(), type: (e as any).type, data: (e as any).data };
  await db.put("events", event);
}

// Uploads/sources
export async function putSource(s: Omit<UploadSource, "id" | "createdAt">) {
  const db = await getDB();
  const src: UploadSource = { id: createId("src"), createdAt: Date.now(), ...s } as UploadSource;
  await db.put("uploads", src);
  return src;
}

function toClientCard(row: any): Card {
  return {
    id: String(row.id),
    deckId: String(row.deck_id),
    front: row.front,
    back: row.back,
    hint: row.hint ?? undefined,
    difficulty: row.difficulty ?? undefined,
    easeFactor: Number(row.ease_factor ?? 2.5),
    interval: Number(row.interval ?? 0),
    repetitions: Number(row.repetitions ?? 0),
    nextReviewAt: row.next_review_at ? Date.parse(row.next_review_at) : Date.now(),
    reviewCount: Number(row.review_count ?? 0),
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    type: undefined,
    attachments: undefined,
    sourceId: undefined,
  } as Card;
}

