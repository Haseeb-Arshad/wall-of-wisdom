export function Welcome() {
  return (
    <main>
      <section className="stack" style={{ alignItems: "flex-start" }}>
        <h1>Welcome to WisdomWall</h1>
        <p className="muted">Import a doc → auto-generate cards → run a 5-minute session.</p>
        <div className="row">
          <a className="btn primary" href="/import">Import a Document</a>
          <a className="btn" href="/wall">Open Sticky Wall</a>
        </div>
      </section>
      <div className="spacer" />
      <section className="grid cols-3">
        <div className="card" style={{ padding: 16 }}>
          <h3>1. Import</h3>
          <p>Paste a URL or text. We extract key points.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>2. Generate</h3>
          <p>AI creates 5–10 Q/A flashcards with hints.</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h3>3. Study</h3>
          <p>Run a 5 min session and track your recall.</p>
        </div>
      </section>
    </main>
  );
}
