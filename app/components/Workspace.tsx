export function IconGear() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.07a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.02 3.3l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.07a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 21.3 7.02l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.64.17 1.19.53 1.51 1.08.16.28.24.6.24.92s-.08.64-.24.92A2.14 2.14 0 0 1 19.4 15Z"/>
    </svg>
  );
}

export function IconGraph() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18"/>
      <path d="M7 15l3-3 3 3 4-4"/>
      <circle cx="17" cy="11" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconEye() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function IconEyeOff() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l18 18"/>
      <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24"/>
      <path d="M16.1 16.1C14.94 16.68 13.52 17 12 17 5 17 1 12 1 12a20.29 20.29 0 0 1 6.16-5.19"/>
      <path d="M9.9 7.9A7.2 7.2 0 0 1 12 7c7 0 11 5 11 5a20.82 20.82 0 0 1-3.2 3.2"/>
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18"/>
      <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}

export function IconFile() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  );
}

export function IconSpark() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"/>
    </svg>
  );
}

export default function Workspace() {
  return (
    <div className="ws-wrap">
      <div className="ws-surface">
        <aside className="ws-rail">
          <button className="rail-btn" title="Settings"><IconGear /></button>
          <button className="rail-btn" title="Graph"><IconGraph /></button>
          <button className="rail-btn" title="Show"><IconEye /></button>
          <button className="rail-btn" title="Hide"><IconEyeOff /></button>
          <button className="rail-btn" title="Trash"><IconTrash /></button>
          <div className="rail-spacer" />
          <div style={{ opacity: 0.5 }}>🐱</div>
        </aside>
        <section className="ws-main">
          <div className="ws-topbar">
            <div className="ws-left">
              <span className="pill"><IconFile /> files view</span>
              <span className="pill" title="actions"><IconSpark /></span>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="pill-input">
                <IconSpark />
                <input placeholder="search your knowledge space" />
                <span className="hint">type to focus</span>
              </div>
            </div>
            <div className="ws-right">
              <a className="pill pill-dark" href="/decks"><IconPlus /> Note</a>
            </div>
          </div>
          <div className="ws-body">
            <div className="ws-lpane">
              <div className="note-card">
                <h4>Untitled Note</h4>
                <p>No content</p>
              </div>
            </div>
            <div className="ws-canvas" />
          </div>
        </section>
      </div>
    </div>
  );
}

