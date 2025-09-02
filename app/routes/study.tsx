import type { Route } from "./+types/study";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCardsByDeck, getDueCards, startSession, finishSession, updateCard, listDecks, putEvent } from "../lib/db";
import { review } from "../lib/srs";
import type { Card, Deck, Difficulty } from "../types";
import MinimalFrame from "../components/MinimalFrame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Study Session" },
    { name: "description", content: "Review with SM-2 scheduling." },
  ];
}

export default function StudyRoute() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const deckParam = params.get("deck") || undefined;
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckId, setDeckId] = useState<string | undefined>(deckParam);
  const [queue, setQueue] = useState<Card[]>([]);
  const [current, setCurrent] = useState<Card | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(0);
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
    if (due.length === 0) {
      // If nothing is due, show all as a warmup
      const all = await getCardsByDeck(did);
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
    timerRef.current = window.setInterval(() => setTimer(Date.now() - start), 250);
  }
  function stopTimer() {
    setRunning(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function startFiveMinutes() {
    if (!deckId) return;
    await loadQueue(deckId);
    const sess = await startSession(deckId);
    setSessionId(sess.id);
    setRevealed(false);
    setTimer(0);
    startTimer();
    // Auto stop after 5 minutes
    window.setTimeout(async () => {
      stopTimer();
      if (sessionId) {
        await finishSession({ id: sessionId, deckId, sessionStart: Date.now() - timer, sessionEnd: Date.now(), cardsReviewed: [], correctCount: 0 });
      }
    }, 5 * 60 * 1000);
  }

  async function rate(r: Difficulty) {
    if (!current) return;
    const updated = review(current, r);
    await updateCard(updated);
    await putEvent({ type: "rating", data: { rating: r, cardId: current.id } });
    // Move to end if still due soon; otherwise remove from queue
    setQueue((prev) => prev.filter((c) => c.id !== current.id));
    setCurrent((prev) => {
      const next = queue.find((c) => c.id !== prev?.id) || null;
      return next;
    });
    setRevealed(false);
  }

  const timeLabel = useMemo(() => {
    const s = Math.floor(timer / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  }, [timer]);

  return (
    <MinimalFrame ctaHref="/progress" ctaLabel="Progress">
      <section className="stack">
        <h2>Study Session</h2>
        <p className="muted">Queue, timer, quick flip, and ratings.</p>
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
            <div className="row">
              <label className="muted">Deck:</label>
              <select className="card" style={{ padding: 8 }} value={deckId} onChange={(e) => setDeckId((e.target as HTMLSelectElement).value)}>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div className="row">
              <span className="muted">Time</span>
              <span>{timeLabel}</span>
              {!running ? (
                <button className="btn primary" onClick={startFiveMinutes} disabled={!deckId}>Start 5 min</button>
              ) : (
                <button className="btn" onClick={stopTimer}>Pause</button>
              )}
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <h3>Front</h3>
            <p>{current ? current.front : "No card"}</p>
            <div className="spacer" />
            <button className="btn" onClick={() => setRevealed((v) => !v)} disabled={!current}>{revealed ? "Hide" : "Reveal"}</button>
          </div>
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <h3>Back</h3>
            <p className="muted">{revealed && current ? current.back : "Answer is hidden until reveal."}</p>
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => rate("again")} disabled={!current}>Again</button>
              <button className="btn" onClick={() => rate("hard")} disabled={!current}>Hard</button>
              <button className="btn" onClick={() => rate("good")} disabled={!current}>Good</button>
              <button className="btn primary" onClick={() => rate("easy")} disabled={!current}>Easy</button>
            </div>
          </div>
        </div>
      </section>
    </MinimalFrame>
  );
}
