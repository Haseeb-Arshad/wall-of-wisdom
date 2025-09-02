import type { Route } from "./+types/study";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Study Session" },
    { name: "description", content: "Review with SM-2 scheduling." },
  ];
}

export default function StudyRoute() {
  return (
    <section className="stack">
      <h1>Study Session</h1>
      <p className="muted">Queue, timer, quick flip, and ratings.</p>
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <label className="muted">Deck:</label>
            <select className="card" style={{ padding: 8 }}>
              <option>Sample Deck</option>
            </select>
          </div>
          <button className="btn primary">Start 5 min</button>
        </div>
      </div>
      <div className="row" style={{ gap: 16 }}>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <h3>Front</h3>
          <p>Example question will appear here.</p>
          <div className="spacer" />
          <button className="btn">Reveal</button>
        </div>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <h3>Back</h3>
          <p className="muted">Answer is hidden until reveal.</p>
          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button className="btn">Again</button>
            <button className="btn">Hard</button>
            <button className="btn">Good</button>
            <button className="btn primary">Easy</button>
          </div>
        </div>
      </div>
    </section>
  );
}

