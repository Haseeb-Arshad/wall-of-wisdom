import { IconEye, IconEyeOff, IconFile, IconGear, IconGraph, IconPlus, IconSpark } from "./Workspace";
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
          <a className="rail-btn" href="/" title="Home"><IconFile /></a>
          <a className="rail-btn" href="/wall" title="Wall"><IconGraph /></a>
          <a className="rail-btn" href="/import" title="Import"><IconSpark /></a>
          <a className="rail-btn" href="/decks" title="Decks"><IconFile /></a>
          <a className="rail-btn" href="/study" title="Study"><IconEye /></a>
          <a className="rail-btn" href="/progress" title="Progress"><IconEyeOff /></a>
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
                <a className="pill pill-dark" href={ctaHref}><IconPlus /> {ctaLabel}</a>
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

