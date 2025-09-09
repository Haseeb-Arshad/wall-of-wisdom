import { IconPlus, IconSpark } from "./Workspace";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { searchAll, type SearchHit } from "../lib/search";
import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  left?: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  searchPlaceholder?: string;
  onSearchSelect?: (hit: SearchHit) => void;
}>;

export default function MinimalFrame({ left, ctaHref, ctaLabel = "New", searchPlaceholder = "Search your knowledge", onSearchSelect, children }: Props) {
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
    <div>
      <header className="ww-header">
        <div className="ww-container ww-nav" ref={boxRef}>
          <div className="ww-brand">
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ww-cta)", display: "inline-block" }} />
            <Link to="/" style={{ textDecoration: "none" }}>WisdomWall</Link>
          </div>
          <nav className="ww-nav-links" aria-label="Primary">
            <a className="ww-link" href="/#review">Review</a>
            <a className="ww-link" href="/#wall">Wall</a>
            <a className="ww-link" href="/#decks">Decks</a>
            <a className="ww-link" href="/#import">Import</a>
            <a className="ww-link" href="/#progress">Progress</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            <div className="pill-input">
              <IconSpark />
              <input
                placeholder={searchPlaceholder}
                value={q}
                onChange={(e) => { setQ((e.target as HTMLInputElement).value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setOpen(false); return; }
                  if (e.key === "Enter") {
                    const top = results[0];
                    if (top) {
                      if (onSearchSelect) {
                        onSearchSelect(top);
                        setOpen(false);
                        setQ("");
                      }
                    }
                  }
                }}
              />
            </div>
            {ctaHref && (
              <Link className="pill pill-accent" to={ctaHref}><IconPlus /> {ctaLabel}</Link>
            )}
            {open && results.length > 0 && (
              <div className="search-results">
                {results.map((r) => (
                  onSearchSelect ? (
                    <button
                      key={(r.type === "deck" ? `d-${r.id}` : `c-${r.id}`)}
                      className="search-result"
                      onClick={() => { onSearchSelect(r); setOpen(false); setQ(""); }}
                    >
                      {r.type === "deck" ? (
                        <>
                          <strong>Deck</strong> {(r as any).title}
                        </>
                      ) : (
                        <>
                          <strong>Card</strong> {(r as any).front}
                        </>
                      )}
                    </button>
                  ) : (
                    r.type === "deck" ? (
                      <Link key={`d-${r.id}`} to={`/study?deck=${r.id}`} onClick={() => setOpen(false)}>
                        <strong>Deck</strong> {r.title}
                      </Link>
                    ) : (
                      <Link key={`c-${r.id}`} to={`/study?deck=${r.deckId}`} onClick={() => setOpen(false)}>
                        <strong>Card</strong> {r.front}
                      </Link>
                    )
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="ww-container" style={{ paddingTop: 18, paddingBottom: 28 }}>
        {children}
      </div>
    </div>
  );
}
