import type { Route } from "./+types/progress";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Progress" },
    { name: "description", content: "Quick analytics and recall score." },
  ];
}

export default function ProgressRoute() {
  return (
    <section className="stack">
      <h1>Progress</h1>
      <div className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>Session Length</h3>
          <p className="muted">—</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Cards / Day</h3>
          <p className="muted">—</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Recall Score</h3>
          <p className="muted">—</p>
        </div>
      </div>
    </section>
  );
}

