import type { Route } from "./+types/decks";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Decks" },
    { name: "description", content: "Manage decks and card metadata." },
  ];
}

export default function DecksRoute() {
  return (
    <section className="stack">
      <h1>Decks</h1>
      <p className="muted">Create decks, organize tags, and sources.</p>
      <div className="card" style={{ padding: 16 }}>
        <div className="row">
          <input className="card" placeholder="New deck title" style={{ padding: 10, flex: 1 }} />
          <button className="btn primary">Create</button>
        </div>
      </div>
      <div className="section">
        <h3>Your Decks</h3>
        <div className="grid cols-3">
          {/* List decks here (from IndexedDB in next steps) */}
          <div className="card" style={{ padding: 16 }}>
            <strong>Sample Deck</strong>
            <p className="muted">0 cards</p>
          </div>
        </div>
      </div>
    </section>
  );
}

