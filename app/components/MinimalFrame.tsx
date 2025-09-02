import { IconEye, IconEyeOff, IconFile, IconGear, IconGraph, IconPlus, IconSpark } from "./Workspace";
import { Link } from "react-router";
import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  left?: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  searchPlaceholder?: string;
}>;

export default function MinimalFrame({ left, ctaHref, ctaLabel = "New", searchPlaceholder = "search your knowledge space", children }: Props) {
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
                <input placeholder={searchPlaceholder} />
                <span className="hint">type to focus</span>
              </div>
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
