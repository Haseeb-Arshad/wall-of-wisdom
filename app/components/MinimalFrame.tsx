import { IconEye, IconEyeOff, IconFile, IconGear, IconGraph, IconPlus, IconSpark } from "./Workspace";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { searchAll, type SearchHit } from "../lib/search";
import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  left?: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  searchPlaceholder?: string;
}>;

export default function MinimalFrame({ left, ctaHref, ctaLabel = "New", searchPlaceholder = "search your knowledge space", children }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      const hits = await searchAll(q);
      setResults(hits);
    }, 120);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  return (
    <div className="ws-wrap">
      <div className="ws-surface">
        <aside className="ws-rail">
          <Link className="rail-btn" to="/" title="Home"><IconFile /></Link>
          <Link className="rail-btn" to="/wall" title="Wall"><IconGraph /></Link>
          <Link className="rail-btn" to="/import" title="Import"><IconSpark /></Link>
          <Link className="rail-btn" to="/decks" title="Decks"><IconFile /></Link>
          <Link className="rail-btn" to="/study" title="Study"><IconEye /></Link>
          <Link className="rail-btn" to="/progress" title="Progress"><IconEyeOff /></Link>
          <div className="rail-spacer" />
        </aside>
        <section className="ws-main">
          <div className="ws-topbar">
            <div className="ws-left">
              <span className="pill"><IconFile /> files view</span>
              <span className="pill" title="actions"><IconSpark /></span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", position: "relative" }} ref={boxRef}>
              <div className="pill-input">
                <IconSpark />
                <input
                  placeholder={searchPlaceholder}
                  value={q}
                  onChange={(e) => { setQ((e.target as HTMLInputElement).value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                />
                <span className="hint">type to focus</span>
              </div>
              {open && results.length > 0 && (
                <div className="search-results">
                  {results.map((r) => (
                    r.type === "deck" ? (
                      <Link key={`d-${r.id}`} to={`/study?deck=${r.id}`} onClick={() => setOpen(false)}>
                        <strong>Deck</strong> {r.title}
                      </Link>
                    ) : (
                      <Link key={`c-${r.id}`} to={`/study?deck=${r.deckId}`} onClick={() => setOpen(false)}>
                        <strong>Card</strong> {r.front}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
            <div className="ws-right">
              {ctaHref && (
                <Link className="pill pill-accent" to={ctaHref}><IconPlus /> {ctaLabel}</Link>
              )}
            </div>
          </div>
          <div className="ws-body">
            <div className="ws-lpane">
              {left ?? (
                <div className="note-card">
                  <h4>Untitled Note</h4>
                  <p>No content</p>
                </div>
              )}
            </div>
            <div className="ws-canvas">
              <div style={{ padding: 16 }}>{children}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
