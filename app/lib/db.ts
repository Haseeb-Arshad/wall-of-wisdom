import { openDB, type IDBPDatabase } from "idb";
import type { Card, Deck, Event, Session, UploadSource, ID } from "../types";

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

export async function listDecks(): Promise<Deck[]> {
  const db = await getDB();
  const tx = db.transaction("decks");
  return await tx.store.getAll();
}

// Cards
export async function addCards(deckId: ID, cards: Omit<Card, "id" | "deckId" | "createdAt" | "updatedAt">[]) {
  const db = await getDB();
  const tx = db.transaction(["cards"], "readwrite");
  const now = Date.now();
  for (const c of cards) {
    const card: Card = {
      id: createId("card"),
      deckId,
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: now,
      ...c,
    } as Card;
    await tx.store.put(card);
  }
  await tx.done;
}

export async function getCardsByDeck(deckId: ID): Promise<Card[]> {
  const db = await getDB();
  const idx = (await db).transaction("cards").store.index("by_deckId");
  const all = await idx.getAll(deckId as any);
  return (all as Card[]) ?? [];
}

export async function getDueCards(deckId: ID, now = Date.now()): Promise<Card[]> {
  const cards = await getCardsByDeck(deckId);
  return cards.filter((c) => c.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

export async function updateCard(card: Card) {
  const db = await getDB();
  card.updatedAt = Date.now();
  await db.put("cards", card);
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

