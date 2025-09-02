import type { Route } from "./+types/decks";
import { useEffect, useState } from "react";
import { createDeck, listDecks } from "../lib/db";
import type { Deck } from "../types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Decks" },
    { name: "description", content: "Manage decks and card metadata." },
  ];
}

export default function DecksRoute() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    listDecks().then(setDecks);
  }, []);

  async function handleCreate() {
    const t = title.trim();
    if (!t) return;
    const d = await createDeck(t);
    setDecks((prev) => [d, ...prev]);
    setTitle("");
  }

  return (
    <section className="stack">
      <h1>Decks</h1>
      <p className="muted">Create decks, organize tags, and sources.</p>
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ width: "100%" }}>
          <input
            className="card"
            placeholder="New deck title"
            style={{ padding: 10, flex: 1 }}
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <button className="btn primary" onClick={handleCreate}>Create</button>
        </div>
      </div>
      <div className="section">
        <h3>Your Decks</h3>
        <div className="grid cols-3">
          {decks.length === 0 && (
            <div className="card" style={{ padding: 16 }}>
              <strong>No decks yet</strong>
              <p className="muted">Create your first deck above.</p>
            </div>
          )}
          {decks.map((d) => (
            <a key={d.id} className="card" style={{ padding: 16, textDecoration: "none" }} href={`/study?deck=${d.id}`}>
              <strong style={{ display: "block", marginBottom: 6 }}>{d.title}</strong>
              <p className="muted">Updated {new Date(d.updatedAt).toLocaleString()}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
