import type { Route } from "./+types/home";
import MinimalFrame from "../components/MinimalFrame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workspace" },
    { name: "description", content: "Minimal knowledge space workspace" },
  ];
}

export default function Home() {
  return (
    <MinimalFrame ctaHref="/import" ctaLabel="Import">
      <section className="stack">
        <h2>Welcome</h2>
        <p className="muted">Start by importing a document or open the wall.</p>
        <div className="row">
          <a className="btn primary" href="/import">Import</a>
          <a className="btn" href="/wall">Open Wall</a>
        </div>
      </section>
    </MinimalFrame>
  );
}
