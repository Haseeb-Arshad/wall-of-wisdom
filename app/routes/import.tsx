import type { Route } from "./+types/import";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Import & Generate" },
    { name: "description", content: "Import docs or paste text to generate cards." },
  ];
}

export default function ImportRoute() {
  return (
    <section className="stack">
      <h1>Import & AI Card Generation</h1>
      <p className="muted">Upload PDF, paste a URL, or paste text.</p>
      <div className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>Paste URL</h3>
          <input className="card" style={{ width: "100%", padding: 10 }} placeholder="https://example.com/article" />
          <div className="spacer" />
          <button className="btn primary">Fetch & Generate</button>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Paste Text</h3>
          <textarea className="card" style={{ width: "100%", height: 140, padding: 10 }} placeholder="Paste notes or text here" />
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn">Clear</button>
            <button className="btn primary">Generate Cards</button>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Upload PDF</h3>
          <input type="file" accept="application/pdf" />
          <div className="spacer" />
          <button className="btn primary">Extract & Generate</button>
        </div>
      </div>
    </section>
  );
}

