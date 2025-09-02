import type { Route } from "./+types/import";
import { useState } from "react";
import { addCards, createDeck } from "../lib/db";
import type { Difficulty } from "../types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Import & Generate" },
    { name: "description", content: "Import docs or paste text to generate cards." },
  ];
}

export default function ImportRoute() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Imported Deck");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function callGenerate(payload: FormData) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", body: payload });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate");
      const deck = await createDeck(String(data.title || title));
      const cards = (data.cards || []).map((c: any) => ({
        front: c.front,
        back: c.back,
        hint: c.hint,
        difficulty: (String(c.difficulty || "good").toLowerCase() as Difficulty),
      }));
      await addCards(deck.id, cards as any);
      setMsg(`Created deck "${deck.title}" with ${cards.length} cards.`);
    } catch (e: any) {
      setMsg(e.message || "Generation error");
    } finally {
      setBusy(false);
    }
  }

  async function handleUrl() {
    const f = new FormData();
    f.set("sourceType", "url");
    f.set("url", url);
    f.set("title", title || "Imported Deck");
    await callGenerate(f);
  }
  async function handleText() {
    const f = new FormData();
    f.set("sourceType", "text");
    f.set("text", text);
    f.set("title", title || "Imported Deck");
    await callGenerate(f);
  }

  return (
    <section className="stack">
      <h1>Import & AI Card Generation</h1>
      <p className="muted">Upload PDF, paste a URL, or paste text.</p>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="row" style={{ gap: 12 }}>
          <label className="muted">Deck title:</label>
          <input className="card" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} style={{ padding: 8, minWidth: 220 }} />
          {busy && <span className="muted">Generating…</span>}
          {msg && <span>{msg}</span>}
        </div>
      </div>
      <div className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>Paste URL</h3>
          <input
            className="card"
            style={{ width: "100%,", padding: 10 }}
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
          />
          <div className="spacer" />
          <button className="btn primary" onClick={handleUrl} disabled={busy || !url}>
            Fetch & Generate
          </button>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Paste Text</h3>
          <textarea
            className="card"
            style={{ width: "100%", height: 140, padding: 10 }}
            placeholder="Paste notes or text here"
            value={text}
            onChange={(e) => setText((e.target as HTMLTextAreaElement).value)}
          />
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn" onClick={() => setText("")}>Clear</button>
            <button className="btn primary" onClick={handleText} disabled={busy || text.trim().length < 40}>
              Generate Cards
            </button>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Upload PDF</h3>
          <input type="file" accept="application/pdf" disabled />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>PDF OCR coming soon.</p>
          <div className="spacer" />
          <button className="btn" disabled>Extract & Generate</button>
        </div>
      </div>
    </section>
  );
}
