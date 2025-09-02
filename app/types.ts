export type ID = string;

export type Difficulty = "again" | "hard" | "good" | "easy";

export interface User {
  id: ID;
  email?: string;
  name?: string;
  prefs?: Record<string, unknown>;
}

export interface Deck {
  id: ID;
  ownerId?: ID;
  title: string;
  tags?: string[];
  visibility?: "private" | "shared" | "public";
  createdAt: number;
  updatedAt: number;
  sourceIds?: ID[];
}

export type CardType = "text" | "audio" | "image" | "code";

export interface Card {
  id: ID;
  deckId: ID;
  front: string;
  back: string;
  hint?: string;
  attachments?: string[];
  type?: CardType;
  sourceId?: ID;
  difficulty?: Difficulty; // last rating
  // SM-2 fields
  easeFactor: number; // EF >= 1.3, start 2.5
  interval: number; // days
  repetitions: number;
  nextReviewAt: number; // epoch ms
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface UploadSource {
  id: ID;
  userId?: ID;
  originalText?: string;
  parsedMetadata?: Record<string, unknown>;
  url?: string;
  embeddingsId?: ID;
  createdAt: number;
}

export interface Session {
  id: ID;
  userId?: ID;
  deckId: ID;
  sessionStart: number;
  sessionEnd?: number;
  cardsReviewed: ID[];
  correctCount: number;
  durationsMs?: number[];
}

export interface Event {
  id: ID;
  at: number;
  type: string;
  data?: unknown;
}

