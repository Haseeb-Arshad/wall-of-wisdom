import type { Route } from "./+types/progress";
import { useEffect, useState } from "react";
import { getDB } from "../lib/db";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Progress" },
    { name: "description", content: "Quick analytics and recall score." },
  ];
}

export default function ProgressRoute() {
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  const [cardsPerDay, setCardsPerDay] = useState<number>(0);
  const [recall, setRecall] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const db = await getDB();
      const sessions = await db.getAll("sessions");
      const events = await db.getAll("events");

      // Session minutes (last session)
      const last = (sessions || []).slice().sort((a: any, b: any) => (b.sessionEnd || 0) - (a.sessionEnd || 0))[0];
      if (last && last.sessionEnd && last.sessionStart) {
        setSessionMinutes(Math.round((last.sessionEnd - last.sessionStart) / 60000));
      }

      // Cards/day over last 7 days (approx using events or sessions' cardsReviewed length)
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

      // Recall score (% of good/easy among ratings in events)
      const ratings = (events || []).filter((e: any) => e.type === "rating");
      const good = ratings.filter((e: any) => ["good", "easy"].includes(String(e.data?.rating))).length;
      const pct = ratings.length ? Math.round((good / ratings.length) * 100) : 0;
      setRecall(pct);
    })();
  }, []);

  return (
    <section className="stack">
      <h1>Progress</h1>
      <div className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>Last Session Length</h3>
          <p className="muted">{sessionMinutes} min</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Cards / Day</h3>
          <p className="muted">{cardsPerDay}</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Recall Score</h3>
          <p className="muted">{recall}%</p>
        </div>
      </div>
    </section>
  );
}
