import type { Route } from "./+types/home";
import MinimalFrame from "../components/MinimalFrame";
import { StickyWall } from "../components/StickyWall";
import { useEffect, useMemo, useRef, useState } from "react";
import { addCards, createDeck, finishSession, getCardsByDeck, getDB, getDueCards, listDecks, startSession, updateCard } from "../lib/db";
import type { Card, Deck, Difficulty } from "../types";
import { review } from "../lib/srs";
import { AnimatePresence, motion } from "framer-motion";
import type { SearchHit } from "../lib/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WisdomWall" },
    { name: "description", content: "A calm, minimal knowledge workspace" },
  ];
}

export default function Home() {
  const [deckId, setDeckId] = useState<string | undefined>(undefined);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);

  function scrollTo(id: string) {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSearchSelect(hit: SearchHit) {
    if (hit.type === "deck") {
      setDeckId(String(hit.id));
      setSelectedCardId(undefined);
    } else {
      setDeckId(String(hit.deckId));
      setSelectedCardId(String(hit.id));
    }
    // Give the state a tick to propagate, then scroll
    setTimeout(() => scrollTo("review"), 0);
  }

  // Accept /?deck=... to land on Review with the selected deck
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const d = params.get("deck");
    if (d) {
      setDeckId(d);
      setSelectedCardId(undefined);
      setTimeout(() => scrollTo("review"), 0);
    }
  }, []);

  return (
    <MinimalFrame ctaHref="#import" ctaLabel="Import" onSearchSelect={onSearchSelect}>
      <Overview />
      <ReviewSection deckId={deckId} setDeckId={setDeckId} selectedCardId={selectedCardId} />
      <WallSection />
      <DecksSection setDeckId={(id: string) => { setDeckId(id); setTimeout(() => { const el = document.getElementById('review'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0); }} />
      <ImportSection />
      <ProgressSection />
    </MinimalFrame>
  );
}

function Overview() {
  return (
    <section className="stack" style={{ marginBottom: 18 }}>
      <h2>Overview</h2>
      <p className="muted">All-in-one view. Review, arrange, import, and track — in one place.</p>
    </section>
  );
}

function ReviewSection({ deckId, setDeckId, selectedCardId }: { deckId?: string; setDeckId: (id?: string) => void; selectedCardId?: string }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Card | null>(null);
  const [allInDeck, setAllInDeck] = useState<Card[]>([]);
  const [timerMs, setTimerMs] = useState(3 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    listDecks().then((ds) => {
      setDecks(ds);
      if (!deckId && ds[0]) setDeckId(ds[0].id);
    });
  }, []);

  async function loadQueue(did: string) {
    const due = await getDueCards(did);
    const all = await getCardsByDeck(did);
    setAllInDeck(all);
    if (due.length === 0) {
      setQueue(all.slice(0, 20));
      setCurrent(all[0] || null);
    } else {
      setQueue(due);
      setCurrent(due[0] || null);
    }
  }

  function startTimer() {
    setRunning(true);
    const start = Date.now();
    const initial = timerMs;
    timerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, initial - (Date.now() - start));
      setTimerMs(remaining);
      if (remaining <= 0) stopTimer();
    }, 150);
  }
  function stopTimer() {
    setRunning(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }
  async function startThreeMinutes() {
    if (!deckId) return;
    await loadQueue(deckId);
    const sess = await startSession(deckId);
    setSessionId(sess.id);
    setTimerMs(3 * 60 * 1000);
    startTimer();
    window.setTimeout(async () => {
      stopTimer();
      if (sessionId) {
        await finishSession({ id: sessionId, deckId, sessionStart: Date.now() - (3 * 60 * 1000 - timerMs), sessionEnd: Date.now(), cardsReviewed: [], correctCount: 0 });
      }
    }, 3 * 60 * 1000);
  }

  // If a specific card was selected from search, reflect it as current
  useEffect(() => {
    (async () => {
      if (deckId && selectedCardId) {
        const all = await getCardsByDeck(deckId);
        setAllInDeck(all);
        const card = all.find((c) => c.id === selectedCardId) || null;
        setCurrent(card);
        setQueue(card ? [card] : []);
      }
    })();
  }, [deckId, selectedCardId]);

  async function rate(r: Difficulty) {
    if (!current) return;
    const updated = review(current, r);
    await updateCard(updated);
    setQueue((prev) => prev.filter((c) => c.id !== current.id));
    setCurrent((prev) => {
      const next = queue.find((c) => c.id !== prev?.id) || null;
      return next;
    });
  }

  const options = useMemo(() => {
    if (!current) return [] as { text: string; correct: boolean }[];
    const pool = allInDeck.filter((c) => c.id !== current.id);
    const distractors = shuffle(pool).slice(0, 3).map((c) => c.back);
    const raw = [
      { text: current.back, correct: true },
      ...distractors.map((t) => ({ text: t, correct: false })),
    ];
    return shuffle(raw);
  }, [current, allInDeck]);

  const palette = ["#FFF6D8", "#EAF2FF", "#E6FAF0", "#FFF0F8", "#F9F0FF", "#F0FFF7"] as const;
  const optionColors = useMemo(() => shuffle(palette.slice(0, 4)), [current?.id]);

  function onPick(correct: boolean) {
    rate(correct ? "good" : "again");
  }

  const minutes = Math.floor((timerMs / 1000) / 60);
  const seconds = Math.floor((timerMs / 1000) % 60);

  return (
    <section id="review" className="stack" style={{ marginBottom: 18 }}>
      <h2>Quick Review</h2>
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="row">
            <label className="muted">Deck</label>
            <select className="card" style={{ padding: 8 }} value={deckId} onChange={(e) => setDeckId((e.target as HTMLSelectElement).value)}>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
          <div className="row">
            <span className="muted">Time</span>
            <AnimatedTimer m={minutes} s={seconds} key={`t-${minutes}-${seconds}`} />
            {!running ? (
              <button className="btn primary" onClick={startThreeMinutes} disabled={!deckId}>Start 3 min</button>
            ) : (
              <button className="btn" onClick={stopTimer}>Pause</button>
            )}
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3>Question</h3>
        <p style={{ marginTop: 6, fontSize: 16 }}>{current ? current.front : "Pick a deck and start"}</p>
        <div className="spacer" />
        <div className="grid cols-3" style={{ gap: 12 }}>
          {options.map((opt, i) => (
            <motion.button
              key={i}
              className="btn hover-lift"
              style={{
                textAlign: "left",
                padding: 12,
                borderRadius: 14,
                background: optionColors[i % optionColors.length],
                border: "1px solid rgba(0,0,0,0.06)",
                minHeight: 56,
                whiteSpace: "normal",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(opt.correct)}
              disabled={!current || !running}
            >
              {opt.text}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function WallSection() {
  return (
    <section id="wall" className="stack" style={{ marginBottom: 18 }}>
      <h2>Wall</h2>
      <p className="muted">Arrange sticky notes freely. Reset layout anytime.</p>
      <StickyWall height="48vh" />
    </section>
  );
}

function DecksSection({ setDeckId }: { setDeckId: (id: string) => void }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [title, setTitle] = useState("");
  useEffect(() => { listDecks().then(setDecks); }, []);

  async function handleCreate() {
    const t = title.trim();
    if (!t) return;
    const d = await createDeck(t);
    setDecks((prev) => [d, ...prev]);
    setTitle("");
  }
  return (
    <section id="decks" className="stack" style={{ marginBottom: 18 }}>
      <h2>Decks</h2>
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ width: "100%" }}>
          <input
            className="card"
            placeholder="New deck title"
            style={{ padding: 10, flex: 1 }}
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
          />
          <button className="btn primary" onClick={handleCreate}>Create</button>
        </div>
      </div>
      <div className="grid cols-3">
        {decks.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <strong>No decks yet</strong>
            <p className="muted">Create your first deck above.</p>
          </div>
        )}
        {decks.map((d) => (
          <button key={d.id} className="card hover-lift" style={{ padding: 16, textAlign: 'left', cursor: 'pointer' }} onClick={() => setDeckId(d.id)}>
            <strong style={{ display: "block", marginBottom: 6 }}>{d.title}</strong>
            <p className="muted">Updated {new Date(d.updatedAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ImportSection() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Imported Deck");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const backend = (import.meta as any)?.env?.VITE_BACKEND_URL || "http://localhost:8787";

  async function createDeckWithCards(cards: any[], deckTitle: string) {
    const deck = await createDeck(deckTitle || title || "Imported Deck");
    const normalized = (cards || []).map((c: any) => ({
      front: String(c.front || ""),
      back: String(c.back || ""),
      hint: c.hint ? String(c.hint) : undefined,
      difficulty: (String(c.difficulty || "good").toLowerCase() as Difficulty),
    }));
    await addCards(deck.id, normalized as any);
    return { deck, count: normalized.length };
  }
  async function ingestTextAndGenerate(t: string, deckTitle: string) {
    const ingestRes = await fetch(`${backend}/api/ingest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: t, title: deckTitle }),
    });
    const ingestData = await ingestRes.json();
    if (!ingestRes.ok) throw new Error(ingestData?.error || "Ingest failed");
    const mcqRes = await fetch(`${backend}/api/mcqs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceId: ingestData.sourceId, n: 10 }),
    });
    const mcqData = await mcqRes.json();
    if (!mcqRes.ok) throw new Error(mcqData?.error || "MCQ generation failed");
    return mcqData.cards || [];
  }
  async function handleUrl() {
    setBusy(true); setMsg(null);
    try {
      const ingestRes = await fetch(`${backend}/api/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, title: title || "Imported Deck" }),
      });
      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) throw new Error(ingestData?.error || "Ingest failed");
      const mcqRes = await fetch(`${backend}/api/mcqs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceId: ingestData.sourceId, n: 10 }),
      });
      const mcqData = await mcqRes.json();
      if (!mcqRes.ok) throw new Error(mcqData?.error || "MCQ generation failed");
      const { deck, count } = await createDeckWithCards(mcqData.cards, title);
      setMsg(`Created deck "${deck.title}" with ${count} cards.`);
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally { setBusy(false); }
  }
  async function handleText() {
    setBusy(true); setMsg(null);
    try {
      const cards = await ingestTextAndGenerate(text, title || "Imported Deck");
      const { deck, count } = await createDeckWithCards(cards, title);
      setMsg(`Created deck "${deck.title}" with ${count} cards.`);
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally { setBusy(false); }
  }
  async function handleFile() {
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const f = new FormData();
      f.set("file", file);
      f.set("title", title || "Imported Deck");
      const upRes = await fetch(`${backend}/api/upload`, { method: "POST", body: f });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData?.error || "Upload failed");
      const mcqRes = await fetch(`${backend}/api/mcqs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceId: upData.sourceId, n: 10 }),
      });
      const mcqData = await mcqRes.json();
      if (!mcqRes.ok) throw new Error(mcqData?.error || "MCQ generation failed");
      const { deck, count } = await createDeckWithCards(mcqData.cards, title);
      setMsg(`Created deck "${deck.title}" with ${count} cards.`);
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally { setBusy(false); }
  }

  return (
    <section id="import" className="stack" style={{ marginBottom: 18 }}>
      <h2>Import & Generate</h2>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="row" style={{ gap: 12 }}>
          <label className="muted">Deck title</label>
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
            style={{ width: "100%", padding: 10 }}
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
          />
          <div className="spacer" />
          <button className="btn primary" onClick={handleUrl} disabled={busy || !url}>Fetch & Generate</button>
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
            <button className="btn primary" onClick={handleText} disabled={busy || text.trim().length < 40}>Generate Cards</button>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Upload PDF/DOCX</h3>
          <input
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] || null)}
          />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>We’ll extract, embed, and generate MCQs.</p>
          <div className="spacer" />
          <button className="btn primary" onClick={handleFile} disabled={busy || !file}>Extract & Generate</button>
        </div>
      </div>
    </section>
  );
}

function ProgressSection() {
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  const [cardsPerDay, setCardsPerDay] = useState<number>(0);
  const [recall, setRecall] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const db = await getDB();
      const sessions = await db.getAll("sessions");
      const events = await db.getAll("events");
      const last = (sessions || []).slice().sort((a: any, b: any) => (b.sessionEnd || 0) - (a.sessionEnd || 0))[0];
      if (last && last.sessionEnd && last.sessionStart) {
        setSessionMinutes(Math.round((last.sessionEnd - last.sessionStart) / 60000));
      }
      const now = Date.now();
      const dayBuckets = new Map<string, number>();
      for (const s of sessions || []) {
        const t = s.sessionEnd || s.sessionStart || now;
        const d = new Date(t).toDateString();
        const inc = (s.cardsReviewed?.length || 0);
        dayBuckets.set(d, (dayBuckets.get(d) || 0) + inc);
      }
      const days = Array.from(dayBuckets.values());
      const avg = days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
      setCardsPerDay(avg);
      const ratings = (events || []).filter((e: any) => e.type === "rating");
      const good = ratings.filter((e: any) => ["good", "easy"].includes(String(e.data?.rating))).length;
      const pct = ratings.length ? Math.round((good / ratings.length) * 100) : 0;
      setRecall(pct);
    })();
  }, []);

  return (
    <section id="progress" className="stack" style={{ marginBottom: 18 }}>
      <h2>Progress</h2>
      <div className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>Last Session</h3>
          <p className="muted">{sessionMinutes} min</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Cards / Day</h3>
          <p className="muted">{cardsPerDay}</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Recall</h3>
          <p className="muted">{recall}%</p>
        </div>
      </div>
    </section>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function AnimatedTimer({ m, s }: { m: number; s: number }) {
  const text = `${m}:${String(s).padStart(2, "0")}`;
  return (
    <div style={{ display: "inline-flex", gap: 2, fontVariantNumeric: "tabular-nums", fontWeight: 600 }} aria-label="countdown">
      {text.split("").map((ch, idx) => (
        <Digit key={`${idx}-${ch}`} value={ch} index={idx} />
      ))}
    </div>
  );
}
function Digit({ value, index }: { value: string; index: number }) {
  return (
    <div style={{ position: "relative", width: value === ":" ? 6 : 14, height: 20, overflow: "hidden" }}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -12, opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.24 + index * 0.02, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: "absolute", left: 0, right: 0, textAlign: "center" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
